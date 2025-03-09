# Environment Models Directory

Place your environment GLB file here with the name `environment.glb`.

## Expected File

- `environment.glb`: The island or environment model in GLB format

## Usage

This file will be loaded by the `Environment` class in `src/js/environment.js`. The model should represent an island or landscape that will serve as the environment for the water simulation.

## Model Requirements

- Format: GLB (Binary glTF)
- Scale: The model should be scaled appropriately to fit within the scene
- Position: The model should be centered at the origin (0,0,0)
- Water Level: The water plane is positioned at y=0, so design your island accordingly
- Complexity: Keep the polygon count reasonable for web performance

If your model has a different scale or position, you may need to adjust the settings in the `attemptToLoadModel` method in `src/js/environment.js`.

## Physics Considerations

The environment model will have simplified physics colliders added automatically. For more precise physics interactions, you may need to modify the `addModelPhysics` method in `src/js/environment.js` to create colliders that match your specific model geometry. 