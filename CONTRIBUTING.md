# Contributing Guide

## Commit Message Conventions

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This enables automatic changelog generation and semantic versioning.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

### Examples

```bash
# Feature
feat(audio): add support for new instrument plugins

# Bug fix
fix(hand-tracking): resolve tracking loss on rapid movements

# Breaking change (add ! after type)
feat!: change default scale mapping algorithm

# With scope
feat(visualizer): add particle system effects

# With body
fix(audio): prevent audio context suspension

Fixes issue where audio would stop after tab backgrounding.
Implements wake lock API to maintain context.

# With footer
feat(scales): add wave function collapse scale generation

Closes #123
```

### Scope Examples

Common scopes for this project:
- `audio`: Audio synthesis and playback
- `hand-tracking`: Hand detection and tracking
- `visualizer`: Visual effects and rendering
- `scales`: Musical scale mappings
- `plugins`: Instrument plugins
- `ui`: User interface components
- `config`: Configuration and settings

## Creating a Release

Releases are automated through GitHub Actions:

### Method 1: Automatic Release (Recommended)

1. Follow conventional commit messages in your PRs
2. When merged to main, release-please will automatically:
   - Create a release PR with version bump
   - Generate changelog entries
   - Create GitHub release when PR is merged

### Method 2: Manual Tag Release

1. Create and push a semantic version tag:
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```
2. GitHub Actions will automatically:
   - Generate changelog for the release
   - Update CHANGELOG.md
   - Create a GitHub release

### Version Numbering

We use [Semantic Versioning](https://semver.org/):
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features (backwards compatible)
- **PATCH** (0.0.1): Bug fixes (backwards compatible)

Breaking changes are indicated by `!` in commit messages:
```bash
feat!: change hand tracking API
```