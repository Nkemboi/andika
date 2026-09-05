/* Andika — shared UI components: icons, modal, toast, charts, helpers */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils;

  /* ---------------- Icons (24x24, currentColor) ---------------- */
  const I = App.icons = {
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
    checkCircle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>',
    sparkles:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-8M20 16v-3"/></svg>',
    file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
    trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/></svg>',
    logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
    user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>',
    settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    card:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    arrowRight:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    arrowLeft:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
    mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z"/></svg>',
    send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    rocket:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.8-.9.7-2.2-.2-3a2.1 2.1 0 0 0-2.8 0z"/><path d="M9 15l-3-3c.5-3.5 2.5-7.5 9-10 0 5.5-2.5 8.5-6 10v3z"/><circle cx="14.5" cy="9.5" r="1.5"/></svg>',
    target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>',
    users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M17.5 14.7c2.4.6 4 2.3 4 5.3"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6"/></svg>',
    // brand glyphs
    facebook:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3l.5-3.5H14V3.7c0-1 .3-1.7 1.8-1.7H17V.1C16.6.1 15.5 0 14.3 0 11.7 0 10 1.6 10 4.4V5.5H7V9h3v9h4V9z"/></svg>',
    instagram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
    whatsapp:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>',
    tiktok:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2 1.5 3.4 3.5 3.6v2.7c-1.2.1-2.4-.2-3.5-.8v5.9c0 3.3-2.4 5.6-5.4 5.6A5.4 5.4 0 0 1 5.7 14c0-3.2 2.6-5.6 5.9-5.3v2.8c-.4-.1-.7-.2-1.1-.2a2.7 2.7 0 0 0-2 4.6 2.7 2.7 0 0 0 4.5 1.4c.5-.6.7-1.3.7-2.2V3h2.8z"/></svg>',
    x:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3l-6.8 7.8L21.8 21h-6.1l-4.8-6.1L5.4 21h-3l7.3-8.3L2.4 3h6.2l4.3 5.6L17.5 3zm-1.1 16.2h1.7L7.8 4.7H6l10.4 14.5z"/></svg>',
    google:'<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.3h6.5c-.1 1.1-.8 2.7-2.3 3.8l-.1.7 2.9 2.2.2.1c2-1.8 3.1-4.5 3.1-7.6z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1 7.9-2.8l-3.5-2.7c-1 .7-2.3 1.1-4.4 1.1-3.3 0-6.2-2.2-7.2-5.2l-.7.1-3 2.3-.2.6C2.9 21.3 7.1 24 12 24z"/><path fill="#FBBC05" d="M4.8 14.4c-.3-.8-.5-1.7-.5-2.4s.2-1.7.5-2.4l-3.4-2.6C.3 8.6 0 10.2 0 12s.3 3.4 1.4 5l3.4-2.6z"/><path fill="#EA4335" d="M12 4.4c2.4 0 4 1 4.9 1.8l2.7-2.7C17.9 1.8 15.2 0 12 0 7.1 0 2.9 2.7 1.4 7l3.4 2.6c1-3 3.9-5.2 7.2-5.2z"/></svg>'
  };

  App.platformIcon = function(platform){
    const map = { facebook:'facebook', instagram:'instagram', whatsapp:'whatsapp', tiktok:'tiktok', x:'x' };
    return I[map[platform]] || I.file;
  };

  /* ---------------- Brand logo ---------------- */
  App.logo = function(size){
    const s = size || 34;
    const src = (App.assets && App.assets.mark) || '';
    return `<img class="brand-mark" src="${src}" width="${s}" height="${s}" alt="" aria-hidden="true"/>`;
  };
  // Full horizontal lockup (mark + wordmark + tagline)
  App.logoFull = function(width){
    const w = width || 150;
    const src = (App.assets && App.assets.logo) || '';
    return `<img class="brand-lockup" src="${src}" width="${w}" alt="Andika — your social storefront, simplified" style="height:auto;display:block"/>`;
  };

  App.platformBadge = function(id){
    const p = U.platform(id);
    return `<span class="plat-dot" style="background:${p.color}">${App.platformIcon(id)}</span>`;
  };

  /* ---------------- Toast ---------------- */
  App.toast = function(message, type){
    let wrap = U.qs('.toast-wrap');
    if(!wrap){ wrap = document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast ' + (type||'');
    const icon = type === 'success' ? I.checkCircle : type === 'error' ? I.alert : I.sparkles;
    t.innerHTML = `<span style="flex:none">${icon}</span><span>${U.esc(message)}</span>`;
    wrap.appendChild(t);
    setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateY(8px)'; t.style.transition='all .3s'; setTimeout(()=>t.remove(),320); }, 3800);
  };

  /* ---------------- Modal ---------------- */
  App.openModal = function({ title, body, footer, size, onClose }){
    const back = document.createElement('div');
    back.className = 'modal-backdrop';
    back.innerHTML = `<div class="modal ${size==='lg'?'modal-lg':''}" role="dialog" aria-modal="true" aria-label="${U.esc(title||'Dialog')}">
      <div class="modal-head"><h3>${U.esc(title||'')}</h3>
        <button class="modal-x" aria-label="Close dialog">${I.close}</button></div>
      <div class="modal-body"></div>
      ${footer ? '<div class="modal-foot"></div>' : ''}
    </div>`;
    const bodyEl = U.qs('.modal-body', back);
    if(typeof body === 'string') bodyEl.innerHTML = body;
    else if(body) bodyEl.appendChild(body);
    if(footer){
      const foot = U.qs('.modal-foot', back);
      if(typeof footer === 'string') foot.innerHTML = footer;
      else foot.appendChild(footer);
    }
    document.body.appendChild(back);
    document.body.style.overflow = 'hidden';

    function close(){
      back.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      onClose && onClose();
    }
    function onKey(e){ if(e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    back.addEventListener('mousedown', e=>{ if(e.target === back) close(); });
    U.qs('.modal-x', back).addEventListener('click', close);
    const closeBtn = U.qs('.modal [data-close-modal]', back);
    if(closeBtn) closeBtn.addEventListener('click', close);
    setTimeout(()=>{ const f = U.qs('input,button,textarea,select', bodyEl); f && f.focus && f.focus(); }, 80);
    return { close, el: back, bodyEl };
  };

  App.confirm = function({ title, message, confirmLabel, danger }){
    return new Promise(resolve=>{
      const foot = document.createElement('div');
      foot.style.display='flex'; foot.style.gap='10px'; foot.style.justifyContent='flex-end';
      const cancel = document.createElement('button');
      cancel.className='btn btn-ghost btn-sm'; cancel.textContent='Cancel';
      const ok = document.createElement('button');
      ok.className='btn btn-sm '+(danger?'btn-danger':'btn-primary');
      ok.textContent = confirmLabel || 'Confirm';
      foot.appendChild(cancel); foot.appendChild(ok);
      const modal = App.openModal({ title, body: `<p style="margin:0;color:var(--muted)">${U.esc(message)}</p>`, footer: foot });
      cancel.onclick = ()=>{ modal.close(); resolve(false); };
      ok.onclick = ()=>{ modal.close(); resolve(true); };
    });
  };

  /* ---------------- Form validation helpers ---------------- */
  App.setError = function(form, fieldName, message){
    const input = form.querySelector(`[name="${fieldName}"]`);
    const err = form.querySelector(`[data-error-for="${fieldName}"]`);
    if(input) input.classList.add('invalid');
    if(err){ err.textContent = message || ''; err.classList.toggle('show', !!message); }
  };
  App.clearErrors = function(form){
    U.qsa('.invalid', form).forEach(el=>el.classList.remove('invalid'));
    U.qsa('.error-msg.show', form).forEach(el=>{ el.classList.remove('show'); el.textContent=''; });
  };

  /* ---------------- Charts (inline SVG, no dependencies) ---------------- */
  App.charts = {
    // points: [{label, value}], returns svg markup
    line(points, opts){
      opts = opts || {};
      const W = 640, H = 220, pad = { l:44, r:16, t:18, b:30 };
      const vals = points.map(p=>p.value);
      const max = Math.max(1, ...vals) * 1.15;
      const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
      const x = i => pad.l + (points.length===1 ? iw/2 : i * iw/(points.length-1));
      const y = v => pad.t + ih - (v/max)*ih;
      const path = points.map((p,i)=>`${i?'L':'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
      const area = `${path} L${x(points.length-1).toFixed(1)},${pad.t+ih} L${x(0).toFixed(1)},${pad.t+ih} Z`;
      const grid = [0,.25,.5,.75,1].map(f=>{
        const gy = pad.t + ih - f*ih;
        return `<line x1="${pad.l}" y1="${gy}" x2="${W-pad.r}" y2="${gy}" stroke="#e3e8f0" stroke-width="1"/>
                <text x="${pad.l-8}" y="${gy+4}" text-anchor="end" font-size="10.5" fill="#6b7c93" font-family="Inter,sans-serif">${Math.round(f*max)}</text>`;
      }).join('');
      const dots = points.map((p,i)=>
        `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="3.5" fill="#fff" stroke="#2563eb" stroke-width="2"/>
         <text x="${x(i).toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="10.5" fill="#6b7c93" font-family="Inter,sans-serif">${U.esc(p.label)}</text>`).join('');
      return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${U.esc(opts.ariaLabel||'Trend chart')}" style="display:block">
        <defs><linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2563eb" stop-opacity=".22"/><stop offset="1" stop-color="#2563eb" stop-opacity="0"/>
        </linearGradient></defs>
        ${grid}
        <path d="${area}" fill="url(#areaG)"/>
        <path d="${path}" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${dots}
      </svg>`;
    },
    // data: [{label, value, color?}]
    bars(data){
      const max = Math.max(1, ...data.map(d=>d.value));
      return data.map(d=>`
        <div class="bar-row">
          <div class="bl">${d.icon?`<span class="plat-dot" style="background:${d.color||'#2563eb'};width:20px;height:20px">${d.icon}</span>`:''}${U.esc(d.label)}</div>
          <div class="bt"><i style="width:${(d.value/max*100).toFixed(1)}%;background:${d.grad?'' : (d.color?'var(--primary)':'')}"></i></div>
          <div class="bv">${U.fmtNum(d.value)}</div>
        </div>`).join('');
    },
    donut(slices){
      // slices: [{label, value, color}]
      const total = slices.reduce((a,s)=>a+s.value,0) || 1;
      const R = 54, C = 2*Math.PI*R;
      let offset = 0;
      const circs = slices.map(s=>{
        const len = s.value/total*C;
        const el = `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${s.color}" stroke-width="20"
          stroke-dasharray="${len.toFixed(1)} ${(C-len).toFixed(1)}" stroke-dashoffset="${(-offset).toFixed(1)}" transform="rotate(-90 70 70)"/>`;
        offset += len;
        return el;
      }).join('');
      return `<svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Status breakdown">
        <circle cx="70" cy="70" r="${R}" fill="none" stroke="#eef2f7" stroke-width="20"/>
        ${circs}
        <text x="70" y="66" text-anchor="middle" font-size="24" font-weight="800" fill="#0a2540" font-family="Plus Jakarta Sans,sans-serif">${total}</text>
        <text x="70" y="86" text-anchor="middle" font-size="11" fill="#6b7c93" font-family="Inter,sans-serif">posts</text>
      </svg>`;
    }
  };

  /* ---------------- Scroll reveal ---------------- */
  let revealObserver = null;
  App.observeReveals = function(root){
    if(!('IntersectionObserver' in window)){
      U.qsa('.reveal', root).forEach(el=>el.classList.add('visible'));
      return;
    }
    if(!revealObserver){
      revealObserver = new IntersectionObserver(entries=>{
        entries.forEach(en=>{
          if(en.isIntersecting){ en.target.classList.add('visible'); revealObserver.unobserve(en.target); }
        });
      }, { threshold:.12 });
    }
    U.qsa('.reveal:not(.visible)', root).forEach(el=>revealObserver.observe(el));
  };

  App.skeletonCard = function(h){ return `<div class="skeleton sk-block" style="height:${h||120}px"></div>`; };
  App.spinner = `<div class="spinner" role="status" aria-label="Loading"></div>`;

  App.emptyState = function({ icon, title, message, actionLabel, actionHref, onAction }){
    return `<div class="state">
      <div class="state-ico">${icon || I.file}</div>
      <h3>${U.esc(title)}</h3>
      <p>${U.esc(message||'')}</p>
      ${actionLabel ? `<a class="btn btn-primary" ${actionHref?`href="${actionHref}"`:'data-empty-action'}>${U.esc(actionLabel)}</a>` : ''}
    </div>`;
  };

  App.errorState = function(message, onRetryLabel){
    return `<div class="error-panel">
      ${I.alert}
      <h3 style="color:inherit;margin-bottom:6px">Something went wrong</h3>
      <p style="margin:0 0 14px">${U.esc(message||'We could not load this section. Please try again.')}</p>
      <button class="btn btn-light btn-sm" data-retry>${U.esc(onRetryLabel||'Try again')}</button>
    </div>`;
  };
})();
