# Zatacka TypeScript

A modern TypeScript remake of the classic DOS game **Zatacka** (Achtung, die Kurve) - the legendary snake-like multiplayer game.

🎮 **Play Now:** https://darenhart.github.io/zataka-ts/

## About

This is a **TypeScript rewrite** of the [original 2015 JavaScript version](https://github.com/darenhart/zatacka). The game has been completely migrated to TypeScript with modern development practices while preserving the classic gameplay.

**Original version:** July 2015 (Vanilla JavaScript)
**TypeScript version:** January 2026

## Migration Strategy

This project was migrated from JavaScript to TypeScript using **Claude AI with specialized subagents**:

- **Plan Agent** - Analyzed codebase, designed migration architecture
- **Explore Agent** - Searched and understood existing code patterns
- **Implementation Agent** - Wrote TypeScript code following the plan
- **Validation Agent** - Reviewed code quality and ran comprehensive tests

Each component was migrated systematically through 10 phases, with subagents collaborating to ensure type safety, test coverage (438 tests), and zero runtime errors. The entire codebase (11K+ lines) was migrated with full git history preserved.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Technology Stack

- **TypeScript 5.9** - Strict mode, ES2022 target
- **Vite 6** - Build tool and dev server
- **Vitest 4** - Testing framework
- **HTML5 Canvas** - Game rendering
- **GitHub Pages** - Hosting

## Credits

**Original Game:** Zatacka / Achtung, die Kurve (DOS, 1995)
**Original JS Version:** Daniel Arenhart (2015)
**TypeScript Migration:** Daniel Arenhart with Claude AI (2026)

## License

ISC

---

**Enjoy the classic multiplayer fun!** 🎮🐍
