import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DEVICES,
  getDevice,
  relatedDevices,
  startingPrice,
  renderSrc,
  displaySpec,
  rearCameraSpec,
  frontCameraSpec,
  waterResistance,
  simType,
} from "@/lib/products";
import { GRADES } from "@/lib/grades";
import { ProductExperience } from "@/components/product/ProductExperience";
import { Reviews } from "@/components/product/Reviews";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { ProductCard } from "@/components/ui/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return DEVICES.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const device = getDevice(slug);
  if (!device) return { title: "Not found" };
  const title = `${device.name} — certified pre-owned`;
  const description = `Certified pre-owned ${device.name} from $${startingPrice(device)}. Guaranteed 80%+ battery, fully unlocked, free charger, 30-day returns, free US shipping.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/product/${device.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}/product/${device.slug}`,
      images: [{ url: `${SITE_URL}${renderSrc(device.slug)}`, alt: device.name }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const device = getDevice(slug);
  if (!device) notFound();

  const related = relatedDevices(device, 3);
  const specs: [string, string][] = [
    ["Display", displaySpec(device)],
    ["Chip", device.chip],
    ["Rear camera", rearCameraSpec(device)],
    ["Front camera", frontCameraSpec(device)],
    ["Battery health", "80%+ guaranteed"],
    ["Water resistance", waterResistance(device)],
    ["SIM", simType(device)],
    [
      "Connectivity",
      device.fiveG ? "5G · Wi-Fi 6 · unlocked" : device.cellular ? "Wi-Fi + Cellular" : "Wi-Fi 6",
    ],
    ["Storage", device.storage.map((s) => `${s.gb}GB`).join(" · ")],
    ["Released", String(device.releaseYear)],
  ];

  const included: [string, string][] = [
    ["Certified " + device.name, "Inspected, graded and sanitized to factory standard."],
    ["USB-C charge cable", "Brand-new, reMint-supplied."],
    ["Free charger included", "A charging cable & adapter in every box, plus 30-day returns."],
  ];

  const url = `${SITE_URL}/product/${device.slug}`;
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${device.name} (Certified Pre-Owned)`,
    description: `Certified pre-owned ${device.name} — ${GRADES[device.grade].label} grade, 80%+ battery, fully unlocked, free charger, 30-day returns.`,
    image: `${SITE_URL}${renderSrc(device.slug)}`,
    brand: { "@type": "Brand", name: device.brand },
    category: device.type === "tablet" ? "Tablet" : "Smartphone",
    itemCondition: "https://schema.org/RefurbishedCondition",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: startingPrice(device),
      highPrice: Math.max(...device.storage.map((s) => s.price)),
      offerCount: device.storage.length,
      availability: "https://schema.org/InStock",
      url,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: device.rating,
      reviewCount: device.reviews,
      bestRating: 5,
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: `${SITE_URL}/shop` },
      {
        "@type": "ListItem",
        position: 2,
        name: device.type === "tablet" ? "iPad" : device.brand,
        item: `${SITE_URL}/shop?brand=${device.brand}`,
      },
      { "@type": "ListItem", position: 3, name: device.name, item: url },
    ],
  };

  return (
    <div className="pt-[26px]">
      <JsonLd data={[productLd, breadcrumbLd]} />
      {/* breadcrumb */}
      <div className="shell">
        <p className="crumb flex items-center gap-2.5">
          <Link href="/" className="hover:text-[#1d1d1f]">
            Store
          </Link>
          <span className="opacity-50">/</span>
          <Link href="/shop" className="hover:text-[#1d1d1f]">
            {device.type === "tablet" ? "iPad" : "Phones"}
          </Link>
          <span className="opacity-50">/</span>
          <Link href={`/shop?brand=${device.brand}`} className="hover:text-[#1d1d1f]">
            {device.brand}
          </Link>
          <span className="opacity-50">/</span>
          <span className="text-[#6e6e73]">{device.name}</span>
        </p>
      </div>

      {/* hero (gallery + buy box) */}
      <div className="shell mt-6">
        <ProductExperience device={device} />
      </div>

      {/* specs + what's in the box */}
      <div className="shell mt-20 grid gap-14 lg:grid-cols-2">
        <div>
          <h2 className="mb-[18px] text-[22px] font-bold tracking-[-.015em] text-[#1d1d1f]">
            Tech specs
          </h2>
          <div>
            {specs.map(([k, v]) => (
              <div key={k} className="specrow">
                <span className="speck">{k}</span>
                <span className="specv">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-[18px] text-[22px] font-bold tracking-[-.015em] text-[#1d1d1f]">
            What&apos;s in the box
          </h2>
          <div className="flex flex-col gap-[14px]">
            {included.map(([title, note]) => (
              <div key={title} className="flex items-start gap-[13px] text-[15px]">
                <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px] bg-[#f5f5f7] text-[15px] font-bold text-[#0a8f6e]">
                  ✓
                </span>
                <div>
                  <b className="font-semibold text-[#1d1d1f]">{title}</b>
                  <div className="mt-0.5 text-[13px] leading-[1.5] text-[#86868b]">{note}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[13px] leading-[1.5] text-[#86868b]">
            Original retail box, power adapter and EarPods are not included — part of how we keep
            prices low and waste down.
          </p>
        </div>
      </div>

      {/* highlights / features */}
      <div className="shell mt-20 grid gap-14 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="h2">
            Why you&apos;ll love it
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-[#6e6e73]">
            The standout reasons this {device.brand}{" "}
            {device.type === "tablet" ? "iPad" : "device"} is a smart buy — certified, guaranteed,
            and priced for the real world.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {device.features.map((f) => (
              <span key={f} className="tag">
                {f}
              </span>
            ))}
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {device.highlights.map((h) => (
            <li key={h} className="scard flex items-start gap-3 !p-4">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[rgba(10,143,110,.1)] text-[13px] font-bold text-[#0a8f6e]">
                ✓
              </span>
              <span className="text-[15px] leading-[1.5] text-[#1d1d1f]">{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* reviews */}
      <div className="shell mt-20 border-t border-[#d2d2d7] pt-12">
        <h2 className="text-[clamp(24px,3vw,34px)] font-bold tracking-[-.02em] text-[#1d1d1f]">
          What buyers are saying
        </h2>
        <div className="mt-7">
          <Reviews rating={device.rating} count={device.reviews} slug={device.slug} />
        </div>
      </div>

      {/* related */}
      <div className="shell mt-[90px]">
        <span className="eyebrow">You may also like</span>
        <h3 className="mt-2 text-[26px] font-bold tracking-[-.015em] text-[#1d1d1f]">
          Complete the lineup
        </h3>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((d, i) => (
            <ProductCard key={d.id} device={d} index={i} />
          ))}
        </div>
      </div>

      <RecentlyViewed exclude={device.slug} />
    </div>
  );
}
