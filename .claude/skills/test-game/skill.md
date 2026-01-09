# Skill: Test Game 🎮

## Description
Skill to test the Zatacka game in browser, execute manual functionality tests and report bugs or issues found.

## When to Use
- ✅ After game code modifications
- ✅ To validate new features
- ✅ To test configurations (classic/agility/strategy)
- ✅ To check multiplayer (2-6 players)
- ✅ To test performance and FPS
- ✅ To check controls and inputs

## How It Works

This skill:
1. Opens game in browser
2. Executes manual test checklist
3. Validates main features
4. Reports bugs, issues or performance degradation
5. Provides detailed feedback on game experience

## Test Checklist

### Basic Tests
- [ ] Game opens without console errors
- [ ] Splash screen appears
- [ ] Player selection works
- [ ] Game starts correctly
- [ ] FPS stable (~60)
- [ ] Controls responsive

### Gameplay Tests
- [ ] 2 players work
- [ ] 6 players work
- [ ] Collisions detected correctly
- [ ] Holes appear
- [ ] Score updates
- [ ] Multiple rounds work
- [ ] End screen shows score

### Configuration Tests
- [ ] Classic mode works
- [ ] Agility mode works
- [ ] Strategy mode works
- [ ] Parameters applied correctly

### Performance Tests
- [ ] FPS >= 50 with 2 players
- [ ] FPS >= 45 with 6 players
- [ ] No visible frame drops
- [ ] Input lag < 50ms
- [ ] Smooth rendering

### Edge Case Tests
- [ ] Simultaneous collision of 2 players
- [ ] All players dead
- [ ] Spawn in congested area
- [ ] Multiple consecutive rounds
- [ ] Return to menu after game

## How to Execute

### Step 1: Open Game
```bash
# If there is local server
open index.html

# Or use Python simple server
python3 -m http.server 8000
# Then open http://localhost:8000 in browser

# Or use Node.js http-server
npx http-server -p 8000
```

### Step 2: Execute Basic Tests
1. Check if splash screen appears
2. Click or press SPACE
3. Select 2 players (red and yellow)
4. Check controls:
   - Red player: 1 (left) / Q (right)
   - Yellow player: Shift (left) / Ctrl (right)
5. Press SPACE to start
6. Play for ~30 seconds
7. Check FPS counter (if visible)
8. Observe if collisions work
9. Let round end
10. Check score

### Step 3: Execute Advanced Tests
1. Test with 6 players
2. Test Agility mode
3. Test Strategy mode
4. Test edge cases

### Step 4: Check Console
- Open DevTools (F12)
- Check console for errors
- Check Network for loading issues
- Use Performance tab for profiling

## Report Format

```markdown
### Manual Test Report - [Date/Time]

#### ✅ Tests that PASSED

1. **[Test Name]**
   - Status: ✅ PASSED
   - Notes: [details]

#### ❌ Tests that FAILED

1. **[Test Name]**
   - Status: ❌ FAILED
   - Issue: [detailed description]
   - Reproduction: [steps to reproduce]
   - Severity: [CRITICAL/MODERATE/LOW]
   - Screenshot/Video: [if available]

#### ⚠️ Observations

- [Observation 1]
- [Observation 2]

#### 📊 Performance Metrics

- Average FPS: [value]
- Minimum FPS: [value]
- Input lag: [perception]
- Rendering: [smooth/problematic]

#### 🎮 Game Experience

- Gameplay: [1-10]
- Responsiveness: [1-10]
- Performance: [1-10]
- Critical bugs: [number]

#### 🏁 Conclusion

[General summary, recommendations]
```

## Usage Examples

### Example 1: Test After New Feature

```markdown
### Test Report - Win Counter

**Objective:** Test new win counter functionality

#### Test Executed:
1. Started game with 2 players
2. Played 3 rounds
3. Checked counter on end screen

#### Result:
✅ Counter appears correctly
✅ Increments when player wins
✅ Persists between rounds
✅ Resets when returning to menu

#### Performance:
- FPS: 58-60 (stable)
- No degradation

#### Conclusion:
Feature works perfectly! No issues detected.
```

### Example 2: Regression Test

```markdown
### Test Report - Regression After Refactoring

**Objective:** Check if refactoring broke any features

#### Tests Executed:
✅ Splash screen - OK
✅ Player selection - OK
✅ Controls - OK
✅ Collisions - OK
❌ Score - FAILED
✅ Multiple rounds - OK

#### Issue Found:
**Score not updating**
- Severity: CRITICAL
- Reproduction:
  1. Start game with 2 players
  2. Complete round
  3. Observe score screen
  4. All players show 0 points
- Console error: "Uncaught TypeError: Cannot read property 'score' of undefined at Score.add (Score.js:23)"

#### Conclusion:
REJECTED - critical bug introduced. Correction needed before proceeding.
```

## Useful Commands

```bash
# Open DevTools in Chrome
# Mac: Cmd + Option + I
# Windows/Linux: Ctrl + Shift + I

# Useful console commands
console.log(game.fps.val);  # See current FPS
console.log(game.players.pool);  # See players
console.log(game.started);  # See game state

# Performance profiling
# 1. Open DevTools > Performance
# 2. Click Record
# 3. Play for 10-30 seconds
# 4. Stop recording
# 5. Analyze flame chart
```

## Integration with Sub-Agents

This skill is frequently used by the **qa-tester** subagent to execute manual tests complementary to automated tests.

## Notes

- Manual tests are essential for games because many aspects (feel, responsiveness, fun) are not automatable
- Always test with different numbers of players (2, 3, 6)
- Always test all 3 modes (classic, agility, strategy)
- Performance may vary between browsers - ideally test Chrome, Firefox, Safari
- Mobile not currently supported (desktop-only game)

## Limitations

- Requires manual intervention (not automated)
- Subjective in some aspects (feel, fun)
- Depends on tester's hardware
- Doesn't replace automated tests, complements them

## Future Improvements

- [ ] Add automated tests with Puppeteer/Playwright
- [ ] Create integration test suite
- [ ] Add visual regression testing
- [ ] Create automated performance benchmarks
- [ ] Add CI/CD pipeline with tests
