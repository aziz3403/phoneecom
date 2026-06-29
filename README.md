# reMint — Certified Pre-Owned Phones · Retail & Wholesale

A fancy, modern storefront for selling **used / refurbished smartphones** — both
direct-to-consumer **retail** and **B2B wholesale** — built around an interactive
**WebGL 3D** experience.

> Demo storefront. No real payments, accounts, or inventory.

![Stack](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-149eca) ![Three.js](https://img.shields.io/badge/react--three--fiber-9-7430ff) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38d1ff)

## ✨ Highlights

- **Real 3D phones** — a procedural phone model built entirely from Three.js
  primitives (no external model files). The camera module reconfigures per brand
  (triple / dual / Pixel bar / OnePlus island / Galaxy stack…), the screen renders
  a procedural gradient wallpaper, and it reacts to the pointer / orbits on the
  product page.
- **Modern, premium design** — dark theme, animated aurora gradients, glassmorphism,
  film-grain, scroll-reveal motion, gradient text, animated counters, marquees.
- **Honest condition grading** — a transparent 4-tier system (New / Excellent /
  Good / Fair) with cosmetic descriptions, battery health, and a 50-point inspection
  story — the trust signals used-phone shoppers actually need.
- **Full B2B wholesale portal** — tiered volume pricing (up to 24% off), a live
  **savings calculator**, a multi-line **bulk order builder**, MOQs, net terms, and a
  trade-account application form.
- **Working cart & checkout** — persistent cart (retail + wholesale lines), slide-in
  drawer, quantity-aware wholesale pricing, order summary and a checkout flow.

## 🧱 Tech stack

| Area        | Choice                                            |
| ----------- | ------------------------------------------------- |
| Framework   | Next.js 16 (App Router) + React 19 + TypeScript   |
| Styling     | Tailwind CSS v4 (CSS-first `@theme` design system)|
| 3D          | three.js · @react-three/fiber · @react-three/drei |
| Animation   | Framer Motion                                     |
| State       | Zustand (persisted cart)                          |
| Icons       | lucide-react                                      |

## 🗺️ Pages

| Route               | What's there |
| ------------------- | ------------ |
| `/`                 | 3D hero, featured drops, "how it works", interactive grading, stats, wholesale teaser, reviews |
| `/shop`             | Full catalog with search, brand / condition / storage / price filters and sorting |
| `/product/[slug]`   | Interactive 3D viewer, specs, 50-point check, battery gauge, add-to-cart |
| `/wholesale`        | Tiers, savings calculator, bulk order builder, trade application |
| `/cart`             | Cart management + demo checkout |

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## 📁 Structure

```
src/
├─ app/                 # routes (home, shop, product, wholesale, cart)
├─ components/
│  ├─ three/            # Phone3D + Canvas wrapper + lazy viewer
│  ├─ ui/               # buttons, badges, cards, reveal, counters…
│  ├─ home/             # homepage sections
│  ├─ shop/             # filterable catalog
│  ├─ product/          # buy panel + battery gauge
│  ├─ wholesale/        # tiers, calculator, bulk builder, apply form
│  └─ cart/             # cart + checkout
└─ lib/                 # products, grades, wholesale tiers, cart store, utils
```

## 🛠️ Customizing the catalog

All phones live in [`src/lib/products.ts`](src/lib/products.ts). Each entry drives
the 3D model (color, accent, camera layout), pricing (retail / original / wholesale
base), condition grade and specs. Grades are defined in
[`src/lib/grades.ts`](src/lib/grades.ts) and volume tiers in
[`src/lib/wholesale.ts`](src/lib/wholesale.ts).
