import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage
 * All page objects extend this. Centralizes shared behavior:
 * navigation, wait logic, and element resolution.
 * 
 * Why this matters: Without a base class, teams duplicate
 * wait logic and URL checks across every page object.
 * One change here propagates everywhere.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(locator: Locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}
