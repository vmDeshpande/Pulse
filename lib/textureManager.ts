import * as THREE from 'three';

export interface TextureSet {
  day: THREE.Texture;
  night: THREE.Texture;
  normal: THREE.Texture;
  specular: THREE.Texture;
  clouds: THREE.Texture;
}

class TextureManager {
  private loader = new THREE.TextureLoader();
  private cache = new Map<string, THREE.Texture>();

  private load(path: string) {
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    const texture = this.loader.load(path);

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    this.cache.set(path, texture);

    return texture;
  }

  getTextureSet(): TextureSet {
    return {
      day: this.load('/textures/earth/day.jpg'),
      night: this.load('/textures/earth/night.jpg'),
      normal: this.load('/textures/earth/normal.png'),
      specular: this.load('/textures/earth/specular.png'),
      clouds: this.load('/textures/earth/clouds.jpg'),
    };
  }

  dispose() {
    this.cache.forEach(texture => texture.dispose());
    this.cache.clear();
  }
}

export const textureManager = new TextureManager();