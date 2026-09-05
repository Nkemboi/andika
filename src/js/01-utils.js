/* Andika — utilities */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils = {};

  U.qs  = (sel, el) => (el||document).querySelector(sel);
  U.qsa = (sel, el) => Array.from((el||document).querySelectorAll(sel));

  U.esc = function(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  };

  U.uid = function(prefix){
    return (prefix||'id')+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  };

  U.hash = function(str){
    // lightweight non-reversible hash for local demo credentials
    let h = 5381;
    str = 'andika::'+String(str)+'::salt-254';
    for(let i=0;i<str.length;i++){ h = ((h<<5)+h)^str.charCodeAt(i); }
    return 'h'+(h>>>0).toString(16);
  };

  U.fmtKES = function(n){
    return 'Ksh ' + Number(n||0).toLocaleString('en-KE');
  };
  U.fmtNum = function(n){ return Number(n||0).toLocaleString('en-KE'); };

  U.fmtDate = function(iso, withTime){
    if(!iso) return '—';
    const d = new Date(iso);
    if(isNaN(d)) return '—';
    const opts = { day:'numeric', month:'short', year:'numeric' };
    let s = d.toLocaleDateString('en-KE', opts);
    if(withTime){ s += ', ' + d.toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'}); }
    return s;
  };
  U.fmtDateShort = function(iso){
    if(!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-KE',{day:'numeric',month:'short'});
  };
  U.todayISO = function(){ return new Date().toISOString().slice(0,10); };
  U.monthFromNow = function(){ const d=new Date(); d.setMonth(d.getMonth()+1); return d.toISOString(); };

  U.isValidEmail = function(e){
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e||'').trim().toLowerCase());
  };
  // Kenyan phone: 07xx / 01xx / +254xx / 254xx — 9 digits after 0 / 254
  U.normalizeKEPhone = function(p){
    let s = String(p||'').replace(/[\s-]/g,'');
    if(s.startsWith('+254')) s = '0'+s.slice(4);
    else if(s.startsWith('254')) s = '0'+s.slice(3);
    if(/^0[17]\d{8}$/.test(s)) return s;
    return null;
  };
  U.mpesaDisplay = function(p){
    const n = U.normalizeKEPhone(p);
    if(!n) return String(p||'');
    return '+254 ' + n.slice(1,4) + ' ' + n.slice(4,7) + ' ' + n.slice(7);
  };

  U.debounce = function(fn, ms){
    let t; return function(){ const a=arguments, c=this; clearTimeout(t); t=setTimeout(()=>fn.apply(c,a), ms||250); };
  };

  U.download = function(filename, text, type){
    const blob = new Blob([text], {type: type||'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 300);
  };

  U.toCSV = function(rows, columns){
    const head = columns.map(c=>'"'+c.label.replace(/"/g,'""')+'"').join(',');
    const lines = rows.map(r => columns.map(c=>{
      let v = c.get ? c.get(r) : r[c.key];
      v = v == null ? '' : String(v).replace(/"/g,'""');
      return '"'+v+'"';
    }).join(','));
    return head + '\n' + lines.join('\n');
  };

  U.copy = async function(text){
    try{ await navigator.clipboard.writeText(text); return true; }
    catch(e){
      const ta=document.createElement('textarea'); ta.value=text;
      ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta);
      ta.select();
      try{ document.execCommand('copy'); ta.remove(); return true; }catch(_){ ta.remove(); return false; }
    }
  };

  U.initials = function(name){
    const parts = String(name||'?').trim().split(/\s+/);
    return ((parts[0]||'?')[0] + (parts[1]?parts[1][0]:'')).toUpperCase();
  };

  U.qsParse = function(search){
    const out = {};
    String(search||'').replace(/^\?/,'').split('&').filter(Boolean).forEach(pair=>{
      const i = pair.indexOf('=');
      const k = decodeURIComponent(i<0?pair:pair.slice(0,i));
      const v = i<0?'':decodeURIComponent(pair.slice(i+1).replace(/\+/g,'%20'));
      out[k]=v;
    });
    return out;
  };

  U.weekAgo = function(n){ const d=new Date(); d.setDate(d.getDate()-7*n); return d; };

  // delay helper for simulated network
  U.wait = function(ms){ return new Promise(res=>setTimeout(res, ms)); };

  U.PLATFORMS = [
    {id:'facebook',  name:'Facebook',  color:'#1877f2'},
    {id:'instagram', name:'Instagram', color:'#c13584'},
    {id:'whatsapp',  name:'WhatsApp',  color:'#25d366'},
    {id:'tiktok',    name:'TikTok',    color:'#0f172a'},
    {id:'x',         name:'X',         color:'#0f172a'}
  ];
  U.platform = function(id){ return U.PLATFORMS.find(p=>p.id===id) || U.PLATFORMS[0]; };

  U.CATEGORIES = ['Promotion','Educational','Engagement','Announcement','Testimonial'];
  U.STATUSES   = ['draft','scheduled','published'];
})();
