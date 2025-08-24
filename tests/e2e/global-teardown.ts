import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global teardown for Playwright tests
 * This runs once after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for E2E tests...');

  try {
    // Clean up any temporary files or test data
    const authFile = path.join(process.cwd(), 'tests/e2e/auth.json');
    if (fs.existsSync(authFile)) {
      fs.unlinkSync(authFile);
      console.log('🗑️  Cleaned up authentication state file');
    }

    // Clean up any test artifacts if needed
    // Example: Remove test uploads, reset test database, etc.

    // Log test results summary
    const testResultsDir = path.join(process.cwd(), 'test-results');
    if (fs.existsSync(testResultsDir)) {
      const files = fs.readdirSync(testResultsDir);
      console.log(`📊 Test artifacts generated: ${files.length} files`);
    }

  } catch (error) {
    console.error('❌ Global teardown encountered an error:', error);
    // Don't throw here as it might mask test failures
  }

  console.log('✅ Global teardown completed!');
}

export default globalTeardown;