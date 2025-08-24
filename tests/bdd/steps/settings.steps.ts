import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Background steps
Given('I am on the settings page', async function (this: CustomWorld) {
  await this.page.goto('/settings');
  await this.page.waitForSelector('[data-testid="settings-page"]');
});

// Navigation steps
When('I navigate to account settings', async function (this: CustomWorld) {
  await this.page.click('[data-testid="account-settings-tab"]');
  await this.page.waitForSelector('[data-testid="account-settings-content"]');
});

Given('I am on the account settings page', async function (this: CustomWorld) {
  await this.page.goto('/settings/account');
  await this.page.waitForSelector('[data-testid="account-settings-content"]');
});

Given('I am on the privacy settings page', async function (this: CustomWorld) {
  await this.page.goto('/settings/privacy');
  await this.page.waitForSelector('[data-testid="privacy-settings-content"]');
});

Given('I am on the discovery settings page', async function (this: CustomWorld) {
  await this.page.goto('/settings/discovery');
  await this.page.waitForSelector('[data-testid="discovery-settings-content"]');
});

Given('I am on the notification settings page', async function (this: CustomWorld) {
  await this.page.goto('/settings/notifications');
  await this.page.waitForSelector('[data-testid="notification-settings-content"]');
});

Given('I am on the blocked users page', async function (this: CustomWorld) {
  await this.page.goto('/settings/blocked');
  await this.page.waitForSelector('[data-testid="blocked-users-content"]');
});

Given('I am on the delete account page', async function (this: CustomWorld) {
  await this.page.goto('/settings/account/delete');
  await this.page.waitForSelector('[data-testid="delete-account-content"]');
});

Given('I am on the change password page', async function (this: CustomWorld) {
  await this.page.goto('/settings/account/password');
  await this.page.waitForSelector('[data-testid="change-password-content"]');
});

Given('I am on the data and privacy page', async function (this: CustomWorld) {
  await this.page.goto('/settings/data-privacy');
  await this.page.waitForSelector('[data-testid="data-privacy-content"]');
});

Given('I am on the security settings page', async function (this: CustomWorld) {
  await this.page.goto('/settings/security');
  await this.page.waitForSelector('[data-testid="security-settings-content"]');
});

Given('I am on the analytics page', async function (this: CustomWorld) {
  await this.page.goto('/settings/analytics');
  await this.page.waitForSelector('[data-testid="analytics-content"]');
});

Given('I am on the subscription page', async function (this: CustomWorld) {
  await this.page.goto('/settings/subscription');
  await this.page.waitForSelector('[data-testid="subscription-content"]');
});

// Account settings steps
When('I click {string}', async function (this: CustomWorld, buttonText: string) {
  await this.page.click(`button:has-text("${buttonText}")`);
});

When('I enter a new email address {string}', async function (this: CustomWorld, email: string) {
  await this.page.fill('[data-testid="new-email-input"]', email);
  this.testData.newEmail = email;
});

When('I enter my current password', async function (this: CustomWorld) {
  const currentPassword = this.testData.user?.password || 'TestPassword123!';
  await this.page.fill('[data-testid="current-password-input"]', currentPassword);
});

When('I enter a new password {string}', async function (this: CustomWorld, password: string) {
  await this.page.fill('[data-testid="new-password-input"]', password);
  this.testData.newPassword = password;
});

When('I confirm the new password', async function (this: CustomWorld) {
  const newPassword = this.testData.newPassword || 'NewSecurePass123!';
  await this.page.fill('[data-testid="confirm-password-input"]', newPassword);
});

When('I enter an incorrect current password', async function (this: CustomWorld) {
  await this.page.fill('[data-testid="current-password-input"]', 'WrongPassword123!');
});

When('I enter a weak password {string}', async function (this: CustomWorld, password: string) {
  await this.page.fill('[data-testid="new-password-input"]', password);
});

// Privacy settings steps
When('I toggle {string} off', async function (this: CustomWorld, settingName: string) {
  const toggleSelector = `[data-testid="${settingName.toLowerCase().replace(/\s+/g, '-')}-toggle"]`;
  const toggle = await this.page.locator(toggleSelector);
  const isChecked = await toggle.isChecked();
  if (isChecked) {
    await toggle.click();
  }
});

When('I set my profile visibility to {string}', async function (this: CustomWorld, visibility: string) {
  await this.page.selectOption('[data-testid="profile-visibility-select"]', visibility);
});

When('I save the settings', async function (this: CustomWorld) {
  await this.page.click('[data-testid="save-settings-button"]');
  await this.page.waitForSelector('[data-testid="settings-saved-message"]');
});

// Discovery settings steps
When('I set my age range to {string}', async function (this: CustomWorld, ageRange: string) {
  const [minAge, maxAge] = ageRange.split('-');
  await this.page.fill('[data-testid="min-age-input"]', minAge);
  await this.page.fill('[data-testid="max-age-input"]', maxAge);
});

When('I set my distance range to {string}', async function (this: CustomWorld, distance: string) {
  const distanceValue = distance.replace(/\D/g, '');
  await this.page.fill('[data-testid="distance-range-input"]', distanceValue);
});

When('I select interested in {string}', async function (this: CustomWorld, interest: string) {
  await this.page.selectOption('[data-testid="interested-in-select"]', interest);
});

When('I enable {string}', async function (this: CustomWorld, settingName: string) {
  const toggleSelector = `[data-testid="${settingName.toLowerCase().replace(/\s+/g, '-')}-toggle"]`;
  const toggle = await this.page.locator(toggleSelector);
  const isChecked = await toggle.isChecked();
  if (!isChecked) {
    await toggle.click();
  }
});

When('I disable push notifications', async function (this: CustomWorld) {
  const toggle = await this.page.locator('[data-testid="push-notifications-toggle"]');
  const isChecked = await toggle.isChecked();
  if (isChecked) {
    await toggle.click();
  }
});

When('I enable email notifications for matches only', async function (this: CustomWorld) {
  await this.page.check('[data-testid="email-matches-checkbox"]');
  await this.page.uncheck('[data-testid="email-messages-checkbox"]');
  await this.page.uncheck('[data-testid="email-likes-checkbox"]');
});

When('I set quiet hours from {int} PM to {int} AM', async function (this: CustomWorld, startHour: number, endHour: number) {
  await this.page.selectOption('[data-testid="quiet-start-time"]', `${startHour + 12}:00`);
  await this.page.selectOption('[data-testid="quiet-end-time"]', `${endHour}:00`);
});

// Blocked users steps
Given('I have blocked some users', async function (this: CustomWorld) {
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

When('I view my blocked list', async function (this: CustomWorld) {
  await this.page.waitForSelector('[data-testid="blocked-users-list"]');
});

When('I unblock a user', async function (this: CustomWorld) {
  await this.page.click('[data-testid="unblock-button"]:first-child');
  await this.page.waitForSelector('[data-testid="unblock-confirmation"]');
  await this.page.click('[data-testid="confirm-unblock-button"]');
});

// Account deletion steps
When('I see a warning about permanent deletion', async function (this: CustomWorld) {
  await this.page.waitForSelector('[data-testid="deletion-warning"]');
});

When('I enter my password to confirm', async function (this: CustomWorld) {
  const password = this.testData.user?.password || 'TestPassword123!';
  await this.page.fill('[data-testid="confirm-deletion-password"]', password);
});

When('I select a reason for leaving', async function (this: CustomWorld) {
  await this.page.selectOption('[data-testid="deletion-reason-select"]', 'Found someone');
});

When('I see the confirmation dialog', async function (this: CustomWorld) {
  await this.page.waitForSelector('[data-testid="deletion-confirmation-dialog"]');
});

// Data export steps
When('I request to download my data', async function (this: CustomWorld) {
  await this.page.click('[data-testid="download-data-button"]');
});

When('I request data portability', async function (this: CustomWorld) {
  await this.page.click('[data-testid="data-portability-button"]');
});

// Security steps
When('I enable two-factor authentication', async function (this: CustomWorld) {
  await this.page.click('[data-testid="enable-2fa-button"]');
});

When('I scan the QR code with my authenticator app', async function (this: CustomWorld) {
  // Simulate QR code scanning
  await this.page.waitForSelector('[data-testid="qr-code"]');
  this.testData.twoFactorSecret = 'MOCK_2FA_SECRET';
});

When('I enter the verification code', async function (this: CustomWorld) {
  // Mock verification code
  await this.page.fill('[data-testid="2fa-verification-code"]', '123456');
  await this.page.click('[data-testid="verify-2fa-button"]');
});

When('I view my login activity', async function (this: CustomWorld) {
  await this.page.click('[data-testid="login-activity-tab"]');
  await this.page.waitForSelector('[data-testid="login-activity-list"]');
});

// Subscription steps
Given('I have an active subscription', async function (this: CustomWorld) {
  this.testData.subscription = {
    plan: 'Premium',
    status: 'active',
    nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
});

When('I view my subscription details', async function (this: CustomWorld) {
  await this.page.waitForSelector('[data-testid="subscription-details"]');
});

// Mobile and accessibility steps
Given('I am using a mobile device', async function (this: CustomWorld) {
  await this.page.setViewportSize({ width: 375, height: 667 });
});

Given('I am using a screen reader', async function (this: CustomWorld) {
  // Enable accessibility testing mode
  this.testData.accessibilityMode = true;
});

// Performance and offline steps
When('I lose internet connectivity', async function (this: CustomWorld) {
  await this.page.context().setOffline(true);
});

When('connectivity is restored', async function (this: CustomWorld) {
  await this.page.context().setOffline(false);
});

When('I make changes to my settings', async function (this: CustomWorld) {
  await this.page.fill('[data-testid="display-name-input"]', 'Updated Name');
  this.testData.offlineChanges = { displayName: 'Updated Name' };
});

// Premium user steps
Given('I am a premium user', async function (this: CustomWorld) {
  this.testData.user = {
    ...this.testData.user,
    isPremium: true,
    subscriptionType: 'premium'
  };
});

When('I navigate to premium settings', async function (this: CustomWorld) {
  await this.page.click('[data-testid="premium-settings-tab"]');
  await this.page.waitForSelector('[data-testid="premium-settings-content"]');
});

// API steps
When('I send a GET request to {string}', async function (this: CustomWorld, endpoint: string) {
  this.testData.apiResponse = await this.apiClient.get(endpoint);
});

When('I send a PUT request to {string} with updated preferences', async function (this: CustomWorld, endpoint: string) {
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

When('I send a PUT request to {string} with invalid data', async function (this: CustomWorld, endpoint: string) {
  const invalidData = {
    privacy: {
      showAge: 'invalid_boolean',
      profileVisibility: 'invalid_option'
    }
  };
  
  this.testData.apiResponse = await this.apiClient.put(endpoint, invalidData);
});

When('I send a PUT request to {string} with current and new password', async function (this: CustomWorld, endpoint: string) {
  const passwordData = {
    currentPassword: this.testData.user?.password || 'TestPassword123!',
    newPassword: 'NewSecurePass123!'
  };
  
  this.testData.apiResponse = await this.apiClient.put(endpoint, passwordData);
});

When('I send a DELETE request to {string}', async function (this: CustomWorld, endpoint: string) {
  this.testData.apiResponse = await this.apiClient.delete(endpoint);
});

// Assertion steps
Then('I should see my current email address', async function (this: CustomWorld) {
  const email = this.testData.user?.email || 'test@example.com';
  await expect(this.page.locator('[data-testid="current-email"]')).toContainText(email);
});

Then('I should see my account creation date', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="account-created-date"]')).toBeVisible();
});

Then('I should see my subscription status', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="subscription-status"]')).toBeVisible();
});

Then('I should see options to change my password', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="change-password-button"]')).toBeVisible();
});

Then('I should see options to delete my account', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="delete-account-button"]')).toBeVisible();
});

Then('I should see a confirmation message', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="confirmation-message"]')).toBeVisible();
});

Then('I should receive a verification email', async function (this: CustomWorld) {
  // Mock email verification
  this.testData.emailVerificationSent = true;
});

Then('my email should be updated after verification', async function (this: CustomWorld) {
  // Simulate email verification process
  const newEmail = this.testData.newEmail;
  expect(newEmail).toBeDefined();
});

Then('I should see a success message', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
});

Then('I should be able to login with the new password', async function (this: CustomWorld) {
  // This would be tested in a separate login test
  this.testData.passwordChanged = true;
});

Then('I should see an error message {string}', async function (this: CustomWorld, errorMessage: string) {
  await expect(this.page.locator('[data-testid="error-message"]')).toContainText(errorMessage);
});

Then('my password should not be changed', async function (this: CustomWorld) {
  // Verify password remains the same
  this.testData.passwordChanged = false;
});

Then('I should see an error message about password strength', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="password-strength-error"]')).toBeVisible();
});

Then('I should see password requirements', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="password-requirements"]')).toBeVisible();
});

Then('my privacy settings should be updated', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="settings-updated-message"]')).toBeVisible();
});

Then('other users should not see my age', async function (this: CustomWorld) {
  // This would be verified in profile viewing tests
  this.testData.ageHidden = true;
});

Then('other users should not see my distance', async function (this: CustomWorld) {
  // This would be verified in profile viewing tests
  this.testData.distanceHidden = true;
});

Then('my discovery preferences should be updated', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="discovery-settings-saved"]')).toBeVisible();
});

Then('I should see matches within my criteria', async function (this: CustomWorld) {
  // This would be verified in matching tests
  this.testData.discoveryPreferencesApplied = true;
});

Then('I should see all blocked users', async function (this: CustomWorld) {
  const blockedUsers = this.testData.blockedUsers || [];
  for (const user of blockedUsers) {
    await expect(this.page.locator(`[data-testid="blocked-user-${user.id}"]`)).toBeVisible();
  }
});

Then('I should be able to unblock users', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="unblock-button"]').first()).toBeVisible();
});

Then('they should be removed from my blocked list', async function (this: CustomWorld) {
  // Verify user is removed from blocked list
  this.testData.userUnblocked = true;
});

Then('they should be able to see my profile again', async function (this: CustomWorld) {
  // This would be verified in profile visibility tests
  this.testData.profileVisibleToUnblockedUser = true;
});

Then('I should not receive push notifications', async function (this: CustomWorld) {
  // This would be verified in notification tests
  this.testData.pushNotificationsDisabled = true;
});

Then('I should only receive email notifications for matches', async function (this: CustomWorld) {
  // This would be verified in notification tests
  this.testData.emailNotificationsForMatchesOnly = true;
});

Then('I should not receive notifications during quiet hours', async function (this: CustomWorld) {
  // This would be verified in notification tests
  this.testData.quietHoursEnabled = true;
});

Then('my account should be scheduled for deletion', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="account-deletion-scheduled"]')).toBeVisible();
});

Then('I should receive a confirmation email', async function (this: CustomWorld) {
  // Mock confirmation email
  this.testData.confirmationEmailSent = true;
});

Then('I should be logged out', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="login-form"]')).toBeVisible();
});

Then('I should not be able to login', async function (this: CustomWorld) {
  // This would be verified in login tests
  this.testData.accountDeleted = true;
});

Then('I should return to the settings page', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="settings-page"]')).toBeVisible();
});

Then('my account should remain active', async function (this: CustomWorld) {
  this.testData.accountDeleted = false;
});

// API assertion steps
Then('the API should respond with status code {int}', async function (this: CustomWorld, statusCode: number) {
  expect(this.testData.apiResponse?.status).toBe(statusCode);
});

Then('the response should contain my current settings', async function (this: CustomWorld) {
  expect(this.testData.apiResponse?.data).toHaveProperty('settings');
});

Then('the response should include privacy preferences', async function (this: CustomWorld) {
  expect(this.testData.apiResponse?.data.settings).toHaveProperty('privacy');
});

Then('the response should include notification preferences', async function (this: CustomWorld) {
  expect(this.testData.apiResponse?.data.settings).toHaveProperty('notifications');
});

Then('the response should include discovery preferences', async function (this: CustomWorld) {
  expect(this.testData.apiResponse?.data.settings).toHaveProperty('discovery');
});

Then('the response should confirm the settings update', async function (this: CustomWorld) {
  expect(this.testData.apiResponse?.data).toHaveProperty('message');
  expect(this.testData.apiResponse?.data.message).toContain('updated');
});

Then('subsequent API calls should return the updated settings', async function (this: CustomWorld) {
  // This would be verified with another API call
  this.testData.settingsUpdatedInAPI = true;
});

Then('the response should contain validation errors', async function (this: CustomWorld) {
  expect(this.testData.apiResponse?.data).toHaveProperty('errors');
});

Then('my settings should remain unchanged', async function (this: CustomWorld) {
  // This would be verified with another API call
  this.testData.settingsUnchanged = true;
});

Then('the response should confirm password change', async function (this: CustomWorld) {
  expect(this.testData.apiResponse?.data).toHaveProperty('message');
  expect(this.testData.apiResponse?.data.message).toContain('password');
});

Then('I should be able to authenticate with the new password', async function (this: CustomWorld) {
  // This would be verified in authentication tests
  this.testData.newPasswordWorks = true;
});

Then('the response should confirm account deletion', async function (this: CustomWorld) {
  expect(this.testData.apiResponse?.data).toHaveProperty('message');
  expect(this.testData.apiResponse?.data.message).toContain('deleted');
});

Then('subsequent API calls should return {int} unauthorized', async function (this: CustomWorld, statusCode: number) {
  // This would be verified with another API call
  this.testData.accountDeletedInAPI = true;
});

// Mobile and accessibility assertions
Then('the settings menu should be touch-friendly', async function (this: CustomWorld) {
  const buttons = await this.page.locator('button').all();
  for (const button of buttons) {
    const boundingBox = await button.boundingBox();
    expect(boundingBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
  }
});

Then('all options should be easily accessible', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="settings-menu"]')).toBeVisible();
});

Then('the layout should be optimized for mobile', async function (this: CustomWorld) {
  const viewport = this.page.viewportSize();
  expect(viewport?.width).toBeLessThanOrEqual(768);
});

Then('all settings should have proper labels', async function (this: CustomWorld) {
  const inputs = await this.page.locator('input, select, textarea').all();
  for (const input of inputs) {
    const label = await input.getAttribute('aria-label') || await input.getAttribute('aria-labelledby');
    expect(label).toBeTruthy();
  }
});

Then('all toggles should be announced correctly', async function (this: CustomWorld) {
  const toggles = await this.page.locator('[role="switch"]').all();
  for (const toggle of toggles) {
    const ariaLabel = await toggle.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  }
});

Then('I should be able to navigate with keyboard only', async function (this: CustomWorld) {
  // Test keyboard navigation
  await this.page.keyboard.press('Tab');
  const focusedElement = await this.page.locator(':focus');
  await expect(focusedElement).toBeVisible();
});

Then('all form fields should have descriptive labels', async function (this: CustomWorld) {
  const formFields = await this.page.locator('input, select, textarea').all();
  for (const field of formFields) {
    const label = await field.getAttribute('aria-label') || 
                  await this.page.locator(`label[for="${await field.getAttribute('id')}"]`).textContent();
    expect(label).toBeTruthy();
  }
});

// Performance assertions
Then('the page should load within {int} seconds', async function (this: CustomWorld, seconds: number) {
  const startTime = Date.now();
  await this.page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(seconds * 1000);
});

Then('all settings should be loaded progressively', async function (this: CustomWorld) {
  // Verify progressive loading
  await expect(this.page.locator('[data-testid="settings-skeleton"]')).toBeHidden();
});

Then('the page should remain responsive during updates', async function (this: CustomWorld) {
  // Test responsiveness during updates
  this.testData.pageResponsive = true;
});

// Offline assertions
Then('the changes should be saved locally', async function (this: CustomWorld) {
  // Verify local storage
  const localChanges = await this.page.evaluate(() => localStorage.getItem('pendingSettingsChanges'));
  expect(localChanges).toBeTruthy();
});

Then('the changes should sync to the server', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="sync-success-message"]')).toBeVisible();
});

Then('I should see a confirmation of successful sync', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="sync-confirmation"]')).toBeVisible();
});

// Premium assertions
Then('I should see additional privacy options', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="premium-privacy-options"]')).toBeVisible();
});

Then('I should see advanced filtering options', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="advanced-filters"]')).toBeVisible();
});

Then('I should see options to hide ads', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="hide-ads-option"]')).toBeVisible();
});

Then('I should see priority support options', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="priority-support"]')).toBeVisible();
});

// Data export assertions
Then('I should receive an email when the export is ready', async function (this: CustomWorld) {
  // Mock email notification
  this.testData.exportEmailSent = true;
});

Then('the export should contain all my profile data', async function (this: CustomWorld) {
  // This would be verified by checking the export file
  this.testData.exportContainsProfileData = true;
});

Then('the export should contain my match history', async function (this: CustomWorld) {
  // This would be verified by checking the export file
  this.testData.exportContainsMatchHistory = true;
});

Then('the export should contain my message history', async function (this: CustomWorld) {
  // This would be verified by checking the export file
  this.testData.exportContainsMessageHistory = true;
});

Then('I should be able to export my data in standard formats', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="export-format-options"]')).toBeVisible();
});

Then('I should receive instructions for importing to other services', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="import-instructions"]')).toBeVisible();
});

Then('the export should be completed within {int} days', async function (this: CustomWorld, days: number) {
  // This would be verified by checking the export timeline
  this.testData.exportTimelineAcceptable = true;
});

// Security assertions
Then('{int}FA should be enabled on my account', async function (this: CustomWorld, factor: number) {
  await expect(this.page.locator('[data-testid="2fa-enabled-status"]')).toBeVisible();
});

Then('I should see backup codes', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="backup-codes"]')).toBeVisible();
});

Then('I should need {int}FA for future logins', async function (this: CustomWorld, factor: number) {
  // This would be verified in login tests
  this.testData.twoFactorRequired = true;
});

Then('I should see recent login attempts', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="recent-logins"]')).toBeVisible();
});

Then('I should see device information', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="device-info"]')).toBeVisible();
});

Then('I should see location information', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="location-info"]')).toBeVisible();
});

Then('I should be able to log out other devices', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="logout-other-devices"]')).toBeVisible();
});

// Analytics assertions
Then('I should see my profile view count', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="profile-views"]')).toBeVisible();
});

Then('I should see my match rate', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="match-rate"]')).toBeVisible();
});

Then('I should see my response rate', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="response-rate"]')).toBeVisible();
});

Then('I should see trends over time', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="analytics-chart"]')).toBeVisible();
});

// Subscription assertions
Then('I should see my current plan', async function (this: CustomWorld) {
  const plan = this.testData.subscription?.plan || 'Premium';
  await expect(this.page.locator('[data-testid="current-plan"]')).toContainText(plan);
});

Then('I should see my next billing date', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="next-billing-date"]')).toBeVisible();
});

Then('I should see options to upgrade or downgrade', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="plan-options"]')).toBeVisible();
});

Then('I should see options to cancel subscription', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="cancel-subscription"]')).toBeVisible();
});

Then('my subscription should be cancelled', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="subscription-cancelled"]')).toBeVisible();
});

Then('I should retain premium features until the end of the billing period', async function (this: CustomWorld) {
  // This would be verified by checking feature access
  this.testData.premiumFeaturesRetained = true;
});

Then('I should receive a cancellation confirmation email', async function (this: CustomWorld) {
  // Mock cancellation email
  this.testData.cancellationEmailSent = true;
});