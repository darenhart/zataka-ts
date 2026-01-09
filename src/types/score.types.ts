/**
 * Score System Type Definitions
 *
 * Type definitions for the scoreboard and player scoring system.
 */

/**
 * Player data structure
 *
 * Represents a player in the game with their current state and score.
 */
export interface Player {
  /** Player identifier/name (e.g., 'red', 'blue', 'green') */
  name: string;

  /** Player color in hex format (e.g., '#FF0000') */
  color: string;

  /** Current score (number of rounds won) */
  score: number;

  /** Whether the player is currently dead/eliminated in this round */
  dead: boolean;
}

/**
 * Configuration options for ScoreBoard
 */
export interface ScoreConfig {
  /** Width of the scoreboard panel in pixels (default: 150) */
  width?: number;

  /** Font size in pixels (default: 75) */
  fontSize?: number;

  /** Font family name (default: 'Sans-Serif') */
  fontFamily?: string;

  /** Font style (default: 'italic') */
  fontStyle?: string;

  /** Background color in hex format (default: '#3c3c3c') */
  backgroundColor?: string;

  /** Text alignment for scores (default: 'right') */
  textAlign?: 'left' | 'right' | 'center';
}

/**
 * Interface for scoreboard implementations
 */
export interface IScoreBoard {
  /** Width of the scoreboard panel (read-only) */
  readonly width: number;

  /**
   * Draw the scoreboard with all player scores
   *
   * @param players - Array of players to display
   * @param gameHeight - Current game canvas height for positioning
   */
  draw(players: Player[], gameHeight: number): void;

  /**
   * Increment scores when a player dies
   *
   * When a player dies, all other living players receive a point.
   * This implements the last-man-standing scoring system.
   *
   * @param deadPlayerName - Name of the player who died
   * @param players - Array of all players
   */
  incrementScores(deadPlayerName: string, players: Player[]): void;

  /**
   * Clear the scoreboard canvas area
   */
  clear(): void;
}
