// Setup environment variables for tests
process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://user:password@localhost:5432/jewellery_test?schema=public";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  "test-jwt-secret-key-minimum-32-characters-long-for-testing-only";
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "test-admin-password";
process.env.TEST_USER_PASSWORD =
  process.env.TEST_USER_PASSWORD || "test-user-password";

