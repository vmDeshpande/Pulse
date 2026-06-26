import * as THREE from 'three';

/**
 * Creates a tangent-plane aligned group for Earth-surface geometry
 * Ensures ripples, rings, and other effects stay on the surface properly
 * aligned with the spherical coordinates using proper surface normals
 */
export function createSurfaceAlignedGroup(
  latitude: number,
  longitude: number,
  surfaceRadius: number = 1.0
): THREE.Group {
  const group = new THREE.Group();

  // Convert lat/lon to world position
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);

  const x = surfaceRadius * Math.cos(lat) * Math.cos(lon);
  const y = surfaceRadius * Math.sin(lat);
  const z = surfaceRadius * Math.cos(lat) * Math.sin(lon);

  group.position.set(x, y, z);

  // Create tangent basis - used for rotating geometry to align with surface
  const normal = new THREE.Vector3(x, y, z).normalize();

  // Create up vector (latitude direction) - perpendicular to both normal and forward
  const up = new THREE.Vector3(0, 1, 0);
  const forward = new THREE.Vector3();

  // If we're at poles, use a different forward direction
  if (Math.abs(latitude) > 89) {
    forward.set(1, 0, 0);
  } else {
    forward.crossVectors(up, normal).normalize();
  }

  // Recompute up to ensure orthogonality
  up.crossVectors(normal, forward).normalize();

  // Create rotation matrix from tangent basis
  const basis = new THREE.Matrix4();
  basis.makeBasis(forward, up, normal);

  // Apply rotation to group (child geometry will align with Earth surface)
  group.setRotationFromMatrix(basis);

  return group;
}

/**
 * Flattens geometry to lie on a tangent plane
 * Used for ripples, rings, and other 2D effects
 */
export function flattenGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  // Geometry is already created in local XY plane, so no modification needed
  // The group's rotation handles alignment
  return geometry;
}

/**
 * Gets the surface normal at a lat/lon point
 */
export function getSurfaceNormal(latitude: number, longitude: number): THREE.Vector3 {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);

  const x = Math.cos(lat) * Math.cos(lon);
  const y = Math.sin(lat);
  const z = Math.cos(lat) * Math.sin(lon);

  return new THREE.Vector3(x, y, z).normalize();
}

/**
 * Gets tangent vectors for a point on the sphere
 * Returns [eastVector, northVector] for local coordinate system
 */
export function getTangentBasis(
  latitude: number,
  longitude: number
): { east: THREE.Vector3; north: THREE.Vector3; up: THREE.Vector3 } {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);

  // Surface normal
  const up = new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon));

  // East vector (tangent to meridian)
  const east = new THREE.Vector3(-Math.sin(lon), 0, Math.cos(lon));

  // North vector (perpendicular to both)
  const north = new THREE.Vector3();
  north.crossVectors(up, east).normalize();

  return { east, north, up };
}
