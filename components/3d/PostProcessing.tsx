'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useSceneStore } from '@/store/useSceneStore';

export function PostProcessing() {
  const { bloomStrength, exposure } = useSceneStore();

  return (
    <EffectComposer multisampling={4}>
      {/* Bloom effect optimized for 60 FPS performance */}
      <Bloom
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        height={256}
        intensity={bloomStrength * 1.0}
        radius={0.7}
        scale={0.8}
      />
    </EffectComposer>
  );
}
