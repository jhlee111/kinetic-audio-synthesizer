#!/bin/bash

# Script to set up git hooks

set -e

echo "Setting up git hooks..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

# Pre-push hook to validate before pushing

set -e

echo "Running pre-push validation..."

# 1. Check for console.log statements
echo "Checking for console.log statements..."
CONSOLE_LOGS=$(grep -r "console\.log" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ 2>/dev/null | grep -v "^//" | wc -l)
if [ "$CONSOLE_LOGS" -gt "0" ]; then
    echo "Warning: Found $CONSOLE_LOGS console.log statements in source files"
    echo "Consider removing debug statements before pushing"
fi

# 2. Run build to ensure it compiles
echo "Running build check..."
npm run build > /dev/null 2>&1 || {
    echo "Error: Build failed. Please fix build errors before pushing."
    exit 1
}

# 3. Check for large files
echo "Checking for large files..."
LARGE_FILES=$(find . -type f -size +1M -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./dist/*" 2>/dev/null)
if [ ! -z "$LARGE_FILES" ]; then
    echo "Warning: Found large files (>1MB):"
    echo "$LARGE_FILES"
    read -p "Continue pushing? (y/n) " -n 1 -r < /dev/tty
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 4. Validate commit messages for conventional commits
echo "Validating recent commit messages..."
COMMITS=$(git log origin/main..HEAD --format=%s 2>/dev/null)
if [ ! -z "$COMMITS" ]; then
    while IFS= read -r commit; do
        if ! echo "$commit" | grep -qE "^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .+"; then
            echo "Warning: Commit doesn't follow conventional format: $commit"
            echo "Expected format: type(scope): description"
        fi
    done <<< "$COMMITS"
fi

echo "Pre-push validation completed successfully!"
EOF

# Make hooks executable
chmod +x .git/hooks/pre-push

echo "Git hooks installed successfully!"
echo "The pre-push hook will now run before each push to validate your code."