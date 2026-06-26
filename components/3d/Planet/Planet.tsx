"use client";

import { PlanetRuntimeProvider } from "./runtime/PlanetRuntime";

import { Surface } from "./Surface";
import { Clouds } from "./Clouds";
import { Atmosphere } from "./Atmosphere";

export function Planet() {
  return (
    <PlanetRuntimeProvider>
      <Surface />
      <Clouds />
      <Atmosphere />
    </PlanetRuntimeProvider>
  );
}