#!/bin/bash

# Release script for creating new versions and tags

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "Current version: $CURRENT_VERSION"

# Ask for version bump type
echo
echo "Select version bump type:"
echo "1) Patch (bug fixes) - x.x.X"
echo "2) Minor (new features) - x.X.x"
echo "3) Major (breaking changes) - X.x.x"
echo "4) Custom version"
read -p "Enter choice (1-4): " VERSION_TYPE

case $VERSION_TYPE in
    1)
        BUMP_TYPE="patch"
        ;;
    2)
        BUMP_TYPE="minor"
        ;;
    3)
        BUMP_TYPE="major"
        ;;
    4)
        read -p "Enter custom version (e.g., 1.2.3): " CUSTOM_VERSION
        if ! [[ $CUSTOM_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            print_error "Invalid version format. Please use x.x.x format."
            exit 1
        fi
        NEW_VERSION=$CUSTOM_VERSION
        ;;
    *)
        print_error "Invalid choice."
        exit 1
        ;;
esac

# Calculate new version if not custom
if [ -z "$NEW_VERSION" ]; then
    NEW_VERSION=$(npm version $BUMP_TYPE --no-git-tag-version)
    NEW_VERSION=${NEW_VERSION#v}  # Remove 'v' prefix if present
fi

print_step "Bumping version to $NEW_VERSION..."

# Update package.json
npm version $NEW_VERSION --no-git-tag-version --allow-same-version

# Get release notes
echo
print_step "Enter release notes (press Ctrl+D when done):"
echo "Format: Use conventional commit style (feat:, fix:, etc.)"
echo
RELEASE_NOTES=$(cat)

# Create release commit
print_step "Creating release commit..."
git add package.json package-lock.json
git commit -m "chore(release): $NEW_VERSION

$RELEASE_NOTES"

# Create tag
TAG_NAME="v$NEW_VERSION"
print_step "Creating tag $TAG_NAME..."

# Create annotated tag with release notes
git tag -a "$TAG_NAME" -m "Release $NEW_VERSION

$RELEASE_NOTES"

# Push changes
echo
read -p "Push changes and tag to remote? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Pushing to remote..."
    git push origin main
    git push origin "$TAG_NAME"
    print_info "Release $NEW_VERSION created and pushed!"
    print_info "GitHub Actions will now generate the changelog and create the release."
else
    print_info "Changes committed locally but not pushed."
    print_info "To push later, run:"
    echo "  git push origin main"
    echo "  git push origin $TAG_NAME"
fi