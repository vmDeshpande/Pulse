'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';

interface InteractableObject {
  id: string;
  type: 'flight' | 'earthquake' | 'wildfire' | 'iss';
  mesh: THREE.Mesh;
  data: any;
}

export function InteractionSystem() {
  const { camera, raycaster, gl } = useThree();
  const interactablesRef = useRef<Map<string, InteractableObject>>(new Map());
  const { setSelectedEvent } = useSceneStore();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const intersects = raycaster.intersectObjects(
        Array.from(interactablesRef.current.values()).map((obj) => obj.mesh),
        true
      );

      if (intersects.length > 0) {
        const intersected = intersects[0];
        // Find the interactable that was hit
        for (const [id, obj] of interactablesRef.current) {
          if (obj.mesh === intersected.object || obj.mesh.children.includes(intersected.object as any)) {
            setSelectedEvent(id);
            break;
          }
        }
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [camera, raycaster, gl, setSelectedEvent]);

  // Expose method to register interactable objects
  return null;
}

export function registerInteractable(
  id: string,
  type: 'flight' | 'earthquake' | 'wildfire' | 'iss',
  mesh: THREE.Mesh,
  data: any
) {
  // This would be called from the layer components
  // For now, we'll keep this simple and use a global ref
}
