import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { Character } from './character.js';
import { setupCamera } from './camera.js';
import { Environment } from './environment.js';

// Initialize the scene
const scene = new THREE.Scene();
const container = document.getElementById('container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x111122);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Initialize physics
let world, character, camera, environment;

// Load shaders
const loadShaders = async () => {
  try {
    const vertexShaderResponse = await fetch('/src/shaders/vertex.glsl');
    const fragmentShaderResponse = await fetch('/src/shaders/fragment.glsl');
    
    const vertexShader = await vertexShaderResponse.text();
    const fragmentShader = await fragmentShaderResponse.text();
    
    return { vertexShader, fragmentShader };
  } catch (error) {
    console.error('Error loading shaders:', error);
    // Provide fallback shaders if loading fails
    return {
      vertexShader: 'void main() { gl_Position = vec4(position, 1.0); }',
      fragmentShader: 'void main() { gl_FragColor = vec4(0.0, 0.3, 0.5, 1.0); }'
    };
  }
};

// Create water
const createWater = (vertexShader, fragmentShader) => {
  const geometry = new THREE.PlaneGeometry(100, 100, 100, 100);
  
  // Create shader material
  const material = new THREE.ShaderMaterial({
    uniforms: {
      iGlobalTime: { value: 0.0 },
      iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    opacity: 0.8
  });
  
  const water = new THREE.Mesh(geometry, material);
  water.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  water.position.y = 0;
  water.name = 'water';
  water.receiveShadow = true;
  scene.add(water);
  
  return { water, material };
};

// Initialize the application
const init = async () => {
  // Show loading message
  const loadingElement = document.createElement('div');
  loadingElement.style.position = 'fixed';
  loadingElement.style.top = '50%';
  loadingElement.style.left = '50%';
  loadingElement.style.transform = 'translate(-50%, -50%)';
  loadingElement.style.color = 'white';
  loadingElement.style.fontSize = '24px';
  loadingElement.style.fontFamily = 'Arial, sans-serif';
  loadingElement.textContent = 'Loading...';
  document.body.appendChild(loadingElement);
  
  try {
    // Initialize Rapier physics
    await RAPIER.init();
    
    // Create physics world
    world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });
    
    // Load shaders
    const { vertexShader, fragmentShader } = await loadShaders();
    
    // Create water
    const { water, material } = createWater(vertexShader, fragmentShader);
    
    // Setup camera
    camera = setupCamera(scene);
    
    // Create environment
    environment = new Environment(scene, world);
    
    // Create character
    character = new Character(scene, world, camera);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    
    scene.add(directionalLight);
    
    // Add a hemisphere light for better ambient lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x228B22, 0.6);
    scene.add(hemisphereLight);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
    });
    
    // Remove loading message
    document.body.removeChild(loadingElement);
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.style.position = 'fixed';
    instructions.style.bottom = '20px';
    instructions.style.left = '20px';
    instructions.style.color = 'white';
    instructions.style.fontSize = '16px';
    instructions.style.fontFamily = 'Arial, sans-serif';
    instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    instructions.style.padding = '10px';
    instructions.style.borderRadius = '5px';
    instructions.innerHTML = `
      <strong>Controls:</strong><br>
      WASD - Move<br>
      Space - Jump / Swim Up<br>
      Right Mouse - Rotate Camera<br>
      Mouse Wheel - Zoom
    `;
    document.body.appendChild(instructions);
    
    // Start animation loop
    animate();
  } catch (error) {
    console.error('Error initializing application:', error);
    loadingElement.textContent = 'Error loading application. Please refresh the page.';
  }
};

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);
  
  // Step the physics world
  world.step();
  
  // Update character
  if (character) {
    character.update();
    
    // Update camera to follow character
    if (scene.updateCamera && character.getPosition) {
      scene.updateCamera(character.getPosition());
    }
  }
  
  // Update water shader time
  const waterMaterial = scene.getObjectByName('water')?.material;
  if (waterMaterial && waterMaterial.uniforms) {
    waterMaterial.uniforms.iGlobalTime.value += 0.01;
  }
  
  // Render the scene
  renderer.render(scene, camera);
};

// Initialize the application
init().catch(console.error); 