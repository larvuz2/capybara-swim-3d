import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import * as RAPIER from '@dimforge/rapier3d-compat';

export class Character {
  constructor(scene, world, camera) {
    this.scene = scene;
    this.world = world;
    this.camera = camera;
    this.mesh = null;
    this.rigidBody = null;
    this.moveDirection = new THREE.Vector3();
    this.tempVector = new THREE.Vector3();
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    };
    
    // Character settings
    this.moveSpeed = 8; // Increased for better responsiveness
    this.swimSpeed = 5; // Slower in water
    this.jumpForce = 12; // Increased for better jump height
    this.isOnGround = false;
    this.isInWater = false;
    this.waterLevel = 0; // Water is at y=0
    this.swimAnimationTime = 0;
    
    // Initialize
    this.loadCharacter();
    this.setupControls();
  }
  
  loadCharacter() {
    // Create a temporary mesh while loading the character model
    const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color for capybara
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 2, 0);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);
    
    // Create physics body for character
    this.createPhysicsBody();
    
    // Load the actual character model
    const loader = new PLYLoader();
    loader.load(
      '/src/assets/models/character/character.ply',
      (geometry) => {
        geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({ 
          color: 0x8B4513,
          roughness: 0.8,
          metalness: 0.2
        });
        const characterMesh = new THREE.Mesh(geometry, material);
        
        // Scale and position the model
        characterMesh.scale.set(0.1, 0.1, 0.1);
        characterMesh.rotation.set(-Math.PI / 2, 0, 0); // Adjust based on model orientation
        
        // Replace the temporary mesh
        this.scene.remove(this.mesh);
        this.mesh = characterMesh;
        this.scene.add(this.mesh);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('An error happened while loading the character model', error);
        // Keep using the capsule if loading fails
      }
    );
  }
  
  createPhysicsBody() {
    // Create a dynamic rigid body for the character
    const rigidBodyDesc = this.world.createRigidBodyDesc()
      .setTranslation(0, 2, 0)
      .setLinearDamping(0.7) // Increased damping for smoother movement
      .setAngularDamping(0.8) // Increased angular damping to prevent excessive rotation
      .setBodyType(RAPIER.RigidBodyType.Dynamic);
    
    this.rigidBody = this.world.createRigidBody(rigidBodyDesc);
    
    // Create a collider for the character (capsule shape)
    const colliderDesc = this.world.createColliderDesc()
      .setShape(RAPIER.ShapeType.Capsule, 0.5, 1.0) // radius, half-height
      .setFriction(0.7)
      .setRestitution(0.2);
    
    this.world.createCollider(colliderDesc, this.rigidBody);
  }
  
  setupControls() {
    // Keyboard event listeners
    document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    document.addEventListener('keyup', (event) => this.handleKeyUp(event));
  }
  
  handleKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
        this.keys.forward = true;
        break;
      case 'KeyS':
        this.keys.backward = true;
        break;
      case 'KeyA':
        this.keys.left = true;
        break;
      case 'KeyD':
        this.keys.right = true;
        break;
      case 'Space':
        this.keys.jump = true;
        break;
    }
  }
  
  handleKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
        this.keys.forward = false;
        break;
      case 'KeyS':
        this.keys.backward = false;
        break;
      case 'KeyA':
        this.keys.left = false;
        break;
      case 'KeyD':
        this.keys.right = false;
        break;
      case 'Space':
        this.keys.jump = false;
        break;
    }
  }
  
  update() {
    if (!this.rigidBody) return;
    
    // Get current position and rotation from physics
    const position = this.rigidBody.translation();
    
    // Check if character is in water
    this.isInWater = position.y < this.waterLevel + 0.5;
    
    // Update mesh position to match physics body
    this.mesh.position.set(position.x, position.y, position.z);
    
    // Calculate movement direction based on camera orientation
    this.moveDirection.set(0, 0, 0);
    
    if (this.keys.forward) {
      this.tempVector.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
      this.moveDirection.add(this.tempVector);
    }
    
    if (this.keys.backward) {
      this.tempVector.set(0, 0, 1).applyQuaternion(this.camera.quaternion);
      this.moveDirection.add(this.tempVector);
    }
    
    if (this.keys.left) {
      this.tempVector.set(-1, 0, 0).applyQuaternion(this.camera.quaternion);
      this.moveDirection.add(this.tempVector);
    }
    
    if (this.keys.right) {
      this.tempVector.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
      this.moveDirection.add(this.tempVector);
    }
    
    // Normalize movement direction
    if (this.moveDirection.lengthSq() > 0) {
      this.moveDirection.normalize();
      
      // Apply different movement based on whether in water or on land
      if (this.isInWater) {
        // Swimming movement - can move in all directions including up/down
        const upForce = this.keys.jump ? 2 : 0; // Press space to swim up
        
        this.rigidBody.applyImpulse(
          { 
            x: this.moveDirection.x * this.swimSpeed, 
            y: upForce, 
            z: this.moveDirection.z * this.swimSpeed 
          },
          true
        );
        
        // Add buoyancy when in water
        const buoyancyForce = (this.waterLevel - position.y) * 0.5;
        if (buoyancyForce > 0) {
          this.rigidBody.applyImpulse({ x: 0, y: buoyancyForce, z: 0 }, true);
        }
        
        // Swimming animation
        this.swimAnimationTime += 0.05;
        if (this.mesh && this.moveDirection.lengthSq() > 0) {
          // Simple bobbing motion for swimming
          this.mesh.rotation.x = -Math.PI / 2 + Math.sin(this.swimAnimationTime) * 0.1;
        }
      } else {
        // Land movement
        this.rigidBody.applyImpulse(
          { x: this.moveDirection.x * this.moveSpeed, y: 0, z: this.moveDirection.z * this.moveSpeed },
          true
        );
      }
      
      // Rotate character to face movement direction
      if (this.moveDirection.x !== 0 || this.moveDirection.z !== 0) {
        const angle = Math.atan2(this.moveDirection.x, this.moveDirection.z);
        this.mesh.rotation.y = angle;
      }
    }
    
    // Handle jumping (only when on ground and not in water)
    if (this.keys.jump && this.isOnGround && !this.isInWater) {
      this.rigidBody.applyImpulse({ x: 0, y: this.jumpForce, z: 0 }, true);
      this.isOnGround = false;
    }
    
    // Check if character is on ground
    const raycastOrigin = { x: position.x, y: position.y, z: position.z };
    const raycastDirection = { x: 0, y: -1, z: 0 };
    const ray = this.world.castRay(
      raycastOrigin,
      raycastDirection,
      0.6, // Max distance
      true, // Solid
      0xFFFFFFFF // Collision groups
    );
    
    this.isOnGround = ray !== null;
  }
  
  getPosition() {
    if (this.rigidBody) {
      const position = this.rigidBody.translation();
      return new THREE.Vector3(position.x, position.y, position.z);
    }
    return new THREE.Vector3();
  }
} 