/**
 * Player Entity
 *
 * Represents an individual player in the game with physics, collision detection,
 * and rendering capabilities.
 *
 * Migrated from Player.js with improvements:
 * - Dependency injection for all external dependencies
 * - No global state access
 * - Type-safe configuration and dependencies
 * - Proper encapsulation with private fields
 * - FPS-adjusted physics calculations
 * - Pixel-based collision detection
 */

import type {
  PlayerName,
  PlayerTemplate,
  PlayerPhysicsConfig,
  PlayerDependencies,
  PlayerConstants,
  IPlayer,
  OnPlayerDeath,
} from '../../types/player.types';

/**
 * Default constants for player behavior
 */
const DEFAULT_CONSTANTS: Required<PlayerConstants> = {
  afterDieTime: 0,
  collisionTolerance: 30,
  startTime: 40,
};

/**
 * Player class
 *
 * Handles player physics, collision detection, trail rendering, and game state.
 */
export class Player implements IPlayer {
  // Public readonly properties (from template)
  readonly name: PlayerName;
  readonly color: string;
  readonly #left: string;
  readonly #right: string;

  // Public mutable properties
  public score: number = 0;
  public dead: boolean = false;

  // Configuration
  #size: number;
  #speed: number;
  #curveSpeed: number;
  #holeRate: number;
  #holeRateRnd: number;
  #holeSize: number;
  #holeSizeRnd: number;

  // Dependencies
  #context: CanvasRenderingContext2D;
  #inputManager: { isKeyPressed(key: string): boolean };
  #fpsProvider: { readonly currentFps: number };
  #dimensions: { width: number; height: number; scoreWidth: number };

  // Constants
  #afterDieTime: number;
  #collisionTolerance: number;
  #startTime: number;

  // Position and movement state
  #x: number = 0;
  #y: number = 0;
  #angle: number = 0;

  // Life state
  #dying: boolean = false;
  #afterDieCount: number = 0;

  // Timing
  #counter: number = 0;

  // Hole state
  #hole: boolean = false;
  #holeCounter: number = 0;
  #nextHole: number = 0;
  #nextHoleSize: number = 0;

  // Death callback
  #onDeath?: OnPlayerDeath;

  /**
   * Create a new player
   *
   * @param template - Player template with name, color, and controls
   * @param physics - Physics configuration (speed, size, holes)
   * @param dependencies - External dependencies (context, input, fps, dimensions)
   * @param constants - Optional behavior constants (timing, collision tolerance)
   * @param onDeath - Optional callback when player dies
   */
  constructor(
    template: PlayerTemplate,
    physics: PlayerPhysicsConfig,
    dependencies: PlayerDependencies,
    constants?: PlayerConstants,
    onDeath?: OnPlayerDeath
  ) {
    // Set template properties
    this.name = template.name;
    this.color = template.color;
    this.#left = template.left;
    this.#right = template.right;

    // Set physics configuration
    this.#size = physics.size;
    this.#speed = physics.speed;
    this.#curveSpeed = physics.curveSpeed;
    this.#holeRate = physics.holeRate;
    this.#holeRateRnd = physics.holeRateRnd;
    this.#holeSize = physics.holeSize;
    this.#holeSizeRnd = physics.holeSizeRnd;

    // Set dependencies
    this.#context = dependencies.context;
    this.#inputManager = dependencies.inputManager;
    this.#fpsProvider = dependencies.fpsProvider;
    this.#dimensions = dependencies.dimensions;

    // Set constants
    const finalConstants = { ...DEFAULT_CONSTANTS, ...constants };
    this.#afterDieTime = finalConstants.afterDieTime;
    this.#collisionTolerance = finalConstants.collisionTolerance;
    this.#startTime = finalConstants.startTime;

    // Set death callback
    this.#onDeath = onDeath;
  }

  /**
   * Initialize player for a new round
   *
   * Resets all state variables and sets random starting position/angle.
   */
  public init(): void {
    // Reset counters
    this.#counter = 0;
    this.#holeCounter = 0;
    this.#afterDieCount = 0;

    // Reset state
    this.#dying = false;
    this.#hole = false;
    this.dead = false;

    // Set random starting position
    // Original logic: startOnCenter = false
    const gameWidth = this.#dimensions.width - this.#dimensions.scoreWidth;
    this.#x = (gameWidth - 100) * Math.random() + 50;
    this.#y = (this.#dimensions.height - 100) * Math.random() + 50;
    this.#angle = Math.random() * 360;

    // Initialize hole state
    this.#getNextHole();
    this.#getNextHoleSize();
  }

  /**
   * Update and draw the player
   *
   * Main game loop method called once per frame.
   * Handles physics, collision detection, and rendering.
   */
  public draw(): void {
    this.#counter++;

    // Skip drawing during startup delay (but not on first 2 frames)
    if (this.#counter < this.#startTime && this.#counter > 2) {
      return;
    }

    // Check if player has been dead long enough
    if (this.#dying && this.#afterDieCount > this.#afterDieTime) {
      this.dead = true;

      // Trigger death callback
      if (this.#onDeath) {
        this.#onDeath(this.name);
      }

      return;
    }

    // Increment after-die counter if dying
    if (this.#dying) {
      this.#afterDieCount++;
    }

    // Calculate FPS-adjusted speed
    const fps = this.#fpsProvider.currentFps;
    const speedMultiplier = fps && fps > 20 ? 60 / fps : 1;
    const adjustedSpeed = this.#speed * speedMultiplier;
    const adjustedAngSpeed = this.#curveSpeed * speedMultiplier;

    // Handle input and update angle
    if (this.#inputManager.isKeyPressed(this.#left)) {
      this.#angle += adjustedAngSpeed;
    } else if (this.#inputManager.isKeyPressed(this.#right)) {
      this.#angle -= adjustedAngSpeed;
    }

    // Update position
    const angleRad = (this.#angle * Math.PI) / 180;
    this.#y += adjustedSpeed * Math.cos(angleRad);
    this.#x += adjustedSpeed * Math.sin(angleRad);

    // Manage hole creation
    this.#createHole();

    // Check collision and draw (only if not in a hole)
    if (!this.#hole) {
      if (this.#isColliding()) {
        this.#dying = true;
      }

      this.#drawStroke();
    }
  }

  /**
   * Calculate next hole distance
   *
   * Uses random variation around the base hole rate.
   */
  #getNextHole(): void {
    this.#nextHole =
      this.#holeRate + (Math.random() * 2 - 1) * this.#holeRateRnd;
  }

  /**
   * Calculate next hole size
   *
   * Uses random variation around the base hole size.
   */
  #getNextHoleSize(): void {
    this.#nextHoleSize =
      this.#holeSize + (Math.random() * 2 - 1) * this.#holeSizeRnd;
  }

  /**
   * Draw player trail stroke
   *
   * Renders a circular arc at the current position.
   */
  #drawStroke(): void {
    this.#context.beginPath();
    this.#context.fillStyle = this.color;
    this.#context.arc(this.#x, this.#y, this.#size, 0, 2 * Math.PI);
    this.#context.fill();
  }

  /**
   * Manage hole creation in the trail
   *
   * Creates gaps in the player trail at random intervals.
   */
  #createHole(): void {
    this.#holeCounter++;

    if (this.#holeCounter > this.#nextHole || this.#hole) {
      this.#hole = true;

      if (this.#holeCounter > this.#nextHole + this.#nextHoleSize) {
        this.#getNextHole();
        this.#getNextHoleSize();
        this.#hole = false;
        this.#holeCounter = 0;
      }
    }
  }

  /**
   * Check for collisions
   *
   * Detects collisions with:
   * - Canvas boundaries
   * - Existing trails (own or other players)
   *
   * Uses pixel sampling at two points ahead of the player
   * based on current angle and collision tolerance.
   *
   * @returns True if collision detected, false otherwise
   */
  #isColliding(): boolean {
    // Check boundary collisions
    const gameWidth = this.#dimensions.width - this.#dimensions.scoreWidth;
    if (
      this.#x < 0 ||
      this.#x > gameWidth ||
      this.#y < 0 ||
      this.#y > this.#dimensions.height
    ) {
      return true;
    }

    // Check trail collisions using pixel sampling
    const rcol = this.#size + 2;

    // Sample point 1 (ahead-left)
    const rad1 = ((this.#angle + this.#collisionTolerance) * Math.PI) / 180;
    const y1 = Math.round(this.#y + rcol * Math.cos(rad1));
    const x1 = Math.round(this.#x + rcol * Math.sin(rad1));
    const p1 = this.#context.getImageData(x1, y1, 1, 1).data;

    // Sample point 2 (ahead-right)
    const rad2 = ((this.#angle - this.#collisionTolerance) * Math.PI) / 180;
    const y2 = Math.round(this.#y + rcol * Math.cos(rad2));
    const x2 = Math.round(this.#x + rcol * Math.sin(rad2));
    const p2 = this.#context.getImageData(x2, y2, 1, 1).data;

    // Collision if either sample point has color (non-black pixel)
    // Check all RGB channels, not just red, to detect all colors
    if (
      p1[0] !== 0 ||
      p1[1] !== 0 ||
      p1[2] !== 0 ||
      p2[0] !== 0 ||
      p2[1] !== 0 ||
      p2[2] !== 0
    ) {
      return true;
    }

    return false;
  }
}

/**
 * Create a new player instance
 *
 * Factory function for convenient instantiation.
 *
 * @param template - Player template
 * @param physics - Physics configuration
 * @param dependencies - Dependencies
 * @param constants - Optional constants
 * @param onDeath - Optional death callback
 * @returns New Player instance
 */
export function createPlayer(
  template: PlayerTemplate,
  physics: PlayerPhysicsConfig,
  dependencies: PlayerDependencies,
  constants?: PlayerConstants,
  onDeath?: OnPlayerDeath
): IPlayer {
  return new Player(template, physics, dependencies, constants, onDeath);
}
