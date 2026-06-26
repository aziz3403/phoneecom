"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Star, Zap, BatteryFull } from "lucide-react";
import PhoneViewer from "@/components/three/PhoneViewer";
import { ButtonLink } from "@/components/ui/Button";
import { AuroraBackground } from "@/components/ui/AuroraBackground";

const HERO_PHONE = {
  colorHex: "#566472",
  accentHex: "#9aa7b4",
  cameraLayout: "triple" as const,
  brand: "Apple",
};

const chip = (delay: number) => ({
  initial: { opacity: 0, scale: 0.8, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-24">
      <AuroraBackground />
      <div className="bg-grid absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr]">
        {/* Copy */}
        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint-400" />
            </span>
            Certified pre-owned · retail & wholesale
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-[clamp(2.6rem,7vw,5rem)] font-extrabold leading-[0.98] tracking-tight text-white"
          >
            Premium phones,
            <br />
            <span className="text-gradient animate-gradient">half the price.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 max-w-md text-lg leading-relaxed text-white/60"
          >
            Every device is inspected on 50+ points, graded honestly, and backed by a 12-month
            warranty. Buy one — or buy a thousand at trade pricing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <ButtonLink href="/shop" size="lg">
              Shop phones <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
            </ButtonLink>
            <ButtonLink href="/wholesale" variant="secondary" size="lg">
              Wholesale pricing
            </ButtonLink>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/55"
          >
            <span className="inline-flex items-center gap-2">
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </span>
              4.9/5 · 38k reviews
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-mint-400" /> 12-month warranty
            </span>
          </motion.div>
        </div>

        {/* 3D stage */}
        <div className="relative h-[440px] sm:h-[560px] lg:h-[640px]">
          <div className="absolute inset-0 -z-10 rounded-full bg-brand-600/20 blur-[100px]" />
          <PhoneViewer {...HERO_PHONE} mode="hero" className="h-full w-full" />

          {/* floating chips */}
          <motion.div
            {...chip(0.7)}
            className="absolute left-2 top-12 hidden rounded-2xl glass-strong px-4 py-3 sm:block"
          >
            <div className="flex items-center gap-2">
              <BatteryFull className="h-5 w-5 text-mint-400" />
              <div>
                <p className="text-xs text-white/50">Battery health</p>
                <p className="font-display text-lg font-bold text-white">80%+</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            {...chip(0.9)}
            className="absolute bottom-16 right-0 hidden rounded-2xl glass-strong px-4 py-3 sm:block"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-glacier-300" />
              <div>
                <p className="text-xs text-white/50">Inspection</p>
                <p className="font-display text-lg font-bold text-white">50-point</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            {...chip(1.1)}
            className="absolute right-6 top-6 hidden rounded-2xl glass-strong px-4 py-3 md:block"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand-300" />
              <div>
                <p className="text-xs text-white/50">From new</p>
                <p className="font-display text-lg font-bold text-white">Save 45%</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block"
      >
        <div className="flex h-9 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <motion.span
            className="h-2 w-1 rounded-full bg-white/60"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
