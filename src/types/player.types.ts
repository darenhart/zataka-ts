/**
 * Player Type Definitions
 *
 * Type definitions for player templates, configuration, and game state.
 */

import type { KeyName } from './input.types';

/**
 * Player names/colors available in the game
 */
export type PlayerName = 'red' | 'yellow' | 'orange' | 'green' | 'pink' | 'blue';

/**
 * Player template - Configuration for a player
 *
 * This represents a player slot that can be activated/deactivated
 * for a game round. Players toggle their readiness using their
 * assigned control keys.
 */
export interface PlayerTemplate {
  /** Player identifier (e.g., 'red', 'blue') */
  name: PlayerName;

  /** Player color in hex format (e.g., '#FF0000') */
  color: string;

  /** Key for turning left */
  left: KeyName;

  /** Key for turning right */
  right: KeyName;

  /** Whether this player is ready for the current round */
  ready: boolean;

  /** Player index/count (1-6) */
  count: number;
}

/**
 * Image repository for player sprites
 *
 * Maps player names to their corresponding sprite images.
 */
export type ImageRepository = Record<PlayerName, HTMLImageElement>;

/**
 * Configuration options for PlayerSelector
 */
export interface PlayerSelectorConfig {
  /** X position ratio for key labels (default: 1/5 of width) */
  keyLabelXRatio?: number;

  /** X offset in pixels for player icons from key labels (default: 220) */
  iconOffsetX?: number;

  /** Base Y position in pixels (default: 80) */
  baseY?: number;

  /** Vertical spacing ratio relative to canvas height (default: 0.6) */
  verticalSpacingRatio?: number;

  /** Font size in pixels (default: 20) */
  fontSize?: number;

  /** Font family name (default: 'Courier') */
  fontFamily?: string;

  /** Font weight (default: 'bold') */
  fontWeight?: string;

  /** Y position ratio for instructions text (default: 7/8) */
  instructionYRatio?: number;

  /** Instructions text to display (default: 'Press space to start') */
  instructionText?: string;

  /** Text color for instructions (default: 'white') */
  instructionColor?: string;
}

/**
 * Interface for player selector implementations
 */
export interface IPlayerSelector {
  /** Whether the selector screen is currently active */
  readonly active: boolean;

  /**
   * Show the player selection screen
   *
   * Displays player controls and instructions for each player.
   *
   * @param playerTemplates - Array of player templates to display
   * @param gameWidth - Current game canvas width
   * @param gameHeight - Current game canvas height
   */
  show(
    playerTemplates: PlayerTemplate[],
    gameWidth: number,
    gameHeight: number
  ): void;

  /**
   * Listen for player input
   *
   * Monitors keyboard input to toggle player ready states and start the game.
   * Should be called each frame in the game loop.
   *
   * @param playerTemplates - Array of player templates (will be mutated)
   * @param imageRepo - Image repository for player sprites
   * @param gameWidth - Current game canvas width
   * @param gameHeight - Current game canvas height
   * @param onStart - Callback to invoke when game should start
   */
  listen(
    playerTemplates: PlayerTemplate[],
    imageRepo: ImageRepository,
    gameWidth: number,
    gameHeight: number,
    onStart: () => void
  ): void;

  /**
   * Clear the player selection screen
   *
   * Resets all players to not ready and clears the canvas.
   *
   * @param playerTemplates - Array of player templates (will be mutated)
   * @param gameWidth - Current game canvas width
   * @param gameHeight - Current game canvas height
   */
  clear(
    playerTemplates: PlayerTemplate[],
    gameWidth: number,
    gameHeight: number
  ): void;
}

/**
 * Game configuration for player physics
 *
 * Contains all physics parameters that affect player movement and behavior.
 */
export interface PlayerPhysicsConfig {
  /** Player trail size (radius in pixels) */
  size: number;

  /** Player movement speed (pixels per frame) */
  speed: number;

  /** Turning/curve speed (degrees per frame) */
  curveSpeed: number;

  /** Base interval between holes (frames) */
  holeRate: number;

  /** Random variation for hole rate (+/- this value) */
  holeRateRnd: number;

  /** Base duration of holes (frames) */
  holeSize: number;

  /** Random variation for hole size (+/- this value) */
  holeSizeRnd: number;
}

/**
 * Gameplay dimensions and boundaries
 */
export interface GameDimensions {
  /** Canvas width available for gameplay */
  width: number;

  /** Canvas height available for gameplay */
  height: number;

  /** Width of the scoreboard (excluded from gameplay area) */
  scoreWidth: number;
}

/**
 * FPS provider for frame rate adjustment
 */
export interface FPSProvider {
  /** Current frames per second (undefined if not calculated yet) */
  readonly value: number | undefined;
}

/**
 * Input manager for player controls
 */
export interface IInputManager {
  /**
   * Check if a key is currently pressed
   *
   * @param key - Key name to check
   * @returns True if key is pressed, false otherwise
   */
  isKeyPressed(key: string): boolean;
}

/**
 * Dependencies required by Player instances
 */
export interface PlayerDependencies {
  /** Canvas rendering context for drawing player trails */
  context: CanvasRenderingContext2D;

  /** Input manager for keyboard/mouse controls */
  inputManager: IInputManager;

  /** FPS provider for frame rate adjustment */
  fpsProvider: FPSProvider;

  /** Game dimensions and boundaries */
  dimensions: GameDimensions;
}

/**
 * Constants for player behavior
 */
export interface PlayerConstants {
  /** Frames to keep rendering after collision detected (default: 0) */
  afterDieTime?: number;

  /** Collision detection tolerance in degrees (0-70, default: 30) */
  collisionTolerance?: number;

  /** Startup delay in frames before movement begins (default: 40) */
  startTime?: number;
}

/**
 * Interface for player entity implementations
 */
export interface IPlayer {
  /** Player name/identifier */
  readonly name: PlayerName;

  /** Player color */
  readonly color: string;

  /** Current score */
  score: number;

  /** Whether player is dead in this round */
  dead: boolean;

  /**
   * Initialize player for a new round
   *
   * Resets position, angle, and all state variables.
   * Called at the start of each round.
   */
  init(): void;

  /**
   * Update and draw the player
   *
   * Main game loop method that:
   * - Updates position based on input and physics
   * - Checks for collisions
   * - Renders player trail
   * - Manages hole creation
   *
   * Should be called once per frame.
   */
  draw(): void;
}

/**
 * Callback for when a player dies
 */
export type OnPlayerDeath = (playerName: PlayerName) => void;

/**
 * Configuration for PlayerManager
 */
export interface PlayerManagerConfig {
  /** Maximum number of rounds to play */
  maxRounds: number;

  /** Physics configuration for all players */
  physics: PlayerPhysicsConfig;
}

/**
 * Interface for player manager implementations
 */
export interface IPlayerManager {
  /** Whether a round is currently active */
  readonly running: boolean;

  /** Current round number (0-based) */
  readonly roundCount: number;

  /** Maximum number of rounds */
  readonly maxRounds: number;

  /** Array of player templates (all 6 players) */
  readonly playerTemplates: readonly PlayerTemplate[];

  /** Array of active Player instances in current game */
  readonly pool: readonly IPlayer[];

  /**
   * Initialize the player manager for a new game
   *
   * Creates Player instances for all players marked as ready.
   *
   * @param config - Game configuration including maxRounds and physics
   */
  init(config: PlayerManagerConfig): void;

  /**
   * Start a new round
   *
   * Clears the canvas and initializes all players.
   */
  startRound(): void;

  /**
   * Main animation/game loop
   *
   * Updates and draws all living players if round is active.
   * Handles space bar input for starting new round or finishing game.
   */
  animate(): void;

  /**
   * Check if the round should end
   *
   * Called when a player dies. Ends the round if only one player remains alive.
   */
  checkRoundOver(): void;
}
