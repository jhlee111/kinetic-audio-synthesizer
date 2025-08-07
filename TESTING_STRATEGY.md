# Pragmatic Testing Strategy for Kinetic Audio Synthesizer

## Overview
This testing strategy prioritizes high-value, maintainable tests that catch real bugs without creating test maintenance overhead. Given the nature of this audio/visual/WebRTC application, we focus on testable business logic rather than integration points that are hard to mock.

## Test Pyramid Strategy

### 🔥 **Priority 1: Pure Logic & Utilities (High ROI)**
These are your money-makers - easy to test, high bug-catching potential:

- **✅ Audio Processing Logic** (`audioUtils.test.ts`)
  - Hand gesture → gain calculation
  - Volume smoothening algorithms
  - Edge case handling (empty/invalid data)

- **✅ Scale Mappings** (`scaleMappings.test.ts`)  
  - Position → note mapping accuracy
  - Boundary conditions (edges of canvas)
  - Scale consistency across different modes

- **✅ Custom Hooks** (State management)
  - `useNoteRange` - Range validation & updates
  - `useBackgroundRotation` - Cycling logic
  - Hook stability & performance

### 🎯 **Priority 2: Component Logic (Medium ROI)**
Test component behavior, not DOM details:

```typescript
// Example: Test component state transitions
it('should transition from READY to PLAYING when hand detected', () => {
  // Mock hand tracking result
  // Assert status change
});
```

### ⚠️ **Priority 3: Integration Points (Low ROI, High Maintenance)**
Avoid or minimize these unless critical:

- **Audio Service** - Mock Tone.js, test initialization flow
- **Hand Tracking** - Mock MediaPipe, test error handling
- **Visual Effects** - Test mathematical correctness, not rendering

## What NOT to Test

❌ **Canvas Rendering Details** - Too brittle, changes frequently
❌ **WebRTC Media Streams** - Browser-dependent, hard to mock reliably  
❌ **Tone.js Audio Output** - External library, trust it works
❌ **MediaPipe Hand Detection** - External ML model, focus on your code
❌ **CSS/Styling** - Use visual regression tools instead
❌ **Background Image URLs** - Network dependent, not business logic

## Test Configuration

### Required Dependencies
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react-hooks": "^8.0.1",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode during development  
npm run test:watch

# Coverage report
npm run test:coverage

# Run only unit tests (fast)
npm run test:unit
```

## Test Patterns to Follow

### ✅ Good Test
```typescript
it('should calculate gain from hand closure distance', () => {
  const landmarks = createTestLandmarks({ closureFactor: 0.7 });
  const gain = processHandDataForGain(landmarks);
  
  expect(gain).toBeGreaterThan(0.6);
  expect(gain).toBeLessThan(0.8);
});
```

### ❌ Bad Test  
```typescript
it('should render canvas with correct styles', () => {
  render(<HandSynthesizer />);
  const canvas = screen.getByRole('img');
  expect(canvas).toHaveStyle({ position: 'absolute' }); // Brittle!
});
```

## Debugging Failed Tests

1. **Async Issues** - Use `waitFor()` for state updates
2. **Mock Problems** - Check setup.ts for proper mocks
3. **Canvas Context** - Ensure mock canvas context is complete
4. **Hook Dependencies** - Verify useCallback/useMemo dependencies

## Continuous Integration

Tests should:
- ✅ Run in < 30 seconds
- ✅ Be deterministic (no flaky tests)
- ✅ Fail fast on real bugs
- ✅ Pass consistently in CI

## Metrics to Track

- **Line Coverage**: Aim for 80%+ on utilities/hooks
- **Branch Coverage**: Focus on error paths & edge cases  
- **Mutation Testing**: Occasionally verify test quality
- **Test Speed**: Keep under 30s total runtime

## When to Add More Tests

1. **Bug Reports** - Add regression tests for real bugs
2. **Complex Logic** - When you can't reason about correctness easily
3. **Refactoring** - Before major changes to ensure behavior preservation
4. **Performance** - Add benchmark tests for critical audio/visual code

Remember: **Code coverage is not the goal** - catching bugs and enabling confident refactoring is the goal.