# Pre-commit Hook Setup Documentation

**Version:** 1.0.0  
**Created Date:** 2025-01-25  
**Last Updated Date:** 2025-01-25  
**Author:** Kim Hsiao

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage](#usage)
5. [Troubleshooting](#troubleshooting)
6. [Customization](#customization)

## Overview

This project uses **Husky** and **lint-staged** to automatically run code formatting (Prettier) and
static analysis (ESLint) before each Git commit. This ensures that only properly formatted and
linted code is committed to the repository.

### Benefits

- **Consistent Code Quality**: Automatically enforces coding standards
- **Early Error Detection**: Catches linting errors before they reach the repository
- **Automated Formatting**: Ensures consistent code formatting across the team
- **Clear Error Messages**: Provides detailed feedback when issues are found

## Installation

The required packages are already installed as development dependencies:

```bash
pnpm add -D -w husky lint-staged
```

## Configuration

### 1. Husky Configuration

Husky is initialized and configured to run pre-commit hooks:

- **Hook Directory**: `.husky/`
- **Pre-commit Script**: `.husky/pre-commit`

### 2. Lint-staged Configuration

The lint-staged configuration is defined in `.lintstagedrc.json`:

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
  "*.{css,scss,less}": ["prettier --write"]
}
```

### 3. Package.json Scripts

Additional scripts have been added to `package.json`:

```json
{
  "scripts": {
    "pre-commit": "lint-staged",
    "lint:staged": "lint-staged",
    "format:staged": "lint-staged --config .lintstagedrc.json"
  }
}
```

## Usage

### Automatic Execution

The pre-commit hook runs automatically when you execute `git commit`:

```bash
git add .
git commit -m "your commit message"
```

### Manual Execution

You can manually run the linting and formatting on staged files:

```bash
# Run lint-staged on all staged files
pnpm run lint:staged

# Alternative command
pnpm run pre-commit
```

### What Happens During Pre-commit

1. **File Detection**: lint-staged identifies staged files by type
2. **ESLint**: Runs ESLint with `--fix` flag on JavaScript/TypeScript files
3. **Prettier**: Formats all supported file types
4. **Validation**: If any errors remain, the commit is blocked
5. **Success**: If all checks pass, the commit proceeds

## Troubleshooting

### Common Issues

#### 1. ESLint Errors Block Commit

**Problem**: Commit fails due to ESLint errors

**Solution**:

```bash
# Fix ESLint errors manually
npx eslint --fix <file-path>

# Or run on all files
pnpm run lint
```

#### 2. Prettier Formatting Issues

**Problem**: Files are not properly formatted

**Solution**:

```bash
# Format specific files
npx prettier --write <file-path>

# Or format all files
pnpm run format
```

#### 3. Hook Not Running

**Problem**: Pre-commit hook doesn't execute

**Solution**:

```bash
# Reinstall husky
npx husky install

# Check hook permissions
chmod +x .husky/pre-commit
```

### Error Messages

When the pre-commit hook fails, you'll see detailed error messages:

- **ESLint Errors**: Shows file path, line number, and specific rule violations
- **Prettier Errors**: Indicates formatting issues that couldn't be auto-fixed
- **File Status**: Shows which files passed/failed the checks

## Customization

### Adding New File Types

To add support for additional file types, modify `.lintstagedrc.json`:

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
  "*.{css,scss,less}": ["prettier --write"],
  "*.py": ["black", "flake8"], // Example: Python files
  "*.go": ["gofmt -w", "golint"] // Example: Go files
}
```

### Modifying ESLint Rules

Update the ESLint configuration in `.eslintrc.js` or `.eslintrc.security.js` to customize linting
rules.

### Changing Prettier Settings

Modify `.prettierrc` to adjust code formatting preferences.

### Bypassing Pre-commit Hooks

**Warning**: Only use in emergency situations

```bash
git commit --no-verify -m "emergency commit"
```

## File Structure

```
.
├── .husky/
│   ├── _/
│   └── pre-commit          # Pre-commit hook script
├── .lintstagedrc.json      # Lint-staged configuration
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
└── package.json            # Scripts and dependencies
```

## Best Practices

1. **Commit Frequently**: Make small, focused commits to minimize conflicts
2. **Fix Issues Promptly**: Address linting errors as they appear
3. **Team Consistency**: Ensure all team members have the same configuration
4. **Regular Updates**: Keep ESLint and Prettier rules up to date
5. **Documentation**: Update this document when making configuration changes

---

**Note**: This setup ensures code quality and consistency across the entire SoulMatting project. All
team members should follow these guidelines to maintain high code standards.
