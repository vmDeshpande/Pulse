'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Intro duration: 500ms for fast load
    const timer = setTimeout(() => {
      setIsComplete(true);
      onComplete();
    }, 500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleComplete = () => {
    setIsComplete(true);
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isComplete ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-black z-[999] pointer-events-auto cursor-pointer"
      onClick={handleComplete}
    >
      {/* Star fade-in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.5, delay: 0 }}
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Earth glow placeholder */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.3 }}
          className="absolute w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"
        />

        {/* Title fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 1.5 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-6xl font-light tracking-widest text-white mb-4">PULSE</h1>
          <p className="text-sm text-blue-300/60 tracking-widest">Explore Earth in Real Time</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
