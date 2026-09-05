/* Andika — content generation engine (built-in, no external API key) */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils;

  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const pickN = (arr,n) => arr.slice().sort(()=>Math.random()-.5).slice(0,n);

  const HOOKS = {
    'Promotion':[
      'Leo tu! 🔥 Bei ya macho 👀',
      'Ebu simama hapo! Hii offer haidumu kwa mwezi 😅',
      'Wueh! Hii ni deal ya mwaka 💥',
      'Tumepunguza bei! Na hatutoi tena hadi lini... 🤫',
      'Bei poa, quality kubwa. Hiyo ndio combo tunayouza leo 🎉'
    ],
    'Engagement':[
      'Swali kwa wapenda good things: ukipata hii, unashinda nani? 😄',
      'Wadau, sema ukweli kwa comment 👇',
      'Tushike kwa hii: nani amekuwa akingoja restock? 🙋🏾‍♀️',
      'Tag mwenyezi unayemjua anahitaji hii leo 👀',
      'Kuna nini mko zone? Tupeni comments tupostories zenu 📲'
    ],
    'Educational':[
      'Kidogo unayostahili kujua kabla ya kununua 👇',
      'Wateja wengi hutuuliza hii swali. Hebu tujibu once and for all 🧵',
      'Tip ya leo ya biashara yako — hii itakuokoa pesa 💡',
      'Tumeona wengi wakikosea hapa. Hii ndio njia sahihi ✅',
      'Facts first: hii ndio tofauti kati ya kawaida na quality 📋'
    ],
    'Announcement':[
      'Habari njema kwa wateja wetu wote 📢',
      'Mmekuwa mkiomba, tumesikia. Sasa ni rasmi! 🎊',
      'Fungua masikio, hii ni muhimu kwa kila mteja wetu 🔔',
      'Tunafurahi kutangaza... 🥁',
      'Kuanzia leo, mambo yanaboreka zaidi ✨'
    ],
    'Testimonial':[
      'Mteja wetu alisema hivi, na hatukuweza kuficha 🥹',
      'Proof huwa haipewi presentation — inapatikana kwa results 😌',
      'Hii ndio sababu wateja wanarudi tena na tena ⭐',
      'Asante kwa kutuamini. Maneno yenu ndio chapa yetu 🙏',
      'Mauzo yanaongea zenyewe. Angalia mteja alichosema 👇'
    ]
  };

  const CTAS = [
    'DM usasa au WhatsApp 07XX-XXX-XXX, stock ni kidogo! 🛒',
    'Bonyeza link kwa bio u-order leo — delivery ndani ya Nairobi leo hii! 🚚',
    'Piga simu au tutumie WhatsApp nambari iliyo kwa profile tupange delivery. 📞',
    'Order yako inakungoja — tupigie 07XX-XXX-XXX au DM. Karibu sana! 🤝',
    'Tupatane dukani: tuko wazi kuanzia 8am hadi 8pm. Eneo: tuma DM tukupatie direction 📍'
  ];

  const HASHTAGS = {
    base: ['#Kenya','#Nairobi','#SupportLocalKE','#BuyKenya','#SmallBusinessKenya','#BiasharaKenya','#KOT','#MadeInKenya'],
    facebook:  ['#FacebookKenya','#NairobiMarketplace'],
    instagram: ['#IGKenya','#KenyaGram','#NairobiFashion'],
    whatsapp:  ['#WhatsAppBusiness','#StatusMali'],
    tiktok:    ['#TikTokKenya','#KenyaTikTok','#fyp','#viralKE'],
    x:         ['#KenyaOnX','#Baze']
  };

  const TONE_OPENERS = {
    'Friendly & warm':['Jamani team! 💕','Hallo wateja wetu wapendwa! 😊','Mpo wapi wadau? 🥰'],
    'Bold & hyped':['Sikilizeni vizuri! 🔥','Hii si mchezo! 💪','Attention, attention! 📣'],
    'Professional':['Tunapenda kuwafahamisha,', 'Kwa wateja wanaotafuta quality,', 'Kwa heshima zote,'],
    'Funny & relatable':['Kumbe ndio hivi? 😂','Wueh, hata sisi tumeshangaa 🤭','Budget inaposema "si hii month" lakini quality inaita... 😩']
  };

  const PLATFORM_TIPS = {
    facebook:  ['Piga post kati ya saa tatu hadi kumi za jioni — wateja wako wako Facebook baada ya kazi.',
                'Tumia picha kali ya bidhaa kwanza, halafu eleza bei waziwazi. Wakenya hupenda comments za "price?" zikapatiwa jibu mapema.'],
    instagram: ['Reels huvuta mara tano zaidi ya picha — onyesha bidhaa ikitumiwa, si kukaa tu.',
                'Hashtag 5 hadi 8 tu, zenye relevance. Jibu kila DM chini ya dakika 30.'],
    whatsapp:  ['Status ya asubuhi (saa mbili) na ya jioni (saa nane) huwa na views zaidi.',
                'Weka catalogue yako kwenye WhatsApp Business na u-tag bei — mauzo hufuata.'],
    tiktok:    ['Sekunde tatu za kwanza ni muhimu — anza na bidhaa ikitenda kazi, si introduction.',
                'Tumia sauti za trending Kenya. Video fupi, wimbo mzuri, maandishi makubwa.'],
    x:         ['Thread fupi huenda mbali — twende point kwa point, na u-tag brands husika.',
                'Post asubuhi saa mbili na mchana saa saba. Jibu replies haraka, algorithm hupenda hayo.']
  };

  const App2 = App; // keep linter calm

  App.generator = {
    tips(platform){ return PLATFORM_TIPS[platform] || PLATFORM_TIPS.instagram; },

    generate({ platform, category, topic, tone, businessName }){
      topic = String(topic||'').trim();
      category = category || 'Promotion';
      tone = tone || 'Friendly & warm';
      const bname = businessName ? String(businessName).trim() : 'Biashara yako';

      const hook = pick(HOOKS[category] || HOOKS['Promotion']);
      const opener = pick(TONE_OPENERS[tone] || TONE_OPENERS['Friendly & warm']);
      const cta = pick(CTAS);

      let body = '';
      const subject = topic ? topic : 'bidhaa zetu mpya';

      if(category === 'Promotion'){
        body = `${opener}\n\n${hook}\n\n`+
          `${subject} viko tayari — quality ya uhakika, bei ya rafiki, na tuna-deliver hadi kwa mteja. `+
          `Ukijaribu utarudi; usipojaribu hutajua. Tupo hapa kukuhudumia, sio kukuuzia tu. 🙌\n\n`+
          `${cta}\n\n${bname} — quality isiyokuangusha.`;
      } else if(category === 'Engagement'){
        body = `${hook}\n\n`+
          `Tumetaka kusikia kutoka kwenu: ${subject} — mnasemaje? `+
          `Toeni maoni, tagi rafiki, na mwenye jibu zuri tuna-repost kwenye story yetu leo. 🎁\n\n`+
          `Tukishirikiane, biashara inakua kwa wote. Karibu sana! 🙏`;
      } else if(category === 'Educational'){
        body = `${opener}\n\n${hook}\n\n`+
          `Kuhusu ${subject}: jambo la kwanza, angalia quality kabla ya bei — vya bei rahisi mara nyingi vinalipa mara mbili. `+
          `Pili, uliza maswali yote mapema; muuzaji mzuri hujibu bila woga. Tatu, hifadhi receipt yako. 🧾\n\n`+
          `Kwa ${bname}, tunaheshimu maswali yenu — DM, tunajibu kila moja.\n\n${cta}`;
      } else if(category === 'Announcement'){
        body = `${opener}\n\n${hook}\n\n`+
          `Kuanzia leo, ${subject}. Hii ni baada ya maombi mengi kutoka kwenu, na tumefanyia kazi vizuri. `+
          `Ratiba zetu bado ni ile ile: tukufungua, tunafunga na wewe ukiridhika. ✅\n\n`+
          `${cta}\n\nKaribuni sana — asanteni kwa kuendelea kutuamini.`;
      } else {
        body = `${hook}\n\n`+
          `“${subject}” — hayo ni maneno ya mteja aliyepata huduma zetu wiki hii. `+
          `Hatuna mazingaombwe; tunafanya kazi kwa uaminifu na kuzingatia deadline. ⭐\n\n`+
          `Na wewe unaweza kuwa hadithi inayofuata. ${cta}\n\n— Timu ya ${bname}`;
      }

      const tags = pickN(HASHTAGS.base.concat(HASHTAGS[platform]||[]), 8).join(' ');
      const caption = `${body}\n\n${tags}`;

      return {
        title: this.titleFor(category, topic, platform),
        caption,
        platformTip: pick(PLATFORM_TIPS[platform] || PLATFORM_TIPS.instagram)
      };
    },

    titleFor(category, topic, platform){
      const t = topic ? String(topic).slice(0,48) : null;
      const map = {
        'Promotion': t ? `Promo: ${t}` : 'Weekend promotion post',
        'Engagement': t ? `Engage: ${t}` : 'Audience engagement question',
        'Educational': t ? `Tip: ${t}` : 'Customer education post',
        'Announcement': t ? `News: ${t}` : 'Business announcement',
        'Testimonial': t ? `Review: ${t}` : 'Customer spotlight'
      };
      return map[category] || 'New content';
    },

    // realistic random engagement for published posts
    statsFor(){
      const reach = 200 + Math.floor(Math.random()*3800);
      return {
        reach,
        likes: Math.round(reach*(0.06+Math.random()*0.12)),
        comments: Math.round(reach*(0.008+Math.random()*0.03)),
        shares: Math.round(reach*(0.005+Math.random()*0.02))
      };
    }
  };
})();
