/**
 * ScoreBoard Component
 *
 * Manages and displays the player scoreboard in the game.
 * Shows all player scores in their respective colors on a dedicated canvas layer.
 *
 * Migrated from Score.js with improvements:
 * - Dependency injection for canvas context
 * - No global game object dependency
 * - Configurable display options
 * - Proper TypeScript types
 * - Resolved dimension inconsistencies
 */

import type { Player, ScoreConfig, IScoreBoard } from '../../types/score.types';

/**
 * Maximum height for clearing the scoreboard
 * Generous height to ensure all content is cleared regardless of game size
 */
const MAX_CLEAR_HEIGHT = 1000;

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<ScoreConfig> = {
  width: 150,
  fontSize: 75,
  fontFamily: 'Sans-Serif',
  fontStyle: 'italic',
  backgroundColor: '#3c3c3c',
  textAlign: 'right',
};

/**
 * ScoreBoard class
 *
 * Renders and manages the game scoreboard.
 * Displays player scores in their colors with configurable styling.
 */
export class ScoreBoard implements IScoreBoard {
  // Private fields
  #context: CanvasRenderingContext2D;
  #config: Required<ScoreConfig>;

  /**
   * Create a new scoreboard
   *
   * @param context - Canvas 2D rendering context for drawing
   * @param config - Optional configuration (uses defaults if not provided)
   */
  constructor(context: CanvasRenderingContext2D, config?: ScoreConfig) {
    this.#context = context;
    this.#config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get the width of the scoreboard panel
   */
  public get width(): number {
    return this.#config.width;
  }

  /**
   * Draw the complete scoreboard
   *
   * Renders the background and all player scores.
   * Scores are positioned vertically based on player count.
   *
   * @param players - Array of players to display
   * @param gameHeight - Current game canvas height for positioning
   */
  public draw(players: Player[], gameHeight: number): void {
    // Clear previous scoreboard
    this.clear();

    // Draw background panel
    this.#drawBackground(gameHeight);

    // Draw player scores
    this.#drawPlayerScores(players, gameHeight);
  }

  /**
   * Increment scores when a player dies
   *
   * Implements last-man-standing scoring:
   * When a player dies, all OTHER living players receive a point.
   *
   * Note: This method mutates the player array but does NOT automatically
   * redraw the scoreboard. Call draw() afterward to update the display.
   *
   * @param deadPlayerName - Name of the player who died
   * @param players - Array of all players (will be mutated)
   *
   * @example
   * ```typescript
   * scoreBoard.incrementScores('red', players);
   * scoreBoard.draw(players, gameHeight); // Don't forget to redraw!
   * ```
   */
  public incrementScores(deadPlayerName: string, players: readonly Player[]): void {
    // Award points to all living players except the one who died
    for (const player of players) {
      if (player.name !== deadPlayerName && !player.dead) {
        player.score++;
      }
    }
  }

  /**
   * Clear the scoreboard canvas area
   *
   * Clears the entire scoreboard region.
   * Uses a generous height to ensure all content is cleared.
   */
  public clear(): void {
    this.#context.clearRect(0, 0, this.#config.width, MAX_CLEAR_HEIGHT);
  }

  /**
   * Draw the background panel
   *
   * Renders a solid color rectangle as the scoreboard background.
   *
   * @param gameHeight - Current game canvas height
   */
  #drawBackground(gameHeight: number): void {
    this.#context.save();

    this.#context.fillStyle = this.#config.backgroundColor;
    this.#context.fillRect(0, 0, this.#config.width, gameHeight);

    this.#context.restore();
  }

  /**
   * Draw all player scores
   *
   * Renders each player's score in their color.
   * Positions are calculated to distribute players evenly.
   *
   * @param players - Array of players to display
   * @param gameHeight - Current game canvas height for positioning
   */
  #drawPlayerScores(players: Player[], gameHeight: number): void {
    if (players.length === 0) {
      return;
    }

    this.#context.save();

    // Set font properties
    this.#context.font = `${this.#config.fontStyle} ${this.#config.fontSize}px ${this.#config.fontFamily}`;
    this.#context.textAlign = this.#config.textAlign;

    const totalPlayers = players.length;

    // Draw each player's score
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (!player) continue; // Type guard for array access

      const position = this.#calculatePlayerPosition(i, totalPlayers, gameHeight);

      this.#context.fillStyle = player.color;
      this.#context.fillText(player.score.toString(), position.x, position.y);
    }

    this.#context.restore();
  }

  /**
   * Calculate the position for a player's score
   *
   * Positions are distributed vertically based on player index.
   * Horizontal position is 3/4 of the scoreboard width with padding.
   *
   * @param index - Player index in the array
   * @param totalPlayers - Total number of players
   * @param gameHeight - Current game canvas height
   * @returns Position coordinates {x, y}
   */
  #calculatePlayerPosition(
    index: number,
    totalPlayers: number,
    gameHeight: number
  ): { x: number; y: number } {
    // Original formula: x = width*3/4 - 10, y = height*0.9 * i/totalPlayers + 80
    const x = (this.#config.width * 3) / 4 - 10;
    const y = (gameHeight * 0.9 * index) / totalPlayers + 80;

    return { x, y };
  }
}

/**
 * Create a new scoreboard instance
 *
 * Factory function for convenient instantiation.
 *
 * @param context - Canvas 2D rendering context
 * @param config - Optional configuration
 * @returns New ScoreBoard instance
 */
export function createScoreBoard(
  context: CanvasRenderingContext2D,
  config?: ScoreConfig
): IScoreBoard {
  return new ScoreBoard(context, config);
}
