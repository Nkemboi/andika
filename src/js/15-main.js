/* Andika — boot */
(function(){
  const App = window.App;
  function start(){
    if(App.assets && App.assets.mark){
      let link = document.querySelector('link[rel="icon"]');
      if(link) link.setAttribute('href', App.assets.mark);
    }
    App.router.start();
    if(App.scheduler) App.scheduler.start();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
