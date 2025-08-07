#!/bin/bash

# Deployment script for Kinetic Audio Synthesizer
# This script handles the complete deployment process from local machine

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_step "Starting deployment process..."

# 1. Check git status
print_step "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes:"
    git status --short
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled."
        exit 1
    fi
fi

# 2. Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "You are on branch '$CURRENT_BRANCH', not 'main'."
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled."
        exit 1
    fi
fi

# 3. Pull latest changes
print_step "Pulling latest changes from remote..."
git pull origin main

# 4. Install dependencies
print_step "Installing dependencies..."
npm ci

# 5. Run tests if they exist
if [ -f "jest.config.js" ]; then
    print_step "Running tests..."
    npm test --if-present || {
        print_warning "Tests failed or not configured."
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled."
            exit 1
        fi
    }
fi

# 6. Build the project
print_step "Building the project..."
npm run build

# 7. Check build output
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found."
    exit 1
fi

# 8. Get deployment type
echo
echo "Select deployment type:"
echo "1) Deploy to GitHub Pages only"
echo "2) Create a new release (with tag and changelog)"
echo "3) Deploy and create release"
read -p "Enter choice (1-3): " DEPLOY_TYPE

case $DEPLOY_TYPE in
    1)
        # Deploy to GitHub Pages only
        print_step "Deploying to GitHub Pages..."
        npm run deploy
        print_success "Deployed to GitHub Pages successfully!"
        ;;
    2)
        # Create release only
        ./scripts/release.sh
        ;;
    3)
        # Deploy and release
        print_step "Deploying to GitHub Pages..."
        npm run deploy
        print_success "Deployed to GitHub Pages successfully!"
        ./scripts/release.sh
        ;;
    *)
        print_error "Invalid choice."
        exit 1
        ;;
esac

# 9. Final status
echo
print_success "Deployment process completed!"
echo
echo "Next steps:"
echo "- Check the deployment at: https://jhlee111.github.io/kinetic-audio-synthesizer/"
echo "- Monitor GitHub Actions for any automated workflows"
if [[ $DEPLOY_TYPE == "2" ]] || [[ $DEPLOY_TYPE == "3" ]]; then
    echo "- Check the releases page on GitHub"
fi