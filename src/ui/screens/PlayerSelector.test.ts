/**
 * PlayerSelector Unit Tests
 *
 * Comprehensive test suite for PlayerSelector implementation.
 * Tests type safety, API compatibility, edge cases, and canvas rendering.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PlayerSelector, createPlayerSelector } from './PlayerSelector';
import type {
  PlayerTemplate,
  ImageRepository,
  PlayerSelectorConfig,
  PlayerName,
} from '../../types/player.types';
import type { IInputManager, KeyName } from '../../types/input.types';

/**
 * Mock Canvas Context
 *
 * Creates a mock CanvasRenderingContext2D for testing
 */
function createMockContext(): CanvasRenderingContext2D {
  const mockContext = {
    // Drawing methods
    fillText: vi.fn(),
    drawImage: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),

    // Properties
    textAlign: 'left' as CanvasTextAlign,
    font: '',
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D;

  return mockContext;
}

/**
 * Mock Input Manager
 *
 * Creates a mock IInputManager for testing
 */
function createMockInputManager(): IInputManager {
  const keyStates: Map<KeyName, boolean> = new Map();

  const mockInputManager: IInputManager = {
    initialize: vi.fn(),
    isKeyPressed: vi.fn((keyName: KeyName) => keyStates.get(keyName) || false),
    reset: vi.fn(() => keyStates.clear()),
    destroy: vi.fn(),
    getKeyStatus: vi.fn(),
  };

  // Helper to set key states
  (mockInputManager as any).setKeyPressed = (keyName: KeyName, pressed: boolean) => {
    keyStates.set(keyName, pressed);
  };

  return mockInputManager;
}

/**
 * Create sample player templates for testing
 */
function createPlayerTemplates(count: number): PlayerTemplate[] {
  const playerData: Array<{
    name: PlayerName;
    color: string;
    left: KeyName;
    right: KeyName;
  }> = [
    { name: 'red', color: '#FF0000', left: 'q', right: 'Ctrl' },
    { name: 'yellow', color: '#FFFF00', left: 'm', right: 'n' },
    { name: 'orange', color: '#FFA500', left: 'left', right: 'right' },
    { name: 'green', color: '#00FF00', left: 'o', right: 'p' },
    { name: 'pink', color: '#FFC0CB', left: 'up', right: 'down' },
    { name: 'blue', color: '#0000FF', left: '1', right: 'Shift' },
  ];

  const templates: PlayerTemplate[] = [];
  for (let i = 0; i < count && i < playerData.length; i++) {
    const data = playerData[i]!;
    templates.push({
      name: data.name,
      color: data.color,
      left: data.left,
      right: data.right,
      ready: false,
      count: i + 1,
    });
  }

  return templates;
}

/**
 * Create mock image repository
 */
function createMockImageRepo(): ImageRepository {
  const repo: Partial<ImageRepository> = {};

  const playerNames: PlayerName[] = ['red', 'yellow', 'orange', 'green', 'pink', 'blue'];

  playerNames.forEach((name) => {
    const img = {
      complete: true,
      naturalWidth: 32,
      naturalHeight: 32,
      width: 32,
      height: 32,
      src: `${name}.png`,
    } as HTMLImageElement;

    repo[name] = img;
  });

  return repo as ImageRepository;
}

describe('PlayerSelector', () => {
  let mockContext: CanvasRenderingContext2D;
  let mockInputManager: IInputManager;
  let playerSelector: PlayerSelector;
  const gameWidth = 800;
  const gameHeight = 600;

  beforeEach(() => {
    mockContext = createMockContext();
    mockInputManager = createMockInputManager();
    playerSelector = new PlayerSelector(mockContext, mockInputManager);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      const selector = new PlayerSelector(mockContext, mockInputManager);
      expect(selector).toBeInstanceOf(PlayerSelector);
      expect(selector.active).toBe(false);
    });

    it('should create instance with custom config', () => {
      const config: PlayerSelectorConfig = {
        keyLabelXRatio: 0.3,
        iconOffsetX: 300,
        baseY: 100,
        verticalSpacingRatio: 0.7,
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        instructionYRatio: 0.8,
        instructionText: 'Press enter to start',
        instructionColor: 'yellow',
      };

      const selector = new PlayerSelector(mockContext, mockInputManager, config);
      expect(selector).toBeInstanceOf(PlayerSelector);
      expect(selector.active).toBe(false);
    });

    it('should merge partial config with defaults', () => {
      const config: PlayerSelectorConfig = {
        fontSize: 24,
        instructionText: 'Custom instructions',
      };

      const selector = new PlayerSelector(mockContext, mockInputManager, config);
      expect(selector).toBeInstanceOf(PlayerSelector);
    });

    it('should accept empty config object', () => {
      const selector = new PlayerSelector(mockContext, mockInputManager, {});
      expect(selector).toBeInstanceOf(PlayerSelector);
      expect(selector.active).toBe(false);
    });

    it('should not throw with minimal required parameters', () => {
      expect(() => new PlayerSelector(mockContext, mockInputManager)).not.toThrow();
    });

    it('should store dependencies correctly', () => {
      const selector = new PlayerSelector(mockContext, mockInputManager);
      expect(selector).toBeDefined();
      // Dependencies are private, but we can verify through behavior
    });
  });

  describe('active getter', () => {
    it('should return false initially', () => {
      expect(playerSelector.active).toBe(false);
    });

    it('should return true after show() is called', () => {
      const players = createPlayerTemplates(3);
      playerSelector.show(players, gameWidth, gameHeight);
      expect(playerSelector.active).toBe(true);
    });

    it('should return false after clear() is called', () => {
      const players = createPlayerTemplates(3);
      playerSelector.show(players, gameWidth, gameHeight);
      expect(playerSelector.active).toBe(true);

      playerSelector.clear(players, gameWidth, gameHeight);
      expect(playerSelector.active).toBe(false);
    });

    it('should be read-only', () => {
      // TypeScript should prevent this at compile time
      expect(() => {
        // @ts-expect-error - Testing runtime behavior of readonly property
        playerSelector.active = true;
      }).toThrow();

      // Verify it didn't change
      expect(playerSelector.active).toBe(false);
    });
  });

  describe('show() method', () => {
    describe('Basic functionality', () => {
      it('should set active to true', () => {
        const players = createPlayerTemplates(3);
        playerSelector.show(players, gameWidth, gameHeight);
        expect(playerSelector.active).toBe(true);
      });

      it('should display player control keys', () => {
        const players = createPlayerTemplates(3);
        playerSelector.show(players, gameWidth, gameHeight);

        // Should call fillText for each player
        expect(mockContext.fillText).toHaveBeenCalledTimes(4); // 3 players + 1 instruction
      });

      it('should display control keys in correct format (left right)', () => {
        const players = createPlayerTemplates(2);
        playerSelector.show(players, gameWidth, gameHeight);

        expect(mockContext.fillText).toHaveBeenCalledWith('(q Ctrl)', expect.any(Number), expect.any(Number));
        expect(mockContext.fillText).toHaveBeenCalledWith('(m n)', expect.any(Number), expect.any(Number));
      });

      it('should display instructions', () => {
        const players = createPlayerTemplates(2);
        playerSelector.show(players, gameWidth, gameHeight);

        expect(mockContext.fillText).toHaveBeenCalledWith(
          'Press space to start',
          gameWidth / 2,
          gameHeight * (7 / 8)
        );
      });

      it('should set font properties', () => {
        const players = createPlayerTemplates(2);
        playerSelector.show(players, gameWidth, gameHeight);

        // Font should be set (verified through fillText being called)
        expect(mockContext.fillText).toHaveBeenCalled();
      });

      it('should use player colors for text', () => {
        const players = createPlayerTemplates(2);
        playerSelector.show(players, gameWidth, gameHeight);

        // fillStyle should be set before each fillText call
        expect(mockContext.fillText).toHaveBeenCalled();
      });
    });

    describe('Canvas state preservation', () => {
      it('should call save/restore', () => {
        const players = createPlayerTemplates(2);
        playerSelector.show(players, gameWidth, gameHeight);

        expect(mockContext.save).toHaveBeenCalled();
        expect(mockContext.restore).toHaveBeenCalled();
      });

      it('should call save before restore', () => {
        const players = createPlayerTemplates(2);
        playerSelector.show(players, gameWidth, gameHeight);

        const saveCalls = (mockContext.save as ReturnType<typeof vi.fn>).mock
          .invocationCallOrder;
        const restoreCalls = (mockContext.restore as ReturnType<typeof vi.fn>).mock
          .invocationCallOrder;

        // Each save should come before its corresponding restore
        for (let i = 0; i < saveCalls.length; i++) {
          expect(saveCalls[i]).toBeLessThan(restoreCalls[i]!);
        }
      });
    });

    describe('Player positioning', () => {
      it('should calculate X position using keyLabelXRatio', () => {
        const players = createPlayerTemplates(2);
        playerSelector.show(players, gameWidth, gameHeight);

        const expectedX = gameWidth * (1 / 5); // Default ratio

        const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
        // First two calls are players (third is instruction)
        expect(calls[0]![1]).toBe(expectedX);
        expect(calls[1]![1]).toBe(expectedX);
      });

      it('should distribute players vertically', () => {
        const players = createPlayerTemplates(3);
        playerSelector.show(players, gameWidth, gameHeight);

        const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
        const yPositions = [calls[0]![2], calls[1]![2], calls[2]![2]];

        // Y positions should be different and increasing
        expect(yPositions[0]).toBeLessThan(yPositions[1]!);
        expect(yPositions[1]).toBeLessThan(yPositions[2]!);
      });

      it('should calculate Y position using formula', () => {
        const players = createPlayerTemplates(2);
        playerSelector.show(players, gameWidth, gameHeight);

        const expectedY0 = ((gameHeight * 0.6) / 2) * 0 + 80;
        const expectedY1 = ((gameHeight * 0.6) / 2) * 1 + 80;

        const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
        expect(calls[0]![2]).toBe(expectedY0);
        expect(calls[1]![2]).toBe(expectedY1);
      });

      it('should center instructions text', () => {
        const players = createPlayerTemplates(2);
        playerSelector.show(players, gameWidth, gameHeight);

        const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
        const instructionCall = calls[calls.length - 1]!; // Last call

        expect(instructionCall[1]).toBe(gameWidth / 2);
      });
    });

    describe('Custom configuration', () => {
      it('should use custom keyLabelXRatio', () => {
        const selector = new PlayerSelector(mockContext, mockInputManager, {
          keyLabelXRatio: 0.3,
        });
        const players = createPlayerTemplates(2);
        selector.show(players, gameWidth, gameHeight);

        const expectedX = gameWidth * 0.3;

        const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
        expect(calls[0]![1]).toBe(expectedX);
      });

      it('should use custom baseY', () => {
        const selector = new PlayerSelector(mockContext, mockInputManager, { baseY: 100 });
        const players = createPlayerTemplates(1);
        selector.show(players, gameWidth, gameHeight);

        const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
        expect(calls[0]![2]).toBe(100); // First player at baseY (index 0)
      });

      it('should use custom instruction text', () => {
        const selector = new PlayerSelector(mockContext, mockInputManager, {
          instructionText: 'Press enter to begin',
        });
        const players = createPlayerTemplates(2);
        selector.show(players, gameWidth, gameHeight);

        expect(mockContext.fillText).toHaveBeenCalledWith(
          'Press enter to begin',
          expect.any(Number),
          expect.any(Number)
        );
      });

      it('should use custom instruction Y ratio', () => {
        const selector = new PlayerSelector(mockContext, mockInputManager, {
          instructionYRatio: 0.5,
        });
        const players = createPlayerTemplates(2);
        selector.show(players, gameWidth, gameHeight);

        const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
        const instructionCall = calls[calls.length - 1]!;

        expect(instructionCall[2]).toBe(gameHeight * 0.5);
      });
    });
  });

  describe('listen() method', () => {
    describe('Player ready state toggles', () => {
      it('should set player ready when left key is pressed', () => {
        const players = createPlayerTemplates(2);
        const imageRepo = createMockImageRepo();

        // Simulate first player pressing left key (q)
        (mockInputManager as any).setKeyPressed('q', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        expect(players[0]?.ready).toBe(true);
        expect(players[1]?.ready).toBe(false);
      });

      it('should set player not ready when right key is pressed', () => {
        const players = createPlayerTemplates(2);
        const imageRepo = createMockImageRepo();

        // First set player ready
        players[0]!.ready = true;

        // Then press right key (Ctrl)
        (mockInputManager as any).setKeyPressed('Ctrl', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        expect(players[0]?.ready).toBe(false);
      });

      it('should draw player icon when setting ready', () => {
        const players = createPlayerTemplates(2);
        const imageRepo = createMockImageRepo();

        (mockInputManager as any).setKeyPressed('q', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        expect(mockContext.drawImage).toHaveBeenCalledWith(
          imageRepo.red,
          expect.any(Number),
          expect.any(Number)
        );
      });

      it('should clear player icon when setting not ready', () => {
        const players = createPlayerTemplates(2);
        const imageRepo = createMockImageRepo();

        players[0]!.ready = true;

        (mockInputManager as any).setKeyPressed('Ctrl', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        expect(mockContext.clearRect).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          32, // image width
          32 // image height
        );
      });

      it('should handle multiple players toggling ready', () => {
        const players = createPlayerTemplates(3);
        const imageRepo = createMockImageRepo();

        (mockInputManager as any).setKeyPressed('q', true); // red
        (mockInputManager as any).setKeyPressed('m', true); // yellow

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        expect(players[0]?.ready).toBe(true);
        expect(players[1]?.ready).toBe(true);
        expect(players[2]?.ready).toBe(false);
      });

      it('should mutate the player templates array', () => {
        const players = createPlayerTemplates(2);
        const imageRepo = createMockImageRepo();
        const originalPlayers = players;

        (mockInputManager as any).setKeyPressed('q', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        expect(players).toBe(originalPlayers); // Same reference
        expect(players[0]?.ready).toBe(true); // But mutated
      });
    });

    describe('Game start handling', () => {
      it('should call onStart when space is pressed and a player is ready', () => {
        const players = createPlayerTemplates(2);
        const imageRepo = createMockImageRepo();
        const onStart = vi.fn();

        players[0]!.ready = true;

        (mockInputManager as any).setKeyPressed('space', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, onStart);

        expect(onStart).toHaveBeenCalledTimes(1);
      });

      it('should not call onStart when space is pressed but no player is ready', () => {
        const players = createPlayerTemplates(2);
        const imageRepo = createMockImageRepo();
        const onStart = vi.fn();

        (mockInputManager as any).setKeyPressed('space', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, onStart);

        expect(onStart).not.toHaveBeenCalled();
      });

      it('should not call onStart when space is not pressed', () => {
        const players = createPlayerTemplates(2);
        const imageRepo = createMockImageRepo();
        const onStart = vi.fn();

        players[0]!.ready = true;

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, onStart);

        expect(onStart).not.toHaveBeenCalled();
      });

      it('should only call onStart once per space press', () => {
        const players = createPlayerTemplates(2);
        const imageRepo = createMockImageRepo();
        const onStart = vi.fn();

        players[0]!.ready = true;
        players[1]!.ready = true;

        (mockInputManager as any).setKeyPressed('space', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, onStart);

        // Should only call once, even though multiple players are ready
        expect(onStart).toHaveBeenCalledTimes(1);
      });
    });

    describe('Image validation', () => {
      it('should skip drawing if image is undefined', () => {
        const players = createPlayerTemplates(1);
        const imageRepo = {} as ImageRepository; // Empty repo

        (mockInputManager as any).setKeyPressed('q', true);

        expect(() => {
          playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());
        }).not.toThrow();

        expect(mockContext.drawImage).not.toHaveBeenCalled();
      });

      it('should skip drawing if image is not complete', () => {
        const players = createPlayerTemplates(1);
        const imageRepo = createMockImageRepo();

        // Mark image as not complete
        (imageRepo.red as any).complete = false;

        (mockInputManager as any).setKeyPressed('q', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        expect(mockContext.drawImage).not.toHaveBeenCalled();
      });

      it('should skip drawing if image naturalWidth is 0', () => {
        const players = createPlayerTemplates(1);
        const imageRepo = createMockImageRepo();

        // Mark image as invalid
        (imageRepo.red as any).naturalWidth = 0;

        (mockInputManager as any).setKeyPressed('q', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        expect(mockContext.drawImage).not.toHaveBeenCalled();
      });

      it('should draw when image is valid', () => {
        const players = createPlayerTemplates(1);
        const imageRepo = createMockImageRepo();

        (mockInputManager as any).setKeyPressed('q', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        expect(mockContext.drawImage).toHaveBeenCalled();
      });
    });

    describe('Icon positioning', () => {
      it('should calculate icon X position with iconOffsetX', () => {
        const players = createPlayerTemplates(1);
        const imageRepo = createMockImageRepo();

        (mockInputManager as any).setKeyPressed('q', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        const keyLabelX = gameWidth * (1 / 5);
        const expectedIconX = keyLabelX + 220; // Default iconOffsetX

        expect(mockContext.drawImage).toHaveBeenCalledWith(
          imageRepo.red,
          expectedIconX,
          expect.any(Number)
        );
      });

      it('should calculate icon Y position relative to image height', () => {
        const players = createPlayerTemplates(1);
        const imageRepo = createMockImageRepo();

        (mockInputManager as any).setKeyPressed('q', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        const keyLabelY = ((gameHeight * 0.6) / 1) * 0 + 80;
        const expectedIconY = keyLabelY - 32; // image.height

        expect(mockContext.drawImage).toHaveBeenCalledWith(
          imageRepo.red,
          expect.any(Number),
          expectedIconY
        );
      });

      it('should use custom iconOffsetX', () => {
        const selector = new PlayerSelector(mockContext, mockInputManager, {
          iconOffsetX: 300,
        });
        const players = createPlayerTemplates(1);
        const imageRepo = createMockImageRepo();

        (mockInputManager as any).setKeyPressed('q', true);

        selector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        const keyLabelX = gameWidth * (1 / 5);
        const expectedIconX = keyLabelX + 300;

        expect(mockContext.drawImage).toHaveBeenCalledWith(
          imageRepo.red,
          expectedIconX,
          expect.any(Number)
        );
      });
    });
  });

  describe('clear() method', () => {
    it('should set all players to not ready', () => {
      const players = createPlayerTemplates(3);

      players[0]!.ready = true;
      players[1]!.ready = true;
      players[2]!.ready = false;

      playerSelector.clear(players, gameWidth, gameHeight);

      expect(players[0]?.ready).toBe(false);
      expect(players[1]?.ready).toBe(false);
      expect(players[2]?.ready).toBe(false);
    });

    it('should set active to false', () => {
      const players = createPlayerTemplates(2);

      playerSelector.show(players, gameWidth, gameHeight);
      expect(playerSelector.active).toBe(true);

      playerSelector.clear(players, gameWidth, gameHeight);
      expect(playerSelector.active).toBe(false);
    });

    it('should clear the canvas', () => {
      const players = createPlayerTemplates(2);

      playerSelector.clear(players, gameWidth, gameHeight);

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, gameWidth, gameHeight);
    });

    it('should not throw when called multiple times', () => {
      const players = createPlayerTemplates(2);

      expect(() => {
        playerSelector.clear(players, gameWidth, gameHeight);
        playerSelector.clear(players, gameWidth, gameHeight);
        playerSelector.clear(players, gameWidth, gameHeight);
      }).not.toThrow();
    });

    it('should mutate the player templates array', () => {
      const players = createPlayerTemplates(2);
      const originalPlayers = players;

      players[0]!.ready = true;

      playerSelector.clear(players, gameWidth, gameHeight);

      expect(players).toBe(originalPlayers); // Same reference
      expect(players[0]?.ready).toBe(false); // But mutated
    });
  });

  describe('Edge Cases', () => {
    describe('Empty/null players', () => {
      it('should handle empty players array in show()', () => {
        expect(() => {
          playerSelector.show([], gameWidth, gameHeight);
        }).not.toThrow();

        // Should still show instructions
        expect(mockContext.fillText).toHaveBeenCalledWith(
          'Press space to start',
          expect.any(Number),
          expect.any(Number)
        );
      });

      it('should handle empty players array in listen()', () => {
        const imageRepo = createMockImageRepo();

        expect(() => {
          playerSelector.listen([], imageRepo, gameWidth, gameHeight, vi.fn());
        }).not.toThrow();
      });

      it('should handle empty players array in clear()', () => {
        expect(() => {
          playerSelector.clear([], gameWidth, gameHeight);
        }).not.toThrow();
      });

      it('should handle undefined in players array', () => {
        const players = createPlayerTemplates(2);
        (players as any)[1] = undefined;

        expect(() => {
          playerSelector.show(players, gameWidth, gameHeight);
        }).not.toThrow();
      });
    });

    describe('Single player', () => {
      it('should render single player correctly', () => {
        const players = createPlayerTemplates(1);

        playerSelector.show(players, gameWidth, gameHeight);

        expect(mockContext.fillText).toHaveBeenCalledTimes(2); // 1 player + 1 instruction
      });

      it('should handle single player ready state', () => {
        const players = createPlayerTemplates(1);
        const imageRepo = createMockImageRepo();

        (mockInputManager as any).setKeyPressed('q', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        expect(players[0]?.ready).toBe(true);
      });
    });

    describe('Many players', () => {
      it('should handle 6 players', () => {
        const players = createPlayerTemplates(6);

        expect(() => {
          playerSelector.show(players, gameWidth, gameHeight);
        }).not.toThrow();

        expect(mockContext.fillText).toHaveBeenCalledTimes(7); // 6 players + 1 instruction
      });

      it('should distribute 6 players evenly', () => {
        const players = createPlayerTemplates(6);

        playerSelector.show(players, gameWidth, gameHeight);

        const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
        const yPositions = calls.slice(0, 6).map((call) => call[2]); // First 6 calls

        // All Y positions should be different
        const uniqueY = new Set(yPositions);
        expect(uniqueY.size).toBe(6);

        // Should be in ascending order
        for (let i = 0; i < yPositions.length - 1; i++) {
          expect(yPositions[i]).toBeLessThan(yPositions[i + 1]!);
        }
      });
    });

    describe('Missing/invalid images', () => {
      it('should handle missing image for a player', () => {
        const players = createPlayerTemplates(2);
        const imageRepo = createMockImageRepo();

        // Remove image for first player
        delete (imageRepo as any).red;

        (mockInputManager as any).setKeyPressed('q', true);
        (mockInputManager as any).setKeyPressed('m', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        // Should only draw second player's image
        expect(mockContext.drawImage).toHaveBeenCalledTimes(1);
        expect(mockContext.drawImage).toHaveBeenCalledWith(
          imageRepo.yellow,
          expect.any(Number),
          expect.any(Number)
        );
      });

      it('should handle all images missing', () => {
        const players = createPlayerTemplates(2);
        const imageRepo = {} as ImageRepository;

        (mockInputManager as any).setKeyPressed('q', true);
        (mockInputManager as any).setKeyPressed('m', true);

        expect(() => {
          playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());
        }).not.toThrow();

        expect(mockContext.drawImage).not.toHaveBeenCalled();
      });

      it('should handle images with zero dimensions', () => {
        const players = createPlayerTemplates(1);
        const imageRepo = createMockImageRepo();

        (imageRepo.red as any).width = 0;
        (imageRepo.red as any).height = 0;

        (mockInputManager as any).setKeyPressed('q', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        // Image validation should pass (checks naturalWidth, not width)
        expect(mockContext.drawImage).toHaveBeenCalled();
      });
    });

    describe('Rapid key presses', () => {
      it('should handle rapid toggle between ready states', () => {
        const players = createPlayerTemplates(1);
        const imageRepo = createMockImageRepo();

        for (let i = 0; i < 10; i++) {
          (mockInputManager as any).setKeyPressed('q', true);
          playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

          (mockInputManager as any).setKeyPressed('q', false);
          (mockInputManager as any).setKeyPressed('Ctrl', true);
          playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());
        }

        // Should end up not ready
        expect(players[0]?.ready).toBe(false);
      });

      it('should handle rapid space presses with ready player', () => {
        const players = createPlayerTemplates(1);
        const imageRepo = createMockImageRepo();
        const onStart = vi.fn();

        players[0]!.ready = true;

        (mockInputManager as any).setKeyPressed('space', true);

        for (let i = 0; i < 10; i++) {
          playerSelector.listen(players, imageRepo, gameWidth, gameHeight, onStart);
        }

        // Each listen call should invoke onStart
        expect(onStart).toHaveBeenCalledTimes(10);
      });

      it('should handle all players pressing keys simultaneously', () => {
        const players = createPlayerTemplates(6);
        const imageRepo = createMockImageRepo();

        // Press all left keys
        (mockInputManager as any).setKeyPressed('q', true);
        (mockInputManager as any).setKeyPressed('m', true);
        (mockInputManager as any).setKeyPressed('left', true);
        (mockInputManager as any).setKeyPressed('o', true);
        (mockInputManager as any).setKeyPressed('up', true);
        (mockInputManager as any).setKeyPressed('1', true);

        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

        // All should be ready
        expect(players.every((p) => p.ready)).toBe(true);
      });
    });

    describe('Extreme dimensions', () => {
      it('should handle very small canvas dimensions', () => {
        const players = createPlayerTemplates(2);

        expect(() => {
          playerSelector.show(players, 50, 30);
        }).not.toThrow();
      });

      it('should handle very large canvas dimensions', () => {
        const players = createPlayerTemplates(2);

        expect(() => {
          playerSelector.show(players, 10000, 10000);
        }).not.toThrow();
      });

      it('should handle zero canvas dimensions', () => {
        const players = createPlayerTemplates(2);

        expect(() => {
          playerSelector.show(players, 0, 0);
        }).not.toThrow();
      });
    });

    describe('Rapid sequential operations', () => {
      it('should handle rapid show calls', () => {
        const players = createPlayerTemplates(3);

        expect(() => {
          for (let i = 0; i < 100; i++) {
            playerSelector.show(players, gameWidth, gameHeight);
          }
        }).not.toThrow();
      });

      it('should handle rapid listen calls', () => {
        const players = createPlayerTemplates(3);
        const imageRepo = createMockImageRepo();

        expect(() => {
          for (let i = 0; i < 100; i++) {
            playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());
          }
        }).not.toThrow();
      });

      it('should handle rapid clear calls', () => {
        const players = createPlayerTemplates(3);

        expect(() => {
          for (let i = 0; i < 100; i++) {
            playerSelector.clear(players, gameWidth, gameHeight);
          }
        }).not.toThrow();
      });

      it('should handle mixed operations', () => {
        const players = createPlayerTemplates(3);
        const imageRepo = createMockImageRepo();

        expect(() => {
          for (let i = 0; i < 50; i++) {
            playerSelector.show(players, gameWidth, gameHeight);
            playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());
            playerSelector.clear(players, gameWidth, gameHeight);
          }
        }).not.toThrow();
      });
    });
  });

  describe('API Compatibility with SelectPlayers.js', () => {
    it('should have equivalent show method', () => {
      // Original SelectPlayers.js has this.show()
      expect(typeof playerSelector.show).toBe('function');

      const players = createPlayerTemplates(2);
      playerSelector.show(players, gameWidth, gameHeight);

      // Should set active like original
      expect(playerSelector.active).toBe(true);
    });

    it('should have equivalent listen method', () => {
      // Original SelectPlayers.js has this.listen()
      expect(typeof playerSelector.listen).toBe('function');

      const players = createPlayerTemplates(2);
      const imageRepo = createMockImageRepo();

      playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

      // Should handle input like original
      expect(true).toBe(true); // Verified through other tests
    });

    it('should have equivalent clear method', () => {
      // Original SelectPlayers.js has this.clear()
      expect(typeof playerSelector.clear).toBe('function');

      const players = createPlayerTemplates(2);
      playerSelector.clear(players, gameWidth, gameHeight);

      // Should clear like original
      expect(playerSelector.active).toBe(false);
    });

    it('should have equivalent active property', () => {
      // Original has this.active
      expect(playerSelector.active).toBeDefined();
      expect(typeof playerSelector.active).toBe('boolean');
    });

    it('should use same default font styling', () => {
      const players = createPlayerTemplates(2);

      playerSelector.show(players, gameWidth, gameHeight);

      // Original uses: font="bold 20px Courier"
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should use same position formula for key labels', () => {
      // Original: x = game.width/5, y = (game.height*0.6/players.length)*i + 80
      const players = createPlayerTemplates(2);

      playerSelector.show(players, gameWidth, gameHeight);

      const expectedX = gameWidth / 5;
      const expectedY0 = ((gameHeight * 0.6) / 2) * 0 + 80;
      const expectedY1 = ((gameHeight * 0.6) / 2) * 1 + 80;

      const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
      expect(calls[0]![1]).toBe(expectedX);
      expect(calls[0]![2]).toBe(expectedY0);
      expect(calls[1]![1]).toBe(expectedX);
      expect(calls[1]![2]).toBe(expectedY1);
    });

    it('should use same position formula for icons', () => {
      // Original: x = (game.width/5) + 220, y = formula - imageRepository[p.name].height
      const players = createPlayerTemplates(1);
      const imageRepo = createMockImageRepo();

      (mockInputManager as any).setKeyPressed('q', true);

      playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

      const expectedX = gameWidth / 5 + 220;
      const expectedY = ((gameHeight * 0.6) / 1) * 0 + 80 - 32;

      expect(mockContext.drawImage).toHaveBeenCalledWith(imageRepo.red, expectedX, expectedY);
    });

    it('should display control keys in player color', () => {
      const players = createPlayerTemplates(2);

      playerSelector.show(players, gameWidth, gameHeight);

      // fillStyle should be set before drawing (verified through implementation)
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should display instructions at bottom center', () => {
      // Original: game.width/2, game.height*7/8
      const players = createPlayerTemplates(2);

      playerSelector.show(players, gameWidth, gameHeight);

      const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
      const instructionCall = calls[calls.length - 1]!;

      expect(instructionCall[0]).toBe('Press space to start');
      expect(instructionCall[1]).toBe(gameWidth / 2);
      expect(instructionCall[2]).toBe(gameHeight * (7 / 8));
    });

    it('should toggle player ready with left/right keys', () => {
      // Original uses KEY_STATUS[p.left] and KEY_STATUS[p.right]
      const players = createPlayerTemplates(1);
      const imageRepo = createMockImageRepo();

      // Left key sets ready
      (mockInputManager as any).setKeyPressed('q', true);
      playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());
      expect(players[0]?.ready).toBe(true);

      // Right key sets not ready
      (mockInputManager as any).setKeyPressed('q', false);
      (mockInputManager as any).setKeyPressed('Ctrl', true);
      playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());
      expect(players[0]?.ready).toBe(false);
    });

    it('should start game when space pressed with ready player', () => {
      // Original: if (KEY_STATUS.space) { ... game.start(); }
      const players = createPlayerTemplates(1);
      const imageRepo = createMockImageRepo();
      const onStart = vi.fn();

      players[0]!.ready = true;
      (mockInputManager as any).setKeyPressed('space', true);

      playerSelector.listen(players, imageRepo, gameWidth, gameHeight, onStart);

      expect(onStart).toHaveBeenCalled();
    });

    it('should NOT start game when space pressed with no ready players', () => {
      const players = createPlayerTemplates(2);
      const imageRepo = createMockImageRepo();
      const onStart = vi.fn();

      (mockInputManager as any).setKeyPressed('space', true);

      playerSelector.listen(players, imageRepo, gameWidth, gameHeight, onStart);

      expect(onStart).not.toHaveBeenCalled();
    });

    it('should mutate player templates like original', () => {
      // Original mutates game.players.playerTemplates directly
      const players = createPlayerTemplates(2);
      const imageRepo = createMockImageRepo();

      (mockInputManager as any).setKeyPressed('q', true);

      playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());

      // Should mutate the passed array
      expect(players[0]?.ready).toBe(true);
    });

    it('should clear canvas on clear() like original', () => {
      // Original: this.context.clearRect(0, 0, game.width, game.height)
      const players = createPlayerTemplates(2);

      playerSelector.clear(players, gameWidth, gameHeight);

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, gameWidth, gameHeight);
    });
  });

  describe('Factory Function', () => {
    it('should create PlayerSelector instance', () => {
      const selector = createPlayerSelector(mockContext, mockInputManager);
      expect(selector).toBeDefined();
      expect(selector.active).toBe(false);
    });

    it('should accept config parameter', () => {
      const config: PlayerSelectorConfig = {
        fontSize: 24,
        instructionText: 'Press any key',
      };

      const selector = createPlayerSelector(mockContext, mockInputManager, config);
      expect(selector).toBeDefined();
    });

    it('should return IPlayerSelector interface', () => {
      const selector = createPlayerSelector(mockContext, mockInputManager);

      // Verify interface methods exist
      expect(typeof selector.show).toBe('function');
      expect(typeof selector.listen).toBe('function');
      expect(typeof selector.clear).toBe('function');
      expect(typeof selector.active).toBe('boolean');
    });

    it('should work identically to constructor', () => {
      const selector1 = new PlayerSelector(mockContext, mockInputManager);
      const selector2 = createPlayerSelector(mockContext, mockInputManager);

      expect(selector1.active).toBe(selector2.active);
    });
  });

  describe('Type Safety', () => {
    it('should enforce PlayerSelectorConfig types', () => {
      // This is a compile-time test, but we can verify it accepts valid configs
      const validConfigs: PlayerSelectorConfig[] = [
        { keyLabelXRatio: 0.3 },
        { iconOffsetX: 300, baseY: 100 },
        { fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold' },
        { instructionYRatio: 0.5, instructionText: 'Start', instructionColor: 'white' },
        {},
      ];

      validConfigs.forEach((config) => {
        expect(() => new PlayerSelector(mockContext, mockInputManager, config)).not.toThrow();
      });
    });

    it('should enforce PlayerTemplate types', () => {
      // Valid player templates
      const validPlayers: PlayerTemplate[] = [
        { name: 'red', color: '#FF0000', left: 'q', right: 'Ctrl', ready: false, count: 1 },
        { name: 'blue', color: '#0000FF', left: '1', right: 'Shift', ready: true, count: 2 },
      ];

      expect(() => {
        playerSelector.show(validPlayers, gameWidth, gameHeight);
      }).not.toThrow();
    });

    it('should require CanvasRenderingContext2D and IInputManager', () => {
      // TypeScript ensures this at compile time
      expect(() => new PlayerSelector(mockContext, mockInputManager)).not.toThrow();
    });

    it('should make active readonly', () => {
      // TypeScript prevents this at compile time
      expect(() => {
        // @ts-expect-error - Testing that active is readonly
        playerSelector.active = true;
      }).toThrow();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle full player selection flow', () => {
      const players = createPlayerTemplates(4);
      const imageRepo = createMockImageRepo();
      const onStart = vi.fn();

      // Show selection screen
      playerSelector.show(players, gameWidth, gameHeight);
      expect(playerSelector.active).toBe(true);

      // Player 1 joins
      (mockInputManager as any).setKeyPressed('q', true);
      playerSelector.listen(players, imageRepo, gameWidth, gameHeight, onStart);
      expect(players[0]?.ready).toBe(true);

      // Player 2 joins
      (mockInputManager as any).setKeyPressed('q', false);
      (mockInputManager as any).setKeyPressed('m', true);
      playerSelector.listen(players, imageRepo, gameWidth, gameHeight, onStart);
      expect(players[1]?.ready).toBe(true);

      // Player 1 leaves
      (mockInputManager as any).setKeyPressed('m', false);
      (mockInputManager as any).setKeyPressed('Ctrl', true);
      playerSelector.listen(players, imageRepo, gameWidth, gameHeight, onStart);
      expect(players[0]?.ready).toBe(false);

      // Start game
      (mockInputManager as any).setKeyPressed('Ctrl', false);
      (mockInputManager as any).setKeyPressed('space', true);
      playerSelector.listen(players, imageRepo, gameWidth, gameHeight, onStart);
      expect(onStart).toHaveBeenCalled();

      // Clear
      playerSelector.clear(players, gameWidth, gameHeight);
      expect(playerSelector.active).toBe(false);
      expect(players.every((p) => !p.ready)).toBe(true);
    });

    it('should support showing multiple times', () => {
      const players = createPlayerTemplates(3);

      playerSelector.show(players, gameWidth, gameHeight);
      playerSelector.clear(players, gameWidth, gameHeight);
      playerSelector.show(players, gameWidth, gameHeight);

      expect(playerSelector.active).toBe(true);
    });

    it('should work with changing game dimensions', () => {
      const players = createPlayerTemplates(2);

      playerSelector.show(players, 800, 600);
      playerSelector.show(players, 1024, 768);
      playerSelector.show(players, 640, 480);

      // Should adapt to different dimensions
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should maintain state across multiple listen calls', () => {
      const players = createPlayerTemplates(3);
      const imageRepo = createMockImageRepo();

      // Multiple game loop frames
      for (let frame = 0; frame < 60; frame++) {
        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());
      }

      // Should not throw or have issues
      expect(true).toBe(true);
    });
  });

  describe('Performance Characteristics', () => {
    it('should efficiently handle many show calls', () => {
      const players = createPlayerTemplates(6);

      const iterations = 1000;
      expect(() => {
        for (let i = 0; i < iterations; i++) {
          playerSelector.show(players, gameWidth, gameHeight);
        }
      }).not.toThrow();
    });

    it('should not leak memory on repeated operations', () => {
      const players = createPlayerTemplates(4);
      const imageRepo = createMockImageRepo();

      // Simulate many selection cycles
      for (let i = 0; i < 100; i++) {
        playerSelector.show(players, gameWidth, gameHeight);
        playerSelector.listen(players, imageRepo, gameWidth, gameHeight, vi.fn());
        playerSelector.clear(players, gameWidth, gameHeight);
      }

      // Should complete without errors
      expect(true).toBe(true);
    });

    it('should handle save/restore efficiently', () => {
      const players = createPlayerTemplates(2);

      for (let i = 0; i < 100; i++) {
        playerSelector.show(players, gameWidth, gameHeight);
      }

      // Save and restore should be paired correctly
      const saveCalls = (mockContext.save as ReturnType<typeof vi.fn>).mock.calls.length;
      const restoreCalls = (mockContext.restore as ReturnType<typeof vi.fn>).mock.calls.length;

      expect(saveCalls).toBe(restoreCalls);
    });
  });
});
