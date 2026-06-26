'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSceneStore } from '@/store/useSceneStore';

interface EventCardProps {
  id: string;
  type: 'flight' | 'earthquake' | 'wildfire' | 'iss';
  data: Record<string, any>;
  onClose: () => void;
}

const typeColors = {
  flight: 'from-blue-500/20 to-blue-600/20',
  earthquake: 'from-red-500/20 to-red-600/20',
  wildfire: 'from-orange-500/20 to-orange-600/20',
  iss: 'from-purple-500/20 to-purple-600/20',
};

const typeTitles = {
  flight: 'Flight',
  earthquake: 'Earthquake',
  wildfire: 'Active Wildfire',
  iss: 'International Space Station',
};

export function EventCard({ id, type, data, onClose }: EventCardProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-8 right-8 z-40 pointer-events-auto max-w-sm"
      >
        <div className={`backdrop-blur-xl bg-gradient-to-br ${typeColors[type]} border border-white/15 rounded-2xl p-6 shadow-2xl shadow-black/30`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-light text-white tracking-wide">{typeTitles[type]}</h3>
              {data.callsign && <p className="text-sm text-blue-300">{data.callsign}</p>}
              {data.region && <p className="text-sm text-white/60">{data.region}</p>}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} className="text-white/60" />
            </motion.button>
          </div>

          <div className="space-y-3 text-sm">
            {/* Flight specific */}
            {type === 'flight' && (
              <>
                <div className="flex justify-between">
                  <span className="text-white/60">Airline:</span>
                  <span className="text-white">{data.airline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Aircraft:</span>
                  <span className="text-white">{data.aircraft}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Route:</span>
                  <span className="text-white">{data.origin} → {data.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Speed:</span>
                  <span className="text-white">{Math.round(data.speed)} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Altitude:</span>
                  <span className="text-white">{Math.round(data.altitude / 1000 * 3.28084)} ft</span>
                </div>
              </>
            )}

            {/* Earthquake specific */}
            {type === 'earthquake' && (
              <>
                <div className="flex justify-between">
                  <span className="text-white/60">Magnitude:</span>
                  <span className="text-white font-semibold">{data.magnitude.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Depth:</span>
                  <span className="text-white">{Math.round(data.depth)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Time:</span>
                  <span className="text-white text-xs">{new Date(data.time).toLocaleTimeString()}</span>
                </div>
              </>
            )}

            {/* Wildfire specific */}
            {type === 'wildfire' && (
              <>
                <div className="flex justify-between">
                  <span className="text-white/60">Confidence:</span>
                  <span className="text-white">{(data.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Area:</span>
                  <span className="text-white">{Math.round(data.area)} km²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Temperature:</span>
                  <span className="text-white">{Math.round(data.temperature)}K</span>
                </div>
              </>
            )}

            {/* ISS specific */}
            {type === 'iss' && (
              <>
                <div className="flex justify-between">
                  <span className="text-white/60">Altitude:</span>
                  <span className="text-white">{data.altitude} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Speed:</span>
                  <span className="text-white">{Math.round(data.speed / 3.6)} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Latitude:</span>
                  <span className="text-white">{data.latitude.toFixed(2)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Longitude:</span>
                  <span className="text-white">{data.longitude.toFixed(2)}°</span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
