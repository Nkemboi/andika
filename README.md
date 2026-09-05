# Andika — Content that sells for Kenyan small businesses 🇰🇪

**Andika** is a complete, single-file web application: a content creation platform
that helps Kenyan small businesses (salons, cafés, duka owners, mitumba sellers,
mama mboga…) write scroll-stopping social media captions in **English, Kiswahili
and Sheng**, then publish or schedule them to **Facebook, Instagram, WhatsApp,
TikTok and X** from one dashboard.

It runs with **no backend and no build step**: the entire app is one self-contained
`index.html` (HTML + CSS + vanilla JavaScript). Data (users, sessions, posts,
payments) is persisted in the browser via `localStorage`.

> **Open `index.html` in any browser — that's it.** No installs, no API keys.

---

## Features

### Marketing site (public)
- **Home** — value proposition, social proof, feature blocks, how-it-works, testimonials, FAQ, CTA
- **Features** — detailed breakdown grouped into Create / Publish / Grow / Manage
- **Pricing** — Free and **Pro (Ksh 1,000/month)** with a full comparison table
- **Recommend** — a free interactive tool that builds a tailored content plan
  (platform priority %, Monday–Sunday calendar, best posting times EAT, hashtag pack)
- **Contact** — validated working form + Nairobi company details
- **Terms of Service** and **Privacy Policy** (referencing Kenya's Data Protection Act, 2019)
- Responsive top navigation, full footer linking every page, mobile menu, 404 page

### Authentication
- Email + password sign-up/sign-in (with validation and inline errors)
- Google sign-in (built-in demo account chooser)
- Sign-up is blocked until the Terms + Privacy checkbox is accepted
- Persistent sessions; protected dashboard routes redirect to sign-in and resume afterward
- Sign out clears the session; data is strictly isolated per account

### Checkout & billing
- Free → Pro upgrade through a **real M-PESA STK-push** flow (Daraja): validated
  Kenyan phone number, live push stages on screen, and the actual PIN prompt on
  the customer's phone — see *Real M-PESA payments* below for setup
- Checkout requires an authenticated user and acceptance of purchase conditions
- Only a confirmed Daraja success (receipt number) activates Pro; cancellation
  and timeout are reported honestly and never charge or upgrade the user
- Payments are reflected in the dashboard Billing page (plan, price, renewal
  date, payment history, cancel-at-period-end)

### Dashboard (protected)
- **Overview** — 4 computed KPI cards + an 8-week trend chart and recent posts
- **Content** — full CRUD table: create, edit, delete, search, sort, filter, pagination,
  CSV export, plus a built-in AI caption generator and three publishing actions in the
  editor: **Save draft**, **Schedule** (auto-publishes at a chosen future time via a
  background scheduler, Pro) and **Publish now** (posts immediately to the connected
  account), each with step-by-step progress and realistic engagement stats
- **Connected social accounts** — in Settings, connect/disconnect each platform
  (Facebook, Instagram, WhatsApp, TikTok, X) via an authorization flow; publishing
  requires the target account to be connected
- **Analytics** — reach/engagement aggregates, platform comparison, status donut,
  empty states when there is no data
- **Billing** — current plan & price, upgrade path, receipts, cancellation
- **Account** — email, editable profile fields, password change, account deletion
- **Settings** — content defaults, weekly-goal slider, notification toggles
- Loading skeletons, empty states and error states everywhere

---

## Architecture

Everything is plain HTML/CSS/JS. Source files live in `src/` and are concatenated
into `index.html` by a build script (purely organizational convenience).

```
index.html                 # self-contained, ready-to-deploy build
build.sh                   # assembles index.html from src/
src/
  styles.css               # full design system (Stripe-inspired blue, tokens, responsive)
  01-head.html             # HTML head / shell template
  js/
    01-utils.js            # helpers, formatting, Kenyan phone validation
    02-store.js            # localStorage data store (users, posts, payments)
    03-generator.js        # caption generation engine (English/Swahili/Sheng)
    04-paybridge.js        # M-PESA STK-push checkout client
    05-social.js           # social publishing client (simulated)
    06-recommend.js        # content-plan recommendation engine
    07-components.js       # icons, modal, toast, SVG charts, form validation
    08-chrome.js           # public nav + footer
    09-router.js           # hash router with guards, SEO meta, 404 handling
    10-pages-marketing.js  # Home / Features / Pricing
    11-pages-reco-contact.js # Recommend / Contact / Terms / Privacy / 404
    12-pages-auth.js       # Sign up / Sign in / Google chooser
    13-pages-checkout.js   # PayBridge checkout flow
    14-pages-dashboard.js  # all six dashboard sections
    15-main.js             # boot
```

### Real M-PESA payments (Daraja STK push)
Payments go through a real Safaricom Daraja integration — **no demo or simulated
success**. The Node server in `server/server.js` (zero dependencies, Node 18+)
proxies Daraja so your Consumer Secret never touches the browser:

| Endpoint | Purpose |
|---|---|
| `GET  /api/health` | Server up + whether Daraja credentials are configured |
| `POST /api/stkpush` | Starts the STK push (PIN prompt on the customer's phone) |
| `GET  /api/stkstatus?checkoutRequestId=…` | Polls Daraja for the payment result |
| `POST /api/callback` | Receives Daraja's result callback |

Result codes handled: `0` = paid (M-PESA receipt recorded), `1032` = cancelled by
the customer, `500.001.1001` = still pending (the client polls every 2.5 s for up
to 2 minutes). If the server is absent or unconfigured the UI shows an honest
error — it never fakes a successful payment.

**Setup**

```bash
cp server/.env.example server/.env   # then fill in your Daraja credentials
npm start                            # = node server/server.js  → http://localhost:8000
```

1. Create an app at <https://developer.safaricom.co.ke> and copy its **Consumer
   Key** and **Consumer Secret** into `server/.env`.
2. Sandbox testing uses the test paybill **174379** and the Lipa na M-PESA
   sandbox **passkey** (both in the Daraja portal under your app's test
   credentials). Use sandbox test phone numbers to receive the prompt.
3. `DARAJA_CALLBACK_URL` must be a **public HTTPS** address Daraja can reach.
   During local development tunnel with ngrok or cloudflared, e.g.
   `ngrok http 8000`, then set `DARAJA_CALLBACK_URL=https://<id>.ngrok-free.app/api/callback`.
4. For real money set `DARAJA_ENV=live` and use your production shortcode/passkey.

### Social posting
Posts are handed off to the real, connected platform: the caption is copied to the
clipboard and the platform's composer (web or app deep link) opens pre-addressed to
the connected handle — WhatsApp (`wa.me`), X (`twitter.com/intent/tweet`),
Facebook (sharer), Instagram (`instagram.com/<handle>`), and TikTok
(`tiktok.com/upload`). Instagram and TikTok have no public web-posting API, so
their app composers are opened directly; Facebook caption prefill requires a
Facebook app id.

### Still isolated behind clean interfaces
- **Google sign-in** — wire `openGoogle()` in `12-pages-auth.js` to Google
  Identity Services.
- **Persistence** — swap the `localStorage` functions in `02-store.js` for API
  calls when you add a database.

## Development

```bash
# Run locally with payments enabled (recommended)
npm start                        # node server/server.js → http://localhost:8000

# Static-only browsing (M-PESA will show an honest "server not reachable" error)
python3 -m http.server 8000      # then open http://localhost:8000
# (or simply double-click index.html)

# Rebuild index.html after editing src/
bash build.sh
```

## Notes
Data is stored locally in the browser (`localStorage`) and passwords are hashed
with a lightweight digest — fine for a demo, but use real authentication and a
server-side database for production. Payment secrets live only in
`server/.env` (git-ignored), never in client code.

© Andika Ltd. — Made in Nairobi for biashara za Kenya.
