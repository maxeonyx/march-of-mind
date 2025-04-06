# CLAUDE.md - Project Guidelines

## Project Overview
March of Mind - An educational incremental game that simulates the development of artificial intelligence from early computing to the singularity. Players progress through research, product development, and technological discovery with an emphasis on historical accuracy and learning. Built with Vue.js, TypeScript, Pinia, and includes Playwright testing and GitHub Actions CI/CD setup.

## Development Philosophy

1. **Quality First**: Prioritize keeping code clean, small and nimble.
2. **Iterative Improvement**: Continuously improve existing code with small, well-tested changes.
3. **Testing**: Ensure test coverage for all new features.
4. **Simplicity**: Keep the codebase clean and minimal. Always remove old code.

## Development Process (STRICT REQUIREMENTS)

1. **Feature Development**
   - Implement the feature in the simplest and cleanest way.
   - Implement a simple and clean test.
   - ALWAYS remove old code if it is no longer required.

2. **Testing Requirements**
   - ALL code changes MUST have corresponding Playwright test.
   - Each test can however be simple.
   - Run the full test suite with `npm run test` prior to every commit
   - Tests MUST pass before any commit
   - NEVER increase test timeouts to make tests pass. The app should respond immediately to state changes.
   - Use NORMAL_TIMEOUT (16ms) for normal UI operations
   - NEVER use arbitrary timeouts like page.waitForTimeout() - this hides performance issues and makes the tests slow.

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
       - Commit and deploy (if the user requests this, proceed with committing, pushing, and deployment steps)
   - ONLY AFTER the user has confirmed, update the semver version in package.json AND update the version history in CLAUDE.md. The version is shown to users, so this is REQUIRED before committing.

   There are no commit message requirements.

4. **Deployment Process**
   The app is deployed via GitHub workflows to GitHub pages. When the user requests deployment or confirms changes:
   
   - YOU (Claude) should perform the deployment steps without asking additional permission
   - The deployment steps are:
     - `git push` to trigger the GitHub Actions workflow
     - `gh run list --limit 5` to check deployment status
     - `gh run watch <run-id>` to monitor the deployment process
     - Verify the new version is live by using WebFetchTool to check https://maxeonyx.github.io/march-of-mind/version.json
     - Report back to the user with a link to the working application: https://maxeonyx.github.io/march-of-mind/
   
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

## Code style

- Use `@/...` imports when importing from a different top-level module.

## Development Commands

### Project Commands
- `npm run build` - Build production-ready assets
- `npm run typecheck` - Check types for both app and tests
- `npm run lint` - Run ESLint code quality checks
- `npm run test` - Run Playwright end-to-end tests
- Do NOT use `npm run dev` or `npm run preview`. You do not need to do this, but if you must, ask the user to do it for you.

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

# Main UI files
- `src/App.vue`
- `src/phases/` - Phase-specific UI layouts
  - `JobPhase.vue` - Will be renamed to ResearchPhase.vue (initial research phase)
  - `CompanyPhase.vue` - Will be renamed to LabPhase.vue (lab management phase)
  - Will add DiscoveryPhase.vue and AGIPhase.vue in future phases

### Components
- `src/components/DateDisplay.vue` - Game date display component
- `src/components/ProgressButton.vue` - Reusable button with progress indicator
- `src/components/ResourceDisplay.vue` - Shows player resources (money, insights)
- Will add components for educational modals with multiple-choice questions

### State Management
- `src/store/index.ts` - Main game state store (Pinia)
- `src/store/products.ts` - Product development and marketing
- `src/store/resources.ts` - Player resources (money, insights)
- `src/store/talent.ts` - Will be renamed to researchers.ts - Researcher management system
- `src/store/time.ts` - Game time progression
- `src/store/version.ts` - Reactive version information
- Will add `src/store/hardware.ts` - Hardware acquisition and FLOP/s tracking
- Will add `src/store/discoveries.ts` - Technology tree and discovery tracking
- Will add `src/store/education.ts` - Educational content and quiz management

### Assets
- `src/assets/` - Images and media assets

### Testing
- `tests/app.spec.ts` - Main application tests

## Version History

Always update both this file `CLAUDE.md` AND `package.json`.

- 0.1.0 - Initial project setup with Vue 3, TypeScript, Pinia, and testing infrastructure
- 0.2.0 - Renamed project to March of Mind, updated base path, added simple counter with "unrealistically earn money" button
- 0.3.0 - Implemented Phase 1 features: "Work for the Man" button with progress bar, "Found a Company" button, game phase transitions, and save/load functionality
- 0.4.0 - Implemented Phase 2 features: Time system (starting from 1950), Talent management with hire/fire functionality, Monthly income/expense system, Game tick mechanics for passive income
- 0.4.1 - Refined Phase 2: Added "Work Hard" button to company phase, moved talent management to separate panel, fixed date advancement, balanced game to last 40 minutes total (~30 seconds per year)
- 0.5.0 - Redesigned talent system to be a net resource drain while contributing to product development progress, simplified time system to use month counter, added product development progress tracking
- 0.5.1 - Made date visible in all game phases, including job phase, and time now passes consistently throughout the game
- 0.6.0 - Major refactoring: Split app into modular components, restructured store into domain-specific modules, added ProgressButton component with color-based progress indicators
- 0.6.1 - Renamed development points to insights and made them slower to accumulate, fixed product launch button by removing redundant progress bar
- 0.6.2 - Cleaned up unused conditional code for legacy button implementations, fixed comment in ProgressButton template
- 0.6.3 - Improved UI layout with compact horizontal header, optimized vertical space, enhanced button click using pure CSS, made text non-selectable
- 0.7.0 - Implemented Phase 3 features: Marketing system with diminishing returns, product catalog with historical AI products, market saturation mechanics
- 0.7.1 - Major architecture refactoring: Converted module stores to Vue composables using reactive state, improved type safety in tests, maintained single Pinia store for coordination
- 0.8.0 - Redesigned game concept: Pivoted to educational focus with AI history progression, multiple-choice questions to unlock technologies, and restructured game phases (Research, Lab, Discovery, AGI phases)
- 0.9.0 - Implemented first two educational phases: Research Phase with educational modal for first discovery, Lab Phase with researcher management and hardware upgrade system