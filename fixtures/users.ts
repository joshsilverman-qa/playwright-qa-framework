/**
 * fixtures/users.ts
 * 
 * Centralizes test user data. Never hardcode credentials
 * in test files. This makes rotation easy and keeps
 * sensitive data out of test logic.
 * 
 * In a real environment these pull from environment
 * variables or a secrets manager, not this file.
 */

export const testUsers = {
  validUser: {
    email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
  },
  adminUser: {
    email: process.env.ADMIN_USER_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_USER_PASSWORD || 'AdminPassword123!',
  },
  invalidUser: {
    email: 'notauser@example.com',
    password: 'WrongPassword999!',
  },
  lockedUser: {
    email: 'locked@example.com',
    password: 'LockedPassword123!',
  },
};

export const testData = {
  emptyEmail: '',
  emptyPassword: '',
  invalidEmailFormat: 'notanemail',
  longString: 'a'.repeat(256),
};
