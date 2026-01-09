/**
 * PlayerManager Tests
 *
 * Comprehensive test suite for the PlayerManager class.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlayerManager, createPlayerManager } from './PlayerManager';
import type {
  PlayerTemplate,
  PlayerManagerConfig,
  PlayerDependencies,
} from '../../types/player.types';

/**
 * Create mock canvas context
 */
function createMockContext(): CanvasRenderingContext2D {
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
    getImageData: vi.fn().mockReturnValue({
      data: [0, 0, 0, 0],
    }),
  } as unknown as CanvasRenderingContext2D;
}

/**
 * Create mock input manager
 */
function createMockInputManager() {
  const pressedKeys = new Set<string>();

  return {
    isKeyPressed: vi.fn((key: string) => pressedKeys.has(key)),
    pressKey: (key: string) => pressedKeys.add(key),
    releaseKey: (key: string) => pressedKeys.delete(key),
    reset: () => pressedKeys.clear(),
  };
}

/**
 * Create mock FPS provider
 */
function createMockFPS() {
  return {
    value: 60 as number | undefined,
  };
}

/**
 * Test data
 */
const TEST_DIMENSIONS = {
  width: 800,
  height: 600,
  scoreWidth: 150,
};

const TEST_PLAYER_TEMPLATES: PlayerTemplate[] = [
  {
    ready: true,
    count: 1,
    name: 'red',
    color: '#f82801',
    left: '1',
    right: 'q',
  },
  {
    ready: true,
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
];

const TEST_CONFIG: PlayerManagerConfig = {
  maxRounds: 5,
  physics: {
    size: 2,
    speed: 3,
    curveSpeed: 4.5,
    holeRate: 100,
    holeRateRnd: 20,
    holeSize: 10,
    holeSizeRnd: 5,
  },
};

describe('PlayerManager', () => {
  let context: ReturnType<typeof createMockContext>;
  let inputManager: ReturnType<typeof createMockInputManager>;
  let fpsProvider: ReturnType<typeof createMockFPS>;
  let playerDependencies: PlayerDependencies;

  beforeEach(() => {
    context = createMockContext();
    inputManager = createMockInputManager();
    fpsProvider = createMockFPS();

    playerDependencies = {
      context,
      inputManager,
      fpsProvider,
      dimensions: TEST_DIMENSIONS,
    };
  });

  describe('Constructor', () => {
    it('should create manager with default templates', () => {
      const manager = new PlayerManager({
        context,
        playerDependencies,
      });

      expect(manager).toBeDefined();
      expect(manager.playerTemplates).toHaveLength(6);
    });

    it('should create manager with custom templates', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      expect(manager).toBeDefined();
      expect(manager.playerTemplates).toHaveLength(3);
    });

    it('should initialize with default state', () => {
      const manager = new PlayerManager({
        context,
        playerDependencies,
      });

      expect(manager.running).toBe(false);
      expect(manager.roundCount).toBe(0);
      expect(manager.maxRounds).toBe(0);
      expect(manager.pool).toHaveLength(0);
    });

    it('should accept callbacks', () => {
      const onNewRound = vi.fn();
      const onFinish = vi.fn();

      const manager = new PlayerManager({
        context,
        playerDependencies,
        onNewRound,
        onFinish,
      });

      expect(manager).toBeDefined();
    });
  });

  describe('init()', () => {
    it('should create players for ready templates', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);

      // Should create 2 players (red and yellow are ready)
      expect(manager.pool).toHaveLength(2);
      expect(manager.pool[0]?.name).toBe('red');
      expect(manager.pool[1]?.name).toBe('yellow');
    });

    it('should set maxRounds', () => {
      const manager = new PlayerManager({
        context,
        playerDependencies,
      });

      manager.init(TEST_CONFIG);

      expect(manager.maxRounds).toBe(5);
    });

    it('should reset roundCount', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);

      // Start and end a round (increment roundCount)
      manager.startRound();

      // All players die
      for (const player of manager.pool) {
        player.dead = true;
      }
      manager.checkRoundOver();

      expect(manager.roundCount).toBe(1);

      // Re-init should reset
      manager.init(TEST_CONFIG);

      expect(manager.roundCount).toBe(0);
    });

    it('should handle zero ready players', () => {
      const noReadyTemplates: PlayerTemplate[] = [
        {
          ready: false,
          count: 1,
          name: 'red',
          color: '#f82801',
          left: '1',
          right: 'q',
        },
      ];

      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        noReadyTemplates
      );

      manager.init(TEST_CONFIG);

      expect(manager.pool).toHaveLength(0);
    });

    it('should allow re-initialization', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      const firstPool = manager.pool;

      manager.init(TEST_CONFIG);
      const secondPool = manager.pool;

      // Should create new pool
      expect(secondPool).not.toBe(firstPool);
      expect(secondPool).toHaveLength(2);
    });
  });

  describe('startRound()', () => {
    it('should set running to true', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      manager.startRound();

      expect(manager.running).toBe(true);
    });

    it('should clear the canvas', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      manager.startRound();

      expect(context.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    it('should initialize all players', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);

      // Make players dead
      for (const player of manager.pool) {
        player.dead = true;
      }

      manager.startRound();

      // All should be alive now
      for (const player of manager.pool) {
        expect(player.dead).toBe(false);
      }
    });

    it('should allow multiple round starts', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);

      manager.startRound();
      manager.startRound();

      expect(manager.running).toBe(true);
    });
  });

  describe('animate()', () => {
    it('should draw living players when running', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      manager.startRound();

      // Animate once
      manager.animate();

      // Should have drawn something
      expect(context.fill).toHaveBeenCalled();
    });

    it('should not draw dead players', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      manager.startRound();

      // Kill all players
      for (const player of manager.pool) {
        player.dead = true;
      }

      const fillCallsBefore = (context.fill as unknown as { mock: { calls: unknown[] } }).mock.calls
        .length;

      // Animate
      manager.animate();

      const fillCallsAfter = (context.fill as unknown as { mock: { calls: unknown[] } }).mock.calls
        .length;

      // Should not have drawn anything
      expect(fillCallsAfter).toBe(fillCallsBefore);
    });

    it('should check for space key when not running', () => {
      const onNewRound = vi.fn();

      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
          onNewRound,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);

      // Don't start round (not running)
      expect(manager.running).toBe(false);

      // Press space
      inputManager.pressKey('space');

      // Animate
      manager.animate();

      // Should call new round callback
      expect(onNewRound).toHaveBeenCalled();
    });

    it('should call onNewRound when space pressed and rounds remaining', () => {
      const onNewRound = vi.fn();

      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
          onNewRound,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);

      // Set round count below max
      manager.startRound();

      // Kill all but one
      manager.pool[0]!.dead = true;
      manager.checkRoundOver();

      expect(manager.running).toBe(false);
      expect(manager.roundCount).toBe(1);

      // Press space
      inputManager.pressKey('space');

      // Animate
      manager.animate();

      // Should call new round
      expect(onNewRound).toHaveBeenCalled();
    });

    it('should call onFinish when space pressed and no rounds remaining', () => {
      const onFinish = vi.fn();

      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
          onFinish,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init({ ...TEST_CONFIG, maxRounds: 1 });
      manager.startRound();

      // End the round
      manager.pool[0]!.dead = true;
      manager.checkRoundOver();

      expect(manager.roundCount).toBe(1);
      expect(manager.maxRounds).toBe(1);

      // Press space
      inputManager.pressKey('space');

      // Animate
      manager.animate();

      // Should call finish
      expect(onFinish).toHaveBeenCalled();
    });

    it('should not respond to space if already running', () => {
      const onNewRound = vi.fn();

      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
          onNewRound,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      manager.startRound();

      expect(manager.running).toBe(true);

      // Press space
      inputManager.pressKey('space');

      // Animate
      manager.animate();

      // Should not call new round (already running)
      expect(onNewRound).not.toHaveBeenCalled();
    });
  });

  describe('checkRoundOver()', () => {
    it('should end round when all but one player dead', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      manager.startRound();

      expect(manager.running).toBe(true);

      // Kill one player (2 total, so 1 dead = round over)
      manager.pool[0]!.dead = true;

      manager.checkRoundOver();

      expect(manager.running).toBe(false);
    });

    it('should increment roundCount', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      manager.startRound();

      expect(manager.roundCount).toBe(0);

      // End round
      manager.pool[0]!.dead = true;
      manager.checkRoundOver();

      expect(manager.roundCount).toBe(1);
    });

    it('should not end round if multiple players alive', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      manager.startRound();

      // Both players alive, don't check over yet
      manager.checkRoundOver();

      expect(manager.running).toBe(true);
    });

    it('should handle single player game (round never ends)', () => {
      const singleTemplate: PlayerTemplate[] = [
        {
          ready: true,
          count: 1,
          name: 'red',
          color: '#f82801',
          left: '1',
          right: 'q',
        },
      ];

      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        singleTemplate
      );

      manager.init(TEST_CONFIG);
      manager.startRound();

      // Kill the only player
      manager.pool[0]!.dead = true;

      manager.checkRoundOver();

      // Round should end (0 alive = deadCount 1 >= pool.length 1 - 1 = 0)
      expect(manager.running).toBe(false);
    });

    it('should handle all players dying simultaneously', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      manager.startRound();

      // Kill all players
      for (const player of manager.pool) {
        player.dead = true;
      }

      manager.checkRoundOver();

      // Round should end
      expect(manager.running).toBe(false);
    });
  });

  describe('Player Death Integration', () => {
    it('should automatically check round over when player dies', () => {
      // Mock collision
      const collisionContext = createMockContext();
      collisionContext.getImageData = vi.fn().mockReturnValue({
        data: [255, 0, 0, 255], // Red pixel (collision)
      });

      const manager = new PlayerManager(
        {
          context: collisionContext,
          playerDependencies: {
            ...playerDependencies,
            context: collisionContext,
          },
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      manager.startRound();

      expect(manager.running).toBe(true);

      // Animate until a player dies
      for (let i = 0; i < 100; i++) {
        manager.animate();

        if (!manager.running) {
          break;
        }
      }

      // Round should have ended
      expect(manager.running).toBe(false);
    });
  });

  describe('Factory Function', () => {
    it('should create manager instance', () => {
      const manager = createPlayerManager({
        context,
        playerDependencies,
      });

      expect(manager).toBeInstanceOf(PlayerManager);
    });

    it('should accept all parameters', () => {
      const onNewRound = vi.fn();
      const onFinish = vi.fn();

      const manager = createPlayerManager(
        {
          context,
          playerDependencies,
          onNewRound,
          onFinish,
        },
        TEST_PLAYER_TEMPLATES
      );

      expect(manager).toBeDefined();
      expect(manager.playerTemplates).toHaveLength(3);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete game flow', () => {
      const onNewRound = vi.fn();
      const onFinish = vi.fn();

      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
          onNewRound,
          onFinish,
        },
        TEST_PLAYER_TEMPLATES
      );

      // Initialize game
      manager.init({ ...TEST_CONFIG, maxRounds: 2 });

      expect(manager.pool).toHaveLength(2);
      expect(manager.roundCount).toBe(0);

      // Start round 1
      manager.startRound();
      expect(manager.running).toBe(true);

      // Play for a bit
      for (let i = 0; i < 10; i++) {
        manager.animate();
      }

      // Kill a player (end round)
      manager.pool[0]!.dead = true;
      manager.checkRoundOver();

      expect(manager.running).toBe(false);
      expect(manager.roundCount).toBe(1);

      // Press space to start next round
      inputManager.pressKey('space');
      manager.animate();

      expect(onNewRound).toHaveBeenCalled();

      // After new round is started externally
      manager.startRound();

      // End round 2
      manager.pool[0]!.dead = true;
      manager.checkRoundOver();

      expect(manager.roundCount).toBe(2);

      // Press space to finish
      inputManager.reset();
      inputManager.pressKey('space');
      manager.animate();

      expect(onFinish).toHaveBeenCalled();
    });

    it('should preserve scores across rounds', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      manager.startRound();

      // Set scores
      manager.pool[0]!.score = 5;
      manager.pool[1]!.score = 3;

      // End round
      manager.pool[0]!.dead = true;
      manager.checkRoundOver();

      // Start new round
      manager.startRound();

      // Scores should be preserved
      expect(manager.pool[0]!.score).toBe(5);
      expect(manager.pool[1]!.score).toBe(3);
    });

    it('should handle rapid round changes', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init({ ...TEST_CONFIG, maxRounds: 10 });

      // Play multiple rounds rapidly
      for (let round = 0; round < 5; round++) {
        manager.startRound();

        // Quick kill
        manager.pool[0]!.dead = true;
        manager.checkRoundOver();

        expect(manager.roundCount).toBe(round + 1);
      }

      expect(manager.roundCount).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty player pool', () => {
      const noPlayers: PlayerTemplate[] = [];

      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        noPlayers
      );

      manager.init(TEST_CONFIG);

      // Should not throw
      expect(() => manager.startRound()).not.toThrow();
      expect(() => manager.animate()).not.toThrow();
      expect(() => manager.checkRoundOver()).not.toThrow();
    });

    it('should handle maxRounds of 0', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init({ ...TEST_CONFIG, maxRounds: 0 });

      expect(manager.maxRounds).toBe(0);

      // Should immediately finish
      const onFinish = vi.fn();
      manager.init({ ...TEST_CONFIG, maxRounds: 0 });
    });

    it('should handle missing callbacks gracefully', () => {
      const manager = new PlayerManager(
        {
          context,
          playerDependencies,
          // No callbacks provided
        },
        TEST_PLAYER_TEMPLATES
      );

      manager.init(TEST_CONFIG);
      inputManager.pressKey('space');

      // Should not throw
      expect(() => manager.animate()).not.toThrow();
    });
  });
});
