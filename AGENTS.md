<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# reMint — project notes

**reMint** is a demo e-commerce storefront for used / refurbished phones, covering
both retail and B2B wholesale, with an interactive WebGL 3D experience.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · react-three-fiber/drei · Framer Motion · Zustand.

Key conventions:
- The design system lives in `src/app/globals.css` (Tailwind v4 `@theme` tokens:
  `ink-*`, `brand-*`, `mint-*`, `glacier-*`; utilities `glass`, `text-gradient`,
  `grad-border`, `bg-grid`; animations `animate-aurora`, `animate-float`, etc.).
- Data: `src/lib/products.ts` (catalog + types), `src/lib/grades.ts` (condition
  grades), `src/lib/wholesale.ts` (volume tiers + pricing math), `src/lib/cart-store.ts`
  (persisted Zustand cart — wholesale lines are priced by quantity tier).
- 3D: `src/components/three/Phone3D.tsx` is procedural (no model files). Always render
  it through `PhoneViewer` (dynamic `ssr:false`) — never SSR a `<Canvas>`.
- Anything using the cart store or framer-motion must be a client component, and
  cart-dependent UI must guard first render with a `mounted` flag to avoid hydration
  mismatches (persisted store rehydrates synchronously on the client).
- `npm run build` must stay green (type-check + lint run during build).
