/**
 * AdvancedSettings Unit Tests
 *
 * Comprehensive test suite for AdvancedSettings implementation.
 * Tests type safety, API compatibility, edge cases, and DOM manipulation.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AdvancedSettings, createAdvancedSettings } from './AdvancedSettings';
import { configurations } from '../../config/gameConfigurations';
import type {
  AdvancedSettingsConfig,
  AdvancedSettingsElements,
} from '../../types/settings.types';
import type { PresetName } from '../../config/gameConfigurations';

/**
 * Create mock DOM elements for testing
 */
function createMockElements(): AdvancedSettingsElements {
  // Create mock input elements
  const createInput = (value = '0'): HTMLInputElement => {
    const input = document.createElement('input');
    input.value = value;
    return input;
  };

  // Create mock buttons
  const createButton = (preset?: PresetName): HTMLButtonElement => {
    const button = document.createElement('button');
    if (preset) {
      button.setAttribute('data-preset', preset);
    }
    return button;
  };

  // Create mock container elements
  const form = document.createElement('div');
  const advancedPanel = document.createElement('div');

  return {
    advancedButton: createButton(),
    form,
    advancedPanel,
    classicButton: createButton('classic'),
    presetButtons: [
      createButton('classic'),
      createButton('agility'),
      createButton('strategy'),
    ],
    inputs: {
      maxRounds: createInput('15'),
      size: createInput('3'),
      speed: createInput('1.6'),
      curveSpeed: createInput('2'),
      holeRate: createInput('450'),
      holeRateRnd: createInput('200'),
      holeSize: createInput('11'),
      holeSizeRnd: createInput('3'),
    },
  };
}

describe('AdvancedSettings', () => {
  let mockElements: AdvancedSettingsElements;
  let advancedSettings: AdvancedSettings;

  beforeEach(() => {
    mockElements = createMockElements();
    advancedSettings = new AdvancedSettings();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      const settings = new AdvancedSettings();
      expect(settings).toBeInstanceOf(AdvancedSettings);
      expect(settings.active).toBe(false);
    });

    it('should create instance with custom config', () => {
      const config: AdvancedSettingsConfig = {
        defaultPreset: 'agility',
        buttonClassicText: 'Classic Mode',
        buttonAdvancedText: 'Advanced Mode',
      };

      const settings = new AdvancedSettings(config);
      expect(settings).toBeInstanceOf(AdvancedSettings);
      expect(settings.active).toBe(false);
    });

    it('should merge partial config with defaults', () => {
      const config: AdvancedSettingsConfig = {
        defaultPreset: 'strategy',
      };

      const settings = new AdvancedSettings(config);
      expect(settings).toBeInstanceOf(AdvancedSettings);
    });

    it('should accept empty config object', () => {
      const settings = new AdvancedSettings({});
      expect(settings).toBeInstanceOf(AdvancedSettings);
      expect(settings.active).toBe(false);
    });

    it('should not throw with minimal required parameters', () => {
      expect(() => new AdvancedSettings()).not.toThrow();
    });

    it('should start in inactive state', () => {
      const settings = new AdvancedSettings();
      expect(settings.active).toBe(false);
    });
  });

  describe('active getter', () => {
    it('should return false initially', () => {
      expect(advancedSettings.active).toBe(false);
    });

    it('should return current active state', () => {
      advancedSettings.initialize(mockElements);
      expect(advancedSettings.active).toBe(false);

      // Simulate toggle
      mockElements.advancedButton.click();
      expect(advancedSettings.active).toBe(true);
    });

    it('should be read-only', () => {
      expect(() => {
        // @ts-expect-error - Testing runtime behavior of readonly property
        advancedSettings.active = true;
      }).toThrow();

      // Verify it didn't actually change
      expect(advancedSettings.active).toBe(false);
    });
  });

  describe('initialize() method', () => {
    it('should accept DOM elements', () => {
      expect(() => {
        advancedSettings.initialize(mockElements);
      }).not.toThrow();
    });

    it('should load default preset (classic)', () => {
      advancedSettings.initialize(mockElements);

      expect(mockElements.inputs.maxRounds.value).toBe('15');
      expect(mockElements.inputs.size.value).toBe('3');
      expect(mockElements.inputs.speed.value).toBe('1.6');
      expect(mockElements.inputs.curveSpeed.value).toBe('2');
    });

    it('should load custom default preset', () => {
      const settings = new AdvancedSettings({ defaultPreset: 'agility' });
      settings.initialize(mockElements);

      expect(mockElements.inputs.maxRounds.value).toBe('20');
      expect(mockElements.inputs.size.value).toBe('4');
      expect(mockElements.inputs.speed.value).toBe('3');
    });

    it('should set up event handlers', () => {
      const clickSpy = vi.spyOn(mockElements.advancedButton, 'addEventListener');

      advancedSettings.initialize(mockElements);

      expect(clickSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should set up preset button handlers', () => {
      const spies = mockElements.presetButtons.map((btn) =>
        vi.spyOn(btn, 'addEventListener')
      );

      advancedSettings.initialize(mockElements);

      spies.forEach((spy) => {
        expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
      });
    });

    it('should not throw when called multiple times', () => {
      expect(() => {
        advancedSettings.initialize(mockElements);
        advancedSettings.initialize(mockElements);
      }).not.toThrow();
    });
  });

  describe('show() method', () => {
    it('should throw if not initialized', () => {
      expect(() => {
        advancedSettings.show();
      }).toThrow('AdvancedSettings not initialized. Call initialize() first.');
    });

    it('should set display to block', () => {
      advancedSettings.initialize(mockElements);
      advancedSettings.show();

      expect(mockElements.advancedPanel.style.display).toBe('block');
    });

    it('should not throw when called multiple times', () => {
      advancedSettings.initialize(mockElements);

      expect(() => {
        advancedSettings.show();
        advancedSettings.show();
        advancedSettings.show();
      }).not.toThrow();
    });

    it('should make panel visible after hiding', () => {
      advancedSettings.initialize(mockElements);
      advancedSettings.hide();
      advancedSettings.show();

      expect(mockElements.advancedPanel.style.display).toBe('block');
    });
  });

  describe('hide() method', () => {
    it('should throw if not initialized', () => {
      expect(() => {
        advancedSettings.hide();
      }).toThrow('AdvancedSettings not initialized. Call initialize() first.');
    });

    it('should set display to none', () => {
      advancedSettings.initialize(mockElements);
      advancedSettings.hide();

      expect(mockElements.advancedPanel.style.display).toBe('none');
    });

    it('should not throw when called multiple times', () => {
      advancedSettings.initialize(mockElements);

      expect(() => {
        advancedSettings.hide();
        advancedSettings.hide();
        advancedSettings.hide();
      }).not.toThrow();
    });

    it('should hide panel after showing', () => {
      advancedSettings.initialize(mockElements);
      advancedSettings.show();
      advancedSettings.hide();

      expect(mockElements.advancedPanel.style.display).toBe('none');
    });
  });

  describe('getConfiguration() method', () => {
    beforeEach(() => {
      advancedSettings.initialize(mockElements);
    });

    it('should throw if not initialized', () => {
      const uninitializedSettings = new AdvancedSettings();

      expect(() => {
        uninitializedSettings.getConfiguration();
      }).toThrow('AdvancedSettings not initialized. Call initialize() first.');
    });

    it('should return valid configuration object', () => {
      const config = advancedSettings.getConfiguration();

      expect(config).toHaveProperty('maxRounds');
      expect(config).toHaveProperty('size');
      expect(config).toHaveProperty('speed');
      expect(config).toHaveProperty('curveSpeed');
      expect(config).toHaveProperty('holeRate');
      expect(config).toHaveProperty('holeRateRnd');
      expect(config).toHaveProperty('holeSize');
      expect(config).toHaveProperty('holeSizeRnd');
    });

    it('should parse integer values', () => {
      mockElements.inputs.maxRounds.value = '10';
      const config = advancedSettings.getConfiguration();

      expect(config.maxRounds).toBe(10);
      expect(typeof config.maxRounds).toBe('number');
    });

    it('should parse float values', () => {
      mockElements.inputs.size.value = '3.5';
      mockElements.inputs.speed.value = '2.75';

      const config = advancedSettings.getConfiguration();

      expect(config.size).toBe(3.5);
      expect(config.speed).toBe(2.75);
    });

    it('should throw on NaN maxRounds', () => {
      mockElements.inputs.maxRounds.value = 'invalid';

      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow('Invalid value for maxRounds');
    });

    it('should throw on NaN size', () => {
      mockElements.inputs.size.value = 'abc';

      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow('Invalid value for size');
    });

    it('should throw on NaN speed', () => {
      mockElements.inputs.speed.value = '';

      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow('Invalid value for speed');
    });

    it('should throw on NaN curveSpeed', () => {
      mockElements.inputs.curveSpeed.value = 'NaN';

      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow('Invalid value for curveSpeed');
    });

    it('should throw on NaN holeRate', () => {
      mockElements.inputs.holeRate.value = 'not-a-number';

      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow('Invalid value for holeRate');
    });

    it('should throw on NaN holeRateRnd', () => {
      mockElements.inputs.holeRateRnd.value = '###';

      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow('Invalid value for holeRateRnd');
    });

    it('should throw on NaN holeSize', () => {
      mockElements.inputs.holeSize.value = 'invalid';

      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow('Invalid value for holeSize');
    });

    it('should throw on NaN holeSizeRnd', () => {
      mockElements.inputs.holeSizeRnd.value = 'xyz';

      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow('Invalid value for holeSizeRnd');
    });

    it('should throw on empty string inputs', () => {
      mockElements.inputs.maxRounds.value = '';

      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow('Invalid value for maxRounds');
    });

    it('should throw on whitespace-only inputs', () => {
      mockElements.inputs.speed.value = '   ';

      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow('Invalid value for speed');
    });

    it('should throw on invalid configuration (negative values)', () => {
      mockElements.inputs.maxRounds.value = '-5';

      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow('Invalid configuration values (out of valid range)');
    });

    it('should throw on invalid configuration (zero maxRounds)', () => {
      mockElements.inputs.maxRounds.value = '0';

      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow('Invalid configuration values (out of valid range)');
    });

    it('should accept zero for randomness values', () => {
      mockElements.inputs.holeRateRnd.value = '0';
      mockElements.inputs.holeSizeRnd.value = '0';

      expect(() => {
        advancedSettings.getConfiguration();
      }).not.toThrow();

      const config = advancedSettings.getConfiguration();
      expect(config.holeRateRnd).toBe(0);
      expect(config.holeSizeRnd).toBe(0);
    });

    it('should return classic configuration when loaded', () => {
      advancedSettings.setPreset('classic');
      const config = advancedSettings.getConfiguration();

      expect(config.maxRounds).toBe(configurations.classic.maxRounds);
      expect(config.size).toBe(configurations.classic.size);
      expect(config.speed).toBe(configurations.classic.speed);
    });

    it('should return agility configuration when loaded', () => {
      advancedSettings.setPreset('agility');
      const config = advancedSettings.getConfiguration();

      expect(config.maxRounds).toBe(configurations.agility.maxRounds);
      expect(config.size).toBe(configurations.agility.size);
      expect(config.speed).toBe(configurations.agility.speed);
    });

    it('should return strategy configuration when loaded', () => {
      advancedSettings.setPreset('strategy');
      const config = advancedSettings.getConfiguration();

      expect(config.maxRounds).toBe(configurations.strategy.maxRounds);
      expect(config.size).toBe(configurations.strategy.size);
      expect(config.speed).toBe(configurations.strategy.speed);
    });

    it('should return custom configuration after manual edits', () => {
      mockElements.inputs.maxRounds.value = '99';
      mockElements.inputs.size.value = '5.5';
      mockElements.inputs.speed.value = '10';

      const config = advancedSettings.getConfiguration();

      expect(config.maxRounds).toBe(99);
      expect(config.size).toBe(5.5);
      expect(config.speed).toBe(10);
    });

    it('should handle scientific notation', () => {
      mockElements.inputs.speed.value = '1.6e1'; // 16

      const config = advancedSettings.getConfiguration();
      expect(config.speed).toBe(16);
    });

    it('should handle leading zeros', () => {
      mockElements.inputs.maxRounds.value = '0015';

      const config = advancedSettings.getConfiguration();
      expect(config.maxRounds).toBe(15);
    });

    it('should handle decimal points without leading digit', () => {
      mockElements.inputs.speed.value = '.5';

      const config = advancedSettings.getConfiguration();
      expect(config.speed).toBe(0.5);
    });
  });

  describe('setPreset() method', () => {
    beforeEach(() => {
      advancedSettings.initialize(mockElements);
    });

    it('should throw if not initialized', () => {
      const uninitializedSettings = new AdvancedSettings();

      expect(() => {
        uninitializedSettings.setPreset('classic');
      }).toThrow('AdvancedSettings not initialized. Call initialize() first.');
    });

    it('should load classic preset', () => {
      advancedSettings.setPreset('classic');

      expect(mockElements.inputs.maxRounds.value).toBe('15');
      expect(mockElements.inputs.size.value).toBe('3');
      expect(mockElements.inputs.speed.value).toBe('1.6');
      expect(mockElements.inputs.curveSpeed.value).toBe('2');
      expect(mockElements.inputs.holeRate.value).toBe('450');
      expect(mockElements.inputs.holeRateRnd.value).toBe('200');
      expect(mockElements.inputs.holeSize.value).toBe('11');
      expect(mockElements.inputs.holeSizeRnd.value).toBe('3');
    });

    it('should load agility preset', () => {
      advancedSettings.setPreset('agility');

      expect(mockElements.inputs.maxRounds.value).toBe('20');
      expect(mockElements.inputs.size.value).toBe('4');
      expect(mockElements.inputs.speed.value).toBe('3');
      expect(mockElements.inputs.curveSpeed.value).toBe('3.5');
      expect(mockElements.inputs.holeRate.value).toBe('400');
      expect(mockElements.inputs.holeRateRnd.value).toBe('200');
      expect(mockElements.inputs.holeSize.value).toBe('9');
      expect(mockElements.inputs.holeSizeRnd.value).toBe('3');
    });

    it('should load strategy preset', () => {
      advancedSettings.setPreset('strategy');

      expect(mockElements.inputs.maxRounds.value).toBe('5');
      expect(mockElements.inputs.size.value).toBe('3.2');
      expect(mockElements.inputs.speed.value).toBe('1');
      expect(mockElements.inputs.curveSpeed.value).toBe('2');
      expect(mockElements.inputs.holeRate.value).toBe('220');
      expect(mockElements.inputs.holeRateRnd.value).toBe('100');
      expect(mockElements.inputs.holeSize.value).toBe('14');
      expect(mockElements.inputs.holeSizeRnd.value).toBe('1');
    });

    it('should switch between presets', () => {
      advancedSettings.setPreset('classic');
      expect(mockElements.inputs.maxRounds.value).toBe('15');

      advancedSettings.setPreset('agility');
      expect(mockElements.inputs.maxRounds.value).toBe('20');

      advancedSettings.setPreset('strategy');
      expect(mockElements.inputs.maxRounds.value).toBe('5');

      advancedSettings.setPreset('classic');
      expect(mockElements.inputs.maxRounds.value).toBe('15');
    });

    it('should overwrite custom values', () => {
      mockElements.inputs.maxRounds.value = '99';
      mockElements.inputs.speed.value = '100';

      advancedSettings.setPreset('classic');

      expect(mockElements.inputs.maxRounds.value).toBe('15');
      expect(mockElements.inputs.speed.value).toBe('1.6');
    });

    it('should not throw when called multiple times with same preset', () => {
      expect(() => {
        advancedSettings.setPreset('classic');
        advancedSettings.setPreset('classic');
        advancedSettings.setPreset('classic');
      }).not.toThrow();
    });

    it('should populate all fields', () => {
      // Start with different values
      mockElements.inputs.maxRounds.value = '999';
      mockElements.inputs.size.value = '999';
      mockElements.inputs.speed.value = '999';
      mockElements.inputs.curveSpeed.value = '999';
      mockElements.inputs.holeRate.value = '999';
      mockElements.inputs.holeRateRnd.value = '999';
      mockElements.inputs.holeSize.value = '999';
      mockElements.inputs.holeSizeRnd.value = '999';

      advancedSettings.setPreset('classic');

      // All should be updated
      expect(mockElements.inputs.maxRounds.value).not.toBe('999');
      expect(mockElements.inputs.size.value).not.toBe('999');
      expect(mockElements.inputs.speed.value).not.toBe('999');
      expect(mockElements.inputs.curveSpeed.value).not.toBe('999');
      expect(mockElements.inputs.holeRate.value).not.toBe('999');
      expect(mockElements.inputs.holeRateRnd.value).not.toBe('999');
      expect(mockElements.inputs.holeSize.value).not.toBe('999');
      expect(mockElements.inputs.holeSizeRnd.value).not.toBe('999');
    });
  });

  describe('destroy() method', () => {
    it('should not throw if not initialized', () => {
      expect(() => {
        advancedSettings.destroy();
      }).not.toThrow();
    });

    it('should remove event handlers', () => {
      const removeSpy = vi.spyOn(mockElements.advancedButton, 'removeEventListener');

      advancedSettings.initialize(mockElements);
      advancedSettings.destroy();

      expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should remove preset button handlers', () => {
      const spies = mockElements.presetButtons.map((btn) =>
        vi.spyOn(btn, 'removeEventListener')
      );

      advancedSettings.initialize(mockElements);
      advancedSettings.destroy();

      spies.forEach((spy) => {
        expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
      });
    });

    it('should prevent methods from working after destroy', () => {
      advancedSettings.initialize(mockElements);
      advancedSettings.destroy();

      expect(() => {
        advancedSettings.show();
      }).toThrow('AdvancedSettings not initialized');
    });

    it('should not throw when called multiple times', () => {
      advancedSettings.initialize(mockElements);

      expect(() => {
        advancedSettings.destroy();
        advancedSettings.destroy();
        advancedSettings.destroy();
      }).not.toThrow();
    });

    it('should allow re-initialization after destroy', () => {
      advancedSettings.initialize(mockElements);
      advancedSettings.destroy();

      expect(() => {
        advancedSettings.initialize(mockElements);
      }).not.toThrow();
    });
  });

  describe('Event Handlers', () => {
    beforeEach(() => {
      advancedSettings.initialize(mockElements);
    });

    describe('Toggle button', () => {
      it('should toggle to advanced mode on first click', () => {
        expect(advancedSettings.active).toBe(false);

        mockElements.advancedButton.click();

        expect(advancedSettings.active).toBe(true);
      });

      it('should show form in advanced mode', () => {
        mockElements.advancedButton.click();

        expect(mockElements.form.style.display).toBe('block');
      });

      it('should set button text to advanced in advanced mode', () => {
        mockElements.advancedButton.click();

        expect(mockElements.advancedButton.innerHTML).toBe('Advanced');
      });

      it('should clear button class in advanced mode', () => {
        mockElements.advancedButton.className = 'classic';

        mockElements.advancedButton.click();

        expect(mockElements.advancedButton.className).toBe('');
      });

      it('should toggle back to classic mode on second click', () => {
        mockElements.advancedButton.click();
        expect(advancedSettings.active).toBe(true);

        mockElements.advancedButton.click();

        expect(advancedSettings.active).toBe(false);
      });

      it('should hide form in classic mode', () => {
        mockElements.advancedButton.click();
        mockElements.advancedButton.click();

        expect(mockElements.form.style.display).toBe('none');
      });

      it('should set button text to classic in classic mode', () => {
        mockElements.advancedButton.click();
        mockElements.advancedButton.click();

        expect(mockElements.advancedButton.innerHTML).toBe('Classic');
      });

      it('should set button class to classic in classic mode', () => {
        mockElements.advancedButton.click();
        mockElements.advancedButton.click();

        expect(mockElements.advancedButton.className).toBe('classic');
      });

      it('should click classic button when switching to classic mode', () => {
        const clickSpy = vi.spyOn(mockElements.classicButton, 'click');

        mockElements.advancedButton.click();
        mockElements.advancedButton.click();

        expect(clickSpy).toHaveBeenCalled();
      });

      it('should use custom button texts', () => {
        const settings = new AdvancedSettings({
          buttonClassicText: 'Simple',
          buttonAdvancedText: 'Expert',
        });

        settings.initialize(mockElements);

        mockElements.advancedButton.click();
        expect(mockElements.advancedButton.innerHTML).toBe('Expert');

        mockElements.advancedButton.click();
        expect(mockElements.advancedButton.innerHTML).toBe('Simple');
      });

      it('should toggle multiple times correctly', () => {
        for (let i = 0; i < 5; i++) {
          mockElements.advancedButton.click();
          expect(advancedSettings.active).toBe(true);

          mockElements.advancedButton.click();
          expect(advancedSettings.active).toBe(false);
        }
      });
    });

    describe('Preset buttons', () => {
      it('should load classic preset on classic button click', () => {
        const classicButton = mockElements.presetButtons[0];
        classicButton.click();

        expect(mockElements.inputs.maxRounds.value).toBe('15');
      });

      it('should load agility preset on agility button click', () => {
        const agilityButton = mockElements.presetButtons[1];
        agilityButton.click();

        expect(mockElements.inputs.maxRounds.value).toBe('20');
      });

      it('should load strategy preset on strategy button click', () => {
        const strategyButton = mockElements.presetButtons[2];
        strategyButton.click();

        expect(mockElements.inputs.maxRounds.value).toBe('5');
      });

      it('should handle buttons without data-preset attribute', () => {
        const buttonWithoutPreset = document.createElement('button');
        mockElements.presetButtons.push(buttonWithoutPreset);

        expect(() => {
          advancedSettings.initialize(mockElements);
          buttonWithoutPreset.click();
        }).not.toThrow();
      });

      it('should handle multiple preset button clicks', () => {
        const [classicBtn, agilityBtn, strategyBtn] = mockElements.presetButtons;

        classicBtn.click();
        expect(mockElements.inputs.maxRounds.value).toBe('15');

        agilityBtn.click();
        expect(mockElements.inputs.maxRounds.value).toBe('20');

        strategyBtn.click();
        expect(mockElements.inputs.maxRounds.value).toBe('5');

        classicBtn.click();
        expect(mockElements.inputs.maxRounds.value).toBe('15');
      });
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should clean up event handlers on destroy', () => {
      const initialListenerCount = mockElements.advancedButton.onclick ? 1 : 0;

      advancedSettings.initialize(mockElements);
      advancedSettings.destroy();

      // After destroy, clicking should not trigger the handler
      const activeBeforeClick = advancedSettings.active;
      mockElements.advancedButton.click();
      const activeAfterClick = advancedSettings.active;

      expect(activeBeforeClick).toBe(activeAfterClick);
    });

    it('should not accumulate handlers on re-initialization', () => {
      let clickCount = 0;

      // Create new elements with a counter
      const elements = createMockElements();
      const originalAddEventListener = elements.advancedButton.addEventListener;
      elements.advancedButton.addEventListener = vi.fn((...args) => {
        if (args[0] === 'click') clickCount++;
        originalAddEventListener.apply(elements.advancedButton, args as any);
      });

      const settings = new AdvancedSettings();

      settings.initialize(elements);
      settings.destroy();
      settings.initialize(elements);
      settings.destroy();
      settings.initialize(elements);

      // Should have added listeners 3 times (not accumulated)
      expect(clickCount).toBe(3);
    });

    it('should clear bound handlers map on destroy', () => {
      advancedSettings.initialize(mockElements);
      advancedSettings.destroy();

      // Initialize again - should work fine
      expect(() => {
        advancedSettings.initialize(mockElements);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    describe('Missing DOM elements', () => {
      it('should handle missing data-preset attributes gracefully', () => {
        const elements = createMockElements();
        elements.presetButtons[0].removeAttribute('data-preset');

        advancedSettings.initialize(elements);

        // Should not throw when clicking button without preset
        expect(() => {
          elements.presetButtons[0].click();
        }).not.toThrow();
      });

      it('should handle empty preset buttons array', () => {
        const elements = createMockElements();
        elements.presetButtons = [];

        expect(() => {
          advancedSettings.initialize(elements);
        }).not.toThrow();
      });
    });

    describe('Invalid preset values', () => {
      it('should handle invalid preset in configuration', () => {
        const config: any = { defaultPreset: 'invalid-preset' };

        const settings = new AdvancedSettings(config);

        // Should throw when trying to initialize with invalid preset
        expect(() => {
          settings.initialize(mockElements);
        }).toThrow();
      });
    });

    describe('Extreme input values', () => {
      beforeEach(() => {
        advancedSettings.initialize(mockElements);
      });

      it('should handle very large numbers', () => {
        mockElements.inputs.maxRounds.value = '999999';
        mockElements.inputs.speed.value = '1000000';

        const config = advancedSettings.getConfiguration();
        expect(config.maxRounds).toBe(999999);
        expect(config.speed).toBe(1000000);
      });

      it('should handle very small positive numbers', () => {
        mockElements.inputs.size.value = '0.001';
        mockElements.inputs.speed.value = '0.0001';

        const config = advancedSettings.getConfiguration();
        expect(config.size).toBe(0.001);
        expect(config.speed).toBe(0.0001);
      });

      it('should reject negative maxRounds', () => {
        mockElements.inputs.maxRounds.value = '-10';

        expect(() => {
          advancedSettings.getConfiguration();
        }).toThrow('Invalid configuration values');
      });

      it('should reject negative size', () => {
        mockElements.inputs.size.value = '-5';

        expect(() => {
          advancedSettings.getConfiguration();
        }).toThrow('Invalid configuration values');
      });

      it('should reject negative holeRateRnd', () => {
        mockElements.inputs.holeRateRnd.value = '-1';

        expect(() => {
          advancedSettings.getConfiguration();
        }).toThrow('Invalid configuration values');
      });
    });

    describe('Rapid operations', () => {
      beforeEach(() => {
        advancedSettings.initialize(mockElements);
      });

      it('should handle rapid show/hide calls', () => {
        expect(() => {
          for (let i = 0; i < 100; i++) {
            advancedSettings.show();
            advancedSettings.hide();
          }
        }).not.toThrow();
      });

      it('should handle rapid preset changes', () => {
        const presets: PresetName[] = ['classic', 'agility', 'strategy'];

        expect(() => {
          for (let i = 0; i < 100; i++) {
            advancedSettings.setPreset(presets[i % 3]);
          }
        }).not.toThrow();
      });

      it('should handle rapid getConfiguration calls', () => {
        expect(() => {
          for (let i = 0; i < 100; i++) {
            advancedSettings.getConfiguration();
          }
        }).not.toThrow();
      });

      it('should handle rapid toggle clicks', () => {
        expect(() => {
          for (let i = 0; i < 50; i++) {
            mockElements.advancedButton.click();
          }
        }).not.toThrow();
      });
    });
  });

  describe('Integration with gameConfigurations', () => {
    beforeEach(() => {
      advancedSettings.initialize(mockElements);
    });

    it('should load all classic configuration properties', () => {
      advancedSettings.setPreset('classic');
      const config = advancedSettings.getConfiguration();

      expect(config).toEqual(configurations.classic);
    });

    it('should load all agility configuration properties', () => {
      advancedSettings.setPreset('agility');
      const config = advancedSettings.getConfiguration();

      expect(config).toEqual(configurations.agility);
    });

    it('should load all strategy configuration properties', () => {
      advancedSettings.setPreset('strategy');
      const config = advancedSettings.getConfiguration();

      expect(config).toEqual(configurations.strategy);
    });

    it('should validate configuration using validateConfiguration', () => {
      // Valid configuration should not throw
      expect(() => {
        advancedSettings.getConfiguration();
      }).not.toThrow();

      // Invalid configuration should throw
      mockElements.inputs.maxRounds.value = '0';
      expect(() => {
        advancedSettings.getConfiguration();
      }).toThrow();
    });

    it('should match preset structure exactly', () => {
      advancedSettings.setPreset('classic');
      const config = advancedSettings.getConfiguration();

      const classicKeys = Object.keys(configurations.classic).sort();
      const configKeys = Object.keys(config).sort();

      expect(configKeys).toEqual(classicKeys);
    });
  });

  describe('API Compatibility with Advanced.js', () => {
    it('should have initialize method (lazy initialization)', () => {
      expect(typeof advancedSettings.initialize).toBe('function');
    });

    it('should have active property', () => {
      expect(typeof advancedSettings.active).toBe('boolean');
    });

    it('should have show method', () => {
      expect(typeof advancedSettings.show).toBe('function');
    });

    it('should have hide method', () => {
      expect(typeof advancedSettings.hide).toBe('function');
    });

    it('should have getConfiguration method', () => {
      expect(typeof advancedSettings.getConfiguration).toBe('function');
    });

    it('should have setPreset method', () => {
      expect(typeof advancedSettings.setPreset).toBe('function');
    });

    it('should have destroy method (memory leak prevention)', () => {
      expect(typeof advancedSettings.destroy).toBe('function');
    });

    it('should use dependency injection (no direct DOM queries)', () => {
      // Original Advanced.js queries DOM directly
      // New implementation requires elements to be passed in
      const settings = new AdvancedSettings();

      // Should not work without initialization
      expect(() => settings.show()).toThrow();

      // Should work after initialization
      settings.initialize(mockElements);
      expect(() => settings.show()).not.toThrow();
    });

    it('should support default preset configuration', () => {
      const settings = new AdvancedSettings({ defaultPreset: 'strategy' });
      settings.initialize(mockElements);

      expect(mockElements.inputs.maxRounds.value).toBe('5');
    });

    it('should toggle between classic and advanced modes', () => {
      advancedSettings.initialize(mockElements);

      expect(advancedSettings.active).toBe(false);

      mockElements.advancedButton.click();
      expect(advancedSettings.active).toBe(true);

      mockElements.advancedButton.click();
      expect(advancedSettings.active).toBe(false);
    });

    it('should update button appearance on toggle', () => {
      advancedSettings.initialize(mockElements);

      mockElements.advancedButton.click();
      expect(mockElements.advancedButton.className).toBe('');
      expect(mockElements.advancedButton.innerHTML).toBe('Advanced');

      mockElements.advancedButton.click();
      expect(mockElements.advancedButton.className).toBe('classic');
      expect(mockElements.advancedButton.innerHTML).toBe('Classic');
    });

    it('should show/hide form based on mode', () => {
      advancedSettings.initialize(mockElements);

      mockElements.advancedButton.click();
      expect(mockElements.form.style.display).toBe('block');

      mockElements.advancedButton.click();
      expect(mockElements.form.style.display).toBe('none');
    });
  });

  describe('Factory Function', () => {
    it('should create AdvancedSettings instance', () => {
      const settings = createAdvancedSettings();
      expect(settings).toBeDefined();
      expect(settings.active).toBe(false);
    });

    it('should accept config parameter', () => {
      const config: AdvancedSettingsConfig = {
        defaultPreset: 'agility',
        buttonClassicText: 'Simple',
        buttonAdvancedText: 'Expert',
      };

      const settings = createAdvancedSettings(config);
      expect(settings).toBeDefined();
    });

    it('should return IAdvancedSettings interface', () => {
      const settings = createAdvancedSettings();

      // Verify interface methods exist
      expect(typeof settings.initialize).toBe('function');
      expect(typeof settings.show).toBe('function');
      expect(typeof settings.hide).toBe('function');
      expect(typeof settings.getConfiguration).toBe('function');
      expect(typeof settings.setPreset).toBe('function');
      expect(typeof settings.destroy).toBe('function');
      expect(typeof settings.active).toBe('boolean');
    });

    it('should work identically to constructor', () => {
      const settings1 = new AdvancedSettings();
      const settings2 = createAdvancedSettings();

      expect(settings1.active).toBe(settings2.active);
      expect(typeof settings1.initialize).toBe(typeof settings2.initialize);
    });
  });

  describe('Type Safety', () => {
    it('should enforce AdvancedSettingsConfig types', () => {
      // This is a compile-time test, but we can verify it accepts valid configs
      const validConfigs: AdvancedSettingsConfig[] = [
        { defaultPreset: 'classic' },
        { buttonClassicText: 'Simple' },
        { buttonAdvancedText: 'Expert' },
        { defaultPreset: 'agility', buttonClassicText: 'Classic' },
        {},
      ];

      validConfigs.forEach((config) => {
        expect(() => new AdvancedSettings(config)).not.toThrow();
      });
    });

    it('should enforce PresetName types', () => {
      advancedSettings.initialize(mockElements);

      const validPresets: PresetName[] = ['classic', 'agility', 'strategy'];

      validPresets.forEach((preset) => {
        expect(() => {
          advancedSettings.setPreset(preset);
        }).not.toThrow();
      });
    });

    it('should require all inputs in elements', () => {
      const incompleteElements: any = {
        advancedButton: document.createElement('button'),
        form: document.createElement('div'),
        advancedPanel: document.createElement('div'),
        classicButton: document.createElement('button'),
        presetButtons: [],
        inputs: {
          // Missing some inputs
          maxRounds: document.createElement('input'),
        },
      };

      // Should throw when trying to initialize with missing inputs
      expect(() => {
        advancedSettings.initialize(incompleteElements);
      }).toThrow();
    });

    it('should make active property readonly', () => {
      expect(() => {
        // @ts-expect-error - Testing that active is readonly
        advancedSettings.active = true;
      }).toThrow();
    });
  });

  describe('Integration Scenarios', () => {
    beforeEach(() => {
      advancedSettings.initialize(mockElements);
    });

    it('should handle full workflow: initialize -> toggle -> set preset -> get config', () => {
      // Toggle to advanced
      mockElements.advancedButton.click();
      expect(advancedSettings.active).toBe(true);

      // Load preset
      advancedSettings.setPreset('agility');
      expect(mockElements.inputs.maxRounds.value).toBe('20');

      // Get configuration
      const config = advancedSettings.getConfiguration();
      expect(config).toEqual(configurations.agility);

      // Toggle back
      mockElements.advancedButton.click();
      expect(advancedSettings.active).toBe(false);
    });

    it('should handle custom editing workflow', () => {
      // Load preset
      advancedSettings.setPreset('classic');

      // Customize values
      mockElements.inputs.maxRounds.value = '25';
      mockElements.inputs.speed.value = '5';

      // Get custom configuration
      const config = advancedSettings.getConfiguration();
      expect(config.maxRounds).toBe(25);
      expect(config.speed).toBe(5);
      expect(config.size).toBe(configurations.classic.size); // Unchanged
    });

    it('should handle show/hide panel workflow', () => {
      advancedSettings.show();
      expect(mockElements.advancedPanel.style.display).toBe('block');

      advancedSettings.hide();
      expect(mockElements.advancedPanel.style.display).toBe('none');
    });

    it('should handle destroy and re-initialize workflow', () => {
      // Use the component
      advancedSettings.setPreset('agility');
      mockElements.advancedButton.click();

      // Destroy
      advancedSettings.destroy();

      // Re-initialize
      const newElements = createMockElements();
      advancedSettings.initialize(newElements);

      // Should work again
      advancedSettings.setPreset('strategy');
      expect(newElements.inputs.maxRounds.value).toBe('5');
    });

    it('should handle rapid preset switching during gameplay', () => {
      const presets: PresetName[] = ['classic', 'agility', 'strategy'];

      for (let round = 0; round < 10; round++) {
        const preset = presets[round % 3];
        advancedSettings.setPreset(preset);

        const config = advancedSettings.getConfiguration();
        expect(config).toEqual(configurations[preset]);
      }
    });
  });
});
