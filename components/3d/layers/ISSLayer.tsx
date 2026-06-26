'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';
import { ISS, generateMockISS } from '@/lib/mockData';
import { registerEventData } from '@/hooks/useEventCard';

export function ISSLayer() {
  const { scene } = useThree();
  const groupRef = useRef<THREE.Group | null>(null);
  const issModelRef = useRef<THREE.Mesh | null>(null);
  const trailRef = useRef<THREE.Line | null>(null);
  const issDataRef = useRef<ISS>(generateMockISS());
  const { visibleLayers, time, cameraZoom, cameraPosition } = useSceneStore();

  useEffect(() => {
    if (!visibleLayers.has('iss')) return;

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // ISS model - much smaller and more subtle
    const geometry = new THREE.BoxGeometry(0.012, 0.024, 0.012);
    const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const iss = new THREE.Mesh(geometry, material);
    iss.userData = { id: 'iss', type: 'iss' };
    issModelRef.current = iss;
    group.add(iss);

    // Minimal solar panel detail
    const panelGeometry = new THREE.PlaneGeometry(0.04, 0.015);
    const panelMaterial = new THREE.MeshBasicMaterial({ color: 0x4da6ff, transparent: true, opacity: 0.5 });
    
    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.set(-0.025, 0, 0);
    iss.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.set(0.025, 0, 0);
    iss.add(rightPanel);

    // Thin orbit trail - very subtle
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0x00d966,
      transparent: true,
      opacity: 0.15,
      linewidth: 1,
    });
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    trailRef.current = trail;
    group.add(trail);

    return () => {
      scene.remove(group);
    };
  }, [visibleLayers, scene]);

  useFrame(() => {
    if (!visibleLayers.has('iss') || !issModelRef.current || !groupRef.current) return;

    const iss = issDataRef.current;

    // Update ISS position based on orbit
    iss.orbitProgress = (Date.now() / 1000 / 5400) % 1; // 90 min orbit
    const theta = iss.orbitProgress * Math.PI * 2;

    const inclination = (51.6 * Math.PI) / 180;
    const radius = 1.05;

    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    const y = radius * Math.sin(theta) * Math.sin(inclination);

    const pos = new THREE.Vector3(x, y, z).normalize().multiplyScalar(1.05);
    issModelRef.current.position.copy(pos);

    // Update latitude/longitude
    iss.position = [pos.x, pos.y, pos.z];
    iss.latitude = (Math.asin(pos.y) * 180) / Math.PI;
    iss.longitude = (Math.atan2(pos.z, pos.x) * 180) / Math.PI;

    // Keep event data fresh
    registerEventData('iss', 'iss', issDataRef.current);

    // Add to trail - reduced trail length from 100 to 40
    if (!iss.trailPoints) iss.trailPoints = [];
    iss.trailPoints.push([pos.x, pos.y, pos.z]);
    if (iss.trailPoints.length > 40) {
      iss.trailPoints.shift();
    }

    // Update trail geometry
    if (trailRef.current && iss.trailPoints.length > 1) {
      const positions = new Float32Array(iss.trailPoints.flat());
      const geometry = trailRef.current.geometry as THREE.BufferGeometry;
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }

    // Look towards direction of travel
    const nextTheta = ((iss.orbitProgress + 0.01) % 1) * Math.PI * 2;
    const nextX = radius * Math.cos(nextTheta);
    const nextZ = radius * Math.sin(nextTheta);
    const nextY = radius * Math.sin(nextTheta) * Math.sin(inclination);
    const nextPos = new THREE.Vector3(nextX, nextY, nextZ).normalize().multiplyScalar(1.05);

    const lookTarget = nextPos.clone();
    issModelRef.current.lookAt(lookTarget);

    // ISS always visible, trail only visible when zoomed in
    issModelRef.current.visible = true;
    if (trailRef.current) trailRef.current.visible = cameraZoom > 1.5;
  });

  return null;
}
