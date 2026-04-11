'use client';

import { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { clsx } from 'clsx';

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}

function HandShape({ position, rotation, color }: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}) {
  const group = useRef<THREE.Group>(null);

  return (
    <group ref={group} position={position} rotation={rotation}>
      {/* Palm */}
      <mesh>
        <boxGeometry args={[0.7, 0.15, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Fingers - four cylinders */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0.25, 0.05, -0.15 + i * 0.1]} rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.035, 0.3, 4, 8]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      {/* Thumb */}
      <mesh position={[-0.25, 0.05, -0.2]} rotation={[0.4, 0, -0.5]}>
        <capsuleGeometry args={[0.04, 0.2, 4, 8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

function GlowSphere() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2) * 0.15;
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[0.18, 16, 16]} />
      <meshStandardMaterial
        color="#14b8a6"
        emissive="#14b8a6"
        emissiveIntensity={2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 3;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.05;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.03) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#5eead4" size={0.02} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function HandshakeScene({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const { viewport } = useThree();

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.elapsedTime * 0.15 + mouse.current.x * 0.3;
    groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.2) * 0.05 + mouse.current.y * 0.15;
  });

  return (
    <group ref={groupRef}>
      {/* Left hand reaching right */}
      <HandShape
        position={[-0.35, 0, 0]}
        rotation={[0, 0, 0.1]}
        color="#0d9488"
      />
      {/* Right hand reaching left */}
      <HandShape
        position={[0.35, 0, 0]}
        rotation={[0, Math.PI, -0.1]}
        color="#14b8a6"
      />
      {/* Glow at handshake point */}
      <GlowSphere />
      {/* Particles */}
      <Particles count={isMobile ? 40 : 120} />
    </group>
  );
}

function LoadingShimmer() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-teal-500/40 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-teal-400/60" />
      </div>
    </div>
  );
}

interface DealixLogo3DProps {
  size?: number;
  className?: string;
}

function DealixLogo3D({ size = 300, className }: DealixLogo3DProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={clsx('relative', className)}
      style={{ width: size, height: size }}
    >
      <Suspense fallback={<LoadingShimmer />}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 40 }}
          dpr={isMobile ? 1 : [1, 2]}
          gl={{ alpha: true, antialias: !isMobile }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
          <pointLight position={[0, 0, 2]} intensity={0.8} color="#14b8a6" />
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
            <HandshakeScene isMobile={isMobile} />
          </Float>
        </Canvas>
      </Suspense>

      {/* Ambient glow behind the canvas */}
      <div className="absolute inset-0 -z-10 rounded-full bg-teal-500/10 blur-3xl" />
    </div>
  );
}

export { DealixLogo3D };
export type { DealixLogo3DProps };
