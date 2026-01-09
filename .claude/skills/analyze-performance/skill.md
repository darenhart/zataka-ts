# Skill: Analyze Performance 📊

## Description
Skill to analyze Zatacka game performance, identify bottlenecks, measure FPS, detect memory leaks and suggest optimizations.

## When to Use
- ✅ After changes that may affect performance
- ✅ When FPS is below expected
- ✅ To identify memory leaks
- ✅ For proactive optimization
- ✅ For benchmarking
- ✅ Before releases

## How It Works

This skill:
1. Measures FPS in different scenarios
2. Analyzes memory usage
3. Identifies bottlenecks in code
4. Profiles rendering performance
5. Detects memory leaks
6. Generates report with optimization recommendations

## Main Metrics

### 1. FPS (Frames Per Second)
- **Target:** 60 FPS
- **Acceptable:** >= 50 FPS
- **Problematic:** < 45 FPS
- **Critical:** < 30 FPS

### 2. Frame Time
- **Target:** ~16.67ms (60 FPS)
- **Acceptable:** <= 20ms (50 FPS)
- **Problematic:** > 22ms (< 45 FPS)

### 3. Memory Usage
- **Initial:** ~10-20 MB
- **During game:** ~20-40 MB
- **Leak:** Continuous growth > 100 MB

### 4. Input Lag
- **Excellent:** < 16ms
- **Good:** < 50ms
- **Acceptable:** < 100ms
- **Problematic:** > 100ms

## Analysis Tools

### 1. Chrome DevTools Performance

```markdown
**How to use:**
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record button (or Ctrl+E)
4. Play for 10-30 seconds
5. Stop recording
6. Analyze flame chart

**What to look for:**
- Long tasks (> 50ms)
- Excessive getImageData calls
- Garbage collection spikes
- Layout thrashing
- Paint operations
```

### 2. Chrome DevTools Memory

```markdown
**How to use:**
1. Open DevTools (F12)
2. Go to Memory tab
3. Take initial heap snapshot
4. Play for 1-2 minutes
5. Take final heap snapshot
6. Compare snapshots

**What to look for:**
- Retained objects growing
- Unreleased event listeners
- Detached DOM nodes
- Large arrays/objects not cleaned
```

### 3. Performance API

```javascript
// Medir FPS
class FPSCounter {
  constructor() {
    this.fps = 60;
    this.frames = 0;
    this.lastTime = performance.now();
  }

  update() {
    this.frames++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round(this.frames * 1000 / elapsed);
      this.frames = 0;
      this.lastTime = currentTime;
    }
  }
}

// Medir frame time
let lastFrameTime = performance.now();

function measureFrameTime() {
  const currentTime = performance.now();
  const frameTime = currentTime - lastFrameTime;
  lastFrameTime = currentTime;

  if (frameTime > 20) {
    console.warn(`Slow frame: ${frameTime.toFixed(2)}ms`);
  }
}

// Medir tempo de function
function measureFunction(fn, name) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)}ms`);
}
```

## Performance Checklist

### Rendering
- [ ] FPS >= 50 with 2 players
- [ ] FPS >= 45 with 6 players
- [ ] No visible frame drops
- [ ] getImageData minimized
- [ ] clearRect instead of fillRect
- [ ] save/restore only when necessary

### Memory
- [ ] No continuous memory growth
- [ ] Event listeners removed when necessary
- [ ] Unused objects cleaned
- [ ] No detached DOM nodes
- [ ] Garbage collection not too frequent

### Code
- [ ] Loops optimized
- [ ] No redundant calculations in game loop
- [ ] Value caching when possible
- [ ] Avoid allocations in game loop
- [ ] Expensive operations outside critical path

### Canvas
- [ ] Multiple layers to separate static/dynamic
- [ ] Dirty rectangle optimization (if applicable)
- [ ] OffscreenCanvas for pre-rendering (if applicable)
- [ ] Hardware acceleration active

## Test Scenarios

### Scenario 1: Normal Load (2 Players)
```markdown
- Configuration: Classic mode
- Players: 2
- Duration: 3 rounds (~2 minutes)
- Expected FPS: 58-60
- Expected Memory: ~30 MB
```

### Scenario 2: High Load (6 Players)
```markdown
- Configuration: Agility mode (high speed)
- Players: 6
- Duration: 3 rounds (~3 minutes)
- Expected FPS: 50-55
- Expected Memory: ~40 MB
```

### Scenario 3: Extended Play (Memory Leak Test)
```markdown
- Configuration: Any
- Players: 2-4
- Duration: 10+ rounds (~10 minutes)
- Expected Memory: No continuous growth
- Expected FPS: Maintain stable
```

### Scenario 4: Stress Test
```markdown
- Configuration: Agility mode
- Players: 6
- Duration: 20 rounds
- Expected: No significant degradation
```

## Report Format

```markdown
### Performance Analysis Report - [Date/Time]

#### 📊 Executive Summary

- **Average FPS:** X fps
- **Minimum FPS:** Y fps
- **Average Frame Time:** Z ms
- **Memory Usage:** W MB
- **Overall Status:** [EXCELLENT/GOOD/ACCEPTABLE/PROBLEMATIC]

---

#### 🎮 Tested Scenarios

##### Scenario 1: Normal Load (2 Players)
- FPS: [value] (target: 58-60)
- Frame Time: [value] (target: <17ms)
- Memory: [value] (target: ~30MB)
- Status: [✅/⚠️/❌]

##### Scenario 2: High Load (6 Players)
- FPS: [value] (target: 50-55)
- Frame Time: [value] (target: <20ms)
- Memory: [value] (target: ~40MB)
- Status: [✅/⚠️/❌]

##### Scenario 3: Extended Play
- Memory Growth: [yes/no]
- FPS Degradation: [yes/no]
- Status: [✅/⚠️/❌]

---

#### 🔍 Identified Bottlenecks

1. **[Bottleneck Name]**
   - Location: `file.js:line`
   - Impact: [HIGH/MEDIUM/LOW]
   - Description: [what is causing slowdown]
   - Frame Time: [X ms]
   - Frequency: [how many times per frame]
   - Suggested Solution: [how to optimize]

---

#### 🧠 Memory Analysis

**Initial Memory:** X MB
**Peak Memory:** Y MB
**Final Memory:** Z MB
**Growth:** [+/- W MB]

**Detected Memory Leaks:**
- [ ] Unreleased event listeners
- [ ] Uncleaned objects
- [ ] Closures retaining references
- [ ] Detached DOM nodes

**Details:**
[If there are leaks, provide details]

---

#### 🎨 Rendering Analysis

**Paint Operations:**
- Frequency: [X paints/second]
- Average time: [Y ms/paint]
- Painted area: [Z pixels]

**getImageData Calls:**
- Frequency: [X calls/frame]
- Total time: [Y ms/frame]
- Frame percentage: [Z%]

**Possible Optimizations:**
1. [Suggestion 1]
2. [Suggestion 2]

---

#### 💡 Optimization Recommendations

##### 🔴 CRITICAL (must be implemented)
1. **[Optimization Title]**
   - Expected Impact: [improvement of X FPS or Y% frame time reduction]
   - Difficulty: [EASY/MEDIUM/DIFFICULT]
   - Description: [what to do]

##### 🟡 MODERATE (should be implemented)
1. **[Optimization Title]**
   - Expected Impact: [improvement of X FPS]
   - Description: [what to do]

##### 🟢 OPTIONAL (nice to have)
1. **[Optimization Title]**
   - Expected Impact: [small improvement]
   - Description: [what to do]

---

#### 📈 Comparison with Baseline

[If there is previous measurement]

**Baseline (previous):**
- FPS: X
- Memory: Y MB

**Current:**
- FPS: Z ([+/-]A %)
- Memory: W MB ([+/-]B %)

**Verdict:** [IMPROVED/DEGRADED/STABLE]

---

#### 🏁 Conclusion

[General summary, current performance state, next steps]

**Status:** [APPROVED/ATTENTION NEEDED/REQUIRES OPTIMIZATION]
```

## Common Optimizations

### 1. Reduce getImageData Calls

```javascript
// ❌ SLOW - 12 calls per frame with 6 players
for (let player of players) {
  const pixel1 = context.getImageData(x1, y1, 1, 1);
  const pixel2 = context.getImageData(x2, y2, 1, 1);
}

// ✅ OPTIMIZED - consider batch or alternative techniques
// For Zatacka: already optimized (only 2 points per player)
// But if more points were needed:
const points = [/* list of points */];
const minX = Math.min(...points.map(p => p.x));
const minY = Math.min(...points.map(p => p.y));
const maxX = Math.max(...points.map(p => p.x));
const maxY = Math.max(...points.map(p => p.y));
const imageData = context.getImageData(
  minX, minY,
  maxX - minX + 1,
  maxY - minY + 1
);
// Now check all points in imageData
```

### 2. Object Pooling

```javascript
// ❌ SLOW - create/destroy objects constantly
function createParticle() {
  return { x: 0, y: 0, vx: 0, vy: 0 };
}

// ✅ OPTIMIZED - reuse objects
class ObjectPool {
  constructor(size, factory) {
    this.pool = Array(size).fill(null).map(factory);
    this.active = [];
  }

  acquire() {
    return this.pool.pop() || this.factory();
  }

  release(obj) {
    this.pool.push(obj);
  }
}
```

### 3. Debounce Resize

```javascript
// ❌ SLOW - recalculates on every event
window.addEventListener('resize', () => {
  game.calculateSize();
  game.redraw();
});

// ✅ OPTIMIZED - debounce
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    game.calculateSize();
    game.redraw();
  }, 250);
});
```

### 4. Cache Calculations

```javascript
// ❌ SLOW - calculates every frame
const angleRad = this.angle * Math.PI / 180;
const distance = this.size + 2;

// ✅ OPTIMIZED - cache if doesn't change frequently
if (this.angleDirty) {
  this.cachedAngleRad = this.angle * Math.PI / 180;
  this.angleDirty = false;
}
const angleRad = this.cachedAngleRad;
```

## Commands Úteis

```bash
# Profiling no Chrome
# 1. chrome://inspect
# 2. Click "Open dedicated DevTools for Node"
# 3. Profile tab

# Lighthouse (for general web performance)
npx lighthouse http://localhost:8000 --view

# Bundle analyzer (if using webpack)
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer stats.json
```

## Integration with Sub-Agents

This skill is used by the **qa-tester** subagent to validate performance after code changes.

## Benchmark Reference

### Zatacka (current implementation)

```markdown
**Hardware:** MacBook Pro 2020 M1

**2 Players (Classic):**
- FPS: 58-60
- Frame Time: 16-17ms
- Memory: ~25 MB

**6 Players (Agility):**
- FPS: 52-56
- Frame Time: 18-19ms
- Memory: ~38 MB

**Extended Play (10 min):**
- Memory Growth: < 5 MB
- FPS Degradation: < 2 fps
```

## Notes

- Performance varies by hardware
- Browser also affects (Chrome usually better)
- Background tabs may throttle performance
- Monitor built-in game FPS counter (if available)
- Consider worst-case scenarios (low-end hardware)

## Limitations

- Profiling has own overhead
- Results vary by hardware
- Some issues only appear in production
- Subjective performance (perceived vs measured)

## Future Improvements

- [ ] Automated performance testing with Puppeteer
- [ ] Performance budgets in CI/CD
- [ ] Real user monitoring (RUM)
- [ ] A/B testing of optimizations
- [ ] Performance dashboard for continuous tracking
