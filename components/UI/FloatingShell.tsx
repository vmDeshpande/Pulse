'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSceneStore } from '@/store/useSceneStore';
import { Menu, X, Info } from 'lucide-react';

const layerColors = {
  flights: '#3b82f6',
  earthquakes: '#ef4444',
  wildfires: '#f97316',
  iss: '#8b5cf6',
};

const layerLabels = {
  flights: 'Global Flights',
  earthquakes: 'Earthquakes',
  wildfires: 'Active Fires',
  iss: 'ISS Position',
};

export function FloatingShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { isPaused, togglePause, visibleLayers, toggleLayerVisibility } = useSceneStore();

  const layerVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  const buttonHoverVariants = {
    hover: { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' },
    tap: { scale: 0.95 },
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-8 left-8 right-8 pointer-events-auto"
      >
        <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-8 py-4 shadow-lg shadow-black/20">
          <div className="space-y-1">
            <h1 className="text-2xl font-light tracking-[0.2em] text-white">PULSE</h1>
            <p className="text-xs text-blue-300/70 tracking-widest">Real-Time Earth Monitor</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setShowInfo(!showInfo)}
              className="p-2.5 rounded-full transition-colors duration-300"
              title="Information (? key)"
            >
              <Info size={20} className="text-white/60" />
            </motion.button>
            <motion.button
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-full transition-colors duration-300"
              title="Menu"
            >
              {isMenuOpen ? (
                <X size={20} className="text-white" />
              ) : (
                <Menu size={20} className="text-white/60" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Premium Control Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -30, y: 20 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-8 left-8 pointer-events-auto"
          >
            <div className="backdrop-blur-xl bg-white/8 border border-white/15 rounded-3xl p-6 space-y-6 shadow-2xl shadow-black/30 min-w-72">
              {/* Visualization Layers with elegant switches */}
              <div>
                <h3 className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-4">Visualization Layers</h3>
                <div className="space-y-3">
                  {Object.entries(layerLabels).map(([layer, label], idx) => (
                    <motion.div
                      key={layer}
                      custom={idx}
                      variants={layerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <label className="flex items-center gap-3 flex-1 cursor-pointer">
                        <div className="relative w-10 h-6 rounded-full bg-white/10 transition-all duration-300"
                          style={{
                            backgroundColor: visibleLayers.has(layer) ? `${layerColors[layer as keyof typeof layerColors]}20` : 'rgba(255,255,255,0.1)',
                            borderColor: visibleLayers.has(layer) ? layerColors[layer as keyof typeof layerColors] : 'transparent',
                            borderWidth: '1px',
                          }}>
                          <motion.div
                            initial={false}
                            animate={{
                              x: visibleLayers.has(layer) ? 18 : 2,
                            }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-lg shadow-black/40"
                          />
                        </div>
                        <input
                          type="checkbox"
                          checked={visibleLayers.has(layer)}
                          onChange={() => toggleLayerVisibility(layer)}
                          className="hidden"
                        />
                        <span className="text-sm text-white/80 group-hover:text-white transition-colors">{label}</span>
                      </label>
                      <motion.div
                        animate={{ opacity: visibleLayers.has(layer) ? 1 : 0.4 }}
                        className="w-2 h-2 rounded-full transition-all"
                        style={{ backgroundColor: layerColors[layer as keyof typeof layerColors] }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Playback Control */}
              <div className="border-t border-white/10 pt-4">
                <motion.button
                  onClick={togglePause}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-400/30 text-blue-200 hover:border-blue-400/60 transition-all duration-300 text-sm font-medium"
                >
                  {isPaused ? '▶ Resume' : '⏸ Pause'} Animation
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: 30 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 30, x: 30 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-8 right-8 pointer-events-auto"
          >
            <div className="backdrop-blur-xl bg-white/8 border border-white/15 rounded-2xl p-5 shadow-2xl shadow-black/30 max-w-xs">
              <h3 className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-3">How to Explore</h3>
              <ul className="text-xs text-white/60 space-y-2.5">
                <li className="flex gap-3">
                  <span className="text-blue-300 font-semibold min-w-fit">Drag</span>
                  <span>Rotate the globe smoothly</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-300 font-semibold min-w-fit">Scroll</span>
                  <span>Zoom in and out</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-300 font-semibold min-w-fit">Double-click</span>
                  <span>Focus on a location</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Status Bar - Minimal and elegant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto"
      >
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-6 py-2 text-xs text-white/40 font-light tracking-wider">
          Earth • Observation in Progress
        </div>
      </motion.div>
    </div>
  );
}
