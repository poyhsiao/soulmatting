/**
 * Artillery Load Test Processors
 * 
 * This file contains custom functions used by Artillery load tests
 * to generate dynamic data, handle authentication, and process responses.
 * 
 * @version 1.0.0
 * @created 2024-01-20
 * @updated 2024-01-20
 * @author Kim Hsiao
 */

const crypto = require('crypto');
const faker = require('@faker-js/faker');

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the string to generate
 * @returns {string} Random string
 */
function generateRandomString(length = 10) {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
}

/**
 * Generate a random email address
 * @returns {string} Random email address
 */
function generateRandomEmail() {
  const username = generateRandomString(8);
  const domains = ['test.com', 'example.com', 'loadtest.com', 'artillery.io'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${username}@${domain}`;
}

/**
 * Generate a random user profile data
 * @returns {object} User profile data
 */
function generateUserProfile() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int({ min: 18, max: 65 }),
    bio: faker.lorem.paragraph(),
    interests: faker.helpers.arrayElements([
      'music', 'travel', 'photography', 'cooking', 'reading',
      'sports', 'movies', 'art', 'technology', 'fitness',
      'nature', 'gaming', 'dancing', 'writing', 'yoga'
    ], { min: 3, max: 7 }),
    location: {
      city: faker.location.city(),
      country: faker.location.country(),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude()
    },
    education: faker.helpers.arrayElement([
      'High School', 'Bachelor\'s Degree', 'Master\'s Degree',
      'PhD', 'Trade School', 'Some College'
    ]),
    occupation: faker.person.jobTitle(),
    height: faker.number.int({ min: 150, max: 200 }),
    smoking: faker.helpers.arrayElement(['never', 'sometimes', 'regularly']),
    drinking: faker.helpers.arrayElement(['never', 'socially', 'regularly']),
    religion: faker.helpers.arrayElement([
      'none', 'christian', 'muslim', 'jewish', 'hindu', 'buddhist', 'other'
    ])
  };
}

/**
 * Generate authentication token for testing
 * This function simulates getting an auth token for load testing
 * @param {object} context - Artillery context
 * @param {object} events - Artillery events
 * @param {function} done - Callback function
 */
function generateAuthToken(context, events, done) {
  // Generate test user data
  const testUser = {
    id: crypto.randomUUID(),
    email: generateRandomEmail(),
    ...generateUserProfile()
  };
  
  // Store in context for use in subsequent requests
  context.vars.userId = testUser.id;
  context.vars.email = testUser.email;
  context.vars.firstName = testUser.firstName;
  context.vars.lastName = testUser.lastName;
  
  // Generate a mock JWT token for testing
  // In real scenarios, this would come from the auth endpoint
  const mockToken = Buffer.from(JSON.stringify({
    sub: testUser.id,
    email: testUser.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  })).toString('base64');
  
  context.vars.accessToken = `mock.${mockToken}.signature`;
  
  return done();
}

/**
 * Process authentication response
 * @param {object} requestParams - Request parameters
 * @param {object} response - HTTP response
 * @param {object} context - Artillery context
 * @param {object} events - Artillery events
 * @param {function} done - Callback function
 */
function processAuthResponse(requestParams, response, context, events, done) {
  if (response.statusCode === 200 || response.statusCode === 201) {
    try {
      const body = JSON.parse(response.body);
      
      // Store tokens and user info
      if (body.accessToken) {
        context.vars.accessToken = body.accessToken;
      }
      if (body.refreshToken) {
        context.vars.refreshToken = body.refreshToken;
      }
      if (body.user && body.user.id) {
        context.vars.userId = body.user.id;
      }
      
      // Emit custom metric for successful auth
      events.emit('counter', 'auth.success', 1);
    } catch (error) {
      console.error('Error processing auth response:', error);
      events.emit('counter', 'auth.parse_error', 1);
    }
  } else {
    events.emit('counter', 'auth.failure', 1);
  }
  
  return done();
}

/**
 * Process matching response and extract match data
 * @param {object} requestParams - Request parameters
 * @param {object} response - HTTP response
 * @param {object} context - Artillery context
 * @param {object} events - Artillery events
 * @param {function} done - Callback function
 */
function processMatchResponse(requestParams, response, context, events, done) {
  if (response.statusCode === 200) {
    try {
      const body = JSON.parse(response.body);
      
      if (body.matches && Array.isArray(body.matches)) {
        // Store match count metric
        events.emit('histogram', 'matches.count', body.matches.length);
        
        // Store first match ID for subsequent interactions
        if (body.matches.length > 0) {
          context.vars.firstMatchId = body.matches[0].id;
        }
        
        // Emit success metric
        events.emit('counter', 'matches.discovery.success', 1);
      }
    } catch (error) {
      console.error('Error processing match response:', error);
      events.emit('counter', 'matches.parse_error', 1);
    }
  } else {
    events.emit('counter', 'matches.discovery.failure', 1);
  }
  
  return done();
}

/**
 * Process conversation response
 * @param {object} requestParams - Request parameters
 * @param {object} response - HTTP response
 * @param {object} context - Artillery context
 * @param {object} events - Artillery events
 * @param {function} done - Callback function
 */
function processConversationResponse(requestParams, response, context, events, done) {
  if (response.statusCode === 200 || response.statusCode === 201) {
    try {
      const body = JSON.parse(response.body);
      
      if (body.id) {
        context.vars.conversationId = body.id;
        events.emit('counter', 'conversations.created', 1);
      }
      
      if (body.messages && Array.isArray(body.messages)) {
        events.emit('histogram', 'messages.count', body.messages.length);
      }
    } catch (error) {
      console.error('Error processing conversation response:', error);
      events.emit('counter', 'conversations.parse_error', 1);
    }
  }
  
  return done();
}

/**
 * Generate random message content
 * @param {object} context - Artillery context
 * @param {object} events - Artillery events
 * @param {function} done - Callback function
 */
function generateMessageContent(context, events, done) {
  const messageTypes = [
    'Hey there! How\'s your day going?',
    'I noticed we have similar interests in music!',
    'Your photos are amazing! Where was that taken?',
    'Would you like to grab coffee sometime?',
    'I love your taste in books! Any recommendations?',
    'That\'s such an interesting hobby you have!',
    'I\'d love to hear more about your travels.',
    'You seem like a really genuine person.',
    'What\'s your favorite place in the city?',
    'I think we\'d get along really well!'
  ];
  
  const randomMessage = messageTypes[Math.floor(Math.random() * messageTypes.length)];
  context.vars.messageContent = randomMessage;
  
  return done();
}

/**
 * Validate response time and emit custom metrics
 * @param {object} requestParams - Request parameters
 * @param {object} response - HTTP response
 * @param {object} context - Artillery context
 * @param {object} events - Artillery events
 * @param {function} done - Callback function
 */
function validateResponseTime(requestParams, response, context, events, done) {
  const responseTime = response.timings.response;
  
  // Emit response time metrics
  events.emit('histogram', 'response_time.all', responseTime);
  
  // Categorize response times
  if (responseTime < 100) {
    events.emit('counter', 'response_time.fast', 1);
  } else if (responseTime < 500) {
    events.emit('counter', 'response_time.acceptable', 1);
  } else if (responseTime < 1000) {
    events.emit('counter', 'response_time.slow', 1);
  } else {
    events.emit('counter', 'response_time.very_slow', 1);
  }
  
  // Check for performance thresholds
  if (responseTime > 2000) {
    events.emit('counter', 'performance.threshold_exceeded', 1);
  }
  
  return done();
}

/**
 * Log request details for debugging
 * @param {object} requestParams - Request parameters
 * @param {object} response - HTTP response
 * @param {object} context - Artillery context
 * @param {object} events - Artillery events
 * @param {function} done - Callback function
 */
function logRequestDetails(requestParams, response, context, events, done) {
  if (process.env.ARTILLERY_DEBUG === 'true') {
    console.log(`Request: ${requestParams.method} ${requestParams.url}`);
    console.log(`Response: ${response.statusCode} (${response.timings.response}ms)`);
    
    if (response.statusCode >= 400) {
      console.log(`Error Response Body: ${response.body}`);
    }
  }
  
  return done();
}

/**
 * Setup function called before each scenario
 * @param {object} context - Artillery context
 * @param {object} events - Artillery events
 * @param {function} done - Callback function
 */
function setupScenario(context, events, done) {
  // Initialize scenario-specific variables
  context.vars.scenarioStartTime = Date.now();
  context.vars.requestCount = 0;
  
  // Generate unique scenario ID
  context.vars.scenarioId = crypto.randomUUID();
  
  return done();
}

/**
 * Cleanup function called after each scenario
 * @param {object} context - Artillery context
 * @param {object} events - Artillery events
 * @param {function} done - Callback function
 */
function cleanupScenario(context, events, done) {
  const scenarioDuration = Date.now() - context.vars.scenarioStartTime;
  
  // Emit scenario completion metrics
  events.emit('histogram', 'scenario.duration', scenarioDuration);
  events.emit('histogram', 'scenario.requests', context.vars.requestCount);
  
  return done();
}

module.exports = {
  generateAuthToken,
  processAuthResponse,
  processMatchResponse,
  processConversationResponse,
  generateMessageContent,
  validateResponseTime,
  logRequestDetails,
  setupScenario,
  cleanupScenario,
  generateRandomString,
  generateRandomEmail,
  generateUserProfile
};