# Character Models Directory

Place your character PLY file here with the name `character.ply`.

## Expected File

- `character.ply`: The capybara character model in PLY format

## Usage

This file will be loaded by the `Character` class in `src/js/character.js`. The model should be a capybara or similar animal that will be used as the player character in the water simulation.

## Model Requirements

- Format: PLY (Polygon File Format)
- Scale: The model will be scaled to approximately 0.1 units in the game
- Orientation: The model should be oriented with the front facing the positive Z-axis
- Complexity: Keep the polygon count reasonable for web performance (under 10,000 polygons recommended)

If your model has a different orientation or scale, you may need to adjust the settings in the `loadCharacter` method in `src/js/character.js`. 