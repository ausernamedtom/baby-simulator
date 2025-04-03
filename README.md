# 2D Web Game

A simple 2D web game built with HTML5 Canvas and JavaScript.

## How to Run

### Option 1: Direct Browser
1. Clone or download this repository
2. Open `index.html` in your web browser
3. That's it! The game should start automatically

### Option 2: Using Docker
1. Make sure you have Docker and Docker Compose installed
2. Clone or download this repository
3. Open a terminal in the project directory
4. Run `docker-compose up -d`
5. Open your browser and navigate to `http://localhost:8080`

### Option 3: Production Build
1. Install Node.js and npm
2. Run `npm install` to install dependencies
3. Run `npm run build` to create optimized production files
4. Run `npm start` to start the production server

## How to Play

- Use the arrow keys or WASD to move the red square (player) around
- The player cannot move outside the game boundaries
- More features coming soon!

## Features

- Smooth player movement
- Collision detection with game boundaries
- Responsive canvas sizing
- Docker support for easy deployment
- Production-ready build pipeline
- Optimized assets with minification
- Efficient caching and compression

## Technical Details

- Built with vanilla JavaScript
- Uses HTML5 Canvas for rendering
- No external dependencies required
- Containerized with Docker and Nginx
- Automated build pipeline with GitHub Actions
- Multi-stage Docker builds for optimization
- Production-grade Nginx configuration

## Build Pipeline

The project includes a GitHub Actions workflow that:
1. Builds optimized production assets
2. Creates a multi-stage Docker image
3. Implements caching for faster builds
4. Pushes to Docker Hub for deployment

To use the build pipeline:
1. Set up Docker Hub credentials in GitHub Secrets:
   - DOCKERHUB_USERNAME
   - DOCKERHUB_TOKEN
2. Push to the main branch to trigger the build
3. The optimized image will be available at: `your-username/baby-simulator:latest`

## Future Improvements

- Add obstacles and collectibles
- Implement scoring system
- Add sound effects and background music
- Create different levels
- Add more game mechanics 