"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "@/store/useSceneStore";
import { textureManager } from "@/lib/textureManager";

export function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { sunDirection, time } = useSceneStore();

  const textures = useMemo(() => textureManager.getTextureSet(), []);

  useEffect(() => {
    if (!meshRef.current) return;

    const geometry = new THREE.SphereGeometry(1, 128, 64);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        tDay: { value: textures.day },
        tNight: { value: textures.night },
        tNormal: { value: textures.normal },
        tSpecular: { value: textures.specular },
        uSunDirection: {
          value: new THREE.Vector3(...sunDirection).normalize(),
        },
        uTime: { value: time },
      },

      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPos;

        void main(){

            vUv = uv;

            vNormal =
                normalize(normalMatrix * normal);

            vec4 worldPos =
                modelMatrix *
                vec4(position,1.0);

            vWorldPos = worldPos.xyz;

            gl_Position =
                projectionMatrix *
                viewMatrix *
                worldPos;
        }
      `,

      fragmentShader: `
        uniform sampler2D tDay;
        uniform sampler2D tNight;
        uniform sampler2D tNormal;
        uniform sampler2D tSpecular;

        uniform vec3 uSunDirection;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPos;

        void main(){

            vec3 normal = normalize(vNormal);

            vec3 lightDir =
                normalize(uSunDirection);

            vec3 viewDir =
                normalize(cameraPosition - vWorldPos);

            float NdotL =
                max(dot(normal,lightDir),0.0);

            float dayAmount =
                smoothstep(
                    -0.15,
                    0.20,
                    dot(normal,lightDir)
                );

            vec3 day =
texture2D(
    tDay,
    vUv
).rgb;

day *= 0.82;

            vec3 night =
                texture2D(
                    tNight,
                    vUv
                ).rgb;

            float specMask =
                texture2D(
                    tSpecular,
                    vUv
                ).r;

            vec3 halfVector =
                normalize(
                    lightDir +
                    viewDir
                );

            float specular =
                pow(
                    max(
                        dot(
                            normal,
                            halfVector
                        ),
                        0.0
                    ),
                    64.0
                );

            specular *=
                specMask *
                NdotL *
                0.18;

            float fresnel =
                pow(
                    1.0 -
                    max(
                        dot(
                            normal,
                            viewDir
                        ),
                        0.0
                    ),
                    4.0
                );

            vec3 rim =
vec3(
0.16,
0.32,
0.75
) *
fresnel *
0.18;

            vec3 color =
                mix(
                    night,
                    day,
                    dayAmount
                );

            color += specular;

            color += rim;

            color *= 0.82;

// slight contrast
color = pow(
    color,
    vec3(1.08)
);

gl_FragColor =
    vec4(
        color,
        1.0
    );
        }
      `,

      depthWrite: true,
      depthTest: true,
      side: THREE.FrontSide,
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
    if (!materialRef.current || !meshRef.current) return;

    materialRef.current.uniforms.uSunDirection.value = new THREE.Vector3(
      ...sunDirection,
    ).normalize();

    meshRef.current.rotation.y += 0.0001;
  });

  return <mesh ref={meshRef} />;
}
