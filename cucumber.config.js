module.exports = {
  // Feature files
  default: {
    features: ['/Users/kimhsiao/Templates/git/kimhsiao/soulmatting/tests/bdd/features/**/*.feature'],
    
    // Require modules first
    requireModule: ['ts-node/register'],
    
    // Step definitions and support files
    require: [
      'tests/bdd/step-definitions/step-definitions/**/*.js',
      'tests/bdd/step-definitions/support/**/*.js'
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
  
  // World parameters
  worldParameters: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:3001',
    timeout: parseInt(process.env.TEST_TIMEOUT) || 30000,
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