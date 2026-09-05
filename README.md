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
- Free → Pro upgrade through a **PayBridge** checkout client styled as an
  **M-PESA STK-push** flow (validated Kenyan phone number, live push stages, receipt)
- Checkout requires an authenticated user and acceptance of purchase conditions
- Successful payment activates Pro and is reflected in the dashboard Billing page
  (plan, price, renewal date, payment history, cancel-at-period-end)
- The PayBridge module has a clearly marked swap point for a live payment gateway

### Dashboard (protected)
- **Overview** — 4 computed KPI cards + an 8-week trend chart and recent posts
- **Content** — full CRUD table: create, edit, delete, search, sort, filter, pagination,
  CSV export, plus a built-in AI caption generator and one-tap social publishing with
  step-by-step progress and realistic engagement stats
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

### Going live with a real backend
The simulated services are deliberately isolated behind clean interfaces:
- **Payments** — replace `App.paybridge.requestStkPush` in `04-paybridge.js` with a
  `fetch()` to your real PayBridge/M-PESA endpoint, keeping the same promise contract.
- **Google sign-in** — wire `openGoogle()` in `12-pages-auth.js` to Google Identity Services.
- **Social publishing** — replace `App.social.publish` in `05-social.js` with real
  platform graph API calls.
- **Persistence** — swap the `localStorage` functions in `02-store.js` for API calls.

## Development

```bash
# Run locally
python3 -m http.server 8000      # then open http://localhost:8000
# (or simply double-click index.html)

# Rebuild index.html after editing src/
./build.sh
```

## Notes
This is a client-side demo: passwords are hashed with a lightweight digest and data
is stored locally in the browser — it is not intended to hold production secrets.
Use real authentication and a server-side database for production deployments.

© Andika Ltd. — Made in Nairobi for biashara za Kenya.
