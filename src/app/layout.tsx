import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { SITE_URL } from "@/lib/site";

const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "reMint — Certified Pre-Owned Phones · Retail & Wholesale",
    template: "%s · reMint",
  },
  description:
    "Buy certified pre-owned iPhone, Samsung Galaxy, Google Pixel and more — every device inspected on 50+ points and backed by a 12-month warranty. Trade pricing for resellers and businesses.",
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
      "Mint-condition pre-owned smartphones with a 12-month warranty. Plus volume pricing for resellers and enterprises.",
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
  themeColor: "#04040a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Navbar />
        <CartDrawer />
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
