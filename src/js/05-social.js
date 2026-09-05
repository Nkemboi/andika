/* Andika — social publishing client (built-in simulation)
   Same shape as a live integration client: publish({...}) -> result.
   Steps are surfaced to the UI via onStep so users see real progress. */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils;

  const STEPS = {
    facebook:  ['Connecting to Facebook Page','Checking page permissions','Uploading post','Publishing to feed'],
    instagram: ['Connecting Instagram Business account','Preparing caption & hashtags','Uploading media','Sharing to feed'],
    whatsapp:  ['Opening WhatsApp Business','Formatting status update','Attaching media','Posting to Status'],
    tiktok:    ['Connecting TikTok account','Rendering vertical video','Uploading to TikTok','Setting caption & visibility'],
    x:         ['Connecting X account','Trimming post to 280 characters','Attaching media','Posting to timeline']
  };

  App.social = {
    supported: U.PLATFORMS.map(p=>p.id),

    async publish({ platform, caption, recordId }, onStep){
      if(!STEPS[platform]) throw new Error('Unsupported platform.');
      const steps = STEPS[platform];
      for(let i=0;i<steps.length;i++){
        onStep && onStep(i, steps[i]);
        await U.wait(650 + Math.random()*500);
      }
      const p = U.platform(platform);
      return {
        ok: true,
        platform,
        externalId: U.uid('post'),
        link: `https://${platform}.com/andika-business/posts/${recordId || 'demo'}`,
        platformName: p.name,
        publishedAt: new Date().toISOString(),
        stats: App.generator.statsFor()
      };
    }
  };
})();
