import Link from "next/link";

const COLS = [
  {
    title: "Shop",
    links: [
      { label: "All devices", href: "/shop" },
      { label: "Phones", href: "/shop?type=phone" },
      { label: "iPads", href: "/shop?type=tablet" },
      { label: "Apple", href: "/shop?brand=Apple" },
      { label: "Samsung", href: "/shop?brand=Samsung" },
      { label: "Under $300", href: "/shop?max=300" },
    ],
  },
  {
    title: "Sell to us",
    links: [
      { label: "Trade in your phone", href: "/trade-in" },
      { label: "Buyback price list", href: "/trade-in/prices" },
      { label: "Sell in bulk", href: "/trade-in/prices#bulk" },
      { label: "Wholesale portal", href: "/wholesale" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "How grading works", href: "/grades" },
      { label: "Shipping & returns", href: "/help" },
      { label: "Returns", href: "/help" },
      { label: "Compare devices", href: "/compare" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About reMint", href: "/sustainability" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Live inventory", href: "/inventory" },
      { label: "Contact", href: "/help" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="foot">
      <div className="footin">
        <p className="footnote">
          Certified pre-owned smartphones for everyone — and serious volume pricing for resellers,
          repair shops and enterprises. Every device is fully unlocked, carries 80%+ battery health,
          and ships with a free charger and 30-day returns. Demo storefront — not a real store.
        </p>
        <div className="footcols">
          {COLS.map((col) => (
            <div className="footcol" key={col.title}>
              <h5>{col.title}</h5>
              {col.links.map((l) => (
                <Link key={l.label} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="footbar">
          <span>© 2026 reMint Commerce. Certified pre-owned.</span>
          <div className="lk">
            <Link href="/help">Privacy</Link>
            <Link href="/help">Terms</Link>
            <Link href="/help">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
