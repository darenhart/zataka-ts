/**
 * Game Controller
 *
 * Main game controller that orchestrates all game systems and manages game state.
 *
 * Migrated from Game function in Game.js with improvements:
 * - Class-based with proper encapsulation
 * - State machine for game flow
 * - Dependency injection for all components
 * - Type-safe configuration
 * - No global dependencies
 * - Canvas layer management
 */

import type {
  GameState,
  CanvasLayers,
  GameDependencies,
  IGame,
  ImageRepository,
  PlayerScore,
} from '../types/game.types';
import type { IBackground } from '../types/game.types';
import type { ISplashScreen } from '../types/game.types';
import type { IEndScreen } from '../types/game.types';
import type { IScoreBoard } from '../types/score.types';
import type { IFpsCounter } from '../types/fps.types';
import type { IPlayerSelector } from '../types/player.types';
import type { IAdvancedSettings } from '../types/settings.types';
import type { IPlayerManager } from '../types/player.types';
import type { IInputManager } from '../types/input.types';

import { GameState as GameStateEnum } from '../types/game.types';
import { createBackground } from '../ui/components/Background';
import { createSplashScreen } from '../ui/screens/SplashScreen';
import { createEndScreen } from '../ui/screens/EndScreen';
import { createScoreBoard } from '../ui/components/ScoreBoard';
import { createFpsCounter } from '../core/FpsCounter';
import { createPlayerSelector } from '../ui/screens/PlayerSelector';
import { createAdvancedSettings } from '../ui/components/AdvancedSettings';
import { createPlayerManager } from '../game/managers/PlayerManager';

/**
 * Game controller configuration
 */
export interface GameConfig {
  /** Image repository with loaded sprites */
  images: ImageRepository;

  /** Input manager for keyboard/mouse */
  inputManager: IInputManager;

  /** Dependencies (container element, etc.) */
  dependencies: GameDependencies;
}

/**
 * Game class
 *
 * Main game controller managing state, components, and game flow.
 */
export class Game implements IGame {
  // Public readonly properties
  public get state(): GameState {
    return this.#state;
  }

  public get started(): boolean {
    return this.#state === GameStateEnum.Playing;
  }

  public get width(): number {
    return this.#width;
  }

  public get height(): number {
    return this.#height;
  }

  // Private state
  #state: GameState = GameStateEnum.Splash;
  #width: number = 0;
  #height: number = 0;

  // Canvas layers
  #layers!: CanvasLayers;

  // Dependencies
  #images: ImageRepository;
  #inputManager: IInputManager;
  #dependencies: GameDependencies;

  // Components
  #background!: IBackground;
  #splash!: ISplashScreen;
  #end!: IEndScreen;
  #scoreBoard!: IScoreBoard;
  #fpsCounter!: IFpsCounter;
  #playerSelector!: IPlayerSelector;
  #advancedSettings!: IAdvancedSettings;
  #playerManager!: IPlayerManager;

  /**
   * Create a new game controller
   *
   * @param config - Game configuration
   */
  constructor(config: GameConfig) {
    this.#images = config.images;
    this.#inputManager = config.inputManager;
    this.#dependencies = config.dependencies;
  }

  /**
   * Initialize the game
   *
   * Sets up canvases, components, and shows splash screen.
   */
  public init(): void {
    // Create canvas layers
    this.#createLayers();

    // Calculate initial size
    this.#calculateSize();

    // Initialize components
    this.#initializeComponents();

    // Show splash screen
    this.showSplashScreen();
  }

  /**
   * Handle window resize
   *
   * Recalculates canvas sizes and redraws current screen.
   */
  public onSizeChange(): void {
    this.#calculateSize();

    // Redraw appropriate screen based on state
    if (this.#state === GameStateEnum.Playing) {
      this.#background.draw(this.#width, this.#height, this.#scoreBoard.width);
      this.#scoreBoard.draw(
        this.#playerManager.pool.map((p) => ({
          name: p.name,
          color: p.color,
          score: p.score,
          dead: p.dead,
        })),
        this.#height
      );
    } else if (this.#state === GameStateEnum.Splash) {
      this.showSplashScreen();
    } else if (this.#state === GameStateEnum.Select) {
      this.#playerSelector.show(
        Array.from(this.#playerManager.playerTemplates),
        this.#width,
        this.#height
      );
    } else if (this.#state === GameStateEnum.End) {
      const scores: PlayerScore[] = this.#playerManager.pool.map((p) => ({
        name: p.name,
        color: p.color,
        score: p.score,
      }));

      this.#end.show(this.#images.end, scores, this.#width, this.#height);
    }
  }

  /**
   * Show splash screen
   *
   * Transitions to splash state.
   */
  public showSplashScreen(): void {
    this.#state = GameStateEnum.Splash;

    // Show cursor
    if (this.#dependencies.onShowCursor) {
      this.#dependencies.onShowCursor();
    }

    // Clear player selector
    this.#playerSelector.clear(
      Array.from(this.#playerManager.playerTemplates),
      this.#width,
      this.#height
    );

    // Show splash
    this.#splash.show(this.#images.splash, this.#width, this.#height);
  }

  /**
   * Show player selection screen
   *
   * Transitions to select state.
   */
  public showSelectScreen(): void {
    this.#state = GameStateEnum.Select;

    // Clear splash
    this.#splash.clear(this.#width, this.#height);

    // Show advanced settings and player selector
    this.#advancedSettings.show();
    this.#playerSelector.show(
      Array.from(this.#playerManager.playerTemplates),
      this.#width,
      this.#height
    );

    // Show GitHub link if provided
    if (this.#dependencies.githubElement) {
      this.#dependencies.githubElement.style.display = 'block';
    }
  }

  /**
   * Start the game
   *
   * Begins a new game with selected players.
   * Transitions to playing state.
   */
  public start(): void {
    this.#state = GameStateEnum.Playing;

    // Hide cursor
    if (this.#dependencies.onHideCursor) {
      this.#dependencies.onHideCursor();
    }

    // Get configuration from advanced settings
    const config = this.#advancedSettings.getConfiguration();

    // Initialize player manager
    this.#playerManager.init({
      maxRounds: config.maxRounds,
      physics: {
        size: config.size,
        speed: config.speed,
        curveSpeed: config.curveSpeed,
        holeRate: config.holeRate,
        holeRateRnd: config.holeRateRnd,
        holeSize: config.holeSize,
        holeSizeRnd: config.holeSizeRnd,
      },
    });

    // Hide advanced settings
    this.#advancedSettings.hide();

    // Clear player selector
    this.#playerSelector.clear(
      Array.from(this.#playerManager.playerTemplates),
      this.#width,
      this.#height
    );

    // Draw scoreboard
    this.#scoreBoard.draw(
      this.#playerManager.pool.map((p) => ({
        name: p.name,
        color: p.color,
        score: p.score,
        dead: p.dead,
      })),
      this.#height
    );

    // Start first round
    this.newRound();

    // Hide GitHub link if provided
    if (this.#dependencies.githubElement) {
      this.#dependencies.githubElement.style.display = 'none';
    }
  }

  /**
   * Start a new round
   *
   * Called at the beginning of each round.
   */
  public newRound(): void {
    this.#playerManager.startRound();
    this.#background.draw(this.#width, this.#height, this.#scoreBoard.width);
  }

  /**
   * End the game
   *
   * Shows end screen with final scores.
   * Transitions to end state.
   */
  public finish(): void {
    this.#state = GameStateEnum.End;

    // Show cursor
    if (this.#dependencies.onShowCursor) {
      this.#dependencies.onShowCursor();
    }

    // Clear background and scoreboard
    this.#background.clear(this.#width, this.#height);
    this.#scoreBoard.clear();

    // Show end screen
    const scores: PlayerScore[] = this.#playerManager.pool.map((p) => ({
      name: p.name,
      color: p.color,
      score: p.score,
    }));

    this.#end.show(this.#images.end, scores, this.#width, this.#height);
  }

  /**
   * Main animation loop tick
   *
   * Should be called once per frame.
   * Delegates to appropriate screen/state handler.
   */
  public animate(): void {
    // Update FPS counter
    this.#fpsCounter.update();

    // Handle state-specific logic
    if (this.#state === GameStateEnum.Playing) {
      this.#playerManager.animate();

      // Update scoreboard when player dies
      this.#scoreBoard.draw(
        this.#playerManager.pool.map((p) => ({
          name: p.name,
          color: p.color,
          score: p.score,
          dead: p.dead,
        })),
        this.#height
      );
    } else if (this.#state === GameStateEnum.Splash) {
      this.#splash.listen(() => {
        this.showSelectScreen();
      });
    } else if (this.#state === GameStateEnum.Select) {
      this.#playerSelector.listen(
        Array.from(this.#playerManager.playerTemplates),
        this.#images,
        this.#width,
        this.#height,
        () => {
          this.start();
        }
      );
    } else if (this.#state === GameStateEnum.End) {
      this.#end.listen(() => {
        this.showSelectScreen();
      });
    }
  }

  /**
   * Create canvas layers
   *
   * Creates or retrieves canvas elements for each layer.
   */
  #createLayers(): void {
    const layerNames = ['main', 'texts', 'screens', 'score'] as const;

    this.#layers = {} as CanvasLayers;

    for (const name of layerNames) {
      // Try to get existing canvas
      let element = document.getElementById(name) as HTMLCanvasElement | null;

      // Create if doesn't exist
      if (!element) {
        element = document.createElement('canvas');
        element.id = name;
        this.#dependencies.container.appendChild(element);
      }

      // Get 2D context
      const context = element.getContext('2d');
      if (!context) {
        throw new Error(`Failed to get 2D context for canvas: ${name}`);
      }

      // Store layer
      this.#layers[name] = { element, context };
    }
  }

  /**
   * Calculate canvas sizes
   *
   * Sets canvas dimensions based on window size.
   */
  #calculateSize(): void {
    this.#width = window.innerWidth;
    this.#height = window.innerHeight;

    // Set all canvas sizes
    for (const layer of Object.values(this.#layers)) {
      layer.element.width = this.#width;
      layer.element.height = this.#height;
    }

    // Position score canvas
    this.#layers.score.element.style.left = `${
      this.#width - this.#scoreBoard.width
    }px`;
    this.#layers.score.element.width = this.#scoreBoard.width;
  }

  /**
   * Initialize all game components
   *
   * Creates instances of all game systems with proper dependencies.
   */
  #initializeComponents(): void {
    // Create FPS counter (needed by player manager)
    this.#fpsCounter = createFpsCounter(this.#layers.texts.context);

    // Create dimensions object for player manager
    const dimensions = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      },
      get scoreWidth() {
        return 150; // ScoreBoard default width
      },
    };

    // Create player dependencies
    const playerDependencies = {
      context: this.#layers.main.context,
      inputManager: this.#inputManager,
      fpsProvider: this.#fpsCounter,
      dimensions,
    };

    // Create player manager with callbacks
    this.#playerManager = createPlayerManager({
      context: this.#layers.main.context,
      playerDependencies,
      onNewRound: () => {
        this.newRound();
      },
      onFinish: () => {
        this.finish();
      },
    });

    // Create scoreboard
    this.#scoreBoard = createScoreBoard(this.#layers.score.context);

    // Create background
    this.#background = createBackground(this.#layers.main.context);

    // Create splash screen
    this.#splash = createSplashScreen(
      this.#layers.screens.context,
      this.#inputManager
    );

    // Create end screen
    this.#end = createEndScreen(
      this.#layers.screens.context,
      this.#inputManager
    );

    // Create player selector
    this.#playerSelector = createPlayerSelector(
      this.#layers.screens.context,
      this.#inputManager
    );

    // Create advanced settings (needs DOM elements)
    this.#advancedSettings = createAdvancedSettings();

    // Initialize advanced settings with DOM elements
    // Note: This requires DOM elements to exist
    const advancedPanel = document.getElementById('advanced');
    const advancedButton = document.getElementById(
      'advanced-button'
    ) as HTMLButtonElement;
    const advancedForm = document.getElementById('advanced-form');
    const classicButton = document.querySelector(
      '[data-preset="classic"]'
    ) as HTMLButtonElement;
    const presetButtons = Array.from(
      document.querySelectorAll('[data-preset]')
    ) as HTMLButtonElement[];

    if (
      advancedPanel &&
      advancedButton &&
      advancedForm &&
      classicButton &&
      presetButtons.length > 0
    ) {
      this.#advancedSettings.initialize({
        advancedPanel: advancedPanel as HTMLElement,
        advancedButton,
        form: advancedForm as HTMLElement,
        classicButton,
        presetButtons,
        inputs: {
          maxRounds: document.getElementById('maxRounds') as HTMLInputElement,
          size: document.getElementById('size') as HTMLInputElement,
          speed: document.getElementById('speed') as HTMLInputElement,
          curveSpeed: document.getElementById('curveSpeed') as HTMLInputElement,
          holeRate: document.getElementById('holeRate') as HTMLInputElement,
          holeRateRnd: document.getElementById(
            'holeRateRnd'
          ) as HTMLInputElement,
          holeSize: document.getElementById('holeSize') as HTMLInputElement,
          holeSizeRnd: document.getElementById(
            'holeSizeRnd'
          ) as HTMLInputElement,
        },
      });
    }
  }
}

/**
 * Create a new game controller
 *
 * Factory function for convenient instantiation.
 *
 * @param config - Game configuration
 * @returns New Game instance
 */
export function createGame(config: GameConfig): IGame {
  return new Game(config);
}
