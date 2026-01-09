/**
 * End Screen
 *
 * Displays the game over screen with final scores.
 *
 * Migrated from EndScreen function in Game.js with improvements:
 * - Class-based with proper encapsulation
 * - Dependency injection for input manager
 * - Configurable styling
 * - Callback pattern for dismiss action
 * - Type-safe configuration
 */

import type {
  EndScreenConfig,
  IEndScreen,
  PlayerScore,
} from '../../types/game.types';
import type { IInputManager } from '../../types/input.types';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<EndScreenConfig> = {
  waitTime: 100,
  fontSize: 30,
  fontFamily: 'Sans-Serif',
  fontWeight: 'bold',
};

/**
 * EndScreen class
 *
 * Shows end game image and final player scores.
 */
export class EndScreen implements IEndScreen {
  // Public readonly properties
  public get active(): boolean {
    return this.#active;
  }

  // Private state
  #context: CanvasRenderingContext2D;
  #inputManager: IInputManager;
  #config: Required<EndScreenConfig>;
  #active: boolean = false;
  #counter: number = 0;

  /**
   * Create a new end screen
   *
   * @param context - Canvas 2D rendering context
   * @param inputManager - Input manager for keyboard/mouse state
   * @param config - Optional configuration (uses defaults if not provided)
   */
  constructor(
    context: CanvasRenderingContext2D,
    inputManager: IInputManager,
    config?: EndScreenConfig
  ) {
    this.#context = context;
    this.#inputManager = inputManager;
    this.#config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Show the end game screen with final scores
   *
   * Displays end game image and player scores.
   *
   * @param image - End game image
   * @param scores - Player scores to display
   * @param gameWidth - Current game width
   * @param gameHeight - Current game height
   */
  public show(
    image: HTMLImageElement,
    scores: PlayerScore[],
    gameWidth: number,
    gameHeight: number
  ): void {
    this.#active = true;
    this.#counter = 0;

    // Draw end game image
    const imgX = gameWidth / 2 - image.width / 2;
    const imgY = (gameHeight * 5) / 6 - image.height;
    this.#context.drawImage(image, imgX, imgY);

    // Draw player scores
    this.#drawScores(scores, gameWidth, gameHeight);
  }

  /**
   * Listen for user input to return to select screen
   *
   * Called each frame while end screen is active.
   * Requires wait time to expire before accepting input.
   *
   * @param onDismiss - Callback when user presses space
   */
  public listen(onDismiss: () => void): void {
    if (!this.#active) {
      return;
    }

    this.#counter++;

    // Check for space after wait time
    if (
      this.#inputManager.isKeyPressed('space') &&
      this.#counter > this.#config.waitTime
    ) {
      onDismiss();
    }
  }

  /**
   * Clear and hide the end screen
   *
   * @param gameWidth - Current game width
   * @param gameHeight - Current game height
   */
  public clear(gameWidth: number, gameHeight: number): void {
    this.#active = false;
    this.#counter = 0;
    this.#context.clearRect(0, 0, gameWidth, gameHeight);
  }

  /**
   * Draw player scores
   *
   * Renders each player's final score in their color.
   *
   * @param scores - Player scores to display
   * @param gameWidth - Current game width
   * @param gameHeight - Current game height
   */
  #drawScores(
    scores: PlayerScore[],
    gameWidth: number,
    gameHeight: number
  ): void {
    this.#context.save();

    // Set font properties
    this.#context.font = `${this.#config.fontWeight} ${this.#config.fontSize}px ${this.#config.fontFamily}`;
    this.#context.textAlign = 'right';

    // Calculate total players (including those not in game)
    // Use 6 as default for consistent spacing
    const totalPlayers = 6;

    // Draw each player's score
    for (let i = 0; i < scores.length; i++) {
      const player = scores[i];
      if (!player) continue;

      const x = gameWidth / 2;
      const y = ((gameHeight * 4) / 6 / totalPlayers) * i + 80;

      this.#context.fillStyle = player.color;
      this.#context.fillText(player.score.toString(), x, y);
    }

    this.#context.restore();
  }
}

/**
 * Create a new end screen
 *
 * Factory function for convenient instantiation.
 *
 * @param context - Canvas 2D rendering context
 * @param inputManager - Input manager
 * @param config - Optional configuration
 * @returns New EndScreen instance
 */
export function createEndScreen(
  context: CanvasRenderingContext2D,
  inputManager: IInputManager,
  config?: EndScreenConfig
): IEndScreen {
  return new EndScreen(context, inputManager, config);
}
