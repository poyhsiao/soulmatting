import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import fs from 'fs';
import path from 'path';

/**
 * Global setup before all scenarios
 */
BeforeAll(async function () {
  console.log('🚀 Starting BDD test suite...');

  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';

  // Wait for services to be ready (if needed)
  await waitForServices();
});

/**
 * Global cleanup after all scenarios
 */
AfterAll(async function () {
  console.log('🏁 BDD test suite completed.');

  // Cleanup test data if needed
  await cleanupTestData();
});

/**
 * Setup before each scenario
 */
Before(async function (this: CustomWorld, scenario) {
  console.log(`📝 Starting scenario: ${scenario.pickle.name}`);

  // Reset test data
  this.testData = {};
  this.apiResponse = null;
  this.currentUser = null;

  // Tag-based setup
  const tags = scenario.pickle.tags.map(tag => tag.name);

  if (tags.includes('@ui')) {
    await this.initBrowser();
  }

  if (tags.includes('@auth')) {
    // Setup authentication context
    await setupAuthContext.call(this);
  }

  if (tags.includes('@database')) {
    // Setup database context
    await setupDatabaseContext.call(this);
  }
});

/**
 * Cleanup after each scenario
 */
After(async function (this: CustomWorld, scenario) {
  const scenarioName = scenario.pickle.name;
  const scenarioStatus = scenario.result?.status;

  console.log(`📋 Scenario "${scenarioName}" ${scenarioStatus}`);

  // Take screenshot on failure for UI tests
  if (scenarioStatus === Status.FAILED && this.page) {
    const screenshotPath = path.join(
      process.cwd(),
      'reports',
      'screenshots',
      `${scenarioName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`
    );

    // Ensure screenshots directory exists
    const screenshotsDir = path.dirname(screenshotPath);
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

    // Attach screenshot to report
    this.attach(fs.readFileSync(screenshotPath), 'image/png');
  }

  // Log API response on failure
  if (scenarioStatus === Status.FAILED && this.apiResponse) {
    console.log('🔍 API Response:', JSON.stringify(this.apiResponse, null, 2));
    this.attach(JSON.stringify(this.apiResponse, null, 2), 'application/json');
  }

  // Cleanup browser resources
  await this.cleanup();

  // Cleanup test data for this scenario
  await cleanupScenarioData.call(this);
});

/**
 * Wait for services to be ready
 */
async function waitForServices(): Promise<void> {
  const maxRetries = 30;
  const retryDelay = 1000;

  const services = [
    { name: 'Frontend', url: process.env.BASE_URL || 'http://localhost:3000' },
    { name: 'API', url: process.env.API_URL || 'http://localhost:3001' },
  ];

  for (const service of services) {
    let retries = 0;
    let isReady = false;

    while (retries < maxRetries && !isReady) {
      try {
        const response = await fetch(`${service.url}/health`, {
          method: 'GET',
          timeout: 5000,
        });

        if (response.ok) {
          console.log(`✅ ${service.name} service is ready`);
          isReady = true;
        }
      } catch (error) {
        retries++;
        if (retries < maxRetries) {
          console.log(
            `⏳ Waiting for ${service.name} service... (${retries}/${maxRetries})`
          );
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          console.warn(
            `⚠️ ${service.name} service not ready after ${maxRetries} retries`
          );
        }
      }
    }
  }
}

/**
 * Setup authentication context
 */
async function setupAuthContext(this: CustomWorld): Promise<void> {
  // Create a test user for authentication scenarios
  const testUser = this.generateTestUser();
  this.setTestData('testUser', testUser);

  // Register the test user via API
  try {
    await this.makeApiRequest('POST', '/api/auth/register', {
      email: testUser.email,
      password: testUser.password,
      name: testUser.name,
    });

    console.log(`👤 Test user created: ${testUser.email}`);
  } catch (error) {
    console.warn('⚠️ Failed to create test user:', error);
  }
}

/**
 * Setup database context
 */
async function setupDatabaseContext(this: CustomWorld): Promise<void> {
  // Setup database-specific test data
  console.log('🗄️ Setting up database context');

  // Add any database-specific setup here
  // For example, creating test data, setting up transactions, etc.
}

/**
 * Cleanup test data
 */
async function cleanupTestData(): Promise<void> {
  console.log('🧹 Cleaning up global test data...');

  // Add global cleanup logic here
  // For example, removing test users, clearing test databases, etc.
}

/**
 * Cleanup scenario-specific data
 */
async function cleanupScenarioData(this: CustomWorld): Promise<void> {
  // Cleanup test user if created
  const testUser = this.getTestData('testUser');
  if (testUser) {
    try {
      // Delete test user via API
      await this.makeApiRequest('DELETE', `/api/users/${testUser.id}`);
      console.log(`🗑️ Test user cleaned up: ${testUser.email}`);
    } catch (error) {
      console.warn('⚠️ Failed to cleanup test user:', error);
    }
  }

  // Add other scenario-specific cleanup logic here
}

// Error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
