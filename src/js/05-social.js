/* Andika — social publishing client
   Hands the post off to the REAL platform composer, addressed to the
   connected account. The composer window/app must be launched synchronously
   inside the user's click gesture — browsers block window.open called after
   awaits — so launch happens first; progress animation runs after.
   - WhatsApp: chat picker opens with the message pre-filled (tap to send).
   - X (Twitter): intent composer opens with the tweet pre-filled (tap Post).
   - Facebook: feed dialog with the caption pre-filled when a Facebook App ID
     is configured (window.FB_APP_ID); otherwise the share dialog opens and
     the caption is copied for pasting.
   - Instagram / TikTok: no keyless web post API — on mobile the native app
     opens straight to create/camera; on desktop the web composer opens. The
     caption is copied so it can be pasted into the post. */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils;

  const STEPS = {
    facebook:  ['Opening Facebook','Caption ready to paste','Finalising'],
    instagram: ['Opening Instagram','Caption copied — paste it','Finalising'],
    whatsapp:  ['Opening WhatsApp','Message pre-filled','Finalising'],
    tiktok:    ['Opening TikTok','Caption copied — paste it','Finalising'],
    x:         ['Opening X','Post pre-filled','Finalising']
  };

  function isMobile(){
    const ua = (navigator.userAgent || '').toLowerCase();
    return /android|iphone|ipad|ipod|mobile/i.test(ua);
  }

  /** Real destination that opens the platform's post composer. */
  function composerUrl(platform, handle, caption){
    const text = encodeURIComponent(caption || '');
    const h = (handle||'').replace(/^@+/,'');
    switch(platform){
      case 'whatsapp': {
        // wa.me with no number opens the chat picker with the message ready;
        // if the connected handle is the business's own number, a pre-filled
        // self-chat would be wrong, so the picker is always the right target.
        return 'https://wa.me/?text=' + text;
      }
      case 'x':
        return 'https://x.com/intent/post?text=' + text;
      case 'facebook': {
        const appId = window.FB_APP_ID || '';
        if(appId){
          // Feed dialog with the caption pre-filled (one tap to share).
          return 'https://www.facebook.com/dialog/feed?app_id=' + encodeURIComponent(appId) +
                 '&display=popup&caption=' + text +
                 '&redirect_uri=' + encodeURIComponent('https://www.facebook.com/dialog/return/close');
        }
        // No app id: Facebook offers no keyless caption pre-fill — open the
        // share composer; caption is copied for pasting into the post.
        return 'https://www.facebook.com/sharer/sharer.php?u=' +
               encodeURIComponent('https://andika.co.ke');
      }
      case 'instagram':
        // Desktop: open the web create flow (login if needed); mobile uses
        // the app scheme in launchComposer.
        return h ? ('https://www.instagram.com/' + encodeURIComponent(h) + '/') : 'https://www.instagram.com/';
      case 'tiktok':
        return 'https://www.tiktok.com/upload?lang=en';
      default:
        return '#';
    }
  }

  /** Mobile-native app scheme that opens the platform straight to posting. */
  function appScheme(platform, handle){
    const h = (handle||'').replace(/^@+/,'');
    if(platform === 'instagram') return 'instagram://camera';                 // straight to create
    if(platform === 'tiktok')    return 'snssdk1233://upload?scene=direct_shoot';
    if(platform === 'whatsapp')  return 'whatsapp://send?text=' + encodeURIComponent('');
    if(platform === 'x')         return 'twitter://post?message=';           // filled below by caller
    if(platform === 'facebook')  return 'fb://publish/profile/me?text=';
    return null;
  }

  /**
   * Launch the composer SYNCHRONOUSLY (must run inside the click task).
   * Tries the mobile app scheme on phones, then the web composer.
   * Returns { opened, url, scheme } where opened=false means the popup was
   * blocked (the UI then shows a "tap to open" button).
   */
  function launchComposer(platform, handle, caption){
    const webUrl = composerUrl(platform, handle, caption);
    let scheme = null;
    if(isMobile()){
      scheme = appScheme(platform, handle);
      if(platform === 'whatsapp') scheme = 'whatsapp://send?text=' + encodeURIComponent(caption || '');
      if(platform === 'x')        scheme = 'twitter://post?message=' + encodeURIComponent(caption || '');
      if(platform === 'facebook') scheme = 'fb://publish/profile/me?text=' + encodeURIComponent(caption || '');
      if(platform === 'tiktok')   scheme = 'snssdk1233://upload';
    }
    let opened = false;
    // On mobile, navigating to the app scheme launches the installed app and
    // the platform's universal link falls back to the web composer if the
    // app is missing. We try location assignment for schemes, window.open
    // for web URLs so the Andika tab stays in place on desktop.
    if(scheme){
      try{
        // window.open with the scheme keeps the current page intact if the
        // app is absent (universal link fallback happens at OS level).
        const w1 = window.open(scheme, '_blank');
        opened = !!w1;
        // Safety net: also expose the web URL — if the app didn't come to
        // the foreground, the in-modal "Open again" button uses it.
      }catch(e){ opened = false; }
    }
    if(!scheme || !opened){
      try{
        const w = window.open(webUrl, '_blank', 'noopener');
        if(!w){
          // Retry without features; some in-app browsers allow this.
          const w2 = window.open(webUrl, '_blank');
          opened = !!w2;
        }else{
          opened = true;
        }
      }catch(e){ opened = false; }
    }
    return { opened, url: webUrl, scheme, mobile: isMobile() };
  }

  App.social = {
    supported: U.PLATFORMS.map(p=>p.id),
    composerUrl,
    appScheme,
    launchComposer,

    /**
     * Publish a post. The composer is launched synchronously when this is
     * called (call it directly from the click handler), then progress steps
     * run and the caption is copied for platforms without pre-fill.
     */
    async publish({ platform, caption, recordId, handle }, onStep){
      const p = U.platform(platform);
      const steps = STEPS[platform] || STEPS.instagram;

      // 1) Launch the real composer FIRST, while we still have the click
      //    gesture — anything after an await risks popup-blocking.
      const launch = launchComposer(platform, handle, caption);

      // 2) Copy the caption (best-effort) so paste-only platforms are ready.
      let copied = false;
      try{ copied = await U.copy(caption); }catch(e){ copied = false; }

      // 3) Progress animation (window is already opening/loaded).
      for(let i=0;i<steps.length;i++){
        onStep && onStep(i, steps[i]);
        await U.wait(320);
      }

      const stats = App.generator.statsFor();
      return {
        ok: true,
        platform,
        externalId: U.uid('post'),
        link: launch.url,
        scheme: launch.scheme,
        platformName: p.name,
        handle: handle || '',
        opened: launch.opened,
        blocked: !launch.opened,
        mobile: launch.mobile,
        copied,
        publishedAt: new Date().toISOString(),
        stats
      };
    }
  };
})();
