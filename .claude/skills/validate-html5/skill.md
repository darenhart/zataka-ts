# Skill: Validate HTML5 ✅

## Description
Skill to validate HTML5 compatibility, Canvas API, browser support and check correct usage of modern web APIs in the Zatacka project.

## When to Use
- ✅ Before deploy/release
- ✅ After using new APIs
- ✅ To check cross-browser compatibility
- ✅ To validate HTML semantics
- ✅ To ensure standards compliance
- ✅ Before adding features that use modern APIs

## How It Works

This skill:
1. Validates HTML5 markup
2. Verifies correct Canvas API usage
3. Tests cross-browser compatibility
4. Validates usage of modern APIs (Performance, Storage, etc)
5. Verifies basic accessibility
6. Generates compatibility report

## Validation Areas

### 1. HTML5 Markup

**Checklist:**
- [ ] Correct DOCTYPE (`<!DOCTYPE html>`)
- [ ] Semantic tags used appropriately
- [ ] Charset declared (`<meta charset="utf-8">`)
- [ ] Viewport meta tag (for mobile)
- [ ] Valid attributes
- [ ] Valid structure
- [ ] No deprecated tags

**Tools:**
- W3C HTML Validator: https://validator.w3.org/
- HTMLHint
- html-validate

```bash
# Validate HTML
npx html-validate index.html

# Or use W3C validator
curl -H "Content-Type: text/html; charset=utf-8" \
  --data-binary @index.html \
  https://validator.w3.org/nu/?out=json
```

### 2. Canvas API

**Checklist:**
- [ ] Canvas element with fallback content
- [ ] getContext('2d') with error handling
- [ ] Canvas methods used correctly
- [ ] Coordinates within bounds
- [ ] Context state management (save/restore)
- [ ] Safe ImageData manipulation
- [ ] toDataURL / toBlob with handling

**Zatacka-Specific Checks:**
```javascript
// ✅ Check Canvas support
const canvas = document.getElementById('main');
if (!canvas || !canvas.getContext) {
  // Fallback or error message
  alert('Canvas not supported! Use modern browser.');
}

const context = canvas.getContext('2d');
if (!context) {
  alert('Canvas 2D context not available!');
}

// ✅ Check getImageData support
try {
  const testData = context.getImageData(0, 0, 1, 1);
} catch(e) {
  console.error('getImageData not supported or blocked by CORS');
}
```

### 3. Browser APIs

**APIs used in Zatacka:**
- [ ] Canvas 2D Context
- [ ] requestAnimationFrame
- [ ] KeyboardEvent
- [ ] MouseEvent
- [ ] Performance API (performance.now())
- [ ] Window events (resize, load)

**Compatibility Checks:**
```javascript
// Check requestAnimationFrame
if (!window.requestAnimationFrame) {
  // Polyfill or fallback
  window.requestAnimationFrame = function(callback) {
    return setTimeout(callback, 16);
  };
}

// Check Performance API
if (!window.performance || !window.performance.now) {
  // Fallback to Date.now()
  window.performance = {
    now: function() {
      return Date.now();
    }
  };
}
```

### 4. Cross-Browser Compatibility

**Browsers to Test:**
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ Mobile browsers (iOS Safari, Chrome Mobile)

**Features to Check:**
- Canvas rendering
- Event listeners
- requestAnimationFrame
- getImageData
- Keyboard/Mouse events
- Performance APIs

**Tools:**
- Can I Use: https://caniuse.com/
- BrowserStack: For tests on multiple browsers
- Sauce Labs: Automated cross-browser testing

### 5. Accessibility (Basic)

**Checklist:**
- [ ] Images have alt text
- [ ] Adequate contrast ratio
- [ ] Keyboard navigation (where applicable)
- [ ] ARIA labels for canvas (fallback content)
- [ ] Visible focus indicators

**For Zatacka:**
```html
<!-- ✅ Canvas with fallback content -->
<canvas id="main">
  Your browser does not support HTML5 Canvas.
  Please use a modern browser such as Chrome, Firefox or Safari.
</canvas>

<!-- ✅ Images with alt text -->
<img src="img/achtung-small.png" alt="Zatacka Game Logo">
```

## Report Format

```markdown
### HTML5 Validation Report - [Date/Time]

#### 📊 Summary

- **HTML5 Markup:** [✅ VALID / ❌ ERRORS]
- **Canvas API:** [✅ OK / ⚠️ ISSUES]
- **Browser Compatibility:** [✅ COMPATIBLE / ⚠️ LIMITATIONS]
- **Accessibility:** [✅ OK / ⚠️ IMPROVEMENTS NEEDED]
- **Overall Status:** [✅ APPROVED / ⚠️ ATTENTION / ❌ REJECTED]

---

#### 📄 HTML5 Markup Validation

**W3C Validation:**
- Errors: [N]
- Warnings: [N]

**Issues Found:**
1. [Error/Warning 1]
2. [Error/Warning 2]

**Recommendations:**
- [Fix 1]
- [Fix 2]

---

#### 🎨 Canvas API Validation

**Canvas Support:**
- Canvas element: [✅/❌]
- 2D Context: [✅/❌]
- getImageData: [✅/❌]
- toDataURL: [✅/❌]

**Usage Issues:**
- [Issue 1 if any]
- [Issue 2 if any]

**Best Practices:**
- [X] Error handling present
- [X] Fallback content defined
- [X] Context state management correct
- [ ] [Issue if any]

---

#### 🌐 Browser Compatibility

##### Chrome (latest)
- Canvas: ✅
- requestAnimationFrame: ✅
- getImageData: ✅
- Events: ✅
- Performance: ✅
- **Status:** ✅ FULLY COMPATIBLE

##### Firefox (latest)
- Canvas: ✅
- requestAnimationFrame: ✅
- getImageData: ✅
- Events: ✅
- Performance: ✅
- **Status:** ✅ FULLY COMPATIBLE

##### Safari (latest)
- Canvas: ✅
- requestAnimationFrame: ✅
- getImageData: ⚠️ [issue if any]
- Events: ✅
- Performance: ✅
- **Status:** [✅/⚠️]

##### Edge (latest)
- Canvas: ✅
- requestAnimationFrame: ✅
- getImageData: ✅
- Events: ✅
- Performance: ✅
- **Status:** ✅ FULLY COMPATIBLE

##### Mobile Browsers
- iOS Safari: [⚠️ CONTROLS NOT SUPPORTED]
- Chrome Mobile: [⚠️ CONTROLS NOT SUPPORTED]
- **Status:** ❌ NOT SUPPORTED (desktop-only game)

---

#### ♿ Accessibility Check

**WCAG Compliance:**
- Color Contrast: [✅/⚠️]
- Alt Text: [✅/⚠️]
- Keyboard Navigation: [N/A for game]
- ARIA Labels: [✅/⚠️]
- Focus Indicators: [✅/⚠️]

**Issues:**
- [Issue 1]
- [Issue 2]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]

---

#### 🔧 API Usage Validation

##### Performance API
- performance.now(): [✅ USED CORRECTLY]
- Fallback present: [✅/❌]

##### Canvas API
- getContext(): [✅ WITH ERROR HANDLING]
- getImageData(): [✅ USED CORRECTLY]
- Context operations: [✅ CORRECT]

##### Event APIs
- KeyboardEvent: [✅ CORRECT]
- MouseEvent: [✅ CORRECT]
- Event listeners cleanup: [⚠️ SEE DETAILS]

##### requestAnimationFrame
- Usage: [✅ CORRECT]
- Fallback/Polyfill: [✅/❌]

---

#### 💡 Recommendations

##### 🔴 CRITICAL
1. [Critical recommendation]

##### 🟡 MODERATE
1. [Moderate recommendation]

##### 🟢 OPTIONAL
1. [Optional recommendation]

---

#### 🏁 Final Verdict

**Compatibility:** [X/10]
**Standards Compliance:** [X/10]
**Accessibility:** [X/10]

**Status:** [✅ APPROVED / ⚠️ APPROVED WITH RESERVATIONS / ❌ REQUIRES FIXES]

**Conclusion:**
[General summary and next steps]
```

## Complete Checklist

### HTML5 Markup
- [ ] DOCTYPE html5
- [ ] Meta charset UTF-8
- [ ] Meta viewport (if mobile)
- [ ] Semantic HTML5 tags
- [ ] Valid structure
- [ ] No deprecated tags
- [ ] Proper nesting
- [ ] Valid attributes

### Canvas
- [ ] Canvas element present
- [ ] Fallback content
- [ ] Width/height attributes
- [ ] Appropriate CSS sizing
- [ ] getContext with error handling
- [ ] getImageData with try/catch
- [ ] Context state management
- [ ] Proper coordinates (no NaN/Infinity)

### Browser APIs
- [ ] requestAnimationFrame with fallback
- [ ] Performance API with fallback
- [ ] Event listeners with removeEventListener
- [ ] No deprecated APIs (webkitRequestAnimationFrame)
- [ ] Feature detection before use
- [ ] Polyfills when necessary

### Compatibility
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested in Edge
- [ ] Mobile compatibility verified
- [ ] Fallbacks for older browsers (if supported)

### Accessibility
- [ ] Alt text on images
- [ ] Fallback content in canvas
- [ ] Adequate color contrast
- [ ] ARIA labels where appropriate
- [ ] Keyboard navigation (where applicable)

### Performance
- [ ] No layout thrashing
- [ ] requestAnimationFrame used
- [ ] Efficient Canvas operations
- [ ] No memory leaks
- [ ] Optimized for 60 FPS

## Tools and Resources

### Online Validators
```markdown
- W3C HTML Validator: https://validator.w3.org/
- W3C CSS Validator: https://jigsaw.w3.org/css-validator/
- Can I Use: https://caniuse.com/
- MDN Browser Compatibility Data: https://github.com/mdn/browser-compat-data
```

### CLI Tools
```bash
# HTML validation
npm install -g html-validate
html-validate index.html

# Accessibility check
npm install -g pa11y
pa11y http://localhost:8000

# Lighthouse (overall)
npm install -g lighthouse
lighthouse http://localhost:8000 --view
```

### Browser DevTools
```markdown
- Chrome DevTools > Lighthouse
- Firefox DevTools > Accessibility Inspector
- Safari Web Inspector
- Edge DevTools
```

## Canvas API Compatibility

### Zatacka Requirements

```markdown
**Minimum Requirements:**
- Canvas 2D Context
- getImageData / putImageData
- Arc, fill, stroke, clearRect
- fillStyle, strokeStyle
- beginPath, closePath
- save / restore

**All modern browsers support:**
- Chrome 4+
- Firefox 3.6+
- Safari 4+
- Edge (all versions)
- IE 9+ (obsolete, not supported)

**Conclusion:** Zatacka is compatible with all modern browsers.
```

### Potential Issues

```markdown
**CORS with getImageData:**
- If loading images from different domain
- Solution: use CORS headers or serve locally

**Hardware Acceleration:**
- Some browsers/OS may disable it
- Affects performance but not functionality
- User should enable if possible

**High DPI / Retina Displays:**
- Canvas may appear blurry
- Solution: detect devicePixelRatio and adjust
- Not critical for Zatacka
```

## Report Example

```markdown
### HTML5 Validation Report - Zatacka

#### 📊 Summary

- **HTML5 Markup:** ✅ VALID
- **Canvas API:** ✅ OK
- **Browser Compatibility:** ✅ COMPATIBLE
- **Accessibility:** ⚠️ IMPROVEMENTS SUGGESTED
- **Overall Status:** ✅ APPROVED WITH RESERVATIONS

#### 📄 HTML5 Markup

✅ Correct DOCTYPE
✅ UTF-8 Charset
✅ Valid structure
✅ No deprecated tags

#### 🎨 Canvas API

✅ Canvas support with fallback
✅ getContext with error handling
✅ getImageData used correctly
✅ Context state management OK

#### 🌐 Browser Compatibility

✅ Chrome: Fully compatible
✅ Firefox: Fully compatible
✅ Safari: Fully compatible
✅ Edge: Fully compatible
❌ Mobile: Not supported (by design)

#### ♿ Accessibility

⚠️ Add meta description
⚠️ Improve contrast ratio in some texts
✅ Alt text present
✅ Canvas fallback present

#### 🏁 Verdict

✅ APPROVED WITH RESERVATIONS

The game is fully compatible with all modern desktop browsers.
Accessibility recommendations are optional but would improve experience.
```

## Integration with Sub-Agents

This skill is used by the **qa-tester** subagent to validate HTML5 compatibility and browser support as part of QA process.

## Notes

- Zatacka is desktop-only game (mouse/keyboard)
- Mobile support not an objective
- Focus on modern browsers (latest 2 versions)
- IE not supported (obsolete)
- Canvas API well supported in all modern browsers

## Limitations

- Doesn't test all possible browsers
- Some issues only appear on specific hardware
- Accessibility testing is basic
- Manual cross-browser testing can be time-consuming

## Future Improvements

- [ ] Automated cross-browser testing (BrowserStack/Sauce Labs)
- [ ] Visual regression testing
- [ ] Automated accessibility testing (aXe, Pa11y)
- [ ] Performance testing on multiple browsers
- [ ] CI/CD integration for continuous validation
