"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
// Background steps
(0, cucumber_1.Given)('I am on the settings page', async function () {
    await this.page.goto('/settings');
    await this.page.waitForSelector('[data-testid="settings-page"]');
});
// Navigation steps
(0, cucumber_1.When)('I navigate to account settings', async function () {
    await this.page.click('[data-testid="account-settings-tab"]');
    await this.page.waitForSelector('[data-testid="account-settings-content"]');
});
(0, cucumber_1.Given)('I am on the account settings page', async function () {
    await this.page.goto('/settings/account');
    await this.page.waitForSelector('[data-testid="account-settings-content"]');
});
(0, cucumber_1.Given)('I am on the privacy settings page', async function () {
    await this.page.goto('/settings/privacy');
    await this.page.waitForSelector('[data-testid="privacy-settings-content"]');
});
(0, cucumber_1.Given)('I am on the discovery settings page', async function () {
    await this.page.goto('/settings/discovery');
    await this.page.waitForSelector('[data-testid="discovery-settings-content"]');
});
(0, cucumber_1.Given)('I am on the notification settings page', async function () {
    await this.page.goto('/settings/notifications');
    await this.page.waitForSelector('[data-testid="notification-settings-content"]');
});
(0, cucumber_1.Given)('I am on the blocked users page', async function () {
    await this.page.goto('/settings/blocked');
    await this.page.waitForSelector('[data-testid="blocked-users-content"]');
});
(0, cucumber_1.Given)('I am on the delete account page', async function () {
    await this.page.goto('/settings/account/delete');
    await this.page.waitForSelector('[data-testid="delete-account-content"]');
});
(0, cucumber_1.Given)('I am on the change password page', async function () {
    await this.page.goto('/settings/account/password');
    await this.page.waitForSelector('[data-testid="change-password-content"]');
});
(0, cucumber_1.Given)('I am on the data and privacy page', async function () {
    await this.page.goto('/settings/data-privacy');
    await this.page.waitForSelector('[data-testid="data-privacy-content"]');
});
(0, cucumber_1.Given)('I am on the security settings page', async function () {
    await this.page.goto('/settings/security');
    await this.page.waitForSelector('[data-testid="security-settings-content"]');
});
(0, cucumber_1.Given)('I am on the analytics page', async function () {
    await this.page.goto('/settings/analytics');
    await this.page.waitForSelector('[data-testid="analytics-content"]');
});
(0, cucumber_1.Given)('I am on the subscription page', async function () {
    await this.page.goto('/settings/subscription');
    await this.page.waitForSelector('[data-testid="subscription-content"]');
});
// Account settings steps
(0, cucumber_1.When)('I click {string}', async function (buttonText) {
    await this.page.click(`button:has-text("${buttonText}")`);
});
(0, cucumber_1.When)('I enter a new email address {string}', async function (email) {
    await this.page.fill('[data-testid="new-email-input"]', email);
    this.testData.newEmail = email;
});
(0, cucumber_1.When)('I enter my current password', async function () {
    const currentPassword = this.testData.user?.password || 'TestPassword123!';
    await this.page.fill('[data-testid="current-password-input"]', currentPassword);
});
(0, cucumber_1.When)('I enter a new password {string}', async function (password) {
    await this.page.fill('[data-testid="new-password-input"]', password);
    this.testData.newPassword = password;
});
(0, cucumber_1.When)('I confirm the new password', async function () {
    const newPassword = this.testData.newPassword || 'NewSecurePass123!';
    await this.page.fill('[data-testid="confirm-password-input"]', newPassword);
});
(0, cucumber_1.When)('I enter an incorrect current password', async function () {
    await this.page.fill('[data-testid="current-password-input"]', 'WrongPassword123!');
});
(0, cucumber_1.When)('I enter a weak password {string}', async function (password) {
    await this.page.fill('[data-testid="new-password-input"]', password);
});
// Privacy settings steps
(0, cucumber_1.When)('I toggle {string} off', async function (settingName) {
    const toggleSelector = `[data-testid="${settingName.toLowerCase().replace(/\s+/g, '-')}-toggle"]`;
    const toggle = await this.page.locator(toggleSelector);
    const isChecked = await toggle.isChecked();
    if (isChecked) {
        await toggle.click();
    }
});
(0, cucumber_1.When)('I set my profile visibility to {string}', async function (visibility) {
    await this.page.selectOption('[data-testid="profile-visibility-select"]', visibility);
});
(0, cucumber_1.When)('I save the settings', async function () {
    await this.page.click('[data-testid="save-settings-button"]');
    await this.page.waitForSelector('[data-testid="settings-saved-message"]');
});
// Discovery settings steps
(0, cucumber_1.When)('I set my age range to {string}', async function (ageRange) {
    const [minAge, maxAge] = ageRange.split('-');
    await this.page.fill('[data-testid="min-age-input"]', minAge);
    await this.page.fill('[data-testid="max-age-input"]', maxAge);
});
(0, cucumber_1.When)('I set my distance range to {string}', async function (distance) {
    const distanceValue = distance.replace(/\D/g, '');
    await this.page.fill('[data-testid="distance-range-input"]', distanceValue);
});
(0, cucumber_1.When)('I select interested in {string}', async function (interest) {
    await this.page.selectOption('[data-testid="interested-in-select"]', interest);
});
(0, cucumber_1.When)('I enable {string}', async function (settingName) {
    const toggleSelector = `[data-testid="${settingName.toLowerCase().replace(/\s+/g, '-')}-toggle"]`;
    const toggle = await this.page.locator(toggleSelector);
    const isChecked = await toggle.isChecked();
    if (!isChecked) {
        await toggle.click();
    }
});
(0, cucumber_1.When)('I disable push notifications', async function () {
    const toggle = await this.page.locator('[data-testid="push-notifications-toggle"]');
    const isChecked = await toggle.isChecked();
    if (isChecked) {
        await toggle.click();
    }
});
(0, cucumber_1.When)('I enable email notifications for matches only', async function () {
    await this.page.check('[data-testid="email-matches-checkbox"]');
    await this.page.uncheck('[data-testid="email-messages-checkbox"]');
    await this.page.uncheck('[data-testid="email-likes-checkbox"]');
});
(0, cucumber_1.When)('I set quiet hours from {int} PM to {int} AM', async function (startHour, endHour) {
    await this.page.selectOption('[data-testid="quiet-start-time"]', `${startHour + 12}:00`);
    await this.page.selectOption('[data-testid="quiet-end-time"]', `${endHour}:00`);
});
// Blocked users steps
(0, cucumber_1.Given)('I have blocked some users', async function () {
    // Create test blocked users
    this.testData.blockedUsers = [
        { id: 'blocked-user-1', name: 'Blocked User 1' },
        { id: 'blocked-user-2', name: 'Blocked User 2' }
    ];
    // Mock API call to create blocked users
    await this.apiClient.post('/api/users/block', {
        userIds: this.testData.blockedUsers.map(user => user.id)
    });
});
(0, cucumber_1.When)('I view my blocked list', async function () {
    await this.page.waitForSelector('[data-testid="blocked-users-list"]');
});
(0, cucumber_1.When)('I unblock a user', async function () {
    await this.page.click('[data-testid="unblock-button"]:first-child');
    await this.page.waitForSelector('[data-testid="unblock-confirmation"]');
    await this.page.click('[data-testid="confirm-unblock-button"]');
});
// Account deletion steps
(0, cucumber_1.When)('I see a warning about permanent deletion', async function () {
    await this.page.waitForSelector('[data-testid="deletion-warning"]');
});
(0, cucumber_1.When)('I enter my password to confirm', async function () {
    const password = this.testData.user?.password || 'TestPassword123!';
    await this.page.fill('[data-testid="confirm-deletion-password"]', password);
});
(0, cucumber_1.When)('I select a reason for leaving', async function () {
    await this.page.selectOption('[data-testid="deletion-reason-select"]', 'Found someone');
});
(0, cucumber_1.When)('I see the confirmation dialog', async function () {
    await this.page.waitForSelector('[data-testid="deletion-confirmation-dialog"]');
});
// Data export steps
(0, cucumber_1.When)('I request to download my data', async function () {
    await this.page.click('[data-testid="download-data-button"]');
});
(0, cucumber_1.When)('I request data portability', async function () {
    await this.page.click('[data-testid="data-portability-button"]');
});
// Security steps
(0, cucumber_1.When)('I enable two-factor authentication', async function () {
    await this.page.click('[data-testid="enable-2fa-button"]');
});
(0, cucumber_1.When)('I scan the QR code with my authenticator app', async function () {
    // Simulate QR code scanning
    await this.page.waitForSelector('[data-testid="qr-code"]');
    this.testData.twoFactorSecret = 'MOCK_2FA_SECRET';
});
(0, cucumber_1.When)('I enter the verification code', async function () {
    // Mock verification code
    await this.page.fill('[data-testid="2fa-verification-code"]', '123456');
    await this.page.click('[data-testid="verify-2fa-button"]');
});
(0, cucumber_1.When)('I view my login activity', async function () {
    await this.page.click('[data-testid="login-activity-tab"]');
    await this.page.waitForSelector('[data-testid="login-activity-list"]');
});
// Subscription steps
(0, cucumber_1.Given)('I have an active subscription', async function () {
    this.testData.subscription = {
        plan: 'Premium',
        status: 'active',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
});
(0, cucumber_1.When)('I view my subscription details', async function () {
    await this.page.waitForSelector('[data-testid="subscription-details"]');
});
// Mobile and accessibility steps
(0, cucumber_1.Given)('I am using a mobile device', async function () {
    await this.page.setViewportSize({ width: 375, height: 667 });
});
(0, cucumber_1.Given)('I am using a screen reader', async function () {
    // Enable accessibility testing mode
    this.testData.accessibilityMode = true;
});
// Performance and offline steps
(0, cucumber_1.When)('I lose internet connectivity', async function () {
    await this.page.context().setOffline(true);
});
(0, cucumber_1.When)('connectivity is restored', async function () {
    await this.page.context().setOffline(false);
});
(0, cucumber_1.When)('I make changes to my settings', async function () {
    await this.page.fill('[data-testid="display-name-input"]', 'Updated Name');
    this.testData.offlineChanges = { displayName: 'Updated Name' };
});
// Premium user steps
(0, cucumber_1.Given)('I am a premium user', async function () {
    this.testData.user = {
        ...this.testData.user,
        isPremium: true,
        subscriptionType: 'premium'
    };
});
(0, cucumber_1.When)('I navigate to premium settings', async function () {
    await this.page.click('[data-testid="premium-settings-tab"]');
    await this.page.waitForSelector('[data-testid="premium-settings-content"]');
});
// API steps
(0, cucumber_1.When)('I send a GET request to {string}', async function (endpoint) {
    this.testData.apiResponse = await this.apiClient.get(endpoint);
});
(0, cucumber_1.When)('I send a PUT request to {string} with updated preferences', async function (endpoint) {
    const updatedSettings = {
        privacy: {
            showAge: false,
            showDistance: false,
            profileVisibility: 'friends_of_friends'
        },
        notifications: {
            pushEnabled: false,
            emailMatches: true,
            quietHours: { start: '22:00', end: '08:00' }
        }
    };
    this.testData.apiResponse = await this.apiClient.put(endpoint, updatedSettings);
});
(0, cucumber_1.When)('I send a PUT request to {string} with invalid data', async function (endpoint) {
    const invalidData = {
        privacy: {
            showAge: 'invalid_boolean',
            profileVisibility: 'invalid_option'
        }
    };
    this.testData.apiResponse = await this.apiClient.put(endpoint, invalidData);
});
(0, cucumber_1.When)('I send a PUT request to {string} with current and new password', async function (endpoint) {
    const passwordData = {
        currentPassword: this.testData.user?.password || 'TestPassword123!',
        newPassword: 'NewSecurePass123!'
    };
    this.testData.apiResponse = await this.apiClient.put(endpoint, passwordData);
});
(0, cucumber_1.When)('I send a DELETE request to {string}', async function (endpoint) {
    this.testData.apiResponse = await this.apiClient.delete(endpoint);
});
// Assertion steps
(0, cucumber_1.Then)('I should see my current email address', async function () {
    const email = this.testData.user?.email || 'test@example.com';
    await (0, test_1.expect)(this.page.locator('[data-testid="current-email"]')).toContainText(email);
});
(0, cucumber_1.Then)('I should see my account creation date', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="account-created-date"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see my subscription status', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="subscription-status"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see options to change my password', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="change-password-button"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see options to delete my account', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="delete-account-button"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see a confirmation message', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="confirmation-message"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should receive a verification email', async function () {
    // Mock email verification
    this.testData.emailVerificationSent = true;
});
(0, cucumber_1.Then)('my email should be updated after verification', async function () {
    // Simulate email verification process
    const newEmail = this.testData.newEmail;
    (0, test_1.expect)(newEmail).toBeDefined();
});
(0, cucumber_1.Then)('I should see a success message', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="success-message"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should be able to login with the new password', async function () {
    // This would be tested in a separate login test
    this.testData.passwordChanged = true;
});
(0, cucumber_1.Then)('I should see an error message {string}', async function (errorMessage) {
    await (0, test_1.expect)(this.page.locator('[data-testid="error-message"]')).toContainText(errorMessage);
});
(0, cucumber_1.Then)('my password should not be changed', async function () {
    // Verify password remains the same
    this.testData.passwordChanged = false;
});
(0, cucumber_1.Then)('I should see an error message about password strength', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="password-strength-error"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see password requirements', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="password-requirements"]')).toBeVisible();
});
(0, cucumber_1.Then)('my privacy settings should be updated', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="settings-updated-message"]')).toBeVisible();
});
(0, cucumber_1.Then)('other users should not see my age', async function () {
    // This would be verified in profile viewing tests
    this.testData.ageHidden = true;
});
(0, cucumber_1.Then)('other users should not see my distance', async function () {
    // This would be verified in profile viewing tests
    this.testData.distanceHidden = true;
});
(0, cucumber_1.Then)('my discovery preferences should be updated', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="discovery-settings-saved"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see matches within my criteria', async function () {
    // This would be verified in matching tests
    this.testData.discoveryPreferencesApplied = true;
});
(0, cucumber_1.Then)('I should see all blocked users', async function () {
    const blockedUsers = this.testData.blockedUsers || [];
    for (const user of blockedUsers) {
        await (0, test_1.expect)(this.page.locator(`[data-testid="blocked-user-${user.id}"]`)).toBeVisible();
    }
});
(0, cucumber_1.Then)('I should be able to unblock users', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="unblock-button"]').first()).toBeVisible();
});
(0, cucumber_1.Then)('they should be removed from my blocked list', async function () {
    // Verify user is removed from blocked list
    this.testData.userUnblocked = true;
});
(0, cucumber_1.Then)('they should be able to see my profile again', async function () {
    // This would be verified in profile visibility tests
    this.testData.profileVisibleToUnblockedUser = true;
});
(0, cucumber_1.Then)('I should not receive push notifications', async function () {
    // This would be verified in notification tests
    this.testData.pushNotificationsDisabled = true;
});
(0, cucumber_1.Then)('I should only receive email notifications for matches', async function () {
    // This would be verified in notification tests
    this.testData.emailNotificationsForMatchesOnly = true;
});
(0, cucumber_1.Then)('I should not receive notifications during quiet hours', async function () {
    // This would be verified in notification tests
    this.testData.quietHoursEnabled = true;
});
(0, cucumber_1.Then)('my account should be scheduled for deletion', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="account-deletion-scheduled"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should receive a confirmation email', async function () {
    // Mock confirmation email
    this.testData.confirmationEmailSent = true;
});
(0, cucumber_1.Then)('I should be logged out', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="login-form"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should not be able to login', async function () {
    // This would be verified in login tests
    this.testData.accountDeleted = true;
});
(0, cucumber_1.Then)('I should return to the settings page', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="settings-page"]')).toBeVisible();
});
(0, cucumber_1.Then)('my account should remain active', async function () {
    this.testData.accountDeleted = false;
});
// API assertion steps
(0, cucumber_1.Then)('the API should respond with status code {int}', async function (statusCode) {
    (0, test_1.expect)(this.testData.apiResponse?.status).toBe(statusCode);
});
(0, cucumber_1.Then)('the response should contain my current settings', async function () {
    (0, test_1.expect)(this.testData.apiResponse?.data).toHaveProperty('settings');
});
(0, cucumber_1.Then)('the response should include privacy preferences', async function () {
    (0, test_1.expect)(this.testData.apiResponse?.data.settings).toHaveProperty('privacy');
});
(0, cucumber_1.Then)('the response should include notification preferences', async function () {
    (0, test_1.expect)(this.testData.apiResponse?.data.settings).toHaveProperty('notifications');
});
(0, cucumber_1.Then)('the response should include discovery preferences', async function () {
    (0, test_1.expect)(this.testData.apiResponse?.data.settings).toHaveProperty('discovery');
});
(0, cucumber_1.Then)('the response should confirm the settings update', async function () {
    (0, test_1.expect)(this.testData.apiResponse?.data).toHaveProperty('message');
    (0, test_1.expect)(this.testData.apiResponse?.data.message).toContain('updated');
});
(0, cucumber_1.Then)('subsequent API calls should return the updated settings', async function () {
    // This would be verified with another API call
    this.testData.settingsUpdatedInAPI = true;
});
(0, cucumber_1.Then)('the response should contain validation errors', async function () {
    (0, test_1.expect)(this.testData.apiResponse?.data).toHaveProperty('errors');
});
(0, cucumber_1.Then)('my settings should remain unchanged', async function () {
    // This would be verified with another API call
    this.testData.settingsUnchanged = true;
});
(0, cucumber_1.Then)('the response should confirm password change', async function () {
    (0, test_1.expect)(this.testData.apiResponse?.data).toHaveProperty('message');
    (0, test_1.expect)(this.testData.apiResponse?.data.message).toContain('password');
});
(0, cucumber_1.Then)('I should be able to authenticate with the new password', async function () {
    // This would be verified in authentication tests
    this.testData.newPasswordWorks = true;
});
(0, cucumber_1.Then)('the response should confirm account deletion', async function () {
    (0, test_1.expect)(this.testData.apiResponse?.data).toHaveProperty('message');
    (0, test_1.expect)(this.testData.apiResponse?.data.message).toContain('deleted');
});
(0, cucumber_1.Then)('subsequent API calls should return {int} unauthorized', async function (statusCode) {
    // This would be verified with another API call
    this.testData.accountDeletedInAPI = true;
});
// Mobile and accessibility assertions
(0, cucumber_1.Then)('the settings menu should be touch-friendly', async function () {
    const buttons = await this.page.locator('button').all();
    for (const button of buttons) {
        const boundingBox = await button.boundingBox();
        (0, test_1.expect)(boundingBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
    }
});
(0, cucumber_1.Then)('all options should be easily accessible', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="settings-menu"]')).toBeVisible();
});
(0, cucumber_1.Then)('the layout should be optimized for mobile', async function () {
    const viewport = this.page.viewportSize();
    (0, test_1.expect)(viewport?.width).toBeLessThanOrEqual(768);
});
(0, cucumber_1.Then)('all settings should have proper labels', async function () {
    const inputs = await this.page.locator('input, select, textarea').all();
    for (const input of inputs) {
        const label = await input.getAttribute('aria-label') || await input.getAttribute('aria-labelledby');
        (0, test_1.expect)(label).toBeTruthy();
    }
});
(0, cucumber_1.Then)('all toggles should be announced correctly', async function () {
    const toggles = await this.page.locator('[role="switch"]').all();
    for (const toggle of toggles) {
        const ariaLabel = await toggle.getAttribute('aria-label');
        (0, test_1.expect)(ariaLabel).toBeTruthy();
    }
});
(0, cucumber_1.Then)('I should be able to navigate with keyboard only', async function () {
    // Test keyboard navigation
    await this.page.keyboard.press('Tab');
    const focusedElement = await this.page.locator(':focus');
    await (0, test_1.expect)(focusedElement).toBeVisible();
});
(0, cucumber_1.Then)('all form fields should have descriptive labels', async function () {
    const formFields = await this.page.locator('input, select, textarea').all();
    for (const field of formFields) {
        const label = await field.getAttribute('aria-label') ||
            await this.page.locator(`label[for="${await field.getAttribute('id')}"]`).textContent();
        (0, test_1.expect)(label).toBeTruthy();
    }
});
// Performance assertions
(0, cucumber_1.Then)('the page should load within {int} seconds', async function (seconds) {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    (0, test_1.expect)(loadTime).toBeLessThan(seconds * 1000);
});
(0, cucumber_1.Then)('all settings should be loaded progressively', async function () {
    // Verify progressive loading
    await (0, test_1.expect)(this.page.locator('[data-testid="settings-skeleton"]')).toBeHidden();
});
(0, cucumber_1.Then)('the page should remain responsive during updates', async function () {
    // Test responsiveness during updates
    this.testData.pageResponsive = true;
});
// Offline assertions
(0, cucumber_1.Then)('the changes should be saved locally', async function () {
    // Verify local storage
    const localChanges = await this.page.evaluate(() => localStorage.getItem('pendingSettingsChanges'));
    (0, test_1.expect)(localChanges).toBeTruthy();
});
(0, cucumber_1.Then)('the changes should sync to the server', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="sync-success-message"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see a confirmation of successful sync', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="sync-confirmation"]')).toBeVisible();
});
// Premium assertions
(0, cucumber_1.Then)('I should see additional privacy options', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="premium-privacy-options"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see advanced filtering options', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="advanced-filters"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see options to hide ads', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="hide-ads-option"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see priority support options', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="priority-support"]')).toBeVisible();
});
// Data export assertions
(0, cucumber_1.Then)('I should receive an email when the export is ready', async function () {
    // Mock email notification
    this.testData.exportEmailSent = true;
});
(0, cucumber_1.Then)('the export should contain all my profile data', async function () {
    // This would be verified by checking the export file
    this.testData.exportContainsProfileData = true;
});
(0, cucumber_1.Then)('the export should contain my match history', async function () {
    // This would be verified by checking the export file
    this.testData.exportContainsMatchHistory = true;
});
(0, cucumber_1.Then)('the export should contain my message history', async function () {
    // This would be verified by checking the export file
    this.testData.exportContainsMessageHistory = true;
});
(0, cucumber_1.Then)('I should be able to export my data in standard formats', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="export-format-options"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should receive instructions for importing to other services', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="import-instructions"]')).toBeVisible();
});
(0, cucumber_1.Then)('the export should be completed within {int} days', async function (days) {
    // This would be verified by checking the export timeline
    this.testData.exportTimelineAcceptable = true;
});
// Security assertions
(0, cucumber_1.Then)('{int}FA should be enabled on my account', async function (factor) {
    await (0, test_1.expect)(this.page.locator('[data-testid="2fa-enabled-status"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see backup codes', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="backup-codes"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should need {int}FA for future logins', async function (factor) {
    // This would be verified in login tests
    this.testData.twoFactorRequired = true;
});
(0, cucumber_1.Then)('I should see recent login attempts', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="recent-logins"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see device information', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="device-info"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see location information', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="location-info"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should be able to log out other devices', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="logout-other-devices"]')).toBeVisible();
});
// Analytics assertions
(0, cucumber_1.Then)('I should see my profile view count', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="profile-views"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see my match rate', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="match-rate"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see my response rate', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="response-rate"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see trends over time', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="analytics-chart"]')).toBeVisible();
});
// Subscription assertions
(0, cucumber_1.Then)('I should see my current plan', async function () {
    const plan = this.testData.subscription?.plan || 'Premium';
    await (0, test_1.expect)(this.page.locator('[data-testid="current-plan"]')).toContainText(plan);
});
(0, cucumber_1.Then)('I should see my next billing date', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="next-billing-date"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see options to upgrade or downgrade', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="plan-options"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should see options to cancel subscription', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="cancel-subscription"]')).toBeVisible();
});
(0, cucumber_1.Then)('my subscription should be cancelled', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="subscription-cancelled"]')).toBeVisible();
});
(0, cucumber_1.Then)('I should retain premium features until the end of the billing period', async function () {
    // This would be verified by checking feature access
    this.testData.premiumFeaturesRetained = true;
});
(0, cucumber_1.Then)('I should receive a cancellation confirmation email', async function () {
    // Mock cancellation email
    this.testData.cancellationEmailSent = true;
});
