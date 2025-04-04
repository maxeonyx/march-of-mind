# Vue Hello World Template

A modern Vue.js starter template with TypeScript, Pinia, Playwright testing, and GitHub Actions CI/CD setup. This project provides a solid foundation for developing Vue applications with best practices baked in.

## Features

- 📦 Vue 3 with Composition API
- 🧰 TypeScript support
- 🗄️ Pinia state management
- ⚡ Vite build system
- 🧹 ESLint with modern flat config
- 🧪 Playwright end-to-end testing
- 🚀 GitHub Actions CI/CD
- 🌐 GitHub Pages deployment

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

## Customizing the Template

Here's how to customize this template for your project:

1. **Update package.json**
   - Change `name`, `version`, and other project metadata
   - Add/remove dependencies as needed

2. **Update application name in vite.config.ts**
   - Change the `base` property to match your repository name for GitHub Pages

3. **Modify the App component**
   - Edit `src/App.vue` to create your application UI

4. **Set up state management**
   - Add state, getters, and actions to `src/stores/app.ts` 

5. **Configure GitHub Pages deployment**
   - Make sure GitHub Pages is enabled in repository Settings > Pages
   - Source should be set to "GitHub Actions"

## Development Workflow

This template includes a comprehensive development workflow:

### Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Check types
- `npm run lint` - Run ESLint
- `npm run test` - Run Playwright end-to-end tests

### GitHub Actions

The included GitHub Actions workflow automatically:

1. Runs tests 
2. Builds the application
3. Deploys to GitHub Pages

## Project Structure

```
.
├── .github/workflows/   # GitHub Actions workflows
├── src/                 # Source code
│   ├── assets/          # Assets (images, fonts, etc.)
│   ├── composables/     # Composable functions
│   ├── stores/          # Pinia stores
│   ├── types/           # TypeScript type definitions
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── tests/               # End-to-end tests
├── public/              # Static assets
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── eslint.config.js     # ESLint configuration
└── playwright.config.ts # Playwright configuration
```

## Best Practices

This template encourages the following best practices:

- **Type Safety**: Use TypeScript for all code
- **Testing**: Write tests for all features
- **State Management**: Use Pinia for reactive state
- **Component Design**: Use the Composition API for clear, reusable logic
- **Code Quality**: Follow ESLint rules for consistent code style

## License

[MIT](LICENSE)