import { ButtonLink } from "@/components/ui/Button";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative grid min-h-[80vh] place-items-center overflow-hidden px-5 pt-24">
      <AuroraBackground />
      <div className="text-center">
        <p className="font-display text-[clamp(5rem,18vw,11rem)] font-extrabold leading-none text-gradient">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
          This page got traded in
        </h1>
        <p className="mx-auto mt-3 max-w-md text-white/55">
          We couldn&apos;t find what you were looking for — but there are plenty of certified phones
          that are still here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" size="lg">
            <Home className="h-4.5 w-4.5" /> Back home
          </ButtonLink>
          <ButtonLink href="/shop" variant="secondary" size="lg">
            <Search className="h-4.5 w-4.5" /> Browse phones
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
