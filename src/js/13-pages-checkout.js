/* Andika — checkout page (PayBridge / M-PESA STK push) */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils, I = App.icons;
  const esc = U.esc;
  const PLAN_PRICE = 1000;

  App.registerPage({
    key:'checkout', exact:true, path:'/checkout', auth:true,
    title:'Checkout — upgrade to Pro',
    description:'Upgrade to Andika Pro for Ksh 1,000 per month via PayBridge M-PESA. Accept purchase conditions and pay securely with an STK push.',
    render({ query }){
      const user = App.store.currentUser();
      const view = App.renderPublicChrome(null);
      const plan = query.plan || 'pro';

      if(user.plan === 'pro' && !user.planCancelsAt){
        view.innerHTML = `
          <section class="auth-shell"><div class="container"><div class="form-wrap route-enter">
            <div class="card form-card center" style="padding:var(--s-8)">
              <div class="check-anim">${I.check}</div>
              <h2>You are already on Pro 🎉</h2>
              <p class="muted">Your plan is active${user.planRenewsAt ? ' and renews on '+esc(U.fmtDate(user.planRenewsAt)) : ''}.
              Manage it any time from your Billing page.</p>
              <a class="btn btn-primary btn-lg btn-block" href="#/dashboard/billing">Go to Billing ${I.arrowRight}</a>
            </div></div></div></section>`;
        return;
      }

      view.innerHTML = `
      <section class="auth-shell" style="align-items:flex-start;padding-top:var(--s-10)">
        <div class="container" style="max-width:900px">
          <div class="route-enter">
            <div class="pay-steps">
              <div class="pay-step active" id="ps1"><div class="ps-dot">1</div>Review</div>
              <div class="pay-step" id="ps2"><div class="ps-dot">2</div>Conditions</div>
              <div class="pay-step" id="ps3"><div class="ps-dot">3</div>Pay with M-PESA</div>
              <div class="pay-step" id="ps4"><div class="ps-dot">4</div>Done</div>
            </div>
            <div class="grid-2" style="grid-template-columns:1.2fr .8fr;align-items:start">
              <div class="card form-card" id="checkoutPanel"></div>
              <div class="card card-pad" id="summaryPanel"></div>
            </div>
          </div>
        </div>
      </section>`;

      renderSummary(view, user);
      renderConditions(view, user, plan);
    }
  });

  function setStep(view, n){
    for(let i=1;i<=4;i++){
      const el = view.querySelector('#ps'+i);
      el.classList.toggle('active', i===n);
      el.classList.toggle('done', i<n);
      if(i<n){ el.querySelector('.ps-dot').innerHTML = I.check; }
      else if(i>=n){ el.querySelector('.ps-dot').textContent = i; }
    }
  }

  function renderSummary(view, user){
    view.querySelector('#summaryPanel').innerHTML = `
      <h3 style="font-size:18px">Order summary</h3>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
        <span>Andika Pro — monthly</span><strong>${U.fmtKES(PLAN_PRICE)}</strong></div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
        <span class="muted">Taxes included</span><span class="muted">Ksh 0</span></div>
      <div style="display:flex;justify-content:space-between;padding:14px 0;font-family:var(--font-display);font-size:18px;font-weight:800">
        <span>Total due today</span><span>${U.fmtKES(PLAN_PRICE)}</span></div>
      <div style="background:var(--surface-2);border-radius:var(--r-md);padding:12px 14px;font-size:12.5px;color:var(--muted)">
        <strong style="color:var(--text)">Renews automatically</strong> at Ksh 1,000/month via PayBridge.
        Cancel anytime from Billing — Pro stays active until period end.
      </div>
      <p class="small muted" style="margin:14px 0 0;display:flex;gap:7px;align-items:center">
        <span class="plat-dot" style="background:#0da95f;width:22px;height:22px;font-size:9px;font-weight:800">M</span>
        PayBridge · secure M-PESA STK push · PIN stays on your phone</p>`;
  }

  function renderConditions(view, user){
    setStep(view, 2);
    const panel = view.querySelector('#checkoutPanel');
    panel.innerHTML = `
      <h2 style="font-size:22px">Almost there — accept &amp; pay</h2>
      <p class="muted small">Please review and accept the purchase conditions before payment.</p>
      <form id="condForm" novalidate>
        <label class="checkbox-row" style="margin-bottom:12px;align-items:flex-start">
          <input type="checkbox" id="cond1" name="c1"/>
          <span class="lbl"><strong>I authorise Andika Ltd. to charge <span style="color:var(--text)">Ksh 1,000</span> today
          via PayBridge M-PESA</strong>, and to renew my Pro subscription monthly at the same price until I cancel.</span>
        </label>
        <label class="checkbox-row" style="margin-bottom:12px">
          <input type="checkbox" id="cond2" name="c2"/>
          <span class="lbl">I understand I can <strong>cancel anytime</strong> from the Billing page, keeping Pro until
          the end of the paid month, and that monthly fees are <strong>non-refundable</strong> for partial months (per the Terms of Service).</span>
        </label>
        <label class="checkbox-row" style="margin-bottom:var(--s-4)">
          <input type="checkbox" id="cond3" name="c3"/>
          <span class="lbl">I confirm the Safaricom number I will pay with is <strong>mine</strong> and I will receive an
          STK push to authorise the payment with my M-PESA PIN.</span>
        </label>
        <div class="error-msg" id="condErr">${I.alert}<span>Please accept all purchase conditions to continue.</span></div>
        <div style="display:flex;gap:10px;margin-top:var(--s-4)">
          <a class="btn btn-ghost" href="#/pricing">Back</a>
          <button class="btn btn-primary btn-lg" type="submit" style="flex:1">${I.card} Pay ${U.fmtKES(PLAN_PRICE)} with M-PESA</button>
        </div>
      </form>`;

    panel.querySelector('#condForm').addEventListener('submit', e=>{
      e.preventDefault();
      const accepted = ['cond1','cond2','cond3'].every(id=>panel.querySelector('#'+id).checked);
      const err = panel.querySelector('#condErr');
      if(!accepted){ err.classList.add('show'); return; }
      err.classList.remove('show');
      renderPay(view, user);
    });
  }

  function renderPay(view, user){
    setStep(view, 3);
    const panel = view.querySelector('#checkoutPanel');
    panel.innerHTML = `
      <h2 style="font-size:22px">Pay with M-PESA</h2>
      <p class="muted small">Enter the Safaricom number registered with M-PESA. We will send an STK push to your phone.</p>
      <form id="payForm" novalidate>
        <div class="field">
          <label for="payPhone">M-PESA phone number *</label>
          <input class="input" id="payPhone" name="phone" type="tel" inputmode="numeric"
            placeholder="07XX XXX XXX" value="${esc(user.profile.phone || '')}" autocomplete="tel"/>
          <div class="hint">Use the format 0712 345 678 or +254 712 345 678.</div>
          <div class="error-msg" data-error-for="phone">${I.alert}<span></span></div>
        </div>
        <div id="payError" class="form-error-banner" style="display:none"></div>
        <div style="display:flex;gap:10px">
          <a class="btn btn-ghost" href="#/dashboard/billing">Cancel</a>
          <button class="btn btn-success btn-lg" type="submit" id="payBtn" style="flex:1">
          <span style="display:inline-flex;width:18px;height:18px;background:#fff;color:#0da95f;border-radius:4px;align-items:center;justify-content:center;font-weight:900;font-size:11px">M</span>
          Send STK push — ${U.fmtKES(PLAN_PRICE)}</button>
        </div>
      </form>
      <div id="stkArea" style="display:none"></div>`;

    const form = panel.querySelector('#payForm');
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      App.clearErrors(form);
      const phoneInput = form.querySelector('[name="phone"]');
      const phone = phoneInput.value;
      if(!App.paybridge.validatePhone(phone)){
        App.setError(form,'phone','Enter a valid Safaricom number, e.g. 0712 345 678.');
        return;
      }
      const btn = panel.querySelector('#payBtn');
      btn.disabled = true;
      btn.innerHTML = App.spinner + ' Sending request…';
      await runStk(view, user, phone);
    });
  }

  async function runStk(view, user, phone){
    const panel = view.querySelector('#checkoutPanel');
    const stk = panel.querySelector('#stkArea');
    form_off(stk);
    stk.style.display = 'block';
    stk.innerHTML = `
      <div class="stk-phone">
        <div class="spinner" style="border-color:rgba(15,157,88,.25);border-top-color:var(--success)"></div>
        <div><strong>Check your phone (${esc(U.mpesaDisplay(phone))})</strong><br/>
        <span class="small muted">An M-PESA prompt has been sent. Enter your PIN on your phone to authorise Ksh ${U.fmtKES(PLAN_PRICE)} to Andika Ltd.</span></div>
      </div>
      <div class="post-steps" id="stkSteps"></div>`;
    const stepsList = stk.querySelector('#stkSteps');
    const stages = [
      ['initiated','Connecting to PayBridge…'],
      ['prompt','STK push sent to your handset…'],
      ['processing','Confirming payment with M-PESA…'],
      ['done','Payment received ✅']
    ];
    stages.forEach((s,i)=>{
      const d = document.createElement('div');
      d.className = 'post-step';
      d.innerHTML = `<span class="ps-ic">${i===0?App.spinner:''}</span><span>${s[1]}</span>`;
      stepsList.appendChild(d);
    });
    const mark = (i, state)=>{
      const row = stepsList.children[i];
      if(!row) return;
      row.classList.remove('active');
      row.classList.add(state==='done'?'done':'active');
      const ic = row.querySelector('.ps-ic');
      ic.innerHTML = state==='done' ? I.check : App.spinner;
      if(state==='done' && stepsList.children[i+1]){
        const nx = stepsList.children[i+1];
        nx.classList.add('active');
        nx.querySelector('.ps-ic').innerHTML = App.spinner;
      }
    };
    mark(0,'active');

    try{
      const result = await App.paybridge.requestStkPush(
        { phone, amount: PLAN_PRICE, plan:'pro' },
        stage=>{
          const idx = stages.findIndex(s=>s[0]===stage);
          if(idx>0) mark(idx-1,'done');
          if(stage!=='done') mark(idx,'active');
        }
      );
      mark(3,'done');
      const fresh = App.store.currentUser();
      const payment = App.store.addPayment({
        userId: fresh.id, amount: result.amount, currency:'KES',
        reference: result.reference, receipt: result.receipt,
        msisdn: result.msisdn, channel: result.channel, plan:'pro',
        paidAt: result.paidAt
      });
      App.store.activatePro(fresh.id, payment);
      App.store.updateUser({ id:fresh.id, profile: Object.assign({}, fresh.profile, { phone: result.msisdn }) });

      await U.wait(500);
      renderConfirmation(view, result);
    }catch(err){
      const payErr = panel.querySelector('#payError');
      payErr.style.display = 'block';
      payErr.innerHTML = `${I.alert} <strong>Payment failed.</strong> ${esc(err.message||'No PIN was entered or the push timed out.')} You have not been charged.`;
      const btn = panel.querySelector('#payBtn');
      btn.disabled = false;
      btn.innerHTML = 'Retry STK push';
      stepsList.querySelectorAll('.post-step').forEach(r=>{
        if(r.classList.contains('active')){ r.classList.remove('active'); r.querySelector('.ps-ic').innerHTML=''; }
      });
      stk.style.display = 'none';
    }
  }
  function form_off(){} // placeholder (stk area needs no form teardown)

  function renderConfirmation(view, result){
    setStep(view, 4);
    view.querySelector('#summaryPanel').innerHTML = `
      <h3 style="font-size:18px">Receipt</h3>
      ${[['Amount', U.fmtKES(result.amount)],['Reference', result.reference],
        ['M-PESA receipt', result.receipt],['Phone', U.mpesaDisplay(result.msisdn)],
        ['Date', U.fmtDate(result.paidAt, true)]].map(([k,v])=>
        `<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:13.5px">
          <span class="muted">${k}</span><strong style="text-align:right">${esc(v)}</strong></div>`).join('')}
      <p class="small muted" style="margin-top:12px">A copy was saved to your Billing history.</p>`;
    view.querySelector('#checkoutPanel').innerHTML = `
      <div class="center" style="padding:var(--s-4) 0">
        <div class="check-anim">${I.checkCircle}</div>
        <h2 style="font-size:24px">Pro activated! 🎉</h2>
        <p class="muted">Payment of <strong>${U.fmtKES(result.amount)}</strong> confirmed via M-PESA.
        Reference <strong>${esc(result.reference)}</strong>. Unlimited posts, scheduling and full analytics are now unlocked.</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:var(--s-5)">
          <a class="btn btn-primary btn-lg" href="#/dashboard/overview">Go to dashboard ${I.arrowRight}</a>
          <a class="btn btn-ghost" href="#/dashboard/billing">View billing</a>
        </div>
      </div>`;
    App.toast('Payment successful — Pro is active! 🎉','success');
  }
})();
