/* Andika — public chrome: top navigation + footer */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils, I = App.icons;

  const NAV_LINKS = [
    { href:'#/', key:'home', label:'Home' },
    { href:'#/features', key:'features', label:'Features' },
    { href:'#/pricing', key:'pricing', label:'Pricing' },
    { href:'#/recommend', key:'recommend', label:'Recommend' },
    { href:'#/contact', key:'contact', label:'Contact' }
  ];

  App.renderPublicChrome = function(activeKey){
    const user = App.store.currentUser();
    const app = U.qs('#app');
    app.innerHTML = `
      <header class="nav">
        <div class="nav-inner">
          <a class="brand" href="#/" aria-label="Andika home">${App.logo(34)}Andika</a>
          <nav class="nav-links" aria-label="Primary">
            ${NAV_LINKS.map(l=>`<a href="${l.href}" class="${l.key===activeKey?'active':''}">${l.label}</a>`).join('')}
          </nav>
          <div class="nav-cta">
            ${user ? `
              <a class="btn btn-ghost btn-sm btn-desktop" href="#/dashboard/overview">Dashboard</a>
              <button class="avatar-chip" id="avatarChip" aria-haspopup="menu" aria-expanded="false">
                <span class="av">${U.esc(U.initials(user.name||user.email))}</span>
                <span class="d-none-mobile">${U.esc((user.name||user.email).split(' ')[0])}</span>
              </button>` : `
              <a class="btn btn-link btn-desktop" href="#/signin" style="min-height:44px">Sign in</a>
              <a class="btn btn-primary btn-sm" href="#/signup">Start free</a>`}
          </div>
          <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">${I.menu}</button>
        </div>
        <div class="mobile-menu" id="mobileMenu">
          ${NAV_LINKS.map(l=>`<a href="${l.href}" class="${l.key===activeKey?'active':''}">${l.label}</a>`).join('')}
          ${user
            ? `<a href="#/dashboard/overview">Dashboard</a><a href="#" id="mmSignout">Sign out</a>`
            : `<a href="#/signin">Sign in</a>
               <a class="btn btn-primary mm-cta" href="#/signup">Start free — it's Ksh 0</a>`}
        </div>
      </header>
      <main id="view" tabindex="-1"></main>
      ${App.footerHTML()}
      <div class="toast-wrap"></div>`;

    U.qs('#navToggle').addEventListener('click', ()=>{
      const m = U.qs('#mobileMenu');
      const open = m.classList.toggle('open');
      U.qs('#navToggle').setAttribute('aria-expanded', open);
    });
    U.qsa('#mobileMenu a').forEach(a=>a.addEventListener('click', ()=>{
      U.qs('#mobileMenu').classList.remove('open');
    }));

    const mmSignout = U.qs('#mmSignout');
    if(mmSignout) mmSignout.addEventListener('click', e=>{ e.preventDefault(); App.signOutFlow(); });

    const chip = U.qs('#avatarChip');
    if(chip){
      chip.addEventListener('click', e=>{
        e.stopPropagation();
        const existing = U.qs('#avatarMenu');
        if(existing){ existing.remove(); return; }
        const menu = document.createElement('div');
        menu.id = 'avatarMenu';
        menu.setAttribute('role','menu');
        menu.style.cssText = 'position:absolute;top:60px;right:24px;background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-lg);padding:6px;z-index:90;min-width:190px;animation:popIn .18s ease';
        menu.innerHTML = `
          <a href="#/dashboard/overview" role="menuitem" style="display:flex;gap:9px;align-items:center;padding:10px 12px;border-radius:8px;font-weight:700;font-family:var(--font-display);color:var(--text);font-size:14px">${I.grid} Dashboard</a>
          <a href="#/dashboard/account" role="menuitem" style="display:flex;gap:9px;align-items:center;padding:10px 12px;border-radius:8px;font-weight:700;font-family:var(--font-display);color:var(--text);font-size:14px">${I.user} Account</a>
          <a href="#" role="menuitem" id="topSignout" style="display:flex;gap:9px;align-items:center;padding:10px 12px;border-radius:8px;font-weight:700;font-family:var(--font-display);color:var(--danger);font-size:14px">${I.logout} Sign out</a>`;
        document.body.appendChild(menu);
        U.qs('#topSignout', menu).addEventListener('click', ev=>{ ev.preventDefault(); menu.remove(); App.signOutFlow(); });
        setTimeout(()=>document.addEventListener('click', function close(){ menu.remove(); document.removeEventListener('click', close); }), 0);
      });
    }
    return U.qs('#view');
  };

  App.signOutFlow = function(){
    App.store.signout();
    App.toast('You have been signed out. Karibu tena! 👋', 'success');
    location.hash = '#/';
  };

  App.footerHTML = function(){
    const year = new Date().getFullYear();
    return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="brand" href="#/">${App.logo(30)}<span style="color:#fff">Andika</span></a>
            <p class="footer-tag" style="margin-top:14px">
              Content that sells, built for Kenyan small businesses. Create captions, post to Facebook,
              Instagram, WhatsApp, TikTok and X — all from one dashboard.
            </p>
            <p class="footer-tag" style="opacity:.75">Westlands Centre, Westlands Road<br/>Nairobi, Kenya<br/>+254 700 094 254</p>
          </div>
          <div>
            <h5>Product</h5>
            <ul>
              <li><a href="#/features">Features</a></li>
              <li><a href="#/pricing">Pricing</a></li>
              <li><a href="#/recommend">Recommend a plan</a></li>
              <li><a href="#/signup">Create free account</a></li>
            </ul>
          </div>
          <div>
            <h5>Account</h5>
            <ul>
              <li><a href="#/signin">Sign in</a></li>
              <li><a href="#/signup">Sign up</a></li>
              <li><a href="#/dashboard/overview">Dashboard</a></li>
              <li><a href="#/dashboard/billing">Billing</a></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><a href="#/contact">Contact us</a></li>
              <li><a href="#/contact">Support</a></li>
              <li><a href="#/terms">Terms of service</a></li>
              <li><a href="#/privacy">Privacy policy</a></li>
            </ul>
          </div>
          <div>
            <h5>Legal</h5>
            <ul>
              <li><a href="#/terms">Terms of service</a></li>
              <li><a href="#/privacy">Privacy policy</a></li>
              <li><a href="#/pricing">Plans &amp; billing</a></li>
              <li><a href="#/contact">Report an issue</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${year} Andika Ltd. Made in Nairobi for biashara za Kenya. 🇰🇪</span>
          <span>Payments secured by PayBridge · M-PESA ready</span>
        </div>
      </div>
    </footer>`;
  };
})();
