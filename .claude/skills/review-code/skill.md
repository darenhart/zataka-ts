# Skill: Review Code 🔍

## Description
Skill to perform static code analysis, linting, verification of best practices and identification of code smells in the Zatacka project.

## When to Use
- ✅ After writing new code
- ✅ Before commits
- ✅ During code review process
- ✅ To identify quality issues
- ✅ To check standards compliance
- ✅ To detect potential bugs

## How It Works

This skill:
1. Executes static code analysis
2. Verifies JavaScript/TypeScript best practices
3. Identifies code smells
4. Verifies formatting and style
5. Detects potential bugs
6. Generates detailed report of issues

## Tools Used

### ESLint
Main linter for JavaScript/TypeScript

```bash
# Install ESLint
npm install --save-dev eslint

# Initialize configuration
npx eslint --init

# Run ESLint
npx eslint .
npx eslint "**/*.{js,ts}"
```

### Prettier
Code formatter

```bash
# Install Prettier
npm install --save-dev prettier

# Run Prettier
npx prettier --check .
npx prettier --write .  # Fix formatting
```

### TypeScript Compiler
For TypeScript projects

```bash
# Check types
npx tsc --noEmit
```

## Configuração Recomendada

### .eslintrc.json

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off",
    "no-var": "warn",
    "prefer-const": "warn",
    "eqeqeq": "warn",
    "curly": "warn",
    "no-eval": "error",
    "no-implied-eval": "error"
  }
}
```

### .prettierrc.json

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Review Checklist

### JavaScript/TypeScript Quality
- [ ] No `var`, use `const`/`let`
- [ ] No unused variables
- [ ] No forgotten console.log (in production)
- [ ] Proper use of `===` instead of `==`
- [ ] Arrow functions for callbacks
- [ ] Async/await for promises (if applicable)
- [ ] Proper error handling
- [ ] No `eval()` or `Function()` constructor

### Canvas/Game Specific
- [ ] Context state management (save/restore)
- [ ] Efficient use of getImageData
- [ ] requestAnimationFrame used correctly
- [ ] No memory leaks (event listeners)
- [ ] Performance considerations

### Code Organization
- [ ] Small and focused functions
- [ ] Descriptive names
- [ ] No code duplication
- [ ] Separation of concerns
- [ ] Appropriate modularity

### Documentation
- [ ] Complex functions commented
- [ ] Non-obvious algorithms explained
- [ ] TODOs clearly marked
- [ ] Types documented (TypeScript)

### Security
- [ ] Input validation
- [ ] No XSS vulnerabilities
- [ ] No eval of user input
- [ ] Safe DOM manipulation

## Report Format

```markdown
### Code Review Report - [Date/Time]

#### 📊 Summary

- **Files Analyzed:** X
- **Issues Found:** Y
- **Critical:** Z
- **Warnings:** W
- **Suggestions:** V

---

#### 🔴 CRITICAL ISSUES

1. **[Issue Title]**
   - File: `path/to/file.js:line`
   - Category: [Bug/Security/Performance]
   - Description: [detailed description]
   - Solution: [how to fix]

---

#### 🟡 WARNINGS

1. **[Warning Title]**
   - File: `path/to/file.js:line`
   - Category: [Code Smell/Best Practice]
   - Description: [description]
   - Suggestion: [how to improve]

---

#### 🟢 SUGGESTIONS

1. **[Suggestion Title]**
   - File: `path/to/file.js:line`
   - Category: [Refactoring/Optimization]
   - Description: [description]
   - Benefit: [what improves]

---

#### ✅ POSITIVE ASPECTS

- [Well-implemented aspect 1]
- [Well-implemented aspect 2]

---

#### 📈 Metrics

- **Complexity:** [low/medium/high]
- **Maintainability:** [1-10]
- **Test Coverage:** [if available]
- **Technical Debt:** [low/medium/high]

---

#### 🎯 Recommendations

1. [Priority recommendation 1]
2. [Priority recommendation 2]
3. [Priority recommendation 3]

---

#### 🏁 Verdict

[X] ✅ APPROVED
[ ] ⚠️ APPROVED WITH RESERVATIONS
[ ] ❌ REJECTED - Corrections needed
```

## Manual Analysis

Beyond automated tools, manually review:

### Anti-Patterns

```javascript
// ❌ Global scope pollution
var globalVar = 'bad';

// ✅ Encapsulated
const scopedVar = 'good';

// ❌ Magic numbers
if (player.score > 15) { }

// ✅ Named constants
const MAX_ROUNDS = 15;
if (player.score > MAX_ROUNDS) { }

// ❌ Deep nesting
if (a) {
  if (b) {
    if (c) {
      if (d) {
        // ...
      }
    }
  }
}

// ✅ Early returns
if (!a) return;
if (!b) return;
if (!c) return;
if (!d) return;
// ...
```

### Canvas Best Practices

```javascript
// ❌ Excessive save/restore
for (let player of players) {
  context.save();
  context.fillStyle = player.color;
  context.fill();
  context.restore();
}

// ✅ Only when needed
context.save();
for (let player of players) {
  context.fillStyle = player.color;
  context.fill();
}
context.restore();

// ❌ getImageData in loop
for (let x = 0; x < 100; x++) {
  const pixel = context.getImageData(x, y, 1, 1);
}

// ✅ Batch getImageData
const imageData = context.getImageData(0, y, 100, 1);
for (let x = 0; x < 100; x++) {
  const pixel = imageData.data[x * 4];
}
```

### Memory Leaks

```javascript
// ❌ Event listener leak
function start() {
  canvas.addEventListener('click', handleClick);
}

// ✅ Proper cleanup
class Game {
  start() {
    this.boundHandleClick = this.handleClick.bind(this);
    canvas.addEventListener('click', this.boundHandleClick);
  }

  stop() {
    canvas.removeEventListener('click', this.boundHandleClick);
  }
}
```

## Useful Commands

```bash
# ESLint
npx eslint . --ext .js,.ts
npx eslint . --fix  # Auto-fix issues
npx eslint . --max-warnings 0  # Fail if there are warnings

# Prettier
npx prettier --check .
npx prettier --write .

# TypeScript
npx tsc --noEmit  # Type checking

# Combined (in package.json)
npm run lint
npm run format
npm run type-check

# With pre-commit hook
npm install --save-dev husky lint-staged
```

## Integration with CI/CD

```yaml
# .github/workflows/lint.yml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run lint
      - run: npm run format:check
      - run: npm run type-check
```

## Usage Examples

### Example 1: New Code Analysis

```markdown
### Code Review - New Feature: Win Counter

#### 📊 Summary
- Files Analyzed: 3
- Issues Found: 2
- Critical: 0
- Warnings: 2

#### 🟡 WARNINGS

1. **Unused variable**
   - File: `Player.js:145`
   - ESLint: no-unused-vars
   - Code: `var tempScore = 0;`
   - Solution: Remove variable or use it

2. **Use of var instead of const**
   - File: `Score.js:23`
   - ESLint: no-var
   - Code: `var x = 10;`
   - Solution: Use `const x = 10;`

#### ✅ POSITIVE ASPECTS
- Readable and well-structured code
- Clear naming
- Simple and straightforward logic

#### 🏁 Verdict
✅ APPROVED WITH RESERVATIONS - Fix 2 minor warnings
```

### Example 2: Security Analysis

```markdown
### Security Review

#### 🔴 CRITICAL ISSUES

1. **Possible XSS**
   - File: `SelectPlayers.js:78`
   - Severity: CRITICAL
   - Code:
     ```javascript
     element.innerHTML = playerName;
     ```
   - Problem: If playerName comes from user input, could contain malicious HTML/JS
   - Solution:
     ```javascript
     element.textContent = playerName;
     ```

#### 🏁 Verdict
❌ REJECTED - Security vulnerability must be fixed
```

## Integration with Sub-Agents

This skill is used by the **code-reviewer** subagent as part of automated review process, complementing manual review.

## Notes

- Linting and formatting should be consistent throughout project
- Configure pre-commit hooks to prevent problematic code
- Balance between rigor and pragmatism - not all rules need to be ultra-strict
- Automated tools complement, not replace, human review

## Limitations

- Automated tools don't detect all issues
- Some code smells require human context
- Performance issues may not be obvious to linters
- Logic errors not detected by static analysis

## Future Improvements

- [ ] Configure pre-commit hooks with Husky
- [ ] Add SonarQube or similar for deep analysis
- [ ] Configure complexity metrics (cyclomatic complexity)
- [ ] Add security scanning (Snyk, npm audit)
- [ ] Integrate with CI/CD pipeline
- [ ] Add custom ESLint rules specific to project
