'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';

export function RaycastInteraction() {
  const { camera, gl, scene } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const { setSelectedEvent } = useSceneStore();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Collect all interactable objects from the scene
      const interactables: THREE.Object3D[] = [];
      scene.traverse((obj) => {
        if (obj.userData && obj.userData.id && obj.userData.type) {
          interactables.push(obj);
        }
      });

      // Calculate objects intersecting the picking ray
      const intersects = raycasterRef.current.intersectObjects(interactables);

      if (intersects.length > 0) {
        // Find the first intersection with valid userData
        for (const intersection of intersects) {
          let obj = intersection.object;
          
          // Check if the object or any of its parents have userData
          while (obj && !obj.userData?.id) {
            obj = obj.parent as THREE.Object3D;
            if (!obj) break;
          }

          if (obj && obj.userData?.id) {
            setSelectedEvent(obj.userData.id);
            break;
          }
        }
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [camera, gl, scene, setSelectedEvent]);

  return null;
}
