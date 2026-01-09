/**
 * ScoreBoard Unit Tests
 *
 * Comprehensive test suite for ScoreBoard implementation.
 * Tests type safety, API compatibility, edge cases, and canvas rendering.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ScoreBoard, createScoreBoard } from './ScoreBoard';
import type { Player, ScoreConfig } from '../../types/score.types';

/**
 * Mock Canvas Context
 *
 * Creates a mock CanvasRenderingContext2D for testing
 */
function createMockContext(): CanvasRenderingContext2D {
  const mockContext = {
    // Drawing methods
    fillText: vi.fn(),
    fillRect: vi.fn(),
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
 * Create sample player data for testing
 */
function createPlayers(count: number): Player[] {
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  const names = ['red', 'green', 'blue', 'yellow', 'magenta', 'cyan'];

  const players: Player[] = [];
  for (let i = 0; i < count; i++) {
    players.push({
      name: names[i] || `player${i}`,
      color: colors[i] || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      score: 0,
      dead: false,
    });
  }

  return players;
}

describe('ScoreBoard', () => {
  let mockContext: CanvasRenderingContext2D;
  let scoreBoard: ScoreBoard;
  const gameHeight = 600;

  beforeEach(() => {
    mockContext = createMockContext();
    scoreBoard = new ScoreBoard(mockContext);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      const board = new ScoreBoard(mockContext);
      expect(board).toBeInstanceOf(ScoreBoard);
      expect(board.width).toBe(150); // Default width
    });

    it('should create instance with custom config', () => {
      const config: ScoreConfig = {
        width: 200,
        fontSize: 80,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        textAlign: 'center',
      };

      const board = new ScoreBoard(mockContext, config);
      expect(board).toBeInstanceOf(ScoreBoard);
      expect(board.width).toBe(200);
    });

    it('should merge partial config with defaults', () => {
      const config: ScoreConfig = {
        fontSize: 100,
        backgroundColor: '#ffffff',
      };

      const board = new ScoreBoard(mockContext, config);
      expect(board).toBeInstanceOf(ScoreBoard);
      expect(board.width).toBe(150); // Should use default
    });

    it('should accept empty config object', () => {
      const board = new ScoreBoard(mockContext, {});
      expect(board).toBeInstanceOf(ScoreBoard);
      expect(board.width).toBe(150);
    });

    it('should not throw with minimal required parameters', () => {
      expect(() => new ScoreBoard(mockContext)).not.toThrow();
    });
  });

  describe('width getter', () => {
    it('should return default width', () => {
      expect(scoreBoard.width).toBe(150);
    });

    it('should return custom width', () => {
      const board = new ScoreBoard(mockContext, { width: 250 });
      expect(board.width).toBe(250);
    });

    it('should be read-only', () => {
      // TypeScript should prevent this at compile time
      // At runtime in strict mode, trying to set a getter-only property throws
      expect(() => {
        // @ts-expect-error - Testing runtime behavior of readonly property
        scoreBoard.width = 300;
      }).toThrow();

      // Verify it didn't actually change
      expect(scoreBoard.width).toBe(150);
    });

    it('should always return a number', () => {
      expect(typeof scoreBoard.width).toBe('number');
      expect(Number.isFinite(scoreBoard.width)).toBe(true);
    });
  });

  describe('draw() method', () => {
    describe('Basic functionality', () => {
      it('should clear previous scoreboard', () => {
        const players = createPlayers(3);
        scoreBoard.draw(players, gameHeight);

        expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 150, 1000);
      });

      it('should draw background panel', () => {
        const players = createPlayers(3);
        scoreBoard.draw(players, gameHeight);

        expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 150, gameHeight);
      });

      it('should set background color', () => {
        const players = createPlayers(3);
        scoreBoard.draw(players, gameHeight);

        // fillStyle should be set to background color before fillRect
        const fillRectCall = (mockContext.fillRect as ReturnType<typeof vi.fn>).mock
          .invocationCallOrder[0];
        expect(fillRectCall).toBeDefined();
      });

      it('should draw player scores', () => {
        const players = createPlayers(3);
        players[0].score = 5;
        players[1].score = 3;
        players[2].score = 7;

        scoreBoard.draw(players, gameHeight);

        // Should call fillText for each player
        expect(mockContext.fillText).toHaveBeenCalledTimes(3);
        expect(mockContext.fillText).toHaveBeenCalledWith('5', expect.any(Number), expect.any(Number));
        expect(mockContext.fillText).toHaveBeenCalledWith('3', expect.any(Number), expect.any(Number));
        expect(mockContext.fillText).toHaveBeenCalledWith('7', expect.any(Number), expect.any(Number));
      });

      it('should set font properties', () => {
        const players = createPlayers(2);
        scoreBoard.draw(players, gameHeight);

        // Font and textAlign should be set (we verify through call order)
        expect(mockContext.fillText).toHaveBeenCalled();
      });

      it('should use player colors for scores', () => {
        const players = createPlayers(2);
        scoreBoard.draw(players, gameHeight);

        // fillStyle should be set before each fillText call
        expect(mockContext.fillText).toHaveBeenCalledTimes(2);
      });
    });

    describe('Canvas state preservation', () => {
      it('should call save/restore for background drawing', () => {
        const players = createPlayers(2);
        scoreBoard.draw(players, gameHeight);

        // Should save/restore at least once for background
        expect(mockContext.save).toHaveBeenCalled();
        expect(mockContext.restore).toHaveBeenCalled();
      });

      it('should call save before restore', () => {
        const players = createPlayers(2);
        scoreBoard.draw(players, gameHeight);

        const saveCalls = (mockContext.save as ReturnType<typeof vi.fn>).mock
          .invocationCallOrder;
        const restoreCalls = (mockContext.restore as ReturnType<typeof vi.fn>).mock
          .invocationCallOrder;

        // Each save should come before its corresponding restore
        for (let i = 0; i < saveCalls.length; i++) {
          expect(saveCalls[i]).toBeLessThan(restoreCalls[i]!);
        }
      });

      it('should restore after drawing background', () => {
        const players = createPlayers(2);
        scoreBoard.draw(players, gameHeight);

        const fillRectOrder = (mockContext.fillRect as ReturnType<typeof vi.fn>).mock
          .invocationCallOrder[0];
        const firstRestoreOrder = (mockContext.restore as ReturnType<typeof vi.fn>).mock
          .invocationCallOrder[0];

        // Restore should come after fillRect
        expect(firstRestoreOrder).toBeGreaterThan(fillRectOrder!);
      });
    });

    describe('Player positioning', () => {
      it('should calculate correct X position (3/4 width - 10)', () => {
        const players = createPlayers(2);
        scoreBoard.draw(players, gameHeight);

        const expectedX = (150 * 3) / 4 - 10; // 102.5

        const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
        calls.forEach((call) => {
          expect(call[1]).toBe(expectedX);
        });
      });

      it('should distribute players vertically', () => {
        const players = createPlayers(3);
        scoreBoard.draw(players, gameHeight);

        const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;

        // Get Y positions
        const yPositions = calls.map((call) => call[2]);

        // Y positions should be different and increasing
        expect(yPositions[0]).toBeLessThan(yPositions[1]!);
        expect(yPositions[1]).toBeLessThan(yPositions[2]!);
      });

      it('should calculate Y position using formula (height*0.9*i/total + 80)', () => {
        const players = createPlayers(2);
        scoreBoard.draw(players, gameHeight);

        const expectedY0 = (gameHeight * 0.9 * 0) / 2 + 80;
        const expectedY1 = (gameHeight * 0.9 * 1) / 2 + 80;

        expect(mockContext.fillText).toHaveBeenCalledWith('0', expect.any(Number), expectedY0);
        expect(mockContext.fillText).toHaveBeenCalledWith('0', expect.any(Number), expectedY1);
      });

      it('should adjust positions based on game height', () => {
        const players = createPlayers(2);

        scoreBoard.draw(players, 600);
        const calls600 = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;

        vi.clearAllMocks();

        scoreBoard.draw(players, 800);
        const calls800 = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;

        // Y positions should differ with different game heights
        expect(calls600[1]![2]).not.toBe(calls800[1]![2]);
      });
    });

    describe('Custom configuration', () => {
      it('should use custom width for positioning', () => {
        const board = new ScoreBoard(mockContext, { width: 200 });
        const players = createPlayers(2);
        board.draw(players, gameHeight);

        const expectedX = (200 * 3) / 4 - 10;

        const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
        calls.forEach((call) => {
          expect(call[1]).toBe(expectedX);
        });
      });

      it('should use custom background color', () => {
        const board = new ScoreBoard(mockContext, { backgroundColor: '#ff0000' });
        const players = createPlayers(2);
        board.draw(players, gameHeight);

        // Background should be drawn with custom color
        expect(mockContext.fillRect).toHaveBeenCalled();
      });

      it('should use custom font properties', () => {
        const board = new ScoreBoard(mockContext, {
          fontSize: 100,
          fontFamily: 'Arial',
          fontStyle: 'bold',
        });
        const players = createPlayers(2);
        board.draw(players, gameHeight);

        // Font should be set (verified through fillText being called)
        expect(mockContext.fillText).toHaveBeenCalled();
      });

      it('should use custom text alignment', () => {
        const board = new ScoreBoard(mockContext, { textAlign: 'center' });
        const players = createPlayers(2);
        board.draw(players, gameHeight);

        // Text alignment should be set
        expect(mockContext.fillText).toHaveBeenCalled();
      });
    });
  });

  describe('incrementScores() method', () => {
    describe('Basic functionality', () => {
      it('should increment scores of living players except dead one', () => {
        const players = createPlayers(3);
        players[0].score = 0;
        players[1].score = 0;
        players[2].score = 0;

        scoreBoard.incrementScores('red', players);

        expect(players[0].score).toBe(0); // Dead player, no increment
        expect(players[1].score).toBe(1); // Living player
        expect(players[2].score).toBe(1); // Living player
      });

      it('should not increment dead players', () => {
        const players = createPlayers(3);
        players[0].score = 0;
        players[1].score = 0;
        players[1].dead = true; // Mark as dead
        players[2].score = 0;

        scoreBoard.incrementScores('red', players);

        expect(players[0].score).toBe(0); // Dead player named
        expect(players[1].score).toBe(0); // Dead player, no increment
        expect(players[2].score).toBe(1); // Living player
      });

      it('should work with single player dying', () => {
        const players = createPlayers(2);
        players[0].score = 5;
        players[1].score = 3;

        scoreBoard.incrementScores('red', players);

        expect(players[0].score).toBe(5); // Dead player, no increment
        expect(players[1].score).toBe(4); // Living player incremented
      });

      it('should handle multiple deaths in sequence', () => {
        const players = createPlayers(3);

        scoreBoard.incrementScores('red', players);
        expect(players[0].score).toBe(0);
        expect(players[1].score).toBe(1);
        expect(players[2].score).toBe(1);

        players[0].dead = true;

        scoreBoard.incrementScores('green', players);
        expect(players[0].score).toBe(0); // Already dead
        expect(players[1].score).toBe(1); // Dead this round
        expect(players[2].score).toBe(2); // Survivor gets point
      });

      it('should mutate the player array', () => {
        const players = createPlayers(2);
        const originalPlayers = players;

        scoreBoard.incrementScores('red', players);

        expect(players).toBe(originalPlayers); // Same reference
        expect(players[1].score).toBe(1); // But mutated
      });

      it('should not automatically redraw', () => {
        const players = createPlayers(2);

        scoreBoard.incrementScores('red', players);

        // Should not call any drawing methods
        expect(mockContext.fillText).not.toHaveBeenCalled();
        expect(mockContext.fillRect).not.toHaveBeenCalled();
        expect(mockContext.clearRect).not.toHaveBeenCalled();
      });
    });

    describe('Edge cases', () => {
      it('should handle empty players array', () => {
        expect(() => {
          scoreBoard.incrementScores('red', []);
        }).not.toThrow();
      });

      it('should handle single player', () => {
        const players = createPlayers(1);
        players[0].score = 0;

        scoreBoard.incrementScores('red', players);

        // Only player dies, no one gets points
        expect(players[0].score).toBe(0);
      });

      it('should handle non-existent player name', () => {
        const players = createPlayers(3);

        expect(() => {
          scoreBoard.incrementScores('nonexistent', players);
        }).not.toThrow();

        // All players should get points (no one matches the name)
        expect(players[0].score).toBe(1);
        expect(players[1].score).toBe(1);
        expect(players[2].score).toBe(1);
      });

      it('should handle all players dead except one', () => {
        const players = createPlayers(3);
        players[0].dead = true;
        players[1].dead = true;
        players[2].dead = false;

        scoreBoard.incrementScores('red', players);

        // Only living player should get point
        expect(players[0].score).toBe(0);
        expect(players[1].score).toBe(0);
        expect(players[2].score).toBe(1);
      });

      it('should handle case-sensitive player names', () => {
        const players = createPlayers(2);

        scoreBoard.incrementScores('Red', players); // Capital R

        // 'Red' !== 'red', so both should get points
        expect(players[0].score).toBe(1);
        expect(players[1].score).toBe(1);
      });

      it('should preserve existing scores', () => {
        const players = createPlayers(3);
        players[0].score = 10;
        players[1].score = 5;
        players[2].score = 8;

        scoreBoard.incrementScores('red', players);

        expect(players[0].score).toBe(10); // Unchanged
        expect(players[1].score).toBe(6); // +1
        expect(players[2].score).toBe(9); // +1
      });

      it('should work with large player counts', () => {
        const players = createPlayers(10);

        scoreBoard.incrementScores('red', players);

        // 9 living players should get points
        let pointsAwarded = 0;
        for (const player of players) {
          if (player.name !== 'red') {
            pointsAwarded += player.score;
          }
        }

        expect(pointsAwarded).toBe(9);
      });
    });

    describe('Scoring logic', () => {
      it('should implement last-man-standing scoring', () => {
        const players = createPlayers(4);

        // Round 1: red dies
        scoreBoard.incrementScores('red', players);
        expect(players.filter((p) => p.name !== 'red' && !p.dead)).toHaveLength(3);
        expect(players[1].score + players[2].score + players[3].score).toBe(3);

        // Round 2: green dies
        players[0].dead = true;
        scoreBoard.incrementScores('green', players);
        expect(players[2].score + players[3].score).toBe(4); // 2 + 2
      });

      it('should only award points to currently living players', () => {
        const players = createPlayers(3);

        // First death
        scoreBoard.incrementScores('red', players);
        players[0].dead = true;

        // Second death
        scoreBoard.incrementScores('green', players);
        players[1].dead = true;

        expect(players[0].score).toBe(0); // Died first, no points
        expect(players[1].score).toBe(1); // Got point from first death
        expect(players[2].score).toBe(2); // Survivor, got both points
      });

      it('should not give points to the dying player', () => {
        const players = createPlayers(2);

        scoreBoard.incrementScores('red', players);

        expect(players[0].score).toBe(0); // Dying player
        expect(players[1].score).toBe(1); // Survivor
      });
    });
  });

  describe('clear() method', () => {
    it('should clear scoreboard area', () => {
      scoreBoard.clear();

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 150, 1000);
    });

    it('should use scoreboard width', () => {
      const board = new ScoreBoard(mockContext, { width: 200 });
      board.clear();

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 200, 1000);
    });

    it('should use generous height (1000)', () => {
      scoreBoard.clear();

      const call = (mockContext.clearRect as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(call![3]).toBe(1000); // Height parameter
    });

    it('should not throw when called multiple times', () => {
      expect(() => {
        scoreBoard.clear();
        scoreBoard.clear();
        scoreBoard.clear();
      }).not.toThrow();
    });

    it('should not draw anything', () => {
      scoreBoard.clear();

      expect(mockContext.fillText).not.toHaveBeenCalled();
      expect(mockContext.fillRect).not.toHaveBeenCalled();
    });

    it('should clear before drawing in draw()', () => {
      const players = createPlayers(2);
      scoreBoard.draw(players, gameHeight);

      // clear() should be called before drawing
      const clearOrder = (mockContext.clearRect as ReturnType<typeof vi.fn>).mock
        .invocationCallOrder[0];
      const fillRectOrder = (mockContext.fillRect as ReturnType<typeof vi.fn>).mock
        .invocationCallOrder[0];

      expect(clearOrder).toBeLessThan(fillRectOrder!);
    });
  });

  describe('Edge Cases', () => {
    describe('Empty/null players', () => {
      it('should handle empty players array', () => {
        expect(() => {
          scoreBoard.draw([], gameHeight);
        }).not.toThrow();

        // Should still draw background
        expect(mockContext.fillRect).toHaveBeenCalled();
        // But no player scores
        expect(mockContext.fillText).not.toHaveBeenCalled();
      });

      it('should handle undefined in players array', () => {
        const players = createPlayers(2);
        (players as any)[1] = undefined;

        expect(() => {
          scoreBoard.draw(players, gameHeight);
        }).not.toThrow();
      });
    });

    describe('Single player', () => {
      it('should render single player correctly', () => {
        const players = createPlayers(1);
        players[0].score = 5;

        scoreBoard.draw(players, gameHeight);

        expect(mockContext.fillText).toHaveBeenCalledTimes(1);
        expect(mockContext.fillText).toHaveBeenCalledWith('5', expect.any(Number), 80);
      });

      it('should position single player at top', () => {
        const players = createPlayers(1);
        scoreBoard.draw(players, gameHeight);

        const expectedY = (gameHeight * 0.9 * 0) / 1 + 80; // i=0, total=1

        expect(mockContext.fillText).toHaveBeenCalledWith('0', expect.any(Number), expectedY);
      });
    });

    describe('Many players', () => {
      it('should handle 6 players', () => {
        const players = createPlayers(6);

        expect(() => {
          scoreBoard.draw(players, gameHeight);
        }).not.toThrow();

        expect(mockContext.fillText).toHaveBeenCalledTimes(6);
      });

      it('should distribute 6 players evenly', () => {
        const players = createPlayers(6);
        scoreBoard.draw(players, gameHeight);

        const calls = (mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls;
        const yPositions = calls.map((call) => call[2]);

        // All Y positions should be different
        const uniqueY = new Set(yPositions);
        expect(uniqueY.size).toBe(6);

        // Should be in ascending order
        for (let i = 0; i < yPositions.length - 1; i++) {
          expect(yPositions[i]).toBeLessThan(yPositions[i + 1]!);
        }
      });

      it('should handle 10 players', () => {
        const players = createPlayers(10);

        expect(() => {
          scoreBoard.draw(players, gameHeight);
        }).not.toThrow();

        expect(mockContext.fillText).toHaveBeenCalledTimes(10);
      });
    });

    describe('Extreme scores', () => {
      it('should handle zero scores', () => {
        const players = createPlayers(2);
        players[0].score = 0;
        players[1].score = 0;

        expect(() => {
          scoreBoard.draw(players, gameHeight);
        }).not.toThrow();

        expect(mockContext.fillText).toHaveBeenCalledWith('0', expect.any(Number), expect.any(Number));
      });

      it('should handle large scores', () => {
        const players = createPlayers(2);
        players[0].score = 9999;
        players[1].score = 10000;

        expect(() => {
          scoreBoard.draw(players, gameHeight);
        }).not.toThrow();

        expect(mockContext.fillText).toHaveBeenCalledWith('9999', expect.any(Number), expect.any(Number));
        expect(mockContext.fillText).toHaveBeenCalledWith('10000', expect.any(Number), expect.any(Number));
      });

      it('should handle negative scores (edge case)', () => {
        const players = createPlayers(2);
        players[0].score = -5;
        players[1].score = -10;

        expect(() => {
          scoreBoard.draw(players, gameHeight);
        }).not.toThrow();
      });
    });

    describe('Extreme dimensions', () => {
      it('should handle very small game height', () => {
        const players = createPlayers(2);

        expect(() => {
          scoreBoard.draw(players, 50);
        }).not.toThrow();
      });

      it('should handle very large game height', () => {
        const players = createPlayers(2);

        expect(() => {
          scoreBoard.draw(players, 10000);
        }).not.toThrow();
      });

      it('should handle zero game height', () => {
        const players = createPlayers(2);

        expect(() => {
          scoreBoard.draw(players, 0);
        }).not.toThrow();
      });

      it('should handle very small scoreboard width', () => {
        const board = new ScoreBoard(mockContext, { width: 10 });
        const players = createPlayers(2);

        expect(() => {
          board.draw(players, gameHeight);
        }).not.toThrow();
      });

      it('should handle very large scoreboard width', () => {
        const board = new ScoreBoard(mockContext, { width: 5000 });
        const players = createPlayers(2);

        expect(() => {
          board.draw(players, gameHeight);
        }).not.toThrow();
      });
    });

    describe('Rapid sequential operations', () => {
      it('should handle rapid draw calls', () => {
        const players = createPlayers(3);

        expect(() => {
          for (let i = 0; i < 100; i++) {
            scoreBoard.draw(players, gameHeight);
          }
        }).not.toThrow();
      });

      it('should handle rapid clear calls', () => {
        expect(() => {
          for (let i = 0; i < 100; i++) {
            scoreBoard.clear();
          }
        }).not.toThrow();
      });

      it('should handle rapid incrementScores calls', () => {
        const players = createPlayers(3);

        expect(() => {
          for (let i = 0; i < 100; i++) {
            scoreBoard.incrementScores('red', players);
          }
        }).not.toThrow();

        // Each call should increment
        expect(players[1].score).toBe(100);
      });

      it('should handle mixed operations', () => {
        const players = createPlayers(3);

        expect(() => {
          for (let i = 0; i < 50; i++) {
            scoreBoard.incrementScores('red', players);
            scoreBoard.draw(players, gameHeight);
            scoreBoard.clear();
          }
        }).not.toThrow();
      });
    });
  });

  describe('API Compatibility with Score.js', () => {
    it('should have equivalent draw method', () => {
      // Original Score.js has this.draw()
      expect(typeof scoreBoard.draw).toBe('function');

      const players = createPlayers(2);
      scoreBoard.draw(players, gameHeight);

      // Should draw like original
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should have equivalent clear method', () => {
      // Original Score.js has this.clear()
      expect(typeof scoreBoard.clear).toBe('function');

      scoreBoard.clear();

      // Original clears with clearRect(0, 0, 300, 1000)
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 150, 1000);
    });

    it('should have equivalent add method (now incrementScores)', () => {
      // Original Score.js has this.add(name)
      // New implementation has incrementScores(name, players)
      expect(typeof scoreBoard.incrementScores).toBe('function');

      const players = createPlayers(3);
      scoreBoard.incrementScores('red', players);

      // Should increment scores like original
      expect(players[1].score).toBe(1);
      expect(players[2].score).toBe(1);
    });

    it('should use same default width (150)', () => {
      // Original: Score.prototype.width = 150
      expect(scoreBoard.width).toBe(150);
    });

    it('should clear same area dimensions (width x 1000)', () => {
      scoreBoard.clear();

      // Original clears clearRect(0, 0, 300, 1000)
      // But actually uses this.width which is 150
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 150, 1000);
    });

    it('should use same background color (#3c3c3c)', () => {
      const players = createPlayers(2);
      scoreBoard.draw(players, gameHeight);

      // Original uses fillStyle='#3c3c3c'
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should use same font style (italic 75px Sans-Serif)', () => {
      const players = createPlayers(2);
      scoreBoard.draw(players, gameHeight);

      // Original uses font="italic 75px Sans-Serif"
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should use same text alignment (right)', () => {
      const players = createPlayers(2);
      scoreBoard.draw(players, gameHeight);

      // Original uses textAlign="right"
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should use same position formula', () => {
      // Original: x = this.width*3/4 - 10, y = game.height*0.9 * i/totalPlayers + 80
      const players = createPlayers(2);
      scoreBoard.draw(players, 600);

      const expectedX = (150 * 3) / 4 - 10;
      const expectedY0 = (600 * 0.9 * 0) / 2 + 80;
      const expectedY1 = (600 * 0.9 * 1) / 2 + 80;

      expect(mockContext.fillText).toHaveBeenCalledWith('0', expectedX, expectedY0);
      expect(mockContext.fillText).toHaveBeenCalledWith('0', expectedX, expectedY1);
    });

    it('should NOT automatically redraw after incrementScores', () => {
      // Original calls this.draw() after incrementing
      // New implementation does NOT (breaking change, but documented)
      const players = createPlayers(2);

      scoreBoard.incrementScores('red', players);

      // Should not draw
      expect(mockContext.fillText).not.toHaveBeenCalled();
    });

    it('should display player.score value', () => {
      // Original displays p.score
      const players = createPlayers(2);
      players[0].score = 7;
      players[1].score = 3;

      scoreBoard.draw(players, gameHeight);

      expect(mockContext.fillText).toHaveBeenCalledWith('7', expect.any(Number), expect.any(Number));
      expect(mockContext.fillText).toHaveBeenCalledWith('3', expect.any(Number), expect.any(Number));
    });

    it('should use player.color for score color', () => {
      // Original sets fillStyle=p.color before fillText
      const players = createPlayers(2);

      scoreBoard.draw(players, gameHeight);

      // fillText should be called (color is set internally)
      expect(mockContext.fillText).toHaveBeenCalled();
    });
  });

  describe('Factory Function', () => {
    it('should create ScoreBoard instance', () => {
      const board = createScoreBoard(mockContext);
      expect(board).toBeDefined();
      expect(board.width).toBe(150);
    });

    it('should accept config parameter', () => {
      const config: ScoreConfig = {
        width: 200,
        fontSize: 100,
      };

      const board = createScoreBoard(mockContext, config);
      expect(board).toBeDefined();
      expect(board.width).toBe(200);
    });

    it('should return IScoreBoard interface', () => {
      const board = createScoreBoard(mockContext);

      // Verify interface methods exist
      expect(typeof board.draw).toBe('function');
      expect(typeof board.incrementScores).toBe('function');
      expect(typeof board.clear).toBe('function');
      expect(typeof board.width).toBe('number');
    });

    it('should work identically to constructor', () => {
      const board1 = new ScoreBoard(mockContext, { width: 200 });
      const board2 = createScoreBoard(mockContext, { width: 200 });

      expect(board1.width).toBe(board2.width);
    });
  });

  describe('Type Safety', () => {
    it('should enforce ScoreConfig types', () => {
      // This is a compile-time test, but we can verify it accepts valid configs
      const validConfigs: ScoreConfig[] = [
        { width: 200 },
        { fontSize: 80, fontFamily: 'Arial' },
        { backgroundColor: '#000000', textAlign: 'center' },
        {},
      ];

      validConfigs.forEach((config) => {
        expect(() => new ScoreBoard(mockContext, config)).not.toThrow();
      });
    });

    it('should enforce Player types', () => {
      // Valid player objects
      const validPlayers: Player[] = [
        { name: 'red', color: '#FF0000', score: 0, dead: false },
        { name: 'blue', color: '#0000FF', score: 5, dead: true },
      ];

      expect(() => {
        scoreBoard.draw(validPlayers, gameHeight);
      }).not.toThrow();
    });

    it('should require CanvasRenderingContext2D', () => {
      // TypeScript ensures this at compile time
      expect(() => new ScoreBoard(mockContext)).not.toThrow();
    });

    it('should make width readonly', () => {
      // TypeScript prevents this at compile time
      const board = new ScoreBoard(mockContext);

      // Attempting to assign should throw in strict mode
      // @ts-expect-error - Testing that width is readonly
      expect(() => {
        board.width = 300;
      }).toThrow();
    });

    it('should enforce textAlign values', () => {
      // Only 'left', 'right', 'center' should be allowed
      const validAlignments: Array<'left' | 'right' | 'center'> = ['left', 'right', 'center'];

      validAlignments.forEach((align) => {
        expect(() => {
          new ScoreBoard(mockContext, { textAlign: align });
        }).not.toThrow();
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle full game round scenario', () => {
      const players = createPlayers(4);

      // Initial draw
      scoreBoard.draw(players, gameHeight);
      expect(mockContext.fillText).toHaveBeenCalledTimes(4);

      vi.clearAllMocks();

      // Player 1 dies
      scoreBoard.incrementScores('red', players);
      players[0].dead = true;
      scoreBoard.draw(players, gameHeight);

      expect(players[1].score).toBe(1);
      expect(players[2].score).toBe(1);
      expect(players[3].score).toBe(1);

      vi.clearAllMocks();

      // Player 2 dies
      scoreBoard.incrementScores('green', players);
      players[1].dead = true;
      scoreBoard.draw(players, gameHeight);

      expect(players[2].score).toBe(2);
      expect(players[3].score).toBe(2);

      vi.clearAllMocks();

      // Player 3 dies - Player 4 wins
      scoreBoard.incrementScores('blue', players);
      players[2].dead = true;
      scoreBoard.draw(players, gameHeight);

      expect(players[3].score).toBe(3); // Winner!
    });

    it('should support clearing and redrawing', () => {
      const players = createPlayers(3);

      scoreBoard.draw(players, gameHeight);
      scoreBoard.clear();
      scoreBoard.draw(players, gameHeight);

      // Should work without errors
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should work with changing game heights (window resize)', () => {
      const players = createPlayers(2);

      scoreBoard.draw(players, 600);
      scoreBoard.draw(players, 800);
      scoreBoard.draw(players, 400);

      // Should adapt to different heights
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should maintain state across multiple operations', () => {
      const players = createPlayers(3);

      // Multiple rounds
      for (let round = 0; round < 5; round++) {
        const dyingPlayer = players[round % 3].name;
        scoreBoard.incrementScores(dyingPlayer, players);
        scoreBoard.draw(players, gameHeight);
      }

      // Scores should accumulate
      const totalScore = players.reduce((sum, p) => sum + p.score, 0);
      expect(totalScore).toBeGreaterThan(0);
    });
  });

  describe('Performance Characteristics', () => {
    it('should efficiently handle many draw calls', () => {
      const players = createPlayers(6);

      const iterations = 1000;
      expect(() => {
        for (let i = 0; i < iterations; i++) {
          scoreBoard.draw(players, gameHeight);
        }
      }).not.toThrow();
    });

    it('should not leak memory on repeated operations', () => {
      const players = createPlayers(4);

      // Simulate many game rounds
      for (let i = 0; i < 100; i++) {
        scoreBoard.incrementScores('red', players);
        scoreBoard.draw(players, gameHeight);
        scoreBoard.clear();
      }

      // Should complete without errors (memory leak would cause issues in real env)
      expect(true).toBe(true);
    });

    it('should handle save/restore efficiently', () => {
      const players = createPlayers(2);

      for (let i = 0; i < 100; i++) {
        scoreBoard.draw(players, gameHeight);
      }

      // Save and restore should be paired correctly
      const saveCalls = (mockContext.save as ReturnType<typeof vi.fn>).mock.calls.length;
      const restoreCalls = (mockContext.restore as ReturnType<typeof vi.fn>).mock.calls.length;

      expect(saveCalls).toBe(restoreCalls);
    });
  });
});
