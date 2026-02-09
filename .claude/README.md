# Claude Code Agent System - Zatacka-TS

Complete agent and skill system for the Zatacka-TS project development.

## 📁 Structure

```
.claude/
├── README.md                          # This file
├── CLAUDE.md                          # MAIN AGENT
├── agents/                            # Specialized sub-agents
│   ├── code-analyzer.md              # Code analysis
│   ├── code-reviewer.md              # Code review
│   ├── qa-tester.md                  # Testing and QA
│   ├── validator.md                  # Final validation
│   ├── typescript-specialist.md      # TypeScript expert
│   ├── javascript-specialist.md      # JavaScript expert
│   └── game-logic-specialist.md      # Game logic expert
└── skills/                            # Executable skills
    ├── test-game/                    # Test game in browser
    │   ├── skill.md
    │   └── skill.json
    ├── review-code/                  # Static code analysis
    │   ├── skill.md
    │   └── skill.json
    ├── analyze-performance/          # Performance analysis
    │   ├── skill.md
    │   └── skill.json
    └── validate-html5/               # HTML5/Canvas validation
        ├── skill.md
        └── skill.json
```

---

## 🎯 Main Agent

### `CLAUDE.md`

The **Main Agent** is the only one authorized to write code. It coordinates all sub-agents following a strict workflow:

**Mandatory Flow:**
```
Task → Clarification → Plan → Confirmation →
code-analyzer → Write Code → code-reviewer →
qa-tester → validator → 100% Completion
```

**Principles:**
- ✅ ALWAYS uses sub-agents before/after writing code
- ✅ ALWAYS iterates until 100% completion
- ✅ ALWAYS asks for plan confirmation
- ✅ ALWAYS clarifies doubts BEFORE starting
- ❌ NEVER lies, simplifies, or omits
- ❌ NEVER stops before 100% complete

---

## 🤖 Sub-Agents

### 1. **code-analyzer** 🔍
**When to use:** BEFORE writing any code

**Function:** Analyzes existing code, identifies patterns, structures and provides detailed context.

**Output:** Complete analysis with:
- File purpose
- Structure and dependencies
- Identified patterns
- Points of attention
- Recommendations for modification

---

### 2. **code-reviewer** 👁️
**When to use:** AFTER writing code

**Function:** Reviews quality, best practices, potential bugs and compliance.

**Output:** Review with:
- Critical/moderate/suggestion issues
- Review checklist
- Verdict (Approved/Approved with reservations/Rejected)

**Approval Criteria:**
- ✅ Zero critical bugs
- ✅ Zero security issues
- ✅ Best practices followed

---

### 3. **qa-tester** 🧪
**When to use:** AFTER code review

**Function:** Tests functionality, edge cases, performance and regression.

**Output:** Test report with:
- Passed/failed tests
- Verified edge cases
- Measured performance
- Detected regressions
- Final verdict

**Checklist includes:**
- Functional tests
- Edge cases
- Performance (FPS, memory)
- Regression
- Zatacka-specific (multiplayer, collisions, etc)

---

### 4. **validator** ✅
**When to use:** BEFORE marking task as complete

**Function:** Final validation that 100% of requirements were met.

**Output:** Validation with:
- User requirements (checklist)
- Code-review confirmation
- QA-testing confirmation
- 100% completeness
- Final verdict

**Validation Criteria:**
- ✅ 100% of requirements met
- ✅ Code-reviewer approved
- ✅ QA-tester approved
- ✅ Acceptable performance
- ✅ Zero critical bugs

**Reject if:**
- ❌ Any requirement not 100% met
- ❌ Critical bugs present
- ❌ Tests failed
- ❌ Anything was simplified or omitted

---

### 5. **typescript-specialist** 💎
**When to use:** TypeScript work, JS→TS migration, types, interfaces

**Expertise:**
- Incremental JS → TS migration
- Type system (interfaces, types, generics)
- Type safety (guards, assertions)
- Configuration (tsconfig.json)
- Canvas & Game Development in TS

**Output:** TypeScript solutions with:
- Required types/interfaces
- Code examples
- TS checklist
- Points of attention

---

### 6. **javascript-specialist** 💻
**When to use:** JS optimizations, Canvas API, performance

**Expertise:**
- JavaScript Core (ES5/ES6+, closures, prototypes)
- Canvas API (2D context, rendering, optimization)
- Game Development (game loops, FPS, collision)
- Performance Optimization
- Browser APIs

**Output:** Optimizations with:
- Current vs optimized code
- Performance impact
- Trade-offs
- Best practices

---

### 7. **game-logic-specialist** 🎮
**When to use:** Game logic, physics, collisions, mechanics

**Expertise:**
- Game Loop Architecture
- Collision Detection
- Movement & Physics
- Game State Management
- Multiplayer (Local)
- Game Balance

**Output:** Mechanics design with:
- Algorithm
- Pseudocode
- Real code
- Balance considerations
- Test cases

---

## 🛠️ Skills

### 1. **test-game** 🎮
**Function:** Tests game in browser and reports bugs

**Usage:**
```bash
# Open game
open index.html
# or
python3 -m http.server 8000
```

**Tests:**
- Features (splash, select, game, end)
- Multiplayer (2-6 players)
- Configurations (classic, agility, strategy)
- Performance (FPS, memory)
- Edge cases

---

### 2. **review-code** 🔍
**Function:** Static analysis, linting, best practices

**Usage:**
```bash
npx eslint .
npx prettier --check .
npx tsc --noEmit  # TypeScript
```

**Checks:**
- JavaScript/TypeScript quality
- Canvas/Game patterns
- Code organization
- Documentation
- Security

---

### 3. **analyze-performance** 📊
**Function:** Analyzes performance, identifies bottlenecks

**Usage:**
- Chrome DevTools > Performance
- Memory tab for leaks
- Performance API measurements

**Measures:**
- FPS (target: 60, min: 50)
- Frame time (target: <17ms)
- Memory usage
- Bottlenecks
- Rendering performance

---

### 4. **validate-html5** ✅
**Function:** Validates HTML5, Canvas API, browser compatibility

**Usage:**
```bash
html-validate index.html
# or W3C validator online
```

**Validates:**
- HTML5 markup
- Canvas API usage
- Browser compatibility (Chrome, Firefox, Safari, Edge)
- Accessibility (basic)
- Standards compliance

---

## 🔄 Typical Workflow

### Example: Adding New Feature

```markdown
1. **User:** "Add win counter"

2. **Main Agent:**
   - Clarifies questions (persistent? where to show?)
   - Creates detailed plan
   - WAITS FOR CONFIRMATION

3. **User:** "Yes, proceed"

4. **Main Agent:**
   → Calls code-analyzer (Player.js, Score.js)
   → Receives complete analysis
   → Writes code
   → Calls code-reviewer
   → Reviewer approves
   → Calls qa-tester
   → Tester approves (12/12 tests passed)
   → Calls validator
   → Validator confirms 100% complete
   → Informs user: "✅ Task 100% complete!"

5. **Result:** Complete, tested, validated feature!
```

---

## 📋 General Checklist

Before marking task as complete:

- [ ] **Clarification:** All questions resolved?
- [ ] **Plan:** Created and approved by user?
- [ ] **Analysis:** code-analyzer consulted?
- [ ] **Code:** Written by main agent?
- [ ] **Review:** code-reviewer approved?
- [ ] **Tests:** qa-tester approved?
- [ ] **Validation:** validator confirmed 100%?
- [ ] **Conclusion:** User informed?

---

## 🎯 About Zatacka-TS Project

### Technologies
- **Current:** JavaScript (ES5/ES6) + HTML5 Canvas
- **Migration to:** TypeScript
- **Type:** Local multiplayer game (2-6 players)

### Main Files
- `Game.js` - Game management, animation loop
- `Player.js` - Player logic and collisions
- `Keys.js` - Control system
- `Score.js` - Score system
- `SelectPlayers.js` - Player selection
- `Advanced.js` - Advanced settings
- `Fps.js` - FPS counter
- `conf.js` - Configurations (classic, agility, strategy)

### Project Patterns
- Uses prototypes to share Canvas context
- Player pool system
- Game loop with requestAnimationFrame
- Collision detection via getImageData (pixel-perfect)

---

## 📚 References

### Documentation
- Sub-agents: https://code.claude.com/docs/en/sub-agents
- Skills: https://github.com/anthropics/skills

### Claude Code
- Docs: https://code.claude.com/docs
- GitHub: https://github.com/anthropics/claude-code

---

## 🚀 How to Use This System

### For the Main Agent

When started, the main agent (`CLAUDE.md`) automatically:
1. Reads this instruction system
2. Follows the mandatory workflow
3. Consults sub-agents as needed
4. Uses skills when appropriate
5. Iterates until 100% completion
6. Validates everything before concluding

### For Developers

This system ensures:
- ✅ Code always reviewed before merge
- ✅ Tests always executed
- ✅ 100% completeness in all tasks
- ✅ Nothing is simplified or omitted
- ✅ Quality and rigor throughout development
- ✅ TypeScript migration well-planned and executed

---

## 🔧 Maintenance

### Add New Sub-Agent

1. Create `agents/new-agent.md`
2. Document function, expertise and output
3. Add to `CLAUDE.md` in sub-agents list

### Add New Skill

1. Create `skills/new-skill/`
2. Create `skill.md` (documentation)
3. Create `skill.json` (metadata)
4. Document usage and integration

---

## ⚠️ Important Notes

### For the Main Agent

**CRITICAL REMINDER:**
- NEVER write code without consulting code-analyzer
- NEVER mark as complete without consulting validator
- ALWAYS iterate until 100%
- ALWAYS ask for plan confirmation
- NEVER simplify user requirements

### For Users

This system ensures:
- High quality code
- Nothing forgotten or simplified
- Iteration until complete
- Total process transparency
- You always have control (plan approval)

---

## 📞 Support

For questions about:
- **Claude Code:** https://github.com/anthropics/claude-code/issues
- **This system:** Review agent/skill documentation
- **Zatacka-TS:** Main project README.md

---

**Version:** 1.0.0
**Created:** 2026-02-07
**Last updated:** 2026-02-09

---

*This system was designed to ensure maximum quality, 100% completeness, and technical rigor throughout Zatacka-TS development.*
