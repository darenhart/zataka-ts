/**
 * Keyboard and Mouse Input Manager
 *
 * Manages keyboard and mouse input state for the game using a polling pattern.
 * Provides a singleton instance that tracks which keys/buttons are currently pressed.
 *
 * This replaces the legacy Keys.js global state with a modern class-based approach
 * while maintaining backward compatibility.
 */

import type {
  KeyName,
  KeyStatus,
  KeyCodesMap,
  IInputManager,
} from '../types/input.types.js';

/**
 * Input Manager Singleton
 *
 * Tracks keyboard and mouse button states for game input.
 * Uses polling pattern - consumers check state during game loop
 * rather than responding to events directly.
 *
 * @example
 * ```typescript
 * const input = KeyboardManager.getInstance();
 * input.initialize(document.getElementById('game'));
 *
 * // In game loop
 * if (input.isKeyPressed('space')) {
 *   startGame();
 * }
 * ```
 */
export class KeyboardManager implements IInputManager {
  private static instance: KeyboardManager;

  /** Current state of all tracked keys */
  private keyStatus: KeyStatus;

  /** Mapping of numeric key codes to key names */
  private readonly keyCodes: KeyCodesMap;

  /** Reference to game element for mouse events */
  private gameElement: HTMLElement | null = null;

  /** Event handler references for cleanup */
  private readonly keydownHandler: (e: KeyboardEvent) => void;
  private readonly keyupHandler: (e: KeyboardEvent) => void;
  private readonly mousedownHandler: (e: MouseEvent) => void;
  private readonly mouseupHandler: (e: MouseEvent) => void;

  /** Whether the manager has been initialized */
  private initialized = false;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Define key code mappings
    this.keyCodes = {
      1: 'mouse1',
      2: 'mouse2',
      32: 'space',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
      17: 'Ctrl',
      16: 'Shift',
      49: '1',
      81: 'q',
      77: 'm',
      78: 'n',
      79: 'o',
      80: 'p',
    };

    // Initialize key status
    this.keyStatus = this.createInitialKeyStatus();

    // Create event handlers (stored as properties for cleanup)
    this.keydownHandler = this.handleKeyDown.bind(this);
    this.keyupHandler = this.handleKeyUp.bind(this);
    this.mousedownHandler = this.handleMouseDown.bind(this);
    this.mouseupHandler = this.handleMouseUp.bind(this);
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): KeyboardManager {
    if (!KeyboardManager.instance) {
      KeyboardManager.instance = new KeyboardManager();
    }
    return KeyboardManager.instance;
  }

  /**
   * Initialize key status with all keys set to false
   */
  private createInitialKeyStatus(): KeyStatus {
    const status = {} as KeyStatus;
    Object.values(this.keyCodes).forEach((keyName) => {
      status[keyName] = false;
    });
    return status;
  }

  /**
   * Initialize the input manager
   *
   * Attaches event listeners to track keyboard and mouse input.
   * Must be called after DOM is ready and game element exists.
   *
   * @param gameElement - The game container element for mouse events
   */
  public initialize(gameElement: HTMLElement): void {
    if (this.initialized) {
      console.warn('KeyboardManager already initialized');
      return;
    }

    this.gameElement = gameElement;
    this.attachEventListeners();

    // Prevent context menu on right-click
    this.gameElement.addEventListener('contextmenu', (e) => e.preventDefault());

    this.initialized = true;
  }

  /**
   * Reset singleton instance for testing purposes
   *
   * WARNING: Only use this in test environments!
   * @internal
   */
  public static resetInstance(): void {
    if (KeyboardManager.instance) {
      KeyboardManager.instance.destroy();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (KeyboardManager as any).instance = undefined;
  }

  /**
   * Attach all event listeners
   */
  private attachEventListeners(): void {
    // Keyboard events on document
    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('keyup', this.keyupHandler);

    // Mouse events on game element
    if (this.gameElement) {
      this.gameElement.addEventListener('mousedown', this.mousedownHandler);
      this.gameElement.addEventListener('mouseup', this.mouseupHandler);
    } else {
      console.error('Game element not found for mouse event listeners');
    }
  }

  /**
   * Handle keydown events
   */
  private handleKeyDown(e: KeyboardEvent): void {
    const keyName = this.keyCodes[e.keyCode];
    if (keyName) {
      e.preventDefault();
      this.keyStatus[keyName] = true;
    }
  }

  /**
   * Handle keyup events
   */
  private handleKeyUp(e: KeyboardEvent): void {
    const keyName = this.keyCodes[e.keyCode];
    if (keyName) {
      e.preventDefault();
      this.keyStatus[keyName] = false;
    }
  }

  /**
   * Handle mousedown events
   */
  private handleMouseDown(e: MouseEvent): void {
    if (e.button === 2) {
      // Right button
      this.keyStatus.mouse2 = true;
      e.preventDefault();
    } else if (e.button === 0) {
      // Left button
      this.keyStatus.mouse1 = true;
    }
  }

  /**
   * Handle mouseup events
   */
  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 2) {
      // Right button
      this.keyStatus.mouse2 = false;
      e.preventDefault();
    } else if (e.button === 0) {
      // Left button
      this.keyStatus.mouse1 = false;
    }
  }

  /**
   * Check if a key is currently pressed
   *
   * @param keyName - Name of the key to check
   * @returns true if the key is currently pressed
   */
  public isKeyPressed(keyName: KeyName): boolean {
    return this.keyStatus[keyName] ?? false;
  }

  /**
   * Reset all key states to unpressed
   *
   * Useful when switching game states or resetting the game.
   */
  public reset(): void {
    Object.keys(this.keyStatus).forEach((key) => {
      this.keyStatus[key as KeyName] = false;
    });
  }

  /**
   * Clean up event listeners and state
   *
   * CRITICAL: Must be called to prevent memory leaks.
   * Call this on page unload or when destroying the game instance.
   */
  public destroy(): void {
    // Remove keyboard event listeners
    document.removeEventListener('keydown', this.keydownHandler);
    document.removeEventListener('keyup', this.keyupHandler);

    // Remove mouse event listeners
    if (this.gameElement) {
      this.gameElement.removeEventListener('mousedown', this.mousedownHandler);
      this.gameElement.removeEventListener('mouseup', this.mouseupHandler);
    }

    // Reset state
    this.reset();
    this.gameElement = null;
    this.initialized = false;
  }

  /**
   * Get readonly copy of key status
   *
   * For backward compatibility with legacy code that accesses KEY_STATUS directly.
   * Prefer using isKeyPressed() for new code.
   *
   * @returns Readonly view of current key status
   */
  public getKeyStatus(): Readonly<KeyStatus> {
    return this.keyStatus;
  }

  /**
   * Get all currently pressed keys
   *
   * @returns Array of key names that are currently pressed
   */
  public getPressedKeys(): KeyName[] {
    return Object.entries(this.keyStatus)
      .filter(([, pressed]) => pressed)
      .map(([key]) => key as KeyName);
  }
}

/**
 * Singleton instance for convenient access
 *
 * @example
 * ```typescript
 * import { keyboardManager } from './KeyboardManager';
 *
 * // Initialize once
 * const gameEl = document.getElementById('game');
 * if (gameEl) {
 *   keyboardManager.initialize(gameEl);
 * }
 *
 * // Use anywhere
 * if (keyboardManager.isKeyPressed('space')) {
 *   // ...
 * }
 * ```
 */
export const keyboardManager = KeyboardManager.getInstance();

/**
 * Legacy export for backward compatibility
 *
 * Provides KEY_STATUS-like object with live state access.
 * Uses Proxy to delegate property access to the underlying KeyboardManager state.
 *
 * @deprecated Use keyboardManager.isKeyPressed() instead
 * @example
 * ```typescript
 * // Legacy code continues to work
 * if (KEY_STATUS.space) {
 *   startGame();
 * }
 * ```
 */
export const KEY_STATUS = new Proxy({} as KeyStatus, {
  get(_, prop: string | symbol): boolean {
    if (typeof prop === 'string') {
      return keyboardManager.isKeyPressed(prop as KeyName);
    }
    return false;
  },
  set(): boolean {
    console.warn('KEY_STATUS is readonly. Use keyboardManager methods instead.');
    return false;
  },
});

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    keyboardManager.destroy();
  });
}

// Hot Module Replacement support (Vite)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    keyboardManager.destroy();
  });
}
