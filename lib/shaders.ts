// Atmospheric scattering shader for the Earth's atmosphere
export const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = `
  uniform vec3 uSunDirection;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 sunDir = normalize(uSunDirection);
    
    // Fresnel effect - atmosphere is visible at the edges
    float fresnel = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 3.0);
    
    // Rayleigh scattering approximation
    float skyGlow = dot(normal, sunDir) * 0.5 + 0.5;
    
    // Atmosphere color with glow
    vec3 atmosphereColor = mix(
      vec3(0.2, 0.4, 0.8),  // Dark blue on night side
      vec3(0.8, 0.9, 1.0),  // Bright cyan on day side
      skyGlow
    );
    
    float alpha = fresnel * 0.4;
    gl_FragColor = vec4(atmosphereColor, alpha);
  }
`;

// Rim lighting shader for Fresnel effect on globe
export const rimFragmentShader = `
  uniform vec3 uSunDirection;
  uniform sampler2D tMap;
  uniform sampler2D tNight;
  uniform sampler2D tNormal;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(-vPosition);
    vec3 sunDir = normalize(uSunDirection);
    
    // Fresnel rim light
    float rim = pow(1.0 - abs(dot(normal, viewDir)), 2.0);
    vec3 rimColor = vec3(0.4, 0.7, 1.0) * rim * 0.3;
    
    // Day/night blend
    float sunDot = dot(normal, sunDir);
    float dayMix = smoothstep(-0.2, 0.2, sunDot);
    
    vec3 dayColor = texture2D(tMap, vUv).rgb;
    vec3 nightColor = texture2D(tNight, vUv).rgb * 0.4;
    
    vec3 surfaceColor = mix(nightColor, dayColor, dayMix);
    
    gl_FragColor = vec4(surfaceColor + rimColor, 1.0);
  }
`;

// Cloud shader with animation
export const cloudVertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vAltitude;
  
  void main() {
    vUv = uv;
    // Slight altitude variation for depth
    vAltitude = sin(uv.y * 10.0) * 0.01;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * vAltitude, 1.0);
  }
`;

export const cloudFragmentShader = `
  uniform sampler2D tClouds;
  uniform float uTime;
  varying vec2 vUv;
  
  void main() {
    // Scroll clouds slowly
    vec2 uv = vUv + vec2(uTime * 0.02, 0.0);
    
    vec3 clouds = texture2D(tClouds, uv).rgb;
    
    // Fade clouds in and out for animation
    float alpha = clouds.r * 0.6;
    
    gl_FragColor = vec4(clouds, alpha);
  }
`;

// Star field shader
export const starVertexShader = `
  varying vec3 vNormal;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const starFragmentShader = `
  uniform sampler2D tStars;
  varying vec3 vNormal;
  
  void main() {
    vec3 stars = texture2D(tStars, uv).rgb;
    gl_FragColor = vec4(stars, 1.0);
  }
`;

// Simple post-processing shader for tone mapping
export const tonemapFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float uExposure;
  
  varying vec2 vUv;
  
  vec3 tonemap(vec3 color) {
    // Reinhard tone mapping
    color *= uExposure;
    color = color / (vec3(1.0) + color);
    // Gamma correction
    return pow(color, vec3(1.0 / 2.2));
  }
  
  void main() {
    vec3 texColor = texture2D(tDiffuse, vUv).rgb;
    gl_FragColor = vec4(tonemap(texColor), 1.0);
  }
`;
