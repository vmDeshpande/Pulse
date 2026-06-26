import { create } from 'zustand';
import * as THREE from 'three';

export interface SceneState {
  // Camera state
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  cameraZoom: number;
  isAnimatingCamera: boolean;

  // Scene state
  sunDirection: [number, number, number];
  time: number;
  isPaused: boolean;

  // Layer visibility
  visibleLayers: Set<string>;
  selectedEvent: string | null;

  // Rendering
  bloomStrength: number;
  exposure: number;
  atmosphereOpacity: number;
  uiDimmed: boolean;

  // Actions
  setCameraPosition: (pos: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  setCameraZoom: (zoom: number) => void;
  setAnimatingCamera: (animating: boolean) => void;
  setSunDirection: (dir: [number, number, number]) => void;
  setTime: (time: number) => void;
  togglePause: () => void;
  toggleLayerVisibility: (layerId: string) => void;
  setSelectedEvent: (eventId: string | null) => void;
  setBloomStrength: (strength: number) => void;
  setExposure: (exposure: number) => void;
  setAtmosphereOpacity: (opacity: number) => void;
  setUiDimmed: (dimmed: boolean) => void;
}

// Camera preset positions for different views
export const cameraPresets = {
  earth: {
    position: [0, 0, 2.5],
    target: [0, 0, 0],
    zoom: 1,
  },
  northAmerica: {
    position: [-1.5, 0.5, 1.8],
    target: [-1, 0, 0],
    zoom: 2,
  },
  europe: {
    position: [0.5, 0.3, 1.8],
    target: [0.3, 0, 0],
    zoom: 2,
  },
  asia: {
    position: [1.2, 0.2, 1.8],
    target: [1, 0, 0],
    zoom: 2,
  },
};

export const useSceneStore = create<SceneState>((set) => ({
  // Initial state
  cameraPosition: cameraPresets.earth.position as [number, number, number],
  cameraTarget: cameraPresets.earth.target as [number, number, number],
  cameraZoom: cameraPresets.earth.zoom,
  isAnimatingCamera: false,

  sunDirection: [1, 0.3, 1] as [number, number, number],
  time: 0,
  isPaused: false,

  visibleLayers: new Set(['flights', 'earthquakes', 'wildfires', 'iss']),
  selectedEvent: null,

  bloomStrength: 1.2,
  exposure: 1.0,
  atmosphereOpacity: 0.4,
  uiDimmed: false,

  // Actions
  setCameraPosition: (pos) => set({ cameraPosition: pos as [number, number, number] }),
  setCameraTarget: (target) => set({ cameraTarget: target as [number, number, number] }),
  setCameraZoom: (zoom) => set({ cameraZoom: Math.max(0.5, Math.min(5, zoom)) }),
  setAnimatingCamera: (animating) => set({ isAnimatingCamera: animating }),
  setSunDirection: (dir) => set({ sunDirection: dir as [number, number, number] }),
  setTime: (time) => set({ time: time as number }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  toggleLayerVisibility: (layerId) =>
    set((state) => {
      const newLayers = new Set(state.visibleLayers);
      if (newLayers.has(layerId)) {
        newLayers.delete(layerId);
      } else {
        newLayers.add(layerId);
      }
      return { visibleLayers: newLayers };
    }),
  setSelectedEvent: (eventId) => set({ selectedEvent: eventId }),
  setBloomStrength: (strength) => set({ bloomStrength: strength }),
  setExposure: (exposure) => set({ exposure }),
  setAtmosphereOpacity: (opacity) => set({ atmosphereOpacity: opacity }),
  setUiDimmed: (dimmed) => set({ uiDimmed: dimmed }),
}));
