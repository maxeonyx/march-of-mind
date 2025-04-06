# March of Mind

An educational incremental game that simulates the development of artificial intelligence from early computing to the singularity. Players progress through research, product development, and technological discovery with an emphasis on historical accuracy and learning.

![March of Mind logo](/src/assets/logo.png)

## Features

- 🧠 Educational gameplay with multiple-choice questions to unlock technologies
- 💡 Research and insight generation mechanics
- 🖥️ Hardware progression from early computing to quantum systems
- 🔬 Historical AI discoveries and product development
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

## Game Overview

March of Mind takes players through the history of artificial intelligence development:

1. **Research Phase**: Generate insights by clicking the "Research" button
2. **Lab Phase**: Discover the first AI technology, found a lab, develop products for income
3. **Discovery Phase**: Balance product development with technological breakthroughs
4. **AGI Phase**: Experience the exponential acceleration of technology approaching the singularity

Players must answer educational multiple-choice questions to unlock new technologies and products, learning about AI history and concepts along the way.

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
│   ├── components/      # Reusable Vue components
│   ├── phases/          # Game phase components
│   ├── stores/          # Pinia stores for game state
│   ├── types/           # TypeScript type definitions
│   ├── App.vue          # Main game component and UI
│   └── main.ts          # Application entry point
├── tests/               # End-to-end tests
│   └── app.spec.ts      # Game functionality tests
├── public/              # Static assets
├── PLAN.md              # Detailed game development plan
├── CLAUDE.md            # Project documentation and version history
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration with base path
├── tsconfig.json        # TypeScript configuration
├── eslint.config.js     # ESLint configuration
└── playwright.config.ts # Testing configuration
```

## Best Practices

The project follows these development best practices:

- **Game Design**: Balance educational content with engaging gameplay
- **Type Safety**: Use TypeScript for all code
- **Testing**: Write tests for all game features before implementing
- **State Management**: Use Pinia for centralized game state
- **Component Design**: Use Vue's Composition API for clear, reusable game logic
- **Code Quality**: Follow ESLint rules for consistent code style
- **Versioning**: Update version numbers and history with each significant change
- **Continuous Deployment**: Automatically deploy changes to GitHub Pages

## Current Version

**0.7.1** - Major architecture refactoring with modular Pinia stores and improved type safety.

## License

[MIT](LICENSE)