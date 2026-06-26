'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Scene } from './3d/Scene';
import { CameraController } from './3d/CameraController';
import { Loader } from '@react-three/drei';

export function PulseCanvas() {
  return (
    <>
      <Canvas
        camera={{
          position: [0, 0, 2.5],
          fov: 60,
          near: 0.1,
          far: 10000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <CameraController />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
}
