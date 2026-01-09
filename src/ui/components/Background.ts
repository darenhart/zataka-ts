/**
 * Background Component
 *
 * Renders the game boundary/play area border.
 *
 * Migrated from Background function in Game.js with improvements:
 * - Class-based with proper encapsulation
 * - Configurable border styling
 * - No global game object dependency
 * - Type-safe configuration
 */

import type { BackgroundConfig, IBackground } from '../../types/game.types';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<BackgroundConfig> = {
  borderWidth: 10,
  borderColor: '#CCCC55',
};

/**
 * Background class
 *
 * Draws a rectangular border around the game play area.
 */
export class Background implements IBackground {
  // Private fields
  #context: CanvasRenderingContext2D;
  #config: Required<BackgroundConfig>;

  /**
   * Create a new background renderer
   *
   * @param context - Canvas 2D rendering context
   * @param config - Optional configuration (uses defaults if not provided)
   */
  constructor(context: CanvasRenderingContext2D, config?: BackgroundConfig) {
    this.#context = context;
    this.#config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Draw the game boundary
   *
   * Renders a rectangular border around the play area.
   *
   * @param gameWidth - Total game width
   * @param gameHeight - Total game height
   * @param scoreWidth - Width of scoreboard (excluded from play area)
   */
  public draw(gameWidth: number, gameHeight: number, scoreWidth: number): void {
    this.#context.save();

    this.#context.beginPath();
    this.#context.rect(0, 0, gameWidth - scoreWidth, gameHeight);
    this.#context.lineWidth = this.#config.borderWidth;
    this.#context.strokeStyle = this.#config.borderColor;
    this.#context.stroke();

    this.#context.restore();
  }

  /**
   * Clear the background canvas
   *
   * @param gameWidth - Total game width
   * @param gameHeight - Total game height
   */
  public clear(gameWidth: number, gameHeight: number): void {
    this.#context.clearRect(0, 0, gameWidth, gameHeight);
  }
}

/**
 * Create a new background renderer
 *
 * Factory function for convenient instantiation.
 *
 * @param context - Canvas 2D rendering context
 * @param config - Optional configuration
 * @returns New Background instance
 */
export function createBackground(
  context: CanvasRenderingContext2D,
  config?: BackgroundConfig
): IBackground {
  return new Background(context, config);
}
