/* Andika — recommendation engine for the public Recommend page.
   Given business type, town and goal, builds a practical content plan. */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils;

  const TYPES = {
    salon:     { label:'Salon / Barbershop', ideas:[
      'Before/after transformation reel (nywele mpya)',
      'Tuesday "offer ya nywele" with clear price',
      'Customer of the week repost with permission',
      'Behind-the-scenes: salon yako ikifunguliwa asubuhi',
      'Tip: jinsi ya kutunza braid zako kwa wiki 3+',
      'Poll: gel vs. press-in — wateja wako wanapenda nini?'
    ]},
    food:      { label:'Restaurant / Café / Chips mwitu', ideas:[
      'Pika kwa camera: chakula kikitoka jikoni 🍳',
      'Menu Tuesday: onyesha dish moja kwa bei yake',
      'Mpango wa lunch: "Order before 12pm, delivery CBD"',
      'Review ya mteja akiwa amepokea order',
      'Weekend special teaser (nyama choma / samaki)',
      'Behind the scenes: usafi wa jiko lako'
    ]},
    retail:    { label:'Retail shop / Duka', ideas:[
      'Restock alert: vitu vipya vimefika leo',
      'Price list post — wazi, bila DM mingi',
      'How-to video: bidhaa ikitumiwa vizuri',
      'Bundle deal: "ukichukua 2, bei yashuka"',
      'Customer question of the week + jibu',
      'Location/direction video kwa wageni wa mtaani'
    ]},
    fashion:   { label:'Mitumba / Fashion / Boutique', ideas:[
      'Haul reel: mavaa 5 mapya yaliyofika',
      'Styling video: outfit moja, occasions tatu',
      'Size guide carousel kwa online buyers',
      'Flash sale ya weekend kwa stock ya pekee',
      'Customer fit-check repost',
      'Price range post ya jumla na rejareja'
    ]},
    electronics:{ label:'Phone accessories / Electronics', ideas:[
      'Unboxing video ya accessory mpya',
      'Tip: jinsi ya kuepuka fake chargers',
      'Compare: bidhaa asili vs. imitation',
      'Screen guard/application demo',
      'Warranty & return policy explained clearly',
      'Same-day delivery post kwa Nairobi'
    ]},
    agri:      { label:'Agribusiness / Groceries / Mboga', ideas:[
      'Harvest ya leo: mavao ya shambani 🥬',
      'Pre-order post: "fika sokoni asubuhi"',
      'Bei ya leo list (mahindi, mayai, mboga)',
      'Farm tour video fupi ya mzunguko',
      'Seasonal tip: nini cha kukuza mwezi huu',
      'Bulk delivery offer kwa mama mboga na hotels'
    ]},
    cosmetics: { label:'Cosmetics / Pharmacy / Beauty shop', ideas:[
      'Product spotlight: inafanyia nini hasa?',
      'Skin-type guide carousel (dry/oily/normal)',
      'Myth vs. fact post ya skincare',
      'Restock ya vitu vilivyoisha',
      'Consultation invite: DM kipimo cha ngozi',
      'Loyalty: nunua 3 pata 1 offer'
    ]},
    fitness:   { label:'Gym / Fitness / Wellness', ideas:[
      'Transformation Tuesday ya member (kwa ruhusa)',
      'Class timetable ya wiki',
      '30-second form-check video',
      'Member offer: registration discount',
      'Nutrition tip rahisi ya Kienyeji',
      'Community challenge announcement'
    ]},
    realestate:{ label:'Real estate / Rentals', ideas:[
      'House tour video fupi (60 seconds)',
      'Price & location breakdown post',
      'Landlord/tenant Q&A carousel',
      'Neighbour spotlight: mtaa huu una nini?',
      'Tip: nini cha kuangalia kabla ya kulipa deposit',
      'New listing alert with clear rent range'
    ]},
    services:  { label:'Freelance / Professional services', ideas:[
      'Before/after ya kazi yako (portfolio)',
      'Client win testimonial',
      'Educational carousel: unawasaidiaje wateja',
      'Common mistake businesses make (your angle)',
      'Free tip Friday + CTA ya DM',
      'About-you video: kwa nini wakuchague wewe'
    ]}
  };

  const PLATFORM_RANK = {
    salon:      ['instagram','tiktok','facebook','whatsapp','x'],
    food:       ['tiktok','instagram','facebook','whatsapp','x'],
    retail:     ['facebook','whatsapp','instagram','tiktok','x'],
    fashion:    ['instagram','tiktok','facebook','whatsapp','x'],
    electronics:['tiktok','instagram','facebook','whatsapp','x'],
    agri:       ['whatsapp','facebook','tiktok','instagram','x'],
    cosmetics:  ['instagram','tiktok','facebook','whatsapp','x'],
    fitness:    ['instagram','tiktok','facebook','x','whatsapp'],
    realestate: ['facebook','instagram','tiktok','whatsapp','x'],
    services:   ['x','instagram','facebook','tiktok','whatsapp']
  };

  const CALENDAR = [
    ['Monday','Educational carousel — tip ya wiki kwa wateja wako'],
    ['Tuesday','Promo post — offer ya kati ya wiki, bei wazi'],
    ['Wednesday','Engagement — swali/poll kwa audience yako'],
    ['Thursday','Behind the scenes / short video ya biashara'],
    ['Friday','Promo weekend — stock mpya au flash sale'],
    ['Saturday','Customer content — repost, review au testimonial'],
    ['Sunday','Pumzika kidogo: status fupi ya WhatsApp inatosha']
  ];

  const BEST_TIMES = [
    'Facebook: 1pm–2pm na 7pm–9pm (baada ya kazi)',
    'Instagram: 12pm–1pm na 8pm–10pm (evening scroll)',
    'TikTok: 7pm–10pm — views huongezeka usiku',
    'WhatsApp status: 8am–9am na 8pm–9pm',
    'X: 8am–9am na 1pm–2pm'
  ];

  App.recommend = {
    types: TYPES,

    buildPlan({ type, town, goal, hours }){
      const t = TYPES[type] || TYPES.retail;
      const rank = (PLATFORM_RANK[type] || PLATFORM_RANK.retail).slice(0,4);
      const weights = goal === 'awareness' ? [34,28,22,16]
                    : goal === 'engagement' ? [26,30,24,20]
                    : [30,24,28,18]; // sales
      const platforms = rank.map((id,i)=>({
        id, name: U.platform(id).name, pct: weights[i]
      })).filter(p => U.PLATFORMS.some(x=>x.id===p.id));

      const postsPerWeek = hours === '1' ? 3 : hours === '3' ? 5 : 7;

      return {
        businessLabel: t.label,
        town: town || 'Nairobi',
        goal: goal,
        postsPerWeek,
        platforms,
        ideas: t.ideas,
        calendar: CALENDAR,
        times: BEST_TIMES,
        hashtags: ['#Kenya','#'+(town||'Nairobi').replace(/\s+/g,''),'#SupportLocalKE','#BiasharaKenya','#BuyKenya','#SmallBusinessKenya','#MkenyaMjanja']
      };
    },

    toText(plan){
      const lines = [];
      lines.push('ANDAKA CONTENT PLAN');
      lines.push('===================');
      lines.push('Business: '+plan.businessLabel);
      lines.push('Town: '+plan.town);
      lines.push('Recommended posts per week: '+plan.postsPerWeek);
      lines.push('');
      lines.push('PLATFORM PRIORITY');
      plan.platforms.forEach((p,i)=>lines.push(` ${i+1}. ${p.name} — ${p.pct}% of effort`));
      lines.push('');
      lines.push('WEEKLY CONTENT CALENDAR');
      plan.calendar.forEach(([d,task])=>lines.push(` ${d}: ${task}`));
      lines.push('');
      lines.push('CONTENT IDEAS');
      plan.ideas.forEach((x,i)=>lines.push(` ${i+1}. ${x}`));
      lines.push('');
      lines.push('BEST POSTING TIMES (EAT)');
      plan.times.forEach(t=>lines.push(' - '+t));
      lines.push('');
      lines.push('HASHTAG PACK');
      lines.push(' '+plan.hashtags.join(' '));
      lines.push('');
      lines.push('Generated with Andika — content that sells for Kenyan small businesses.');
      return lines.join('\n');
    }
  };
})();
