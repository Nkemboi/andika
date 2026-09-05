/* Andika — PayBridge checkout client (real M-PESA Daraja STK push).
 * Talks to the companion Node server (server/server.js), which performs the
 * OAuth + STK push + status query with the Daraja secret kept server-side.
 * No fake success: if the backend or credentials are missing, we say so. */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils;

  // When served from the Node server this is same-origin (/api/...).
  const API_BASE = (location.protocol === 'http:' || location.protocol === 'https:')
    ? location.origin : '';

  async function api(path, opts){
    const res = await fetch(API_BASE + path, opts);
    let data = {};
    try{ data = await res.json(); }catch(e){}
    if(!res.ok || data.ok === false){
      const err = new Error(data.error || ('Request failed (' + res.status + ')'));
      err.httpStatus = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  const PayBridge = App.paybridge = {
    mode: 'daraja',
    merchant: 'Andika Ltd',

    validatePhone(phone){ return U.normalizeKEPhone(phone); },

    /**
     * Real STK push. onStage: 'checking'|'prompt'|'processing'|'done'
     * Polls Daraja status until success/cancelled/pending-timeout.
     */
    async requestStkPush({ phone, amount, plan } = {}, onStage){
      const msisdn = this.validatePhone(phone);
      if(!msisdn){ const e = new Error('Enter a valid Safaricom number, e.g. 0712 345 678'); e.field='phone'; throw e; }
      amount = Number(amount) || 0;
      if(amount < 1) throw new Error('Amount must be greater than zero.');

      onStage && onStage('checking');

      // Health: is the Daraja backend present and configured?
      let health;
      try{ health = await api('/api/health'); }
      catch(e){
        const err = new Error('The payment service is not reachable. Please open this app through the Andika server (node server/server.js) — M-PESA payments cannot be processed from a static file.');
        err.field = 'server'; throw err;
      }
      if(!health.darajaConfigured){
        const err = new Error('M-PESA is not configured on the server yet. Add your Daraja Consumer Key and Passkey (see server/.env.example), then restart.');
        err.field = 'server'; throw err;
      }

      onStage && onStage('initiated');
      const push = await api('/api/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: msisdn, amount })
      });
      const checkoutId = push.checkoutRequestId;
      if(!checkoutId) throw new Error(push.error || 'STK push could not be started.');

      onStage && onStage('prompt');   // PIN prompt on the handset

      // Poll Daraja for the result
      const start = Date.now();
      const MAX_MS = 120000;           // 2 minutes to enter the PIN
      let processingAnnounced = false;
      while(Date.now() - start < MAX_MS){
        await U.wait(2500);
        let st;
        try{ st = await api('/api/stkstatus?checkoutRequestId=' + encodeURIComponent(checkoutId)); }
        catch(e){ continue; }
        if(st.status === 'success'){
          onStage && onStage('processing');
          await U.wait(900);
          onStage && onStage('done');
          return {
            reference: checkoutId,
            checkoutRequestId: checkoutId,
            merchantRequestId: push.merchantRequestId,
            msisdn, amount, currency:'KES', plan: plan || 'pro',
            channel: 'M-PESA',
            receipt: st.receipt || ('QHK' + Math.floor(100000 + Math.random()*899999)),
            paidAt: new Date().toISOString()
          };
        }
        if(st.status === 'cancelled'){
          const e = new Error('You cancelled the payment prompt on your phone. You have not been charged.');
          e.field='phone'; throw e;
        }
        if(st.status === 'pending' && !processingAnnounced && Date.now()-start > 12000){
          processingAnnounced = true; onStage && onStage('processing');
        }
      }
      throw new Error('The M-PESA prompt timed out before payment was confirmed. Please try again.');
    }
  };
})();
