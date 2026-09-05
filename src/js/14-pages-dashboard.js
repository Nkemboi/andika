/* Andika — protected dashboard: shell + all six sections */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils, I = App.icons;
  const esc = U.esc;

  const SECTIONS = [
    { key:'overview',  label:'Overview',  icon:'grid' },
    { key:'content',   label:'Content',   icon:'file' },
    { key:'analytics', label:'Analytics', icon:'chart' },
    { key:'billing',   label:'Billing',   icon:'card' },
    { key:'account',   label:'Account',   icon:'user' },
    { key:'settings',  label:'Settings',  icon:'settings' }
  ];

  // content-table UI state (persists across tab switches)
  const tableState = { search:'', sortKey:'createdAt', sortDir:'desc', page:1, perPage:6, filterStatus:'all', filterPlatform:'all' };

  App.registerPage({
    key:'dashboard', exact:false, pattern:/^\/dashboard(\/[a-z]+)?\/?$/, auth:true,
    title:'Dashboard',
    description:'Your Andika dashboard — content, analytics, billing and account.',
    render({ path }){
      const user = App.store.currentUser();
      const m = path.match(/^\/dashboard\/([a-z]+)\/?$/);
      const section = m ? m[1] : 'overview';
      const def = SECTIONS.find(s=>s.key===section) || SECTIONS[0];

      const app = U.qs('#app');
      app.innerHTML = `
      <div class="dash">
        <aside class="sidebar" id="sidebar" aria-label="Dashboard navigation">
          <a class="brand" href="#/dashboard/overview" style="padding:20px 22px">${App.logo(30)}<span style="color:#fff">Andika</span></a>
          <nav class="side-nav">
            ${SECTIONS.map(s=>`
              <a href="#/dashboard/${s.key}" class="${s.key===def.key?'active':''}" aria-current="${s.key===def.key?'page':'false'}">
                ${I[s.icon]} <span>${s.label}</span></a>`).join('')}
            <a href="#/" style="margin-top:6px;color:#8aa0b8">${I.arrowLeft} <span>Back to site</span></a>
          </nav>
          <div class="side-foot">
            <span class="plan-pill ${user.plan==='pro'?'pro':''}">
              ${user.plan==='pro'? I.bolt : I.sparkles} ${user.plan==='pro'?'Pro plan':'Free plan'}</span>
            <button class="btn btn-ghost btn-sm btn-block" id="sideSignout" style="margin-top:10px;background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.15);color:#fff">
              ${I.logout} Sign out</button>
          </div>
        </aside>
        <div class="side-backdrop" id="sideBackdrop" style="display:none"></div>
        <div class="dash-main">
          <header class="topbar">
            <button class="mobile-side-toggle" id="sideToggle" aria-label="Open dashboard menu">${I.menu}</button>
            <h1>${def.label}</h1>
            <span class="sp"></span>
            <span class="small muted" style="display:flex;align-items:center;gap:8px">
              <span class="av" style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;font-family:var(--font-display)">${esc(U.initials(user.name||user.email))}</span>
              <span class="d-none-mobile">${esc(user.name||user.email)}</span>
            </span>
          </header>
          <main class="dash-content" id="dashView"></main>
        </div>
      </div>
      <div class="toast-wrap"></div>`;

      U.qs('#sideSignout').addEventListener('click', App.signOutFlow);
      const side = U.qs('#sidebar'), bd = U.qs('#sideBackdrop');
      U.qs('#sideToggle').addEventListener('click', ()=>{ side.classList.add('open'); bd.style.display='block'; });
      bd.addEventListener('click', ()=>{ side.classList.remove('open'); bd.style.display='none'; });

      const view = U.qs('#dashView');
      const renderers = {
        overview: renderOverview, content: renderContent, analytics: renderAnalytics,
        billing: renderBilling, account: renderAccount, settings: renderSettings
      };
      const render = renderers[def.key] || renderOverview;
      loadSection(view, ()=>render(view, user));
    }
  });

  /* Simulated async load with skeleton + error boundary */
  async function loadSection(view, fn){
    view.innerHTML = `<div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
      ${Array(4).fill('<div class="skeleton" style="height:110px;border-radius:16px"></div>').join('')}
    </div>
    <div class="skeleton" style="height:260px;border-radius:16px;margin-bottom:20px"></div>
    <div class="skeleton" style="height:200px;border-radius:16px"></div>`;
    try{
      await U.wait(380);
      fn();
    }catch(err){
      console.error(err);
      view.innerHTML = App.errorState(err.message);
      view.querySelector('[data-retry]').addEventListener('click', ()=>loadSection(view, fn));
    }
  }

  /* ========================= OVERVIEW ========================= */
  function renderOverview(view, user){
    const records = App.store.listRecords(user.id);
    const published = records.filter(r=>r.status==='published');
    const scheduled = records.filter(r=>r.status==='scheduled');
    const drafts = records.filter(r=>r.status==='draft');
    const totalReach = published.reduce((a,r)=>a+(r.stats?r.stats.reach:0),0);
    const totalEng = published.reduce((a,r)=>a+(r.stats?r.stats.likes+r.stats.comments+r.stats.shares:0),0);

    // 8-week trend: posts created per week
    const weeks = [];
    for(let i=7;i>=0;i--){
      const start = U.weekAgo(i), end = U.weekAgo(i-1);
      const count = records.filter(r=>{ const d=new Date(r.createdAt); return d>=start && d<end; }).length;
      weeks.push({ label: start.toLocaleDateString('en-KE',{day:'numeric',month:'short'}), value:count });
    }
    const lastWeek = weeks[6].value, prevWeek = weeks[7].value;
    const delta = prevWeek ? Math.round((lastWeek-prevWeek)/prevWeek*100) : (lastWeek?100:0);
    const deltaHtml = delta>0 ? `<span class="up">▲ ${delta}% vs last week</span>`
                    : delta<0 ? `<span class="down">▼ ${Math.abs(delta)}% vs last week</span>`
                    : `<span class="flat">— same as last week</span>`;

    view.innerHTML = `
      <div class="page-head">
        <div><h1>Habari, ${esc(user.name.split(' ')[0])} 👋</h1>
        <p>Here is what is happening with your content${records.length?'' : ' — start by creating your first post.'}</p></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn btn-ghost" href="#/dashboard/content">${I.file} My content</a>
          <button class="btn btn-primary" id="newPostBtn">${I.plus} New content</button>
        </div>
      </div>

      <div class="kpi-grid">
        ${kpi('Total posts', records.length, I.file, deltaHtml)}
        ${kpi('Published', published.length, I.checkCircle, `<span class="muted small">${scheduled.length} scheduled · ${drafts.length} drafts</span>`)}
        ${kpi('Total reach', U.fmtNum(totalReach), I.users, `<span class="muted small">across ${published.length} published posts</span>`)}
        ${kpi('Engagements', U.fmtNum(totalEng), I.star, `<span class="muted small">likes + comments + shares</span>`)}
      </div>

      ${records.length === 0 ? `
        <div class="chart-card">${App.emptyState({
          icon:I.sparkles,
          title:'Your dashboard is ready — let\'s fill it',
          message:'Create your first caption with the Andika generator, or load realistic sample content to explore every chart and table.',
          actionLabel:'Create your first post'})}</div>` : `
      <div class="chart-card">
        <h3>Content created — last 8 weeks</h3>
        <div class="sub">Number of posts you created each week</div>
        ${App.charts.line(weeks, { ariaLabel:'Posts created per week over the last 8 weeks' })}
      </div>`}

      <div class="grid-2">
        <div class="chart-card" style="margin-bottom:0">
          <h3>Recent posts</h3>
          <div class="sub">Your latest content</div>
          ${records.length === 0 ? `<p class="muted small" style="margin:0">No posts yet.</p>` :
            records.slice(0,5).map(r=>`
              <div style="display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
                ${App.platformBadge(r.platform)}
                <div style="flex:1;min-width:0">
                  <div style="font-weight:700;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.title)}</div>
                  <div class="tiny muted">${esc(r.category)} · ${U.fmtDate(r.createdAt)}</div>
                </div>
                <span class="badge ${r.status}">${r.status}</span>
              </div>`).join('')}
        </div>
        <div class="chart-card" style="margin-bottom:0">
          <h3>Quick actions</h3>
          <div class="sub">Keep the momentum going</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <button class="btn btn-primary btn-block" id="qaGen">${I.sparkles} Generate a caption</button>
            <a class="btn btn-ghost btn-block" href="#/dashboard/analytics">${I.chart} View analytics</a>
            ${user.plan==='free'
              ? `<a class="btn btn-ghost btn-block" href="#/checkout?plan=pro">${I.bolt} Upgrade to Pro — Ksh 1,000/mo</a>`
              : `<div class="form-success" style="margin:0"><span style="color:var(--success)">${I.bolt}</span><span class="small">Pro active${user.planRenewsAt?' — renews '+esc(U.fmtDate(user.planRenewsAt)):''}.</span></div>`}
            <a class="btn btn-ghost btn-block" href="#/recommend">${I.target} Get a free content plan</a>
          </div>
        </div>
      </div>`;

    U.qs('#newPostBtn')?.addEventListener('click', ()=>openRecordModal(user, null, ()=>{ App.router.resolve(true); }));
    U.qs('#qaGen')?.addEventListener('click', ()=>openRecordModal(user, null, ()=>{ App.router.resolve(true); }));
    U.qs('.state [data-empty-action]')?.addEventListener('click', e=>{
      e.preventDefault(); openRecordModal(user, null, ()=>App.router.resolve(true));
    });
  }

  function kpi(label, value, icon, deltaHtml){
    return `<div class="kpi">
      <div class="kpi-top"><span class="kpi-label">${label}</span><span class="kpi-ico">${icon}</span></div>
      <div class="kpi-val">${value}</div>
      <div class="kpi-delta">${deltaHtml||''}</div>
    </div>`;
  }

  /* ========================= CONTENT (main data) ========================= */
  function renderContent(view, user){
    view.innerHTML = `
      <div class="page-head">
        <div><h1>Content</h1><p>Every caption, draft and published post — private to your account.</p></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-ghost" id="sampleBtn" title="Load demo content">${I.refresh} Load sample data</button>
          <button class="btn btn-ghost" id="exportBtn">${I.download} Export CSV</button>
          <button class="btn btn-primary" id="newBtn">${I.plus} New content</button>
        </div>
      </div>
      <div id="contentHost"></div>`;

    U.qs('#newBtn').addEventListener('click', ()=>openRecordModal(user, null, ()=>renderContent(view, user)));
    U.qs('#exportBtn').addEventListener('click', ()=>exportCSV(user));
    U.qs('#sampleBtn').addEventListener('click', ()=>{
      const existing = App.store.listRecords(user.id);
      if(existing.length){
        App.toast('You already have content — sample data is for empty accounts.','error');
        return;
      }
      seedSampleData(user);
      App.toast('Sample content loaded — 6 posts added.','success');
      renderContent(view, user);
    });
    renderContentTable(view, user);
  }

  function renderContentTable(view, user){
    const host = U.qs('#contentHost');
    let records = App.store.listRecords(user.id);

    if(tableState.search){
      const q = tableState.search.toLowerCase();
      records = records.filter(r =>
        (r.title||'').toLowerCase().includes(q) ||
        (r.caption||'').toLowerCase().includes(q) ||
        (r.category||'').toLowerCase().includes(q));
    }
    if(tableState.filterStatus !== 'all') records = records.filter(r=>r.status===tableState.filterStatus);
    if(tableState.filterPlatform !== 'all') records = records.filter(r=>r.platform===tableState.filterPlatform);

    const key = tableState.sortKey;
    const dir = tableState.sortDir === 'asc' ? 1 : -1;
    records.sort((a,b)=>{
      let va = a[key], vb = b[key];
      if(key === 'reach'){ va = a.stats?a.stats.reach:0; vb = b.stats?b.stats.reach:0; }
      if(va == null) va = ''; if(vb == null) vb = '';
      if(typeof va === 'string') return va.localeCompare(vb) * dir;
      return (new Date(va) - new Date(vb)) * dir || (Number(va)-Number(vb))*dir;
    });

    const total = records.length;
    const pages = Math.max(1, Math.ceil(total / tableState.perPage));
    if(tableState.page > pages) tableState.page = pages;
    const start = (tableState.page-1)*tableState.perPage;
    const pageRows = records.slice(start, start+tableState.perPage);

    host.innerHTML = `
      <div class="table-wrap">
        <div class="table-tools">
          <div class="search-box">${I.search}
            <input type="search" id="tblSearch" placeholder="Search captions, titles…" value="${esc(tableState.search)}" aria-label="Search content"/>
          </div>
          <select class="select" id="filterStatus" style="min-height:40px;max-width:150px" aria-label="Filter by status">
            <option value="all">All statuses</option>
            ${U.STATUSES.map(s=>`<option value="${s}" ${tableState.filterStatus===s?'selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}
          </select>
          <select class="select" id="filterPlatform" style="min-height:40px;max-width:160px" aria-label="Filter by platform">
            <option value="all">All platforms</option>
            ${U.PLATFORMS.map(p=>`<option value="${p.id}" ${tableState.filterPlatform===p.id?'selected':''}>${p.name}</option>`).join('')}
          </select>
          <span class="small muted" style="margin-left:auto">${total} post${total===1?'':'s'}</span>
        </div>
        ${total === 0 ? App.emptyState({
            icon:I.file,
            title: App.store.listRecords(user.id).length ? 'No posts match your filters' : 'No content yet',
            message: App.store.listRecords(user.id).length
              ? 'Try clearing the search or filters to see your posts.'
              : 'Create a caption with the Andika generator — or load sample data to explore first.',
            actionLabel: App.store.listRecords(user.id).length ? '' : 'Create your first post'
          }) : `
        <div class="table-scroll">
        <table class="data">
          <thead><tr>
            ${th('title','Post')}
            ${th('platform','Platform')}
            ${th('status','Status')}
            ${th('scheduledFor','Scheduled')}
            ${th('createdAt','Created')}
            ${th('reach','Reach')}
            <th style="text-align:right">Actions</th>
          </tr></thead>
          <tbody>
            ${pageRows.map(r=>`
              <tr>
                <td>
                  <div class="cell-title">${esc(r.title)}</div>
                  <div class="cell-cap">${esc((r.caption||'').replace(/\s+/g,' ').slice(0,90))}</div>
                </td>
                <td><span class="badge ${r.platform}">${esc(U.platform(r.platform).name)}</span></td>
                <td><span class="badge ${r.status}">${r.status}</span></td>
                <td class="small muted">${r.scheduledFor ? esc(U.fmtDate(r.scheduledFor)) : '—'}</td>
                <td class="small muted">${esc(U.fmtDate(r.createdAt))}</td>
                <td class="small" style="font-weight:700">${r.stats ? U.fmtNum(r.stats.reach) : '—'}</td>
                <td><div class="row-actions">
                  ${r.status!=='published' ? `<button class="icon-btn" data-publish="${r.id}" title="Post now">${I.rocket}</button>` : ''}
                  <button class="icon-btn" data-edit="${r.id}" title="Edit">${I.edit}</button>
                  <button class="icon-btn danger" data-delete="${r.id}" title="Delete">${I.trash}</button>
                </div></td>
              </tr>`).join('')}
          </tbody>
        </table>
        </div>
        <div class="table-foot">
          <span class="small muted">Showing ${total ? start+1 : 0}–${Math.min(start+tableState.perPage,total)} of ${total}</span>
          <div class="pager">
            <button id="pgPrev" ${tableState.page===1?'disabled':''} aria-label="Previous page">‹</button>
            ${pagerButtons(pages, tableState.page)}
            <button id="pgNext" ${tableState.page===pages?'disabled':''} aria-label="Next page">›</button>
          </div>
        </div>`}
      </div>`;

    // events
    const search = U.qs('#tblSearch');
    if(search){
      search.addEventListener('input', U.debounce(()=>{ tableState.search = search.value; tableState.page=1; renderContentTable(view,user); }, 200));
      setTimeout(()=>search.focus(), 0);
    }
    U.qs('#filterStatus')?.addEventListener('change', e=>{ tableState.filterStatus=e.target.value; tableState.page=1; renderContentTable(view,user); });
    U.qs('#filterPlatform')?.addEventListener('change', e=>{ tableState.filterPlatform=e.target.value; tableState.page=1; renderContentTable(view,user); });
    U.qs('#pgPrev')?.addEventListener('click', ()=>{ tableState.page--; renderContentTable(view,user); });
    U.qs('#pgNext')?.addEventListener('click', ()=>{ tableState.page++; renderContentTable(view,user); });
    U.qsa('[data-pg]', host).forEach(b=>b.addEventListener('click', ()=>{ tableState.page=Number(b.dataset.pg); renderContentTable(view,user); }));
    U.qsa('th[data-sort]', host).forEach(thEl=>thEl.addEventListener('click', ()=>{
      const k = thEl.dataset.sort;
      if(tableState.sortKey===k) tableState.sortDir = tableState.sortDir==='asc'?'desc':'asc';
      else { tableState.sortKey=k; tableState.sortDir='asc'; }
      renderContentTable(view,user);
    }));
    U.qsa('[data-edit]', host).forEach(b=>b.addEventListener('click', ()=>{
      const rec = App.store.getRecord(b.dataset.edit, user.id);
      if(rec) openRecordModal(user, rec, ()=>renderContent(view, user));
    }));
    U.qsa('[data-delete]', host).forEach(b=>b.addEventListener('click', async ()=>{
      const rec = App.store.getRecord(b.dataset.delete, user.id);
      if(!rec) return;
      const ok = await App.confirm({ title:'Delete post?', danger:true, confirmLabel:'Delete',
        message:`"${rec.title}" will be permanently removed. This cannot be undone.` });
      if(ok){ App.store.deleteRecord(rec.id, user.id); App.toast('Post deleted.','success'); renderContentTable(view,user); }
    }));
    U.qsa('[data-publish]', host).forEach(b=>b.addEventListener('click', ()=>{
      const live = App.store.currentUser();
      const rec = App.store.getRecord(b.dataset.publish, live.id);
      if(rec) openPublishModal(live, rec, ()=>renderContent(view, live));
    }));
    const emptyAction = host.querySelector('.state [data-empty-action]');
    if(emptyAction) emptyAction.addEventListener('click', e=>{
      e.preventDefault(); openRecordModal(user, null, ()=>renderContent(view, user));
    });

    function th(key,label){
      const active = tableState.sortKey===key;
      const ind = active ? (tableState.sortDir==='asc'?'▲':'▼') : '↕';
      return `<th data-sort="${key}">${label}<span class="sort-ind" style="color:${active?'var(--primary)':'inherit'}">${ind}</span></th>`;
    }
  }

  function pagerButtons(pages, cur){
    let out = '';
    for(let i=1;i<=pages;i++){
      if(pages>7 && i>2 && i<pages-1 && Math.abs(i-cur)>1){
        if(i===3 || i===pages-2) out += `<button disabled>…</button>`;
        continue;
      }
      out += `<button data-pg="${i}" class="${i===cur?'cur':''}">${i}</button>`;
    }
    return out;
  }

  function exportCSV(user){
    const records = App.store.listRecords(user.id);
    if(!records.length){ App.toast('No content to export yet.','error'); return; }
    const csv = U.toCSV(records, [
      {label:'Title', key:'title'},
      {label:'Platform', key:'platform'},
      {label:'Status', key:'status'},
      {label:'Category', key:'category'},
      {label:'Caption', key:'caption'},
      {label:'Scheduled for', get:r=>r.scheduledFor?U.fmtDate(r.scheduledFor):''},
      {label:'Created', get:r=>U.fmtDate(r.createdAt,true)},
      {label:'Published', get:r=>r.publishedAt?U.fmtDate(r.publishedAt,true):''},
      {label:'Reach', get:r=>r.stats?r.stats.reach:''},
      {label:'Likes', get:r=>r.stats?r.stats.likes:''},
      {label:'Comments', get:r=>r.stats?r.stats.comments:''},
      {label:'Shares', get:r=>r.stats?r.stats.shares:''}
    ]);
    U.download(`andika-content-${U.todayISO()}.csv`, '\ufeff'+csv, 'text/csv;charset=utf-8');
    App.toast('CSV exported — check your downloads.','success');
  }

  /* ---------- Record create/edit + generator ---------- */
  function openRecordModal(user, existing, onSaved){
    const isEdit = !!existing;
    const live = App.store.currentUser() || user;
    const socials = App.store.getSocials(live.id) || {};
    const body = document.createElement('div');
    body.innerHTML = `
      <div class="field">
        <label>Platform *</label>
        <div class="platform-choice" id="platChoice" role="radiogroup" aria-label="Choose platform">
          ${U.PLATFORMS.map(p=>{
            const isConn = socials[p.id] && socials[p.id].connected;
            return `
            <button type="button" class="plat-choice ${(!existing && p.id==='instagram')||(existing&&existing.platform===p.id)?'sel':''}" data-plat="${p.id}" role="radio" aria-checked="${(!existing&&p.id==='instagram')||(existing&&existing.platform===p.id)}">
              <span class="plat-dot" style="background:${p.color}">${App.platformIcon(p.id)}</span>${p.name}
              ${isConn ? `<span class="conn-dot" title="Connected as ${esc(socials[p.id].displayName)}">${I.checkCircle}</span>` : ''}
            </button>`;
          }).join('')}
        </div>
      </div>
      <div class="grid-2">
        <div class="field">
          <label for="fCategory">Content type</label>
          <select class="select" id="fCategory">
            ${U.CATEGORIES.map(c=>`<option ${existing&&existing.category===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="fTone">Tone</label>
          <select class="select" id="fTone">
            ${['Friendly & warm','Bold & hyped','Professional','Funny & relatable'].map(t=>
              `<option ${!existing && user.settings.defaultTone===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="field">
        <label for="fTopic">What are you promoting? *</label>
        <input class="input" id="fTopic" placeholder="e.g. Friday braids offer, Ksh 1,500, 8 slots tu" value="${esc(existing?existing.title:'')}"/>
        <div class="hint">Describe your offer in one sentence — the generator turns this into a full caption.</div>
      </div>
      <div class="field">
        <label for="fCaption">Caption</label>
        <textarea class="input" id="fCaption" style="min-height:150px" placeholder="Click “Generate caption” or write your own…">${esc(existing?existing.caption:'')}</textarea>
        <div class="hint" id="genTip"></div>
      </div>
      <div class="field">
        <label for="fSchedule">Schedule for (optional · Pro)</label>
        <input class="input" id="fSchedule" type="datetime-local" value="${existing&&existing.scheduledFor?existing.scheduledFor.slice(0,16):''}"/>
        <div class="hint">Pick a future date &amp; time then press <strong>Schedule</strong> to auto-publish then.
          Leave empty to <strong>Publish now</strong> or save as a draft.</div>
      </div>
      <div class="form-error-banner" id="recErr" style="display:none"></div>`;

    const footer = document.createElement('div');
    footer.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;width:100%';
    footer.innerHTML = `
      <button type="button" class="btn btn-ghost" id="mGen" style="margin-right:auto">${I.sparkles} ${isEdit?'Regenerate':'Generate'}</button>
      <button type="button" class="btn btn-ghost" data-close-modal>Cancel</button>
      <button type="button" class="btn btn-ghost" id="mDraft">${I.file} Save draft</button>
      <button type="button" class="btn btn-ghost" id="mSchedule">${I.calendar} Schedule</button>
      <button type="button" class="btn btn-primary" id="mPublish">${I.rocket} Publish now</button>`;

    const modal = App.openModal({ title: isEdit?'Edit content':'Create content', body, footer, size:'lg' });
    let platform = existing ? existing.platform : (live.settings.defaultPlatform||'instagram');
    const genBtn = modal.el.querySelector('#mGen');
    const draftBtn = modal.el.querySelector('#mDraft');
    const schedBtn = modal.el.querySelector('#mSchedule');
    const pubBtn = modal.el.querySelector('#mPublish');

    body.querySelectorAll('[data-plat]').forEach(b=>b.addEventListener('click', ()=>{
      platform = b.dataset.plat;
      body.querySelectorAll('[data-plat]').forEach(x=>{
        const on = x.dataset.plat===platform;
        x.classList.toggle('sel', on);
        x.setAttribute('aria-checked', on);
      });
    }));

    genBtn.addEventListener('click', ()=>{
      const topic = body.querySelector('#fTopic').value.trim();
      if(!topic){
        const err = body.querySelector('#recErr');
        err.style.display='block'; err.textContent = 'Tell us what you are promoting first — e.g. “Saturday nails offer Ksh 800”.';
        return;
      }
      const out = App.generator.generate({
        platform, category: body.querySelector('#fCategory').value,
        tone: body.querySelector('#fTone').value, topic,
        businessName: user.profile.businessName
      });
      body.querySelector('#fCaption').value = out.caption;
      body.querySelector('#genTip').innerHTML = '💡 <strong>'+esc(out.platformTip)+'</strong>';
      App.toast('Caption generated! Review before saving.','success');
    });

    function collectData(){
      const topic = body.querySelector('#fTopic').value.trim();
      const caption = body.querySelector('#fCaption').value.trim();
      const sched = body.querySelector('#fSchedule').value;
      const err = body.querySelector('#recErr');
      if(!topic){ err.style.display='block'; err.textContent='A title/topic is required for every post.'; return null; }
      if(!caption){ err.style.display='block'; err.textContent='Generate a caption or write one before saving.'; return null; }
      err.style.display='none';
      return {
        platform,
        category: body.querySelector('#fCategory').value,
        title: topic,
        caption,
        scheduledFor: sched ? new Date(sched).toISOString() : null
      };
    }

    function persistRecord(data, status){
      const payload = Object.assign({}, data, {
        status,
        scheduledFor: status === 'scheduled' ? data.scheduledFor : null
      });
      if(isEdit){
        App.store.updateRecord(existing.id, live.id, payload);
        return existing.id;
      }
      const rec = App.store.addRecord(Object.assign({ userId: live.id }, payload));
      return rec.id;
    }

    // Save as draft
    draftBtn.addEventListener('click', ()=>{
      const data = collectData(); if(!data) return;
      const keepPublished = isEdit && existing.status === 'published';
      persistRecord(data, keepPublished ? 'published' : 'draft');
      App.toast('Saved as draft.','success');
      modal.close(); onSaved && onSaved();
    });

    // Schedule
    schedBtn.addEventListener('click', ()=>{
      const data = collectData(); if(!data) return;
      const liveUser = App.store.currentUser() || live;
      if(liveUser.plan !== 'pro'){
        App.confirm({ title:'Scheduling is a Pro feature',
          message:'Queue posts to publish automatically at a chosen date and time with Pro — Ksh 1,000/month, paid via M-PESA. Upgrade now?',
          confirmLabel:'Upgrade to Pro' }).then(ok=>{ if(ok) location.hash = '#/checkout?plan=pro'; });
        return;
      }
      if(!data.scheduledFor || new Date(data.scheduledFor) <= new Date()){
        const err = body.querySelector('#recErr');
        err.style.display='block';
        err.textContent='Pick a future date and time to schedule — or use “Publish now” to post immediately.';
        return;
      }
      persistRecord(data, 'scheduled');
      App.toast('Scheduled for '+U.fmtDate(data.scheduledFor, true)+'. Andika will publish it automatically.','success');
      modal.close(); onSaved && onSaved();
    });

    // Publish now
    pubBtn.addEventListener('click', ()=>{
      const data = collectData(); if(!data) return;
      const liveUser = App.store.currentUser() || live;
      if(liveUser.plan !== 'pro'){
        App.confirm({ title:'Posting is a Pro feature',
          message:'One-tap publishing to Facebook, Instagram, WhatsApp, TikTok and X is included in Pro — Ksh 1,000/month. Upgrade now?',
          confirmLabel:'Upgrade to Pro' }).then(ok=>{
            if(!ok) return;
            persistRecord(data, 'draft'); modal.close(); onSaved && onSaved();
            location.hash = '#/checkout?plan=pro';
          });
        return;
      }
      if(!App.store.isConnected(liveUser.id, platform)){
        persistRecord(data, 'draft'); modal.close(); onSaved && onSaved();
        const pname = U.platform(platform).name;
        App.confirm({ title:`Connect ${pname} to post`,
          message:`Your ${pname} account isn't connected yet. We saved your post as a draft — connect ${pname} in Settings, then publish it.`,
          confirmLabel:'Connect in Settings' }).then(ok=>{ if(ok) location.hash = '#/dashboard/settings'; });
        return;
      }
      const recId = persistRecord(data, 'draft');
      const rec = App.store.getRecord(recId, liveUser.id);
      modal.close();
      // Defer opening the publisher until the create modal is fully torn down,
      // and refresh the view only after publishing actually completes.
      App.toast('Opening publisher…','success');
      setTimeout(()=>{
        const cur = App.store.currentUser();
        const fresh = App.store.getRecord(recId, cur.id) || rec;
        // stay on the content table and refresh it in place once published
        openPublishModal(cur, fresh, ()=>{
          const viewEl = U.qs('#dashView');
          if(viewEl) renderContent(viewEl, cur);
          else if(onSaved) onSaved();
        });
      }, 120);
    });
  }

  /* ---------- Publish (post to social) ---------- */
  function openPublishModal(user, record, onDone){
    const live = App.store.currentUser() || user;
    const p = U.platform(record.platform);
    if(live.plan !== 'pro'){
      App.confirm({
        title:'Posting is a Pro feature',
        message:'One-tap publishing to Facebook, Instagram, WhatsApp, TikTok and X is included in Pro at Ksh 1,000/month. Upgrade now to post "'+record.title+'"?',
        confirmLabel:'Upgrade to Pro'
      }).then(ok=>{ if(ok) location.hash = '#/checkout?plan=pro'; });
      return;
    }
    if(!App.store.isConnected(live.id, record.platform)){
      const social = App.store.getSocials(live.id);
      const anyConnected = U.PLATFORMS.some(x=>social[x.id]&&social[x.id].connected);
      App.confirm({
        title:`Connect ${p.name} to post`,
        message:`Your ${p.name} account isn't connected yet${anyConnected?'.':' — no accounts are connected yet.'} Connect it in Settings, then Andika can publish this post there.`,
        confirmLabel:'Connect in Settings'
      }).then(ok=>{ if(ok) location.hash = '#/dashboard/settings'; });
      return;
    }
    const connected = App.store.getSocial(live.id, record.platform);
    const body = document.createElement('div');
    body.innerHTML = `
      <div class="publish-target">
        <span class="plat-dot" style="width:34px;height:34px;background:${p.color}">
          <span style="width:17px;height:17px;display:inline-flex">${App.platformIcon(record.platform)}</span></span>
        <div style="flex:1">
          <div class="small muted" style="line-height:1.4">Posting <strong style="color:var(--text)">${esc(record.title)}</strong> to
            <strong style="color:var(--text)">${p.name}</strong></div>
          <div class="tiny" style="color:var(--success);font-weight:700">${I.checkCircle} ${esc(connected.displayName)}</div>
        </div>
      </div>
      <div class="gen-out" style="margin:12px 0 14px;max-height:140px;overflow:auto">${esc(record.caption)}</div>
      <div class="post-steps" id="pubSteps"></div>
      <div id="pubResult"></div>`;
    const modal = App.openModal({ title:'Post to social', body });
    const stepsEl = body.querySelector('#pubSteps');
    const resEl = body.querySelector('#pubResult');

    App.social.publish({ platform: record.platform, caption: record.caption, recordId: record.id, handle: connected.handle },
      (i, label)=>{
        let row = stepsEl.children[i];
        if(!row){
          row = document.createElement('div');
          row.className = 'post-step';
          row.innerHTML = `<span class="ps-ic"></span><span></span>`;
          stepsEl.appendChild(row);
        }
        row.classList.add('active');
        row.querySelector('span:last-child').textContent = label;
        row.querySelector('.ps-ic').innerHTML = App.spinner;
        if(i>0){ const prev=stepsEl.children[i-1]; prev.classList.remove('active'); prev.classList.add('done'); prev.querySelector('.ps-ic').innerHTML = I.check; }
      }
    ).then(result=>{
      const last = stepsEl.children[stepsEl.children.length-1];
      if(last){ last.classList.remove('active'); last.classList.add('done'); last.querySelector('.ps-ic').innerHTML = I.check; }
      // always write against the freshest user + record (avoid clobbering concurrent changes)
      const freshUser = App.store.currentUser();
      const freshRec = App.store.getRecord(record.id, freshUser.id) || record;
      App.store.updateRecord(freshRec.id, freshUser.id, {
        status:'published', publishedAt: result.publishedAt,
        externalId: result.externalId, stats: result.stats, scheduledFor:null
      });
      const canPrefill = (result.platform==='whatsapp' || result.platform==='x' || result.platform==='facebook');
      resEl.innerHTML = `
        <div class="form-success" style="margin-top:14px">
          <span style="color:var(--success);flex:none;margin-top:2px">${I.checkCircle}</span>
          <div>
            <strong>${esc(result.platformName)} ${canPrefill?'opened with your post ready':'opened'} 🎉</strong><br/>
            <span class="small">${canPrefill
              ? 'Your caption is pre-filled — just review and tap post in the new tab. Your caption is also copied if you need it.'
              : 'Your caption has been copied. In the app that just opened, create a new post and paste it (tap and hold → Paste).'}</span>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
          <a class="btn btn-primary" href="${esc(result.link)}" target="_blank" rel="noopener" style="flex:1">Open ${esc(result.platformName)} again ${I.arrowRight}</a>
          <button class="btn btn-ghost" id="copyCaption">${I.file} Copy caption</button>
          <button class="btn btn-ghost" data-close-modal>Done</button>
        </div>
        <p class="tiny muted" style="margin-top:10px;margin-bottom:0">Marked as published on your dashboard · estimated initial reach <strong>${U.fmtNum(result.stats.reach)}</strong>.</p>`;
      resEl.querySelector('#copyCaption').addEventListener('click', async ()=>{
        const ok = await U.copy(record.caption);
        App.toast(ok?'Caption copied to clipboard':'Copy failed', ok?'success':'error');
      });
      App.toast(`Opening ${result.platformName} — caption ready.`,'success');
      onDone && onDone();
    }).catch(err=>{
      resEl.innerHTML = `<div class="form-error-banner" style="display:flex">${I.alert} ${esc(err.message||'Publishing failed. Please retry.')}
        <button class="btn btn-ghost btn-sm" style="margin-left:auto" data-close-modal>Close</button></div>`;
    });
  }

  /* ---------- Connect a social account (authorization flow) ---------- */
  const SOCIAL_FIELD = {
    facebook:  { label:'Facebook Page name or URL', placeholder:'Glow & Go Salon',
                 hint:'Use the name of your business Page, e.g. Glow & Go Salon, or paste its URL.' },
    instagram: { label:'Instagram username', placeholder:'glowandgo.salon',
                 hint:'Your business handle, with or without the @.' },
    whatsapp:  { label:'WhatsApp Business number', placeholder:'07XX XXX XXX',
                 hint:'The Safaricom number that receives your WhatsApp Business chats.' },
    tiktok:    { label:'TikTok username', placeholder:'glowandgo',
                 hint:'Your TikTok handle, with or without the @.' },
    x:         { label:'X (Twitter) username', placeholder:'glowandgo',
                 hint:'Your X handle, with or without the @.' }
  };

  function connectSocialFlow(user, platform, onDone){
    const p = U.platform(platform);
    const field = SOCIAL_FIELD[platform];
    const body = document.createElement('div');
    body.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <span class="plat-dot" style="width:44px;height:44px;background:${p.color}">
          <span style="width:22px;height:22px;display:inline-flex">${App.platformIcon(platform)}</span></span>
        <div><strong style="font-family:var(--font-display);font-size:16px">Connect ${p.name}</strong><br/>
        <span class="small muted">Andika will publish posts to this account on your behalf.</span></div>
      </div>
      <div id="connectForm">
        <div class="field">
          <label for="connHandle">${esc(field.label)}</label>
          <input class="input" id="connHandle" type="${platform==='whatsapp'?'tel':'text'}"
            ${platform!=='whatsapp'?'autocapitalize="none" autocomplete="off"':''} placeholder="${esc(field.placeholder)}"/>
          <div class="hint">${esc(field.hint)}</div>
          <div class="error-msg" id="connErr"></div>
        </div>
        <div class="form-success" style="background:var(--info-soft);border-color:#a5d8e0;color:#0e4b5a">
          <span style="flex:none;margin-top:2px">${I.users}</span>
          <span class="small">You'll be asked to approve Andika's request to post to <strong>${p.name}</strong>.
          We only publish content you explicitly create — never automatically.</span></div>
      </div>
      <div id="connectProgress" style="display:none"></div>`;

    const footer = document.createElement('div');
    footer.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;width:100%';
    footer.innerHTML = `<button class="btn btn-ghost" data-close-modal>Cancel</button>
      <button class="btn btn-primary" id="connBtn" style="min-width:180px">Connect ${p.name}</button>`;

    const modal = App.openModal({ title:`Connect ${p.name}`, body, footer });

    modal.el.querySelector('#connBtn').addEventListener('click', async ()=>{
      const handleEl = modal.el.querySelector('#connHandle');
      const errEl = modal.el.querySelector('#connErr');
      let handle = handleEl.value.trim();
      errEl.classList.remove('show');

      if(platform === 'whatsapp'){
        const norm = U.normalizeKEPhone(handle);
        if(!norm){
          errEl.innerHTML = `${I.alert}<span>Enter a valid Kenyan number, e.g. 0712 345 678.</span>`;
          errEl.classList.add('show');
          return;
        }
        handle = norm;
      } else if(handle.length < 2){
        errEl.innerHTML = `${I.alert}<span>Please enter your ${p.name} ${platform==='facebook'?'Page name':'username'}.</span>`;
        errEl.classList.add('show');
        return;
      }

      const cleanHandle = handle.replace(/^@+/,'').replace(/\/+$/,'');
      const displayName = platform === 'whatsapp'
        ? U.mpesaDisplay(cleanHandle)
        : (cleanHandle.startsWith('http') ? cleanHandle : '@'+cleanHandle);

      // ---- authorization simulation ----
      modal.el.querySelector('#connectForm').style.display = 'none';
      const prog = modal.el.querySelector('#connectProgress');
      prog.style.display = 'block';
      const steps = [
        `Opening ${p.name} authorization…`,
        'Requesting permission to post on your behalf…',
        `Linking ${p.name} account to Andika…`,
        'Account connected'
      ];
      prog.innerHTML = `
        <p class="small muted" style="margin-bottom:6px">Follow the prompt on ${p.name} to approve Andika:</p>
        <div class="post-steps" id="connSteps"></div>`;
      const list = prog.querySelector('#connSteps');
      steps.forEach((label, i)=>{
        const row = document.createElement('div');
        row.className = 'post-step' + (i===0?' active':'');
        row.innerHTML = `<span class="ps-ic">${i===0?App.spinner:''}</span><span>${label}</span>`;
        list.appendChild(row);
      });
      for(let i=0;i<steps.length-1;i++){
        await U.wait(650 + Math.random()*400);
        const cur = list.children[i], nx = list.children[i+1];
        cur.classList.remove('active'); cur.classList.add('done');
        cur.querySelector('.ps-ic').innerHTML = I.check;
        nx.classList.add('active'); nx.querySelector('.ps-ic').innerHTML = App.spinner;
      }
      await U.wait(500);
      const last = list.children[list.children.length-1];
      last.classList.remove('active'); last.classList.add('done');
      last.querySelector('.ps-ic').innerHTML = I.check;

      App.store.connectSocial(user.id, platform, cleanHandle, displayName);
      await U.wait(350);
      modal.close();
      App.toast(`${p.name} connected as ${displayName}`, 'success');
      onDone && onDone();
    });
  }

  function seedSampleData(user){
    const samples = [
      { platform:'instagram', category:'Promotion', title:'Friday braids offer — Ksh 1,500',
        caption:'Wueh! Hii offer ni moto 🔥 Braids + treatment Ksh 1,500 tu weekend hii. DM au WhatsApp 0712-345-678 — slots 8 tu! 💈\n\n#NairobiSalon #BraidsKenya #SupportLocalKE',
        status:'published' },
      { platform:'whatsapp', category:'Announcement', title:'Jioni status: salon ipo open hadi 8pm',
        caption:'Msinisahau wadau — tuko open hadi saa mbili za usiku leo. Last slot ya kuzimisha! 💇🏾‍♀️\n\nWhatsApp status maalum ya wateja wa karibu.',
        status:'published' },
      { platform:'facebook', category:'Educational', title:'Jinsi ya kutunza braid zako wiki 3+',
        caption:'Kidogo mnachostahili kujua: fua nywele kwa shampoo ya baby, paka dawa ya scalp kila wiki, na vaa scarf usiku. Braids zikudumu zaidi! 💡\n\n#HairTipsKenya #NairobiSpa',
        status:'published' },
      { platform:'tiktok', category:'Promotion', title:'Transformation reel: before/after retouch',
        caption:'Tazama transformation hii 🔥 Sekunde 30 tu. Book slot yako mapema — weekend inajaa haraka!\n\n#fyp #TikTokKenya #NairobiSalon',
        status:'published' },
      { platform:'instagram', category:'Engagement', title:'Poll: gel vs press-in?',
        caption:'Wadau semeni — gel ama press-in? Mpangilio wa kesho unategemea na votes zenu! 👇💅',
        status:'draft' },
      { platform:'x', category:'Announcement', title:'New branch opening — Kasarani',
        caption:'Habari njema: branch yetu ya pili inafunguliwa Kasarani mwezi ujao. Offer ya opening week — 20% off kwa first 50 clients! 🎉',
        status:'draft' }
    ];
    const now = Date.now();
    samples.forEach((s, i)=>{
      const published = s.status==='published';
      App.store.addRecord(Object.assign({
        userId: user.id,
        caption: s.caption,
        scheduledFor: null,
        createdAt: new Date(now - (samples.length-i)*4*24*3600*1000).toISOString(),
        publishedAt: published ? new Date(now - (samples.length-i)*4*24*3600*1000 + 3600*1000).toISOString() : null,
        stats: published ? App.generator.statsFor() : null
      }, s));
    });
  }

  /* ========================= ANALYTICS ========================= */
  function renderAnalytics(view, user){
    const records = App.store.listRecords(user.id);
    const published = records.filter(r=>r.status==='published');

    view.innerHTML = `
      <div class="page-head">
        <div><h1>Analytics</h1><p>Numbers derived from your own published posts — no vanity metrics.</p></div>
      </div>
      <div id="analyticsHost"></div>`;

    if(!records.length){
      U.qs('#analyticsHost').innerHTML = `
        <div class="chart-card">${App.emptyState({
          icon:I.chart, title:'Nothing to analyse yet',
          message:'Publish a few posts (or load sample data in the Content tab) and your reach, engagement and platform breakdown will appear here.',
          actionLabel:'Go to Content', actionHref:'#/dashboard/content'})}</div>`;
      return;
    }
    if(!published.length){
      U.qs('#analyticsHost').innerHTML = `
        <div class="chart-card">${App.emptyState({
          icon:I.rocket, title:'You have drafts — but nothing published yet',
          message:'Analytics build from published posts. Publish a draft (Pro feature) to see reach and engagement here.',
          actionLabel:'Go to Content', actionHref:'#/dashboard/content'})}
        </div>
        <div class="chart-card">
          <h3>Your library so far</h3>
          <div class="sub">Status breakdown of ${records.length} post${records.length===1?'':'s'}</div>
          ${statusBreakdown(records)}
        </div>`;
      return;
    }

    // platform aggregates
    const byPlatform = U.PLATFORMS.map(p=>{
      const rows = published.filter(r=>r.platform===p.id);
      return {
        id:p.id, name:p.name, color:p.color, icon:App.platformIcon(p.id),
        posts: rows.length,
        reach: rows.reduce((a,r)=>a+(r.stats?r.stats.reach:0),0),
        eng: rows.reduce((a,r)=>a+(r.stats?r.stats.likes+r.stats.comments+r.stats.shares:0),0)
      };
    }).filter(x=>x.posts>0).sort((a,b)=>b.reach-a.reach);

    const totalReach = byPlatform.reduce((a,x)=>a+x.reach,0);
    const totalEng = byPlatform.reduce((a,x)=>a+x.eng,0);

    // 8-week reach trend
    const weeks = [];
    for(let i=7;i>=0;i--){
      const start = U.weekAgo(i), end = U.weekAgo(i-1);
      const reach = published.filter(r=>{ const d=new Date(r.publishedAt); return d>=start && d<end; })
        .reduce((a,r)=>a+(r.stats?r.stats.reach:0),0);
      weeks.push({ label: start.toLocaleDateString('en-KE',{day:'numeric',month:'short'}), value:reach });
    }

    U.qs('#analyticsHost').innerHTML = `
      <div class="kpi-grid">
        ${kpi('Published posts', published.length, I.checkCircle, `<span class="muted small">${records.length-published.length} not yet published</span>`)}
        ${kpi('Total reach', U.fmtNum(totalReach), I.users, `<span class="muted small">all platforms</span>`)}
        ${kpi('Total engagement', U.fmtNum(totalEng), I.star, `<span class="muted small">${totalReach?Math.round(totalEng/totalReach*100):0}% engagement rate</span>`)}
        ${kpi('Best platform', byPlatform[0]?esc(byPlatform[0].name):'—', I.bolt, `<span class="muted small">${byPlatform[0]?U.fmtNum(byPlatform[0].reach)+' reach':''}</span>`)}
      </div>

      <div class="chart-card">
        <h3>Reach — last 8 weeks</h3>
        <div class="sub">Estimated reach from posts published each week</div>
        ${App.charts.line(weeks, { ariaLabel:'Reach per week over the last 8 weeks' })}
      </div>

      <div class="grid-2">
        <div class="chart-card" style="margin-bottom:0">
          <h3>Reach by platform</h3>
          <div class="sub">Where your audience actually sees you</div>
          ${App.charts.bars(byPlatform.map(p=>({ label:p.name, value:p.reach, color:p.color, icon:p.icon })))}
        </div>
        <div class="chart-card" style="margin-bottom:0">
          <h3>Posts by status</h3>
          <div class="sub">Your content pipeline</div>
          ${statusBreakdown(records)}
        </div>
      </div>

      <div class="chart-card" style="margin-top:20px">
        <h3>Engagement by platform</h3>
        <div class="sub">Likes + comments + shares combined</div>
        ${App.charts.bars(byPlatform.map(p=>({ label:p.name, value:p.eng, color:p.color, icon:p.icon })))}
      </div>`;
  }

  function statusBreakdown(records){
    const counts = { draft:0, scheduled:0, published:0 };
    records.forEach(r=>counts[r.status]=(counts[r.status]||0)+1);
    const colors = { draft:'#94a3b8', scheduled:'#0e7490', published:'#0f9d58' };
    return `<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">
      <div style="flex:none">${App.charts.donut(['published','scheduled','draft'].map(k=>({label:k,value:counts[k],color:colors[k]})))}</div>
      <div style="flex:1;min-width:180px">
        ${Object.entries(counts).map(([k,v])=>`
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:14px;font-weight:600">
            <span style="width:12px;height:12px;border-radius:3px;background:${colors[k]};display:inline-block"></span>
            <span style="text-transform:capitalize;flex:1">${k}</span><strong>${v}</strong>
          </div>`).join('')}
      </div>
    </div>`;
  }

  /* ========================= BILLING ========================= */
  function renderBilling(view, user){
    const payments = App.store.listPayments(user.id);
    const isPro = user.plan === 'pro';
    view.innerHTML = `
      <div class="page-head">
        <div><h1>Billing</h1><p>Your plan, price and payment history — billed via PayBridge M-PESA.</p></div>
      </div>

      <div class="plan-hero">
        <span class="plan-pill ${isPro?'pro':''}" style="background:rgba(255,255,255,.15)">${isPro?I.bolt:I.sparkles} ${isPro?'PRO':'FREE'}</span>
        <div style="flex:1;min-width:200px">
          <h3>${isPro?'Andika Pro':'Andika Free'}</h3>
          <div class="ph-price">${isPro?'Ksh 1,000':'Ksh 0'} <small>/ month</small></div>
        </div>
        <div style="text-align:right">
          ${isPro
            ? `<p class="small" style="margin:0 0 10px;color:rgba(255,255,255,.85)">
               ${user.planCancelsAt ? 'Cancels on '+esc(U.fmtDate(user.planCancelsAt)) : 'Renews on '+esc(U.fmtDate(user.planRenewsAt))}</p>
               <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
                 <button class="btn btn-light btn-sm" id="cancelPlan">${user.planCancelsAt?'Cancellation scheduled':'Cancel Pro'}</button>
               </div>`
            : `<p class="small" style="margin:0 0 10px;color:rgba(255,255,255,.85)">Unlock unlimited posts, scheduling &amp; full analytics.</p>
               <a class="btn btn-light" href="#/checkout?plan=pro">${I.bolt} Upgrade to Pro</a>`}
        </div>
      </div>

      <div class="grid-2">
        <div class="chart-card" style="margin-bottom:0">
          <h3>Plan features</h3>
          <div class="sub">What ${isPro?'Pro':'the Free plan'} includes</div>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;font-size:14px">
            ${[
              ['AI captions (English / Kiswahili / Sheng)', true],
              ['Saved posts', isPro?'Unlimited':'10 posts'],
              ['Publish & schedule to 5 platforms', isPro],
              ['Full reach & engagement analytics', isPro],
              ['Weekly trend charts & CSV export', isPro],
              ['Priority WhatsApp support', isPro]
            ].map(([f,v])=>`<li style="display:flex;gap:9px;align-items:flex-start">
              <span style="color:${v===true?'var(--success)':'var(--border-strong)'};flex:none;margin-top:1px">${v===true?I.checkCircle:I.close}</span>
              <span class="${v===true?'':'muted'}">${esc(f)}${v!==true && v!==false ? ' — <strong>'+esc(v)+'</strong>':''}</span></li>`).join('')}
          </ul>
          ${!isPro ? `<a class="btn btn-primary btn-block" style="margin-top:16px" href="#/checkout?plan=pro">Upgrade — Ksh 1,000/month</a>`:''}
        </div>
        <div class="chart-card" style="margin-bottom:0">
          <h3>Payment history</h3>
          <div class="sub">Receipts from PayBridge</div>
          ${payments.length === 0 ? App.emptyState({ icon:I.card, title:'No payments yet',
              message:'Upgrade to Pro and your M-PESA receipts will be listed here.'}) : `
          <div class="table-scroll"><table class="data invoice-table">
            <thead><tr><th>Date</th><th>Amount</th><th>Reference</th><th>Status</th></tr></thead>
            <tbody>
              ${payments.map(p=>`<tr>
                <td class="small">${esc(U.fmtDate(p.paidAt||p.createdAt))}</td>
                <td><strong>${U.fmtKES(p.amount)}</strong></td>
                <td class="small">${esc(p.reference)}<br/><span class="tiny muted">${esc(p.receipt||'')}</span></td>
                <td><span class="badge published">Paid</span></td>
              </tr>`).join('')}
            </tbody>
          </table></div>`}
        </div>
      </div>`;

    const cancelBtn = U.qs('#cancelPlan');
    if(cancelBtn) cancelBtn.addEventListener('click', async ()=>{
      if(user.planCancelsAt){ App.toast('Your cancellation is already scheduled.'); return; }
      const ok = await App.confirm({
        title:'Cancel Pro?',
        message:'You will keep Pro features until '+U.fmtDate(user.planRenewsAt||U.monthFromNow())+', then return to Free automatically. Your posts and data are kept.',
        confirmLabel:'Cancel Pro', danger:true
      });
      if(ok){ App.store.cancelPro(user.id); App.toast('Cancellation scheduled — Pro stays active until period end.','success'); App.router.resolve(true); }
    });
  }

  /* ========================= ACCOUNT ========================= */
  function renderAccount(view, user){
    view.innerHTML = `
      <div class="page-head"><div><h1>Account</h1><p>Your profile and sign-in details.</p></div></div>
      <div class="grid-2" style="grid-template-columns:1.1fr .9fr;align-items:start">
        <div>
          <div class="chart-card">
            <h3>Profile</h3>
            <div class="sub">Used to personalise your captions</div>
            <form id="profileForm" novalidate>
              <div class="field"><label for="aEmail">Email address (sign-in)</label>
                <input class="input" id="aEmail" value="${esc(user.email)}" disabled style="background:var(--surface-2)"/>
                <div class="hint">${user.google?'You sign in with Google, so your email is managed by Google.':'Your email is your sign-in identifier and cannot be changed.'}</div></div>
              <div class="field"><label for="aName">Full name *</label>
                <input class="input" id="aName" value="${esc(user.name)}" autocomplete="name"/>
                <div class="error-msg" data-error-for="name">${I.alert}<span>Name is required.</span></div></div>
              <div class="grid-2">
                <div class="field"><label for="aBiz">Business name</label>
                  <input class="input" id="aBiz" value="${esc(user.profile.businessName||'')}" placeholder="e.g. Glow & Go Salon"/></div>
                <div class="field"><label for="aType">Business type</label>
                  <select class="select" id="aType">
                    <option value="">— Select —</option>
                    ${Object.values(App.recommend.types).map(t=>`<option ${user.profile.businessType===t.label?'selected':''}>${esc(t.label)}</option>`).join('')}
                  </select></div>
              </div>
              <div class="grid-2">
                <div class="field"><label for="aCounty">County / town</label>
                  <input class="input" id="aCounty" value="${esc(user.profile.county||'')}" placeholder="Nairobi"/></div>
                <div class="field"><label for="aPhone">WhatsApp / phone</label>
                  <input class="input" id="aPhone" type="tel" value="${esc(user.profile.phone||'')}" placeholder="07XX XXX XXX"/></div>
              </div>
              <div class="field"><label for="aBio">Short bio (used in captions)</label>
                <textarea class="input" id="aBio" placeholder="e.g. Family salon in Nairobi CBD — braids, retouch and nails since 2019.">${esc(user.profile.bio||'')}</textarea></div>
              <button class="btn btn-primary" type="submit">${I.check} Save profile</button>
            </form>
          </div>
        </div>
        <div>
          ${!user.google ? `
          <div class="chart-card">
            <h3>Password</h3>
            <div class="sub">Change your sign-in password</div>
            <form id="pwForm" novalidate>
              <div class="field"><label for="pwCur">Current password</label>
                <input class="input" id="pwCur" type="password" autocomplete="current-password"/>
                <div class="error-msg" data-error-for="currentPassword">${I.alert}<span></span></div></div>
              <div class="field"><label for="pwNew">New password</label>
                <input class="input" id="pwNew" type="password" autocomplete="new-password"/>
                <div class="error-msg" data-error-for="newPassword">${I.alert}<span>At least 8 characters.</span></div></div>
              <button class="btn btn-ghost" type="submit">Update password</button>
            </form>
          </div>` : `
          <div class="chart-card">
            <h3>Sign-in method</h3>
            <p class="small muted">You sign in with Google (${esc(user.email)}), so no password is stored on Andika.</p>
            <button class="btn btn-google btn-sm" disabled>${I.google} Linked: Google</button>
          </div>`}
          <div class="chart-card" style="border-color:#f5c2c2">
            <h3 style="color:var(--danger)">Danger zone</h3>
            <p class="small muted">Deleting your account removes your profile, all posts and payment records from this device permanently.</p>
            <button class="btn btn-danger btn-sm" id="deleteAcct">${I.trash} Delete my account</button>
          </div>
        </div>
      </div>`;

    U.qs('#profileForm').addEventListener('submit', e=>{
      e.preventDefault();
      const f = e.currentTarget;
      App.clearErrors(f);
      const name = f.querySelector('#aName').value.trim();
      if(name.length<2){ App.setError(f,'name','Name is required.'); return; }
      App.store.updateUser({
        id: user.id, name,
        profile: {
          businessName: f.querySelector('#aBiz').value.trim(),
          businessType: f.querySelector('#aType').value,
          county: f.querySelector('#aCounty').value.trim(),
          phone: f.querySelector('#aPhone').value.trim(),
          bio: f.querySelector('#aBio').value.trim()
        }
      });
      App.toast('Profile saved.','success');
    });

    const pwForm = U.qs('#pwForm');
    if(pwForm) pwForm.addEventListener('submit', e=>{
      e.preventDefault();
      App.clearErrors(pwForm);
      const cur = pwForm.querySelector('#pwCur').value, nw = pwForm.querySelector('#pwNew').value;
      if(nw.length < 8){ App.setError(pwForm,'newPassword','New password must be at least 8 characters.'); return; }
      try{
        App.store.changePassword(user.id, cur, nw);
        App.toast('Password updated.','success');
        pwForm.reset();
      }catch(err){ App.setError(pwForm, err.field||'currentPassword', err.message); }
    });

    U.qs('#deleteAcct').addEventListener('click', async ()=>{
      const ok = await App.confirm({
        title:'Delete account permanently?',
        message:'Your profile, all content and payment records will be deleted immediately and cannot be recovered.',
        confirmLabel:'Delete everything', danger:true
      });
      if(ok){
        App.store.deleteAccount(user.id);
        App.toast('Account deleted. Kwaheri — thank you for trying Andika.','success');
        location.hash = '#/';
      }
    });
  }

  /* ========================= SETTINGS ========================= */
  function renderSettings(view, user){
    const s = user.settings;
    const socials = App.store.getSocials(user.id) || {};
    const connectedCount = U.PLATFORMS.filter(p=>socials[p.id]&&socials[p.id].connected).length;

    function socialRow(p){
      const conn = socials[p.id] && socials[p.id].connected ? socials[p.id] : null;
      return `
        <div class="social-row" data-social="${p.id}">
          <span class="social-ico" style="background:${p.color}">
            <span style="width:20px;height:20px;display:inline-flex">${App.platformIcon(p.id)}</span></span>
          <div class="social-meta">
            <div class="social-name">${p.name}</div>
            ${conn
              ? `<div class="social-handle">${I.checkCircle} <span>${esc(conn.displayName)}</span></div>`
              : `<div class="social-handle off">Not connected</div>`}
          </div>
          ${conn
            ? `<div class="social-actions">
                 <button class="btn btn-ghost btn-sm" data-reconnect="${p.id}">Change</button>
                 <button class="btn btn-danger btn-sm" data-disconnect="${p.id}">Disconnect</button>
               </div>`
            : `<button class="btn btn-primary btn-sm" data-connect="${p.id}">${I.plus} Connect</button>`}
        </div>`;
    }

    view.innerHTML = `
      <div class="page-head"><div><h1>Settings</h1><p>Connect your social accounts and set your preferences.</p></div></div>

      <div class="chart-card" style="margin-bottom:20px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:6px">
          <div>
            <h3 style="margin-bottom:2px">Connected social accounts</h3>
            <div class="sub">Link a platform so Andika can publish your posts there. ${connectedCount} of ${U.PLATFORMS.length} connected.</div>
          </div>
          <span class="badge ${connectedCount===U.PLATFORMS.length?'published':connectedCount?'scheduled':'draft'}" style="align-self:center">
            ${connectedCount===U.PLATFORMS.length ? 'All connected' : connectedCount ? connectedCount+' connected' : 'None yet'}</span>
        </div>
        <div class="social-list">
          ${U.PLATFORMS.map(socialRow).join('')}
        </div>
        <div class="form-success" style="background:var(--info-soft);border-color:#a5d8e0;color:#0e4b5a;margin-top:16px;margin-bottom:0">
          <span style="flex:none;margin-top:2px">${I.users}</span>
          <span class="small">Andika only ever posts content <strong>you</strong> create and approve. Connecting an account
          lets the publisher deliver to it — we never read your DMs or post on your behalf automatically.</span>
        </div>
      </div>

      <div class="grid-2" style="grid-template-columns:1.1fr .9fr;align-items:start">
        <div class="chart-card">
          <h3>Content defaults</h3>
          <div class="sub">Used when you create new content</div>
          <form id="setForm">
            <div class="field"><label for="sPlat">Default platform</label>
              <select class="select" id="sPlat">
                ${U.PLATFORMS.map(p=>`<option value="${p.id}" ${s.defaultPlatform===p.id?'selected':''}>${p.name}</option>`).join('')}
              </select></div>
            <div class="field"><label for="sTone">Default caption tone</label>
              <select class="select" id="sTone">
                ${['Friendly & warm','Bold & hyped','Professional','Funny & relatable'].map(t=>
                  `<option ${s.defaultTone===t?'selected':''}>${t}</option>`).join('')}
              </select></div>
            <div class="field"><label for="sGoal">Weekly posting goal: <strong id="goalVal">${s.weeklyGoal} posts</strong></label>
              <input type="range" id="sGoal" min="1" max="14" value="${s.weeklyGoal}" style="width:100%;accent-color:var(--primary)"/></div>
            <div class="field"><label for="sDay">Planner reminder day</label>
              <select class="select" id="sDay">
                ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d=>
                  `<option ${s.plannerReminder===d?'selected':''}>${d}</option>`).join('')}
              </select></div>
            <button class="btn btn-primary" type="submit">${I.check} Save settings</button>
          </form>
        </div>
        <div class="chart-card">
          <h3>Notifications</h3>
          <div class="sub">Control what pings you</div>
          <div class="setting-row">
            <div><div class="sr-t">Weekly email digest</div><div class="sr-d">Summary of your reach and top posts every Monday.</div></div>
            <label class="toggle"><input type="checkbox" id="tDigest" ${s.emailDigest?'checked':''}/><span class="sl"></span></label>
          </div>
          <div class="setting-row">
            <div><div class="sr-t">Planner reminder</div><div class="sr-d">A nudge on <strong>${esc(s.plannerReminder)}</strong> to plan your week.</div></div>
            <label class="toggle"><input type="checkbox" id="tRemind" checked/><span class="sl"></span></label>
          </div>
          <div class="setting-row">
            <div><div class="sr-t">Product tips</div><div class="sr-d">Occasional tips for growing your biashara on social.</div></div>
            <label class="toggle"><input type="checkbox" id="tTips" checked/><span class="sl"></span></label>
          </div>
          <p class="small muted" style="margin-top:14px">Preferences are saved to your account on this device.</p>
        </div>
      </div>`;

    const rerender = ()=>renderSettings(view, App.store.currentUser());

    // connect / change
    view.querySelectorAll('[data-connect],[data-reconnect]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const platform = btn.dataset.connect || btn.dataset.reconnect;
        connectSocialFlow(App.store.currentUser(), platform, rerender);
      });
    });
    // disconnect
    view.querySelectorAll('[data-disconnect]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const platform = btn.dataset.disconnect;
        const p = U.platform(platform);
        const ok = await App.confirm({
          title:`Disconnect ${p.name}?`,
          message:`Andika will no longer be able to publish to your ${p.name} account. Your existing posts are kept. You can reconnect any time.`,
          confirmLabel:'Disconnect', danger:true
        });
        if(ok){
          App.store.disconnectSocial(user.id, platform);
          App.toast(`${p.name} disconnected.`,'success');
          rerender();
        }
      });
    });

    U.qs('#sGoal').addEventListener('input', e=>{ U.qs('#goalVal').textContent = e.target.value+' posts'; });
    U.qs('#setForm').addEventListener('submit', e=>{
      e.preventDefault();
      const f = e.currentTarget;
      App.store.updateUser({ id:user.id, settings: Object.assign({}, s, {
        defaultPlatform: f.querySelector('#sPlat').value,
        defaultTone: f.querySelector('#sTone').value,
        weeklyGoal: Number(f.querySelector('#sGoal').value),
        plannerReminder: f.querySelector('#sDay').value,
        emailDigest: U.qs('#tDigest').checked
      })});
      App.toast('Settings saved.','success');
    });
    U.qs('#tDigest').addEventListener('change', e=>{
      App.store.updateUser({ id:user.id, settings: Object.assign({}, s, { emailDigest: e.target.checked }) });
      App.toast(e.target.checked?'Email digest on.':'Email digest off.','success');
    });
  }
})();
