"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  OrbitControls,
  Float,
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
} from "@react-three/drei";
import { Phone3D } from "./Phone3D";
import type { CameraLayout, DeviceType } from "@/lib/products";

interface PhoneCanvasProps {
  colorHex: string;
  accentHex: string;
  cameraLayout: CameraLayout;
  brand: string;
  formFactor?: DeviceType;
  mode?: "hero" | "viewer" | "card" | "still";
  className?: string;
}

function StudioEnv() {
  return (
    <Environment resolution={256} frames={1}>
      <group rotation={[0, 0, 1]}>
        <Lightformer form="rect" intensity={3} position={[0, 4, -6]} scale={[10, 8, 1]} color="#b9a9ff" />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} scale={[3, 8, 1]} color="#7fe7ff" />
        <Lightformer form="rect" intensity={2.2} position={[5, -1, 1]} scale={[3, 8, 1]} color="#6ff7c8" />
        <Lightformer form="circle" intensity={3} position={[0, -3, 3]} scale={[4, 4, 1]} color="#ffffff" />
      </group>
    </Environment>
  );
}

export default function PhoneCanvas({
  colorHex,
  accentHex,
  cameraLayout,
  brand,
  formFactor = "phone",
  mode = "hero",
  className,
}: PhoneCanvasProps) {
  const [dpr, setDpr] = useState(1.5);
  const isViewer = mode === "viewer";
  const isCard = mode === "card";
  const isStill = mode === "still";
  const camZ = formFactor === "tablet" ? 9.6 : 8.4;

  return (
    <Canvas
      className={className}
      shadows
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.2, camZ], fov: 32 }}
    >
      <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 6]} intensity={1.4} castShadow />
      <pointLight position={[-5, 2, 4]} intensity={40} color="#8b5cff" />
      <pointLight position={[5, -2, 3]} intensity={28} color="#38d1ff" />

      <Suspense fallback={null}>
        {isStill ? (
          <group rotation={[0.1, 0, 0]}>
            <Phone3D
              colorHex={colorHex}
              accentHex={accentHex}
              cameraLayout={cameraLayout}
              brand={brand}
              formFactor={formFactor}
              spin={0}
              reactive={false}
            />
          </group>
        ) : isCard ? (
          <Phone3D
            colorHex={colorHex}
            accentHex={accentHex}
            cameraLayout={cameraLayout}
            brand={brand}
            formFactor={formFactor}
            spin={0.45}
          />
        ) : (
          <Float speed={isViewer ? 0 : 1.4} rotationIntensity={isViewer ? 0 : 0.35} floatIntensity={isViewer ? 0 : 0.7}>
            <Phone3D
              colorHex={colorHex}
              accentHex={accentHex}
              cameraLayout={cameraLayout}
              brand={brand}
              formFactor={formFactor}
              spin={isViewer ? 0 : 0.35}
              reactive={!isViewer}
            />
          </Float>
        )}

        <StudioEnv />
        <ContactShadows
          position={[0, -2.6, 0]}
          opacity={0.5}
          scale={12}
          blur={2.6}
          far={5}
          color="#000000"
        />
      </Suspense>

      {isViewer && (
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={5.5}
          maxDistance={11}
          autoRotate
          autoRotateSpeed={1.1}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 1.7}
        />
      )}

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
