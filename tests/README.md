# MixWise Test Suite

This directory contains automated tests for the MixWise application.

## Test Types

### E2E Tests (`tests/e2e/`)
End-to-end tests that verify complete user flows work correctly.

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Local Development
```bash
# Run all tests
npm run test:e2e

# Run with visual browser (for debugging)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/smoke.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
```

### Vercel Preview Deployment
```bash
# Set environment variables
export NEXT_PUBLIC_SITE_URL=https://your-preview-url.vercel.app

# Run tests against preview
npm run test:e2e
```

## Test Coverage

### Smoke Tests (`smoke.spec.ts`)
Critical user flows that must work:

1. **Landing page loads** - Hero section, navigation
2. **Cocktails page** - Directory loads with content
3. **Search functionality** - Query input, results display
4. **Recipe detail pages** - Individual cocktail pages load
5. **Mix tool** - Ingredient selection interface
6. **Auth dialogs** - Login/signup modals appear
7. **Navigation** - Links between pages work
8. **Error pages** - 404 handling

## Environment Variables

Tests require these environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://getmixwise.com  # or preview URL
```

## CI Integration

Tests run automatically on:
- Push to main branch
- Pull requests
- Vercel preview deployments

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: npm run test:e2e
  env:
    NEXT_PUBLIC_SITE_URL: ${{ github.event.deployment.payload.web_url || 'http://localhost:3000' }}
```

## Debugging Tests

### Visual Debugging
```bash
# Run with browser visible
npm run test:e2e:headed

# Run single test slowly
npx playwright test tests/e2e/smoke.spec.ts --headed --timeout=60000
```

### Screenshots on Failure
Playwright automatically captures screenshots and videos on test failures in `test-results/` directory.

### Network Debugging
```bash
# Show network requests
DEBUG=pw:api npx playwright test
```

## Adding New Tests

1. Create new test file in `tests/e2e/`
2. Follow naming convention: `*.spec.ts`
3. Use descriptive test names
4. Add to this README if new test categories are added

## Test Best Practices

- Use `data-testid` attributes for reliable element selection
- Avoid brittle CSS selectors
- Test user-visible behavior, not implementation details
- Keep tests fast and reliable
- Use page objects for complex interactions
