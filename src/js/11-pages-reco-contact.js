/* Andika — public pages: Recommend, Contact, Terms, Privacy, 404 */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils, I = App.icons;
  const esc = U.esc;

  /* ================= RECOMMEND ================= */
  App.registerPage({
    key:'recommend', exact:true, path:'/recommend',
    title:'Recommend — free content plan for your business',
    description:'Answer three questions about your Kenyan business and get a free, tailored social media content plan: which platforms to use, a Monday-to-Sunday calendar, best posting times and hashtag packs.',
    render(){
      const view = App.renderPublicChrome('recommend');
      const types = Object.entries(App.recommend.types).map(([k,v])=>[k,v.label]);
      view.innerHTML = `
      <section class="reco-hero">
        <div class="container center reveal visible" style="max-width:760px">
          <span class="eyebrow">Free tool · No sign-up needed</span>
          <h1>Get a content plan that actually <span class="grad-text">fits your biashara.</span></h1>
          <p class="lead">Tell us what you sell and where — we will recommend platforms, a weekly calendar,
            the best times to post, content ideas and a ready hashtag pack.</p>
        </div>
      </section>
      <section class="section-sm">
        <div class="container" style="max-width:860px">
          <div class="card card-pad reveal" style="padding:var(--s-8)">
            <form id="recoForm" novalidate>
              <div class="grid-2">
                <div class="field">
                  <label for="rType">What is your business?</label>
                  <select class="select" id="rType" name="type" required>
                    ${types.map(([k,l])=>`<option value="${k}">${esc(l)}</option>`).join('')}
                  </select>
                </div>
                <div class="field">
                  <label for="rTown">Where are you based?</label>
                  <select class="select" id="rTown" name="town">
                    ${['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Nyeri','Meru','Kisii','Kericho','Machakos','Malindi'].map(t=>
                      `<option ${t==='Nairobi'?'selected':''}>${t}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="grid-2">
                <div class="field">
                  <label for="rGoal">What is your main goal?</label>
                  <select class="select" id="rGoal" name="goal">
                    <option value="sales">Get more sales / DMs</option>
                    <option value="awareness">Build awareness / followers</option>
                    <option value="engagement">More engagement & comments</option>
                  </select>
                </div>
                <div class="field">
                  <label for="rHours">How much time can you give social media?</label>
                  <select class="select" id="rHours" name="hours">
                    <option value="1">About 1 hour a week</option>
                    <option value="3" selected>2–3 hours a week</option>
                    <option value="5">5+ hours — let's go hard</option>
                  </select>
                </div>
              </div>
              <button class="btn btn-primary btn-lg btn-block" type="submit">${I.sparkles} Recommend my plan</button>
            </form>
          </div>
          <div id="recoResult" style="margin-top:var(--s-8)"></div>
        </div>
      </section>`;

      U.qs('#recoForm', view).addEventListener('submit', e=>{
        e.preventDefault();
        const f = e.currentTarget;
        const val = n => f.querySelector('[name="'+n+'"]').value;
        const plan = App.recommend.buildPlan({
          type: val('type'), town: val('town'), goal: val('goal'), hours: val('hours')
        });
        renderPlan(plan);
      });
      App.observeReveals(view);
    }
  });

  function renderPlan(plan){
    const host = U.qs('#recoResult');
    host.innerHTML = `
      <div class="route-enter">
        <div class="plan-card reveal visible" style="margin-bottom:var(--s-5)">
          <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center">
            <div>
              <h2 style="margin:0 0 4px;font-size:24px">Your ${esc(plan.businessLabel)} plan 🎯</h2>
              <p class="muted small" style="margin:0">${esc(plan.town)} · goal: ${esc(plan.goal==='sales'?'more sales':plan.goal==='awareness'?'awareness':'engagement')} · ${plan.postsPerWeek} posts/week recommended</p>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-ghost btn-sm" id="dlPlan">${I.download} Download plan (.txt)</button>
              <button class="btn btn-ghost btn-sm" id="copyPlan">${I.file} Copy plan</button>
            </div>
          </div>
        </div>
        <div class="grid-2">
          <div class="plan-card reveal visible">
            <h3>Platform priority</h3>
            <p class="muted small">Focus your energy in this order:</p>
            ${plan.platforms.map((p,i)=>`
              <div style="margin-bottom:14px">
                <div style="display:flex;justify-content:space-between;font-weight:700;font-size:13.5px;font-family:var(--font-display)">
                  <span>${i+1}. ${esc(p.name)}</span><span>${p.pct}%</span></div>
                <div class="prio-bar"><i style="width:${p.pct}%"></i></div>
              </div>`).join('')}
            <p class="tiny muted" style="margin:var(--s-4) 0 0">Pro tip: on Free, master platform #1 first — consistency on one platform beats chaos on five.</p>
          </div>
          <div class="plan-card reveal visible d1">
            <h3>Your hashtag pack</h3>
            <div class="tag-cloud" style="margin-bottom:var(--s-4)">
              ${plan.hashtags.map(h=>`<span>${esc(h)}</span>`).join('')}
            </div>
            <h4 style="margin-top:var(--s-5)">Best times to post (EAT)</h4>
            <ul style="margin:0;padding-left:18px;color:var(--muted);font-size:13.5px">
              ${plan.times.map(t=>`<li style="margin-bottom:6px">${esc(t)}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="plan-card reveal visible" style="margin-top:var(--s-5)">
          <h3>Your Monday–Sunday calendar</h3>
          <div class="cal-grid">
            ${plan.calendar.map(([d,task],i)=>`
              <div class="cal-day" style="${i>=plan.postsPerWeek?'opacity:.45':''}">
                <b>${esc(d)}${i>=plan.postsPerWeek?' · rest':''}</b><span>${esc(task)}</span>
              </div>`).join('')}
          </div>
        </div>
        <div class="plan-card reveal visible" style="margin-top:var(--s-5)">
          <h3>6 content ideas to start with</h3>
          <ol style="margin:0;padding-left:20px;color:var(--muted);font-size:14px;line-height:1.9">
            ${plan.ideas.map(x=>`<li>${esc(x)}</li>`).join('')}
          </ol>
        </div>
        <div class="cta-band reveal visible" style="margin-top:var(--s-8)">
          <h2>Now generate these posts in seconds</h2>
          <p>Andika turns every idea on this plan into a ready caption with hashtags — and posts it for you. Free to start.</p>
          <a class="btn btn-light btn-lg" href="#/signup">Create my free account ${I.arrowRight}</a>
        </div>
      </div>`;

    U.qs('#dlPlan', host).addEventListener('click', ()=>{
      U.download(`andika-plan-${plan.town.toLowerCase()}.txt`, App.recommend.toText(plan));
      App.toast('Plan downloaded. Ifanikiwe! 🎉','success');
    });
    U.qs('#copyPlan', host).addEventListener('click', async ()=>{
      const ok = await U.copy(App.recommend.toText(plan));
      App.toast(ok ? 'Plan copied to clipboard' : 'Copy failed — download instead', ok?'success':'error');
    });
    if(host.scrollIntoView) host.scrollIntoView({ behavior:'smooth', block:'start' });
    App.observeReveals(host);
  }

  /* ================= CONTACT ================= */
  App.registerPage({
    key:'contact', exact:true, path:'/contact',
    title:'Contact us',
    description:'Reach the Andika team in Nairobi: support, sales and partnerships. Call +254 700 094 254, email hello@andika.co.ke or use the form — we reply within one business day.',
    render(){
      const view = App.renderPublicChrome('contact');
      view.innerHTML = `
      <section class="reco-hero">
        <div class="container center reveal visible" style="max-width:720px">
          <span class="eyebrow">Contact</span>
          <h1>Tupatane? <span class="grad-text">Talk to us.</span></h1>
          <p class="lead">Questions about Pro, M-PESA billing or how Andika fits your biashara?
            We are a Nairobi team and we reply within one business day — usually faster on WhatsApp.</p>
        </div>
      </section>
      <section class="section-sm">
        <div class="container">
          <div class="contact-grid">
            <div class="card card-pad reveal" style="padding:var(--s-8)">
              <h3 style="margin-bottom:var(--s-5)">Send us a message</h3>
              <form id="contactForm" novalidate>
                <div class="field">
                  <label for="cName">Your name *</label>
                  <input class="input" id="cName" name="name" type="text" autocomplete="name" placeholder="e.g. Wanjiku Kamau"/>
                  <div class="error-msg" data-error-for="name">${I.alert}Please tell us your name.</div>
                </div>
                <div class="field">
                  <label for="cEmail">Email address *</label>
                  <input class="input" id="cEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com"/>
                  <div class="error-msg" data-error-for="email">${I.alert}Enter a valid email address.</div>
                </div>
                <div class="field">
                  <label for="cSubject">Subject *</label>
                  <select class="select" id="cSubject" name="subject">
                    <option value="">Select a topic…</option>
                    <option>Question about Pro / billing</option>
                    <option>M-PESA payment issue</option>
                    <option>Help getting started</option>
                    <option>Partnership / chama request</option>
                    <option>Something else</option>
                  </select>
                  <div class="error-msg" data-error-for="subject">${I.alert}Please choose a subject.</div>
                </div>
                <div class="field">
                  <label for="cMessage">Message *</label>
                  <textarea class="input" id="cMessage" name="message" placeholder="Eleza issue yako kwa ufupi — e.g. nilitaka kujua jinsi ya ku-schedule posts za wiki..."></textarea>
                  <div class="error-msg" data-error-for="message">${I.alert}Message should be at least 10 characters.</div>
                </div>
                <button class="btn btn-primary btn-lg btn-block" type="submit">${I.send} Send message</button>
              </form>
            </div>
            <div class="contact-info reveal d1">
              <div class="ci-row">
                <div class="ci-ico">${I.pin}</div>
                <div><strong>Office</strong><p class="muted small" style="margin:2px 0 0">4th Floor, Westlands Centre,<br/>Westlands Road, Nairobi, Kenya</p></div>
              </div>
              <div class="ci-row">
                <div class="ci-ico">${I.phone}</div>
                <div><strong>Phone / WhatsApp</strong><p class="muted small" style="margin:2px 0 0">
                  <a href="tel:+254700094254">+254 700 094 254</a><br/>Mon–Sat, 8am–6pm EAT</p></div>
              </div>
              <div class="ci-row">
                <div class="ci-ico">${I.mail}</div>
                <div><strong>Email</strong><p class="muted small" style="margin:2px 0 0">
                  <a href="mailto:hello@andika.co.ke">hello@andika.co.ke</a><br/>
                  <a href="mailto:billing@andika.co.ke">billing@andika.co.ke</a> (M-PESA receipts)</p></div>
              </div>
              <div class="ci-row" style="border-bottom:none">
                <div class="ci-ico">${I.clock}</div>
                <div><strong>Support hours</strong><p class="muted small" style="margin:2px 0 0">
                  Pro customers get priority WhatsApp support — average first reply under 45 minutes during business hours.</p></div>
              </div>
              <div class="card card-pad" style="background:var(--primary-tint);border-color:#d4def0;margin-top:var(--s-5)">
                <h4 style="display:flex;gap:8px;align-items:center">${I.bolt} Faster answer?</h4>
                <p class="small muted" style="margin-bottom:12px">Most questions are answered in the app itself — try the Recommend tool or check your dashboard.</p>
                <a class="btn btn-primary btn-sm btn-block" href="#/recommend">Try the Recommend tool</a>
              </div>
            </div>
          </div>
        </div>
      </section>`;

      const form = U.qs('#contactForm', view);
      form.addEventListener('submit', e=>{
        e.preventDefault();
        App.clearErrors(form);
        const val = n => form.querySelector('[name="'+n+'"]').value;
        const data = {
          name: val('name').trim(), email: val('email').trim(),
          subject: val('subject'), message: val('message').trim()
        };
        let ok = true;
        if(data.name.length < 2){ App.setError(form,'name','Please tell us your name.'); ok=false; }
        if(!U.isValidEmail(data.email)){ App.setError(form,'email','Enter a valid email address.'); ok=false; }
        if(!data.subject){ App.setError(form,'subject','Please choose a subject.'); ok=false; }
        if(data.message.length < 10){ App.setError(form,'message','Message should be at least 10 characters.'); ok=false; }
        if(!ok) return;
        const saved = App.store.addMessage(data);
        const ref = 'MSG-' + saved.id.slice(-6).toUpperCase();
        form.parentElement.innerHTML = `
          <div class="form-success" style="padding:18px">
            <span style="color:var(--success);flex:none;margin-top:2px">${I.checkCircle}</span>
            <div><strong style="font-family:var(--font-display)">Message received — asante!</strong><br/>
            <span style="font-size:13.5px">Reference <strong>${ref}</strong>. We have emailed a copy to ${esc(data.email)} and a member of our
            Nairobi team will reply within one business day.</span></div>
          </div>
          <a class="btn btn-ghost btn-block" href="#/">Back to home</a>`;
        App.toast('Message sent successfully','success');
      });
      App.observeReveals(view);
    }
  });

  /* ================= TERMS ================= */
  App.registerPage({
    key:'terms', exact:true, path:'/terms',
    title:'Terms of service',
    description:'The terms for using Andika, the content creation platform for Kenyan small businesses. Read about accounts, acceptable use, Pro subscriptions, PayBridge M-PESA payments and cancellation.',
    render(){
      const view = App.renderPublicChrome(null);
      view.innerHTML = `<div class="container">
      <article class="legal route-enter">
        <h1 style="font-size:32px">Terms of Service</h1>
        <p class="updated">Last updated: 5 September 2026 · Andika Ltd., registered in Nairobi, Kenya.</p>

        <h2>1. Who we are and what these terms cover</h2>
        <p>Andika ("we", "us") is operated by Andika Ltd., a company registered under the laws of Kenya, with offices at
        Westlands Centre, Westlands Road, Nairobi. These Terms govern your use of the Andika website and application
        (the "Service") — a content creation tool that helps small businesses write social media posts and publish them
        to third-party platforms including Facebook, Instagram, WhatsApp, TikTok and X. By creating an account or using
        the Service, you agree to these Terms. If you do not agree, please do not use the Service.</p>

        <h2>2. Your account</h2>
        <ul>
          <li>You must provide accurate registration details and keep your password confidential.</li>
          <li>You must be at least 18 years old, or operate the account under the supervision of a parent or guardian.</li>
          <li>You are responsible for all activity that happens under your account. Notify us immediately at
          <a href="mailto:hello@andika.co.ke">hello@andika.co.ke</a> if you suspect unauthorised access.</li>
          <li>One account belongs to one business or individual. You may not share login credentials publicly.</li>
        </ul>

        <h2>3. The Free plan and Pro subscription</h2>
        <ul>
          <li><strong>Free plan:</strong> available at no cost, with limits on saved posts (10) and access to scheduling
          and full analytics reserved for Pro.</li>
          <li><strong>Pro subscription:</strong> Ksh 1,000 per month, payable in advance through our PayBridge checkout
          via M-PESA. Prices are inclusive of applicable Kenyan taxes where required.</li>
          <li>Pro is billed monthly and renews automatically until cancelled. You can cancel at any time from the
          Billing page of your dashboard; access continues until the end of the paid period, after which your account
          returns to Free. We do not charge cancellation fees.</li>
          <li>Unless required by law, payments are non-refundable for partially used months. If a technical failure on
          our side prevented use of Pro for a sustained period, contact <a href="mailto:billing@andika.co.ke">billing@andika.co.ke</a>
          and we will review the case fairly.</li>
        </ul>

        <h2>4. Payments through PayBridge</h2>
        <p>Payments are processed by our payment service provider, PayBridge, using Safaricom M-PESA STK push.
        When you initiate checkout you authorise PayBridge to charge the displayed amount to the mobile number you
        provide. A successful payment generates a receipt visible in your Billing page. Andika Ltd. does not store
        your M-PESA PIN on our systems at any point.</p>

        <h2>5. Acceptable use</h2>
        <ul>
          <li>You agree not to use the Service to create or publish content that is unlawful, fraudulent, hateful,
          defamatory, sexually explicit, or that infringes another person's intellectual property.</li>
          <li>You may not attempt to disrupt the Service, reverse-engineer it, or access another user's data — each
          account's content is private and isolated.</li>
          <li>Content you generate must comply with the rules of the social platforms you publish to; you remain
          responsible for the posts you make.</li>
        </ul>

        <h2>6. Your content</h2>
        <p>You own the business information and content you create with Andika. You grant us a limited licence to store
        and process that content solely to operate the Service (including generating captions and displaying your
        analytics). We do not sell your content or use it for advertising. Generated captions are provided "as-is" and
        you should review every post before publishing.</p>

        <h2>7. Third-party platforms</h2>
        <p>Publishing features depend on Facebook, Meta, WhatsApp, TikTok and X, which operate their own terms and may
        change their services independently. We work to keep integrations running but cannot guarantee uninterrupted
        availability of any third-party platform.</p>

        <h2>8. Availability and changes</h2>
        <p>We aim for high availability but the Service is provided "as is" without warranty of any kind. We may update,
          add or remove features; material changes will be communicated by email or in-app notice at least 14 days in
          advance where reasonably practicable.</p>

        <h2>9. Limitation of liability</h2>
        <p>To the maximum extent permitted by Kenyan law, Andika Ltd. shall not be liable for indirect or consequential
        losses (including lost profits) arising from use of the Service. Our total liability for any claim shall not
        exceed the amount you paid us in the three months preceding the claim.</p>

        <h2>10. Termination</h2>
        <p>You may delete your account from Settings at any time; your content is removed promptly. We may suspend
        accounts that breach these Terms, with notice where reasonably possible.</p>

        <h2>11. Governing law</h2>
        <p>These Terms are governed by the laws of the Republic of Kenya. Disputes will first be handled through good-faith
        negotiation, and failing that, the courts of Kenya shall have jurisdiction.</p>

        <h2>12. Contact</h2>
        <p>Questions about these Terms: Andika Ltd., 4th Floor, Westlands Centre, Westlands Road, Nairobi ·
        <a href="mailto:hello@andika.co.ke">hello@andika.co.ke</a> · <a href="tel:+254700094254">+254 700 094 254</a>.</p>

        <div style="margin-top:var(--s-8)"><a class="btn btn-ghost" href="#/signup">I agree — create my account ${I.arrowRight}</a></div>
      </article></div>`;
    }
  });

  /* ================= PRIVACY ================= */
  App.registerPage({
    key:'privacy', exact:true, path:'/privacy',
    title:'Privacy policy',
    description:'How Andika collects, stores and protects the data of Kenyan small businesses, in line with the Kenya Data Protection Act, 2019. Includes your rights and M-PESA payment handling.',
    render(){
      const view = App.renderPublicChrome(null);
      view.innerHTML = `<div class="container">
      <article class="legal route-enter">
        <h1 style="font-size:32px">Privacy Policy</h1>
        <p class="updated">Last updated: 5 September 2026 · Andika Ltd., Nairobi, Kenya.</p>

        <p>Your privacy matters to us — and as a Kenyan company we are committed to complying with the
        <strong>Data Protection Act, 2019</strong> and the guidance of the Office of the Data Protection Commissioner (ODPC).
        This policy explains what data we collect, why we collect it, and the rights you have over it.</p>

        <h2>1. Data we collect</h2>
        <ul>
          <li><strong>Account data:</strong> your name, email address, and (only if you provide it) business name,
          business type, county/town and phone number.</li>
          <li><strong>Content data:</strong> the posts, captions, schedules and analytics records you create in the
          app. This data belongs to your account and is never visible to other users.</li>
          <li><strong>Payment data:</strong> when you upgrade, we receive from PayBridge a transaction reference,
          receipt number, amount, date and the mobile number used — never your M-PESA PIN.</li>
          <li><strong>Contact messages:</strong> when you use our Contact form, we keep the name, email, subject and
          message you send so we can respond.</li>
          <li><strong>Technical data:</strong> basic, privacy-friendly data such as browser type and error logs needed
          to keep the Service reliable.</li>
        </ul>

        <h2>2. How we use your data</h2>
        <ul>
          <li>To create and run your account, and to keep your data isolated to your sign-in.</li>
          <li>To generate captions, schedule posts and compute your analytics.</li>
          <li>To process Pro subscriptions through PayBridge and issue receipts.</li>
          <li>To reply to support and contact requests.</li>
          <li>To send service notices (e.g. billing receipts). Marketing emails are only sent with your consent and
          include an unsubscribe link.</li>
        </ul>

        <h2>3. Legal basis</h2>
        <p>We process your data on the basis of contract performance (providing the Service you signed up for), your
        consent (which you may withdraw at any time), and legitimate interests such as keeping the Service secure and
        improving it.</p>

        <h2>4. Data sharing</h2>
        <p>We do not sell your personal data. We share data only with:</p>
        <ul>
          <li><strong>PayBridge</strong> — payment reference data needed to complete M-PESA transactions;</li>
          <li><strong>Social platforms</strong> — only the content you explicitly choose to publish, sent via your own
          publishing action;</li>
          <li><strong>Kenyan authorities</strong> — where required by law or valid court order.</li>
        </ul>

        <h2>5. Data storage and security</h2>
        <p>Your data is protected with access controls and is isolated per account: no other Andika user can see your
        posts. Passwords are never stored in plain text. Payments are handled by PayBridge's secure, encrypted
        checkout. While no system can be guaranteed 100% secure, we take reasonable measures appropriate to the
        sensitivity of the data.</p>

        <h2>6. Retention</h2>
        <p>We keep your account data for as long as your account is active. If you delete your account from Settings,
        your content and personal data are removed promptly. Payment records are retained for the period required by
        Kenyan tax law.</p>

        <h2>7. Your rights</h2>
        <p>Under the Data Protection Act, 2019 you have the right to:</p>
        <ul>
          <li>access the personal data we hold about you (it is visible in your Account page);</li>
          <li>correct inaccurate data (edit it any time in Account &amp; Settings);</li>
          <li>delete your data (use "Delete account" in Settings, or email us);</li>
          <li>object to or restrict processing, and withdraw consent at any time;</li>
          <li>lodge a complaint with the Office of the Data Protection Commissioner if you are unsatisfied.</li>
        </ul>

        <h2>8. Cookies</h2>
        <p>We use only essential local storage to keep you signed in and save your work in this browser. We do not use
        advertising or cross-site tracking cookies.</p>

        <h2>9. Children</h2>
        <p>The Service is intended for business owners and is not directed at children under 18.</p>

        <h2>10. Contact &amp; data requests</h2>
        <p>Andika Ltd., 4th Floor, Westlands Centre, Westlands Road, Nairobi ·
        <a href="mailto:privacy@andika.co.ke">privacy@andika.co.ke</a> · <a href="tel:+254700094254">+254 700 094 254</a>.
        We respond to data requests within 30 days as required by law.</p>

        <div style="margin-top:var(--s-8)"><a class="btn btn-ghost" href="#/signup">Back to sign up ${I.arrowRight}</a></div>
      </article></div>`;
    }
  });

  /* ================= 404 ================= */
  App.registerPage({
    key:'notfound', exact:false, pattern:/^\/.*/,
    title:'Page not found',
    description:'The page you are looking for does not exist on Andika.',
    render(){
      const view = App.renderPublicChrome(null);
      view.innerHTML = `<section class="section">
        <div class="container center route-enter" style="padding:var(--s-12) 0">
          <div style="font-size:80px;font-family:var(--font-display);font-weight:800;background:linear-gradient(90deg,#2563eb,#4f46e5);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1">404</div>
          <h2 style="margin-top:var(--s-4)">Pole! That page haiko.</h2>
          <p class="lead" style="max-width:480px;margin-left:auto;margin-right:auto">The link may be broken, or the page moved.
            Let's get you back to building content.</p>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:var(--s-5)">
            <a class="btn btn-primary btn-lg" href="#/">Go to home ${I.arrowRight}</a>
            <a class="btn btn-ghost btn-lg" href="#/features">See features</a>
          </div>
        </div>
      </section>`;
    }
  });
})();
