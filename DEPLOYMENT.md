# Deployment Guide

## Quick Start

```bash
# One-command deployment
./scripts/deploy.sh

# Or use npm scripts
npm run deploy
```

## Setup (First Time Only)

1. **Install Git Hooks**
   ```bash
   chmod +x scripts/*.sh
   ./scripts/setup-hooks.sh
   ```

2. **Configure GitHub Pages**
   - Already configured to deploy to: https://jhlee111.github.io/kinetic-audio-synthesizer/
   - Branch: Uses gh-pages branch
   - Source: /dist folder

## Deployment Workflows

### 1. Quick Deploy (GitHub Pages Only)
```bash
npm run build
npm run deploy
```

### 2. Full Deployment with Validation
```bash
./scripts/deploy.sh
# Select option 1 for GitHub Pages only
```

### 3. Create a New Release
```bash
./scripts/release.sh
# Follow prompts to:
# - Select version bump type
# - Add release notes
# - Create tag and push
```

### 4. Deploy + Release
```bash
./scripts/deploy.sh
# Select option 3 for deploy + release
```

## Manual Deployment Steps

### Pre-Deployment Checklist
- [ ] All changes committed
- [ ] On main branch
- [ ] Tests passing
- [ ] No console.log statements in production code
- [ ] Build succeeds locally
- [ ] Updated version in package.json (if releasing)

### Step-by-Step Process

1. **Ensure Clean Working Directory**
   ```bash
   git status
   git add .
   git commit -m "feat: your changes"
   ```

2. **Update from Remote**
   ```bash
   git pull origin main
   ```

3. **Install Dependencies**
   ```bash
   npm ci
   ```

4. **Run Tests** (if available)
   ```bash
   npm test
   ```

5. **Build Project**
   ```bash
   npm run build
   ```

6. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

7. **Create Release** (optional)
   ```bash
   # Bump version
   npm version patch  # or minor/major
   
   # Create tag
   git tag v$(node -p "require('./package.json').version")
   
   # Push everything
   git push origin main --tags
   ```

## Version Management

### Semantic Versioning
- **Patch** (0.0.X): Bug fixes
- **Minor** (0.X.0): New features (backwards compatible)
- **Major** (X.0.0): Breaking changes

### Version Commands
```bash
# Bump patch version (0.0.1 -> 0.0.2)
npm version patch

# Bump minor version (0.1.0 -> 0.2.0)
npm version minor

# Bump major version (1.0.0 -> 2.0.0)
npm version major

# Set specific version
npm version 1.2.3
```

## Automated Workflows

### GitHub Actions
The following workflows run automatically:

1. **On Push to Main**
   - `release.yml`: Creates release PR with changelog
   - `deploy.yml`: Deploys to GitHub Pages

2. **On Tag Push** (v*)
   - `tag-release.yml`: Creates GitHub release with changelog

### Local Automation

1. **Pre-Push Hook**
   - Validates build
   - Checks for console.logs
   - Validates commit messages
   - Checks file sizes

2. **Deployment Script**
   - Handles complete deployment flow
   - Interactive prompts for safety
   - Automatic validation

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm ci
npm run build
```

### Deploy Fails
```bash
# Check gh-pages configuration
git branch -a | grep gh-pages
# If missing, deployment will create it

# Manual gh-pages deploy
npx gh-pages -d dist
```

### Permission Denied on Scripts
```bash
chmod +x scripts/*.sh
```

### Git Hooks Not Running
```bash
./scripts/setup-hooks.sh
```

## Environment Variables

The build process uses these environment variables:
- `BASE_URL`: Set to `/kinetic-audio-synthesizer/` for GitHub Pages
- Automatically configured in GitHub Actions

## Rollback Process

If you need to rollback a deployment:

```bash
# Find previous good commit
git log --oneline

# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific version
git reset --hard <commit-hash>
git push --force origin main

# Redeploy
npm run deploy
```

## Security Notes

- Never commit sensitive data
- API keys should use GitHub Secrets
- Build artifacts are in .gitignore
- Use npm ci instead of npm install for CI/CD

## Monitoring

After deployment:
1. Check deployment URL: https://jhlee111.github.io/kinetic-audio-synthesizer/
2. Monitor GitHub Actions: Check Actions tab
3. Verify release notes: Check Releases page
4. Test core functionality in production

## Quick Commands Reference

```bash
# Setup
./scripts/setup-hooks.sh

# Deploy only
npm run deploy

# Full deployment flow
./scripts/deploy.sh

# Create release
./scripts/release.sh

# Build locally
npm run build

# Preview build
npm run preview

# Development server
npm run dev
```