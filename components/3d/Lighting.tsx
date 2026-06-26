"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "@/store/useSceneStore";

export function Lighting() {
  const { scene } = useThree();
  const { sunDirection } = useSceneStore();

  useEffect(() => {
    const sun = new THREE.DirectionalLight(
      0xffffff,
      3.0
    );

    sun.position
      .set(...sunDirection)
      .normalize()
      .multiplyScalar(15);

    scene.add(sun);

    return () => {
      scene.remove(sun);
    };
  }, [scene, sunDirection]);

  return null;
}