import { APIRequestContext } from '@playwright/test';

/**
 * ApiClient
 * 
 * Reusable HTTP client wrapping Playwright's API request context.
 * Centralizes headers, base URL, and response handling so test
 * files stay clean and don't repeat request boilerplate.
 * 
 * Why this matters: API tests that duplicate request logic become
 * unmaintainable fast. One client, one place to update.
 */
export class ApiClient {
  private request: APIRequestContext;
  private baseURL: string;
  private token: string | null = null;

  constructor(request: APIRequestContext, baseURL: string) {
    this.request = request;
    this.baseURL = baseURL;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async post(path: string, body: Record<string, unknown>) {
    return this.request.post(`${this.baseURL}${path}`, {
      data: body,
      headers: this.getHeaders(),
    });
  }

  async get(path: string) {
    return this.request.get(`${this.baseURL}${path}`, {
      headers: this.getHeaders(),
    });
  }

  async delete(path: string) {
    return this.request.delete(`${this.baseURL}${path}`, {
      headers: this.getHeaders(),
    });
  }
}
