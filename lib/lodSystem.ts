// Level of Detail (LOD) system for adaptive visualization
// Controls what gets rendered based on camera distance to Earth center

export enum LODLevel {
  PLANET = 0,      // Far out - ~3-5 units
  CONTINENT = 1,   // Medium - ~2-3 units
  COUNTRY = 2,     // Close - ~1-2 units
  CITY = 3,        // Very close - <1 unit
}

export interface LODConfig {
  level: LODLevel;
  maxDistance: number;
  flightVisibility: number;    // 0-1: percentage of flights to show
  earthquakeThreshold: number; // magnitude threshold
  wildfireVisibility: number;  // 0-1: percentage of fires to show
  issVisible: boolean;
  markerScale: number;         // scale multiplier for markers
}

const LODConfigs: Record<LODLevel, LODConfig> = {
  [LODLevel.PLANET]: {
    level: LODLevel.PLANET,
    maxDistance: 5,
    flightVisibility: 0.1,        // Only 10% of flights (major routes)
    earthquakeThreshold: 5.5,     // Only major earthquakes
    wildfireVisibility: 0.2,      // Only 20% of fires (largest)
    issVisible: true,
    markerScale: 0.3,             // 30% of normal size
  },
  [LODLevel.CONTINENT]: {
    level: LODLevel.CONTINENT,
    maxDistance: 3,
    flightVisibility: 0.3,        // 30% of flights
    earthquakeThreshold: 4.5,     // Moderate earthquakes
    wildfireVisibility: 0.4,      // 40% of fires
    issVisible: true,
    markerScale: 0.5,             // 50% of normal size
  },
  [LODLevel.COUNTRY]: {
    level: LODLevel.COUNTRY,
    maxDistance: 1.5,
    flightVisibility: 0.6,        // 60% of flights
    earthquakeThreshold: 3.5,     // Most earthquakes
    wildfireVisibility: 0.7,      // 70% of fires
    issVisible: true,
    markerScale: 0.8,             // 80% of normal size
  },
  [LODLevel.CITY]: {
    level: LODLevel.CITY,
    maxDistance: 0,
    flightVisibility: 1.0,        // All flights
    earthquakeThreshold: 0,       // All earthquakes
    wildfireVisibility: 1.0,      // All fires
    issVisible: true,
    markerScale: 1.0,             // Full size
  },
};

/**
 * Determines LOD level based on camera distance to Earth center
 */
export function getLODLevel(cameraDistance: number): LODLevel {
  if (cameraDistance > 3) return LODLevel.PLANET;
  if (cameraDistance > 1.5) return LODLevel.CONTINENT;
  if (cameraDistance > 0.8) return LODLevel.COUNTRY;
  return LODLevel.CITY;
}

/**
 * Gets LOD configuration for a given distance
 */
export function getLODConfig(cameraDistance: number): LODConfig {
  const level = getLODLevel(cameraDistance);
  return LODConfigs[level];
}

/**
 * Determines if an entity should be visible based on LOD and hash
 */
export function shouldRender(
  entityId: string,
  maxVisibility: number
): boolean {
  if (maxVisibility >= 1) return true;
  if (maxVisibility <= 0) return false;

  // Use entity ID hash for consistent culling
  const hash = entityId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 100) / 100 <= maxVisibility;
}

/**
 * Determines if an earthquake should be visible based on magnitude and LOD
 */
export function shouldShowEarthquake(
  magnitude: number,
  threshold: number
): boolean {
  return magnitude >= threshold;
}
