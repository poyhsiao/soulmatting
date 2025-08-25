/**
 * Cucumber Configuration for SoulMatting Platform
 *
 * This configuration follows Context7 standards for:
 * - Behavior-driven development (BDD) best practices
 * - Comprehensive scenario coverage
 * - Security-focused testing patterns
 * - Scalable test automation architecture
 *
 * @version 1.0.0
 * @created 2024-01-20
 * @updated 2024-01-20
 * @author Kim Hsiao
 */
module.exports = {
  // Feature files
  default: {
    features: [
      'tests/bdd/features/**/*.feature',
    ],

    // Require modules first
    requireModule: ['ts-node/register'],

    // Step definitions and support files
    require: [
      'tests/bdd/step-definitions/**/*.{js,ts}',
      'tests/bdd/support/**/*.{js,ts}',
    ],
  },

  // Format options
  format: [
    'progress-bar',
    'json:reports/cucumber-report.json',
    'html:reports/cucumber-report.html',
    'junit:reports/cucumber-report.xml',
  ],

  // Parallel execution
  parallel: 2,

  // Retry failed scenarios
  retry: 1,

  // Tags to run/exclude
  tags: process.env.CUCUMBER_TAGS || 'not @skip',

  // World parameters (Context7 compliance)
  worldParameters: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:3001',
    timeout: parseInt(process.env.TEST_TIMEOUT) || 30000,
    // Security testing parameters
    enableSecurityTests: process.env.ENABLE_SECURITY_TESTS !== 'false',
    // Performance testing parameters
    performanceThreshold: parseInt(process.env.PERFORMANCE_THRESHOLD) || 3000,
    // Accessibility testing parameters
    enableA11yTests: process.env.ENABLE_A11Y_TESTS !== 'false',
  },

  // Publish results
  publish: false,

  // Dry run (validate scenarios without executing)
  dryRun: false,

  // Fail fast
  failFast: false,

  // Strict mode
  strict: true,

  // Exit on first failure
  exit: true,
};
