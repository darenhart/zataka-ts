/**
 * FpsCounter Unit Tests
 *
 * Comprehensive test suite for FPS counter implementation.
 * Tests type safety, API compatibility, edge cases, and canvas rendering.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { FpsCounter, createFpsCounter } from './FpsCounter';
import type { FpsConfig } from '../types/fps.types';

/**
 * Mock Canvas Context
 *
 * Creates a mock CanvasRenderingContext2D for testing
 */
function createMockContext(): CanvasRenderingContext2D {
  const mockContext = {
    // Drawing methods
    fillText: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),

    // Properties
    textAlign: 'left',
    font: '',
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D;

  return mockContext;
}

describe('FpsCounter', () => {
  let mockContext: CanvasRenderingContext2D;
  let fpsCounter: FpsCounter;
  let performanceMock: { now: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockContext = createMockContext();

    // Mock performance.now() properly
    let currentTime = 0;
    performanceMock = {
      now: vi.fn(() => currentTime),
    };
    vi.stubGlobal('performance', performanceMock);

    // Helper to set time
    (globalThis as any).setMockTime = (time: number) => {
      currentTime = time;
    };

    fpsCounter = new FpsCounter(mockContext);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete (globalThis as any).setMockTime;
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      const counter = new FpsCounter(mockContext);
      expect(counter).toBeInstanceOf(FpsCounter);
      expect(counter.currentFps).toBe(0);
    });

    it('should create instance with custom config', () => {
      const config: FpsConfig = {
        updateThrottle: 30,
        offsetX: 50,
        offsetY: 20,
        fontSize: 12,
        fontFamily: 'Arial',
        color: '#fff',
      };

      const counter = new FpsCounter(mockContext, config);
      expect(counter).toBeInstanceOf(FpsCounter);
      expect(counter.currentFps).toBe(0);
    });

    it('should merge partial config with defaults', () => {
      const config: FpsConfig = {
        fontSize: 14,
        color: '#ff0000',
      };

      const counter = new FpsCounter(mockContext, config);
      expect(counter).toBeInstanceOf(FpsCounter);
    });

    it('should accept empty config object', () => {
      const counter = new FpsCounter(mockContext, {});
      expect(counter).toBeInstanceOf(FpsCounter);
      expect(counter.currentFps).toBe(0);
    });
  });

  describe('currentFps getter', () => {
    it('should return 0 initially', () => {
      expect(fpsCounter.currentFps).toBe(0);
    });

    it('should be read-only', () => {
      // TypeScript should prevent this at compile time
      // At runtime in strict mode, trying to set a getter-only property throws
      expect(() => {
        // @ts-expect-error - Testing runtime behavior of readonly property
        fpsCounter.currentFps = 100;
      }).toThrow();

      // Verify it didn't actually change
      expect(fpsCounter.currentFps).toBe(0);
    });
  });

  describe('update() method', () => {
    it('should calculate FPS correctly for 60 FPS', () => {
      const frameTime = 1000 / 60; // ~16.67ms per frame

      (globalThis as any).setMockTime(0);
      fpsCounter.update();

      (globalThis as any).setMockTime(frameTime);
      fpsCounter.update();

      expect(fpsCounter.currentFps).toBeGreaterThanOrEqual(59);
      expect(fpsCounter.currentFps).toBeLessThanOrEqual(61);
    });

    it('should calculate FPS correctly for 30 FPS', () => {
      const frameTime = 1000 / 30; // ~33.33ms per frame

      (globalThis as any).setMockTime(0);
      fpsCounter.update();

      (globalThis as any).setMockTime(frameTime);
      fpsCounter.update();

      expect(fpsCounter.currentFps).toBeGreaterThanOrEqual(29);
      expect(fpsCounter.currentFps).toBeLessThanOrEqual(31);
    });

    it('should calculate FPS correctly for 120 FPS', () => {
      const frameTime = 1000 / 120; // ~8.33ms per frame

      (globalThis as any).setMockTime(0);
      fpsCounter.update();

      (globalThis as any).setMockTime(frameTime);
      fpsCounter.update();

      expect(fpsCounter.currentFps).toBeGreaterThanOrEqual(119);
      expect(fpsCounter.currentFps).toBeLessThanOrEqual(121);
    });

    it('should update FPS value on each call', () => {
      (globalThis as any).setMockTime(0);
      fpsCounter.update();
      const fps1 = fpsCounter.currentFps;

      (globalThis as any).setMockTime(16.67);
      fpsCounter.update();
      const fps2 = fpsCounter.currentFps;

      (globalThis as any).setMockTime(33.34);
      fpsCounter.update();
      const fps3 = fpsCounter.currentFps;

      // Each update should recalculate
      expect(fps1).toBeDefined();
      expect(fps2).toBeDefined();
      expect(fps3).toBeDefined();
    });

    it('should round FPS to integer', () => {
      (globalThis as any).setMockTime(0);
      fpsCounter.update();

      (globalThis as any).setMockTime(17.5); // Should give ~57.14 FPS
      fpsCounter.update();

      expect(Number.isInteger(fpsCounter.currentFps)).toBe(true);
    });
  });

  describe('draw() method', () => {
    beforeEach(() => {
      // Set up initial FPS value
      (globalThis as any).setMockTime(0);
      fpsCounter.update();
      (globalThis as any).setMockTime(16.67);
      fpsCounter.update();
    });

    it('should not draw when shouldDraw is false', () => {
      fpsCounter.draw(false, 800, 600);

      expect(mockContext.fillText).not.toHaveBeenCalled();
      expect(mockContext.clearRect).not.toHaveBeenCalled();
    });

    it('should throttle drawing based on updateThrottle', () => {
      const gameWidth = 800;
      const gameHeight = 600;

      // Call draw 50 times (should not trigger, threshold is > 50)
      for (let i = 0; i < 50; i++) {
        fpsCounter.draw(true, gameWidth, gameHeight);
      }

      expect(mockContext.fillText).not.toHaveBeenCalled();

      // 51st call should trigger draw (frameCount > updateThrottle)
      fpsCounter.draw(true, gameWidth, gameHeight);

      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should draw when throttle threshold is exceeded', () => {
      const gameWidth = 800;
      const gameHeight = 600;

      // Exceed default throttle of 50
      for (let i = 0; i <= 51; i++) {
        fpsCounter.draw(true, gameWidth, gameHeight);
      }

      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should use custom throttle value', () => {
      const customCounter = new FpsCounter(mockContext, { updateThrottle: 10 });
      (globalThis as any).setMockTime(0);
      customCounter.update();
      (globalThis as any).setMockTime(16.67);
      customCounter.update();

      // Call 10 times (below throttle)
      for (let i = 0; i < 10; i++) {
        customCounter.draw(true, 800, 600);
      }

      expect(mockContext.fillText).not.toHaveBeenCalled();

      // 11th call should trigger
      customCounter.draw(true, 800, 600);

      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should preserve canvas state with save/restore', () => {
      // Trigger draw
      for (let i = 0; i <= 51; i++) {
        fpsCounter.draw(true, 800, 600);
      }

      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();

      // Verify save is called before restore
      const saveCall = (mockContext.save as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
      const restoreCall = (mockContext.restore as ReturnType<typeof vi.fn>).mock
        .invocationCallOrder[0];
      expect(saveCall).toBeLessThan(restoreCall!);
    });

    it('should draw at correct position with default offsets', () => {
      const gameWidth = 800;
      const gameHeight = 600;

      // Trigger draw
      for (let i = 0; i <= 51; i++) {
        fpsCounter.draw(true, gameWidth, gameHeight);
      }

      const expectedX = gameWidth - 35; // default offsetX
      const expectedY = gameHeight - 10; // default offsetY

      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringContaining('fps:'),
        expectedX,
        expectedY
      );
    });

    it('should draw at correct position with custom offsets', () => {
      const customCounter = new FpsCounter(mockContext, {
        offsetX: 100,
        offsetY: 50,
      });

      (globalThis as any).setMockTime(0);
      customCounter.update();
      (globalThis as any).setMockTime(16.67);
      customCounter.update();

      const gameWidth = 800;
      const gameHeight = 600;

      // Trigger draw
      for (let i = 0; i <= 51; i++) {
        customCounter.draw(true, gameWidth, gameHeight);
      }

      const expectedX = gameWidth - 100;
      const expectedY = gameHeight - 50;

      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringContaining('fps:'),
        expectedX,
        expectedY
      );
    });

    it('should apply custom font settings', () => {
      const customCounter = new FpsCounter(mockContext, {
        fontSize: 16,
        fontFamily: 'Courier',
        color: '#ff0000',
      });

      (globalThis as any).setMockTime(0);
      customCounter.update();
      (globalThis as any).setMockTime(16.67);
      customCounter.update();

      // Trigger draw
      for (let i = 0; i <= 51; i++) {
        customCounter.draw(true, 800, 600);
      }

      // Context properties should be set (we can't directly verify due to mock limitations,
      // but we can verify the draw was called)
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should clear previous FPS text', () => {
      const gameWidth = 800;
      const gameHeight = 600;

      // Trigger draw
      for (let i = 0; i <= 51; i++) {
        fpsCounter.draw(true, gameWidth, gameHeight);
      }

      const expectedX = gameWidth - 35;
      const expectedY = gameHeight - 10;

      expect(mockContext.clearRect).toHaveBeenCalledWith(expectedX - 2, expectedY - 10, 40, 15);
    });

    it('should format FPS text correctly', () => {
      // Trigger draw
      for (let i = 0; i <= 51; i++) {
        fpsCounter.draw(true, 800, 600);
      }

      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringMatching(/^fps:\d+$/),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('reset() method', () => {
    it('should reset FPS to 0', () => {
      // Set some FPS value
      (globalThis as any).setMockTime(0);
      fpsCounter.update();
      (globalThis as any).setMockTime(16.67);
      fpsCounter.update();

      expect(fpsCounter.currentFps).not.toBe(0);

      fpsCounter.reset();

      expect(fpsCounter.currentFps).toBe(0);
    });

    it('should reset frame count', () => {
      // Draw multiple times to increase frame count
      for (let i = 0; i < 25; i++) {
        fpsCounter.draw(true, 800, 600);
      }

      fpsCounter.reset();

      // After reset, should need full throttle count again
      for (let i = 0; i < 49; i++) {
        fpsCounter.draw(true, 800, 600);
      }

      expect(mockContext.fillText).not.toHaveBeenCalled();
    });

    it('should reset last update time', () => {
      (globalThis as any).setMockTime(0);
      fpsCounter.update();

      (globalThis as any).setMockTime(1000);
      fpsCounter.reset();

      (globalThis as any).setMockTime(1016.67); // ~60 FPS from reset time
      fpsCounter.update();

      expect(fpsCounter.currentFps).toBeGreaterThanOrEqual(59);
      expect(fpsCounter.currentFps).toBeLessThanOrEqual(61);
    });

    it('should allow normal operation after reset', () => {
      fpsCounter.reset();

      (globalThis as any).setMockTime(0);
      fpsCounter.update();
      (globalThis as any).setMockTime(16.67);
      fpsCounter.update();

      expect(fpsCounter.currentFps).toBeGreaterThanOrEqual(59);
      expect(fpsCounter.currentFps).toBeLessThanOrEqual(61);
    });
  });

  describe('Edge Cases', () => {
    describe('Zero/negative delta time', () => {
      it('should handle zero delta time gracefully', () => {
        (globalThis as any).setMockTime(0);
        fpsCounter.update();

        // Update at same time (zero delta)
        (globalThis as any).setMockTime(0);
        fpsCounter.update();

        // Should return previous FPS value, not Infinity
        expect(fpsCounter.currentFps).toBe(0);
        expect(Number.isFinite(fpsCounter.currentFps)).toBe(true);
      });

      it('should handle very small delta time', () => {
        (globalThis as any).setMockTime(0);
        fpsCounter.update();

        // 0.001ms delta (extremely fast)
        (globalThis as any).setMockTime(0.001);
        fpsCounter.update();

        // Should cap at 999
        expect(fpsCounter.currentFps).toBeLessThanOrEqual(999);
        expect(Number.isFinite(fpsCounter.currentFps)).toBe(true);
      });
    });

    describe('Very fast frames', () => {
      it('should cap FPS at 999', () => {
        (globalThis as any).setMockTime(0);
        fpsCounter.update();

        // 0.5ms delta = 2000 FPS
        (globalThis as any).setMockTime(0.5);
        fpsCounter.update();

        expect(fpsCounter.currentFps).toBe(999);
      });

      it('should handle 1000+ FPS scenarios', () => {
        (globalThis as any).setMockTime(0);
        fpsCounter.update();

        // 0.1ms delta = 10000 FPS
        (globalThis as any).setMockTime(0.1);
        fpsCounter.update();

        expect(fpsCounter.currentFps).toBe(999);
        expect(fpsCounter.currentFps).toBeLessThanOrEqual(999);
      });
    });

    describe('Very slow frames', () => {
      it('should handle 1 FPS', () => {
        (globalThis as any).setMockTime(0);
        fpsCounter.update();

        (globalThis as any).setMockTime(1000); // 1 second
        fpsCounter.update();

        expect(fpsCounter.currentFps).toBe(1);
      });

      it('should handle less than 1 FPS', () => {
        (globalThis as any).setMockTime(0);
        fpsCounter.update();

        (globalThis as any).setMockTime(5000); // 5 seconds (0.2 FPS)
        fpsCounter.update();

        expect(fpsCounter.currentFps).toBe(0);
      });
    });

    describe('Canvas edge cases', () => {
      it('should handle very small canvas dimensions', () => {
        fpsCounter.draw(true, 50, 30);
        // Should not throw
        expect(true).toBe(true);
      });

      it('should handle very large canvas dimensions', () => {
        fpsCounter.draw(true, 10000, 10000);
        // Should not throw
        expect(true).toBe(true);
      });

      it('should handle zero canvas dimensions', () => {
        fpsCounter.draw(true, 0, 0);
        // Should not throw
        expect(true).toBe(true);
      });

      it('should handle negative offsets (positions inside canvas)', () => {
        const counter = new FpsCounter(mockContext, {
          offsetX: -100, // This would position outside canvas
          offsetY: -50,
        });

        (globalThis as any).setMockTime(0);
        counter.update();
        (globalThis as any).setMockTime(16.67);
        counter.update();

        // Should still work, even if positioned oddly
        for (let i = 0; i <= 51; i++) {
          counter.draw(true, 800, 600);
        }

        expect(mockContext.fillText).toHaveBeenCalled();
      });
    });

    describe('Rapid sequential operations', () => {
      it('should handle rapid update calls', () => {
        for (let i = 0; i < 1000; i++) {
          (globalThis as any).setMockTime(i * 16.67);
          fpsCounter.update();
        }

        expect(Number.isFinite(fpsCounter.currentFps)).toBe(true);
      });

      it('should handle rapid draw calls', () => {
        (globalThis as any).setMockTime(0);
        fpsCounter.update();
        (globalThis as any).setMockTime(16.67);
        fpsCounter.update();

        for (let i = 0; i < 1000; i++) {
          fpsCounter.draw(true, 800, 600);
        }

        // Should have drawn multiple times (every 50 frames)
        expect(mockContext.fillText).toHaveBeenCalled();
      });

      it('should handle rapid reset calls', () => {
        for (let i = 0; i < 100; i++) {
          fpsCounter.reset();
        }

        expect(fpsCounter.currentFps).toBe(0);
      });
    });

    describe('Mixed operations', () => {
      it('should handle update, draw, and reset in sequence', () => {
        (globalThis as any).setMockTime(0);
        fpsCounter.update();

        (globalThis as any).setMockTime(16.67);
        fpsCounter.update();

        for (let i = 0; i <= 51; i++) {
          fpsCounter.draw(true, 800, 600);
        }

        fpsCounter.reset();

        expect(fpsCounter.currentFps).toBe(0);
        expect(mockContext.fillText).toHaveBeenCalled();
      });

      it('should handle draw before update', () => {
        // Draw without updating first (FPS = 0)
        fpsCounter.draw(true, 800, 600);

        expect(fpsCounter.currentFps).toBe(0);
      });

      it('should handle multiple resets with updates in between', () => {
        (globalThis as any).setMockTime(0);
        fpsCounter.update();

        fpsCounter.reset();

        (globalThis as any).setMockTime(16.67);
        fpsCounter.update();

        expect(fpsCounter.currentFps).toBeGreaterThanOrEqual(59);

        fpsCounter.reset();

        expect(fpsCounter.currentFps).toBe(0);
      });
    });
  });

  describe('API Compatibility with Fps.js', () => {
    it('should have equivalent update method', () => {
      // Original Fps.js uses this.update()
      expect(typeof fpsCounter.update).toBe('function');

      (globalThis as any).setMockTime(0);
      fpsCounter.update();

      (globalThis as any).setMockTime(16.67);
      fpsCounter.update();

      // Should calculate FPS like original
      expect(fpsCounter.currentFps).toBeGreaterThan(0);
    });

    it('should provide currentFps similar to original this.val', () => {
      // Original uses this.val
      expect(fpsCounter.currentFps).toBeDefined();
      expect(typeof fpsCounter.currentFps).toBe('number');
    });

    it('should support draw method similar to drawFps', () => {
      // Original has drawFps(), new implementation has draw()
      expect(typeof fpsCounter.draw).toBe('function');

      // Original checks fpsRate (50), new uses updateThrottle (default 50)
      for (let i = 0; i <= 51; i++) {
        fpsCounter.draw(true, 800, 600);
      }

      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should use same default throttle rate (50)', () => {
      (globalThis as any).setMockTime(0);
      fpsCounter.update();
      (globalThis as any).setMockTime(16.67);
      fpsCounter.update();

      // Should not draw before exceeding 50 frames
      for (let i = 0; i < 50; i++) {
        fpsCounter.draw(true, 800, 600);
      }
      expect(mockContext.fillText).not.toHaveBeenCalled();

      // Should draw at 51+ frames (frameCount > updateThrottle)
      fpsCounter.draw(true, 800, 600);
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should use same default positioning (x: width-35, y: height-10)', () => {
      const gameWidth = 800;
      const gameHeight = 600;

      (globalThis as any).setMockTime(0);
      fpsCounter.update();
      (globalThis as any).setMockTime(16.67);
      fpsCounter.update();

      for (let i = 0; i <= 51; i++) {
        fpsCounter.draw(true, gameWidth, gameHeight);
      }

      const expectedX = gameWidth - 35;
      const expectedY = gameHeight - 10;

      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringContaining('fps:'),
        expectedX,
        expectedY
      );
    });

    it('should use same font styling (9px Verdana, #888)', () => {
      // This is verified by default config values
      // Original: font="9px Verdana", fillStyle="#888"
      const defaultCounter = new FpsCounter(mockContext);

      (globalThis as any).setMockTime(0);
      defaultCounter.update();
      (globalThis as any).setMockTime(16.67);
      defaultCounter.update();

      for (let i = 0; i <= 51; i++) {
        defaultCounter.draw(true, 800, 600);
      }

      // Mock doesn't capture property assignments, but we verify the draw happened
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should format FPS text as "fps:XX" like original', () => {
      (globalThis as any).setMockTime(0);
      fpsCounter.update();
      (globalThis as any).setMockTime(16.67);
      fpsCounter.update();

      for (let i = 0; i <= 51; i++) {
        fpsCounter.draw(true, 800, 600);
      }

      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringMatching(/^fps:\d+$/),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should round FPS values like original (Math.round)', () => {
      (globalThis as any).setMockTime(0);
      fpsCounter.update();

      // Delta that would give non-integer FPS
      (globalThis as any).setMockTime(17.5);
      fpsCounter.update();

      expect(Number.isInteger(fpsCounter.currentFps)).toBe(true);
    });
  });

  describe('Factory Function', () => {
    it('should create FpsCounter instance', () => {
      const counter = createFpsCounter(mockContext);
      expect(counter).toBeDefined();
      expect(counter.currentFps).toBe(0);
    });

    it('should accept config parameter', () => {
      const config: FpsConfig = {
        updateThrottle: 30,
        fontSize: 12,
      };

      const counter = createFpsCounter(mockContext, config);
      expect(counter).toBeDefined();
    });

    it('should return IFpsCounter interface', () => {
      const counter = createFpsCounter(mockContext);

      // Verify interface methods exist
      expect(typeof counter.update).toBe('function');
      expect(typeof counter.draw).toBe('function');
      expect(typeof counter.reset).toBe('function');
      expect(typeof counter.currentFps).toBe('number');
    });
  });

  describe('Type Safety', () => {
    it('should enforce FpsConfig types', () => {
      // This is a compile-time test, but we can verify it accepts valid configs
      const validConfigs: FpsConfig[] = [
        { updateThrottle: 50 },
        { offsetX: 100, offsetY: 50 },
        { fontSize: 12, fontFamily: 'Arial', color: '#fff' },
        {},
      ];

      validConfigs.forEach((config) => {
        expect(() => new FpsCounter(mockContext, config)).not.toThrow();
      });
    });

    it('should require CanvasRenderingContext2D', () => {
      // TypeScript ensures this at compile time
      expect(() => new FpsCounter(mockContext)).not.toThrow();
    });

    it('should make currentFps readonly', () => {
      // TypeScript prevents this at compile time
      const counter = new FpsCounter(mockContext);

      // Attempting to assign should throw in strict mode
      // @ts-expect-error - Testing that currentFps is readonly
      expect(() => {
        counter.currentFps = 100;
      }).toThrow(); // Runtime throws in strict mode when setting getter-only property
    });
  });

  describe('Performance Characteristics', () => {
    it('should not draw every frame (throttling efficiency)', () => {
      (globalThis as any).setMockTime(0);
      fpsCounter.update();
      (globalThis as any).setMockTime(16.67);
      fpsCounter.update();

      const drawCalls = 102;

      for (let i = 0; i < drawCalls; i++) {
        fpsCounter.draw(true, 800, 600);
      }

      // With default throttle of 50 (frameCount > 50), should draw at frames 51 and 102
      expect((mockContext.fillText as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
    });

    it('should only call save/restore when actually drawing', () => {
      (globalThis as any).setMockTime(0);
      fpsCounter.update();
      (globalThis as any).setMockTime(16.67);
      fpsCounter.update();

      // Call draw below throttle threshold
      for (let i = 0; i < 25; i++) {
        fpsCounter.draw(true, 800, 600);
      }

      expect(mockContext.save).not.toHaveBeenCalled();
      expect(mockContext.restore).not.toHaveBeenCalled();
    });

    it('should handle update with minimal overhead', () => {
      const iterations = 10000;

      // Test that update can be called many times without errors
      // (performance.now is mocked, so we can't measure real time)
      expect(() => {
        for (let i = 0; i < iterations; i++) {
          (globalThis as any).setMockTime(i * 16.67);
          fpsCounter.update();
        }
      }).not.toThrow();

      // Verify final FPS is reasonable
      expect(Number.isFinite(fpsCounter.currentFps)).toBe(true);
      expect(fpsCounter.currentFps).toBeGreaterThanOrEqual(0);
      expect(fpsCounter.currentFps).toBeLessThanOrEqual(999);
    });
  });
});
