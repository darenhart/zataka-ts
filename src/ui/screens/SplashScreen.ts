/**
 * Splash Screen
 *
 * Displays the game splash/intro screen with auto-dismiss timeout.
 *
 * Migrated from SplashScreen function in Game.js with improvements:
 * - Class-based with proper encapsulation
 * - Dependency injection for input manager
 * - Configurable timeout
 * - Callback pattern for dismiss action
 * - Type-safe configuration
 */

import type {
  SplashScreenConfig,
  ISplashScreen,
} from '../../types/game.types';
import type { IInputManager } from '../../types/input.types';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<SplashScreenConfig> = {
  timeout: 100,
};

/**
 * SplashScreen class
 *
 * Shows splash image with timeout and input handling.
 */
export class SplashScreen implements ISplashScreen {
  // Public readonly properties
  public get active(): boolean {
    return this.#active;
  }

  // Private state
  #context: CanvasRenderingContext2D;
  #inputManager: IInputManager;
  #config: Required<SplashScreenConfig>;
  #active: boolean = false;
  #counter: number = 0;

  /**
   * Create a new splash screen
   *
   * @param context - Canvas 2D rendering context
   * @param inputManager - Input manager for keyboard/mouse state
   * @param config - Optional configuration (uses defaults if not provided)
   */
  constructor(
    context: CanvasRenderingContext2D,
    inputManager: IInputManager,
    config?: SplashScreenConfig
  ) {
    this.#context = context;
    this.#inputManager = inputManager;
    this.#config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Show the splash screen
   *
   * Displays the splash image centered on screen.
   *
   * @param image - Splash screen image
   * @param gameWidth - Current game width
   * @param gameHeight - Current game height
   */
  public show(
    image: HTMLImageElement,
    gameWidth: number,
    gameHeight: number
  ): void {
    this.#active = true;
    this.#counter = 0;

    // Center image
    const x = gameWidth / 2 - image.width / 2;
    const y = gameHeight / 2 - image.height / 2;

    this.#context.drawImage(image, x, y);
  }

  /**
   * Listen for user input to dismiss
   *
   * Called each frame while splash is active.
   * Dismisses on mouse1, space, or timeout.
   *
   * @param onDismiss - Callback when user dismisses or timeout expires
   */
  public listen(onDismiss: () => void): void {
    if (!this.#active) {
      return;
    }

    this.#counter++;

    // Check for dismiss input or timeout
    if (
      this.#inputManager.isKeyPressed('mouse1') ||
      this.#inputManager.isKeyPressed('space') ||
      this.#counter > this.#config.timeout
    ) {
      onDismiss();
    }
  }

  /**
   * Clear and hide the splash screen
   *
   * @param gameWidth - Current game width
   * @param gameHeight - Current game height
   */
  public clear(gameWidth: number, gameHeight: number): void {
    this.#active = false;
    this.#counter = 0;
    this.#context.clearRect(0, 0, gameWidth, gameHeight);
  }
}

/**
 * Create a new splash screen
 *
 * Factory function for convenient instantiation.
 *
 * @param context - Canvas 2D rendering context
 * @param inputManager - Input manager
 * @param config - Optional configuration
 * @returns New SplashScreen instance
 */
export function createSplashScreen(
  context: CanvasRenderingContext2D,
  inputManager: IInputManager,
  config?: SplashScreenConfig
): ISplashScreen {
  return new SplashScreen(context, inputManager, config);
}
