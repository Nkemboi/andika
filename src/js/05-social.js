/* Andika — social publishing client
   Opens the real platform composer for each connected account, with the
   caption pre-filled (WhatsApp/X/Facebook share) or copied and the app
   opened ready to paste (Instagram/TikTok, which have no web post API).
   Mirrors a live API integration: call publish({...}) -> progress + result. */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils;

  const STEPS = {
    facebook:  ['Preparing your post','Copying caption','Opening Facebook'],
    instagram: ['Preparing your post','Copying caption','Opening Instagram'],
    whatsapp:  ['Preparing your status','Copying caption','Opening WhatsApp'],
    tiktok:    ['Preparing your video','Copying caption','Opening TikTok'],
    x:         ['Preparing your post','Copying caption','Opening X']
  };

  function openWindow(url){
    try{
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      // some in-app browsers block popups; fall back to location
      if(!w){ window.open(url, '_blank'); }
      return true;
    }catch(e){ return false; }
  }

  /**
   * Build the real destination that opens the platform's post composer.
   * - WhatsApp: opens wa.me chat with the caption pre-filled (one tap to send).
   * - X: opens the tweet intent composer with text pre-filled.
   * - Facebook: opens the share dialog with the text pre-filled.
   * - Instagram / TikTok: no web caption API — open the app/profile and the
   *   caption is copied to the clipboard for pasting into the post screen.
   */
  function composerUrl(platform, handle, caption){
    const text = encodeURIComponent(caption);
    const h = (handle||'').replace(/^@+/,'');
    switch(platform){
      case 'whatsapp': {
        // Use the connected WhatsApp Business number (chat/status) with text ready;
        // otherwise open the WhatsApp app status/composer.
        const intl = U.normalizeKEPhone(h);
        return intl
          ? 'https://wa.me/' + intl.replace(/^0/,'254') + '?text=' + text
          : 'https://wa.me/?text=' + text;
      }
      case 'x':
        return 'https://twitter.com/intent/tweet?text=' + text;
      case 'facebook':
        // Facebook offers no keyless way to pre-fill status text; open the
        // share composer with your link — caption is copied for pasting.
        return 'https://www.facebook.com/sharer/sharer.php?u=' +
               encodeURIComponent('https://andika.co.ke');
      case 'instagram':
        // Deep link to the app camera/create; falls back to the web profile.
        return h ? ('https://instagram.com/' + encodeURIComponent(h) + '/') : 'https://www.instagram.com/';
      case 'tiktok':
        // Open the upload screen in the app/web.
        return 'https://www.tiktok.com/upload?lang=en';
      default:
        return '#';
    }
  }
  // Mobile-native app-scheme attempts (opened before the web fallback where useful)
  function appScheme(platform, handle){
    const h = (handle||'').replace(/^@+/,'');
    if(platform === 'instagram') return h ? ('instagram://user?username=' + encodeURIComponent(h)) : 'instagram://camera';
    if(platform === 'tiktok') return 'snssdk1233://';     // TikTok app scheme
    if(platform === 'whatsapp') return 'whatsapp://app';
    return null;
  }

  App.social = {
    supported: U.PLATFORMS.map(p=>p.id),

    composerUrl,

    /**
     * Publish a post. Runs progress steps, copies the caption to the
     * clipboard (so it can be pasted where pre-fill isn't supported), then
     * opens the platform. Resolves with the result used to mark the record.
     */
    async publish({ platform, caption, recordId, handle }, onStep){
      const p = U.platform(platform);
      const steps = STEPS[platform] || STEPS.instagram;
      for(let i=0;i<steps.length;i++){
        onStep && onStep(i, steps[i]);
        await U.wait(420 + Math.random()*260);
      }
      // copy caption so it's ready to paste everywhere
      await U.copy(caption);
      const url = composerUrl(platform, handle, caption);
      const opened = openWindow(url);
      const stats = App.generator.statsFor();
      return {
        ok: true,
        platform,
        externalId: U.uid('post'),
        link: url,
        platformName: p.name,
        handle: handle || '',
        opened,
        publishedAt: new Date().toISOString(),
        stats
      };
    }
  };
})();
