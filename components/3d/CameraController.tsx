'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';

export function CameraController() {
  const { camera } = useThree();
  const {
    cameraPosition,
    cameraTarget,
    cameraZoom,
    isAnimatingCamera,
    setCameraPosition,
    setCameraTarget,
    setAnimatingCamera,
  } = useSceneStore();

  const currentPos = useRef(new THREE.Vector3(...cameraPosition));
  const currentTarget = useRef(new THREE.Vector3(...cameraTarget));
  const targetPos = useRef(new THREE.Vector3(...cameraPosition));
  const targetTarget = useRef(new THREE.Vector3(...cameraTarget));

  // Mouse interaction state
  const [isDragging, setIsDragging] = useState(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const velocity = useRef(new THREE.Vector3());
  const angularVelocity = useRef({ x: 0, y: 0 });

  // Premium camera physics - smooth, natural deceleration with better inertia
  const damping = 0.92;   // Slightly less damping for better momentum feel
  const easing = 0.12;    // Responsive but smooth camera follow
  const minVelocityThreshold = 0.00001;  // Stop animating when velocity is negligible

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      angularVelocity.current = { x: 0, y: 0 };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      // Apply rotation based on mouse movement
      const rotationScale = 0.01;
      angularVelocity.current.x = deltaY * rotationScale;
      angularVelocity.current.y = deltaX * rotationScale;

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const zoomDelta = e.deltaY > 0 ? 1.1 : 0.9;
      const newZoom = Math.max(0.5, Math.min(5, cameraZoom * zoomDelta));

      // Update target position based on zoom
      const direction = targetTarget.current.clone().sub(targetPos.current);
      const distance = direction.length() / newZoom;
      const newPos = targetTarget.current.clone().sub(direction.normalize().multiplyScalar(distance));

      targetPos.current.copy(newPos);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [isDragging, cameraZoom]);

  useFrame(() => {
    if (!isAnimatingCamera) {
      // Apply inertia damping
      angularVelocity.current.x *= damping;
      angularVelocity.current.y *= damping;

      if (Math.abs(angularVelocity.current.x) > minVelocityThreshold || Math.abs(angularVelocity.current.y) > minVelocityThreshold) {
        // Rotate around target
        const sphericalDelta = new THREE.Spherical().setFromVector3(
          targetPos.current.clone().sub(targetTarget.current)
        );

        sphericalDelta.theta -= angularVelocity.current.y;
        sphericalDelta.phi -= angularVelocity.current.x;

        // Constrain phi to avoid gimbal lock
        sphericalDelta.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalDelta.phi));

        targetPos.current.copy(new THREE.Vector3().setFromSpherical(sphericalDelta).add(targetTarget.current));
      }
    }

    // Smooth camera movement with premium easing
    currentPos.current.lerp(targetPos.current, easing);
    currentTarget.current.lerp(targetTarget.current, easing);

    // Idle breathing animation - subtle, natural motion
    if (!isDragging && !isAnimatingCamera) {
      const now = Date.now() * 0.0004;
      const breathingX = Math.sin(now) * 0.015;
      const breathingY = Math.cos(now * 0.7) * 0.015;
      const breathingZ = Math.sin(now * 0.5) * 0.01;

      const pos = currentPos.current.clone();
      pos.add(new THREE.Vector3(breathingX, breathingY, breathingZ));
      camera.position.copy(pos);
    } else {
      camera.position.copy(currentPos.current);
    }

    camera.lookAt(currentTarget.current);

    // Update store
    setCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
    setCameraTarget([currentTarget.current.x, currentTarget.current.y, currentTarget.current.z]);
  });

  return null;
}
