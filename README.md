# Capybara Swim

A Three.js project featuring a capybara character that can swim in a stylized water environment. The project uses Rapier physics for realistic movement and interactions.

## Features

- Realistic water simulation using custom shaders
- Physics-based character movement with Rapier physics engine
- WASD controls for character movement
- Tracking camera system that follows the character
- 3D environment with loaded GLB assets

## Technologies Used

- Three.js for 3D rendering
- Rapier physics (@dimforge/rapier3d-compat) for physics simulation
- GLTFLoader for loading environment assets
- PLYLoader for loading the character model
- Custom GLSL shaders for water simulation
- Vite for development and building

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/capybara-swim.git
   cd capybara-swim
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Controls

- **W**: Move forward
- **S**: Move backward
- **A**: Move left
- **D**: Move right
- **Space**: Jump
- **Mouse**: Click and drag to rotate the camera

## Building for Production

To build the project for production:

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to a static hosting service like Netlify.

## Project Structure

```
capybara-swim/
├── src/
│   ├── assets/           # GLB and PLY files
│   │   ├── character.ply
│   │   └── environment.glb
│   ├── shaders/          # Shader files
│   │   ├── vertex.glsl
│   │   └── fragment.glsl
│   └── js/               # JavaScript files
│       ├── main.js
│       ├── character.js
│       └── camera.js
├── public/               # Static files
│   └── index.html
├── package.json          # Node.js configuration
└── README.md             # Project documentation
```

## License

ISC 