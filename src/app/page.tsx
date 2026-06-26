import { Hero } from "@/components/home/Hero";
import { TrustMarquee } from "@/components/home/TrustMarquee";
import { Categories } from "@/components/home/Categories";
import { InventoryBanner } from "@/components/home/InventoryBanner";
import { Stats } from "@/components/home/Stats";
import { Featured } from "@/components/home/Featured";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Grading } from "@/components/home/Grading";
import { WholesaleCTA } from "@/components/home/WholesaleCTA";
import { Testimonials } from "@/components/home/Testimonials";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustMarquee />
      <Categories />
      <InventoryBanner />
      <Featured />
      <HowItWorks />
      <Grading />
      <Stats />
      <WholesaleCTA />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
