import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Global setup for Playwright tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...');

  // Ensure test results directory exists
  const testResultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  // Create a browser instance for authentication setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the application to be ready
    const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';
    console.log(`⏳ Waiting for application at ${baseURL} to be ready...`);

    await page.goto(baseURL, { waitUntil: 'networkidle' });
    console.log('✅ Application is ready!');

    // Setup test user authentication if needed
    // This is where you would login with a test user and save the auth state
    // Example:
    // await page.goto(`${baseURL}/login`);
    // await page.fill('[data-testid="email"]', 'test@example.com');
    // await page.fill('[data-testid="password"]', 'testpassword');
    // await page.click('[data-testid="login-button"]');
    // await page.waitForURL('**/dashboard');
    // await context.storageState({ path: 'tests/e2e/auth.json' });
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('✅ Global setup completed successfully!');
}

export default globalSetup;
