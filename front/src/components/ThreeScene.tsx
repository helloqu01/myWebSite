// File: front/src/components/ThreeScene.tsx
"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  MeshDistortMaterial,
} from "@react-three/drei";

export default function ThreeScene() {
  return (
    <Canvas
      frameloop="always"
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.setClearColor(0x000000, 0); // 투명 배경
      }}
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#a78bfa" />

      <Suspense fallback={null}>
        <Sphere args={[1, 80, 80]} scale={1.6}>
          <MeshDistortMaterial
            color="#7c3aed"
            distort={0.35}
            speed={1.4}
            opacity={0.18}
            transparent
            roughness={0}
            metalness={0.9}
          />
        </Sphere>
        {/* 외곽 와이어프레임 구 */}
        <Sphere args={[1, 32, 32]} scale={1.62}>
          <MeshDistortMaterial
            color="#a78bfa"
            distort={0.3}
            speed={1.2}
            opacity={0.08}
            transparent
            wireframe
          />
        </Sphere>
      </Suspense>

      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.8}
        enablePan={false}
      />
    </Canvas>
  );
}
