/**
 * Advanced Settings Component
 *
 * Manages the advanced game settings UI, allowing users to toggle between
 * classic presets and custom configurations.
 *
 * Migrated from Advanced.js with improvements:
 * - Lazy initialization pattern (no auto-init in constructor)
 * - Dependency injection for DOM elements (no direct DOM queries)
 * - Event handler cleanup to prevent memory leaks
 * - Type-safe configuration handling
 * - Integration with gameConfigurations.ts types
 * - Input validation before returning configuration
 */

import {
  configurations,
  validateConfiguration,
  type GameConfiguration,
  type PresetName,
} from '../../config/gameConfigurations';
import type {
  AdvancedSettingsConfig,
  AdvancedSettingsElements,
  IAdvancedSettings,
} from '../../types/settings.types';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<AdvancedSettingsConfig> = {
  defaultPreset: 'classic',
  buttonClassicText: 'Classic',
  buttonAdvancedText: 'Advanced',
};

/**
 * AdvancedSettings class
 *
 * Controls the advanced settings UI panel, preset selection,
 * and configuration value editing.
 */
export class AdvancedSettings implements IAdvancedSettings {
  // Private fields
  #config: Required<AdvancedSettingsConfig>;
  #elements?: AdvancedSettingsElements;
  #active: boolean = false;
  #boundHandlers: Map<string, EventListener> = new Map();

  /**
   * Create a new advanced settings controller
   *
   * @param config - Optional configuration (uses defaults if not provided)
   */
  constructor(config?: AdvancedSettingsConfig) {
    this.#config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get whether advanced settings mode is currently active
   */
  public get active(): boolean {
    return this.#active;
  }

  /**
   * Initialize the advanced settings controller
   *
   * Sets up event handlers and loads the default preset.
   * Must be called before using other methods.
   *
   * @param elements - DOM elements required by the controller
   */
  public initialize(elements: AdvancedSettingsElements): void {
    this.#elements = elements;

    // Load default preset into form
    this.setPreset(this.#config.defaultPreset);

    // Set up event handlers
    this.#setupEventHandlers();
  }

  /**
   * Show the advanced settings panel
   *
   * Makes the panel visible by setting display style to 'block'.
   */
  public show(): void {
    if (!this.#elements) {
      throw new Error('AdvancedSettings not initialized. Call initialize() first.');
    }

    this.#elements.advancedPanel.style.display = 'block';
  }

  /**
   * Hide the advanced settings panel
   *
   * Makes the panel invisible by setting display style to 'none'.
   */
  public hide(): void {
    if (!this.#elements) {
      throw new Error('AdvancedSettings not initialized. Call initialize() first.');
    }

    this.#elements.advancedPanel.style.display = 'none';
  }

  /**
   * Get the current configuration from form inputs
   *
   * Collects all input values, parses them, and validates the result.
   *
   * @returns Current game configuration
   * @throws Error if configuration is invalid or contains NaN values
   */
  public getConfiguration(): GameConfiguration {
    if (!this.#elements) {
      throw new Error('AdvancedSettings not initialized. Call initialize() first.');
    }

    const inputs = this.#elements.inputs;

    // Parse input values
    const maxRounds = parseFloat(inputs.maxRounds.value);
    const size = parseFloat(inputs.size.value);
    const speed = parseFloat(inputs.speed.value);
    const curveSpeed = parseFloat(inputs.curveSpeed.value);
    const holeRate = parseFloat(inputs.holeRate.value);
    const holeRateRnd = parseFloat(inputs.holeRateRnd.value);
    const holeSize = parseFloat(inputs.holeSize.value);
    const holeSizeRnd = parseFloat(inputs.holeSizeRnd.value);

    // Check for NaN values
    if (isNaN(maxRounds)) throw new Error('Invalid value for maxRounds');
    if (isNaN(size)) throw new Error('Invalid value for size');
    if (isNaN(speed)) throw new Error('Invalid value for speed');
    if (isNaN(curveSpeed)) throw new Error('Invalid value for curveSpeed');
    if (isNaN(holeRate)) throw new Error('Invalid value for holeRate');
    if (isNaN(holeRateRnd)) throw new Error('Invalid value for holeRateRnd');
    if (isNaN(holeSize)) throw new Error('Invalid value for holeSize');
    if (isNaN(holeSizeRnd)) throw new Error('Invalid value for holeSizeRnd');

    // Collect configuration
    const config: GameConfiguration = {
      maxRounds,
      size,
      speed,
      curveSpeed,
      holeRate,
      holeRateRnd,
      holeSize,
      holeSizeRnd,
    };

    // Validate configuration (validateConfiguration returns boolean)
    const isValid = validateConfiguration(config);
    if (!isValid) {
      throw new Error('Invalid configuration values (out of valid range)');
    }

    return config;
  }

  /**
   * Load a preset configuration into the form
   *
   * Populates all input fields with values from the specified preset.
   *
   * @param preset - Name of the preset to load
   */
  public setPreset(preset: PresetName): void {
    if (!this.#elements) {
      throw new Error('AdvancedSettings not initialized. Call initialize() first.');
    }

    const config = configurations[preset];
    this.#populateFields(config);
  }

  /**
   * Clean up event handlers and resources
   *
   * Removes all event listeners to prevent memory leaks.
   * Should be called when the component is no longer needed.
   */
  public destroy(): void {
    this.#cleanupEventHandlers();
    this.#elements = undefined;
  }

  /**
   * Set up all event handlers
   *
   * Attaches click handlers to the toggle button and preset buttons.
   */
  #setupEventHandlers(): void {
    if (!this.#elements) return;

    // Advanced/Classic toggle button handler
    const toggleHandler = this.#handleAdvancedButtonClick.bind(this);
    this.#boundHandlers.set('toggleButton', toggleHandler);
    this.#elements.advancedButton.addEventListener('click', toggleHandler);

    // Preset button handlers
    for (const button of this.#elements.presetButtons) {
      const preset = button.getAttribute('data-preset') as PresetName | null;
      if (!preset) continue;

      const handler = () => this.#handlePresetButtonClick(preset);
      this.#boundHandlers.set(`preset-${preset}`, handler);
      button.addEventListener('click', handler);
    }
  }

  /**
   * Clean up all event handlers
   *
   * Removes all attached event listeners.
   */
  #cleanupEventHandlers(): void {
    if (!this.#elements) return;

    // Remove toggle button handler
    const toggleHandler = this.#boundHandlers.get('toggleButton');
    if (toggleHandler) {
      this.#elements.advancedButton.removeEventListener('click', toggleHandler);
    }

    // Remove preset button handlers
    for (const button of this.#elements.presetButtons) {
      const preset = button.getAttribute('data-preset') as PresetName | null;
      if (!preset) continue;

      const handler = this.#boundHandlers.get(`preset-${preset}`);
      if (handler) {
        button.removeEventListener('click', handler);
      }
    }

    this.#boundHandlers.clear();
  }

  /**
   * Handle click on the advanced/classic toggle button
   *
   * Toggles between classic mode (form hidden) and advanced mode (form visible).
   */
  #handleAdvancedButtonClick(): void {
    if (!this.#elements) return;

    if (this.#active) {
      // Switch to classic mode
      this.#active = false;
      this.#elements.classicButton.click();
      this.#elements.advancedButton.innerHTML = this.#config.buttonClassicText;
      this.#elements.advancedButton.className = 'classic';
      this.#elements.form.style.display = 'none';
    } else {
      // Switch to advanced mode
      this.#active = true;
      this.#elements.advancedButton.innerHTML = this.#config.buttonAdvancedText;
      this.#elements.advancedButton.className = '';
      this.#elements.form.style.display = 'block';
    }
  }

  /**
   * Handle click on a preset button
   *
   * Loads the selected preset configuration into the form.
   *
   * @param preset - Name of the preset to load
   */
  #handlePresetButtonClick(preset: PresetName): void {
    this.setPreset(preset);
  }

  /**
   * Populate form fields with configuration values
   *
   * Sets each input element's value to the corresponding configuration value.
   *
   * @param config - Configuration to load into the form
   */
  #populateFields(config: GameConfiguration): void {
    if (!this.#elements) return;

    const inputs = this.#elements.inputs;

    inputs.maxRounds.value = config.maxRounds.toString();
    inputs.size.value = config.size.toString();
    inputs.speed.value = config.speed.toString();
    inputs.curveSpeed.value = config.curveSpeed.toString();
    inputs.holeRate.value = config.holeRate.toString();
    inputs.holeRateRnd.value = config.holeRateRnd.toString();
    inputs.holeSize.value = config.holeSize.toString();
    inputs.holeSizeRnd.value = config.holeSizeRnd.toString();
  }
}

/**
 * Create a new advanced settings controller
 *
 * Factory function for convenient instantiation.
 *
 * @param config - Optional configuration
 * @returns New AdvancedSettings instance
 */
export function createAdvancedSettings(
  config?: AdvancedSettingsConfig
): IAdvancedSettings {
  return new AdvancedSettings(config);
}
