/**
 * Game Controller Type Definitions
 *
 * Type definitions for the main game controller, screens, and state management.
 */

import type { PlayerName } from './player.types';

/**
 * Game state enumeration
 */
export enum GameState {
  /** Showing splash screen */
  Splash = 'splash',

  /** Player selection screen */
  Select = 'select',

  /** Game in progress */
  Playing = 'playing',

  /** Game ended, showing final scores */
  End = 'end',
}

/**
 * Canvas layer definition
 */
export interface CanvasLayer {
  /** Canvas element */
  element: HTMLCanvasElement;

  /** 2D rendering context */
  context: CanvasRenderingContext2D;
}

/**
 * All canvas layers used by the game
 */
export interface CanvasLayers {
  /** Main game canvas (player trails) */
  main: CanvasLayer;

  /** Text overlay canvas (FPS counter) */
  texts: CanvasLayer;

  /** Screens canvas (splash, select, end) */
  screens: CanvasLayer;

  /** Scoreboard canvas */
  score: CanvasLayer;
}

/**
 * Image repository with all game sprites
 */
export interface ImageRepository {
  /** Splash screen image */
  splash: HTMLImageElement;

  /** End game image */
  end: HTMLImageElement;

  /** Red player sprite */
  red: HTMLImageElement;

  /** Yellow player sprite */
  yellow: HTMLImageElement;

  /** Orange player sprite */
  orange: HTMLImageElement;

  /** Green player sprite */
  green: HTMLImageElement;

  /** Pink player sprite */
  pink: HTMLImageElement;

  /** Blue player sprite */
  blue: HTMLImageElement;
}

/**
 * Configuration for image loading
 */
export interface ImageLoaderConfig {
  /** Image source paths keyed by name */
  images: Record<string, string>;

  /** Callback when all images are loaded */
  onComplete: () => void;
}

/**
 * Interface for image loader implementations
 */
export interface IImageLoader {
  /** Image repository (available after loading) */
  readonly images: Partial<ImageRepository>;

  /** Whether all images have loaded */
  readonly loaded: boolean;

  /** Number of images loaded so far */
  readonly loadedCount: number;

  /** Total number of images to load */
  readonly totalCount: number;
}

/**
 * Configuration for Background component
 */
export interface BackgroundConfig {
  /** Border width in pixels (default: 10) */
  borderWidth?: number;

  /** Border color (default: '#CCCC55') */
  borderColor?: string;
}

/**
 * Interface for background implementations
 */
export interface IBackground {
  /**
   * Draw the game boundary
   *
   * @param gameWidth - Total game width
   * @param gameHeight - Total game height
   * @param scoreWidth - Width of scoreboard (excluded from play area)
   */
  draw(gameWidth: number, gameHeight: number, scoreWidth: number): void;

  /**
   * Clear the background canvas
   *
   * @param gameWidth - Total game width
   * @param gameHeight - Total game height
   */
  clear(gameWidth: number, gameHeight: number): void;
}

/**
 * Configuration for SplashScreen component
 */
export interface SplashScreenConfig {
  /** Auto-dismiss timeout in frames (default: 100) */
  timeout?: number;
}

/**
 * Interface for splash screen implementations
 */
export interface ISplashScreen {
  /** Whether splash screen is currently active */
  readonly active: boolean;

  /**
   * Show the splash screen
   *
   * @param image - Splash screen image
   * @param gameWidth - Current game width
   * @param gameHeight - Current game height
   */
  show(image: HTMLImageElement, gameWidth: number, gameHeight: number): void;

  /**
   * Listen for user input to dismiss
   *
   * Called each frame while splash is active.
   *
   * @param onDismiss - Callback when user dismisses or timeout expires
   */
  listen(onDismiss: () => void): void;

  /**
   * Clear and hide the splash screen
   *
   * @param gameWidth - Current game width
   * @param gameHeight - Current game height
   */
  clear(gameWidth: number, gameHeight: number): void;
}

/**
 * Player score data for end screen
 */
export interface PlayerScore {
  /** Player name */
  name: PlayerName;

  /** Player color */
  color: string;

  /** Final score */
  score: number;
}

/**
 * Configuration for EndScreen component
 */
export interface EndScreenConfig {
  /** Wait time before allowing input (frames, default: 100) */
  waitTime?: number;

  /** Font size for scores (default: 30) */
  fontSize?: number;

  /** Font family (default: 'Sans-Serif') */
  fontFamily?: string;

  /** Font weight (default: 'bold') */
  fontWeight?: string;
}

/**
 * Interface for end screen implementations
 */
export interface IEndScreen {
  /** Whether end screen is currently active */
  readonly active: boolean;

  /**
   * Show the end game screen with final scores
   *
   * @param image - End game image
   * @param scores - Player scores to display
   * @param gameWidth - Current game width
   * @param gameHeight - Current game height
   */
  show(
    image: HTMLImageElement,
    scores: PlayerScore[],
    gameWidth: number,
    gameHeight: number
  ): void;

  /**
   * Listen for user input to return to select screen
   *
   * Called each frame while end screen is active.
   *
   * @param onDismiss - Callback when user presses space
   */
  listen(onDismiss: () => void): void;

  /**
   * Clear and hide the end screen
   *
   * @param gameWidth - Current game width
   * @param gameHeight - Current game height
   */
  clear(gameWidth: number, gameHeight: number): void;
}

/**
 * Dependencies required by Game controller
 */
export interface GameDependencies {
  /** Container element for canvases */
  container: HTMLElement;

  /** Optional GitHub link element to show/hide */
  githubElement?: HTMLElement;

  /** Callback when window should show cursor */
  onShowCursor?: () => void;

  /** Callback when window should hide cursor */
  onHideCursor?: () => void;
}

/**
 * Interface for game controller implementations
 */
export interface IGame {
  /** Current game state */
  readonly state: GameState;

  /** Whether game is started (playing) */
  readonly started: boolean;

  /** Current game width in pixels */
  readonly width: number;

  /** Current game height in pixels */
  readonly height: number;

  /**
   * Initialize the game
   *
   * Sets up canvases, components, and shows splash screen.
   */
  init(): void;

  /**
   * Handle window resize
   *
   * Recalculates canvas sizes and redraws current screen.
   */
  onSizeChange(): void;

  /**
   * Show splash screen
   *
   * Transitions to splash state.
   */
  showSplashScreen(): void;

  /**
   * Show player selection screen
   *
   * Transitions to select state.
   */
  showSelectScreen(): void;

  /**
   * Start the game
   *
   * Begins a new game with selected players.
   * Transitions to playing state.
   */
  start(): void;

  /**
   * Start a new round
   *
   * Called at the beginning of each round.
   */
  newRound(): void;

  /**
   * End the game
   *
   * Shows end screen with final scores.
   * Transitions to end state.
   */
  finish(): void;

  /**
   * Main animation loop tick
   *
   * Should be called once per frame.
   * Delegates to appropriate screen/state handler.
   */
  animate(): void;
}
