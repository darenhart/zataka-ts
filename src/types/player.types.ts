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
