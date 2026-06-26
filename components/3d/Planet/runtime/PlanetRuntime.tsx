"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import * as THREE from "three";

import { textureManager } from "@/lib/textureManager";
import { useSceneStore } from "@/store/useSceneStore";

export interface PlanetRuntimeState {
  textures: ReturnType<typeof textureManager.getTextureSet>;

  uniforms: {
    uTime: { value: number };
    uSunDirection: { value: THREE.Vector3 };
  };
}

const PlanetRuntimeContext =
  createContext<PlanetRuntimeState | null>(null);

export function PlanetRuntimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { time, sunDirection } = useSceneStore();

  const textures = useMemo(
    () => textureManager.getTextureSet(),
    []
  );

  const uniforms = useRef({
    uTime: {
      value: time,
    },

    uSunDirection: {
      value: new THREE.Vector3(...sunDirection).normalize(),
    },
  });

  uniforms.current.uTime.value = time;

  uniforms.current.uSunDirection.value.set(
    ...sunDirection
  ).normalize();

  return (
    <PlanetRuntimeContext.Provider
      value={{
        textures,
        uniforms: uniforms.current,
      }}
    >
      {children}
    </PlanetRuntimeContext.Provider>
  );
}

export function usePlanetRuntime() {
  const runtime = useContext(
    PlanetRuntimeContext
  );

  if (!runtime) {
    throw new Error(
      "usePlanetRuntime must be used inside PlanetRuntimeProvider."
    );
  }

  return runtime;
}