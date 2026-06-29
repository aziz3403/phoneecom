"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart, cartCount } from "@/lib/cart-store";
import { Leaf } from "@/components/ui/Leaf";

interface MenuCol {
  head: string;
  href: string;
  items: [string, string][];
}
interface Menu {
  cols: MenuCol[];
  foot: [string, string];
}

const PHONES_MENU: Menu = {
  cols: [
    {
      head: "Apple — iPhone",
      href: "/shop?type=phone&brand=Apple",
      items: [
        ["iPhone 17 Pro Max", "/product/iphone-17-pro-max"],
        ["iPhone 17 Pro", "/product/iphone-17-pro"],
        ["iPhone 17", "/product/iphone-17"],
        ["iPhone Air", "/product/iphone-air"],
        ["iPhone 16 Pro Max", "/product/iphone-16-pro-max"],
        ["iPhone 16", "/product/iphone-16"],
        ["iPhone 15", "/product/iphone-15"],
        ["iPhone 13", "/product/iphone-13"],
      ],
    },
    {
      head: "Samsung — Galaxy",
      href: "/shop?type=phone&brand=Samsung",
      items: [
        ["Galaxy S24 Ultra", "/product/galaxy-s24-ultra"],
        ["Galaxy S24", "/product/galaxy-s24"],
        ["Galaxy S23", "/product/galaxy-s23"],
        ["Galaxy Z Flip5", "/product/galaxy-z-flip5"],
        ["Galaxy A54 5G", "/product/galaxy-a54-5g"],
      ],
    },
  ],
  foot: ["See all phones", "/shop?type=phone"],
};

const TABLETS_MENU: Menu = {
  cols: [
    {
      head: "Apple — iPad",
      href: "/shop?type=tablet&brand=Apple",
      items: [
        ['iPad Pro 13" (M4)', "/product/ipad-pro-13-m4"],
        ['iPad Air 11" (M2)', "/product/ipad-air-11-m2"],
        ["iPad mini 6", "/product/ipad-mini-6"],
        ["iPad (10th gen)", "/product/ipad-10th-gen"],
      ],
    },
  ],
  foot: ["See all tablets", "/shop?type=tablet"],
};

const DROPDOWNS: { label: string; menu: Menu }[] = [
  { label: "Phones", menu: PHONES_MENU },
  { label: "Tablets", menu: TABLETS_MENU },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const setCartOpen = useCart((s) => s.setOpen);
  const count = useCart((s) => cartCount(s.items));

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  return (
    <>
      <nav className="nav">
        <div className="navin">
          <Link className="logo" href="/">
            <Leaf size={19} />
            reMint
          </Link>
          <div className="navlinks">
            <Link href="/">Store</Link>
            {DROPDOWNS.map(({ label, menu }) => (
              <div
                key={label}
                className="navitem"
                onMouseEnter={() => setOpenMenu(label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  className="navtrigger"
                  onClick={() => router.push(menu.foot[1])}
                  aria-haspopup="true"
                  aria-expanded={openMenu === label}
                >
                  {label} <span className="dchev">▼</span>
                </button>
                {openMenu === label && (
                  <div className="navmenu">
                    <div className="navmenu-card">
                      {menu.cols.map((col) => (
                        <div className="navmenu-col" key={col.head}>
                          <Link className="mh" href={col.href}>
                            {col.head} ›
                          </Link>
                          {col.items.map(([name, href]) => (
                            <Link className="mi" key={href} href={href}>
                              {name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link href="/wholesale">Wholesale</Link>
            <Link href="/grades">Grades</Link>
            <Link href="/help">Support</Link>
          </div>
          <div className="navic">
            <button aria-label="Search" onClick={() => router.push("/search")}>
              <svg width="17" height="17" viewBox="0 0 17 17">
                <circle cx="7" cy="7" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <line x1="11" y1="11" x2="15.6" y2="15.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <button aria-label="Bag" onClick={() => setCartOpen(true)}>
              <svg width="17" height="18" viewBox="0 0 17 18">
                <path d="M3.2 6h10.6l-.9 10.8H4.1z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M5.8 6V4.6a2.7 2.7 0 0 1 5.4 0V6" fill="none" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              {mounted && count > 0 && <span className="bagdot">{count}</span>}
            </button>
          </div>
          <button className="hamb" onClick={() => setOpen(true)} aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 22 22">
              <line x1="3" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <line x1="3" y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="drawer">
          <div className="drawerbg" onClick={() => setOpen(false)} />
          <div className="drawerpanel">
            <div className="drawerhead">
              <span className="logo">
                <Leaf size={18} />
                reMint
              </span>
              <button className="drawerclose" onClick={() => setOpen(false)} aria-label="Close menu">
                ×
              </button>
            </div>
            <Link className="drawerlink" href="/" onClick={() => setOpen(false)}>
              Store
            </Link>
            <Link className="drawerlink" href="/shop?type=phone" onClick={() => setOpen(false)}>
              Phones
            </Link>
            <Link className="drawersub" href="/shop?type=phone&brand=Apple" onClick={() => setOpen(false)}>
              Apple — iPhone
            </Link>
            <Link className="drawersub" href="/shop?type=phone&brand=Samsung" onClick={() => setOpen(false)}>
              Samsung — Galaxy
            </Link>
            <Link className="drawerlink" href="/shop?type=tablet" onClick={() => setOpen(false)}>
              Tablets
            </Link>
            <Link className="drawersub" href="/shop?type=tablet&brand=Apple" onClick={() => setOpen(false)}>
              Apple — iPad
            </Link>
            <Link className="drawerlink" href="/sell" onClick={() => setOpen(false)}>
              Sell &amp; trade-in
            </Link>
            <Link className="drawerlink" href="/wholesale" onClick={() => setOpen(false)}>
              Wholesale
            </Link>
            <Link className="drawerlink" href="/grades" onClick={() => setOpen(false)}>
              Grades
            </Link>
            <Link className="drawerlink" href="/help" onClick={() => setOpen(false)}>
              Support
            </Link>
            <Link className="btn drawercta" href="/shop" onClick={() => setOpen(false)}>
              Shop all devices
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
