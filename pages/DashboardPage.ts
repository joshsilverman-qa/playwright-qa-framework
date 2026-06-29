import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * DashboardPage
 * Represents the authenticated landing page.
 * Used to verify successful login and check
 * core dashboard elements are present post-auth.
 */
export class DashboardPage extends BasePage {
  readonly welcomeHeading: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly navigationMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeHeading = page.getByRole('heading', { level: 1 });
    this.userMenu = page.getByRole('button', { name: /account|profile|user/i });
    this.logoutButton = page.getByRole('button', { name: /log out|sign out/i });
    this.navigationMenu = page.getByRole('navigation');
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.welcomeHeading, 5000);
      return true;
    } catch {
      return false;
    }
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
