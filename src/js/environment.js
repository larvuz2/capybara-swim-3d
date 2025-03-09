import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as RAPIER from '@dimforge/rapier3d-compat';

export class Environment {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.objects = [];
    
    // Initialize environment
    this.createBasicEnvironment();
    this.attemptToLoadModel();
  }
  
  createBasicEnvironment() {
    // Create a ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,  // Forest green
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Add ground physics
    this.addGroundPhysics();
    
    // Add some decorative elements
    this.addDecorations();
  }
  
  addGroundPhysics() {
    // Create a static rigid body for the ground
    const groundBodyDesc = this.world.createRigidBodyDesc()
      .setTranslation(0, -0.5, 0)
      .setRotation({ x: -Math.PI / 2, y: 0, z: 0 })
      .setBodyType(RAPIER.RigidBodyType.Static);
    
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    
    // Create a collider for the ground (cuboid shape)
    const groundColliderDesc = this.world.createColliderDesc()
      .setShape(RAPIER.ShapeType.Cuboid, 50, 0.1, 50)  // half-width, half-height, half-depth
      .setFriction(0.7);
    
    this.world.createCollider(groundColliderDesc, groundBody);
  }
  
  addDecorations() {
    // Add some trees (simple cones and cylinders)
    const createTree = (x, z) => {
      // Tree trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, 0.25, z);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      this.scene.add(trunk);
      
      // Tree top
      const topGeometry = new THREE.ConeGeometry(1, 2, 8);
      const topMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.set(x, 1.5, z);
      top.castShadow = true;
      top.receiveShadow = true;
      this.scene.add(top);
      
      // Add physics for the tree
      this.addTreePhysics(x, z);
    };
    
    // Create several trees around the scene
    createTree(-5, -5);
    createTree(5, -7);
    createTree(-7, 3);
    createTree(8, 6);
    createTree(-3, 8);
    
    // Add some rocks (simple spheres)
    const createRock = (x, z, scale) => {
      const rockGeometry = new THREE.SphereGeometry(scale, 8, 6);
      const rockMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x808080,
        roughness: 0.9,
        metalness: 0.1
      });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(x, scale / 2, z);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
      
      // Add physics for the rock
      this.addRockPhysics(x, z, scale);
    };
    
    // Create several rocks around the scene
    createRock(-3, -2, 0.5);
    createRock(4, 3, 0.7);
    createRock(-6, 5, 0.4);
    createRock(7, -4, 0.6);
  }
  
  addTreePhysics(x, z) {
    // Create a static rigid body for the tree
    const treeBodyDesc = this.world.createRigidBodyDesc()
      .setTranslation(x, 0, z)
      .setBodyType(RAPIER.RigidBodyType.Static);
    
    const treeBody = this.world.createRigidBody(treeBodyDesc);
    
    // Create a collider for the tree trunk (cylinder shape)
    const trunkColliderDesc = this.world.createColliderDesc()
      .setShape(RAPIER.ShapeType.Cylinder, 0.75, 0.2)  // half-height, radius
      .setFriction(0.8);
    
    this.world.createCollider(trunkColliderDesc, treeBody);
  }
  
  addRockPhysics(x, z, scale) {
    // Create a static rigid body for the rock
    const rockBodyDesc = this.world.createRigidBodyDesc()
      .setTranslation(x, scale / 2, z)
      .setBodyType(RAPIER.RigidBodyType.Static);
    
    const rockBody = this.world.createRigidBody(rockBodyDesc);
    
    // Create a collider for the rock (ball shape)
    const rockColliderDesc = this.world.createColliderDesc()
      .setShape(RAPIER.ShapeType.Ball, scale)  // radius
      .setFriction(0.6);
    
    this.world.createCollider(rockColliderDesc, rockBody);
  }
  
  attemptToLoadModel() {
    // Try to load the GLTF model if available
    const loader = new GLTFLoader();
    
    loader.load(
      './src/assets/models/environment/environment.glb',
      (gltf) => {
        console.log('Environment model loaded successfully');
        
        // Add the model to the scene
        const model = gltf.scene;
        model.scale.set(1, 1, 1);  // Adjust scale as needed
        model.position.set(0, 0, 0);  // Adjust position as needed
        
        // Apply shadows to all meshes in the model
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        
        this.scene.add(model);
        this.objects.push(model);
        
        // Add physics for the model (simplified)
        this.addModelPhysics(model);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.warn('Failed to load environment model, using basic environment instead', error);
        // We already created a basic environment, so no further action needed
      }
    );
  }
  
  addModelPhysics(model) {
    // This is a simplified approach - in a real application, you would
    // create colliders based on the actual geometry of the model
    
    // Create a static rigid body for the model
    const modelBodyDesc = this.world.createRigidBodyDesc()
      .setTranslation(0, 0, 0)
      .setBodyType(RAPIER.RigidBodyType.Static);
    
    const modelBody = this.world.createRigidBody(modelBodyDesc);
    
    // Create a simple collider for the model (cuboid shape)
    const modelColliderDesc = this.world.createColliderDesc()
      .setShape(RAPIER.ShapeType.Cuboid, 5, 1, 5)  // Simplified bounding box
      .setFriction(0.7);
    
    this.world.createCollider(modelColliderDesc, modelBody);
  }
} 