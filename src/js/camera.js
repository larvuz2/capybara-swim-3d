import * as THREE from 'three';

// Camera settings
const CAMERA_DISTANCE = 6; // Increased for better view
const CAMERA_HEIGHT = 2.5; // Increased for better view
const CAMERA_LERP_FACTOR = 0.05; // Reduced for smoother following
const CAMERA_ROTATION_SPEED = 0.008; // Reduced for smoother rotation

export function setupCamera(scene) {
  // Create a perspective camera
  const camera = new THREE.PerspectiveCamera(
    70, // Field of view
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
  
  // Camera state
  const cameraState = {
    rotationY: 0,
    targetRotationY: 0,
    rotationLerp: 0.1,
    zoomLevel: 1.0,
    minZoom: 0.6,
    maxZoom: 1.5
  };
  
  // Update camera position to follow target
  scene.updateCamera = (targetPosition) => {
    if (!targetPosition) return;
    
    // Calculate desired camera position
    cameraTarget.copy(targetPosition);
    
    // Smoothly interpolate camera rotation
    cameraState.rotationY = THREE.MathUtils.lerp(
      cameraState.rotationY,
      cameraState.targetRotationY,
      cameraState.rotationLerp
    );
    
    // Apply zoom level to camera distance
    const zoomedDistance = CAMERA_DISTANCE * cameraState.zoomLevel;
    
    // Calculate camera position based on target and rotation
    const cameraX = cameraTarget.x - zoomedDistance * Math.sin(cameraState.rotationY);
    const cameraY = cameraTarget.y + CAMERA_HEIGHT;
    const cameraZ = cameraTarget.z - zoomedDistance * Math.cos(cameraState.rotationY);
    
    // Smooth camera movement using lerp
    camera.position.lerp(
      new THREE.Vector3(cameraX, cameraY, cameraZ),
      CAMERA_LERP_FACTOR
    );
    
    // Look at the target with slight height offset for better view
    camera.lookAt(new THREE.Vector3(cameraTarget.x, cameraTarget.y + 0.5, cameraTarget.z));
  };
  
  // Add mouse controls for camera rotation
  let isMouseDown = false;
  let previousMousePosition = { x: 0, y: 0 };
  
  document.addEventListener('mousedown', (event) => {
    // Only handle right mouse button for camera rotation
    if (event.button === 2) {
      isMouseDown = true;
      previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
      
      // Prevent context menu
      event.preventDefault();
    }
  });
  
  // Prevent context menu on right-click
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
  
  document.addEventListener('mouseup', (event) => {
    if (event.button === 2) {
      isMouseDown = false;
    }
  });
  
  document.addEventListener('mousemove', (event) => {
    if (!isMouseDown) return;
    
    // Calculate mouse movement
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y
    };
    
    // Update target rotation based on mouse movement
    if (deltaMove.x !== 0) {
      cameraState.targetRotationY -= deltaMove.x * CAMERA_ROTATION_SPEED;
    }
    
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  });
  
  // Add mouse wheel for zoom
  document.addEventListener('wheel', (event) => {
    // Adjust zoom level based on wheel direction
    const zoomDelta = event.deltaY * 0.001;
    cameraState.zoomLevel = THREE.MathUtils.clamp(
      cameraState.zoomLevel + zoomDelta,
      cameraState.minZoom,
      cameraState.maxZoom
    );
  });
  
  return camera;
} 