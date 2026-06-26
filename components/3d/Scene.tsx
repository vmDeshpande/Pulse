"use client";

import { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useSceneStore } from "@/store/useSceneStore";

import { Stars } from "./Stars";
import { Lighting } from "./Lighting";
import { PostProcessing } from "./PostProcessing";

import { FlightsLayer } from "./layers/FlightsLayer";
import { EarthquakesLayer } from "./layers/EarthquakesLayer";
import { WildfiresLayer } from "./layers/WildfiresLayer";
import { ISSLayer } from "./layers/ISSLayer";

import { RaycastInteraction } from "./RaycastInteraction";

import { Planet } from "./Planet";

export function Scene() {
  const { scene, gl } = useThree();

  const { time, isPaused, setTime, exposure } = useSceneStore();

  useEffect(() => {
    scene.background = new THREE.Color(0x000000);
    scene.fog = null;

    // Modern renderer configuration
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = exposure;
    gl.useLegacyLights = false;

    // High-quality rendering defaults
    gl.physicallyCorrectLights = true;
  }, [scene, gl, exposure]);

  useFrame((_, delta) => {
    if (!isPaused) {
      setTime(time + delta);
    }
  });

  return (
    <>
      {/* Lighting */}
      <Lighting />

      {/* Planet */}
      <Planet />

      {/* Background */}
      <Stars />

      {/* Live Layers */}
      <FlightsLayer />
      <EarthquakesLayer />
      <WildfiresLayer />
      <ISSLayer />

      {/* Interaction */}
      <RaycastInteraction />

      {/* Screen-space effects */}
      <PostProcessing />
    </>
  );
}
