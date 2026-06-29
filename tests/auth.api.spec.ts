import { test, expect, request } from '@playwright/test';
import { ApiClient } from '../utils/ApiClient';
import { testUsers, testData } from '../fixtures/users';

/**
 * Auth API Test Suite
 * 
 * Tests the authentication API layer directly — no browser, no UI.
 * This is faster, more stable, and catches contract-level issues
 * that UI tests miss entirely.
 * 
 * Why both UI and API tests? UI tests verify the user experience.
 * API tests verify the contract. A broken API will eventually break
 * the UI — catching it here is cheaper and faster.
 * 
 * Structure mirrors the UI login suite intentionally:
 * happy path, negative cases, security, session management.
 */

const BASE_URL = process.env.BASE_URL || 'https://your-app.com';

test.describe('Auth API — Happy Path', () => {

  test('POST /api/auth/login returns 200 with valid credentials', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    const response = await client.post('/api/auth/login', {
      email: testUsers.validUser.email,
      password: testUsers.validUser.password,
    });

    expect(response.status()).toBe(200);
  });

  test('POST /api/auth/login returns a token in the response body', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    const response = await client.post('/api/auth/login', {
      email: testUsers.validUser.email,
      password: testUsers.validUser.password,
    });

    const body = await response.json();

    // Token should exist and be a non-empty string
    const token = body.token || body.access_token;
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('Authenticated GET /api/user/me returns current user profile', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    // Step 1: Login and get token
    const loginResponse = await client.post('/api/auth/login', {
      email: testUsers.validUser.email,
      password: testUsers.validUser.password,
    });
    const { token } = await loginResponse.json();
    client.setToken(token);

    // Step 2: Use token to fetch profile
    const profileResponse = await client.get('/api/user/me');
    expect(profileResponse.status()).toBe(200);

    const profile = await profileResponse.json();
    expect(profile.email).toBe(testUsers.validUser.email);
  });

  test('POST /api/auth/logout invalidates the session', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    // Login
    const loginResponse = await client.post('/api/auth/login', {
      email: testUsers.validUser.email,
      password: testUsers.validUser.password,
    });
    const { token } = await loginResponse.json();
    client.setToken(token);

    // Logout
    const logoutResponse = await client.post('/api/auth/logout', {});
    expect(logoutResponse.status()).toBe(200);

    // Token should no longer work
    const profileResponse = await client.get('/api/user/me');
    expect(profileResponse.status()).toBe(401);
  });

});

test.describe('Auth API — Negative Cases', () => {

  test('POST /api/auth/login returns 401 with wrong password', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    const response = await client.post('/api/auth/login', {
      email: testUsers.validUser.email,
      password: 'WrongPassword999!',
    });

    expect(response.status()).toBe(401);
  });

  test('POST /api/auth/login returns 401 with unknown email', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    const response = await client.post('/api/auth/login', {
      email: testUsers.invalidUser.email,
      password: testUsers.invalidUser.password,
    });

    expect(response.status()).toBe(401);
  });

  test('POST /api/auth/login returns 400 with missing email field', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    const response = await client.post('/api/auth/login', {
      password: testUsers.validUser.password,
    });

    expect(response.status()).toBe(400);
  });

  test('POST /api/auth/login returns 400 with missing password field', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    const response = await client.post('/api/auth/login', {
      email: testUsers.validUser.email,
    });

    expect(response.status()).toBe(400);
  });

  test('POST /api/auth/login returns 400 with malformed email', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    const response = await client.post('/api/auth/login', {
      email: testData.invalidEmailFormat,
      password: testUsers.validUser.password,
    });

    expect(response.status()).toBe(400);
  });

  test('POST /api/auth/login returns 400 with empty body', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    const response = await client.post('/api/auth/login', {});

    expect(response.status()).toBe(400);
  });

});

test.describe('Auth API — Security', () => {

  test('GET /api/user/me returns 401 without token', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);
    // No token set — unauthenticated request
    const response = await client.get('/api/user/me');
    expect(response.status()).toBe(401);
  });

  test('GET /api/user/me returns 401 with expired or invalid token', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);
    client.setToken('invalid.token.string');

    const response = await client.get('/api/user/me');
    expect(response.status()).toBe(401);
  });

  test('Response does not expose password in body', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    const response = await client.post('/api/auth/login', {
      email: testUsers.validUser.email,
      password: testUsers.validUser.password,
    });

    const body = await response.json();
    const bodyString = JSON.stringify(body);

    // Password should never appear in any API response
    expect(bodyString).not.toContain(testUsers.validUser.password);
  });

  test('Content-Type header is application/json on login response', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    const response = await client.post('/api/auth/login', {
      email: testUsers.validUser.email,
      password: testUsers.validUser.password,
    });

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

});

test.describe('Auth API — Response Schema', () => {

  test('Login response body contains expected fields', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    const response = await client.post('/api/auth/login', {
      email: testUsers.validUser.email,
      password: testUsers.validUser.password,
    });

    const body = await response.json();

    // Validate the contract — these fields must always be present
    const token = body.token || body.access_token;
    expect(token).toBeDefined();
    expect(body.user || body.email).toBeDefined();
  });

  test('Error response body contains a message field', async ({ request }) => {
    const client = new ApiClient(request, BASE_URL);

    const response = await client.post('/api/auth/login', {
      email: testUsers.invalidUser.email,
      password: testUsers.invalidUser.password,
    });

    const body = await response.json();

    // Error responses should always include a human-readable message
    expect(body.message || body.error).toBeDefined();
  });

});
