import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from '@playwright/test';

/**
 * Custom World class for BDD tests
 * Manages browser instances, API clients, and test data
 */
export class CustomWorld extends World {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;
  public baseUrl: string;
  public apiUrl: string;
  public timeout: number;
  public testData: Record<string, any> = {};
  public apiResponse: any;
  public currentUser: any;
  public projectRoot: string = '';
  public projectStructure: any;
  public dockerConfig: any;
  public servicesStarted: boolean = false;
  public workflows: any[] = [];
  public envSetup: boolean = false;
  public envFiles: any;
  public dockerAvailable: boolean = false;
  public nodeEnvironmentReady: boolean = false;
  public startupError: string = '';

  constructor(options: IWorldOptions) {
    super(options);

    // Get configuration from world parameters
    this.baseUrl = options.parameters.baseUrl || 'http://localhost:3000';
    this.apiUrl = options.parameters.apiUrl || 'http://localhost:3001';
    this.timeout = options.parameters.timeout || 30000;
  }

  /**
   * Initialize browser and page for UI tests
   */
  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: process.env.HEADLESS !== 'false',
        slowMo: parseInt(process.env.SLOW_MO || '0'),
      });
    }

    if (!this.context) {
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
      });
    }

    if (!this.page) {
      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(this.timeout);
    }
  }

  /**
   * Navigate to a specific path
   */
  async navigateTo(path: string): Promise<void> {
    await this.initBrowser();
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  /**
   * Make API request
   */
  async makeApiRequest(
    method: string,
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.apiUrl}${endpoint}`;

    const options: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json().catch(() => null);

    this.apiResponse = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
    };

    return this.apiResponse;
  }

  /**
   * Store test data
   */
  setTestData(key: string, value: any): void {
    this.testData[key] = value;
  }

  /**
   * Get test data
   */
  getTestData(key: string): any {
    return this.testData[key];
  }

  /**
   * Generate random test data
   */
  generateTestEmail(): string {
    const timestamp = Date.now();
    return `test-${timestamp}@example.com`;
  }

  generateTestPassword(): string {
    return 'TestPassword123!';
  }

  generateTestUser(): any {
    return {
      email: this.generateTestEmail(),
      password: this.generateTestPassword(),
      name: `Test User ${Date.now()}`,
      age: Math.floor(Math.random() * 30) + 20,
      bio: 'This is a test user bio',
      location: 'Test City',
      interests: ['testing', 'automation', 'bdd'],
    };
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, {
      timeout: timeout || this.timeout,
      state: 'visible',
    });
  }

  /**
   * Fill form field
   */
  async fillField(selector: string, value: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.fill(selector, value);
  }

  /**
   * Click element
   */
  async clickElement(selector: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.click(selector);
  }

  /**
   * Assert element is visible
   */
  async assertElementVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * Assert element contains text
   */
  async assertElementContainsText(
    selector: string,
    text: string
  ): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  /**
   * Assert API response status
   */
  assertApiResponseStatus(expectedStatus: number): void {
    expect(this.apiResponse.status).toBe(expectedStatus);
  }

  /**
   * Assert API response contains data
   */
  assertApiResponseContains(key: string, value: any): void {
    expect(this.apiResponse.data).toHaveProperty(key, value);
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Set the custom world constructor
setWorldConstructor(CustomWorld);
