"use client";

import PhoneViewer from "@/components/three/PhoneViewer";
import type { CameraLayout, DeviceType } from "@/lib/products";

/**
 * Full-viewport, chrome-free stage used only by the offline render pipeline to
 * capture each device's 3D model to a transparent PNG. Not linked from the UI.
 */
export function CaptureStage({
  colorHex,
  accentHex,
  cameraLayout,
  brand,
  formFactor,
}: {
  colorHex: string;
  accentHex: string;
  cameraLayout: CameraLayout;
  brand: string;
  formFactor: DeviceType;
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "header,footer{display:none!important}body{background:transparent!important}body::before,body::after{display:none!important}",
        }}
      />
      <div id="capture" className="fixed inset-0 grid place-items-center">
        <PhoneViewer
          colorHex={colorHex}
          accentHex={accentHex}
          cameraLayout={cameraLayout}
          brand={brand}
          formFactor={formFactor}
          mode="still"
          className="h-full w-full"
        />
      </div>
    </>
  );
}
