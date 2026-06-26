'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';

export function Lighting() {
  const { scene } = useThree();
  const { sunDirection } = useSceneStore();

  useEffect(() => {
    // Primary key light (sun) - cinematic quality
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(...sunDirection).normalize().multiplyScalar(5);
    keyLight.castShadow = false;
    scene.add(keyLight);

    // Secondary fill light (atmospheric blue)
    const fillLight = new THREE.DirectionalLight(0x4d94ff, 0.5);
    fillLight.position.set(-sunDirection[0], -sunDirection[1], -sunDirection[2]).normalize().multiplyScalar(5);
    scene.add(fillLight);

    // Rim light from atmosphere (soft blue glow)
    const rimLight = new THREE.DirectionalLight(0x2d5d99, 0.3);
    rimLight.position.set(sunDirection[0] * 0.5, sunDirection[1] - 1, -sunDirection[2]).normalize().multiplyScalar(5);
    scene.add(rimLight);

    // Subtle ambient illumination (deep blue-gray)
    const ambientLight = new THREE.AmbientLight(0x1a3f5a, 0.2);
    scene.add(ambientLight);

    // Hemisphere light for natural outdoor appearance
    const hemiLight = new THREE.HemisphereLight(0x5a9fd4, 0x000000, 0.6);
    scene.add(hemiLight);

    return () => {
      scene.remove(keyLight);
      scene.remove(fillLight);
      scene.remove(rimLight);
      scene.remove(ambientLight);
      scene.remove(hemiLight);
    };
  }, [scene, sunDirection]);

  return null;
}
