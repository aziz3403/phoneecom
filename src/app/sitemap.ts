import type { MetadataRoute } from "next";
import { DEVICES } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/shop",
    "/wholesale",
    "/trade-in",
    "/trade-in/prices",
    "/grades",
    "/help",
    "/compare",
    "/inventory",
    "/sustainability",
    "/track",
    "/imei-check",
    "/warranty",
    "/returns",
    "/terms",
    "/privacy",
    "/accessibility",
  ].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const products = DEVICES.map((d) => ({
    url: `${SITE_URL}/product/${d.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  return [...routes, ...products];
}
