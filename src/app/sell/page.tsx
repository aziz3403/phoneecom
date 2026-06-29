import { redirect } from "next/navigation";

// Trade-in lives at /trade-in now; keep /sell working for old links.
export default function SellPage() {
  redirect("/trade-in");
}
