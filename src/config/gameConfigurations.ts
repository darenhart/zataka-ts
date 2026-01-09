/**
 * Game Configuration Types and Presets
 *
 * Defines the configuration structure for different game modes (classic, agility, strategy).
 * Each configuration controls game mechanics like speed, turning rate, hole frequency, etc.
 */

/**
 * Configuration for a single game preset
 */
export interface GameConfiguration {
  /** Number of rounds until game ends */
  maxRounds: number;

  /** Radius of the player trail in pixels */
  size: number;

  /** Linear movement speed in pixels per frame */
  speed: number;

  /** Angular turning speed in degrees per frame */
  curveSpeed: number;

  /** Base frequency of holes in frames between holes */
  holeRate: number;

  /** Random variation of hole frequency (±frames) */
  holeRateRnd: number;

  /** Base duration of each hole in frames */
  holeSize: number;

  /** Random variation of hole duration (±frames) */
  holeSizeRnd: number;
}

/**
 * Available game preset names
 */
export type PresetName = 'classic' | 'agility' | 'strategy';

/**
 * Game mode presets with different difficulty and play styles
 *
 * - **classic**: Balanced gameplay with medium speed and moderate holes
 * - **agility**: Fast-paced, reflex-based with high speed and many rounds
 * - **strategy**: Slow, methodical with frequent holes and few rounds
 *
 * @readonly Immutable configuration object
 */
export const configurations = {
  /**
   * Classic mode: Balanced gameplay, original Zatacka experience
   */
  classic: {
    maxRounds: 15,
    size: 3,
    speed: 1.6,
    curveSpeed: 2,
    holeRate: 450,
    holeRateRnd: 200,
    holeSize: 11,
    holeSizeRnd: 3,
  },

  /**
   * Agility mode: High-speed, reflex-based, longer games
   */
  agility: {
    maxRounds: 20,
    size: 4,
    speed: 3,
    curveSpeed: 3.5,
    holeRate: 400,
    holeRateRnd: 200,
    holeSize: 9,
    holeSizeRnd: 3,
  },

  /**
   * Strategy mode: Slow, tactical, short games with frequent holes
   */
  strategy: {
    maxRounds: 5,
    size: 3.2,
    speed: 1,
    curveSpeed: 2,
    holeRate: 220,
    holeRateRnd: 100,
    holeSize: 14,
    holeSizeRnd: 1,
  },
} as const satisfies Record<PresetName, GameConfiguration>;

/**
 * Get a configuration by preset name with type safety
 *
 * @param preset - Name of the preset to retrieve
 * @returns The game configuration for the specified preset, or undefined if not found
 */
export function getConfiguration(preset: string): GameConfiguration | undefined {
  if (isValidPreset(preset)) {
    return configurations[preset];
  }
  return undefined;
}

/**
 * Type guard to check if a string is a valid preset name
 *
 * @param preset - String to check
 * @returns True if the string is a valid PresetName
 */
export function isValidPreset(preset: string): preset is PresetName {
  return preset in configurations;
}

/**
 * Get all available preset names
 *
 * @returns Array of all valid preset names
 */
export function getAllPresetNames(): PresetName[] {
  return Object.keys(configurations) as PresetName[];
}

/**
 * Validate that a configuration object has all required properties with valid values
 *
 * Use this when loading configurations from external sources (e.g., JSON files, API responses).
 * Not needed for TypeScript-defined configurations which are already type-checked at compile time.
 *
 * @param config - Configuration object to validate
 * @returns True if all properties are numbers greater than 0
 */
export function validateConfiguration(config: GameConfiguration): boolean {
  return (
    typeof config.maxRounds === 'number' &&
    config.maxRounds > 0 &&
    typeof config.size === 'number' &&
    config.size > 0 &&
    typeof config.speed === 'number' &&
    config.speed > 0 &&
    typeof config.curveSpeed === 'number' &&
    config.curveSpeed > 0 &&
    typeof config.holeRate === 'number' &&
    config.holeRate > 0 &&
    typeof config.holeRateRnd === 'number' &&
    config.holeRateRnd >= 0 &&
    typeof config.holeSize === 'number' &&
    config.holeSize > 0 &&
    typeof config.holeSizeRnd === 'number' &&
    config.holeSizeRnd >= 0
  );
}

// Default export for backward compatibility
export default configurations;
