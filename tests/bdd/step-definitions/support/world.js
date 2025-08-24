"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomWorld = void 0;
const cucumber_1 = require("@cucumber/cucumber");
const playwright_1 = require("playwright");
const test_1 = require("@playwright/test");
/**
 * Custom World class for BDD tests
 * Manages browser instances, API clients, and test data
 */
class CustomWorld extends cucumber_1.World {
    constructor(options) {
        super(options);
        this.testData = {};
        this.projectRoot = '';
        this.servicesStarted = false;
        this.workflows = [];
        this.envSetup = false;
        this.dockerAvailable = false;
        this.nodeEnvironmentReady = false;
        this.startupError = '';
        // Get configuration from world parameters
        this.baseUrl = options.parameters.baseUrl || 'http://localhost:3000';
        this.apiUrl = options.parameters.apiUrl || 'http://localhost:3001';
        this.timeout = options.parameters.timeout || 30000;
    }
    /**
     * Initialize browser and page for UI tests
     */
    async initBrowser() {
        if (!this.browser) {
            this.browser = await playwright_1.chromium.launch({
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
    async navigateTo(path) {
        await this.initBrowser();
        const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
        await this.page.goto(url, { waitUntil: 'networkidle' });
    }
    /**
     * Make API request
     */
    async makeApiRequest(method, endpoint, data, headers) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.apiUrl}${endpoint}`;
        const options = {
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
    setTestData(key, value) {
        this.testData[key] = value;
    }
    /**
     * Get test data
     */
    getTestData(key) {
        return this.testData[key];
    }
    /**
     * Generate random test data
     */
    generateTestEmail() {
        const timestamp = Date.now();
        return `test-${timestamp}@example.com`;
    }
    generateTestPassword() {
        return 'TestPassword123!';
    }
    generateTestUser() {
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
    async waitForElement(selector, timeout) {
        await this.page.waitForSelector(selector, {
            timeout: timeout || this.timeout,
            state: 'visible',
        });
    }
    /**
     * Fill form field
     */
    async fillField(selector, value) {
        await this.waitForElement(selector);
        await this.page.fill(selector, value);
    }
    /**
     * Click element
     */
    async clickElement(selector) {
        await this.waitForElement(selector);
        await this.page.click(selector);
    }
    /**
     * Assert element is visible
     */
    async assertElementVisible(selector) {
        await (0, test_1.expect)(this.page.locator(selector)).toBeVisible();
    }
    /**
     * Assert element contains text
     */
    async assertElementContainsText(selector, text) {
        await (0, test_1.expect)(this.page.locator(selector)).toContainText(text);
    }
    /**
     * Assert API response status
     */
    assertApiResponseStatus(expectedStatus) {
        (0, test_1.expect)(this.apiResponse.status).toBe(expectedStatus);
    }
    /**
     * Assert API response contains data
     */
    assertApiResponseContains(key, value) {
        (0, test_1.expect)(this.apiResponse.data).toHaveProperty(key, value);
    }
    /**
     * Clean up resources
     */
    async cleanup() {
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
exports.CustomWorld = CustomWorld;
// Set the custom world constructor
(0, cucumber_1.setWorldConstructor)(CustomWorld);
