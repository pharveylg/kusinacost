# 🍳 KusinaCost

A mobile-first food costing app for small Filipino food businesses (karinderya, home-based food stalls, turo-turo). Track every dish from raw ingredients to actual sales — with full support for labor, LPG, electricity, packaging, and spoilage.

## ✨ Features

- **Recipe Costing** — Add ingredients with palengke prices, automatic per-unit cost calculation
- **Labor & Overhead** — Prep/cooking time, pax count, LPG tank vs electric appliance tracking
- **Multi-Appliance Support** — Distinguish stove vs oven, with burn-rate and wattage
- **Pricing Calculator** — Set SRP by target margin %, markup %, or input directly
- **Sales Tracking** — Record actual benta with date, batches made, sold, and wasted
- **Spoilage/Wastage** — Unsold servings tracked as ₱ loss
- **Dashboard** — Sales summary hero, alerts for low-margin / loss-making recipes
- **Mobile-First** — Bottom tab nav, touch-friendly forms, optimized for small screens
- **Multi-User** — Optional Firebase auth so each small business owner has their own data
- **Offline-First** — Works without backend using localStorage

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Firestore + Auth) — optional
- **Hosting**: Vercel
- **Build**: Single-file output via `vite-plugin-singlefile`

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run in development mode
```bash
npm run dev
```
The app starts at `http://localhost:5173` and works out-of-the-box with localStorage. No backend required.

### 3. Build for production
```bash
npm run build
```

## 📦 Deploy to Vercel

### Option A: One-click deploy via GitHub
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Vite settings — just click **Deploy**

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel              # preview deploy
vercel --prod       # production deploy
```

Vercel will use the included `vercel.json` for SPA rewrites (so client-side routing works on refresh).

## 🔥 Set up Firebase (optional but recommended for multi-device / multi-user)

Firebase's free "Spark" plan is generous and permanent: unlimited email/password users, 1GB Firestore storage, 50K document reads/day.

### 1. Create a Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Name it (e.g., `kusinacost`) — you can disable Google Analytics
3. Once created, click the **Web icon (`</>`)** on the project overview page to register a web app
4. Copy the config values shown (`apiKey`, `authDomain`, `projectId`)

### 2. Enable Email/Password Auth
- In Firebase Console: **Build → Authentication → Get started**
- Under **Sign-in method**, enable **Email/Password**

### 3. Create the Firestore database
- In Firebase Console: **Build → Firestore Database → Create database**
- Choose **Production mode** and a region close to your users (e.g., `asia-southeast1` for the Philippines)

### 4. Set security rules
- Go to **Firestore Database → Rules**
- Paste the contents of [`firebase/firestore.rules`](./firebase/firestore.rules)
- Click **Publish**

This ensures each signed-in user can only read/write their own data. No tables to create — Firestore collections are created automatically on first write.

### 5. Configure environment variables

In Vercel dashboard: **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `your-project` |

Then **redeploy** so the build picks up the variables.

For local development, create `.env.local`:
```bash
cp .env.example .env.local
# then fill in the values
```

Once configured, the app automatically:
- Shows a Sign In / Sign Up screen on launch
- Persists all data to Firestore (per-user, secured by rules)
- Falls back to localStorage if env vars are missing (dev/demo mode)

> **Note:** The Firebase web API key is safe to expose in client code — security is enforced by Firestore rules, not by hiding the key.

## 📁 Project Structure

```
.
├── src/
│   ├── components/         # React components (Dashboard, RecipeForm, etc.)
│   ├── lib/
│   │   ├── firebase.ts     # Firebase client (graceful fallback if unconfigured)
│   │   ├── auth.tsx        # Auth provider (Firebase Auth or no-op)
│   │   └── dataService.ts  # Data layer (Firestore or localStorage)
│   ├── App.tsx             # Main shell + bottom nav
│   ├── main.tsx            # Entry point (AuthProvider + AppProvider)
│   ├── store.tsx           # Global state, cost calculation helpers
│   ├── types.ts            # TypeScript interfaces
│   ├── index.css           # Tailwind imports
│   └── vite-env.d.ts       # Vite env type defs
├── firebase/
│   └── firestore.rules     # Security rules (paste into Firebase Console)
├── vercel.json             # Vercel deployment config
├── .env.example            # Environment variable template
├── index.html              # HTML entry
├── vite.config.ts          # Vite build config
├── tsconfig.json           # TypeScript config
└── package.json
```

## 💡 How Cost Calculation Works

For each recipe, total cost = **Ingredients + Overhead**, where:

| Component | Formula |
|---|---|
| **Ingredients** | Σ (qty × purchase price / purchase qty) |
| **LPG/Gas** | For each lpg-stove/oven appliance: `tank_price/tank_kg × burn_rate_kg/hr × hours` |
| **Electricity** | Σ `(watts/1000) × hours × ₱/kWh` for each electric appliance |
| **Labor** | `(prep + cook mins)/60 × hourly_rate × pax` |
| **Packaging** | `packaging_per_serving × servings` |
| **Other** | Flat custom cost |

Per-serving cost = total cost / servings. SRP is set by you; margin is computed live.

## 🎯 Sample Data

The app ships with sample data for first-time users:
- 16 common Filipino ingredients (Bigas, Manok, Baboy, Toyo, Suka, etc.)
- 3 sample recipes (Chicken Adobo, Pork Sinigang, Ginataang Manok)

This makes it instantly usable for demo and exploration.

## 📱 Mobile Optimization

- Bottom tab navigation (Home, Ingredients, Sales, Settings)
- Floating "+" add button
- Touch-friendly large inputs
- Safe-area insets for notched phones
- No number spinners (cleaner mobile inputs)
- 100% responsive — works on phones, tablets, and desktop

## 🧪 Testing the Build

```bash
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

The build outputs a single `dist/index.html` file (no separate JS/CSS chunks) — easy to deploy anywhere.

## 📜 License

MIT

---

Made with ❤️ for Filipino food entrepreneurs
