"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "@/store/useSceneStore";
import { textureManager } from "@/lib/textureManager";

export function Clouds() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { time } = useSceneStore();

  const textures = useMemo(() => textureManager.getTextureSet(), []);
  const cloudTexture = textures.clouds;

  useEffect(() => {
    if (!meshRef.current) return;

    cloudTexture.wrapS = THREE.RepeatWrapping;
    cloudTexture.wrapT = THREE.ClampToEdgeWrapping;

    const geometry = new THREE.SphereGeometry(1.025, 128, 64);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        tClouds: { value: cloudTexture },
        uTime: { value: time },
      },

      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(position,1.0);
        }
      `,

      fragmentShader: `
        uniform sampler2D tClouds;
        uniform float uTime;

        varying vec2 vUv;

        void main() {

          vec2 uv = vUv;

          // very slow cloud rotation
          uv.x += uTime * 0.002;

          vec4 tex = texture2D(tClouds, uv);

          // brightness becomes cloud density
          float density = tex.r;

          // remove dark background
          density = smoothstep(
            0.18,
            0.85,
            density
          );

          vec3 cloudColor = vec3(1.0);

          gl_FragColor = vec4(
            cloudColor,
            density * 0.45
          );
        }
      `,

      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
    });

    meshRef.current.geometry = geometry;
    meshRef.current.material = material;
    materialRef.current = material;

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [cloudTexture]);

  useFrame(() => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value = time;
  });

  return <mesh ref={meshRef} />;
}