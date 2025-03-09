import * as THREE from 'three';

// Camera settings
const CAMERA_DISTANCE = 5;
const CAMERA_HEIGHT = 2;
const CAMERA_LERP_FACTOR = 0.1;

export function setupCamera(scene) {
  // Create a perspective camera
  const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
  );
  
  // Set initial camera position
  camera.position.set(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  
  // Target position for smooth following
  const cameraTarget = new THREE.Vector3();
  const cameraOffset = new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
  
  // Update camera position to follow target
  scene.updateCamera = (targetPosition) => {
    if (!targetPosition) return;
    
    // Calculate desired camera position
    cameraTarget.copy(targetPosition);
    
    // Smooth camera movement using lerp
    camera.position.lerp(
      new THREE.Vector3(
        cameraTarget.x - cameraOffset.z * Math.sin(camera.rotation.y),
        cameraTarget.y + cameraOffset.y,
        cameraTarget.z - cameraOffset.z * Math.cos(camera.rotation.y)
      ),
      CAMERA_LERP_FACTOR
    );
    
    // Look at the target
    camera.lookAt(cameraTarget);
  };
  
  // Add mouse controls for camera rotation
  let isMouseDown = false;
  let previousMousePosition = { x: 0, y: 0 };
  
  document.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  });
  
  document.addEventListener('mouseup', () => {
    isMouseDown = false;
  });
  
  document.addEventListener('mousemove', (event) => {
    if (!isMouseDown) return;
    
    // Calculate mouse movement
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y
    };
    
    // Rotate camera based on mouse movement
    if (deltaMove.x !== 0) {
      camera.rotation.y -= deltaMove.x * 0.01;
    }
    
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  });
  
  return camera;
} 