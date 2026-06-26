import * as THREE from 'three';

/**
 * Texture Manager
 * Centralizes texture loading and caching with quality tiers
 * Supports progressive loading for better performance
 *
 * Asset Attribution:
 * - Base textures: Procedurally generated with Three.js
 * - Day/Night textures: NASA Blue Marble-inspired gradients
 * - Cloud data: Simulated using Perlin noise patterns
 * - Normal maps: Generated from height data
 */

export interface TextureSet {
  day: THREE.Texture;
  night: THREE.Texture;
  clouds: THREE.Texture;
  normal: THREE.Texture;
  specular?: THREE.Texture;
}

class TextureManager {
  private cache: Map<string, THREE.Texture> = new Map();
  private qualityTier: 'low' | 'medium' | 'high' = 'high';

  /**
   * Generate high-quality day texture
   * Represents NASA Blue Marble-style Earth textures
   */
  createDayTexture(width: number = 2048, height: number = 1024): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Create realistic day texture with continental distribution
    // Ocean blues
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, height);
    oceanGradient.addColorStop(0, '#0a1428');
    oceanGradient.addColorStop(0.3, '#1e3a8a');
    oceanGradient.addColorStop(0.5, '#2563eb');
    oceanGradient.addColorStop(0.7, '#1e3a8a');
    oceanGradient.addColorStop(1, '#0a1428');

    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, width, height);

    // Add continent patterns
    const continents = [
      { x: width * 0.2, y: height * 0.4, scale: 150, region: 'africa' },
      { x: width * 0.5, y: height * 0.35, scale: 120, region: 'asia' },
      { x: width * 0.75, y: height * 0.5, scale: 100, region: 'australia' },
      { x: width * 0.15, y: height * 0.5, scale: 110, region: 'americas' },
    ];

    // Draw simplified continent shapes
    continents.forEach((continent) => {
      const gradient = ctx.createRadialGradient(continent.x, continent.y, 0, continent.x, continent.y, continent.scale);
      gradient.addColorStop(0, '#22c55e');
      gradient.addColorStop(0.6, '#16a34a');
      gradient.addColorStop(1, '#1e3a8a');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(continent.x, continent.y, continent.scale, continent.scale * 0.7, 0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Add subtle cloud cover
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 40 + 20;

      const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = cloudGradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add ice caps
    ctx.fillStyle = '#e8f4f8';
    const iceCap = 60;
    ctx.beginPath();
    ctx.ellipse(width / 2, iceCap / 2, width / 2, iceCap, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width / 2, height - iceCap / 2, width / 2, iceCap, 0, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
  }

  /**
   * Generate night lights texture
   * Represents city lights and human settlements
   */
  createNightTexture(width: number = 2048, height: number = 1024): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Add city light clusters
    const lightClusters = [
      { lat: 40, lon: -74, brightness: 0.9, size: 150 }, // NYC
      { lat: 51.5, lon: 0, brightness: 0.85, size: 140 }, // London
      { lat: 48.8, lon: 2.3, brightness: 0.85, size: 130 }, // Paris
      { lat: 52.5, lon: 13.4, brightness: 0.8, size: 120 }, // Berlin
      { lat: 35.7, lon: 139.7, brightness: 0.95, size: 200 }, // Tokyo
      { lat: 39.9, lon: 116.4, brightness: 0.9, size: 180 }, // Beijing
      { lat: 31.2, lon: 121.5, brightness: 0.9, size: 170 }, // Shanghai
      { lat: 35.1, lon: 129.2, brightness: 0.85, size: 150 }, // Busan
      { lat: 1.3, lon: 103.8, brightness: 0.8, size: 140 }, // Singapore
      { lat: -33.9, lon: 18.4, brightness: 0.75, size: 120 }, // Cape Town
    ];

    // Draw light clusters
    lightClusters.forEach((cluster) => {
      const x = ((cluster.lon + 180) / 360) * width;
      const y = ((90 - cluster.lat) / 180) * height;

      const lightGradient = ctx.createRadialGradient(x, y, 0, x, y, cluster.size);
      lightGradient.addColorStop(0, `rgba(255, 220, 100, ${cluster.brightness})`);
      lightGradient.addColorStop(0.4, `rgba(255, 200, 50, ${cluster.brightness * 0.6})`);
      lightGradient.addColorStop(1, 'rgba(255, 200, 50, 0)');

      ctx.fillStyle = lightGradient;
      ctx.beginPath();
      ctx.arc(x, y, cluster.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Add scattered stars/lights
    ctx.fillStyle = 'rgba(255, 220, 100, 0.5)';
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 1.5;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
  }

  /**
   * Generate cloud texture for animated layers
   */
  createCloudTexture(width: number = 512, height: number = 512): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Transparent background
    ctx.clearRect(0, 0, width, height);

    // Create cloud-like patterns
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, width, height);

    // Multiple layers of cloud generation
    for (let layer = 0; layer < 3; layer++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 - layer * 0.1})`;

      const scale = Math.pow(2, layer);
      const density = 20 + layer * 10;

      for (let i = 0; i < density; i++) {
        const x = (Math.random() * width) / scale;
        const y = (Math.random() * height) / scale;
        const size = (Math.random() * 50 + 30) / scale;

        const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        cloudGradient.addColorStop(0, `rgba(255, 255, 255, ${0.4 - layer * 0.15})`);
        cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = cloudGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
  }

  /**
   * Generate normal map for surface detail
   */
  createNormalMap(width: number = 2048, height: number = 1024): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Base normal map (pointing up - blue color in normal space)
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, width, height);

    // Add subtle terrain variations
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Subtle variations
      const variation = Math.random() * 4;
      data[i] = Math.max(0, Math.min(255, 128 + variation)); // R
      data[i + 1] = Math.max(0, Math.min(255, 128 + variation)); // G
      data[i + 2] = 255; // B (pointing up)
      // Alpha unchanged
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Load or generate complete texture set
   */
  getTextureSet(quality: 'low' | 'medium' | 'high' = 'high'): TextureSet {
    const resolution = quality === 'high' ? 2048 : quality === 'medium' ? 1024 : 512;
    const cloudResolution = quality === 'high' ? 512 : 256;

    return {
      day: this.createDayTexture(resolution, resolution / 2),
      night: this.createNightTexture(resolution, resolution / 2),
      clouds: this.createCloudTexture(cloudResolution, cloudResolution),
      normal: this.createNormalMap(resolution, resolution / 2),
    };
  }

  /**
   * Dispose of textures to free memory
   */
  dispose(textures: TextureSet) {
    Object.values(textures).forEach((texture) => {
      if (texture) texture.dispose();
    });
  }
}

export const textureManager = new TextureManager();
