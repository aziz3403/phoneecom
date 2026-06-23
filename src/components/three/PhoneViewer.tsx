"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useInView } from "framer-motion";
import type { CameraLayout } from "@/lib/products";
import { cn } from "@/lib/utils";

const PhoneCanvas = dynamic(() => import("./PhoneCanvas"), {
  ssr: false,
  loading: () => <PhoneSkeleton />,
});

function PhoneSkeleton({ colorHex }: { colorHex?: string }) {
  return (
    <div className="grid h-full w-full place-items-center">
      <div
        className="relative h-[62%] w-[30%] min-w-[88px] animate-float rounded-[2rem] border border-white/10"
        style={{
          background: `linear-gradient(160deg, ${colorHex ?? "#1d1d35"}, #0b0b17)`,
          boxShadow: "0 30px 80px -30px rgba(116,48,255,.6)",
        }}
      >
        <div className="absolute inset-2 rounded-[1.6rem] bg-gradient-to-b from-white/5 to-transparent" />
        <div className="shine absolute inset-0 animate-shimmer rounded-[2rem] opacity-40" />
      </div>
    </div>
  );
}

interface PhoneViewerProps {
  colorHex: string;
  accentHex: string;
  cameraLayout: CameraLayout;
  brand: string;
  mode?: "hero" | "viewer" | "card";
  lazy?: boolean;
  className?: string;
}

export default function PhoneViewer({ lazy = false, className, ...props }: PhoneViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "200px" });
  const show = !lazy || inView;

  return (
    <div ref={ref} className={cn("h-full w-full", className)}>
      {show ? <PhoneCanvas {...props} /> : <PhoneSkeleton colorHex={props.colorHex} />}
    </div>
  );
}
