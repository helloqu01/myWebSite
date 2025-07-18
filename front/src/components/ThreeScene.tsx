// File: front/src/components/ThreeScene.tsx
"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  MeshDistortMaterial,
  Environment,
} from "@react-three/drei";

export default function ThreeScene() {
  return (
    <Canvas
      frameloop="always"  // ← 항상 렌더링해서 autoRotate 동작
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }}
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* 조명 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {/* 3D 콘텐츠 */}
      <Suspense fallback={null}>
        <Sphere args={[1, 64, 64]} scale={1.5}>
          <MeshDistortMaterial
            color="#8352FD"
            distort={0.4}
            speed={2}
          />
        </Sphere>
        <Environment preset="studio" />
      </Suspense>

      {/* 자동 회전 + 마우스 드래그 */}
      <OrbitControls
        enableZoom={false}
        autoRotate      // ← 자동으로 카메라가 구체 주위를 회전
        autoRotateSpeed={1.5}  // 속도 조절 (기본 2)
      />
    </Canvas>
  );
}
