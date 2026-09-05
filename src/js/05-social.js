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
   * Build the real destination for a platform.
   * whatsapp/instagram/tiktok use deep links that open the mobile app when
   * present, else the web profile; facebook uses the sharer; x uses intent.
   */
  function composerUrl(platform, handle, caption){
    const text = encodeURIComponent(caption);
    const h = (handle||'').replace(/^@+/,'');
    switch(platform){
      case 'whatsapp':
        // WhatsApp Business status composer isn't deep-linkable directly;
        // open the app to chat/status where the user pastes into Status.
        return U.normalizeKEPhone(h)
          ? 'https://wa.me/' + h.replace(/^0/,'254') + '?text=' + text
          : 'whatsapp://app';
      case 'x':
        return 'https://twitter.com/intent/tweet?text=' + text;
      case 'facebook':
        // sharer pre-fills text on the user's feed/page composer
        return 'https://www.facebook.com/dialog/share?app_id=ws_andika&display=popup&href=' +
               encodeURIComponent('https://andika.co.ke') + '&quote=' + text +
               (h ? '&hashtag=%23' + encodeURIComponent(h) : '');
      case 'instagram':
        // Instagram has no web caption API; open the app / profile to paste.
        return h ? 'https://www.instagram.com/' + encodeURIComponent(h) + '/' : 'https://www.instagram.com/';
      case 'tiktok':
        return h ? 'https://www.tiktok.com/@' + encodeURIComponent(h) : 'https://www.tiktok.com/upload';
      default:
        return '#';
    }
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
