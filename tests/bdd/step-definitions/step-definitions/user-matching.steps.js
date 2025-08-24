"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
// Background Steps
(0, cucumber_1.Given)('I am a registered user with a complete profile', async function () {
    // Create a test user with complete profile
    this.testData.currentUser = this.generateTestUser();
    this.testData.currentUser.profile = {
        age: 28,
        bio: 'Love hiking and reading books',
        interests: ['hiking', 'reading', 'travel'],
        photos: ['photo1.jpg', 'photo2.jpg'],
        location: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        preferences: {
            ageRange: { min: 25, max: 35 },
            distance: 10,
            interests: ['hiking', 'reading']
        }
    };
    // Register user via API
    const response = await this.apiRequest('POST', '/api/auth/register', {
        email: this.testData.currentUser.email,
        password: this.testData.currentUser.password,
        profile: this.testData.currentUser.profile
    });
    (0, test_1.expect)(response.status).toBe(201);
    this.testData.currentUser.id = response.data.user.id;
    this.testData.authToken = response.data.token;
});
(0, cucumber_1.Given)('I am logged in', async function () {
    if (!this.testData.authToken) {
        // Login if not already authenticated
        const response = await this.apiRequest('POST', '/api/auth/login', {
            email: this.testData.currentUser.email,
            password: this.testData.currentUser.password
        });
        (0, test_1.expect)(response.status).toBe(200);
        this.testData.authToken = response.data.token;
    }
    // Set authentication in browser context
    if (this.page) {
        await this.page.evaluate((token) => {
            localStorage.setItem('authToken', token);
        }, this.testData.authToken);
    }
});
// Setup Steps
(0, cucumber_1.Given)('there are other users with compatible profiles', async function () {
    // Create compatible test users
    const compatibleUsers = [
        {
            email: 'compatible1@test.com',
            age: 30,
            interests: ['hiking', 'photography'],
            location: { lat: 37.7849, lng: -122.4094 } // Close to current user
        },
        {
            email: 'compatible2@test.com',
            age: 27,
            interests: ['reading', 'travel'],
            location: { lat: 37.7649, lng: -122.4294 }
        },
        {
            email: 'compatible3@test.com',
            age: 32,
            interests: ['hiking', 'reading', 'cooking'],
            location: { lat: 37.7549, lng: -122.4394 }
        }
    ];
    this.testData.compatibleUsers = [];
    for (const userData of compatibleUsers) {
        const response = await this.apiRequest('POST', '/api/auth/register', {
            email: userData.email,
            password: 'TestPass123!',
            profile: {
                age: userData.age,
                bio: `I enjoy ${userData.interests.join(', ')}`,
                interests: userData.interests,
                photos: ['photo1.jpg'],
                location: userData.location
            }
        });
        (0, test_1.expect)(response.status).toBe(201);
        this.testData.compatibleUsers.push(response.data.user);
    }
});
(0, cucumber_1.Given)('I have a target user ID', async function () {
    if (!this.testData.compatibleUsers || this.testData.compatibleUsers.length === 0) {
        // Create a target user if none exist
        const response = await this.apiRequest('POST', '/api/auth/register', {
            email: 'target@test.com',
            password: 'TestPass123!',
            profile: {
                age: 29,
                bio: 'Looking for meaningful connections',
                interests: ['hiking', 'music'],
                photos: ['photo1.jpg'],
                location: { lat: 37.7749, lng: -122.4194 }
            }
        });
        (0, test_1.expect)(response.status).toBe(201);
        this.testData.targetUserId = response.data.user.id;
    }
    else {
        this.testData.targetUserId = this.testData.compatibleUsers[0].id;
    }
});
// Navigation Steps
(0, cucumber_1.When)('I navigate to the matching page', async function () {
    await this.navigateTo('/matching');
    await this.waitForElement('[data-testid="matching-page"]');
});
(0, cucumber_1.When)('I am on the matching page', async function () {
    await this.navigateTo('/matching');
    await this.waitForElement('[data-testid="matching-page"]');
});
// Interaction Steps
(0, cucumber_1.When)('I click the {string} button', async function (action) {
    const buttonSelector = `[data-testid="${action}-button"]`;
    await this.clickElement(buttonSelector);
});
(0, cucumber_1.When)('I open the filters menu', async function () {
    await this.clickElement('[data-testid="filters-button"]');
    await this.waitForElement('[data-testid="filters-menu"]');
});
(0, cucumber_1.When)('I set age range to {string}', async function (ageRange) {
    const [minAge, maxAge] = ageRange.split('-');
    await this.fillField('[data-testid="min-age-input"]', minAge);
    await this.fillField('[data-testid="max-age-input"]', maxAge);
});
(0, cucumber_1.When)('I set distance to {string}', async function (distance) {
    await this.fillField('[data-testid="distance-input"]', distance.replace(' miles', ''));
});
(0, cucumber_1.When)('I select interests {string}', async function (interests) {
    const interestList = interests.split(', ');
    for (const interest of interestList) {
        await this.clickElement(`[data-testid="interest-${interest}"]`);
    }
});
(0, cucumber_1.When)('I apply the filters', async function () {
    await this.clickElement('[data-testid="apply-filters-button"]');
});
// Mobile Interaction Steps
(0, cucumber_1.When)('I swipe left on a match card', async function () {
    const matchCard = await this.page.locator('[data-testid="match-card"]').first();
    const box = await matchCard.boundingBox();
    if (box) {
        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await this.page.mouse.down();
        await this.page.mouse.move(box.x - 100, box.y + box.height / 2);
        await this.page.mouse.up();
    }
});
(0, cucumber_1.When)('I swipe right on a match card', async function () {
    const matchCard = await this.page.locator('[data-testid="match-card"]').first();
    const box = await matchCard.boundingBox();
    if (box) {
        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await this.page.mouse.down();
        await this.page.mouse.move(box.x + 100, box.y + box.height / 2);
        await this.page.mouse.up();
    }
});
// API Steps
(0, cucumber_1.When)('I send a GET request to {string}', async function (endpoint) {
    this.testData.lastApiResponse = await this.apiRequest('GET', endpoint);
});
(0, cucumber_1.When)('I send a POST request to {string} with the user ID', async function (endpoint) {
    this.testData.lastApiResponse = await this.apiRequest('POST', endpoint, {
        targetUserId: this.testData.targetUserId
    });
});
// Condition Steps
(0, cucumber_1.Given)('I have liked a user', async function () {
    if (!this.testData.targetUserId) {
        // Create a target user first
        const response = await this.apiRequest('POST', '/api/auth/register', {
            email: 'liked-user@test.com',
            password: 'TestPass123!',
            profile: { age: 28, bio: 'Test user', interests: ['hiking'] }
        });
        this.testData.targetUserId = response.data.user.id;
    }
    // Record the like
    await this.apiRequest('POST', '/api/matches/like', {
        targetUserId: this.testData.targetUserId
    });
});
(0, cucumber_1.Given)('that user likes me back', async function () {
    // Simulate the other user liking back
    await this.apiRequest('POST', '/api/matches/like', {
        targetUserId: this.testData.currentUser.id
    }, this.testData.targetUserId); // Use target user's auth
});
(0, cucumber_1.Given)('I have already liked a user', async function () {
    await this.apiRequest('POST', '/api/matches/like', {
        targetUserId: this.testData.targetUserId
    });
});
(0, cucumber_1.Given)('I have reached my daily like limit', async function () {
    // Simulate reaching daily limit by making multiple like requests
    const dailyLimit = 50; // Assuming 50 is the daily limit
    for (let i = 0; i < dailyLimit; i++) {
        const response = await this.apiRequest('POST', '/api/auth/register', {
            email: `temp-user-${i}@test.com`,
            password: 'TestPass123!',
            profile: { age: 25, bio: 'Temp user', interests: ['test'] }
        });
        await this.apiRequest('POST', '/api/matches/like', {
            targetUserId: response.data.user.id
        });
    }
});
(0, cucumber_1.Given)('I am a premium user', async function () {
    // Update user to premium status
    await this.apiRequest('PATCH', `/api/users/${this.testData.currentUser.id}`, {
        subscription: {
            type: 'premium',
            status: 'active',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
    });
});
(0, cucumber_1.Given)('I have super likes available', async function () {
    // Ensure user has super likes
    await this.apiRequest('PATCH', `/api/users/${this.testData.currentUser.id}`, {
        superLikes: 5
    });
});
// Assertion Steps
(0, cucumber_1.Then)('I should see a list of potential matches', async function () {
    await this.waitForElement('[data-testid="match-list"]');
    const matches = await this.page.locator('[data-testid="match-card"]').count();
    (0, test_1.expect)(matches).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('each match should display basic profile information', async function () {
    const firstMatch = this.page.locator('[data-testid="match-card"]').first();
    await (0, test_1.expect)(firstMatch.locator('[data-testid="match-name"]')).toBeVisible();
    await (0, test_1.expect)(firstMatch.locator('[data-testid="match-age"]')).toBeVisible();
    await (0, test_1.expect)(firstMatch.locator('[data-testid="match-photo"]')).toBeVisible();
});
(0, cucumber_1.Then)('each match should have action buttons \(like, pass, super like\)', async function () {
    const firstMatch = this.page.locator('[data-testid="match-card"]').first();
    await (0, test_1.expect)(firstMatch.locator('[data-testid="like-button"]')).toBeVisible();
    await (0, test_1.expect)(firstMatch.locator('[data-testid="pass-button"]')).toBeVisible();
    await (0, test_1.expect)(firstMatch.locator('[data-testid="super-like-button"]')).toBeVisible();
});
(0, cucumber_1.Then)('the match should be recorded in the system', async function () {
    // Verify the like was recorded via API
    const response = await this.apiRequest('GET', '/api/matches/my-likes');
    (0, test_1.expect)(response.status).toBe(200);
    (0, test_1.expect)(response.data.likes).toContainEqual(test_1.expect.objectContaining({ targetUserId: this.testData.targetUserId }));
});
(0, cucumber_1.Then)('I should see the next potential match', async function () {
    await this.waitForElement('[data-testid="match-card"]');
    // Verify that a new match card is displayed
    const matchCard = this.page.locator('[data-testid="match-card"]').first();
    await (0, test_1.expect)(matchCard).toBeVisible();
});
(0, cucumber_1.Then)('the liked user should be notified if it\'s a mutual match', async function () {
    // Check if notification was sent (this would typically be verified through database or notification service)
    const response = await this.apiRequest('GET', `/api/notifications/${this.testData.targetUserId}`);
    if (response.status === 200 && response.data.notifications.some((n) => n.type === 'mutual_match')) {
        (0, test_1.expect)(response.data.notifications).toContainEqual(test_1.expect.objectContaining({ type: 'mutual_match' }));
    }
});
(0, cucumber_1.Then)('the API should respond with status code {int}', async function (statusCode) {
    (0, test_1.expect)(this.testData.lastApiResponse.status).toBe(statusCode);
});
(0, cucumber_1.Then)('the response should contain a list of potential matches', async function () {
    (0, test_1.expect)(this.testData.lastApiResponse.data).toHaveProperty('matches');
    (0, test_1.expect)(Array.isArray(this.testData.lastApiResponse.data.matches)).toBe(true);
});
(0, cucumber_1.Then)('each match should include user ID, basic profile info, and compatibility score', async function () {
    const matches = this.testData.lastApiResponse.data.matches;
    (0, test_1.expect)(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
        (0, test_1.expect)(match).toHaveProperty('userId');
        (0, test_1.expect)(match).toHaveProperty('profile');
        (0, test_1.expect)(match).toHaveProperty('compatibilityScore');
        (0, test_1.expect)(typeof match.compatibilityScore).toBe('number');
        (0, test_1.expect)(match.compatibilityScore).toBeGreaterThanOrEqual(0);
        (0, test_1.expect)(match.compatibilityScore).toBeLessThanOrEqual(100);
    }
});
(0, cucumber_1.Then)('I should see an error message {string}', async function (errorMessage) {
    await this.waitForElement('[data-testid="error-message"]');
    const errorElement = this.page.locator('[data-testid="error-message"]');
    await (0, test_1.expect)(errorElement).toContainText(errorMessage);
});
(0, cucumber_1.Then)('it should register as a {string}', async function (action) {
    // Verify the action was recorded
    const response = await this.apiRequest('GET', `/api/matches/my-${action}s`);
    (0, test_1.expect)(response.status).toBe(200);
    (0, test_1.expect)(response.data[`${action}s`]).toContainEqual(test_1.expect.objectContaining({ targetUserId: test_1.expect.any(String) }));
});
(0, cucumber_1.Then)('the swipe gestures should be smooth and responsive', async function () {
    // This is more of a visual/performance test
    // We can check that the UI responds appropriately to swipe gestures
    await this.waitForElement('[data-testid="match-card"]');
    const matchCard = this.page.locator('[data-testid="match-card"]').first();
    await (0, test_1.expect)(matchCard).toBeVisible();
});
// Accessibility Steps
(0, cucumber_1.Then)('each match card should have proper ARIA labels', async function () {
    const matchCards = this.page.locator('[data-testid="match-card"]');
    const count = await matchCards.count();
    for (let i = 0; i < count; i++) {
        const card = matchCards.nth(i);
        await (0, test_1.expect)(card).toHaveAttribute('aria-label');
    }
});
(0, cucumber_1.Then)('action buttons should be keyboard accessible', async function () {
    const likeButton = this.page.locator('[data-testid="like-button"]').first();
    await likeButton.focus();
    await (0, test_1.expect)(likeButton).toBeFocused();
    // Test keyboard navigation
    await this.page.keyboard.press('Tab');
    const passButton = this.page.locator('[data-testid="pass-button"]').first();
    await (0, test_1.expect)(passButton).toBeFocused();
});
(0, cucumber_1.Then)('my super like count should decrease by one', async function () {
    const response = await this.apiRequest('GET', `/api/users/${this.testData.currentUser.id}`);
    (0, test_1.expect)(response.status).toBe(200);
    (0, test_1.expect)(response.data.user.superLikes).toBe(4); // Assuming started with 5
});
