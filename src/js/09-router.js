/* Andika — hash router with guards, SEO metadata, 404 handling */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils;

  // Each page: { key, path (exact) or pattern, render(ctx), auth?, chrome }
  const pages = App.pages = {};

  App.registerPage = function(def){ pages[def.key] = def; };

  function parseHash(){
    let raw = (location.hash || '').replace(/^#/, '') || '/';
    let qIndex = raw.indexOf('?');
    const path = qIndex < 0 ? raw : raw.slice(0, qIndex);
    const query = qIndex < 0 ? {} : U.qsParse(raw.slice(qIndex+1));
    return { path: path || '/', query, raw };
  }

  function setMeta(def){
    const title = def.title ? `${def.title} · Andika` : 'Andika — Content that sells for Kenyan small businesses';
    document.title = title;
    let tag = document.querySelector('meta[name="description"]');
    if(!tag){
      tag = document.createElement('meta'); tag.setAttribute('name','description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', def.description ||
      'Andika helps Kenyan small businesses create social media content and post to Facebook, Instagram, WhatsApp, TikTok and X — from one simple dashboard. Start free.');
  }

  let currentRoute = null;

  App.go = function(hash){ location.hash = hash; };

  App.router = {
    current: () => currentRoute,

    start(){
      window.addEventListener('hashchange', ()=>this.resolve(true));
      this.resolve(false);
    },

    resolve(navigated){
      const { path, query } = parseHash();

      // redirect bare dashboard
      if(path === '/dashboard' || path === '/dashboard/'){
        location.hash = '#/dashboard/overview'; return;
      }

      // match pages — the catch-all 404 is always evaluated last
      let def = null;
      for(const k in pages){
        if(k === 'notfound') continue;
        const p = pages[k];
        if(p.exact){ if(p.path === path){ def = p; break; } }
        else if(p.pattern && p.pattern.test(path)){ def = p; break; }
      }

      if(!def){
        def = pages['notfound'];
      }

      // auth guard
      if(def.auth && !App.store.currentUser()){
        const next = encodeURIComponent(path + (Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : ''));
        const signRoute = def.key === 'checkout' ? '/signup' : '/signin';
        location.hash = '#' + signRoute + '?next=' + next;
        return;
      }

      // signed-in users skip auth screens
      if((def.key === 'signin' || def.key === 'signup') && App.store.currentUser()){
        location.hash = '#/dashboard/overview'; return;
      }

      currentRoute = { key: def.key, path, query };
      setMeta(def);

      try{
        def.render({ path, query });
      }catch(err){
        console.error('Render error:', err);
        const app = U.qs('#app');
        app.innerHTML = `<main class="container" style="padding:80px 20px">
          <div class="error-panel">${App.icons.alert}
          <h3 style="color:inherit">The page failed to load</h3>
          <p>${U.esc(err && err.message || 'Unexpected error.')}</p>
          <a class="btn btn-primary" href="#/">Go home</a></div></main>`;
      }

      if(navigated){ window.scrollTo({ top:0, behavior:'instant' in window ? 'instant' : 'auto' }); }
      else window.scrollTo(0,0);
    }
  };
})();
