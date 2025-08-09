# Kinetic Audio Synthesizer

A hand-tracking based audio synthesizer that creates music through hand gestures using MediaPipe and Web Audio API.
DEMO at https://jhlee111.github.io/kinetic-audio-synthesizer/

## Features

- 🎵 Real-time hand gesture to audio synthesis
- 🎹 Multiple instrument plugins (Celeste, Indian Flute, Oasis, Starlight, Warm Lead)
- 🎨 Dynamic visual effects and particle systems
- 🎚️ Multiple scale mapping algorithms
- ⚙️ Customizable settings for audio and visuals
- 📱 Responsive design for various screen sizes

## Quick Start

**Prerequisites:** Node.js 20+

1. **Clone and install:**
   ```bash
   git clone https://github.com/jhlee111/kinetic-audio-synthesizer.git
   cd kinetic-audio-synthesizer
   npm install
   ```

2. **Development:**
   ```bash
   npm run dev
   ```

3. **Build and deploy:**
   ```bash
   npm run build
   npm run deploy
   ```

## Deployment

### Quick Deploy
```bash
# Deploy to GitHub Pages
npm run deploy

# Full deployment with validation
./scripts/deploy.sh
```

### Create Release
```bash
# Interactive release creation
./scripts/release.sh

# Or use npm scripts
npm run version:patch  # for bug fixes
npm run version:minor  # for new features
npm run version:major  # for breaking changes
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run setup:hooks` - Install git hooks

### Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for commit message conventions and release process.

## Live Demo

🌐 **[Try it live](https://jhlee111.github.io/kinetic-audio-synthesizer/)**

## Architecture

- **Frontend:** React + TypeScript + Vite
- **Audio:** Web Audio API + Tone.js
- **Hand Tracking:** MediaPipe Tasks Vision
- **Deployment:** GitHub Pages + GitHub Actions
