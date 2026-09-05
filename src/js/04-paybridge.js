/* Andika — PayBridge checkout client
   Built-in checkout endpoint simulation (M-Pesa STK-push style).
   No external key required. To go live, replace `requestStkPush`
   with a fetch() to your PayBridge endpoint URL and keep the same
   promise contract: resolve({reference}) on success, reject(Error) on failure. */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils;

  // const PAYBRIDGE_ENDPOINT = 'https://checkout.paybridge.ke/v1/stk'; // live example
  const PAYBRIDGE_MERCHANT = 'ANDIKA LTD';

  const PayBridge = App.paybridge = {
    merchant: PAYBRIDGE_MERCHANT,

    validatePhone(phone){
      return U.normalizeKEPhone(phone);
    },

    /**
     * Initiate an STK push. Returns a promise that resolves with a payment
     * receipt after the simulated push is "accepted" on the handset.
     * onStage(stage) callbacks: 'initiated' | 'prompt' | 'processing' | 'done'
     */
    async requestStkPush({ phone, amount, plan } = {}, onStage){
      const msisdn = this.validatePhone(phone);
      if(!msisdn){
        const e = new Error('Enter a valid Safaricom number, e.g. 0712 345 678');
        e.field = 'phone'; throw e;
      }
      amount = Number(amount) || 0;
      if(amount < 1) throw new Error('Amount must be greater than zero.');

      onStage && onStage('initiated');
      await U.wait(900);   // contact PayBridge gateway
      onStage && onStage('prompt');
      await U.wait(2200);  // customer enters PIN on handset
      onStage && onStage('processing');
      await U.wait(1100);  // gateway confirmation

      const ref = 'PB' + Date.now().toString().slice(-8) + Math.floor(Math.random()*90+10);
      onStage && onStage('done');
      return {
        reference: ref,
        msisdn,
        amount,
        currency: 'KES',
        plan: plan || 'pro',
        channel: 'M-PESA',
        receipt: 'QHK' + Math.floor(100000 + Math.random()*899999),
        paidAt: new Date().toISOString()
      };
    },

    /** Used by the checkout page to cancel an in-flight attempt (no-op after settle). */
    cancel(){ /* simulation hook */ }
  };
})();
