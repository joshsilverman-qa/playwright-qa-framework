import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { testUsers, testData } from '../fixtures/users';

/**
 * Login Regression Suite
 * 
 * Covers the critical auth path end-to-end.
 * This is the first suite I build on any new platform —
 * if login is broken, nothing else matters.
 * 
 * Test structure follows Arrange / Act / Assert throughout.
 * Each test is independent — no shared state between tests.
 */

test.describe('Login - Happy Path', () => {

  test('Valid user can log in and reach dashboard', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Act
    await loginPage.goto();
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);

    // Assert
    expect(await dashboardPage.isLoaded()).toBe(true);
    expect(dashboardPage.getCurrentUrl()).not.toContain('/login');
  });

  test('Session persists on page refresh after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
    await page.reload();

    expect(await dashboardPage.isLoaded()).toBe(true);
  });

  test('User can log out successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
    await dashboardPage.logout();

    await expect(page).toHaveURL(/login/);
  });

});

test.describe('Login - Negative Cases', () => {

  test('Invalid credentials show error message', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(testUsers.invalidUser.email, testUsers.invalidUser.password);

    expect(await loginPage.isErrorVisible()).toBe(true);
    const errorText = await loginPage.getErrorMessage();
    expect(errorText.toLowerCase()).toMatch(/invalid|incorrect|failed/);
  });

  test('Empty email field blocks submission', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(testData.emptyEmail, testUsers.validUser.password);

    // Should stay on login page — never reach dashboard
    await expect(page).toHaveURL(/login/);
  });

  test('Empty password field blocks submission', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(testUsers.validUser.email, testData.emptyPassword);

    await expect(page).toHaveURL(/login/);
  });

  test('Malformed email format is rejected', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(testData.invalidEmailFormat, testUsers.validUser.password);

    await expect(page).toHaveURL(/login/);
  });

});

test.describe('Login - Security', () => {

  test('Password field masks input', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    const inputType = await loginPage.passwordInput.getAttribute('type');
    expect(inputType).toBe('password');
  });

  test('Login page is accessible via HTTPS', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    expect(page.url()).toMatch(/^https/);
  });

  test('Unauthenticated user is redirected to login from protected route', async ({ page }) => {
    // Attempt direct navigation to a protected page
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

});
