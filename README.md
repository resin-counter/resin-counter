# Genshin Resin Counter

GNOME Shell extension for tracking Genshin Impact resin with countdown timers.

The best support is to give this project a star on GitHub.

## How it works

1. Enter your current resin amount after playing
2. Extension automatically increments resin every 8 minutes (game's recharge rate)
3. See three countdown timers:
  - Timer until next resin (+1)
  - Timer until full resin (200)
  - Clock time when replenishment ends
 View estimated time for full resin restoration

## Features

- 💾 Offline operation - no external requests
- ⚡ Efficient - reads storage only on login and manual updates
- ⏱️ Real-time countdown timers for resin replenishment
- 🔢 Current resin display in top panel

## Build Commands

```bash
# Compile TypeScript to JavaScript
npm run build

# Install dependencies
npm install
```

## TypeScript Configuration

- Target: ES2023
- Module: NodeNext
- Strict mode enabled
- Source maps disabled
- Compiles `src/*.ts` to root directory

## Code Style Guidelines

### Imports
- Use `gi://` protocol for GNOME/GJS imports: `import St from 'gi://St'`
- Use `resource://` for shell resources: `import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'`
- Group imports: GJS libs first, then shell resources, then local modules
- Use single quotes for strings

### Formatting
- 4-space indentation
- Semicolons required
- No trailing commas
- Max line length: 100 characters

### Types & Naming
- Use TypeScript strict mode - explicit types required
- Classes: PascalCase (e.g., `GenshinResinCounterExtension`)
- Methods/properties: camelCase (e.g., `createBtn`, `buttonText`)
- Private members: use `private` modifier or underscore prefix
- Constants: UPPER_SNAKE_CASE for true constants
- Extensions must export default class extending `Extension` or `ExtensionPreferences`

### Architecture
- Main extension logic in `src/extension.ts` (extends `Extension`)
- Preferences UI in `src/prefs.ts` (extends `ExtensionPreferences`)
- Use GNOME Shell patterns: `enable()` / `disable()` lifecycle methods
- Clean up resources in `disable()`: destroy widgets, clear intervals/timeouts

### Error Handling

- Type assertions with `@ts-ignore` only when necessary (document why)
- Validate state before operations

## GNOME/GJS Specifics

- Use GJS built-in `setInterval`/`setTimeout` (return GLib.Source)
- Destroy GLib sources with `.destroy()` not `clearInterval`
- Access extension path via `this.path`
- Access settings via `this.getSettings()`
- Use `Main.notify()` for desktop notifications
- Widgets: St (Shell Toolkit), Clutter for alignment, Gio for files/settings

## Important Notes

- Compiled `.js` files in root directory are generated - edit `.ts` files only
- Extension UUID defined in `metadata.json`
- Target GNOME Shell version 49
- No test framework configured - manual testing in GNOME Shell required
- No linting configured - follow style guidelines above

## Development Workflow

1. Edit TypeScript files in `src/`
2. Run `npm run build` to compile
3. Test by installing extension in GNOME Shell
4. Reload shell with Alt+F2, type `r`, Enter (X11 only)
