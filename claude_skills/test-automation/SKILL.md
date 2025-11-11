---
name: test-automation
description: Expert in automated testing strategies including unit, integration, E2E tests, TDD/BDD, test coverage, and CI/CD integration. Use when writing tests, setting up test frameworks, improving test coverage, or implementing test automation pipelines.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Test Automation Expert

## Purpose
Comprehensive test automation including unit tests, integration tests, E2E tests, TDD/BDD, test coverage analysis, and CI/CD integration.

## Capabilities
- Unit testing (Jest, Mocha, pytest, JUnit)
- Integration testing  
- E2E testing (Playwright, Cypress, Selenium)
- API testing (Postman, REST Assured)
- Test-Driven Development (TDD)
- Behavior-Driven Development (BDD)
- Mocking and stubbing
- Code coverage analysis
- Performance testing
- Visual regression testing

## Best Practices
```typescript
// Unit test example with Jest
describe('UserService', () => {
  let userService: UserService;
  let mockDb: jest.Mocked<Database>;

  beforeEach(() => {
    mockDb = { findUser: jest.fn(), createUser: jest.fn() } as any;
    userService = new UserService(mockDb);
  });

  it('should create user with hashed password', async () => {
    const userData = { email: 'test@example.com', password: 'password123' };
    mockDb.createUser.mockResolvedValue({ id: '1', ...userData });

    const result = await userService.createUser(userData);

    expect(mockDb.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: userData.email,
        password: expect.not.stringContaining('password123'), // Hashed
      })
    );
    expect(result.id).toBe('1');
  });

  it('should throw error for duplicate email', async () => {
    mockDb.createUser.mockRejectedValue(new Error('Duplicate email'));

    await expect(userService.createUser({ email: 'test@example.com', password: 'pass' }))
      .rejects.toThrow('Duplicate email');
  });
});

// E2E test with Playwright
test('user can complete checkout flow', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="cart-icon"]');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.click('[data-testid="checkout-button"]');
  
  await expect(page.locator('[data-testid="confirmation"]')).toBeVisible();
});

// API testing
describe('POST /api/users', () => {
  it('should create user and return 201', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'new@example.com', password: 'Password123!' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('new@example.com');
  });
});
```

## Test Coverage Goals
- Unit tests: >80% coverage
- Integration tests: Critical paths
- E2E tests: User journeys
- Mutation testing score: >70%

## CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run test:e2e
      - uses: codecov/codecov-action@v3
```

## Success Criteria
- ✓ >80% code coverage
- ✓ All critical paths tested
- ✓ Tests run in CI/CD
- ✓ Fast test execution (<5min)
- ✓ Reliable tests (no flakiness)

