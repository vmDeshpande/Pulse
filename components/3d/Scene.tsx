'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';
import { Earth } from './Earth';
import { Atmosphere } from './Atmosphere';
import { Clouds } from './Clouds';
import { Stars } from './Stars';
import { Lighting } from './Lighting';
import { PostProcessing } from './PostProcessing';
import { FlightsLayer } from './layers/FlightsLayer';
import { EarthquakesLayer } from './layers/EarthquakesLayer';
import { WildfiresLayer } from './layers/WildfiresLayer';
import { ISSLayer } from './layers/ISSLayer';
import { RaycastInteraction } from './RaycastInteraction';

export function Scene() {
  const { scene, gl, camera } = useThree();
  const sceneRef = useRef(scene);
  const { time, isPaused, sunDirection, setTime } = useSceneStore();

  useEffect(() => {
    // Set scene background to deep black
    scene.background = new THREE.Color(0x000000);
    scene.fog = null;

    // Enable tone mapping for HDR
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
    gl.outputColorSpace = THREE.LinearSRGBColorSpace;
  }, [scene, gl]);

  useFrame(() => {
    // Update time for animations
    if (!isPaused) {
      setTime(time + 0.016); // ~60fps
    }
  });

  return (
    <>
      {/* Lighting setup */}
      <Lighting />

      {/* Core Earth visualization */}
      <Earth />

      {/* Atmospheric effects */}
      <Atmosphere />

      {/* Animated clouds */}
      <Clouds />

      {/* Starfield background */}
      <Stars />

      {/* Visualization layers */}
      <FlightsLayer />
      <EarthquakesLayer />
      <WildfiresLayer />
      <ISSLayer />

      {/* Interaction system for click detection */}
      <RaycastInteraction />

      {/* Post-processing effects (bloom, tonemap) */}
      <PostProcessing />
    </>
  );
}
