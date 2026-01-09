/**
 * FPS Counter Type Definitions
 *
 * Type definitions for the FPS (frames per second) counter system.
 */

/**
 * Configuration options for FpsCounter
 */
export interface FpsConfig {
  /** Number of frames to wait before updating display (default: 50) */
  updateThrottle?: number;

  /** Horizontal offset from right edge in pixels (default: 35) */
  offsetX?: number;

  /** Vertical offset from bottom edge in pixels (default: 10) */
  offsetY?: number;

  /** Font size in pixels (default: 9) */
  fontSize?: number;

  /** Font family name (default: 'Verdana') */
  fontFamily?: string;

  /** Text color in hex format (default: '#888') */
  color?: string;
}

/**
 * Interface for FPS counter implementations
 */
export interface IFpsCounter {
  /** Current FPS value (read-only) */
  readonly currentFps: number;

  /**
   * Update FPS calculation based on current time
   * Should be called once per frame in the game loop
   */
  update(): void;

  /**
   * Draw the FPS counter to the canvas
   *
   * @param shouldDraw - Whether to draw the FPS counter
   * @param gameWidth - Current game canvas width
   * @param gameHeight - Current game canvas height
   */
  draw(shouldDraw: boolean, gameWidth: number, gameHeight: number): void;

  /**
   * Reset the FPS counter state
   */
  reset(): void;
}
