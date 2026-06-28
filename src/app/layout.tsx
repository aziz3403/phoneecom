import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { SearchCommand } from "@/components/layout/SearchCommand";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "reMint — Certified Pre-Owned Phones · Retail & Wholesale",
    template: "%s · reMint",
  },
  description:
    "Buy certified pre-owned iPhone, Samsung Galaxy and iPad — every device fully unlocked, 80%+ battery, inspected on 50 points and backed by a 12-month warranty. Trade pricing for resellers and businesses.",
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="home">
          <Navbar />
          <CartDrawer />
          <SearchCommand />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
