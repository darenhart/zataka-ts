/**
 * Main Entry Point
 *
 * Initializes and starts the Zatacka game.
 *
 * This is the main entry point that:
 * - Loads all game images
 * - Initializes input handling
 * - Creates the game controller
 * - Starts the animation loop
 * - Handles window resize events
 */

import { createImageLoader } from './core/ImageLoader';
import { KeyboardManager } from './core/KeyboardManager';
import { createGame } from './core/Game';
import type { IGame } from './types/game.types';
import type { ImageRepository } from './types/game.types';

/**
 * Game instance (created after images load)
 */
let game: IGame | null = null;

/**
 * Request animation frame polyfill
 *
 * Provides cross-browser compatibility for requestAnimationFrame.
 * Falls back to setTimeout if native implementation is unavailable.
 */
const requestAnimFrame = ((): ((callback: FrameRequestCallback) => number) => {
  return (
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    (window as any).oRequestAnimationFrame ||
    (window as any).msRequestAnimationFrame ||
    function (callback: FrameRequestCallback): number {
      return window.setTimeout(callback, 1000 / 60);
    }
  );
})();

/**
 * Main animation loop
 *
 * Called once per frame via requestAnimationFrame.
 * Delegates to game controller if initialized.
 */
function animate(): void {
  requestAnimFrame(animate);

  if (game) {
    game.animate();
  }
}

/**
 * Handle window resize events
 *
 * Notifies game controller to recalculate canvas sizes.
 */
function handleResize(): void {
  if (game) {
    game.onSizeChange();
  }
}

/**
 * Show/hide cursor helpers
 */
function showCursor(): void {
  document.body.style.cursor = 'initial';
}

function hideCursor(): void {
  document.body.style.cursor = 'none';
}

/**
 * Initialize the game
 *
 * Called after all images have loaded.
 * Sets up input, creates game controller, and starts animation loop.
 *
 * @param images - Loaded image repository
 */
function initializeGame(images: ImageRepository): void {
  // Get game container
  const container = document.getElementById('game');
  if (!container) {
    console.error('Game container not found');
    return;
  }

  // Get optional GitHub link element
  const githubElement = document.getElementById('github') || undefined;

  // Initialize input manager
  const inputManager = KeyboardManager.getInstance();
  inputManager.initialize(container);

  // Create game controller
  game = createGame({
    images,
    inputManager,
    dependencies: {
      container,
      githubElement,
      onShowCursor: showCursor,
      onHideCursor: hideCursor,
    },
  });

  // Initialize game systems
  game.init();

  // Start animation loop
  animate();

  // Set up window resize handler
  window.addEventListener('resize', handleResize);
}

/**
 * Load game images
 *
 * Creates image loader and starts loading all game sprites.
 */
function loadImages(): void {
  const imageLoader = createImageLoader({
    images: {
      splash: 'achtung-small.png',
      end: 'achtung-konec-hry.png',
      red: 'red.png',
      yellow: 'yellow.png',
      orange: 'orange.png',
      green: 'green.png',
      pink: 'pink.png',
      blue: 'blue.png',
    },
    onComplete: () => {
      // All images loaded, initialize game
      initializeGame(imageLoader.images as ImageRepository);
    },
  });
}

/**
 * Start the application
 *
 * Entry point when DOM is ready.
 */
function start(): void {
  loadImages();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  // DOM already loaded
  start();
}
