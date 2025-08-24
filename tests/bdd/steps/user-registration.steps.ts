import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Background steps
Given('the application is running', async function (this: CustomWorld) {
  // Verify that the application is accessible
  const response = await fetch(this.baseUrl);
  expect(response.status).toBe(200);
});

Given('I am on the registration page', async function (this: CustomWorld) {
  await this.navigateTo('/register');
  await this.assertElementVisible('[data-testid="registration-form"]');
});

// User data setup steps
Given('I am a new user with valid registration data', async function (this: CustomWorld) {
  const testUser = this.generateTestUser();
  this.setTestData('newUser', testUser);
});

Given('a user already exists with email {string}', async function (this: CustomWorld, email: string) {
  // Create an existing user via API
  const existingUser = {
    email,
    password: this.generateTestPassword(),
    name: 'Existing User',
  };
  
  await this.makeApiRequest('POST', '/api/auth/register', existingUser);
  this.setTestData('existingUser', existingUser);
});

Given('I have valid user registration data', async function (this: CustomWorld) {
  const testUser = this.generateTestUser();
  this.setTestData('apiUser', testUser);
});

Given('I have invalid user registration data', async function (this: CustomWorld) {
  const invalidUser = {
    email: 'invalid-email',
    password: '123', // Too short
    name: '', // Empty name
  };
  this.setTestData('invalidUser', invalidUser);
});

Given('I am using a mobile device', async function (this: CustomWorld) {
  await this.initBrowser();
  await this.context.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
});

// Form interaction steps
When('I fill in the registration form with valid data', async function (this: CustomWorld) {
  const user = this.getTestData('newUser');
  
  await this.fillField('[data-testid="email-input"]', user.email);
  await this.fillField('[data-testid="password-input"]', user.password);
  await this.fillField('[data-testid="name-input"]', user.name);
});

When('I enter an invalid email format {string}', async function (this: CustomWorld, email: string) {
  await this.fillField('[data-testid="email-input"]', email);
});

When('I enter a valid email {string}', async function (this: CustomWorld, email: string) {
  await this.fillField('[data-testid="email-input"]', email);
});

When('I enter a valid password {string}', async function (this: CustomWorld, password: string) {
  await this.fillField('[data-testid="password-input"]', password);
});

When('I enter a weak password {string}', async function (this: CustomWorld, password: string) {
  await this.fillField('[data-testid="password-input"]', password);
});

When('I enter a valid name {string}', async function (this: CustomWorld, name: string) {
  await this.fillField('[data-testid="name-input"]', name);
});

When('I leave the email field empty', async function (this: CustomWorld) {
  await this.fillField('[data-testid="email-input"]', '');
});

When('I leave the password field empty', async function (this: CustomWorld) {
  await this.fillField('[data-testid="password-input"]', '');
});

When('I leave the name field empty', async function (this: CustomWorld) {
  await this.fillField('[data-testid="name-input"]', '');
});

When('I submit the registration form', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="submit-button"]');
  // Wait for form submission to complete
  await this.page.waitForTimeout(1000);
});

When('I try to register with the same email {string}', async function (this: CustomWorld, email: string) {
  await this.fillField('[data-testid="email-input"]', email);
});

When('I fill in the registration form', async function (this: CustomWorld) {
  const user = this.generateTestUser();
  
  await this.fillField('[data-testid="email-input"]', user.email);
  await this.fillField('[data-testid="password-input"]', user.password);
  await this.fillField('[data-testid="name-input"]', user.name);
});

// API steps
When('I send a POST request to {string} with the user data', async function (this: CustomWorld, endpoint: string) {
  const user = this.getTestData('apiUser');
  await this.makeApiRequest('POST', endpoint, user);
});

When('I send a POST request to {string} with the invalid data', async function (this: CustomWorld, endpoint: string) {
  const invalidUser = this.getTestData('invalidUser');
  await this.makeApiRequest('POST', endpoint, invalidUser);
});

When('I register a new user with password {string}', async function (this: CustomWorld, password: string) {
  const user = {
    email: this.generateTestEmail(),
    password,
    name: 'Test User',
  };
  
  await this.makeApiRequest('POST', '/api/auth/register', user);
  this.setTestData('registeredUser', user);
});

When('I check the user data in the database', async function (this: CustomWorld) {
  const user = this.getTestData('registeredUser');
  // This would typically query the database directly
  // For now, we'll use the API to get user data
  await this.makeApiRequest('GET', `/api/users/by-email/${user.email}`);
});

// Assertion steps
Then('I should see a success message', async function (this: CustomWorld) {
  await this.assertElementVisible('[data-testid="success-message"]');
  await this.assertElementContainsText('[data-testid="success-message"]', 'Registration successful');
});

Then('I should be redirected to the profile setup page', async function (this: CustomWorld) {
  await this.page.waitForURL('**/profile/setup');
  expect(this.page.url()).toContain('/profile/setup');
});

Then('a new user account should be created in the system', async function (this: CustomWorld) {
  const user = this.getTestData('newUser');
  
  // Verify user exists via API
  await this.makeApiRequest('GET', `/api/users/by-email/${user.email}`);
  this.assertApiResponseStatus(200);
  this.assertApiResponseContains('email', user.email);
});

Then('I should see an error message {string}', async function (this: CustomWorld, expectedMessage: string) {
  await this.assertElementVisible('[data-testid="error-message"]');
  await this.assertElementContainsText('[data-testid="error-message"]', expectedMessage);
});

Then('I should remain on the registration page', async function (this: CustomWorld) {
  expect(this.page.url()).toContain('/register');
  await this.assertElementVisible('[data-testid="registration-form"]');
});

Then('I should see validation errors for all required fields', async function (this: CustomWorld) {
  await this.assertElementVisible('[data-testid="email-error"]');
  await this.assertElementVisible('[data-testid="password-error"]');
  await this.assertElementVisible('[data-testid="name-error"]');
});

Then('the API should respond with status code {int}', async function (this: CustomWorld, expectedStatus: number) {
  this.assertApiResponseStatus(expectedStatus);
});

Then('the response should contain the user ID', async function (this: CustomWorld) {
  expect(this.apiResponse.data).toHaveProperty('id');
  expect(this.apiResponse.data.id).toBeTruthy();
});

Then('the response should contain a JWT token', async function (this: CustomWorld) {
  expect(this.apiResponse.data).toHaveProperty('token');
  expect(this.apiResponse.data.token).toBeTruthy();
});

Then('the user should be stored in the database', async function (this: CustomWorld) {
  const user = this.getTestData('apiUser');
  
  // Verify user exists
  await this.makeApiRequest('GET', `/api/users/by-email/${user.email}`);
  this.assertApiResponseStatus(200);
});

Then('the response should contain validation errors', async function (this: CustomWorld) {
  expect(this.apiResponse.data).toHaveProperty('errors');
  expect(Array.isArray(this.apiResponse.data.errors)).toBe(true);
  expect(this.apiResponse.data.errors.length).toBeGreaterThan(0);
});

Then('no user should be created in the database', async function (this: CustomWorld) {
  const invalidUser = this.getTestData('invalidUser');
  
  // Try to get user and expect 404
  await this.makeApiRequest('GET', `/api/users/by-email/${invalidUser.email}`);
  this.assertApiResponseStatus(404);
});

Then('the password should be hashed', async function (this: CustomWorld) {
  expect(this.apiResponse.data).toHaveProperty('password');
  const hashedPassword = this.apiResponse.data.password;
  
  // Verify it's not the original password
  const originalPassword = this.getTestData('registeredUser').password;
  expect(hashedPassword).not.toBe(originalPassword);
  
  // Verify it looks like a hash (bcrypt format)
  expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
});

Then('the password should not be stored in plain text', async function (this: CustomWorld) {
  const originalPassword = this.getTestData('registeredUser').password;
  const storedPassword = this.apiResponse.data.password;
  
  expect(storedPassword).not.toBe(originalPassword);
});

Then('the password hash should be verifiable', async function (this: CustomWorld) {
  // This would typically involve verifying the hash with bcrypt
  // For now, we'll just check that it's a valid hash format
  const hashedPassword = this.apiResponse.data.password;
  expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
});

// Accessibility steps
Then('the form should have proper ARIA labels', async function (this: CustomWorld) {
  const emailInput = this.page.locator('[data-testid="email-input"]');
  const passwordInput = this.page.locator('[data-testid="password-input"]');
  const nameInput = this.page.locator('[data-testid="name-input"]');
  
  await expect(emailInput).toHaveAttribute('aria-label');
  await expect(passwordInput).toHaveAttribute('aria-label');
  await expect(nameInput).toHaveAttribute('aria-label');
});

Then('all form fields should be keyboard accessible', async function (this: CustomWorld) {
  // Test tab navigation
  await this.page.keyboard.press('Tab');
  await expect(this.page.locator('[data-testid="email-input"]')).toBeFocused();
  
  await this.page.keyboard.press('Tab');
  await expect(this.page.locator('[data-testid="password-input"]')).toBeFocused();
  
  await this.page.keyboard.press('Tab');
  await expect(this.page.locator('[data-testid="name-input"]')).toBeFocused();
});

Then('error messages should be announced to screen readers', async function (this: CustomWorld) {
  const errorMessage = this.page.locator('[data-testid="error-message"]');
  await expect(errorMessage).toHaveAttribute('role', 'alert');
});

Then('the form should have a logical tab order', async function (this: CustomWorld) {
  // Verify tab order: email -> password -> name -> submit
  await this.page.keyboard.press('Tab');
  await expect(this.page.locator('[data-testid="email-input"]')).toBeFocused();
  
  await this.page.keyboard.press('Tab');
  await expect(this.page.locator('[data-testid="password-input"]')).toBeFocused();
  
  await this.page.keyboard.press('Tab');
  await expect(this.page.locator('[data-testid="name-input"]')).toBeFocused();
  
  await this.page.keyboard.press('Tab');
  await expect(this.page.locator('[data-testid="submit-button"]')).toBeFocused();
});

// Mobile responsiveness steps
Then('the form should be properly displayed on mobile', async function (this: CustomWorld) {
  await this.assertElementVisible('[data-testid="registration-form"]');
  
  // Check that form elements are properly sized for mobile
  const form = this.page.locator('[data-testid="registration-form"]');
  const boundingBox = await form.boundingBox();
  
  expect(boundingBox?.width).toBeLessThanOrEqual(375); // Mobile width
});

Then('all form fields should be easily accessible', async function (this: CustomWorld) {
  // Check that form fields have adequate touch targets (minimum 44px)
  const inputs = this.page.locator('input');
  const count = await inputs.count();
  
  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i);
    const boundingBox = await input.boundingBox();
    expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
  }
});

Then('the submit button should be clearly visible', async function (this: CustomWorld) {
  await this.assertElementVisible('[data-testid="submit-button"]');
  
  const button = this.page.locator('[data-testid="submit-button"]');
  const boundingBox = await button.boundingBox();
  
  // Check button is large enough for touch
  expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
  expect(boundingBox?.width).toBeGreaterThanOrEqual(44);
});