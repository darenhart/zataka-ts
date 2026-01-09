/**
 * Settings Type Definitions
 *
 * Type definitions for the advanced settings UI controller.
 */

import type { GameConfiguration, PresetName } from '../config/gameConfigurations';

/**
 * Configuration options for AdvancedSettings
 */
export interface AdvancedSettingsConfig {
  /** Default preset to load on initialization (default: 'classic') */
  defaultPreset?: PresetName;

  /** Text to display when in classic mode (default: 'Classic') */
  buttonClassicText?: string;

  /** Text to display when in advanced mode (default: 'Advanced') */
  buttonAdvancedText?: string;
}

/**
 * Input elements mapped to GameConfiguration properties
 *
 * Each property corresponds to a configuration field that can be
 * customized in the advanced settings form.
 */
export interface GameConfigurationInputs {
  /** Input for maximum rounds */
  maxRounds: HTMLInputElement;

  /** Input for player size */
  size: HTMLInputElement;

  /** Input for player speed */
  speed: HTMLInputElement;

  /** Input for curve/turn speed */
  curveSpeed: HTMLInputElement;

  /** Input for hole appearance rate */
  holeRate: HTMLInputElement;

  /** Input for hole rate randomness */
  holeRateRnd: HTMLInputElement;

  /** Input for hole size */
  holeSize: HTMLInputElement;

  /** Input for hole size randomness */
  holeSizeRnd: HTMLInputElement;
}

/**
 * DOM elements required by AdvancedSettings
 *
 * All elements must be provided during initialization.
 */
export interface AdvancedSettingsElements {
  /** Button that toggles between classic and advanced modes */
  advancedButton: HTMLButtonElement;

  /** Container for the settings form */
  form: HTMLElement;

  /** Main container for the entire advanced settings panel */
  advancedPanel: HTMLElement;

  /** Classic preset button */
  classicButton: HTMLButtonElement;

  /** All preset selection buttons (classic, agility, strategy) */
  presetButtons: HTMLButtonElement[];

  /** Input elements for game configuration values */
  inputs: GameConfigurationInputs;
}

/**
 * Interface for advanced settings implementations
 */
export interface IAdvancedSettings {
  /** Whether advanced settings mode is currently active */
  readonly active: boolean;

  /**
   * Initialize the advanced settings with DOM elements
   *
   * Must be called before using other methods.
   * Sets up event handlers and initializes the UI.
   *
   * @param elements - DOM elements required by the controller
   */
  initialize(elements: AdvancedSettingsElements): void;

  /**
   * Show the advanced settings panel
   */
  show(): void;

  /**
   * Hide the advanced settings panel
   */
  hide(): void;

  /**
   * Get the current configuration from form inputs
   *
   * Collects and validates all input values.
   *
   * @returns Current game configuration from the form
   * @throws Error if inputs contain invalid values
   */
  getConfiguration(): GameConfiguration;

  /**
   * Load a preset configuration into the form
   *
   * @param preset - Name of the preset to load
   */
  setPreset(preset: PresetName): void;

  /**
   * Clean up event handlers and resources
   *
   * Should be called when the component is no longer needed.
   */
  destroy(): void;
}
