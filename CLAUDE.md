# CLAUDE.md - Project Guidelines

## Project Overview
March of Mind - A cookie clicker style game where you run a company and balance R&D with products, hardware capital and talent. Built with Vue.js, TypeScript, Pinia, and includes Playwright testing and GitHub Actions CI/CD setup.

## Current Features
- Vue 3 with Composition API
- TypeScript support
- Pinia state management
- Vite build system
- ESLint code quality with modern flat config
- Playwright end-to-end testing
- GitHub Actions CI/CD
- GitHub Pages deployment

## Development Philosophy

1. **Quality First**: Prioritize code quality and user experience over feature quantity.
2. **Iterative Improvement**: Continuously improve existing code with small, well-tested changes.
3. **Testing**: Ensure proper test coverage for all features.
4. **Simplicity**: Keep the codebase clean and minimal.

## Development Process (STRICT REQUIREMENTS)

1. **Feature Development**
   - Implement the feature in the simplest and cleanest way.
   - Implement a simple and clean test.
   - ALWAYS remove old code if it is no longer required.

2. **Testing Requirements**
   - ALL code changes MUST have corresponding tests
   - Run the full test suite with `npm run test` prior to every commit
   - Tests MUST pass before any commit
   - NEVER increase test timeouts to make tests pass. The app should respond immediately to state changes.
   - Use NORMAL_TIMEOUT (100ms) for normal UI operations
   - NEVER use arbitrary timeouts like page.waitForTimeout() - this hides performance issues

3. **Pre-Commit Checklist**
   BEFORE git commit, always do ALL of the following:
   
   - Review added & related code, and make any improvements before committing. A small codebase is a good codebase.
   - `npm run typecheck && npm run lint && npm run test`
   - Before reporting back to the user:
     - Do the tests cover this functionality?
     - Is there any code that can now be cleaned up or refactored?
   - Report back to the user. NEVER just commit - always ask the user first.
     - Summarize the changes, and how the changes are covered by the tests.
     - Ask the user what's next
       - Continue development?
       - Commit and (if the app is changed) push (ie. deploy. You don't have to ask here, just go ahead.)
   - ONLY AFTER the user has confirmed, update the semver version in package.json AND update the version history in CLAUDE.md. The version is shown to users, so this is REQUIRED before committing.

   There are no commit message requirements.

4. **Deployment Process**
   The app is deployed via GitHub workflows to GitHub pages. When deploying,
   always do ALL of the following:

   - `git push`
   - `gh run list --limit 5`
   - `gh run watch <run-id>`
   - Verify the new version is live by requesting app-base/version.json
   - If successful, link the user to the working application.
   
5. **Deployment Configuration**
   - `static.yml` - GitHub's standard Pages workflow (configured for our Vue.js app)
   - GitHub Pages must be enabled in repository Settings > Pages
     - Source should be set to "GitHub Actions"

## Tech Stack

### Frontend
- Vue.js 3 with Composition API
- TypeScript 5+
- Pinia for state management
- Modern CSS with flexbox/grid layouts

### Development & Deployment
- Vite build system
- ESLint for code quality
- Playwright for end-to-end testing
- GitHub Actions for CI/CD
- GitHub Pages for hosting

## Development Commands

### Project Commands
- `npm run build` - Build production-ready assets
- `npm run typecheck` - Check types are valid.
- `npm run lint` - Run ESLint code quality checks
- `npm run test` - Run Playwright end-to-end tests
- Do NOT use `npm run dev` or `npm run preview` - you can't view the output. Use comprehensive tests instead.

### Deployment Monitoring Commands
- `gh run list` - Check GitHub Actions workflow status
- `gh run watch` - View summary of a specific workflow run
- `gh run view <run-id> --log-failed` - View only the failed steps in a workflow run
- `gh run rerun <run-id>` - Rerun a failed workflow

## Project Architecture

### Core Organization
- `.github/workflows/static.yml` - GitHub workflow for Pages deployment
- `package.json` - Project dependencies and scripts
- `src/main.ts` - Application entry point
- `src/App.vue` - Root Vue component

### Configuration Files
- `eslint.config.js` - ESLint configuration (using the modern flat config format)
- `tsconfig.json` - TypeScript project configuration
- `tsconfig.app.json` - TypeScript configuration for the Vue application
- `tsconfig.node.json` - TypeScript configuration for Node.js environment
- `vite.config.ts` - Vite bundler configuration
- `playwright.config.ts` - End-to-end testing configuration
- `env.d.ts` - TypeScript declarations for Vite environment

### State Management
- `src/stores/app.ts` - Pinia store for application state

### Composables
- `src/composables/useVersion.ts` - Reactive version information

## Version History

Always update both this file `CLAUDE.md` AND `package.json`.

- 0.1.0 - Initial project setup with Vue 3, TypeScript, Pinia, and testing infrastructure
- 0.2.0 - Renamed project to March of Mind, updated base path, added simple counter with "unrealistically earn money" button
- 0.3.0 - Created static data files with hardware and tech tree, implemented staticData store with helper functions, added tests for static data
- 0.4.0 - Created the four main stores (resources, datacentre, techTree, time) with state and simple getters, implemented all UI components with initial values displayed but no interactions yet
- 0.5.0 - Implemented cross-store getters (incomeRate, workRate, canAffordToHire, etc.) and simple interactions (firing researchers, adjusting work allocation slider, selecting tech cards)
- 0.6.0 - Implemented complex actions with cross-store dependencies (hiring researchers, upgrading hardware, unlocking and progressing tech cards), added debug panel to manually test game mechanics
- 0.7.0 - Implemented game loop with automatic time progression, resource accumulation, and work application; added start/stop game controls
- 0.8.0 - Implemented event and phase system with startup/lab phases, pause/resume functionality, InfoPopup component, and conditional DatacentrePanel rendering; added FounderPanel for manual work in startup phase
