# E2E Testing with Playwright

This directory contains End-to-End (E2E) tests for the Pokemon application using Playwright.

## Setup

Playwright is already installed and configured. The configuration can be found in `playwright.config.ts`.

## Running Tests

### Prerequisites
Make sure both backend and frontend servers are running:
```bash
# Terminal 1 - Backend
cd backend
./vendor/bin/sail up

# Terminal 2 - Frontend  
cd frontend
pnpm dev
```

### Test Commands

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests with UI mode (interactive)
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Run tests in debug mode
pnpm test:e2e:debug
```

## Test Structure

### Page Objects
- `pages/LoginPage.ts` - Login page interactions
- `pages/PokemonListPage.ts` - Pokemon list page interactions
- `pages/PokemonDetailModal.ts` - Pokemon detail modal interactions

### Test Files
- `auth.spec.ts` - Authentication flow tests
- `pokemon.spec.ts` - Pokemon feature tests

### Fixtures
- `fixtures/auth.ts` - Authentication fixtures for logged-in tests

## Test Coverage

### Authentication Tests
- Login page display and functionality
- Valid/invalid credential handling
- Loading states
- Logout functionality
- Session persistence
- Form validation
- Keyboard navigation

### Pokemon Feature Tests
- Pokemon list display
- Search functionality
- Empty state handling
- Pokemon detail modal
- Modal interactions (open/close)
- Virtualized grid performance
- Mobile responsiveness

## Test Data Attributes

The following test data attributes are used throughout the application:

### Login Page
- `data-testid="username-input"`
- `data-testid="password-input"`
- `data-testid="login-button"`
- `data-testid="error-message"`

### Pokemon List Page
- `data-testid="pokemon-header"`
- `data-testid="welcome-message"`
- `data-testid="logout-button"`
- `data-testid="search-input"`
- `data-testid="search-button"`
- `data-testid="clear-button"`
- `data-testid="pokemon-card"`
- `data-testid="pokemon-grid"`
- `data-testid="no-results"`
- `data-testid="error-message"`
- `data-testid="loading"`

### Pokemon Detail Modal
- `data-testid="pokemon-detail-modal"`
- `data-testid="modal-close-button"`
- `data-testid="pokemon-name"`
- `data-testid="pokemon-image"`
- `data-testid="pokemon-id"`
- `data-testid="pokemon-types"`
- `data-testid="pokemon-stats"`

## Browser Support

Tests run against:
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit/Safari (Desktop)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## CI/CD Integration

The Playwright configuration is ready for CI/CD:
- Tests retry 2 times on CI
- HTML reports are generated
- Screenshots and videos are captured on failure
- Traces are recorded for debugging

## Best Practices

1. **Page Object Model**: Use page objects for better maintainability
2. **Data Test IDs**: Use `data-testid` attributes for element selection
3. **Wait for Elements**: Always wait for elements to be visible before interacting
4. **Responsive Testing**: Test on multiple viewport sizes
5. **Error Handling**: Test both happy path and error scenarios
6. **Clean State**: Each test starts with a clean authentication state

## Debugging

1. Use `--headed` to see the browser during test execution
2. Use `--debug` to step through tests
3. Use `--ui` for interactive test mode
4. Check screenshots and videos in `test-results/` folder after failures
5. Use Playwright traces for detailed debugging information
