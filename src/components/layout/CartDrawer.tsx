"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart, lineUnitPrice, lineTotal, cartSubtotal, itemKey } from "@/lib/cart-store";
import { GRADES } from "@/lib/grades";
import { imageFor, renderSrc } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = cartSubtotal(items);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(10,20,16,.45)", backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            style={{
              position: "fixed", right: 0, top: 0, zIndex: 310, display: "flex", height: "100%",
              width: "100%", maxWidth: 420, flexDirection: "column", background: "#fff",
              boxShadow: "-12px 0 44px rgba(0,0,0,.18)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)", padding: "18px 22px" }}>
              <h2 style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-.01em" }}>
                Your bag <span style={{ color: "var(--text3)", fontWeight: 400 }}>({items.length})</span>
              </h2>
              <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text2)", display: "flex" }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
                <p style={{ color: "var(--text2)" }}>Your bag is empty.</p>
                <Link className="btn" href="/shop" onClick={() => setOpen(false)}>
                  Browse phones
                </Link>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  {items.map((item) => (
                    <div key={itemKey(item)} style={{ display: "flex", gap: 12, borderRadius: 16, background: "var(--gray)", padding: 12 }}>
                      <span className="ph" style={{ height: 78, width: 58, borderRadius: 12, flex: "none" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageFor(item.slug, item.colorName) ?? renderSrc(item.slug)} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                      </span>
                      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                            <p style={{ fontSize: 12.5, color: "var(--text3)" }}>
                              {item.colorName} · {item.gb}GB · {GRADES[item.grade].label}
                              {item.mode === "wholesale" ? " · Wholesale" : ""}
                            </p>
                          </div>
                          <button onClick={() => remove(itemKey(item))} aria-label="Remove" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex" }}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 2, borderRadius: 980, background: "#fff", border: "1px solid var(--line)", padding: 3 }}>
                            <button onClick={() => setQty(itemKey(item), item.qty - 1)} aria-label="Decrease" style={qtyBtn}>
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span style={{ width: 26, textAlign: "center", fontSize: 14, fontWeight: 600 }}>{item.qty}</span>
                            <button onClick={() => setQty(itemKey(item), item.qty + 1)} aria-label="Increase" style={qtyBtn}>
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontWeight: 600 }}>{formatPrice(lineTotal(item))}</p>
                            <p style={{ fontSize: 11.5, color: "var(--text3)" }}>{formatPrice(lineUnitPrice(item))} ea</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid var(--line)", padding: "20px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--text2)", marginBottom: 6 }}>
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--text2)", marginBottom: 14 }}>
                    <span>Shipping</span>
                    <span style={{ color: "var(--accent)" }}>Free · 5–7 days</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ color: "var(--text2)" }}>Total</span>
                    <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.02em" }}>{formatPrice(subtotal)}</span>
                  </div>
                  <Link className="btn" href="/cart" onClick={() => setOpen(false)} style={{ width: "100%" }}>
                    Checkout
                  </Link>
                  <button onClick={() => setOpen(false)} style={{ marginTop: 12, width: "100%", textAlign: "center", fontSize: 14, color: "var(--text2)", background: "none", border: "none", cursor: "pointer" }}>
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

const qtyBtn: React.CSSProperties = {
  display: "grid",
  height: 26,
  width: 26,
  placeItems: "center",
  borderRadius: 980,
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--text2)",
};
