"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
// Background steps
(0, cucumber_1.Given)('the application is running', async function () {
    // Verify that the application is accessible
    const response = await fetch(this.baseUrl);
    (0, test_1.expect)(response.status).toBe(200);
});
(0, cucumber_1.Given)('I am on the registration page', async function () {
    await this.navigateTo('/register');
    await this.assertElementVisible('[data-testid="registration-form"]');
});
// User data setup steps
(0, cucumber_1.Given)('I am a new user with valid registration data', async function () {
    const testUser = this.generateTestUser();
    this.setTestData('newUser', testUser);
});
(0, cucumber_1.Given)('a user already exists with email {string}', async function (email) {
    // Create an existing user via API
    const existingUser = {
        email,
        password: this.generateTestPassword(),
        name: 'Existing User',
    };
    await this.makeApiRequest('POST', '/api/auth/register', existingUser);
    this.setTestData('existingUser', existingUser);
});
(0, cucumber_1.Given)('I have valid user registration data', async function () {
    const testUser = this.generateTestUser();
    this.setTestData('apiUser', testUser);
});
(0, cucumber_1.Given)('I have invalid user registration data', async function () {
    const invalidUser = {
        email: 'invalid-email',
        password: '123', // Too short
        name: '', // Empty name
    };
    this.setTestData('invalidUser', invalidUser);
});
(0, cucumber_1.Given)('I am using a mobile device', async function () {
    await this.initBrowser();
    await this.context.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
});
// Form interaction steps
(0, cucumber_1.When)('I fill in the registration form with valid data', async function () {
    const user = this.getTestData('newUser');
    await this.fillField('[data-testid="email-input"]', user.email);
    await this.fillField('[data-testid="password-input"]', user.password);
    await this.fillField('[data-testid="name-input"]', user.name);
});
(0, cucumber_1.When)('I enter an invalid email format {string}', async function (email) {
    await this.fillField('[data-testid="email-input"]', email);
});
(0, cucumber_1.When)('I enter a valid email {string}', async function (email) {
    await this.fillField('[data-testid="email-input"]', email);
});
(0, cucumber_1.When)('I enter a valid password {string}', async function (password) {
    await this.fillField('[data-testid="password-input"]', password);
});
(0, cucumber_1.When)('I enter a weak password {string}', async function (password) {
    await this.fillField('[data-testid="password-input"]', password);
});
(0, cucumber_1.When)('I enter a valid name {string}', async function (name) {
    await this.fillField('[data-testid="name-input"]', name);
});
(0, cucumber_1.When)('I leave the email field empty', async function () {
    await this.fillField('[data-testid="email-input"]', '');
});
(0, cucumber_1.When)('I leave the password field empty', async function () {
    await this.fillField('[data-testid="password-input"]', '');
});
(0, cucumber_1.When)('I leave the name field empty', async function () {
    await this.fillField('[data-testid="name-input"]', '');
});
(0, cucumber_1.When)('I submit the registration form', async function () {
    await this.clickElement('[data-testid="submit-button"]');
    // Wait for form submission to complete
    await this.page.waitForTimeout(1000);
});
(0, cucumber_1.When)('I try to register with the same email {string}', async function (email) {
    await this.fillField('[data-testid="email-input"]', email);
});
(0, cucumber_1.When)('I fill in the registration form', async function () {
    const user = this.generateTestUser();
    await this.fillField('[data-testid="email-input"]', user.email);
    await this.fillField('[data-testid="password-input"]', user.password);
    await this.fillField('[data-testid="name-input"]', user.name);
});
// API steps
(0, cucumber_1.When)('I send a POST request to {string} with the user data', async function (endpoint) {
    const user = this.getTestData('apiUser');
    await this.makeApiRequest('POST', endpoint, user);
});
(0, cucumber_1.When)('I send a POST request to {string} with the invalid data', async function (endpoint) {
    const invalidUser = this.getTestData('invalidUser');
    await this.makeApiRequest('POST', endpoint, invalidUser);
});
(0, cucumber_1.When)('I register a new user with password {string}', async function (password) {
    const user = {
        email: this.generateTestEmail(),
        password,
        name: 'Test User',
    };
    await this.makeApiRequest('POST', '/api/auth/register', user);
    this.setTestData('registeredUser', user);
});
(0, cucumber_1.When)('I check the user data in the database', async function () {
    const user = this.getTestData('registeredUser');
    // This would typically query the database directly
    // For now, we'll use the API to get user data
    await this.makeApiRequest('GET', `/api/users/by-email/${user.email}`);
});
// Assertion steps
(0, cucumber_1.Then)('I should see a success message', async function () {
    await this.assertElementVisible('[data-testid="success-message"]');
    await this.assertElementContainsText('[data-testid="success-message"]', 'Registration successful');
});
(0, cucumber_1.Then)('I should be redirected to the profile setup page', async function () {
    await this.page.waitForURL('**/profile/setup');
    (0, test_1.expect)(this.page.url()).toContain('/profile/setup');
});
(0, cucumber_1.Then)('a new user account should be created in the system', async function () {
    const user = this.getTestData('newUser');
    // Verify user exists via API
    await this.makeApiRequest('GET', `/api/users/by-email/${user.email}`);
    this.assertApiResponseStatus(200);
    this.assertApiResponseContains('email', user.email);
});
(0, cucumber_1.Then)('I should see an error message {string}', async function (expectedMessage) {
    await this.assertElementVisible('[data-testid="error-message"]');
    await this.assertElementContainsText('[data-testid="error-message"]', expectedMessage);
});
(0, cucumber_1.Then)('I should remain on the registration page', async function () {
    (0, test_1.expect)(this.page.url()).toContain('/register');
    await this.assertElementVisible('[data-testid="registration-form"]');
});
(0, cucumber_1.Then)('I should see validation errors for all required fields', async function () {
    await this.assertElementVisible('[data-testid="email-error"]');
    await this.assertElementVisible('[data-testid="password-error"]');
    await this.assertElementVisible('[data-testid="name-error"]');
});
(0, cucumber_1.Then)('the API should respond with status code {int}', async function (expectedStatus) {
    this.assertApiResponseStatus(expectedStatus);
});
(0, cucumber_1.Then)('the response should contain the user ID', async function () {
    (0, test_1.expect)(this.apiResponse.data).toHaveProperty('id');
    (0, test_1.expect)(this.apiResponse.data.id).toBeTruthy();
});
(0, cucumber_1.Then)('the response should contain a JWT token', async function () {
    (0, test_1.expect)(this.apiResponse.data).toHaveProperty('token');
    (0, test_1.expect)(this.apiResponse.data.token).toBeTruthy();
});
(0, cucumber_1.Then)('the user should be stored in the database', async function () {
    const user = this.getTestData('apiUser');
    // Verify user exists
    await this.makeApiRequest('GET', `/api/users/by-email/${user.email}`);
    this.assertApiResponseStatus(200);
});
(0, cucumber_1.Then)('the response should contain validation errors', async function () {
    (0, test_1.expect)(this.apiResponse.data).toHaveProperty('errors');
    (0, test_1.expect)(Array.isArray(this.apiResponse.data.errors)).toBe(true);
    (0, test_1.expect)(this.apiResponse.data.errors.length).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('no user should be created in the database', async function () {
    const invalidUser = this.getTestData('invalidUser');
    // Try to get user and expect 404
    await this.makeApiRequest('GET', `/api/users/by-email/${invalidUser.email}`);
    this.assertApiResponseStatus(404);
});
(0, cucumber_1.Then)('the password should be hashed', async function () {
    (0, test_1.expect)(this.apiResponse.data).toHaveProperty('password');
    const hashedPassword = this.apiResponse.data.password;
    // Verify it's not the original password
    const originalPassword = this.getTestData('registeredUser').password;
    (0, test_1.expect)(hashedPassword).not.toBe(originalPassword);
    // Verify it looks like a hash (bcrypt format)
    (0, test_1.expect)(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
});
(0, cucumber_1.Then)('the password should not be stored in plain text', async function () {
    const originalPassword = this.getTestData('registeredUser').password;
    const storedPassword = this.apiResponse.data.password;
    (0, test_1.expect)(storedPassword).not.toBe(originalPassword);
});
(0, cucumber_1.Then)('the password hash should be verifiable', async function () {
    // This would typically involve verifying the hash with bcrypt
    // For now, we'll just check that it's a valid hash format
    const hashedPassword = this.apiResponse.data.password;
    (0, test_1.expect)(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
});
// Accessibility steps
(0, cucumber_1.Then)('the form should have proper ARIA labels', async function () {
    const emailInput = this.page.locator('[data-testid="email-input"]');
    const passwordInput = this.page.locator('[data-testid="password-input"]');
    const nameInput = this.page.locator('[data-testid="name-input"]');
    await (0, test_1.expect)(emailInput).toHaveAttribute('aria-label');
    await (0, test_1.expect)(passwordInput).toHaveAttribute('aria-label');
    await (0, test_1.expect)(nameInput).toHaveAttribute('aria-label');
});
(0, cucumber_1.Then)('all form fields should be keyboard accessible', async function () {
    // Test tab navigation
    await this.page.keyboard.press('Tab');
    await (0, test_1.expect)(this.page.locator('[data-testid="email-input"]')).toBeFocused();
    await this.page.keyboard.press('Tab');
    await (0, test_1.expect)(this.page.locator('[data-testid="password-input"]')).toBeFocused();
    await this.page.keyboard.press('Tab');
    await (0, test_1.expect)(this.page.locator('[data-testid="name-input"]')).toBeFocused();
});
(0, cucumber_1.Then)('error messages should be announced to screen readers', async function () {
    const errorMessage = this.page.locator('[data-testid="error-message"]');
    await (0, test_1.expect)(errorMessage).toHaveAttribute('role', 'alert');
});
(0, cucumber_1.Then)('the form should have a logical tab order', async function () {
    // Verify tab order: email -> password -> name -> submit
    await this.page.keyboard.press('Tab');
    await (0, test_1.expect)(this.page.locator('[data-testid="email-input"]')).toBeFocused();
    await this.page.keyboard.press('Tab');
    await (0, test_1.expect)(this.page.locator('[data-testid="password-input"]')).toBeFocused();
    await this.page.keyboard.press('Tab');
    await (0, test_1.expect)(this.page.locator('[data-testid="name-input"]')).toBeFocused();
    await this.page.keyboard.press('Tab');
    await (0, test_1.expect)(this.page.locator('[data-testid="submit-button"]')).toBeFocused();
});
// Mobile responsiveness steps
(0, cucumber_1.Then)('the form should be properly displayed on mobile', async function () {
    await this.assertElementVisible('[data-testid="registration-form"]');
    // Check that form elements are properly sized for mobile
    const form = this.page.locator('[data-testid="registration-form"]');
    const boundingBox = await form.boundingBox();
    (0, test_1.expect)(boundingBox?.width).toBeLessThanOrEqual(375); // Mobile width
});
(0, cucumber_1.Then)('all form fields should be easily accessible', async function () {
    // Check that form fields have adequate touch targets (minimum 44px)
    const inputs = this.page.locator('input');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const boundingBox = await input.boundingBox();
        (0, test_1.expect)(boundingBox?.height).toBeGreaterThanOrEqual(44);
    }
});
(0, cucumber_1.Then)('the submit button should be clearly visible', async function () {
    await this.assertElementVisible('[data-testid="submit-button"]');
    const button = this.page.locator('[data-testid="submit-button"]');
    const boundingBox = await button.boundingBox();
    // Check button is large enough for touch
    (0, test_1.expect)(boundingBox?.height).toBeGreaterThanOrEqual(44);
    (0, test_1.expect)(boundingBox?.width).toBeGreaterThanOrEqual(44);
});
