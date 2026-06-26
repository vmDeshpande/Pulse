// Mock data generators for visualization layers
import * as THREE from 'three';

// Helper: Convert 3D vector to latitude/longitude
function vectorToLatLon(vec: THREE.Vector3): { latitude: number; longitude: number } {
  const lat = THREE.MathUtils.radToDeg(Math.asin(vec.y));
  const lon = THREE.MathUtils.radToDeg(Math.atan2(vec.z, vec.x));
  return { latitude: lat, longitude: lon };
}

// ============================================================================
// FLIGHTS DATA
// ============================================================================

export interface Flight {
  id: string;
  callsign: string;
  airline: string;
  aircraft: string;
  origin: string;
  destination: string;
  position: [number, number, number];
  targetPosition: [number, number, number];
  heading: number;
  speed: number; // km/h
  altitude: number; // feet
  progress: number; // 0-1
  trailPoints: [number, number, number][];
  latitude?: number;
  longitude?: number;
}

const airlines = [
  { name: 'United', code: 'UAL', color: 0x0033cc },
  { name: 'Delta', code: 'DAL', color: 0xcc0000 },
  { name: 'American', code: 'AAL', color: 0x0099ff },
  { name: 'Southwest', code: 'SWA', color: 0xffcc00 },
  { name: 'Lufthansa', code: 'DLH', color: 0xffcc00 },
  { name: 'British Airways', code: 'BAW', color: 0x003399 },
  { name: 'Air France', code: 'AFR', color: 0x003399 },
  { name: 'KLM', code: 'KLM', color: 0x0066ff },
  { name: 'JAL', code: 'JAL', color: 0xff0000 },
  { name: 'ANA', code: 'ANA', color: 0x0066cc },
];

const aircraft = [
  'Boeing 737',
  'Boeing 777',
  'Boeing 787',
  'Airbus A320',
  'Airbus A350',
  'Airbus A380',
];

const airports = [
  { code: 'JFK', pos: [-0.85, 0.1, 1.2] as [number, number, number] },
  { code: 'LAX', pos: [-1.3, 0.05, 0.8] as [number, number, number] },
  { code: 'LHR', pos: [0.0, 0.15, 1.3] as [number, number, number] },
  { code: 'CDG', pos: [0.05, 0.1, 1.3] as [number, number, number] },
  { code: 'NRT', pos: [1.6, 0.2, 0.9] as [number, number, number] },
  { code: 'HND', pos: [1.65, 0.1, 0.8] as [number, number, number] },
  { code: 'SYD', pos: [2.0, -0.5, 0.6] as [number, number, number] },
  { code: 'DXB', pos: [0.7, 0.0, 1.2] as [number, number, number] },
  { code: 'SIN', pos: [1.1, -0.15, 1.0] as [number, number, number] },
  { code: 'DFW', pos: [-1.0, -0.05, 1.0] as [number, number, number] },
  { code: 'ORD', pos: [-0.95, 0.05, 1.2] as [number, number, number] },
  { code: 'ATL', pos: [-0.88, -0.05, 1.1] as [number, number, number] },
];

export function generateMockFlights(count: number): Flight[] {
  const flights: Flight[] = [];

  for (let i = 0; i < count; i++) {
    const origin = airports[Math.floor(Math.random() * airports.length)];
    let destination = airports[Math.floor(Math.random() * airports.length)];
    while (destination.code === origin.code) {
      destination = airports[Math.floor(Math.random() * airports.length)];
    }

    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const speed = 400 + Math.random() * 200;
    const progress = Math.random();

    // Interpolate position between origin and destination
    const startVec = new THREE.Vector3(...origin.pos);
    const endVec = new THREE.Vector3(...destination.pos);
    const midPoint = startVec.clone().add(endVec).multiplyScalar(0.5).normalize();
    
    const curve = new THREE.CatmullRomCurve3([
      startVec.clone(),
      midPoint.multiplyScalar(1.1),
      endVec.clone(),
    ]);

    const position = curve.getPointAt(progress) as THREE.Vector3;
    const nextPoint = curve.getPointAt(Math.min(progress + 0.01, 1)) as THREE.Vector3;
    const heading = Math.atan2(nextPoint.y - position.y, nextPoint.x - position.x);
    
    // Normalize and convert to lat/lon
    const normalizedPos = position.clone().normalize();
    const { latitude, longitude } = vectorToLatLon(normalizedPos);

    flights.push({
      id: `flight_${i}`,
      callsign: `${airline.code}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      airline: airline.name,
      aircraft: aircraft[Math.floor(Math.random() * aircraft.length)],
      origin: origin.code,
      destination: destination.code,
      position: [position.x, position.y, position.z],
      targetPosition: [nextPoint.x, nextPoint.y, nextPoint.z],
      heading,
      speed,
      altitude: 30000 + Math.random() * 15000,
      progress,
      trailPoints: [],
      latitude,
      longitude,
    });
  }

  return flights;
}

// ============================================================================
// EARTHQUAKES DATA
// ============================================================================

export interface Earthquake {
  id: string;
  position: [number, number, number];
  magnitude: number;
  depth: number;
  region: string;
  time: number;
  age: number;
  maxAge: number;
  latitude?: number;
  longitude?: number;
}

const regions = [
  'Pacific Ring of Fire',
  'Japan Trench',
  'Mariana Trench',
  'Mid-Atlantic Ridge',
  'San Andreas Fault',
  'Alpine Fault',
  'Subduction Zone',
  'Iceland',
  'New Zealand',
  'Indonesia',
];

export function generateMockEarthquakes(count: number): Earthquake[] {
  const earthquakes: Earthquake[] = [];

  for (let i = 0; i < count; i++) {
    // Generate random position on globe
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const pos = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );
    
    const { latitude, longitude } = vectorToLatLon(pos);

    earthquakes.push({
      id: `earthquake_${i}`,
      position: [pos.x, pos.y, pos.z],
      magnitude: 4 + Math.random() * 6,
      depth: 10 + Math.random() * 600,
      region: regions[Math.floor(Math.random() * regions.length)],
      time: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
      age: 0,
      maxAge: 3000, // fade out after 3 seconds
      latitude,
      longitude,
    });
  }

  return earthquakes;
}

// ============================================================================
// WILDFIRES DATA
// ============================================================================

export interface Wildfire {
  id: string;
  position: [number, number, number];
  region: string;
  confidence: number;
  area: number;
  temperature: number;
  age: number;
  maxAge: number;
  intensity: number;
  latitude?: number;
  longitude?: number;
}

const fireRegions = [
  'California',
  'Amazon',
  'Siberia',
  'Australia',
  'Mediterranean',
  'Indonesia',
  'Canada',
  'Sub-Saharan Africa',
];

export function generateMockWildfires(count: number): Wildfire[] {
  const wildfires: Wildfire[] = [];

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const pos = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );
    
    const { latitude, longitude } = vectorToLatLon(pos);

    wildfires.push({
      id: `wildfire_${i}`,
      position: [pos.x, pos.y, pos.z],
      region: fireRegions[Math.floor(Math.random() * fireRegions.length)],
      confidence: 0.7 + Math.random() * 0.3,
      area: 100 + Math.random() * 50000,
      temperature: 400 + Math.random() * 1600,
      age: 0,
      maxAge: 6000,  // fade out after 6 seconds
      intensity: Math.random(),
      latitude,
      longitude,
    });
  }

  return wildfires;
}

// ============================================================================
// ISS DATA
// ============================================================================

export interface ISS {
  id: string;
  position: [number, number, number];
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  orbitProgress: number;
  trailPoints: [number, number, number][];
}

export function generateMockISS(): ISS {
  const orbitProgress = (Date.now() / 1000 / 5400) % 1; // 90 min orbit
  const theta = orbitProgress * Math.PI * 2;
  
  // ISS orbits at ~51.6 degrees inclination
  const inclination = (51.6 * Math.PI) / 180;
  const radius = 1.05; // ~400km altitude
  
  const x = radius * Math.cos(theta);
  const z = radius * Math.sin(theta);
  const y = radius * Math.sin(theta) * Math.sin(inclination);

  const pos = new THREE.Vector3(x, y, z).normalize().multiplyScalar(1.05);

  return {
    id: 'iss',
    position: [pos.x, pos.y, pos.z],
    latitude: (Math.asin(pos.y) * 180) / Math.PI,
    longitude: (Math.atan2(pos.z, pos.x) * 180) / Math.PI,
    altitude: 408,
    speed: 28000,
    orbitProgress,
    trailPoints: [],
  };
}
