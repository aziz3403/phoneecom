"use client";

import { SessionProvider } from "next-auth/react";
import { StockProvider } from "@/lib/stock-context";

export function Providers({
  children,
  stock,
}: {
  children: React.ReactNode;
  stock: Record<string, number>;
}) {
  return (
    <SessionProvider>
      <StockProvider stock={stock}>{children}</StockProvider>
    </SessionProvider>
  );
}
