uniform float iGlobalTime;
varying vec2 vUv;

void main() {
  // Simple blue water color with wave effect
  float wave = sin(vUv.x * 10.0 + iGlobalTime) * 0.05 + 
              sin(vUv.y * 8.0 + iGlobalTime * 0.8) * 0.05;
  vec3 waterColor = vec3(0.0, 0.3 + wave, 0.5 + wave);
  gl_FragColor = vec4(waterColor, 0.8);
} 