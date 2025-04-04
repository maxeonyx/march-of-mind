# March of Mind

A cookie clicker style game where you run a company and balance R&D with products, hardware capital, and talent. Built with Vue.js, TypeScript, Pinia, and includes Playwright testing and GitHub Actions CI/CD setup.

![March of Mind logo](/src/assets/logo.png)

## Features

- 💰 Simple resource management gameplay
- 📦 Vue 3 with Composition API
- 🧰 TypeScript support
- 🗄️ Pinia state management
- ⚡ Vite build system
- 🧹 ESLint with modern flat config
- 🧪 Playwright end-to-end testing
- 🚀 GitHub Actions CI/CD
- 🌐 GitHub Pages deployment

## Play the Game

You can play the current version of the game at: [https://maxeonyx.github.io/march-of-mind/](https://maxeonyx.github.io/march-of-mind/)

## Using This Template

This repository is designed to be used as a starting point for new Vue.js projects. Here's how to get started:

### Option 1: Create a new repository from this template

1. Click the "Use this template" button on GitHub
2. Name your new repository and create it
3. Clone your new repository locally
4. Run `npm install` to install dependencies
5. Start developing!

### Option 2: Clone and reset Git history

If you want to start with a clean Git history:

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/vue-hello-world.git my-new-project
   ```

2. Navigate to the project directory
   ```bash
   cd my-new-project
   ```

3. Remove the existing Git history
   ```bash
   rm -rf .git
   ```

4. Initialize a new Git repository
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

5. Link to your remote repository
   ```bash
   git remote add origin https://github.com/yourusername/my-new-project.git
   git push -u origin main
   ```

### Option 3: Squash existing history

If you want to preserve the commit structure but start from a clean slate:

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/vue-hello-world.git my-new-project
   ```

2. Navigate to the project directory
   ```bash
   cd my-new-project
   ```

3. Find the first commit hash
   ```bash
   git log --reverse --pretty=oneline | head -1
   ```

4. Soft reset to that commit and create a fresh initial commit
   ```bash
   git reset --soft <first-commit-hash>
   git commit -m "Initial commit with Vue Hello World template"
   ```

5. Set up a new remote and push
   ```bash
   git remote set-url origin https://github.com/yourusername/my-new-project.git
   git push -f origin main
   ```

## Game Development

Here's how to contribute to the game development:

1. **Game Mechanics**
   - The game is a resource management simulation
   - Currently implemented: Basic money counter with "unrealistically earn money" button
   - Planned: R&D, products, hardware capital, and talent management

2. **State Management**
   - Game state is managed in `src/stores/app.ts`
   - Add new resources, upgrades, and mechanics here

3. **User Interface**
   - Main game UI is in `src/App.vue`
   - Consider creating component files for complex UI elements

4. **Automated Deployment**
   - All changes pushed to main branch are automatically deployed
   - The deployment process:
     - Runs tests
     - Builds the application
     - Deploys to GitHub Pages
   - No manual deployment steps needed

## Development Workflow

The project follows a streamlined development workflow:

### Commands

- `npm run typecheck` - Check TypeScript types
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run Playwright end-to-end tests
- `npm run build` - Build for production
- Note: In this repository, using the development server is not necessary as we work through automated tests

### Pre-Commit Checklist

Before committing changes, always:

1. Run all checks: `npm run typecheck && npm run lint && npm run test`
2. Update version numbers in both `package.json` and `CLAUDE.md` 
3. Describe changes in version history in `CLAUDE.md`

### GitHub Actions

The deployment workflow automatically:

1. Runs tests on every push to main
2. Builds the application
3. Deploys to GitHub Pages
4. Makes the changes available at the public URL

### Monitoring Deployments

To check deployment status:
```bash
gh run list --limit 5
gh run watch <run-id>
```

## Project Structure

```
.
├── .github/workflows/   # GitHub Actions workflows
├── src/                 # Source code
│   ├── assets/          # Game assets (logo, images, etc.)
│   ├── composables/     # Reusable Vue composition functions
│   ├── stores/          # Pinia stores for game state
│   │   └── app.ts       # Main game state management
│   ├── types/           # TypeScript type definitions
│   ├── App.vue          # Main game component and UI
│   └── main.ts          # Application entry point
├── tests/               # End-to-end tests
│   └── app.spec.ts      # Game functionality tests
├── public/              # Static assets
│   └── favicon.ico      # Game icon for browser tab
├── CLAUDE.md            # Project documentation and version history
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration with base path
├── tsconfig.json        # TypeScript configuration
├── eslint.config.js     # ESLint configuration
└── playwright.config.ts # Testing configuration
```

## Best Practices

The project follows these development best practices:

- **Game Design**: Balance complexity with accessibility
- **Type Safety**: Use TypeScript for all code
- **Testing**: Write tests for all game features before implementing
- **State Management**: Use Pinia for centralized game state
- **Component Design**: Use Vue's Composition API for clear, reusable game logic
- **Code Quality**: Follow ESLint rules for consistent code style
- **Versioning**: Update version numbers and history with each significant change
- **Continuous Deployment**: Automatically deploy changes to GitHub Pages

## Current Version

**0.2.0** - Basic game setup with money counter and "unrealistically earn money" button

## License

[MIT](LICENSE)