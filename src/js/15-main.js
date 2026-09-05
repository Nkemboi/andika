/* Andika — boot */
(function(){
  const App = window.App;
  function start(){
    App.router.start();
    if(App.scheduler) App.scheduler.start();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
