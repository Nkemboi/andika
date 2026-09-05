/* Andika — data store (persisted, per-user isolation) */
(function(){
  const App = window.App = window.App || {};
  const U = App.utils;
  const KEYS = {
    users:'andika_users', session:'andika_session', records:'andika_records',
    payments:'andika_payments', messages:'andika_messages'
  };

  function read(key, fallback){
    try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch(e){ return fallback; }
  }
  function write(key, val){
    try{ localStorage.setItem(key, JSON.stringify(val)); }
    catch(e){ App.toast && App.toast('Storage is unavailable in this browser','error'); }
  }

  const Store = App.store = {
    /* ---------- users / auth ---------- */
    users(){ return read(KEYS.users, []); },
    saveUsers(u){ write(KEYS.users, u); },

    findUserByEmail(email){
      const e = String(email||'').trim().toLowerCase();
      return this.users().find(u => u.email.toLowerCase() === e) || null;
    },
    getUser(id){ return this.users().find(u=>u.id===id) || null; },

    signup({name, email, password}){
      email = String(email).trim().toLowerCase();
      if(this.findUserByEmail(email)){
        const err = new Error('An account with this email already exists. Sign in instead.');
        err.field = 'email'; throw err;
      }
      const user = {
        id: U.uid('usr'),
        name: String(name||'').trim(),
        email,
        passHash: U.hash(password),
        google: false,
        createdAt: new Date().toISOString(),
        plan: 'free',
        planRenewsAt: null,
        planCancelsAt: null,
        profile: { businessName:'', businessType:'', county:'Nairobi', phone:'', bio:'' },
        settings: { defaultPlatform:'instagram', defaultTone:'Friendly & warm', weeklyGoal:5, emailDigest:true, plannerReminder:'Monday' },
        socials: {}
      };
      const users = this.users(); users.push(user); this.saveUsers(users);
      write(KEYS.session, user.id);
      return user;
    },

    signin({email, password}){
      const user = this.findUserByEmail(email);
      if(!user || !user.passHash || user.passHash !== U.hash(password)){
        const err = new Error('Invalid email or password. Please try again.');
        err.field = 'password'; throw err;
      }
      write(KEYS.session, user.id);
      return user;
    },

    googleSignin({name, email}){
      email = String(email).trim().toLowerCase();
      let user = this.findUserByEmail(email);
      if(!user){
        user = {
          id: U.uid('usr'), name: name || email.split('@')[0].replace(/[._]/g,' '),
          email, passHash:null, google:true,
          createdAt: new Date().toISOString(), plan:'free', planRenewsAt:null, planCancelsAt:null,
          profile:{ businessName:'', businessType:'', county:'Nairobi', phone:'', bio:'' },
          settings:{ defaultPlatform:'instagram', defaultTone:'Friendly & warm', weeklyGoal:5, emailDigest:true, plannerReminder:'Monday' },
          socials:{}
        };
        const users = this.users(); users.push(user); this.saveUsers(users);
      }
      write(KEYS.session, user.id);
      return user;
    },

    signout(){ localStorage.removeItem(KEYS.session); },

    currentUserId(){ return read(KEYS.session, null); },
    currentUser(){
      const id = this.currentUserId();
      if(!id) return null;
      const u = this.getUser(id);
      if(!u){ localStorage.removeItem(KEYS.session); return null; }
      // apply pending cancellation / renewal
      let changed = false;
      if(u.plan === 'pro' && u.planCancelsAt && new Date(u.planCancelsAt) <= new Date()){
        u.plan = 'free'; u.planRenewsAt = null; u.planCancelsAt = null; changed = true;
      }
      if(changed) this.updateUser(u);
      return u;
    },

    updateUser(patch){
      const users = this.users();
      const i = users.findIndex(u=>u.id===patch.id);
      if(i<0) return null;
      users[i] = Object.assign({}, users[i], patch);
      this.saveUsers(users);
      return users[i];
    },

    changePassword(userId, currentPass, newPass){
      const u = this.getUser(userId);
      if(!u) throw new Error('User not found.');
      if(u.passHash && u.passHash !== U.hash(currentPass)){
        const e = new Error('Your current password is incorrect.'); e.field='currentPassword'; throw e;
      }
      this.updateUser({id:userId, passHash: U.hash(newPass)});
    },

    deleteAccount(userId){
      this.saveUsers(this.users().filter(u=>u.id!==userId));
      write(KEYS.records, this.allRecords().filter(r=>r.userId!==userId));
      write(KEYS.payments, this.allPayments().filter(p=>p.userId!==userId));
      localStorage.removeItem(KEYS.session);
    },

    /* ---------- content records (isolated per user) ---------- */
    allRecords(){ return read(KEYS.records, []); },
    listRecords(userId){
      return this.allRecords().filter(r=>r.userId===userId)
        .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    },
    getRecord(id, userId){
      return this.allRecords().find(r=>r.id===id && r.userId===userId) || null;
    },
    addRecord(rec){
      const all = this.allRecords();
      const row = Object.assign({
        id: U.uid('rec'),
        createdAt: new Date().toISOString(),
        status:'draft', caption:'', category:'Promotion',
        scheduledFor:null, publishedAt:null,
        stats:null
      }, rec);
      all.push(row); write(KEYS.records, all);
      return row;
    },
    updateRecord(id, userId, patch){
      const all = this.allRecords();
      const i = all.findIndex(r=>r.id===id && r.userId===userId);
      if(i<0) throw new Error('Record not found.');
      all[i] = Object.assign({}, all[i], patch);
      write(KEYS.records, all);
      return all[i];
    },
    deleteRecord(id, userId){
      write(KEYS.records, this.allRecords().filter(r=>!(r.id===id && r.userId===userId)));
    },

    /* ---------- payments / billing ---------- */
    allPayments(){ return read(KEYS.payments, []); },
    listPayments(userId){
      return this.allPayments().filter(p=>p.userId===userId)
        .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    },
    addPayment(pay){
      const all = this.allPayments();
      const row = Object.assign({ id: U.uid('pay'), createdAt: new Date().toISOString(), status:'success' }, pay);
      all.push(row); write(KEYS.payments, all);
      return row;
    },
    activatePro(userId, payment){
      const u = this.getUser(userId);
      const renews = new Date(); renews.setMonth(renews.getMonth()+1);
      return this.updateUser({
        id:userId, plan:'pro',
        planRenewsAt: renews.toISOString(),
        planCancelsAt:null,
        lastPaymentRef: payment && payment.reference
      });
    },
    cancelPro(userId){
      const u = this.getUser(userId);
      if(!u || u.plan!=='pro') return;
      // cancels at end of current period
      this.updateUser({ id:userId, planCancelsAt: u.planRenewsAt || U.monthFromNow() });
    },

    /* ---------- connected social accounts ---------- */
    getSocials(userId){
      const u = this.getUser(userId);
      return (u && u.socials) || {};
    },
    getSocial(userId, platform){
      const s = this.getSocials(userId);
      return s[platform] || null;
    },
    isConnected(userId, platform){
      const s = this.getSocial(userId, platform);
      return !!(s && s.connected);
    },
    connectSocial(userId, platform, handle, displayName){
      const u = this.getUser(userId);
      const socials = Object.assign({}, u.socials || {});
      socials[platform] = {
        connected: true,
        handle: String(handle||'').replace(/^@+/,''),
        displayName: displayName || ('@'+String(handle||'').replace(/^@+/,'')),
        connectedAt: new Date().toISOString()
      };
      this.updateUser({ id:userId, socials });
      return socials[platform];
    },
    disconnectSocial(userId, platform){
      const u = this.getUser(userId);
      const socials = Object.assign({}, u.socials || {});
      if(socials[platform]){
        socials[platform] = { connected:false, handle:'', displayName:'', connectedAt:null };
        this.updateUser({ id:userId, socials });
      }
    },

    /* ---------- contact messages ---------- */
    allMessages(){ return read(KEYS.messages, []); },
    addMessage(msg){
      const all = this.allMessages();
      const row = Object.assign({ id: U.uid('msg'), createdAt: new Date().toISOString(), status:'new' }, msg);
      all.push(row); write(KEYS.messages, all);
      return row;
    }
  };
})();
