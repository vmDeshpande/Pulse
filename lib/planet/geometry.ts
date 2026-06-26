import * as THREE from "three";

import {
    EARTH_RADIUS,
    CLOUD_RADIUS,
    ATMOSPHERE_RADIUS,
    DEFAULT_SEGMENTS,
    DEFAULT_RINGS
} from "./constants";

export const EarthGeometry =
new THREE.SphereGeometry(
    EARTH_RADIUS,
    DEFAULT_SEGMENTS,
    DEFAULT_RINGS
);

export const CloudGeometry =
new THREE.SphereGeometry(
    CLOUD_RADIUS,
    DEFAULT_SEGMENTS,
    DEFAULT_RINGS
);

export const AtmosphereGeometry =
new THREE.SphereGeometry(
    ATMOSPHERE_RADIUS,
    DEFAULT_SEGMENTS,
    DEFAULT_RINGS
);