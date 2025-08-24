/**
 * Artillery processor functions for performance testing
 * Author: Kim Hsiao
 * Created: 2025-01-14
 * Version: 1.0.0
 */

const { faker } = require('@faker-js/faker');

/**
 * Generate a random string for testing
 * @param {Object} context - Artillery context
 * @param {Object} events - Artillery events
 * @param {Function} done - Callback function
 */
function generateRandomString(context, events, done) {
  context.vars.randomString = faker.string.alphanumeric(8);
  return done();
}

/**
 * Generate test user data
 * @param {Object} context - Artillery context
 * @param {Object} events - Artillery events
 * @param {Function} done - Callback function
 */
function generateTestUser(context, events, done) {
  context.vars.testUser = {
    email: faker.internet.email(),
    password: 'TestPassword123!',
    name: faker.person.fullName(),
    username: faker.internet.userName()
  };
  return done();
}

/**
 * Log response for debugging
 * @param {Object} requestParams - Request parameters
 * @param {Object} response - Response object
 * @param {Object} context - Artillery context
 * @param {Object} events - Artillery events
 * @param {Function} done - Callback function
 */
function logResponse(requestParams, response, context, events, done) {
  if (process.env.DEBUG_ARTILLERY) {
    console.log(`Response status: ${response.statusCode}`);
    console.log(`Response body: ${JSON.stringify(response.body)}`);
  }
  return done();
}

/**
 * Set authentication token from response
 * @param {Object} requestParams - Request parameters
 * @param {Object} response - Response object
 * @param {Object} context - Artillery context
 * @param {Object} events - Artillery events
 * @param {Function} done - Callback function
 */
function setAuthToken(requestParams, response, context, events, done) {
  if (response.body && response.body.token) {
    context.vars.authToken = response.body.token;
  } else if (response.body && response.body.access_token) {
    context.vars.authToken = response.body.access_token;
  }
  return done();
}

module.exports = {
  generateRandomString,
  generateTestUser,
  logResponse,
  setAuthToken
};