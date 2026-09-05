/* Andika — scheduler: automatically publishes scheduled posts when due.
   Runs on an interval while the app is open and a user is signed in. */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils;

  const TICK_MS = 15000;
  const inFlight = new Set();

  async function publishDueRecord(user, record){
    inFlight.add(record.id);
    try{
      const result = await App.social.publish({
        platform: record.platform, caption: record.caption, recordId: record.id
      }, function(){ /* silent background progress */ });
      App.store.updateRecord(record.id, user.id, {
        status:'published',
        publishedAt: result.publishedAt,
        externalId: result.externalId,
        stats: result.stats,
        scheduledFor: null
      });
      App.toast(`Scheduled post “${record.title}” was published to ${result.platformName}. ✅`, 'success');
      maybeRefresh();
    }catch(err){
      // leave scheduled so it retries on the next tick
      App.toast(`Scheduled post “${record.title}” could not be published — will retry.`, 'error');
    }finally{
      inFlight.delete(record.id);
    }
  }

  function maybeRefresh(){
    // refresh the dashboard view only (and not while a modal is open)
    if(document.querySelector('.modal-backdrop')) return;
    const route = App.router.current();
    if(route && route.key === 'dashboard'){ App.router.resolve(true); }
  }

  App.scheduler = {
    _timer: null,
    tick(){
      const user = App.store && App.store.currentUser();
      if(!user) return;
      if(user.plan !== 'pro') return; // scheduling is Pro-only
      const now = Date.now();
      App.store.listRecords(user.id).forEach(r=>{
        if(r.status !== 'scheduled' || !r.scheduledFor) return;
        if(inFlight.has(r.id)) return;
        if(new Date(r.scheduledFor).getTime() > now) return;
        if(!App.store.isConnected(user.id, r.platform)) return; // wait until connected
        publishDueRecord(user, r);
      });
    },
    start(){
      if(this._timer) return;
      // run shortly after boot, then on an interval
      setTimeout(()=>this.tick(), 2500);
      this._timer = setInterval(()=>this.tick(), TICK_MS);
    }
  };
})();
