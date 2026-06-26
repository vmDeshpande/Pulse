'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';
import { textureManager } from '@/lib/textureManager';

export function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { sunDirection, time } = useSceneStore();
  const { gl } = useThree();

  // Load high-quality textures
  const textures = useMemo(() => textureManager.getTextureSet('high'), []);

  useEffect(() => {
    if (!meshRef.current) return;

    // Balance quality and performance - optimized for 60 FPS
    const geometry = new THREE.IcosahedronGeometry(1, 48);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tMap: { value: textures.day },
        tNight: { value: textures.night },
        tNormal: { value: textures.normal },
        uSunDirection: { value: new THREE.Vector3(...sunDirection).normalize() },
        uTime: { value: time },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tMap;
        uniform sampler2D tNight;
        uniform vec3 uSunDirection;
        uniform float uTime;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(-vPosition);
          vec3 sunDir = normalize(uSunDirection);

          // Fresnel rim light - enhanced for atmosphere
          float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
          vec3 rimColor = vec3(0.25, 0.5, 1.0) * fresnel * 0.8;

          // Soft day/night transition
          float sunDot = dot(normal, sunDir);
          float dayMix = smoothstep(-0.35, 0.35, sunDot);

          // Sample textures
          vec3 dayColor = texture2D(tMap, vUv).rgb;
          vec3 nightColor = texture2D(tNight, vUv).rgb * 0.4;

          // Enhanced blend with subtle terminator glow
          vec3 terminatorGlow = vec3(0.8, 0.4, 0.2) * (1.0 - abs(sunDot)) * 0.15;
          vec3 surfaceColor = mix(nightColor, dayColor, dayMix) + terminatorGlow;

          // Ocean specular with improved calculation
          float oceanMask = max(0.0, (dayColor.b - max(dayColor.r, dayColor.g)) * 2.0);
          vec3 halfDir = normalize(sunDir - viewDir);
          float specular = oceanMask * pow(max(0.0, dot(normal, halfDir)), 32.0) * 0.6;

          // Subtle land/mountain shadows
          float landMask = 1.0 - oceanMask;
          vec3 shadowVariation = mix(vec3(1.0), vec3(0.92, 0.88, 0.85), landMask * 0.3);

          // Final composition
          vec3 finalColor = (surfaceColor * shadowVariation) + rimColor + vec3(specular);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.FrontSide,
      depthTest: true,
      depthWrite: true,
    });

    meshRef.current.geometry = geometry;
    meshRef.current.material = material;
    materialRef.current = material;

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [textures, sunDirection]);

  useFrame(() => {
    if (materialRef.current && meshRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uSunDirection.value = new THREE.Vector3(...sunDirection).normalize();
      meshRef.current.rotation.y += 0.0001; // Very slow rotation for idle animation
    }
  });

  return <mesh ref={meshRef} />;
}
