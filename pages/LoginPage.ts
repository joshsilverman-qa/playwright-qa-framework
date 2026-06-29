import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage
 * Encapsulates all login UI interactions.
 * 
 * Page Object Model keeps selectors in one place.
 * When the UI changes, you update here — not across 20 test files.
 * This is the single biggest maintenance win in any automation framework.
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    // Locators use accessible roles where possible — more resilient than CSS selectors
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.getByRole('textbox', { name: /password/i });
    this.submitButton = page.getByRole('button', { name: /sign in|log in/i });
    this.errorMessage = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: /remember me/i });
  }

  async goto() {
    await this.navigate('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return this.errorMessage.innerText();
  }

  async isErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }
}
