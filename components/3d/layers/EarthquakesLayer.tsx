'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';
import { Earthquake, generateMockEarthquakes } from '@/lib/mockData';
import { registerEventData } from '@/hooks/useEventCard';
import { getLODConfig, shouldShowEarthquake } from '@/lib/lodSystem';
import { latLonToVector3, isPointVisibleFromCamera, getHeightOffset } from '@/lib/coordinateSystem';
import { createSurfaceAlignedGroup } from '@/lib/surfaceProjection';

export function EarthquakesLayer() {
  const { scene } = useThree();
  const groupRef = useRef<THREE.Group | null>(null);
  const quakesRef = useRef<Map<string, THREE.Group>>(new Map());
  const quakesDataRef = useRef<Earthquake[]>([]);
  const { visibleLayers, time, cameraZoom } = useSceneStore();

  // Pool of earthquakes - new ones added periodically (reduced from 20 to 10)
  const initialQuakes = useMemo(() => generateMockEarthquakes(10), []);
  
  // Store camera position for LOD calculation
  const { cameraPosition } = useSceneStore();

  useEffect(() => {
    if (!visibleLayers.has('earthquakes')) return;

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // Add initial earthquakes
    initialQuakes.forEach((quake) => {
      createEarthquakeVisual(quake, group, quakesRef);
      quakesDataRef.current.push(quake);
    });

    // Periodically add new earthquakes - reduced frequency
    const quakeInterval = setInterval(() => {
      if (Math.random() > 0.6) {  // Only 40% chance
        const newQuake: Earthquake = {
          ...generateMockEarthquakes(1)[0],
          age: 0,
        };
        createEarthquakeVisual(newQuake, group, quakesRef);
        quakesDataRef.current.push(newQuake);
      }
    }, 3000);  // Every 3 seconds instead of 2

    return () => {
      clearInterval(quakeInterval);
      scene.remove(group);
      quakesRef.current.clear();
    };
  }, [visibleLayers, scene, initialQuakes]);

  useFrame(() => {
    if (!visibleLayers.has('earthquakes')) return;

    const cameraPos = new THREE.Vector3(...cameraPosition);
    const lodConfig = getLODConfig(cameraPos.length());

    const toRemove: string[] = [];

    quakesDataRef.current.forEach((quake) => {
      quake.age += 16;
      const progress = Math.min(quake.age / quake.maxAge, 1);

      const visual = quakesRef.current.get(quake.id);
      if (visual) {
        // Check occlusion - only visible if facing camera
        const isVisible = isPointVisibleFromCamera(visual.position, cameraPos);

        // Scale ripples based on age - much more subtle
        const scale = 1 + progress * 1.5;
        visual.scale.set(scale, scale, scale);

        // Fade out more quickly
        visual.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material as THREE.MeshBasicMaterial;
            mat.opacity = (1 - progress) * 0.5;
          }
        });

        // LOD-based visibility: only show if magnitude meets threshold AND not occluded
        const meetsThreshold = shouldShowEarthquake(quake.magnitude, lodConfig.earthquakeThreshold);
        visual.visible = isVisible && meetsThreshold && progress < 0.9;
      }

      if (progress >= 1) {
        toRemove.push(quake.id);
      }
    });

    // Remove expired earthquakes
    toRemove.forEach((id) => {
      const visual = quakesRef.current.get(id);
      if (visual && groupRef.current) {
        groupRef.current.remove(visual);
      }
      quakesRef.current.delete(id);
      quakesDataRef.current = quakesDataRef.current.filter((q) => q.id !== id);
    });
  });

  return null;
}

function createEarthquakeVisual(
  quake: Earthquake,
  group: THREE.Group,
  quakesRef: React.MutableRefObject<Map<string, THREE.Group>>
) {
  // Use surface-aligned group to ensure proper geometry orientation
  const quakeGroup = createSurfaceAlignedGroup(
    quake.latitude || 0,
    quake.longitude || 0,
    1.005  // Slight offset above Earth surface
  );
  quakeGroup.userData = { id: quake.id, type: 'earthquake' };

  // Color intensity based on magnitude
  let color = 0xfbbf24;    // Amber for small
  if (quake.magnitude > 5) color = 0xf97316;  // Orange
  if (quake.magnitude > 6) color = 0xef4444;  // Red
  if (quake.magnitude > 7) color = 0xdc2626;  // Dark red

  // Scale ripples based on magnitude
  const rippleCount = quake.magnitude > 6 ? 2 : 1;
  const baseRadius = 0.015 * (quake.magnitude / 5);

  // Create ripple material (shared for all ripples)
  const rippleMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: false,  // Don't occlude other ripples
  });

  // Create ripple rings in local coordinate system (XY plane)
  for (let i = 0; i < rippleCount; i++) {
    const ringGeometry = new THREE.RingGeometry(
      baseRadius + i * 0.01,
      baseRadius + i * 0.01 + 0.008,
      20
    );
    const ring = new THREE.Mesh(ringGeometry, rippleMaterial);
    quakeGroup.add(ring);
  }

  // Center point
  const dotGeometry = new THREE.SphereGeometry(0.004, 6, 6);
  const dotMaterial = new THREE.MeshBasicMaterial({ color, depthTest: true });
  const dot = new THREE.Mesh(dotGeometry, dotMaterial);
  quakeGroup.add(dot);

  group.add(quakeGroup);
  quakesRef.current.set(quake.id, quakeGroup);

  // Register event data
  registerEventData(quake.id, 'earthquake', quake);
}
