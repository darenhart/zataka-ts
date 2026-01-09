/**
 * Input System Type Definitions
 *
 * Types for keyboard and mouse input management
 */

/**
 * All possible key names that can be tracked
 */
export type KeyName =
  | 'mouse1'
  | 'mouse2'
  | 'space'
  | 'left'
  | 'up'
  | 'right'
  | 'down'
  | 'Ctrl'
  | 'Shift'
  | '1'
  | 'q'
  | 'm'
  | 'n'
  | 'o'
  | 'p';

/**
 * Numeric key codes mapped to key names
 */
export type KeyCode = number;

/**
 * Runtime state tracking for all keys
 */
export type KeyStatus = Record<KeyName, boolean>;

/**
 * Mapping of key codes to key names
 */
export type KeyCodesMap = Record<KeyCode, KeyName>;

/**
 * Interface for input manager implementations
 */
export interface IInputManager {
  /**
   * Initialize the input system with a game element
   */
  initialize(gameElement: HTMLElement): void;

  /**
   * Check if a specific key is currently pressed
   */
  isKeyPressed(keyName: KeyName): boolean;

  /**
   * Reset all key states to unpressed
   */
  reset(): void;

  /**
   * Clean up event listeners and state
   */
  destroy(): void;

  /**
   * Get readonly copy of key status (for backward compatibility)
   */
  getKeyStatus(): Readonly<KeyStatus>;
}
