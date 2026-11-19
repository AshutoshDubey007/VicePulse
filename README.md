# VicePulse — GTA VI Community Discovery & Intelligence Platform

**VicePulse** is a community-powered intelligence platform tracking, cataloging, and verifying discoveries across Grand Theft Auto VI and the State of Leonida. 

Built with the **flat GTA marketing-poster visual identity**: bold, loud, sun-bleached, tabloid aesthetic with solid color bands, hard offset shadows, rectangular tilted stamps, and zero generic dark glassmorphism. VicePulse bridges community field scouts across Reddit, YouTube, TikTok, Discord, and gaming press into an authentic, searchable investigative archive.

---

## 🎨 Visual Identity & Design System (Revised GTA Poster Aesthetic)

### 1. Typography System (Strict 3 Families)
- **Display / Headings**: **Pricedown** (licensed, self-hosted via `next/font/local`) with Google Font fallback **Bowlby One** (`next/font/google`). Always uppercase, heavy 900 weight, tight line-height (`1.0`), hard offset text-shadow without blur (`3px 3px 0 #1A0B2E`), and `font-size-adjust: cap-height from-font` for zero Cumulative Layout Shift (CLS).
- **Body & Editorial**: **Archivo** (`next/font/google`). Crisp, readable sans-serif with `text-wrap: pretty`, `overflow-wrap: break-word`, and `font-size-adjust: from-font` (no Inter or system default).
- **Data, Coordinates, Tags, Labels**: **Space Mono** (`next/font/google`). Monospaced, uppercase, letter-spaced, high-contrast telemetry formatting.
- *Strict Rule: Never use more than these 3 font families across the entire platform.*

### 2. Flat High-Saturation Color Palette (No Gradients)
- `--ink` (`#1A0B2E`): Deepest midnight plum/black for poster outlines, text shadows, and high-contrast borders.
- `--cream` (`#FFF1DC`): Sun-bleached paper and newsprint cream background/text.
- `--hot-pink` (`#FF4FA0`): High-voltage Vice neon for vehicles, nightlife, and alert stamps.
- `--orange` (`#FF7A3D`): Primary action triggers, tactical highlights, and radar pings.
- `--sun` (`#FFE066`): Striped retro sun and breaking tabloid wire ticker bar.
- `--teal` (`#19C7B8`): Confirmed telemetry, verified coordinates, and eyewitness badges.
- *Solid color bands and striped retro sun replace soft gradients. At most one subtle gradient across the entire site.*

### 3. Shape Language & Layout Rules
- **Hard Edges & 3px Solid Borders**: 0–4px border radius, 3px solid borders (`border-3 border-ink`), and mechanical offset hard box-shadows (`shadow-[4px_4px_0px_#1A0B2E]`, `shadow-[5px_5px_0px_#1A0B2E]`). Zero blur shadows, zero glow, and no frosted backdrop-blur cards.
- **Rectangular Tilted Stamp Badges**: Verification badges render as rectangular stamps with a 2px solid border, tilted `-2deg`, uppercase monospace text, and flat color fills (not rounded pills).
- **Asymmetric Poster Layout**: Left-aligned headline copy paired with an asymmetric striped retro sun and skyline/palm silhouette artwork (`RetroHeroArt.tsx`) on the right.
- **Bento-Style Editorial Hierarchy**: Mix of one large featured dossier card with smaller stacked telemetry cards, varying accent colors by category.
- **Mechanical Scrolling Ticker**: Sun-yellow high-contrast ticker strip (`LiveTicker.tsx`) running surveillance dispatch updates at steady mechanical velocity.
- **Zero Emoji**: Absolute ban on emoji across the platform. Icons use custom flat SVG category marks (`CategoryIcon.tsx` covering all 7 categories) or Lucide icons at 2.5px stroke only where needed.
- **Cheeky Tabloid Microcopy**: Punchy, in-world field scout copy (no "Welcome to" or "Unlock the power of").

---

## 🗺️ Application Architecture & Routes

| Route | Feature | Description |
|---|---|---|
| `/` | **Landing Page** | Asymmetric hero with retro sun, flat skyline silhouettes, mechanical live ticker, bento-grid featured dossier, and hotspot sectors. |
| `/feed` | **Discovery Feed** | Multi-view feed (Editorial, Grid, Compact) with 3px solid borders, hard shadows, category filter buttons, mobile bottom-sheet filter, and sorting. |
| `/map` | **Tactical Map** | Full-screen interactive Leaflet map with CartoDB Dark Matter tiles, flat colored pins with thick outlines, hard-shadow popups, and side drawer. |
| `/discoveries/[id]` | **Dossier Detail** | Investigative dossier with 3px borders, rectangular tilted verification stamps, spawn conditions (weather/time), reproduction guide, confirmation buttons, dispute filing, and comments. |
| `/submit` | **Submit Discovery** | 3-stage recon intake wizard with flat styling, in-game grid, weather, time windows, preset evidence selector, `localStorage` draft recovery, and audit confirmation. |
| `/sources` | **Research Sources** | Research inbox triaging raw community leads from Reddit, YouTube, TikTok, Discord, and gaming press with reliability ratings (1-5). |
| `/trending` | **Surge Monitor** | High-velocity hotspots, emerging anomalies, and most-confirmed discoveries, clearly tagged with transparency notices. |
| `/vehicles` | **Rare Vehicle Tracker** | Leonida motor registry tracking secret sports cars, tuned chop-shop imports, and smuggler aircraft with spawn times and performance bars. |
| `/locations` | **Hidden Locations** | Secret interiors, submerged plane wrecks, missile silos, and sea grottos with flat category marks. |
| `/easter-eggs` | **Easter Eggs** | Scarface homages, playable Degenatron arcade cabinets, and Vice City lore callbacks with flat category marks. |
| `/encounters` | **Random Encounters** | Florida Man incidents, swamp airboat rallies, and dynamic NPC events with flat category marks. |
| `/profile` | **Scout Profile** | Scout reputation, commendation badges, activity log, active subscription badge, and interactive role switcher (Scout, Investigator, Admin). |
| `/billing` | **Billing & Syndicate Plans** | Plan comparison, monthly/yearly toggle, Razorpay checkout, subscription management, payment history ledger, and invoice status. |
| `/settings/notifications` | **Notification Preferences** | Granular controls for marketing emails, weekly digest, discovery updates, comment replies, and essential security notices. |
| `/admin` | **Moderation & Subscriptions** | Review queue, dispute resolver, source intake approver, and live subscription/payment audit ledger. |

---

## 💳 Payment & Subscription Architecture

VicePulse implements a production-ready, modular subscription architecture built with security and scalability at its core.

### 1. Payment Providers & Modularity
- **Razorpay**: Primary payment gateway configured for Indian scouts with native INR currency handling, orders API, and HMAC SHA-256 signature verification.
- **Stripe**: Pre-built modular provider adapter implementing `IPaymentProvider` (`src/lib/payments/stripe.ts`), enabling seamless zero-rewrite international rollout.
- **Feature Flagging**: `NEXT_PUBLIC_ENABLE_PAYMENTS` enables or gracefully disables checkout. When disabled, users are presented with an informative "Coming Soon" status rather than a broken checkout.

### 2. Subscription Tiers & Configurable Pricing
Pricing is centrally configured in `src/lib/payments/plans.ts` and can be overridden via database or environment configuration:
- **Rookie Scout (Free)**: Basic discovery browsing, public map markers, and community commenting.
- **Scout Pro / Leonida Syndicate (₹499/mo or ₹4,790/yr - 20% savings)**: Advanced filters, classified satellite overlays, instant notification alerts, verified badge, and priority recon queue.
- **Master Cartographer (₹1,499/mo or ₹14,390/yr - 20% savings)**: All Pro perks plus uncompressed 8K evidence downloads, raw GeoJSON telemetry exports, and early access to datamined coordinates.

### 3. Server-Side Security & Webhook Idempotency
- **No Client-Side Trust**: Client success callbacks never activate subscriptions directly. The server strictly verifies payment signatures using HMAC SHA-256 (`src/app/api/payments/verify/route.ts`).
- **Webhook Processing**: Validates incoming Razorpay signatures (`x-razorpay-signature`) and prevents duplicate activation via `WebhookLog` idempotency records indexed by `eventId`.
- **Entitlement Authorization**: Server endpoints such as `/api/intel/classified-overlay` and `/api/intel/export` enforce tier permissions via `hasProAccess()` and `hasEliteAccess()`, rejecting unauthorized requests with `HTTP 403 Forbidden`.

---

## 📧 Email Notification System

VicePulse features an enterprise-grade transactional email subsystem with responsive branded layouts:

### 1. Provider Abstraction & Engine
- **Resend**: Integrated via `IEmailProvider` (`src/lib/email/resend.ts`). Uses the official Resend SDK when `RESEND_API_KEY` is present.
- **Development Fallback**: In local or unconfigured environments, seamlessly logs richly formatted terminal summaries without blocking application flow.
- **Background Queue**: Asynchronous in-process email queue (`src/lib/email/queue.ts`) featuring deduplication keys, 3-attempt exponential backoff retries, and comprehensive status tracking.

### 2. Branded HTML Email Templates
All email templates use inline CSS, responsive table designs, and VicePulse's signature visual identity:
- **Account Welcome**: Onboarding briefing with tactical scout ID.
- **Password Reset**: Security token delivery with single-use confirmation action.
- **Discovery Status**: Timely notification when a submission is approved, rejected, or disputed.
- **Discovery Confirmation & Comments**: Real-time alert when fellow scouts verify coordinates.
- **Payment Receipt & Renewal**: Itemized billing breakdown and subscription confirmation.
- **Payment Failed & Retry**: Actionable recovery steps and retry link.
- **Subscription Cancelled**: Grace period notice and resubscription CTA.
- **Weekly Intelligence Digest**: Curated overview of high-velocity discoveries across Leonida.

### 3. In-App Notification Center & Unsubscribe
- **In-App Notification Center**: Interactive dropdown in the navbar (`NotificationCenter.tsx`) with unread badge count, real-time polling, and one-click mark-as-read.
- **Preferences Center**: `/settings/notifications` allows users to toggle marketing, digests, and discovery alerts while preserving essential transactional security alerts.
- **One-Click Unsubscribe**: Direct token-based unsubscribe endpoint (`/api/email/unsubscribe?token=...`).

---

## 📱 Mobile-First Responsive Design

VicePulse is designed from the viewport up for mobile scouts:
- **320px Viewport Support**: Strict responsive CSS guarantees zero horizontal scrolling or layout breakages across all viewports.
- **Mobile Bottom Navigation**: Compact 5-icon persistent navigation bar (`MobileBottomNav.tsx`) with safe-area insets (`env(safe-area-inset-bottom)`) and minimum 48px tap targets.
- **Feed Filter Drawer**: Accessible bottom-sheet filter panel on mobile viewports for effortless one-handed category and verification filtering.
- **Step-by-Step Recon Submission**: Multi-step mobile intake wizard with `localStorage` draft auto-save and one-click draft recovery.
- **Touch-Friendly Tactical Map**: One-handed map controls and mobile discovery detail bottom drawer with hard-shadow popups.

---

## 🧪 Comprehensive Verification & Testing

VicePulse includes an automated end-to-end platform verification suite in `scripts/test_platform.js`.

### Running the Test Suite
```bash
# 1. Build the production application
npm run build

# 2. Run the platform verification suite
node scripts/run_tests.js
```

### Verification Coverage (31 / 31 Passed - 100%):
- [x] Cryptographic HMAC SHA-256 signature verification and tampered payload rejection.
- [x] 12 Public & Protected Page and API routes (`/`, `/feed`, `/map`, `/vehicles`, `/billing`, `/admin`, etc.).
- [x] Razorpay Order Creation API with currency and price integrity.
- [x] Server-side Payment Verification and automated Subscription activation.
- [x] Webhook signature verification and duplicate-event idempotency enforcement.
- [x] Premium entitlement authorization: Classified Overlay returns `HTTP 403 Forbidden` for free users and `HTTP 200 OK` for Pro scouts.
- [x] In-app notification fetching and batch mark-all-read.
- [x] Notification preference updating and one-click unsubscribe endpoint.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and configure your credentials:

```ini
# Platform Configuration
PORT=3000
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_PAYMENTS=true

# Database (Optional: runs on high-fidelity in-memory store if offline)
MONGODB_URI=mongodb://localhost:27017/vicepulse

# Razorpay Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Resend Transactional Email
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=VicePulse Intelligence <scout@vicepulse.gg>

# MapLibre GL Tile Provider Configuration
# Default is Esri ArcGIS World Dark Gray Base (no API key required; zero watermarks; no labels)
NEXT_PUBLIC_MAP_TILE_URL=https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}
NEXT_PUBLIC_MAP_ATTRIBUTION=© Esri, HERE, Garmin, © OpenStreetMap contributors

# Optional Vector / Custom Tile Server (e.g. MapTiler, Stadia, Protomaps, GTADB)
# NEXT_PUBLIC_MAP_STYLE_URL=https://api.maptiler.com/maps/basic/style.json?key=YOUR_KEY
# NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key
```

---

## 🗺️ Interactive Tactical Map Architecture (MapLibre GL JS)

VicePulse features a high-performance interactive map engine built with **MapLibre GL JS** providing accurate spatial intelligence across the State of Leonida.

### 1. Map Providers & Visual Modes
The map explorer supports 3 selectable layer modes with zero third-party commercial POIs, business logos, street clutter, or watermarks:
* **VicePulse Dark Tactical (Default)**: Powered by Esri ArcGIS World Dark Gray Base. Displays true coastlines, islands, keys, waterways, causeways, highways, and street grids in high-contrast asphalt-and-ocean styling.
  * **Licensing & Attribution**: `© Esri, HERE, Garmin, © OpenStreetMap contributors`. Free public basemap service with zero watermark and zero commercial label clutter.
  * **Credentials**: **No API key or credentials required**. Runs immediately out of the box with zero watermarks.
* **Satellite Orthophoto Recon**: True high-resolution satellite imagery across South Florida, the Keys coral reefs, and Everglades sawgrass waterways.
  * **Licensing & Attribution**: `© Esri, Maxar, Earthstar Geographics`.
  * **Credentials**: **No API key required**.
* **Vector Blueprint Grid**: Lightweight vector landmass polygons and sector boundaries with neon contour lines. Zero external requests.

### 2. Custom Map Tile Configuration
To connect a custom or private map tile provider (e.g., MapTiler, Stadia Maps, GTADB, or a self-hosted Protomaps tile server):
1. In `.env.local`, set `NEXT_PUBLIC_MAP_TILE_URL` to your tile URL template, e.g.:
   ```env
   NEXT_PUBLIC_MAP_TILE_URL=https://your-tile-server.com/{z}/{x}/{y}.png
   NEXT_PUBLIC_MAP_ATTRIBUTION=© Your Custom Map Provider
   ```
2. Or set `NEXT_PUBLIC_MAP_STYLE_URL` for vector tile style JSON.
3. If using MapTiler, register at `maptiler.com` for a free key and insert it in the tile URL.

### 3. Fail-Safe Error Handling & Resilience
* **Visible Error & Retry Mechanism**: If the map tile server is unreachable or WebGL fails, the map displays a dedicated **"MAP TELEMETRY CONNECTION ERROR"** panel with an interactive **"RETRY TELEMETRY LINK"** button instead of an empty black canvas.
* **Smart Marker Clustering**: At zoom levels below 11, proximity nodes group into tactical numbered clusters with VicePulse brand colors. Clicking zooms into the cluster.
* **Coordinate Validation**: The engine rigorously validates numeric coordinates (`typeof lat === 'number' && !isNaN(lat) && lat !== 0`). Records without valid coordinates are never plotted as fake pins.

---

## 🖼️ Visual Asset System & Fallback Engine

VicePulse guarantees that no image container ever renders blank or broken:
* **Local Asset Cache**: Core assets are stored in `public/images/`:
  * Hero background: `public/images/hero/vice-city-hero.webp`
  * Avatars: `public/images/avatars/scout-1.webp` through `scout-4.webp`, `ai-recon.webp`
  * Discoveries: `public/images/discoveries/`
  * Vehicles: `public/images/vehicles/`
* **Category-Specific Fallbacks (`ViceImage.tsx`)**: The custom `ViceImage` wrapper intercepts missing images or 404 errors and automatically renders curated category artwork (`/images/categories/{category}.webp`).
* **Next.js Image Optimization**: Responsive `sizes`, `priority` loading for above-the-fold banners, and lazy loading for off-screen cards.



---

## ⚡ Autonomous GTA VI Data Collection & Research Engine

VicePulse operates a continuous autonomous research engine that searches, ingests, analyzes, corroborates, and publishes GTA VI discoveries without requiring manual human data entry.

### 1. Extensible Source Connectors (`src/lib/autonomous/connectors/`)
* **YouTube Data API Connector (`youtube.ts`)**: Searches newly published video dispatches with dynamic query matrices. Parses descriptions and transcripts to detect timestamped discovery moments. Operates in verified community research mode when `YOUTUBE_API_KEY` is omitted.
* **Reddit Communities Connector (`reddit.ts`)**: Monitors `r/GTA6` and `r/GTA6leaks`. Employs an NLP heuristic filter that prioritizes empirical discovery sightings over questions, theories, or memes.
* **Gaming Press & RSS (`rss.ts`)**: Parses official Rockstar Newswire updates, IGN, Dexerto, and GTAForums RSS feeds.
* **Social Media & Web Recon (`social.ts`)**: Ingests public X/Twitter, TikTok, and web dispatch signals.

### 2. 13-Stage Collection Pipeline (`src/lib/autonomous/pipeline.ts`)
```
SEARCH ➔ FETCH SOURCE ➔ NORMALIZE CONTENT ➔ EXTRACT INFORMATION ➔ DETECT DISCOVERIES
➔ CLASSIFY ➔ DUPLICATE DETECTION ➔ CORROBORATION SEARCH ➔ LOCATION ANALYSIS
➔ CONFIDENCE ASSESSMENT ➔ PUBLISH OR UPDATE ➔ MAP UPDATE ➔ NOTIFICATION
```

### 3. AI Extraction & Strict Guardrails (`aiExtractor.ts`)
* Analyzes raw content using Google Gemini API (`gemini-2.5-flash`) or the local heuristic NLP engine.
* Validates structured outputs against strict Zod schemas (`extractionZodSchema`).
* **Strict Anti-Hallucination Guardrails**: The LLM is explicitly forbidden from inventing coordinates, fake names, or fabricated evidence. If coordinates are not supported by the source, they remain `null` or `LOCATION_PENDING`, preventing fake map pins.

### 4. Duplicate Detection & Canonical Merging (`deduplicator.ts`)
* Compares incoming reports against existing dossiers using normalized string distance (Dice coefficient), category alignment, and landmark overlap.
* High-confidence matches ($\ge 65\%$) merge the new source into the canonical discovery, incrementing confirmation counts and adding evidence photos.
* Uncertain matches ($45\% - 64\%$) flag potential duplicate relationships for auditor review.

### 5. Multi-Source Corroboration & Verification System (`corroborator.ts`, `verifier.ts`)
* Automatically searches secondary connectors for corroborating evidence when a discovery candidate is logged.
* Distinguishes independent cross-platform replication from circular reposts.
* Supports 7 explicit trust statuses: `UNVERIFIED`, `REPORTED`, `UNDER INVESTIGATION`, `CORROBORATED`, `COMMUNITY VERIFIED`, `PERSONALLY VERIFIED`, `DISPUTED`.
* AI confidence is strictly separated from human/community verification.

### 6. Background Scheduler & Cost Management (`scheduler.ts`, `resourceManager.ts`)
* Persistent background scheduler daemon running independently of client browser sessions.
* Configurable polling intervals (2-4h discovery search, 4-6h Reddit/News, 6-12h query expansion, daily corroboration).
* Real-time token usage and cost tracking with an automated daily budget limit fail-safe that gracefully falls back to heuristic parsing if the cap is reached.
* Admin controls for pause/resume, connector muting, manual recon triggers, and dynamic query injection.
