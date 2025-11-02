# Testing Guide

This directory contains all tests for the Jewellery E-commerce application.

## Test Structure

```
__tests__/
├── api/              # API route tests
│   ├── auth/         # Authentication tests
│   ├── products/     # Product API tests
│   └── orders/       # Order API tests
├── components/       # React component tests
├── lib/             # Utility and library tests
└── helpers/          # Test helpers and mocks
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Files

### API Tests
- `api/auth/login.test.ts` - Login endpoint tests
- `api/auth/register.test.ts` - Registration endpoint tests
- `api/products/route.test.ts` - Product CRUD tests
- `api/orders/route.test.ts` - Order creation and retrieval tests

### Component Tests
- `components/ProductCard.test.tsx` - Product card component tests
- `components/Header.test.tsx` - Header component tests

### Utility Tests
- `lib/auth.test.ts` - Authentication utility tests
- `lib/utils.test.ts` - Utility function tests

## Writing New Tests

1. Create test files following the naming convention: `*.test.ts` or `*.test.tsx`
2. Use the test helpers from `helpers/` directory
3. Mock external dependencies (Prisma, Next.js, etc.)
4. Follow AAA pattern: Arrange, Act, Assert

## Mock Data

Use mock data from `helpers/test-helpers.tsx`:
- `mockUser` - Standard user object
- `mockAdminUser` - Admin user object
- `mockProduct` - Product object
- `mockCartItem` - Cart item object

## Best Practices

1. **Isolation**: Each test should be independent
2. **Mocking**: Mock external dependencies (database, APIs, etc.)
3. **Cleanup**: Clear mocks between tests
4. **Coverage**: Aim for high test coverage (>80%)
5. **Descriptive**: Use clear test descriptions
