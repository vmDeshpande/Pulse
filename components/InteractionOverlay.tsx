'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSceneStore } from '@/store/useSceneStore';

export function InteractionOverlay() {
  const [isInteracting, setIsInteracting] = useState(false);
  const { setUiDimmed } = useSceneStore();
  let interactionTimeout: NodeJS.Timeout | null = null;

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const handleInteractionStart = () => {
      setIsInteracting(true);
      setUiDimmed(true);
      
      if (interactionTimeout) clearTimeout(interactionTimeout);
    };

    const handleInteractionEnd = () => {
      if (interactionTimeout) clearTimeout(interactionTimeout);
      
      interactionTimeout = setTimeout(() => {
        setIsInteracting(false);
        setUiDimmed(false);
      }, 500);
    };

    const handleMouseDown = () => handleInteractionStart();
    const handleMouseUp = () => handleInteractionEnd();
    const handleTouchStart = () => handleInteractionStart();
    const handleTouchEnd = () => handleInteractionEnd();

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      if (interactionTimeout) clearTimeout(interactionTimeout);
    };
  }, [setUiDimmed]);

  return null;
}
