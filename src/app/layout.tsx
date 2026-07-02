import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { SearchCommand } from "@/components/layout/SearchCommand";
import { SupportChat } from "@/components/support/SupportChat";
import { Providers } from "@/components/Providers";
import { catalogStock } from "@/lib/inventory";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "reMint — Certified Pre-Owned Phones · Retail & Wholesale",
    template: "%s · reMint",
  },
  description:
    "Buy certified pre-owned iPhone, Samsung Galaxy and iPad — every device fully unlocked, 80%+ battery, inspected on 50 points and backed by a free charger in every box. Trade pricing for resellers and businesses.",
  keywords: [
    "used phones",
    "refurbished phones",
    "wholesale phones",
    "certified pre-owned",
    "iPhone",
    "Samsung Galaxy",
    "bulk phones",
  ],
  openGraph: {
    title: "reMint — Certified Pre-Owned Phones · Retail & Wholesale",
    description:
      "Premium phones, half the price. Certified pre-owned iPhone, Galaxy & iPad — retail & wholesale.",
    type: "website",
    siteName: "reMint",
  },
  twitter: {
    card: "summary_large_image",
    title: "reMint — Certified Pre-Owned Phones",
    description: "Premium phones, half the price. Certified pre-owned iPhone, Galaxy & iPad — retail & wholesale.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Resolve live warehouse stock once for the whole app (cached/ISR via the
  // underlying sheet fetch) so every product surface reflects real availability.
  const stock = await catalogStock();
  // Privacy-friendly analytics, on only when a Plausible domain is configured.
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="en">
      {plausibleDomain && (
        <head>
          <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" />
        </head>
      )}
      <body>
        <Providers stock={stock}>
          <div className="home">
            <TopBar />
            <Navbar />
            <CartDrawer />
            <SearchCommand />
            <main>{children}</main>
            <Footer />
            <SupportChat />
          </div>
        </Providers>
      </body>
    </html>
  );
}
