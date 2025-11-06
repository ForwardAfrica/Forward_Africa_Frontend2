# Development Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the Forward Africa Learning Platform development environment.

## Prerequisites

### Required Software

1. **Node.js** (v18.0.0 or higher)
   ```bash
   # Check version
   node --version

   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **npm** (v9.0.0 or higher)
   ```bash
   # Check version
   npm --version

   # Update npm
   npm install -g npm@latest
   ```

3. **Git**
   ```bash
   # Check version
   git --version

   # Configure Git (if not already done)
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

4. **VS Code** (recommended IDE)
   - Download from [https://code.visualstudio.com/](https://code.visualstudio.com/)

### Optional Tools

1. Firebase CLI / Emulator Suite (for backend development)
   ```bash
   npm install -g firebase-tools
   ```

2. **Netlify CLI** (for deployment)
   ```bash
   npm install -g netlify-cli
   ```

## Project Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd forward-africa-platform

# Or if starting fresh
mkdir forward-africa-platform
cd forward-africa-platform
git init
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration

Create environment files:

```bash
# Copy example environment file
cp .env.example .env

# Create development environment file
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Firebase configuration is used. See FIREBASE_MIGRATION_GUIDE.md for required variables and emulator setup.
# Development Configuration
VITE_APP_NAME=Forward Africa (Dev)
VITE_APP_URL=http://localhost:5173
VITE_APP_VERSION=1.0.0-dev

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false
VITE_DEBUG_MODE=true
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev

# Server will start at http://localhost:5173
```

## Development Environment

### VS Code Setup

#### Recommended Extensions

Install these VS Code extensions:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "yzhang.markdown-all-in-one"
  ]
}
```

#### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["className\\s*=\\s*['\"`]([^'\"`]*)['\"`]", "([a-zA-Z0-9\\-:]+)"]
  ]
}
```

#### Debugging Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    }
  ]
}
```

### Code Formatting

#### Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

#### ESLint Configuration

The project includes ESLint configuration in `eslint.config.js`. No additional setup required.

### Git Configuration

#### Git Hooks

Install Husky for Git hooks:

```bash
npm install --save-dev husky lint-staged
npx husky install
```

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

Update `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,md,json}": [
      "prettier --write"
    ]
  }
}
```

#### Git Ignore

Ensure `.gitignore` includes:

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/
```

## Development Workflow

### Branch Strategy

```bash
# Main branches
main          # Production-ready code
develop       # Integration branch for features

# Feature branches
feature/user-authentication
feature/course-management
feature/video-player

# Hotfix branches
hotfix/critical-bug-fix

# Release branches
release/v1.0.0
```

### Development Process

1. **Create Feature Branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature
   ```

2. **Development**:
   ```bash
   # Make changes
   npm run dev  # Test locally
   npm run lint # Check code quality
   npm run build # Verify build
   ```

3. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push and Create PR**:
   ```bash
   git push origin feature/new-feature
   # Create pull request via GitHub/GitLab
   ```

### Commit Message Convention

Use conventional commits:

```bash
# Format: type(scope): description

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, etc.)
refactor: # Code refactoring
test:     # Adding or updating tests
chore:    # Maintenance tasks

# Examples:
git commit -m "feat(auth): add Google OAuth integration"
git commit -m "fix(video): resolve YouTube embedding issue"
git commit -m "docs(api): update authentication documentation"
```

## Development Tools

### Package Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev:host     # Start server accessible on network

# Building
npm run build        # Production build
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking

# Testing (when implemented)
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Browser DevTools

#### React Developer Tools

Install browser extensions:
- React Developer Tools
- Redux DevTools (if using Redux)

#### Performance Profiling

```javascript
// Performance measurement
console.time('Component Render');
// Component code
console.timeEnd('Component Render');

// Memory usage
console.log('Memory usage:', performance.memory);
```

### Development Database

#### Option 1: Firebase (Recommended)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore, Authentication, and Storage
3. Configure Firebase emulator suite for local development (see FIREBASE_MIGRATION_GUIDE.md)
4. Run migration/import scripts to populate Firestore if needed

#### Option 2: Local Development (Mock Data)

The application includes mock data for development without Supabase:

```typescript
// Mock data is automatically used when Supabase is not configured
// See src/data/mockData.ts for sample data
```

## Debugging

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Kill process on port 5173
   lsof -ti:5173 | xargs kill -9

   # Or use different port
   npm run dev -- --port 3000
   ```

2. **Module Not Found**:
   ```bash
   # Clear npm cache
   npm cache clean --force

   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript Errors**:
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit

   # Restart TypeScript server in VS Code
   Ctrl+Shift+P -> "TypeScript: Restart TS Server"
   ```

### Debug Configuration

#### Console Debugging

```typescript
// Development-only logging
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}

// Environment-based debugging
const DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true';
if (DEBUG) {
  console.log('Debug mode enabled');
}
```

#### Network Debugging

```typescript
// Log API calls in development
const apiCall = async (url: string, options?: RequestInit) => {
  if (import.meta.env.DEV) {
    console.log('API Call:', url, options);
  }

  const response = await fetch(url, options);

  if (import.meta.env.DEV) {
    console.log('API Response:', response.status, await response.clone().json());
  }

  return response;
};
```

## Testing Setup

### Unit Testing (Future Implementation)

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Add test scripts to package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### E2E Testing (Future Implementation)

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Initialize Playwright
npx playwright install
```

## Performance Optimization

### Development Performance

1. **Fast Refresh**: Enabled by default with Vite
2. **Hot Module Replacement**: Automatic with Vite
3. **TypeScript**: Incremental compilation

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### Memory Profiling

```javascript
// Monitor component re-renders
import { useEffect, useRef } from 'react';

const useRenderCount = (componentName: string) => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });
};
```

## Deployment from Development

### Development Deployment

```bash
# Build for development deployment
npm run build

# Deploy to Netlify (development)
netlify deploy --dir=dist

# Deploy to Netlify (production)
netlify deploy --prod --dir=dist
```

### Environment-Specific Builds

```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build:prod
```

## Troubleshooting Guide

### Common Development Issues

1. **Slow Development Server**:
   - Clear browser cache
   - Restart development server
   - Check for large files in src/

2. **TypeScript Errors**:
   - Update TypeScript: `npm update typescript`
   - Check tsconfig.json configuration
   - Restart VS Code TypeScript server

3. **Styling Issues**:
   - Verify Tailwind CSS is working
   - Check for CSS conflicts
   - Clear browser cache

4. **Import Errors**:
   - Check file paths (case-sensitive)
   - Verify file extensions
   - Check tsconfig.json paths

### Getting Help

1. **Documentation**: Check docs/ folder
2. **Issues**: Create GitHub issue with reproduction steps
3. **Discussions**: Use GitHub discussions for questions
4. **Code Review**: Request review for complex changes

## Development Best Practices

### Code Organization

1. **File Naming**: Use PascalCase for components, camelCase for utilities
2. **Folder Structure**: Group by feature, not by file type
3. **Import Order**: External libraries, internal modules, relative imports
4. **Component Structure**: Props interface, component, export

### Performance

1. **Lazy Loading**: Use React.lazy for route components
2. **Memoization**: Use React.memo for expensive components
3. **Bundle Splitting**: Separate vendor and app code
4. **Image Optimization**: Use appropriate formats and sizes

### Security

1. **Environment Variables**: Never commit sensitive data
2. **Input Validation**: Validate all user inputs
3. **XSS Prevention**: Sanitize user-generated content
4. **HTTPS**: Use HTTPS in all environments

---

This development setup guide provides everything needed to get started with Forward Africa Learning Platform development. Follow the steps in order and refer back to this guide when setting up new development environments.
