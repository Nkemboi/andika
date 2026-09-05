/*
 * Andika — real M-PESA (Daraja) STK-push backend + static file server.
 * Zero dependencies (Node 18+ built-in http/https/fetch).
 *
 * It does two jobs:
 *   1. Serves the static single-file app (../index.html)
 *   2. Proxies the M-PESA Daraja STK push so your consumer secret is never
 *      exposed to the browser:
 *        POST /api/stkpush   { phone:"07..|254..", amount:1000 }
 *        GET  /api/stkstatus?checkoutRequestId=...
 *
 * Credentials come from environment variables (see .env.example).
 * Without them the API returns a clear 503 rather than faking a payment.
 *
 *   DARAJA_ENV=sandbox|live   (default sandbox)
 *   DARAJA_CONSUMER_KEY=...
 *   DARAJA_CONSUMER_SECRET=...
 *   DARAJA_SHORTCODE=...      (paybill/till, e.g. 174379 for sandbox test)
 *   DARAJA_PASSKEY=...
 *   DARAJA_CALLBACK_URL=...   (public https URL Daraja posts results to)
 *
 * Run:  node server/server.js   (http://localhost:8000)
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Zero-dependency .env loader: copies server/.env into process.env
// (real environment variables always win).
(function loadEnv(){
  try{
    const envPath = path.join(__dirname, '.env');
    if(!fs.existsSync(envPath)) return;
    fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line=>{
      line = line.trim();
      if(!line || line.startsWith('#')) return;
      const eq = line.indexOf('=');
      if(eq < 0) return;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq+1).trim();
      if((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))){
        val = val.slice(1, -1);
      }
      if(key && !(key in process.env)) process.env[key] = val;
    });
  }catch(e){ console.warn('Could not read server/.env:', e.message); }
})();

const PORT = process.env.PORT || 8000;
const ROOT = path.join(__dirname, '..');
const DARAJA_ENV = (process.env.DARAJA_ENV || 'sandbox').toLowerCase();
const DARAJA_HOST = DARAJA_ENV === 'live' ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke';

const CONFIG = {
  consumerKey: process.env.DARAJA_CONSUMER_KEY || '',
  consumerSecret: process.env.DARAJA_CONSUMER_SECRET || '',
  shortcode: process.env.DARAJA_SHORTCODE || '174379',
  passkey: process.env.DARAJA_PASSKEY || '',
  callbackUrl: process.env.DARAJA_CALLBACK_URL || `https://example.com/api/callback`,
};

function darajaRequest(method, reqPath, body, token){
  return new Promise((resolve, reject)=>{
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if(token) headers['Authorization'] = 'Bearer ' + token;
    else headers['Authorization'] = 'Basic ' + Buffer.from(CONFIG.consumerKey + ':' + CONFIG.consumerSecret).toString('base64');
    if(payload) headers['Content-Length'] = Buffer.byteLength(payload);
    const req = https.request({ host: DARAJA_HOST, path: reqPath, method, headers }, res=>{
      let data = '';
      res.on('data', c => data += c);
      res.on('end', ()=>{
        try{
          const json = data ? JSON.parse(data) : {};
          if(res.statusCode >= 400) return reject(new Error(json.errorMessage || ('Daraja HTTP ' + res.statusCode)));
          resolve(json);
        }catch(e){ reject(new Error('Bad Daraja response: ' + data.slice(0,200))); }
      });
    });
    req.on('error', reject);
    if(payload) req.write(payload);
    req.end();
  });
}

async function getAccessToken(){
  const r = await darajaRequest('GET', '/oauth/v1/generate?grant_type=client_credentials', null, null);
  if(!r.access_token) throw new Error('No access token from Daraja.');
  return r.access_token;
}

function normalizePhone(p){
  let s = String(p||'').replace(/[\s-]/g,'');
  if(s.startsWith('+254')) s = '254' + s.slice(4);
  else if(s.startsWith('254')) s = '254' + s.slice(3);
  else if(s.startsWith('0')) s = '254' + s.slice(1);
  if(/^254[17]\d{8}$/.test(s)) return s;
  return null;
}
function timestamp(){
  const d = new Date();
  const p = n => String(n).padStart(2,'0');
  return '' + d.getFullYear() + p(d.getMonth()+1) + p(d.getDate()) + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
}

async function stkPush({ phone, amount }){
  const token = await getAccessToken();
  const ts = timestamp();
  const password = Buffer.from(CONFIG.shortcode + CONFIG.passkey + ts).toString('base64');
  const partyA = normalizePhone(phone);
  if(!partyA) throw Object.assign(new Error('Enter a valid Safaricom number, e.g. 0712 345 678'), { field:'phone' });
  const body = {
    BusinessShortCode: CONFIG.shortcode,
    Password: password,
    Timestamp: ts,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(Number(amount)),
    PartyA: partyA,
    PartyB: CONFIG.shortcode,
    PhoneNumber: partyA,
    CallBackURL: CONFIG.callbackUrl,
    AccountReference: 'Andika Pro',
    TransactionDesc: 'Andika Pro monthly subscription'
  };
  return darajaRequest('POST', '/mpesa/stkpush/v1/processrequest', body, token);
}

async function stkStatus(checkoutRequestId){
  const token = await getAccessToken();
  const ts = timestamp();
  const password = Buffer.from(CONFIG.shortcode + CONFIG.passkey + ts).toString('base64');
  const body = {
    BusinessShortCode: CONFIG.shortcode,
    Password: password,
    Timestamp: ts,
    CheckoutRequestID: checkoutRequestId
  };
  return darajaRequest('POST', '/mpesa/stkpushquery/v1/query', body, token);
}

function sendJSON(res, code, obj){
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' });
  res.end(body);
}
function readBody(req){
  return new Promise((resolve)=>{
    let d=''; req.on('data',c=>d+=c); req.on('end',()=>{ try{ resolve(d?JSON.parse(d):{}); }catch{ resolve({}); } });
  });
}

const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.svg':'image/svg+xml', '.json':'application/json', '.ico':'image/x-icon' };
function serveStatic(req, res){
  let urlPath = req.url.split('?')[0];
  if(urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[/\\])+/,''));
  if(!filePath.startsWith(ROOT)){ res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, (err, data)=>{
    if(err){ res.writeHead(404, {'Content-Type':'text/plain'}); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res)=>{
  if(req.method === 'OPTIONS'){
    res.writeHead(204, { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type' });
    return res.end();
  }
  const url = req.url.split('?')[0];

  if(url === '/api/health'){
    return sendJSON(res, 200, { ok:true, darajaConfigured: !!(CONFIG.consumerKey && CONFIG.passkey), env: DARAJA_ENV });
  }

  if(url === '/api/stkpush' && req.method === 'POST'){
    if(!CONFIG.consumerKey || !CONFIG.passkey){
      return sendJSON(res, 503, { ok:false, error:'M-PESA is not configured on this server yet. Set DARAJA_CONSUMER_KEY / DARAJA_PASSKEY (see .env.example).' });
    }
    const body = await readBody(req);
    try{
      const r = await stkPush(body);
      if(r.ResponseCode === '0' && r.CheckoutRequestID){
        return sendJSON(res, 200, { ok:true, checkoutRequestId:r.CheckoutRequestID, merchantRequestId:r.MerchantRequestID, customerMessage:r.CustomerMessage });
      }
      return sendJSON(res, 400, { ok:false, error:r.errorMessage || r.CustomerMessage || 'STK push failed.' });
    }catch(err){
      return sendJSON(res, 502, { ok:false, error:err.message || 'STK push failed.' });
    }
  }

  if(url === '/api/stkstatus' && req.method === 'GET'){
    if(!CONFIG.consumerKey || !CONFIG.passkey){
      return sendJSON(res, 503, { ok:false, error:'M-PESA not configured.' });
    }
    const id = new URL(req.url, 'http://x').searchParams.get('checkoutRequestId');
    if(!id) return sendJSON(res, 400, { ok:false, error:'Missing checkoutRequestId' });
    try{
      const r = await stkStatus(id);
      // ResultCode "0" = success; 1032 = request cancelled by user; 500.001... = pending
      const code = String(r.ResultCode);
      if(code === '0'){
        return sendJSON(res, 200, { ok:true, status:'success', receipt: r.MpesaReceiptNumber || null, resultDesc:r.ResultDesc });
      }
      if(code === '1032'){
        return sendJSON(res, 200, { ok:true, status:'cancelled', resultDesc:r.ResultDesc || 'Payment cancelled on the handset.' });
      }
      return sendJSON(res, 200, { ok:true, status:'pending', resultCode:code, resultDesc:r.ResultDesc });
    }catch(err){
      // Daraja returns errorCode 500.001.1001 while the push is still pending
      const msg = err.message || '';
      if(msg.includes('500.001.1001') || msg.toLowerCase().includes('is being processed')){
        return sendJSON(res, 200, { ok:true, status:'pending' });
      }
      return sendJSON(res, 200, { ok:true, status:'pending', note:msg });
    }
  }

  // Daraja callback target (acknowledges the push result)
  if(url === '/api/callback' && req.method === 'POST'){
    const body = await readBody(req);
    console.log('[daraja callback]', JSON.stringify(body));
    return sendJSON(res, 200, { ResultCode:0, ResultDesc:'Accepted' });
  }

  serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', ()=>{
  console.log(`Andika server on http://localhost:${PORT} (Daraja: ${DARAJA_ENV}, configured: ${!!(CONFIG.consumerKey && CONFIG.passkey)})`);
});
