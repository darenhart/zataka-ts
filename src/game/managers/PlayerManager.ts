/**
 * Player Manager
 *
 * Manages the collection of active players and handles round logic.
 *
 * Migrated from Players constructor in Player.js with improvements:
 * - Dependency injection for all external dependencies
 * - No global state access
 * - Type-safe configuration and dependencies
 * - Proper encapsulation with private fields
 * - Callback pattern for game events
 */

import type {
  PlayerTemplate,
  PlayerManagerConfig,
  PlayerDependencies,
  PlayerConstants,
  IPlayer,
  IPlayerManager,
  OnPlayerDeath,
} from '../../types/player.types';
import { createPlayer } from '../entities/Player';

/**
 * Default player templates
 *
 * All 6 possible players with their colors and control keys.
 */
const DEFAULT_PLAYER_TEMPLATES: PlayerTemplate[] = [
  {
    ready: false,
    count: 1,
    name: 'red',
    color: '#f82801',
    left: '1',
    right: 'q',
  },
  {
    ready: false,
    count: 2,
    name: 'yellow',
    color: '#c0c001',
    left: 'Shift',
    right: 'Ctrl',
  },
  {
    ready: false,
    count: 3,
    name: 'orange',
    color: '#f87801',
    left: 'n',
    right: 'm',
  },
  {
    ready: false,
    count: 4,
    name: 'green',
    color: '#01c801',
    left: 'left',
    right: 'down',
  },
  {
    ready: false,
    count: 5,
    name: 'pink',
    color: '#d850b0',
    left: 'o',
    right: 'p',
  },
  {
    ready: false,
    count: 6,
    name: 'blue',
    color: '#02a0c8',
    left: 'mouse1',
    right: 'mouse2',
  },
];

/**
 * Dependencies required by PlayerManager
 */
export interface PlayerManagerDependencies {
  /** Canvas rendering context for game canvas */
  context: CanvasRenderingContext2D;

  /** Player dependencies (input, fps, dimensions) */
  playerDependencies: PlayerDependencies;

  /** Optional player constants (collision tolerance, timing) */
  playerConstants?: PlayerConstants;

  /** Callback when new round should start */
  onNewRound?: () => void;

  /** Callback when game should finish */
  onFinish?: () => void;
}

/**
 * PlayerManager class
 *
 * Manages the player pool, round state, and game loop.
 */
export class PlayerManager implements IPlayerManager {
  // Public readonly properties
  public get running(): boolean {
    return this.#running;
  }

  public get roundCount(): number {
    return this.#roundCount;
  }

  public get maxRounds(): number {
    return this.#maxRounds;
  }

  public get playerTemplates(): readonly PlayerTemplate[] {
    return this.#playerTemplates;
  }

  public get pool(): readonly IPlayer[] {
    return this.#pool;
  }

  // Private state
  #running: boolean = false;
  #roundCount: number = 0;
  #maxRounds: number = 0;

  // Player templates (mutable for ready state)
  #playerTemplates: PlayerTemplate[];

  // Active player instances
  #pool: IPlayer[] = [];

  // Dependencies
  #context: CanvasRenderingContext2D;
  #playerDependencies: PlayerDependencies;
  #playerConstants?: PlayerConstants;

  // Callbacks
  #onNewRound?: () => void;
  #onFinish?: () => void;

  /**
   * Create a new player manager
   *
   * @param dependencies - Dependencies including context, player deps, and callbacks
   * @param playerTemplates - Optional custom player templates (uses defaults if not provided)
   */
  constructor(
    dependencies: PlayerManagerDependencies,
    playerTemplates?: PlayerTemplate[]
  ) {
    this.#context = dependencies.context;
    this.#playerDependencies = dependencies.playerDependencies;
    this.#playerConstants = dependencies.playerConstants;
    this.#onNewRound = dependencies.onNewRound;
    this.#onFinish = dependencies.onFinish;

    // Use custom templates or defaults
    this.#playerTemplates = playerTemplates
      ? [...playerTemplates]
      : [...DEFAULT_PLAYER_TEMPLATES];
  }

  /**
   * Initialize the player manager for a new game
   *
   * Creates Player instances for all players marked as ready.
   *
   * @param config - Game configuration including maxRounds and physics
   */
  public init(config: PlayerManagerConfig): void {
    this.#maxRounds = config.maxRounds;
    this.#roundCount = 0;
    this.#pool = [];

    // Create death callback that will be passed to each player
    const onPlayerDeath: OnPlayerDeath = () => {
      this.checkRoundOver();
    };

    // Create Player instances for ready players
    for (const template of this.#playerTemplates) {
      if (template.ready) {
        const player = createPlayer(
          template,
          config.physics,
          this.#playerDependencies,
          this.#playerConstants,
          onPlayerDeath
        );

        // Preserve score if player already exists (for subsequent rounds)
        const existing = this.#pool.find((p) => p.name === template.name);
        if (existing) {
          player.score = existing.score;
        }

        this.#pool.push(player);
      }
    }
  }

  /**
   * Start a new round
   *
   * Clears the canvas and initializes all players.
   */
  public startRound(): void {
    this.#running = true;

    // Clear game canvas
    this.#context.clearRect(
      0,
      0,
      this.#playerDependencies.dimensions.width,
      this.#playerDependencies.dimensions.height
    );

    // Initialize all players for the new round
    for (const player of this.#pool) {
      player.init();
    }
  }

  /**
   * Main animation/game loop
   *
   * Updates and draws all living players if round is active.
   * Handles space bar input for starting new round or finishing game.
   */
  public animate(): void {
    if (this.#running) {
      // Draw all living players
      for (const player of this.#pool) {
        if (!player.dead) {
          player.draw();
        }
      }
    } else {
      // Check for space bar to start next round or finish game
      if (this.#playerDependencies.inputManager.isKeyPressed('space')) {
        if (this.#roundCount < this.#maxRounds) {
          // Start next round
          if (this.#onNewRound) {
            this.#onNewRound();
          }
        } else {
          // Game over
          this.#running = false;
          if (this.#onFinish) {
            this.#onFinish();
          }
        }
      }
    }
  }

  /**
   * Check if the round should end
   *
   * Called when a player dies. Ends the round if only one player remains alive.
   */
  public checkRoundOver(): void {
    let deadCount = 0;

    // Count dead players
    for (const player of this.#pool) {
      if (player.dead) {
        deadCount++;
      }

      // End round if all but one player are dead
      if (deadCount >= this.#pool.length - 1) {
        this.#running = false;
        this.#roundCount++;
        break;
      }
    }
  }
}

/**
 * Create a new player manager instance
 *
 * Factory function for convenient instantiation.
 *
 * @param dependencies - Dependencies including context, player deps, and callbacks
 * @param playerTemplates - Optional custom player templates
 * @returns New PlayerManager instance
 */
export function createPlayerManager(
  dependencies: PlayerManagerDependencies,
  playerTemplates?: PlayerTemplate[]
): IPlayerManager {
  return new PlayerManager(dependencies, playerTemplates);
}
