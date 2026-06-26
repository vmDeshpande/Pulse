import * as THREE from "three";

export interface PlanetTextures {

    day: THREE.Texture;

    night: THREE.Texture;

    normal: THREE.Texture;

    specular: THREE.Texture;

    clouds: THREE.Texture;

}

export interface PlanetMaterialOptions {

    textures: PlanetTextures;

}