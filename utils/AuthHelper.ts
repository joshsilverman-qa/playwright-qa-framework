import { APIRequestContext, request } from '@playwright/test';

/**
 * AuthHelper
 * 
 * Handles API-level authentication for tests that don't
 * need to test the login UI itself.
 * 
 * Why this matters: Running UI login for every test is slow
 * and fragile. For tests where auth is a precondition (not
 * the thing being tested), we bypass the UI and auth via API.
 * This is a core shift-left principle — test the right layer.
 */
export class AuthHelper {
  private apiContext: APIRequestContext;
  private baseURL: string;

  constructor(apiContext: APIRequestContext, baseURL: string) {
    this.apiContext = apiContext;
    this.baseURL = baseURL;
  }

  /**
   * Authenticates via API and returns session token.
   * Use this to seed auth state for non-login tests.
   */
  async getAuthToken(email: string, password: string): Promise<string> {
    const response = await this.apiContext.post(`${this.baseURL}/api/auth/login`, {
      data: { email, password },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok()) {
      throw new Error(`Auth failed: ${response.status()} ${response.statusText()}`);
    }

    const body = await response.json();
    return body.token || body.access_token;
  }

  /**
   * Seeds browser storage with auth token so tests
   * start already authenticated — no UI login required.
   */
  static async seedAuthState(page: any, token: string) {
    await page.addInitScript((t: string) => {
      window.localStorage.setItem('auth_token', t);
    }, token);
  }
}
