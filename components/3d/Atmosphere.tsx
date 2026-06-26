'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';

export function Atmosphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { sunDirection, time, atmosphereOpacity } = useSceneStore();

  useEffect(() => {
    if (!meshRef.current) return;

    // Create atmosphere as a scaled sphere around Earth
    const geometry = new THREE.IcosahedronGeometry(1.05, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uSunDirection: { value: new THREE.Vector3(...sunDirection).normalize() },
        uTime: { value: time },
        uOpacity: { value: atmosphereOpacity },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDirection;
        uniform float uTime;
        uniform float uOpacity;

        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(cameraPosition - vPosition);
          vec3 sunDir = normalize(uSunDirection);

          // Multi-layer Fresnel for volumetric effect
          float fresnel1 = pow(1.0 - abs(dot(normal, viewDir)), 2.0);
          float fresnel2 = pow(1.0 - abs(dot(normal, viewDir)), 4.0);
          float composedFresnel = mix(fresnel1, fresnel2, 0.5);

          // Rayleigh scattering - enhanced
          float sunDot = dot(normal, sunDir);
          float backScatter = max(0.0, -sunDot) * 0.3;
          float forwardScatter = max(0.0, sunDot) * 0.7;

          // Multi-color atmospheric layers
          vec3 nightSide = vec3(0.02, 0.08, 0.25);
          vec3 daySide = vec3(0.35, 0.65, 1.0);
          vec3 sunsetSide = vec3(0.9, 0.5, 0.2);

          // Blend based on sun position
          float dayFade = smoothstep(-0.5, 0.5, sunDot);
          float sunsetZone = 1.0 - abs(sunDot);
          
          vec3 baseColor = mix(nightSide, daySide, dayFade);
          baseColor = mix(baseColor, sunsetSide, sunsetZone * 0.4);

          // Subtle wave animation
          float breathe = sin(uTime * 0.3) * 0.15 + 1.0;
          float shimmer = sin(uTime * 0.7 + vPosition.x * 5.0) * 0.1;

          // Volumetric glow
          float volumetric = composedFresnel * (0.7 + backScatter + shimmer * 0.3);

          float alpha = volumetric * uOpacity * breathe;
          gl_FragColor = vec4(baseColor, alpha);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    meshRef.current.geometry = geometry;
    meshRef.current.material = material;
    materialRef.current = material;
  }, []);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uSunDirection.value = new THREE.Vector3(...sunDirection).normalize();
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uOpacity.value = atmosphereOpacity;
    }
  });

  return <mesh ref={meshRef} />;
}
