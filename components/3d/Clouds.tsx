'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';

// Create a procedural cloud texture
function createCloudTexture(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, width, height);

  // Create cloud-like patterns using circles and gradients
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 50 + 20;
    const grd = ctx.createRadialGradient(x, y, 0, x, y, size);
    grd.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function Clouds() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { time } = useSceneStore();

  const cloudTexture = useMemo(() => createCloudTexture(512, 512), []);

  useEffect(() => {
    if (!meshRef.current) return;

    // Clouds layer slightly above Earth - reduced detail for performance
    const geometry = new THREE.IcosahedronGeometry(1.02, 24);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tClouds: { value: cloudTexture },
        uTime: { value: time },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vAltitude;

        void main() {
          vUv = uv;
          // Subtle altitude variation for depth perception
          vAltitude = sin(uv.y * 10.0) * 0.005;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * vAltitude, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tClouds;
        uniform float uTime;

        varying vec2 vUv;

        void main() {
          // Multi-layer cloud animation for natural movement
          vec2 baseScroll = vec2(uTime * 0.008, uTime * 0.004);
          
          // Layer 1: Fast moving clouds
          vec2 uv1 = vUv * 1.0 + baseScroll;
          vec3 clouds1 = texture2D(tClouds, uv1).rgb;

          // Layer 2: Medium speed offset clouds
          vec2 uv2 = vUv * 0.8 + baseScroll * 0.5 + vec2(0.5, 0.3);
          vec3 clouds2 = texture2D(tClouds, uv2).rgb;

          // Layer 3: Slow speed for depth
          vec2 uv3 = vUv * 0.6 + baseScroll * 0.25 + vec2(0.3, 0.7);
          vec3 clouds3 = texture2D(tClouds, uv3).rgb;

          // Blend all layers with weights
          vec3 clouds = clouds1 * 0.5 + clouds2 * 0.3 + clouds3 * 0.2;

          // Smooth opacity with subtle breathing
          float breathe = sin(uTime * 0.2) * 0.1 + 0.8;
          float alpha = clouds.r * 0.4 * breathe;

          gl_FragColor = vec4(clouds, alpha);
        }
      `,
      side: THREE.FrontSide,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    meshRef.current.geometry = geometry;
    meshRef.current.material = material;
    materialRef.current = material;
  }, [cloudTexture]);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
    }
  });

  return <mesh ref={meshRef} />;
}
