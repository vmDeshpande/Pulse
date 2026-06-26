'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';
import { Flight, generateMockFlights } from '@/lib/mockData';
import { registerEventData } from '@/hooks/useEventCard';
import { getLODConfig, shouldRender } from '@/lib/lodSystem';
import { latLonToVector3, isPointVisibleFromCamera, getHeightOffset } from '@/lib/coordinateSystem';

export function FlightsLayer() {
  const { scene } = useThree();
  const flightsRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const flightDataRef = useRef<Flight[]>([]);
  const trailsRef = useRef<Map<string, THREE.Line>>(new Map());
  const groupRef = useRef<THREE.Group | null>(null);
  const { visibleLayers, time, cameraZoom, cameraPosition } = useSceneStore();

  // Generate flights once - 100 total flights for full detail level
  const flights = useMemo(() => generateMockFlights(100), []);

  // Reuse material and geometry for all flights (performance optimization)
  const markerGeometry = useMemo(() => new THREE.SphereGeometry(0.003, 6, 6), []);
  const markerMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0x22d3ee, depthTest: true, depthWrite: true }),
    []
  );
  const trailMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.2,
        linewidth: 1,
        depthTest: true,
      }),
    []
  );

  useEffect(() => {
    if (!visibleLayers.has('flights')) return;

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // Create flight meshes using shared materials/geometries
    flights.forEach((flight) => {
      const mesh = new THREE.Mesh(markerGeometry, markerMaterial);

      // Make clickable
      mesh.userData = { id: flight.id, type: 'flight' };

      // Convert lat/lon to 3D position on Earth surface
      const position = latLonToVector3(flight.latitude || 0, flight.longitude || 0, getHeightOffset('low'));
      mesh.position.copy(position);

      // Store for reference
      (mesh.userData as any).latitude = flight.latitude;
      (mesh.userData as any).longitude = flight.longitude;

      group.add(mesh);

      // Register event data
      registerEventData(flight.id, 'flight', flight);

      flightsRef.current.set(flight.id, mesh);

      // Create thin trail
      const trailGeometry = new THREE.BufferGeometry();
      const trail = new THREE.Line(trailGeometry, trailMaterial);
      group.add(trail);
      trailsRef.current.set(flight.id, trail);

      flightDataRef.current.push(flight);
    });

    return () => {
      scene.remove(group);
      flightsRef.current.clear();
      trailsRef.current.clear();
    };
  }, [visibleLayers, scene, flights]);

  useFrame(() => {
    if (!visibleLayers.has('flights') || !groupRef.current) return;

    const cameraPos = new THREE.Vector3(...cameraPosition);

    flightDataRef.current.forEach((flight) => {
      const mesh = flightsRef.current.get(flight.id);
      if (!mesh) return;

      // Update flight progress (only if not paused)
      if (!useSceneStore.getState().isPaused) {
        flight.progress += (flight.speed / 40075) * 0.0001;
        if (flight.progress > 1) flight.progress = 0;
      }

      // Update position on Earth surface based on current route progress
      if (flight.latitude !== undefined && flight.longitude !== undefined) {
        const newPos = latLonToVector3(flight.latitude, flight.longitude, getHeightOffset('low'));
        mesh.position.copy(newPos);
      }

      // Check occlusion - only visible if point faces camera
      const isVisible = isPointVisibleFromCamera(mesh.position, cameraPos);

      // LOD-based visibility
      const shouldBeVisible = isVisible && shouldRender(flight.id, 0.3);
      mesh.visible = shouldBeVisible;

      // Update trail if visible
      const trail = trailsRef.current.get(flight.id);
      if (trail && shouldBeVisible) {
        if (!flight.trailPoints) flight.trailPoints = [];
        flight.trailPoints.push(mesh.position.toArray());
        if (flight.trailPoints.length > 15) flight.trailPoints.shift();

        if (flight.trailPoints.length > 1) {
          const positions = new Float32Array(flight.trailPoints.flat());
          const geometry = trail.geometry as THREE.BufferGeometry;
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        }
      }

      if (trail) trail.visible = shouldBeVisible;
    });
  });

  return null;
}
