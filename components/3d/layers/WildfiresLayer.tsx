'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';
import { Wildfire, generateMockWildfires } from '@/lib/mockData';
import { registerEventData } from '@/hooks/useEventCard';
import { getLODConfig, shouldRender } from '@/lib/lodSystem';
import { latLonToVector3, isPointVisibleFromCamera, getHeightOffset } from '@/lib/coordinateSystem';
import { createSurfaceAlignedGroup } from '@/lib/surfaceProjection';

export function WildfiresLayer() {
  const { scene } = useThree();
  const groupRef = useRef<THREE.Group | null>(null);
  const firesRef = useRef<Map<string, THREE.Group>>(new Map());
  const firesDataRef = useRef<Wildfire[]>([]);
  const { visibleLayers, time, cameraZoom } = useSceneStore();

  const initialFires = useMemo(() => generateMockWildfires(10), []);
  
  // Store camera position for LOD calculation
  const { cameraPosition } = useSceneStore();

  useEffect(() => {
    if (!visibleLayers.has('wildfires')) return;

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    initialFires.forEach((fire) => {
      createWildfireVisual(fire, group, firesRef, time);
      firesDataRef.current.push(fire);
    });

    // Add new wildfires periodically - reduced frequency
    const fireInterval = setInterval(() => {
      if (Math.random() > 0.7) {  // Only 30% chance
        const newFire: Wildfire = {
          ...generateMockWildfires(1)[0],
          age: 0,
        };
        createWildfireVisual(newFire, group, firesRef, time);
        firesDataRef.current.push(newFire);
      }
    }, 4000);  // Every 4 seconds instead of 3

    return () => {
      clearInterval(fireInterval);
      scene.remove(group);
      firesRef.current.clear();
    };
  }, [visibleLayers, scene, initialFires, time]);

  useFrame(() => {
    if (!visibleLayers.has('wildfires')) return;

    const cameraPos = new THREE.Vector3(...cameraPosition);
    const lodConfig = getLODConfig(cameraPos.length());

    const toRemove: string[] = [];

    firesDataRef.current.forEach((fire) => {
      fire.age += 16;
      const progress = Math.min(fire.age / fire.maxAge, 1);

      const visual = firesRef.current.get(fire.id);
      if (visual) {
        // Check occlusion - only visible if facing camera
        const isVisible = isPointVisibleFromCamera(visual.position, cameraPos);

        // Subtle breathing glow animation
        const breathe = Math.sin(time * 2 + fire.id.charCodeAt(0)) * 0.3 + 0.8;
        
        visual.children.forEach((child, idx) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material as THREE.MeshBasicMaterial;
            // Core fades slowly, glow fades faster
            const fade = idx === 0 ? (1 - progress * 0.3) : (1 - progress * 0.5);
            mat.opacity = Math.max(0, fade * breathe * (idx === 0 ? 0.8 : 0.2));
          }
        });

        // Minimal scale pulsing
        const scaleVar = 1 + Math.sin(time * 3 + fire.id.charCodeAt(1)) * 0.1;
        visual.scale.set(scaleVar, scaleVar, scaleVar);

        // LOD-based visibility: only show if passes culling test AND not occluded
        const shouldBeVisible = shouldRender(fire.id, lodConfig.wildfireVisibility) && isVisible;
        visual.visible = shouldBeVisible;
      }

      if (progress >= 1) {
        toRemove.push(fire.id);
      }
    });

    toRemove.forEach((id) => {
      const visual = firesRef.current.get(id);
      if (visual && groupRef.current) {
        groupRef.current.remove(visual);
      }
      firesRef.current.delete(id);
      firesDataRef.current = firesDataRef.current.filter((f) => f.id !== id);
    });
  });

  return null;
}

function createWildfireVisual(
  fire: Wildfire,
  group: THREE.Group,
  firesRef: React.MutableRefObject<Map<string, THREE.Group>>,
  time: number
) {
  // Use surface-aligned positioning for proper orientation
  const fireGroup = createSurfaceAlignedGroup(fire.latitude || 0, fire.longitude || 0, 1.01);
  fireGroup.userData = { id: fire.id, type: 'wildfire' };

  // Glowing hotspot material
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6b35,  // Warm orange
    transparent: true,
    opacity: 0.8,
    depthTest: true,
  });

  // Tiny core glow
  const geometry = new THREE.SphereGeometry(0.008, 8, 8);
  const sphere = new THREE.Mesh(geometry, glowMaterial);
  fireGroup.add(sphere);

  // Subtle outer glow
  const glowGeometry = new THREE.SphereGeometry(0.015, 8, 8);
  const outerGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffa500,
    transparent: true,
    opacity: 0.2,
    depthTest: true,
  });
  const glow = new THREE.Mesh(glowGeometry, outerGlowMaterial);
  fireGroup.add(glow);

  group.add(fireGroup);
  firesRef.current.set(fire.id, fireGroup);

  // Register event data
  registerEventData(fire.id, 'wildfire', fire);
}
