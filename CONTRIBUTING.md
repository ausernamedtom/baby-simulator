# Contributing to Baby Simulator

Thank you for your interest in contributing to Baby Simulator! This document provides guidelines and standards for contributing to the project.

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for our commit messages. Each commit message consists of a **type**, an optional **scope**, and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Changes to the build process or auxiliary tools
- `revert`: Reverts a previous commit

### Scopes

- `game`: Game logic and mechanics
- `ui`: User interface elements
- `mobile`: Mobile-specific features
- `assets`: Game assets (images, sounds)
- `config`: Configuration files
- `docs`: Documentation

### Subject

- Use imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize first letter
- No dot (.) at the end

### Body

- Use imperative, present tense: "change" not "changed" nor "changes"
- Include motivation for the change and contrast with previous behavior

### Footer

- Reference issues using their full URL
- BREAKING CHANGE: if the commit contains a breaking API change

### Examples

```
feat(game): add baby crying animation

Add visual feedback when baby wakes up and starts crying. The animation
includes tears and a crying mouth.

Closes #123
```

```
fix(ui): prevent game from stalling after picking up baby

The game was freezing after picking up the baby due to incorrect state
management in the update method.

Closes #456
```

## Coding Standards

### General Rules
- Use meaningful variable and function names
- Write clear and concise comments
- Keep functions focused on a single responsibility
- Follow the DRY (Don't Repeat Yourself) principle
- Use consistent indentation (4 spaces)
- Always use semicolons at the end of statements
- Use single quotes for strings
- Use camelCase for variable and function names
- Use PascalCase for class names

### JavaScript Standards
- Use `const` for variables that won't be reassigned
- Use `let` for variables that will be reassigned
- Avoid using `var`
- Always use strict equality (`===` and `!==`)
- Use arrow functions for anonymous functions
- Use template literals for string interpolation
- Keep functions small and focused
- Use meaningful parameter names
- Add JSDoc comments for functions and classes

### HTML Standards
- Use semantic HTML elements
- Use lowercase for HTML tags and attributes
- Use double quotes for HTML attributes
- Include alt text for images
- Use proper indentation
- Close all tags properly

### CSS Standards
- Use meaningful class names
- Follow BEM naming convention
- Use consistent spacing
- Group related properties together
- Use shorthand properties when possible
- Avoid using !important
- Use relative units (em, rem) when possible

## Git Commit Messages
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line
- Use the following prefixes:
  - feat: for new features
  - fix: for bug fixes
  - docs: for documentation changes
  - style: for formatting changes
  - refactor: for code refactoring
  - test: for test-related changes
  - chore: for maintenance tasks

## Pull Request Process
1. Fork the repository
2. Create a new branch for your feature/fix
3. Make your changes following the coding standards
4. Add tests if applicable
5. Update documentation if needed
6. Submit a pull request with a clear description

## Code Review Process
- All pull requests must be reviewed
- Address review comments promptly
- Keep the conversation focused on the code
- Be open to feedback and suggestions

## Questions?
If you have any questions about these guidelines, please open an issue in the repository. 