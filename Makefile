.PHONY: help install dev build deploy release clean setup test

# Default target
help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development server"
	@echo "  make build      - Build for production"
	@echo "  make deploy     - Deploy to GitHub Pages"
	@echo "  make release    - Create a new release"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make setup      - Setup git hooks"
	@echo "  make test       - Run tests"
	@echo "  make check      - Run all checks before deploy"

# Install dependencies
install:
	npm ci

# Development
dev:
	npm run dev

# Build
build:
	npm run build

# Deploy to GitHub Pages
deploy:
	@echo "Starting deployment..."
	@./scripts/deploy.sh

# Quick deploy (GitHub Pages only)
deploy-quick:
	npm run deploy

# Create release
release:
	@./scripts/release.sh

# Clean
clean:
	rm -rf dist node_modules
	@echo "Cleaned dist/ and node_modules/"

# Full clean and reinstall
reset:
	make clean
	make install
	@echo "Project reset complete"

# Setup git hooks
setup:
	chmod +x scripts/*.sh
	./scripts/setup-hooks.sh
	@echo "Setup complete"

# Run tests
test:
	@if [ -f "jest.config.js" ]; then \
		npm test; \
	else \
		echo "No test configuration found"; \
	fi

# Check everything before deployment
check: build test
	@echo "All checks passed!"

# Version management
patch:
	npm version patch

minor:
	npm version minor

major:
	npm version major

# Show current version
version:
	@echo "Current version: $$(node -p 'require("./package.json").version')"

# Build and preview
preview: build
	npm run preview

# Full deployment with checks
deploy-safe: check deploy
	@echo "Safe deployment complete!"

# Check build size
size: build
	@echo "Build size:"
	@du -sh dist/