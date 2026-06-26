import { notFound } from "next/navigation";
import { getDevice } from "@/lib/products";
import { CaptureStage } from "@/components/render/CaptureStage";

// Offline render target only (used by scripts/render-devices). Not in the sitemap/UI.
export const dynamic = "force-dynamic";

export default async function RenderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { slug } = await params;
  const { c } = await searchParams;
  const device = getDevice(slug);
  if (!device) notFound();
  const idx = Math.min(Math.max(0, Number(c) || 0), device.colors.length - 1);
  const color = device.colors[idx];

  return (
    <CaptureStage
      colorHex={color.hex}
      accentHex={color.accent}
      cameraLayout={device.cameraLayout}
      brand={device.brand}
      formFactor={device.type}
    />
  );
}
