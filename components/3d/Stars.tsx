'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';

export function Stars() {
  const groupRef = useRef<THREE.Group>(null);
  const starsMeshRef = useRef<THREE.Points>(null);
  const starsMatRef = useRef<THREE.PointsMaterial>(null);
  const { time } = useSceneStore();
  const { camera } = useThree();

  // Generate random star positions with varying brightness
  const starData = useMemo(() => {
    const positions: number[] = [];
    const brightnesses: number[] = [];
    const count = 1500;

    for (let i = 0; i < count; i++) {
      // Random position on a sphere far from camera
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 100;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(x, y, z);
      // Vary star brightness
      brightnesses.push(Math.random() * 0.7 + 0.3);
    }

    return { positions, brightnesses };
  }, []);

  useEffect(() => {
    if (!groupRef.current) return;

    // Create points geometry for stars with brightness variation
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starData.positions), 3));

    // Star material
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.6,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
    });

    const stars = new THREE.Points(geometry, material);
    starsMeshRef.current = stars;
    starsMatRef.current = material;
    groupRef.current.add(stars);

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [starData]);

  useFrame(() => {
    if (starsMatRef.current && groupRef.current) {
      // Very subtle drift of starfield
      groupRef.current.rotation.y += 0.00003;
      groupRef.current.rotation.x += 0.00001;

      // Natural pulsing with variation
      const basePulse = Math.sin(time * 0.3) * 0.12;
      const shimmer = Math.sin(time * 0.7) * 0.08;
      starsMatRef.current.opacity = 0.75 + basePulse + shimmer;
    }
  });

  return <group ref={groupRef} />;
}
