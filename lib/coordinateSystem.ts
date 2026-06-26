import * as THREE from 'three';

// Constants
const EARTH_RADIUS = 1;
const SURFACE_OFFSET = 0.01; // Slight offset above surface to prevent z-fighting

/**
 * Convert latitude, longitude to 3D position on Earth surface
 * Uses spherical coordinates
 * @param latitude - Degrees (-90 to 90)
 * @param longitude - Degrees (-180 to 180)
 * @param heightOffset - Additional height above surface (default 0)
 */
export function latLonToVector3(
  latitude: number,
  longitude: number,
  heightOffset: number = 0
): THREE.Vector3 {
  // Convert to radians
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);

  // Calculate radius including surface offset and height
  const radius = EARTH_RADIUS + SURFACE_OFFSET + heightOffset;

  // Spherical to Cartesian conversion
  const x = radius * Math.cos(lat) * Math.cos(lon);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.sin(lon);

  return new THREE.Vector3(x, y, z);
}

/**
 * Convert 3D position back to lat/lon (for validation)
 */
export function vector3ToLatLon(position: THREE.Vector3): { latitude: number; longitude: number } {
  const lat = THREE.MathUtils.radToDeg(Math.asin(position.y / EARTH_RADIUS));
  const lon = THREE.MathUtils.radToDeg(Math.atan2(position.z, position.x));

  return { latitude: lat, longitude: lon };
}

/**
 * Check if a point is visible from camera (not occluded by Earth)
 * Uses dot product to determine if point faces away from Earth center
 */
export function isPointVisibleFromCamera(
  pointPosition: THREE.Vector3,
  cameraPosition: THREE.Vector3
): boolean {
  // Vector from Earth center to point
  const toPoint = pointPosition.clone().normalize();

  // Vector from Earth center to camera
  const toCamera = cameraPosition.clone().normalize();

  // If dot product is positive, point faces camera
  return toPoint.dot(toCamera) > 0;
}

/**
 * Check if a point should be rendered based on camera distance
 * Prevents rendering when zoomed out and markers can't be distinguished
 */
export function shouldRenderMarker(
  markerPosition: THREE.Vector3,
  cameraPosition: THREE.Vector3,
  minScreenSize: number = 2 // minimum pixels
): boolean {
  // Distance from camera to marker
  const distance = cameraPosition.distanceTo(markerPosition);

  // Rough heuristic: if marker is very far relative to screen size, don't render
  // This prevents clutter at planet view
  const apparentSize = 0.003 / distance; // 0.003 is typical marker radius

  return apparentSize > minScreenSize / 1000;
}

/**
 * Calculate surface offset for marker (prevents z-fighting)
 * @param heightType - 'surface' | 'low' (100m) | 'medium' (1km) | 'high' (10km)
 */
export function getHeightOffset(heightType: string = 'surface'): number {
  const offsets: { [key: string]: number } = {
    surface: 0.001,
    low: 0.0015,
    medium: 0.002,
    high: 0.003,
  };

  return offsets[heightType] || SURFACE_OFFSET;
}
