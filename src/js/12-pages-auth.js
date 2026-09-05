/* Andika — authentication pages: sign up, sign in, Google chooser */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils, I = App.icons;
  const esc = U.esc;

  function afterAuth(query){
    let next = query && query.next;
    if(next && next.charAt(0) === '/' && !next.startsWith('//')){
      location.hash = '#' + next;
    } else {
      location.hash = '#/dashboard/overview';
    }
  }

  function authShell(card, subtitle){
    return `
      <section class="auth-shell">
        <div class="container">
          <div class="form-wrap route-enter">
            <div class="form-success" style="background:var(--primary-tint);border-color:#c7d8fe;color:var(--primary-darker)">
              <span style="flex:none;margin-top:2px">${I.sparkles}</span>
              <span><strong>${subtitle || 'Welcome to Andika'}</strong><br/>
              <span class="small">Content that sells — built for Kenyan biashara.</span></span>
            </div>
            <div class="card form-card">${card}</div>
            <p class="center small muted" style="margin-top:var(--s-4)">
              🔒 Your data stays private to your account and is stored securely in this browser session.</p>
          </div>
        </div>
      </section>`;
  }

  /* ---------- Google sign-in (built-in demo authorization) ---------- */
  function openGoogle(query){
    const accounts = [
      { name:'Wanjiku Kamau', email:'wanjiku.glow@gmail.com' },
      { name:'Brian Otieno',  email:'brian.tamasha@gmail.com' }
    ];
    const body = document.createElement('div');
    body.style.padding = '0';
    body.innerHTML = `
      <div class="g-head">
        <div class="g-logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div>
        <p style="margin:6px 0 0;font-size:14px">Sign in to Andika with Google</p>
        <p class="small muted" style="margin:4px 0 0">Choose an account to continue</p>
      </div>
      <div id="gList">
        ${accounts.map((a,i)=>`
          <button class="g-acc" data-i="${i}">
            <span class="g-av" style="background:${i?'#0ea5e9':'#f97316'}">${esc(U.initials(a.name))}</span>
            <span><span class="g-n">${esc(a.name)}</span><br/><span class="g-e">${esc(a.email)}</span></span>
          </button>`).join('')}
        <button class="g-acc" id="gAdd">
          <span class="g-av" style="background:#64748b">${I.user}</span>
          <span><span class="g-n">Use another account</span><br/><span class="g-e">Enter a different Gmail address</span></span>
        </button>
      </div>
      <div class="g-foot">Andika only receives your name and email — never your password. This is a secure demo authorization.</div>`;

    const modal = App.openModal({ title:'Sign in with Google', body, size:'lg' });
    modal.el.querySelector('.modal-head').style.display='none';

    function complete(profile){
      try{
        App.store.googleSignin(profile);
        modal.close();
        App.toast(`Karibu, ${profile.name.split(' ')[0]}! 🎉`, 'success');
        afterAuth(query);
      }catch(err){
        App.toast(err.message || 'Google sign-in failed', 'error');
      }
    }
    body.querySelectorAll('.g-acc[data-i]').forEach(btn=>{
      btn.addEventListener('click', ()=> complete(accounts[Number(btn.dataset.i)]));
    });
    body.querySelector('#gAdd').addEventListener('click', ()=>{
      body.querySelector('#gList').innerHTML = `
        <div style="padding:20px 24px">
          <div class="field"><label for="gName">Full name</label>
            <input class="input" id="gName" placeholder="Jane Doe" autocomplete="name"/></div>
          <div class="field"><label for="gEmail">Gmail address</label>
            <input class="input" id="gEmail" type="email" placeholder="jane.doe@gmail.com" autocomplete="email"/>
            <div class="error-msg" id="gErr">${I.alert}<span></span></div></div>
          <button class="btn btn-primary btn-block" id="gContinue">Continue</button>
          <p class="small muted center" style="margin:12px 0 0">Demo: no real Google credentials are requested.</p>
        </div>`;
      body.querySelector('#gContinue').addEventListener('click', ()=>{
        const name = body.querySelector('#gName').value.trim();
        const email = body.querySelector('#gEmail').value.trim().toLowerCase();
        const errEl = body.querySelector('#gErr');
        if(!U.isValidEmail(email) || !/gmail\.com$/.test(email)){
          errEl.querySelector('span').textContent = 'Enter a valid gmail.com address.';
          errEl.classList.add('show'); return;
        }
        if(name.length < 2){
          errEl.querySelector('span').textContent = 'Enter your full name.';
          errEl.classList.add('show'); return;
        }
        complete({ name, email });
      });
    });
  }

  /* ================= SIGN UP ================= */
  App.registerPage({
    key:'signup', exact:true, path:'/signup',
    title:'Sign up — free',
    description:'Create your free Andika account with email or Google. Generate captions in English, Kiswahili and Sheng and post to Facebook, Instagram, WhatsApp, TikTok and X.',
    render({ query }){
      const view = App.renderPublicChrome(null);
      view.innerHTML = authShell(`
        <h2 style="font-size:26px;margin-bottom:6px">Create your free account</h2>
        <p class="muted small" style="margin-bottom:var(--s-5)">Start in under a minute — no card required.</p>

        <button class="btn btn-google btn-block" id="googleBtn">${I.google} Continue with Google</button>
        <div class="divider-or">or sign up with email</div>

        <form id="signupForm" novalidate>
          <div class="field">
            <label for="suName">Full name *</label>
            <input class="input" id="suName" name="name" type="text" autocomplete="name" placeholder="e.g. Wanjiku Kamau"/>
            <div class="error-msg" data-error-for="name">${I.alert}<span></span></div>
          </div>
          <div class="field">
            <label for="suEmail">Email address *</label>
            <input class="input" id="suEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com"/>
            <div class="error-msg" data-error-for="email">${I.alert}<span></span></div>
          </div>
          <div class="field">
            <label for="suPassword">Password *</label>
            <input class="input" id="suPassword" name="password" type="password" autocomplete="new-password" placeholder="At least 8 characters"/>
            <div class="hint">Use 8+ characters with a mix of letters and numbers.</div>
            <div class="error-msg" data-error-for="password">${I.alert}<span></span></div>
          </div>
          <div class="field">
            <label class="checkbox-row">
              <input type="checkbox" id="suTerms" name="terms"/>
              <span class="lbl">I accept the <a href="#/terms" target="_blank" rel="noopener">Terms of Service</a> and
              <a href="#/privacy" target="_blank" rel="noopener">Privacy Policy</a>, and I am 18 or older. *</span>
            </label>
            <div class="error-msg" data-error-for="terms" style="margin-left:28px">${I.alert}<span>You must accept the Terms and Privacy Policy to continue.</span></div>
          </div>
          <button class="btn btn-primary btn-lg btn-block" type="submit" style="margin-top:8px">Create free account ${I.arrowRight}</button>
        </form>
        <p class="center small" style="margin:var(--s-5) 0 0">Already have an account? <a href="#/signin${query&&query.next?'?next='+encodeURIComponent(query.next):''}"><strong>Sign in</strong></a></p>
      `, 'Create free content for your biashara');

      const form = view.querySelector('#signupForm');
      view.querySelector('#googleBtn').addEventListener('click', ()=>openGoogle(query));

      form.addEventListener('submit', e=>{
        e.preventDefault();
        App.clearErrors(form);
        const field = n => form.querySelector('[name="'+n+'"]');
        const name = field('name').value.trim();
        const email = field('email').value.trim();
        const password = field('password').value;
        let ok = true;
        if(name.length < 2){ App.setError(form,'name','Please enter your full name.'); ok=false; }
        if(!U.isValidEmail(email)){ App.setError(form,'email','Enter a valid email address, e.g. you@example.com.'); ok=false; }
        if(password.length < 8){ App.setError(form,'password','Password must be at least 8 characters.'); ok=false; }
        if(!form.elements.terms.checked){ App.setError(form,'terms',''); form.querySelector('[data-error-for="terms"]').classList.add('show'); ok=false; }
        if(!ok) return;
        try{
          const user = App.store.signup({ name, email, password });
          App.toast(`Account created — karibu, ${user.name.split(' ')[0]}! 🎉`, 'success');
          afterAuth(query);
        }catch(err){
          if(err.field){
            App.setError(form, err.field, err.message);
          } else {
            App.toast(err.message || 'Sign up failed. Please try again.', 'error');
          }
        }
      });
    }
  });

  /* ================= SIGN IN ================= */
  App.registerPage({
    key:'signin', exact:true, path:'/signin',
    title:'Sign in',
    description:'Sign in to your Andika dashboard to create content, schedule posts and track analytics for your Kenyan business.',
    render({ query }){
      const view = App.renderPublicChrome(null);
      view.innerHTML = authShell(`
        <h2 style="font-size:26px;margin-bottom:6px">Welcome back 👋</h2>
        <p class="muted small" style="margin-bottom:var(--s-5)">Sign in to your Andika dashboard.</p>

        <button class="btn btn-google btn-block" id="googleBtn">${I.google} Continue with Google</button>
        <div class="divider-or">or sign in with email</div>

        <div class="form-error-banner" id="signinBanner" style="display:none">
          <strong>Could not sign you in.</strong> <span id="signinBannerMsg"></span>
        </div>

        <form id="signinForm" novalidate>
          <div class="field">
            <label for="siEmail">Email address *</label>
            <input class="input" id="siEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com"/>
            <div class="error-msg" data-error-for="email">${I.alert}<span></span></div>
          </div>
          <div class="field">
            <label for="siPassword">Password *</label>
            <input class="input" id="siPassword" name="password" type="password" autocomplete="current-password" placeholder="Your password"/>
            <div class="error-msg" data-error-for="password">${I.alert}<span></span></div>
          </div>
          <button class="btn btn-primary btn-lg btn-block" type="submit" style="margin-top:8px">Sign in ${I.arrowRight}</button>
        </form>
        <p class="center small" style="margin:var(--s-5) 0 0">New to Andika? <a href="#/signup${query&&query.next?'?next='+encodeURIComponent(query.next):''}"><strong>Create a free account</strong></a></p>
      `, 'Good to see you tena');

      const form = view.querySelector('#signinForm');
      view.querySelector('#googleBtn').addEventListener('click', ()=>openGoogle(query));

      form.addEventListener('submit', e=>{
        e.preventDefault();
        App.clearErrors(form);
        const banner = view.querySelector('#signinBanner');
        banner.style.display = 'none';
        const field = n => form.querySelector('[name="'+n+'"]');
        const email = field('email').value.trim();
        const password = field('password').value;
        let ok = true;
        if(!U.isValidEmail(email)){ App.setError(form,'email','Enter a valid email address.'); ok=false; }
        if(password.length < 1){ App.setError(form,'password','Enter your password.'); ok=false; }
        if(!ok) return;
        try{
          const user = App.store.signin({ email, password });
          App.toast(`Karibu tena, ${user.name.split(' ')[0]}!`, 'success');
          afterAuth(query);
        }catch(err){
          if(err.field === 'password'){
            view.querySelector('#signinBannerMsg').textContent = ' ' + (err.message);
            banner.style.display = 'flex';
          } else {
            App.toast(err.message || 'Sign in failed.', 'error');
          }
        }
      });
    }
  });
})();
