"use client";

import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Sphere } from "@react-three/drei";
import { Suspense } from "react";

function Orb() {
  return (
    <Float speed={2.2} rotationIntensity={0.35} floatIntensity={1.15}>
      <Sphere args={[1, 64, 64]} scale={1.25}>
        <MeshDistortMaterial
          color="#6366f1"
          emissive="#1e1b4b"
          emissiveIntensity={0.4}
          roughness={0.22}
          metalness={0.58}
          distort={0.48}
          speed={2.1}
        />
      </Sphere>
    </Float>
  );
}

export function AffiliateNetworkOrb() {
  return (
    <div className="relative h-full w-full min-h-[300px] rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-900 shadow-xl shadow-indigo-500/10">
      <Canvas camera={{ position: [0, 0, 3.25], fov: 42 }} dpr={[1, 2]}>
        <color attach="background" args={["#070712"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[4, 2.5, 5]} intensity={38} color="#c7d2fe" />
        <pointLight position={[-3, -2, 2]} intensity={12} color="#818cf8" />
        <Suspense fallback={null}>
          <Orb />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.55} />
        </Suspense>
      </Canvas>
      <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[11px] text-indigo-200/70">
        اسحب للدوران · شبكة الشراكة
      </p>
    </div>
  );
}
