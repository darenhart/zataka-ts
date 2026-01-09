/**
 * Player Selector Screen
 *
 * Manages the player selection screen where players toggle their readiness
 * for a game round using their control keys.
 *
 * Migrated from SelectPlayers.js with improvements:
 * - Dependency injection for all external dependencies
 * - KeyboardManager integration (replaces global KEY_STATUS)
 * - Callback pattern for game start (replaces game.start() call)
 * - Configurable layout options
 * - Image validation before drawing
 * - Proper TypeScript types
 */

import type {
  PlayerTemplate,
  ImageRepository,
  PlayerSelectorConfig,
  IPlayerSelector,
} from '../../types/player.types';
import type { IInputManager } from '../../types/input.types';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<PlayerSelectorConfig> = {
  keyLabelXRatio: 1 / 5,
  iconOffsetX: 220,
  baseY: 80,
  verticalSpacingRatio: 0.6,
  fontSize: 20,
  fontFamily: 'Courier',
  fontWeight: 'bold',
  instructionYRatio: 7 / 8,
  instructionText: 'Press space to start',
  instructionColor: 'white',
};

/**
 * PlayerSelector class
 *
 * Displays a screen where players can join/leave the next round
 * by pressing their assigned control keys.
 */
export class PlayerSelector implements IPlayerSelector {
  // Private fields
  #context: CanvasRenderingContext2D;
  #inputManager: IInputManager;
  #config: Required<PlayerSelectorConfig>;
  #active: boolean = false;

  /**
   * Create a new player selector screen
   *
   * @param context - Canvas 2D rendering context for drawing
   * @param inputManager - Input manager for keyboard state
   * @param config - Optional configuration (uses defaults if not provided)
   */
  constructor(
    context: CanvasRenderingContext2D,
    inputManager: IInputManager,
    config?: PlayerSelectorConfig
  ) {
    this.#context = context;
    this.#inputManager = inputManager;
    this.#config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get whether the selector screen is currently active
   */
  public get active(): boolean {
    return this.#active;
  }

  /**
   * Show the player selection screen
   *
   * Displays player control keys and instructions.
   *
   * @param playerTemplates - Array of player templates to display
   * @param gameWidth - Current game canvas width
   * @param gameHeight - Current game canvas height
   */
  public show(
    playerTemplates: PlayerTemplate[],
    gameWidth: number,
    gameHeight: number
  ): void {
    this.#active = true;

    // Show player control keys
    this.#showPlayerControls(playerTemplates, gameWidth, gameHeight);

    // Show instructions
    this.#showInstructions(gameWidth, gameHeight);
  }

  /**
   * Listen for player input
   *
   * Monitors keyboard input to toggle player ready states.
   * When space is pressed, starts the game if any player is ready.
   *
   * Note: This method mutates the playerTemplates array by setting
   * the `ready` property on each player.
   *
   * @param playerTemplates - Array of player templates (will be mutated)
   * @param imageRepo - Image repository for player sprites
   * @param gameWidth - Current game canvas width
   * @param gameHeight - Current game canvas height
   * @param onStart - Callback to invoke when game should start
   */
  public listen(
    playerTemplates: PlayerTemplate[],
    imageRepo: ImageRepository,
    gameWidth: number,
    gameHeight: number,
    onStart: () => void
  ): void {
    // Handle player ready state toggles
    this.#handlePlayerInput(playerTemplates, imageRepo, gameWidth, gameHeight);

    // Handle game start input
    this.#handleStartInput(playerTemplates, onStart);
  }

  /**
   * Clear the player selection screen
   *
   * Resets all players to not ready, deactivates the screen,
   * and clears the canvas.
   *
   * @param playerTemplates - Array of player templates (will be mutated)
   * @param gameWidth - Current game canvas width
   * @param gameHeight - Current game canvas height
   */
  public clear(
    playerTemplates: PlayerTemplate[],
    gameWidth: number,
    gameHeight: number
  ): void {
    // Reset all players to not ready
    for (const player of playerTemplates) {
      player.ready = false;
    }

    // Deactivate screen
    this.#active = false;

    // Clear canvas
    this.#context.clearRect(0, 0, gameWidth, gameHeight);
  }

  /**
   * Show player controls
   *
   * Displays the control keys for each player in their color.
   *
   * @param playerTemplates - Array of player templates
   * @param gameWidth - Current game canvas width
   * @param gameHeight - Current game canvas height
   */
  #showPlayerControls(
    playerTemplates: PlayerTemplate[],
    gameWidth: number,
    gameHeight: number
  ): void {
    this.#context.save();

    // Set font properties
    this.#context.font = `${this.#config.fontWeight} ${this.#config.fontSize}px ${this.#config.fontFamily}`;
    this.#context.textAlign = 'left';

    for (let i = 0; i < playerTemplates.length; i++) {
      const player = playerTemplates[i];
      if (!player) continue;

      const position = this.#calculatePlayerPosition(
        i,
        playerTemplates.length,
        gameWidth,
        gameHeight
      );

      // Draw control keys in player color
      this.#context.fillStyle = player.color;
      this.#context.fillText(
        `(${player.left} ${player.right})`,
        position.x,
        position.y
      );
    }

    this.#context.restore();
  }

  /**
   * Show instructions text
   *
   * Displays centered instructions at the bottom of the screen.
   *
   * @param gameWidth - Current game canvas width
   * @param gameHeight - Current game canvas height
   */
  #showInstructions(gameWidth: number, gameHeight: number): void {
    this.#context.save();

    this.#context.fillStyle = this.#config.instructionColor;
    this.#context.textAlign = 'center';
    this.#context.fillText(
      this.#config.instructionText,
      gameWidth / 2,
      gameHeight * this.#config.instructionYRatio
    );

    this.#context.restore();
  }

  /**
   * Handle player input for toggling ready states
   *
   * Monitors each player's left/right keys:
   * - Left key: Set player ready and show icon
   * - Right key: Set player not ready and hide icon
   *
   * @param playerTemplates - Array of player templates (will be mutated)
   * @param imageRepo - Image repository for player sprites
   * @param gameWidth - Current game canvas width
   * @param gameHeight - Current game canvas height
   */
  #handlePlayerInput(
    playerTemplates: PlayerTemplate[],
    imageRepo: ImageRepository,
    gameWidth: number,
    gameHeight: number
  ): void {
    for (let i = 0; i < playerTemplates.length; i++) {
      const player = playerTemplates[i];
      if (!player) continue;

      const position = this.#calculatePlayerPosition(
        i,
        playerTemplates.length,
        gameWidth,
        gameHeight
      );

      // Get player image from repository
      const image = imageRepo[player.name];

      // Validate image exists and is loaded
      if (!image || !this.#isImageValid(image)) {
        continue;
      }

      // Calculate icon position
      const iconX = position.x + this.#config.iconOffsetX;
      const iconY = position.y - image.height;

      // Check left key - set player ready
      if (this.#inputManager.isKeyPressed(player.left)) {
        player.ready = true;
        this.#context.drawImage(image, iconX, iconY);
      }
      // Check right key - set player not ready
      else if (this.#inputManager.isKeyPressed(player.right)) {
        player.ready = false;
        this.#context.clearRect(iconX, iconY, image.width, image.height);
      }
    }
  }

  /**
   * Handle start input
   *
   * If space is pressed and at least one player is ready,
   * invokes the start callback.
   *
   * @param playerTemplates - Array of player templates
   * @param onStart - Callback to invoke when starting
   */
  #handleStartInput(
    playerTemplates: PlayerTemplate[],
    onStart: () => void
  ): void {
    // Check if space is pressed
    if (!this.#inputManager.isKeyPressed('space')) {
      return;
    }

    // Check if any player is ready
    for (const player of playerTemplates) {
      if (player.ready) {
        onStart();
        break; // Only start once
      }
    }
  }

  /**
   * Validate that an image is loaded and ready to draw
   *
   * @param image - Image to validate
   * @returns True if image is valid and loaded
   */
  #isImageValid(image: HTMLImageElement | undefined): boolean {
    if (!image) {
      return false;
    }

    // Check if image has loaded
    return image.complete && image.naturalWidth > 0;
  }

  /**
   * Calculate the position for a player's controls
   *
   * Positions are distributed vertically based on player count.
   *
   * @param index - Player index in the array
   * @param totalPlayers - Total number of players
   * @param gameWidth - Current game canvas width
   * @param gameHeight - Current game canvas height
   * @returns Position coordinates {x, y}
   */
  #calculatePlayerPosition(
    index: number,
    totalPlayers: number,
    gameWidth: number,
    gameHeight: number
  ): { x: number; y: number } {
    const x = gameWidth * this.#config.keyLabelXRatio;
    const y =
      ((gameHeight * this.#config.verticalSpacingRatio) / totalPlayers) * index +
      this.#config.baseY;

    return { x, y };
  }
}

/**
 * Create a new player selector instance
 *
 * Factory function for convenient instantiation.
 *
 * @param context - Canvas 2D rendering context
 * @param inputManager - Input manager for keyboard state
 * @param config - Optional configuration
 * @returns New PlayerSelector instance
 */
export function createPlayerSelector(
  context: CanvasRenderingContext2D,
  inputManager: IInputManager,
  config?: PlayerSelectorConfig
): IPlayerSelector {
  return new PlayerSelector(context, inputManager, config);
}
