"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { CameraLayout } from "@/lib/products";

const W = 2.04;
const H = 4.16;
const D = 0.24;
const BACK = -D / 2;
const FRONT = D / 2;

/** Procedural gradient "wallpaper" drawn to a canvas, used as the screen map. */
function useWallpaper(colorHex: string, accentHex: string) {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 512;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size * 2;
    const ctx = c.getContext("2d");
    if (!ctx) return null;

    const g = ctx.createLinearGradient(0, 0, size, size * 2);
    g.addColorStop(0, "#0b0b17");
    g.addColorStop(0.45, accentHex);
    g.addColorStop(0.75, colorHex);
    g.addColorStop(1, "#04040a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);

    // soft glow blobs
    const blob = (x: number, y: number, r: number, col: string, a: number) => {
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, col);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = a;
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };
    blob(size * 0.3, size * 0.5, size * 0.7, "#8b5cff", 0.55);
    blob(size * 0.8, size * 1.5, size * 0.8, "#38d1ff", 0.4);
    blob(size * 0.5, size * 1.1, size * 0.5, "#34e6a8", 0.25);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [colorHex, accentHex]);
}

function Lens({
  position,
  size,
  accent,
}: {
  position: [number, number, number];
  size: number;
  accent: string;
}) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      {/* metal ring */}
      <mesh>
        <cylinderGeometry args={[size, size, 0.05, 40]} />
        <meshStandardMaterial color={accent} metalness={0.95} roughness={0.25} />
      </mesh>
      {/* glass */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[size * 0.72, size * 0.72, 0.04, 40]} />
        <meshPhysicalMaterial
          color="#05060a"
          metalness={0.2}
          roughness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.05}
          emissive="#10203a"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

function CameraModule({ layout, accent }: { layout: CameraLayout; accent: string }) {
  const z = BACK - 0.015;
  const bumpZ = BACK - 0.05;

  // raised bump plate behind lenses
  const Bump = ({
    w,
    h,
    x,
    y,
    radius = 0.16,
  }: {
    w: number;
    h: number;
    x: number;
    y: number;
    radius?: number;
  }) => (
    <RoundedBox args={[w, h, 0.12]} radius={radius} smoothness={6} position={[x, y, bumpZ]}>
      <meshPhysicalMaterial color="#0c0d12" metalness={0.6} roughness={0.35} clearcoat={0.6} />
    </RoundedBox>
  );

  if (layout === "triple") {
    return (
      <group>
        <Bump w={1.04} h={1.04} x={-0.42} y={1.18} />
        <Lens position={[-0.64, 1.4, z]} size={0.2} accent={accent} />
        <Lens position={[-0.2, 1.4, z]} size={0.2} accent={accent} />
        <Lens position={[-0.42, 0.96, z]} size={0.2} accent={accent} />
        {/* flash + lidar */}
        <mesh position={[-0.2, 0.96, z]}>
          <circleGeometry args={[0.07, 24]} />
          <meshStandardMaterial color="#f5f3e6" emissive="#fff7d6" emissiveIntensity={0.4} />
        </mesh>
      </group>
    );
  }

  if (layout === "dual") {
    return (
      <group>
        <Bump w={1.02} h={1.02} x={-0.44} y={1.18} />
        <Lens position={[-0.64, 1.4, z]} size={0.2} accent={accent} />
        <Lens position={[-0.24, 0.98, z]} size={0.2} accent={accent} />
        <mesh position={[-0.24, 1.4, z]}>
          <circleGeometry args={[0.06, 24]} />
          <meshStandardMaterial color="#f5f3e6" emissive="#fff7d6" emissiveIntensity={0.4} />
        </mesh>
      </group>
    );
  }

  if (layout === "single") {
    return (
      <group>
        <Bump w={0.6} h={0.6} x={-0.5} y={1.3} radius={0.12} />
        <Lens position={[-0.5, 1.3, z]} size={0.2} accent={accent} />
      </group>
    );
  }

  if (layout === "vertical") {
    // Galaxy S — individual floating lenses, no bump
    return (
      <group>
        <Lens position={[-0.6, 1.5, z + 0.02]} size={0.18} accent={accent} />
        <Lens position={[-0.6, 1.06, z + 0.02]} size={0.18} accent={accent} />
        <Lens position={[-0.6, 0.62, z + 0.02]} size={0.18} accent={accent} />
        <mesh position={[-0.18, 1.5, z]}>
          <circleGeometry args={[0.06, 24]} />
          <meshStandardMaterial color="#f5f3e6" emissive="#fff7d6" emissiveIntensity={0.4} />
        </mesh>
      </group>
    );
  }

  if (layout === "grid") {
    return (
      <group>
        <Bump w={1.0} h={1.0} x={-0.46} y={1.16} />
        <Lens position={[-0.66, 1.36, z]} size={0.17} accent={accent} />
        <Lens position={[-0.26, 1.36, z]} size={0.17} accent={accent} />
        <Lens position={[-0.66, 0.96, z]} size={0.17} accent={accent} />
        <Lens position={[-0.26, 0.96, z]} size={0.13} accent={accent} />
      </group>
    );
  }

  if (layout === "bar") {
    // Pixel visor — horizontal bar across the back
    return (
      <group>
        <RoundedBox args={[W - 0.16, 0.62, 0.14]} radius={0.18} smoothness={6} position={[0, 1.18, bumpZ]}>
          <meshPhysicalMaterial color="#0a0b10" metalness={0.7} roughness={0.3} clearcoat={0.7} />
        </RoundedBox>
        <Lens position={[-0.42, 1.18, z]} size={0.18} accent={accent} />
        <Lens position={[0.0, 1.18, z]} size={0.18} accent={accent} />
        <Lens position={[0.42, 1.18, z]} size={0.14} accent={accent} />
      </group>
    );
  }

  // circular (OnePlus)
  return (
    <group>
      <mesh position={[-0.42, 1.18, bumpZ]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.56, 0.56, 0.12, 48]} />
        <meshPhysicalMaterial color="#0c0d12" metalness={0.6} roughness={0.35} clearcoat={0.6} />
      </mesh>
      <Lens position={[-0.42, 1.42, z]} size={0.19} accent={accent} />
      <Lens position={[-0.66, 1.0, z]} size={0.19} accent={accent} />
      <Lens position={[-0.18, 1.0, z]} size={0.19} accent={accent} />
    </group>
  );
}

export interface Phone3DProps {
  colorHex: string;
  accentHex: string;
  cameraLayout: CameraLayout;
  brand: string;
  /** continuous spin speed (rad/sec). 0 disables auto spin */
  spin?: number;
  /** follow the pointer (hero) */
  reactive?: boolean;
}

export function Phone3D({
  colorHex,
  accentHex,
  cameraLayout,
  brand,
  spin = 0,
  reactive = false,
}: Phone3DProps) {
  const group = useRef<THREE.Group>(null);
  const wallpaper = useWallpaper(colorHex, accentHex);
  const isApple = brand === "Apple";

  useFrame((state, delta) => {
    if (!group.current) return;
    if (spin) group.current.rotation.y += delta * spin;
    if (reactive) {
      const tx = state.pointer.x * 0.5;
      const ty = -state.pointer.y * 0.35;
      group.current.rotation.y += (tx - (group.current.rotation.y % (Math.PI * 2))) * 0.04 * (spin ? 0 : 1);
      group.current.rotation.x += (ty - group.current.rotation.x) * 0.06;
    }
  });

  return (
    <group ref={group} rotation={[0, -0.5, 0]}>
      {/* Body */}
      <RoundedBox args={[W, H, D]} radius={0.22} smoothness={10}>
        <meshPhysicalMaterial
          color={colorHex}
          metalness={0.65}
          roughness={0.32}
          clearcoat={0.8}
          clearcoatRoughness={0.18}
          reflectivity={0.6}
        />
      </RoundedBox>

      {/* Metallic side frame highlight */}
      <RoundedBox args={[W + 0.012, H + 0.012, D - 0.06]} radius={0.22} smoothness={10}>
        <meshStandardMaterial color={accentHex} metalness={0.95} roughness={0.22} />
      </RoundedBox>

      {/* Screen glass */}
      <RoundedBox args={[W - 0.14, H - 0.16, 0.02]} radius={0.18} smoothness={8} position={[0, 0, FRONT + 0.005]}>
        {wallpaper ? (
          <meshPhysicalMaterial
            map={wallpaper}
            emissiveMap={wallpaper}
            emissive="#ffffff"
            emissiveIntensity={0.35}
            metalness={0.1}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.04}
          />
        ) : (
          <meshPhysicalMaterial color="#0b0b17" metalness={0.1} roughness={0.08} clearcoat={1} />
        )}
      </RoundedBox>

      {/* Dynamic Island (Apple) or punch-hole (others) */}
      {isApple ? (
        <RoundedBox args={[0.52, 0.16, 0.02]} radius={0.08} smoothness={6} position={[0, H / 2 - 0.42, FRONT + 0.02]}>
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </RoundedBox>
      ) : (
        <mesh position={[0, H / 2 - 0.36, FRONT + 0.02]}>
          <circleGeometry args={[0.07, 24]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
      )}

      {/* Side buttons */}
      <mesh position={[W / 2 + 0.005, 0.5, 0]}>
        <boxGeometry args={[0.03, 0.6, 0.12]} />
        <meshStandardMaterial color={accentHex} metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[-W / 2 - 0.005, 0.9, 0]}>
        <boxGeometry args={[0.03, 0.34, 0.12]} />
        <meshStandardMaterial color={accentHex} metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[-W / 2 - 0.005, 0.45, 0]}>
        <boxGeometry args={[0.03, 0.34, 0.12]} />
        <meshStandardMaterial color={accentHex} metalness={0.9} roughness={0.3} />
      </mesh>

      <CameraModule layout={cameraLayout} accent={accentHex} />
    </group>
  );
}

export default Phone3D;
