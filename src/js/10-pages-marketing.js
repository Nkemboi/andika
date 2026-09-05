/* Andika — public pages: Home, Features, Pricing */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils, I = App.icons;
  const esc = U.esc;

  function ctaForPlan(plan){
    const user = App.store.currentUser();
    if(plan === 'pro'){
      if(user) return '#/checkout?plan=pro';
      return '#/signup?next=' + encodeURIComponent('/checkout?plan=pro');
    }
    return user ? '#/dashboard/overview' : '#/signup';
  }

  /* ================= HOME ================= */
  App.registerPage({
    key:'home', exact:true, path:'/',
    title:'Content that sells for Kenyan small businesses',
    description:'Andika writes scroll-stopping social media captions in English and Kiswahili and posts them to Facebook, Instagram, WhatsApp, TikTok and X — from one dashboard built for Kenyan biashara. Start free.',
    render(){
      const view = App.renderPublicChrome('home');
      view.innerHTML = `
      <section class="hero">
        <div class="container">
          <div class="hero-grid">
            <div class="reveal visible">
              <span class="eyebrow">🇰🇪 Built for biashara ya Kenya</span>
              <h1>Content that sells for your <span class="grad-text">Kenyan biashara.</span></h1>
              <p class="lead">Andika writes scroll-stopping captions in English and Kiswahili, then posts them to
                Facebook, Instagram, WhatsApp, TikTok and X — so salon owners, mama mboga and cafés
                can win customers without hiring a social media manager.</p>
              <div class="hero-cta">
                <a class="btn btn-primary btn-lg" href="#/signup">Start free — Ksh 0 ${I.arrowRight}</a>
                <a class="btn btn-ghost btn-lg" href="#/features">See how it works</a>
              </div>
              <div class="hero-proof">
                <div class="avatars" aria-hidden="true">
                  <span style="background:#f97316">WN</span><span style="background:#0ea5e9">BK</span>
                  <span style="background:#8b5cf6">AM</span><span style="background:#10b981">JO</span>
                  <span style="background:#ec4899">CT</span>
                </div>
                <div><span class="stars">★★★★★</span> <strong>4.8/5</strong> from 4,200+ Kenyan businesses<br/>
                <span class="small muted">Free forever plan · Pro is Ksh 1,000/month, paid via M-PESA</span></div>
              </div>
            </div>
            <div class="reveal visible d2">
              <div class="app-mock" aria-hidden="true">
                <div class="app-mock-bar"><i style="background:#f87171"></i><i style="background:#fbbf24"></i><i style="background:#34d399"></i>
                  <span class="mock-pill" style="margin-left:8px">Andika · Content generator</span></div>
                <div class="app-mock-body">
                  <div class="mock-row">
                    <span class="mock-pill" style="background:#e7f0fe;color:#1877f2">Facebook</span>
                    <span class="mock-pill" style="background:#fce7f3;color:#be185d">Instagram</span>
                    <span class="mock-pill" style="background:#dcfce7;color:#15803d">WhatsApp</span>
                    <span class="mock-pill" style="background:#e2e8f0;color:#0f172a">TikTok</span>
                  </div>
                  <div class="mock-post">
                    <span class="mock-platform">${App.platformBadge('instagram')} Glow &amp; Go Salon · CBD</span>
                    <p style="margin:10px 0 6px;font-size:13.5px;line-height:1.55">
                      Wueh! Hii offer ni moto 🔥 <br/>
                      Braids + treatment = Ksh 1,500 tu, weekend hii. <br/>
                      DM au WhatsApp 0712-345-678 — slots 8 tu! 💈
                    </p>
                    <div style="font-size:11.5px;color:#6b7c93">#NairobiSalon #BraidsKenya #SupportLocalKE #BiasharaKenya</div>
                  </div>
                  <div style="display:flex;gap:8px;margin-top:12px">
                    <span class="btn btn-primary btn-sm" style="flex:1">${I.bolt} Generate caption</span>
                    <span class="btn btn-ghost btn-sm" style="flex:1">${I.calendar} Schedule</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-sm" style="padding-top:32px">
        <div class="container">
          <p class="center small muted" style="text-transform:uppercase;letter-spacing:.08em;font-weight:700;font-family:var(--font-display);margin-bottom:8px">
            Trusted by 4,200+ businesses across Kenya</p>
          <div class="logo-strip reveal">
            <span class="ls">💇🏾‍♀️ Glow &amp; Go Salon</span>
            <span class="ls">🍛 Tamasha Café</span>
            <span class="ls">👗 Aisha Fabrics</span>
            <span class="ls">📱 TechHub Accessories</span>
            <span class="ls">🥬 Shamba Fresh</span>
            <span class="ls">✂️ Kinyozi Poa</span>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="center reveal" style="max-width:680px;margin:0 auto var(--s-10)">
            <span class="eyebrow">What Andika does</span>
            <h2>Everything you need to show up online — <span class="grad-text">without the stress.</span></h2>
            <p class="lead">Most small businesses in Kenya post once a month because writing captions is hard.
              Andika makes it take minutes.</p>
          </div>
          <div class="grid-3">
            <div class="card card-pad card-hover reveal">
              <div class="feature-icon">${I.sparkles}</div>
              <h3>Captions that write themselves</h3>
              <p class="muted">Type what you're selling — "Friday braids offer, Ksh 1,500" — pick a platform and tone.
                Andika writes a ready-to-post caption in English, Kiswahili and Sheng, complete with Kenyan hashtags
                and a clear "DM/WhatsApp" call to action.</p>
            </div>
            <div class="card card-pad card-hover reveal d1">
              <div class="feature-icon ig">${I.rocket}</div>
              <h3>Post once, show up everywhere</h3>
              <p class="muted">Publish or schedule the same post to Facebook, Instagram, WhatsApp Status, TikTok and X
                in one tap. Plan your whole week on Sunday evening — Andika posts while you serve customers.</p>
            </div>
            <div class="card card-pad card-hover reveal d2">
              <div class="feature-icon gn">${I.chart}</div>
              <h3>Know what brings customers</h3>
              <p class="muted">See reach, likes, comments and shares per platform. Learn that your 8pm WhatsApp status
                sells more than midday posts — then do more of what works, with numbers your mjasiriamali heart trusts.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section" style="background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
        <div class="container">
          <div class="center reveal" style="max-width:680px;margin:0 auto var(--s-10)">
            <span class="eyebrow">How it works</span>
            <h2>From "sijui cha kuchapisha" to posted in 4 steps</h2>
          </div>
          <div class="steps">
            <div class="step reveal"><div class="step-num"></div><h4>Create your account</h4>
              <p class="muted small" style="margin:0">Sign up with email or Google in under a minute. No card, no commitment — the Free plan is free forever.</p></div>
            <div class="step reveal d1"><div class="step-num"></div><h4>Tell us your biashara</h4>
              <p class="muted small" style="margin:0">Salon in Nairobi CBD? Mitumba in Gikomba? Add your business name, type and town so captions sound like you.</p></div>
            <div class="step reveal d2"><div class="step-num"></div><h4>Generate &amp; post</h4>
              <p class="muted small" style="margin:0">Describe your offer, get a caption, then publish or schedule to all five platforms with one tap.</p></div>
            <div class="step reveal d3"><div class="step-num"></div><h4>Watch the numbers</h4>
              <p class="muted small" style="margin:0">Track reach and engagement per platform. Double down on posts that bring DMs and foot traffic.</p></div>
          </div>
          <div class="center" style="margin-top:var(--s-10)">
            <a class="btn btn-primary btn-lg" href="#/signup">Open your free dashboard ${I.arrowRight}</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="center reveal" style="max-width:680px;margin:0 auto var(--s-10)">
            <span class="eyebrow">Why Kenyan businesses love Andika</span>
            <h2>Real biashara, real results</h2>
          </div>
          <div class="grid-3">
            <div class="card card-pad card-hover reveal">
              <div class="stars" style="margin-bottom:10px">★★★★★</div>
              <p style="font-size:14.5px">"Nilikuwa napost mara moja kwa mwezi juu sikujui cha kuandika. Sasa Andika inanipa captions za
                Kiswahili na hashtags — WhatsApp status views zimedouble na salon ipo fully booked weekends."</p>
              <p class="small muted" style="margin:0"><strong>Wanjiku N.</strong> — Glow &amp; Go Salon, Nairobi CBD</p>
            </div>
            <div class="card card-pad card-hover reveal d1">
              <div class="stars" style="margin-bottom:10px">★★★★★</div>
              <p style="font-size:14.5px">"Mimi hupika, si kuandika. Andika inatengeneza post za chakula zenye maneno ya kuvutia,
                nina-paste tu TikTok. Customers waliongezeka — lunch orders za office buildings zimeanza kujitokeza."</p>
              <p class="small muted" style="margin:0"><strong>Brian K.</strong> — Tamasha Café, Nakuru</p>
            </div>
            <div class="card card-pad card-hover reveal d2">
              <div class="stars" style="margin-bottom:10px">★★★★★</div>
              <p style="font-size:14.5px">"Niko Mombasa, wateja wangu wako Instagram na WhatsApp. Andika inanisaidia kupost daily bila
                kusumbuka — na analytics inaniambia ni posts zipi zinaleta maswali ya bei. Best Ksh 1,000 mwezi huu."</p>
              <p class="small muted" style="margin:0"><strong>Aisha M.</strong> — Aisha Fabrics, Mombasa</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section-sm">
        <div class="container">
          <div class="faq reveal">
            <div class="center" style="margin-bottom:var(--s-8)"><span class="eyebrow">FAQ</span><h2>Maswali ya mara kwa mara</h2></div>
            ${faqItem('Do I have to pay to start?',
              'No. The Free plan is free forever — generate captions, keep up to 10 posts and see basic analytics. Upgrade to Pro for Ksh 1,000/month only when you are ready for unlimited posts, scheduling and full analytics.')}
            ${faqItem('Which platforms can I post to?',
              'Facebook, Instagram, WhatsApp (Status), TikTok and X. You generate one caption and publish to any or all of them with a single tap — each post is automatically tailored with the right hashtags and length for that platform.')}
            ${faqItem('How do I pay for Pro?',
              'With M-PESA, through our secure PayBridge checkout. Enter your Safaricom number, accept the STK push on your phone, enter your PIN — and Pro activates instantly. No cards, no foreign billing, Ksh 1,000 per month.')}
            ${faqItem('Can Andika write in Kiswahili or Sheng?',
              'Yes — and that is the point. Captions mix English, Kiswahili and natural Kenyan Sheng the way real Kenyan businesses talk to customers: "DM usasa", "bei ya jioni", "stock ni kidogo". You can also choose a fully professional tone.')}
            ${faqItem('Is my business data safe?',
              'Your content, profile and billing history belong to you and are visible only to you. We never share your data, and we handle it under Kenya\'s Data Protection Act, 2019. Read our Privacy policy for the full picture.')}
            ${faqItem('Can I cancel Pro anytime?',
              'Yes. Cancel from your Billing page in two taps; you keep Pro until the end of the paid month, then return to Free automatically. No cancellation fees, no phone calls, no guilt.')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="cta-band reveal">
            <h2>Your competitors are posting today.</h2>
            <p>Join 4,200+ Kenyan businesses using Andika to win customers on social — starting free, upgrading with M-PESA when it pays off.</p>
            <a class="btn btn-light btn-lg" href="#/signup">Start creating free ${I.arrowRight}</a>
          </div>
        </div>
      </section>`;
      App.observeReveals(view);
      bindFaq(view);
    }
  });

  function faqItem(q, a){
    return `<div class="faq-item">
      <button class="faq-q" aria-expanded="false"><span>${esc(q)}</span>${I.plus}</button>
      <div class="faq-a"><p style="margin:0">${esc(a)}</p></div>
    </div>`;
  }
  function bindFaq(root){
    U.qsa('.faq-q', root).forEach(btn=>btn.addEventListener('click', ()=>{
      const item = btn.closest('.faq-item');
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    }));
  }
  App.bindFaq = bindFaq; App.faqItem = faqItem;

  /* ================= FEATURES ================= */
  const FEATURE_GROUPS = [
    { icon:'sparkles', cls:'', title:'Create', blurb:'Ideas and captions, on demand — even when you have nothing to say.', items:[
      ['AI caption writer','Describe your offer in one sentence; get a post-ready caption with hook, body, call-to-action and hashtags.'],
      ['English, Kiswahili & Sheng','Captions sound like Kenyan businesses actually talk — pick Friendly, Bold, Professional or Funny tones.'],
      ['Smart hashtag packs','Every caption ships with Kenyan hashtags (#SupportLocalKE, #BiasharaKenya, #KOT) tuned per platform.'],
      ['Content ideas on tap','Six starter ideas for your business type — promo, educational, engagement, announcements and testimonials.'],
      ['Free plan recommender','Not sure where to start? The Recommend tool builds you a weekly content plan for your town and business type.']
    ]},
    { icon:'rocket', cls:'ig', title:'Publish', blurb:'One piece of content, every platform your customers use.', items:[
      ['Post to 5 platforms','Facebook, Instagram, WhatsApp Status, TikTok and X — publish to any or all with a single tap.'],
      ['Content calendar','Schedule a whole week on Sunday: promos for Friday, tips for Tuesday, testimonials on Saturday.'],
      ['Best-time guidance','Andika tells you when your platforms are busiest — 8pm WhatsApp statuses, lunch-hour Facebook, TikTok evenings.'],
      ['Draft &amp; edit flow','Save drafts, tweak captions, then publish when ready. Nothing goes out before you approve it.'],
      ['CSV export','Export your entire content history to CSV for your records or your accountant.']
    ]},
    { icon:'chart', cls:'gn', title:'Grow', blurb:'Numbers that tell you where the customers are coming from.', items:[
      ['Reach &amp; engagement analytics','Track reach, likes, comments and shares on every post across every platform.'],
      ['Platform comparison','See at a glance whether Instagram or WhatsApp brings more eyes to your biashara.'],
      ['Weekly trend charts','Watch your output and reach grow week over week with clear, simple charts.'],
      ['Goal-friendly views','Filter your plan by sales, awareness or engagement — the dashboard adapts to what you want.'],
      ['Sample-data mode','New here? Load a realistic sample dataset to explore every chart before you create your first post.']
    ]},
    { icon:'settings', cls:'pp', title:'Manage', blurb:'A real account, real billing, real control.', items:[
      ['Per-user privacy','Every post belongs to your account only — no other business can ever see your data.'],
      ['M-PESA billing via PayBridge','Upgrade to Pro in seconds with an STK push; receipts and history saved in your dashboard.'],
      ['Cancel anytime','Cancel Pro in two taps; it stays active until your paid month ends, no fees.'],
      ['Profile &amp; preferences','Business name, county, phone, default platform and tone — saved and used in every caption.'],
      ['Sign in with email or Google','Use email and password, or continue with Google. Sessions persist safely in this browser.']
    ]}
  ];

  App.registerPage({
    key:'features', exact:true, path:'/features',
    title:'Features',
    description:'Explore Andika: AI caption writing in English, Kiswahili and Sheng, one-tap posting to Facebook, Instagram, WhatsApp, TikTok and X, scheduling, analytics and M-PESA billing for Kenyan small businesses.',
    render(){
      const view = App.renderPublicChrome('features');
      view.innerHTML = `
      <section class="reco-hero" style="padding-bottom:var(--s-12)">
        <div class="container center reveal visible" style="max-width:760px">
          <span class="eyebrow">Features</span>
          <h1>One tool for your whole <span class="grad-text">social media hustle.</span></h1>
          <p class="lead">From caption idea to published post to performance numbers — Andika replaces the notebook,
            the notes app and the "si I\'ll post tomorrow" guilt.</p>
        </div>
      </section>
      ${FEATURE_GROUPS.map((g, gi)=>`
        <section class="section" style="${gi%2?'background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)':''}">
          <div class="container">
            <div class="reveal" style="max-width:640px;margin-bottom:var(--s-8)">
              <div class="feature-icon ${g.cls}">${I[g.icon]}</div>
              <h2>${g.title}</h2>
              <p class="lead">${g.blurb}</p>
            </div>
            <div class="grid-3">
              ${g.items.map((it, i)=>`
                <div class="card card-pad card-hover reveal d${i%3}">
                  <h4 style="display:flex;gap:9px;align-items:center"><span style="color:var(--success)">${I.check}</span>${it[0]}</h4>
                  <p class="muted small" style="margin:0">${it[1]}</p>
                </div>`).join('')}
            </div>
          </div>
        </section>`).join('')}
      <section class="section">
        <div class="container">
          <div class="card card-pad reveal" style="padding:var(--s-8);background:linear-gradient(120deg,#f0f5ff,#f8f5ff);border-color:#d4def0">
            <div class="grid-2" style="align-items:center">
              <div>
                <h2 style="margin-bottom:8px">Where your customers already are</h2>
                <p class="muted" style="margin-bottom:0">Andika posts natively to the five platforms Kenyans use every day.
                  You write once — Andika sizes the caption, picks the hashtags and ships it.</p>
              </div>
              <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center">
                ${U.PLATFORMS.map(p=>`<div style="text-align:center">
                  <span class="plat-dot" style="width:52px;height:52px;border-radius:14px;background:${p.color};margin:0 auto 6px;display:flex;align-items:center;justify-content:center">
                    <span style="width:26px;height:26px;display:inline-flex">${App.platformIcon(p.id)}</span></span>
                  <div class="small" style="font-weight:700;font-family:var(--font-display)">${p.name}</div></div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="section-sm">
        <div class="container">
          <div class="cta-band reveal">
            <h2>Try every feature free today</h2>
            <p>No card needed. Generate captions, explore the dashboard and publish your first post — upgrade with M-PESA only when you are ready.</p>
            <a class="btn btn-light btn-lg" href="#/signup">Create free account ${I.arrowRight}</a>
          </div>
        </div>
      </section>`;
      App.observeReveals(view);
    }
  });

  /* ================= PRICING ================= */
  const COMPARE_ROWS = [
    ['AI caption generation (English / Kiswahili / Sheng)', true, true],
    ['Kenyan hashtag packs & CTAs', true, true],
    ['Saved posts', '10 posts', 'Unlimited'],
    ['Publish to Facebook, Instagram, WhatsApp, TikTok, X', false, true],
    ['Scheduling & content calendar', false, true],
    ['Reach & engagement analytics', 'Basic', 'Full'],
    ['Weekly trend charts', false, true],
    ['CSV export', false, true],
    ['Support', 'Community', 'Priority WhatsApp'],
  ];

  App.registerPage({
    key:'pricing', exact:true, path:'/pricing',
    title:'Pricing — free to start, Ksh 1,000/month for Pro',
    description:'Simple Kenyan pricing: a free forever plan and Pro at Ksh 1,000 per month paid via M-PESA through PayBridge. Cancel anytime, no cards needed.',
    render(){
      const view = App.renderPublicChrome('pricing');
      view.innerHTML = `
      <section class="reco-hero">
        <div class="container center reveal visible" style="max-width:720px">
          <span class="eyebrow">Pricing</span>
          <h1>Simple pricing, paid na <span class="grad-text">M-PESA.</span></h1>
          <p class="lead">Start free, forever. Upgrade to Pro for the price of two plates of chips —
            cancel anytime, and Pro stays active until your month ends.</p>
        </div>
      </section>
      <section class="section-sm">
        <div class="container">
          <div class="price-grid">
            <div class="price-card reveal">
              <h3>Free</h3>
              <p class="muted small" style="margin-bottom:0">For getting started and finding your rhythm</p>
              <div class="price-amount">Ksh 0<span class="per"> /forever</span></div>
              <ul class="price-feats">
                ${['AI captions in English, Kiswahili & Sheng','Kenyan hashtag packs for every post','Up to 10 saved posts','Basic analytics','1 business profile'].map(f=>
                  `<li>${I.checkCircle}<span>${f}</span></li>`).join('')}
              </ul>
              <a class="btn btn-ghost btn-lg btn-block" href="${ctaForPlan('free')}">Start for free</a>
            </div>
            <div class="price-card pro reveal d1">
              <span class="price-badge">Most popular</span>
              <h3>Pro</h3>
              <p class="muted small" style="margin-bottom:0">For businesses serious about winning customers</p>
              <div class="price-amount">Ksh 1,000<span class="per"> /month</span></div>
              <ul class="price-feats">
                ${['Everything in Free, plus:','Unlimited posts & drafts','Publish & schedule to all 5 platforms','Full reach & engagement analytics','Weekly trend charts','CSV export of all content','Priority WhatsApp support'].map(f=>
                  `<li>${I.checkCircle}<span>${f}</span></li>`).join('')}
              </ul>
              <a class="btn btn-primary btn-lg btn-block" href="${ctaForPlan('pro')}">Choose Pro — pay with M-PESA</a>
              <p class="tiny muted center" style="margin:10px 0 0">Secure PayBridge checkout · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>
      <section class="section-sm">
        <div class="container">
          <h2 class="center reveal" style="margin-bottom:var(--s-6)">Compare what\'s included</h2>
          <div class="table-scroll reveal">
            <table class="compare-table">
              <thead><tr><th>Feature</th><th>Free</th><th>Pro · Ksh 1,000/mo</th></tr></thead>
              <tbody>
                ${COMPARE_ROWS.map(r=>`<tr>
                  <td>${r[0]}</td>
                  <td>${r[1]===true ? `<span class="yes" aria-label="Included">${I.check}</span>` : r[1]===false ? `<span class="no" aria-label="Not included">—</span>` : `<strong>${esc(r[1])}</strong>`}</td>
                  <td>${r[2]===true ? `<span class="yes" aria-label="Included">${I.check}</span>` : r[2]===false ? `<span class="no" aria-label="Not included">—</span>` : `<strong>${esc(r[2])}</strong>`}</td>
                </tr>`).join('')}
                <tr><td></td><td><a class="btn btn-ghost btn-sm" href="${ctaForPlan('free')}">Choose Free</a></td>
                <td><a class="btn btn-primary btn-sm" href="${ctaForPlan('pro')}">Choose Pro</a></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section class="section-sm">
        <div class="container">
          <div class="faq reveal">
            ${App.faqItem('How does the M-PESA payment work?',
              'At checkout you enter your Safaricom number. PayBridge sends an STK push to your phone — enter your M-PESA PIN and the payment completes. Your Pro plan activates immediately and a receipt is saved in Billing.')}
            ${App.faqItem('What happens after the first month?',
              'Your Pro subscription renews monthly at Ksh 1,000 via PayBridge. You can cancel anytime from Billing; you keep Pro until the end of the paid period, then drop to Free automatically.')}
            ${App.faqItem('Can I switch back to Free?',
              'Yes, with two taps in your Billing page. Your posts and data are kept safe either way — you only lose Pro features when the paid month ends.')}
          </div>
          <div class="cta-band reveal" style="margin-top:var(--s-10)">
            <h2>Ready when you are</h2>
            <p>Start on Free today — your first caption takes about 30 seconds.</p>
            <a class="btn btn-light btn-lg" href="#/signup">Start free ${I.arrowRight}</a>
          </div>
        </div>
      </section>`;
      App.observeReveals(view);
      App.bindFaq(view);
    }
  });
})();
