// AuroraShaderMaterial.js
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

const BackgroundShaderMaterial = shaderMaterial(
  // Uniforms – now with uAnimationSpeed
  {
    uTime: 0,
    uResolution: new THREE.Vector2(1, 1),
    uNoiseScale: new THREE.Vector2(3.0, 3.0),
    uNoiseSpeed: new THREE.Vector2(0.1, 0.1),
    uAnimationSpeed: 0.3, // controls the overall animation speed
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    precision mediump float;

    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uNoiseScale;
    uniform vec2 uNoiseSpeed;
    uniform float uAnimationSpeed;

    // A simple 2D random function
    float random(in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // 2D noise function
    float noise(in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(a, b, u.x) +
             (c - a) * u.y * (1.0 - u.x) +
             (d - b) * u.x * u.y;
    }

    void main() {
      // Normalize UV coordinates according to resolution
      vec2 st = vUv * uResolution / min(uResolution.x, uResolution.y);
      
      // Apply a slow rotation for subtle dynamics
      float angle = uTime * 0.2 * uAnimationSpeed;
      float cosA = cos(angle);
      float sinA = sin(angle);
      mat2 rotation = mat2(cosA, -sinA, sinA, cosA);
      vec2 rotatedSt = rotation * st;
      
      // Create a noise input using the new uniforms
      vec2 noiseInput = rotatedSt * uNoiseScale + uTime * uNoiseSpeed * uAnimationSpeed;
      float n = noise(noiseInput);

      // Instead of moving the pattern offscreen, animate the band factor in place
      float band = sin(rotatedSt.y * 10.0 + n * 5.0 + uTime * 1.5 * uAnimationSpeed);
      band = smoothstep(0.0, 0.2, band);

      // Define aurora colors
      vec3 color1 = vec3(0.0, 0.0, 0.2); // Deep purple
      vec3 color2 = vec3(0.0, 0.8, 0.6); // Bright teal
      vec3 color3 = vec3(0.0, 0.2, 0.5); // Soft blue
      
      // Mix the colors dynamically
      vec3 mixA = mix(color1, color2, band);
      vec3 finalColor = mix(mixA, color3, n * 0.5 + 0.5);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
)

export default BackgroundShaderMaterial
