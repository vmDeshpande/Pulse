'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface PerformanceStats {
  fps: number;
  frameTime: number;
  memory?: number;
  trend: 'stable' | 'improving' | 'declining';
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    frameTime: 16.7,
    trend: 'stable',
  });

  const statsRef = useRef({
    frames: 0,
    lastTime: performance.now(),
    frameTimeHistory: [] as number[],
    fpsHistory: [60, 60, 60] as number[],
  });

  useEffect(() => {
    const measureFrame = () => {
      const now = performance.now();
      const deltaTime = now - statsRef.current.lastTime;

      if (deltaTime >= 1000) {
        // Update every second
        const avgFrameTime =
          statsRef.current.frameTimeHistory.reduce((a, b) => a + b, 0) / statsRef.current.frameTimeHistory.length ||
          16.7;
        const fps = Math.round(1000 / avgFrameTime);

        // Track trend
        statsRef.current.fpsHistory.push(fps);
        if (statsRef.current.fpsHistory.length > 3) {
          statsRef.current.fpsHistory.shift();
        }
        
        const trend =
          fps > statsRef.current.fpsHistory[1] + 5 ? 'improving' :
          fps < statsRef.current.fpsHistory[1] - 5 ? 'declining' :
          'stable';

        setStats({
          fps,
          frameTime: Math.round(avgFrameTime * 10) / 10,
          memory:
            (performance as any).memory?.usedJSHeapSize
              ? Math.round(((performance as any).memory.usedJSHeapSize / (1024 * 1024)) * 10) / 10
              : undefined,
          trend,
        });

        statsRef.current.frames = 0;
        statsRef.current.lastTime = now;
        statsRef.current.frameTimeHistory = [];
      }

      statsRef.current.frames++;
      statsRef.current.frameTimeHistory.push(deltaTime / statsRef.current.frames);

      requestAnimationFrame(measureFrame);
    };

    const frameId = requestAnimationFrame(measureFrame);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Get color based on FPS
  const getColor = (fps: number) => {
    if (fps >= 50) return 'text-emerald-400';
    if (fps >= 30) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return '↗';
    if (trend === 'declining') return '↘';
    return '→';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
      className="fixed bottom-8 right-8 z-40 pointer-events-auto"
    >
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg shadow-black/20">
        <div className={`font-light text-xs space-y-2 ${getColor(stats.fps)}`}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-white/60">Performance</span>
            <motion.span
              key={stats.trend}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.4 }}
            >
              {getTrendIcon(stats.trend)}
            </motion.span>
          </div>
          <div className="flex gap-4">
            <motion.div
              animate={{ color: getColor(stats.fps) }}
              transition={{ duration: 0.3 }}
              className="flex items-baseline gap-1"
            >
              <span className="text-xl font-light">{stats.fps}</span>
              <span className="text-white/40">FPS</span>
            </motion.div>
            <div className="text-white/40">
              {stats.frameTime}ms
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
