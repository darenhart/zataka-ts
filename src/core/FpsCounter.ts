/**
 * FPS Counter
 *
 * Calculates and displays frames per second (FPS) for performance monitoring.
 * Migrated from Fps.js with improvements:
 * - Uses performance.now() for better precision
 * - Dependency injection for canvas context
 * - Configurable display options
 * - Proper TypeScript types
 * - Canvas state preservation
 */

import type { FpsConfig, IFpsCounter } from '../types/fps.types';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<FpsConfig> = {
  updateThrottle: 50,
  offsetX: 35,
  offsetY: 10,
  fontSize: 9,
  fontFamily: 'Verdana',
  color: '#888',
};

/**
 * FPS Counter class
 *
 * Tracks and displays the current frame rate of the game.
 * Updates are throttled to reduce rendering overhead.
 */
export class FpsCounter implements IFpsCounter {
  // Private fields
  #context: CanvasRenderingContext2D;
  #config: Required<FpsConfig>;
  #currentFps: number = 0;
  #lastUpdateTime: number = performance.now();
  #frameCount: number = 0;

  /**
   * Create a new FPS counter
   *
   * @param context - Canvas 2D rendering context for drawing
   * @param config - Optional configuration (uses defaults if not provided)
   */
  constructor(context: CanvasRenderingContext2D, config?: FpsConfig) {
    this.#context = context;
    this.#config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get the current FPS value
   */
  public get currentFps(): number {
    return this.#currentFps;
  }

  /**
   * Update the FPS calculation
   *
   * Should be called once per frame in the game loop.
   * Calculates FPS based on time delta since last update.
   */
  public update(): void {
    const currentTime = performance.now();
    this.#currentFps = this.#calculateFps(currentTime);
    this.#lastUpdateTime = currentTime;
  }

  /**
   * Draw the FPS counter to the canvas
   *
   * Drawing is throttled based on updateThrottle config to reduce overhead.
   * Only draws when shouldDraw is true.
   *
   * @param shouldDraw - Whether the FPS counter should be displayed
   * @param gameWidth - Current game canvas width (for positioning)
   * @param gameHeight - Current game canvas height (for positioning)
   */
  public draw(shouldDraw: boolean, gameWidth: number, gameHeight: number): void {
    if (!shouldDraw) {
      return;
    }

    this.#frameCount++;

    // Throttle drawing to reduce overhead
    if (this.#frameCount > this.#config.updateThrottle) {
      this.#frameCount = 0;
      this.#drawFpsText(gameWidth, gameHeight);
    }
  }

  /**
   * Reset the FPS counter state
   *
   * Useful when restarting the game or changing game states.
   */
  public reset(): void {
    this.#currentFps = 0;
    this.#lastUpdateTime = performance.now();
    this.#frameCount = 0;
  }

  /**
   * Calculate FPS from time delta
   *
   * @param currentTime - Current timestamp from performance.now()
   * @returns Calculated FPS value (bounded to prevent Infinity)
   */
  #calculateFps(currentTime: number): number {
    const deltaMs = currentTime - this.#lastUpdateTime;

    // Prevent division by zero or very small values
    if (deltaMs <= 0) {
      return this.#currentFps; // Return previous value if delta is invalid
    }

    const deltaSeconds = deltaMs / 1000;
    const fps = 1 / deltaSeconds;

    // Bound FPS to reasonable range (0-999)
    return Math.min(Math.round(fps), 999);
  }

  /**
   * Draw the FPS text to the canvas
   *
   * Renders in the bottom-right corner with configurable offset.
   * Preserves canvas state to avoid affecting other rendering.
   *
   * @param gameWidth - Current game canvas width
   * @param gameHeight - Current game canvas height
   */
  #drawFpsText(gameWidth: number, gameHeight: number): void {
    const x = gameWidth - this.#config.offsetX;
    const y = gameHeight - this.#config.offsetY;

    // Clear previous FPS text (before save to avoid being affected by transforms)
    this.#context.clearRect(x - 2, y - 10, 40, 15);

    // Save canvas state to avoid polluting global state
    this.#context.save();

    // Set text rendering properties
    this.#context.textAlign = 'left';
    this.#context.font = `${this.#config.fontSize}px ${this.#config.fontFamily}`;
    this.#context.fillStyle = this.#config.color;

    // Draw FPS text
    this.#context.fillText(`fps:${this.#currentFps}`, x, y);

    // Restore canvas state
    this.#context.restore();
  }
}

/**
 * Create a new FPS counter instance
 *
 * Factory function for convenient instantiation.
 *
 * @param context - Canvas 2D rendering context
 * @param config - Optional configuration
 * @returns New FpsCounter instance
 */
export function createFpsCounter(
  context: CanvasRenderingContext2D,
  config?: FpsConfig
): IFpsCounter {
  return new FpsCounter(context, config);
}
