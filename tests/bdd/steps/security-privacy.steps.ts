import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@jest/globals';
import { Page } from 'playwright';
import { World } from '../support/world';

// Background steps
Given('I am a registered user', async function (this: World) {
  // Create a test user in the database
  this.testUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    password: 'SecurePass123!',
    name: 'Test User',
    age: 25,
    verified: true,
    twoFactorEnabled: false,
    accountLocked: false,
    failedLoginAttempts: 0
  };
  
  // Mock user creation in database
  await this.mockDatabase.users.create(this.testUser);
});

Given('I am logged into the app', async function (this: World) {
  // Simulate login process
  await this.page.goto('/login');
  await this.page.fill('[data-testid="email-input"]', this.testUser.email);
  await this.page.fill('[data-testid="password-input"]', this.testUser.password);
  await this.page.click('[data-testid="login-button"]');
  
  // Wait for successful login
  await this.page.waitForURL('/dashboard');
  
  // Store session token
  this.sessionToken = await this.page.evaluate(() => localStorage.getItem('authToken'));
});

// Authentication scenarios
Given('I am on the login page', async function (this: World) {
  await this.page.goto('/login');
  await this.page.waitForSelector('[data-testid="login-form"]');
});

When('I enter valid credentials', async function (this: World) {
  await this.page.fill('[data-testid="email-input"]', this.testUser.email);
  await this.page.fill('[data-testid="password-input"]', this.testUser.password);
});

When('I enter invalid credentials', async function (this: World) {
  await this.page.fill('[data-testid="email-input"]', 'invalid@example.com');
  await this.page.fill('[data-testid="password-input"]', 'wrongpassword');
});

When('I click {string}', async function (this: World, buttonText: string) {
  const buttonMap: { [key: string]: string } = {
    'Login': '[data-testid="login-button"]',
    'Logout': '[data-testid="logout-button"]',
    'Block User': '[data-testid="block-user-button"]',
    'Report User': '[data-testid="report-user-button"]'
  };
  
  const selector = buttonMap[buttonText] || `button:has-text("${buttonText}")`;
  await this.page.click(selector);
});

Then('I should be logged in successfully', async function (this: World) {
  await this.page.waitForURL('/dashboard');
  const authToken = await this.page.evaluate(() => localStorage.getItem('authToken'));
  expect(authToken).toBeTruthy();
});

Then('I should see my dashboard', async function (this: World) {
  await this.page.waitForSelector('[data-testid="dashboard"]');
  const dashboardVisible = await this.page.isVisible('[data-testid="dashboard"]');
  expect(dashboardVisible).toBe(true);
});

Then('my session should be secure', async function (this: World) {
  // Check for secure session attributes
  const cookies = await this.page.context().cookies();
  const sessionCookie = cookies.find(cookie => cookie.name === 'session');
  
  if (sessionCookie) {
    expect(sessionCookie.secure).toBe(true);
    expect(sessionCookie.httpOnly).toBe(true);
    expect(sessionCookie.sameSite).toBe('Strict');
  }
});

Then('I should see an error message {string}', async function (this: World, expectedMessage: string) {
  await this.page.waitForSelector('[data-testid="error-message"]');
  const errorMessage = await this.page.textContent('[data-testid="error-message"]');
  expect(errorMessage).toContain(expectedMessage);
});

Then('I should remain on the login page', async function (this: World) {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/login');
});

Then('no session should be created', async function (this: World) {
  const authToken = await this.page.evaluate(() => localStorage.getItem('authToken'));
  expect(authToken).toBeFalsy();
});

// Account lockout scenarios
When('I enter invalid credentials {int} times', async function (this: World, attempts: number) {
  for (let i = 0; i < attempts; i++) {
    await this.page.fill('[data-testid="email-input"]', this.testUser.email);
    await this.page.fill('[data-testid="password-input"]', 'wrongpassword');
    await this.page.click('[data-testid="login-button"]');
    
    if (i < attempts - 1) {
      await this.page.waitForSelector('[data-testid="error-message"]');
      await this.page.reload();
    }
  }
});

Then('my account should be temporarily locked', async function (this: World) {
  // Check if account is locked in database
  const user = await this.mockDatabase.users.findById(this.testUser.id);
  expect(user.accountLocked).toBe(true);
  expect(user.lockoutExpiry).toBeTruthy();
});

Then('I should see a lockout message', async function (this: World) {
  await this.page.waitForSelector('[data-testid="lockout-message"]');
  const lockoutMessage = await this.page.textContent('[data-testid="lockout-message"]');
  expect(lockoutMessage).toContain('Account temporarily locked');
});

Then('I should not be able to login for {int} minutes', async function (this: World, minutes: number) {
  // Verify lockout duration
  const user = await this.mockDatabase.users.findById(this.testUser.id);
  const lockoutExpiry = new Date(user.lockoutExpiry);
  const expectedExpiry = new Date(Date.now() + minutes * 60 * 1000);
  
  expect(lockoutExpiry.getTime()).toBeCloseTo(expectedExpiry.getTime(), -4); // Within 10 seconds
});

// Two-factor authentication scenarios
Given('I have 2FA enabled on my account', async function (this: World) {
  this.testUser.twoFactorEnabled = true;
  this.testUser.twoFactorSecret = 'JBSWY3DPEHPK3PXP';
  await this.mockDatabase.users.update(this.testUser.id, this.testUser);
});

Then('I should be prompted for 2FA code', async function (this: World) {
  await this.page.waitForSelector('[data-testid="2fa-input"]');
  const twoFAVisible = await this.page.isVisible('[data-testid="2fa-input"]');
  expect(twoFAVisible).toBe(true);
});

Given('I am on the 2FA verification page', async function (this: World) {
  await this.page.goto('/login/2fa');
  await this.page.waitForSelector('[data-testid="2fa-form"]');
});

When('I enter the correct 2FA code', async function (this: World) {
  // Generate valid TOTP code
  const validCode = this.generateTOTP(this.testUser.twoFactorSecret);
  await this.page.fill('[data-testid="2fa-input"]', validCode);
  await this.page.click('[data-testid="verify-2fa-button"]');
});

When('I enter an invalid 2FA code', async function (this: World) {
  await this.page.fill('[data-testid="2fa-input"]', '000000');
  await this.page.click('[data-testid="verify-2fa-button"]');
});

Then('I should remain on the 2FA page', async function (this: World) {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/login/2fa');
});

Then('I should not be logged in', async function (this: World) {
  const authToken = await this.page.evaluate(() => localStorage.getItem('authToken'));
  expect(authToken).toBeFalsy();
});

// Session management scenarios
When('I remain inactive for {int} minutes', async function (this: World, minutes: number) {
  // Mock session timeout
  await this.page.evaluate((timeoutMinutes) => {
    const expiryTime = Date.now() - (timeoutMinutes * 60 * 1000);
    localStorage.setItem('sessionExpiry', expiryTime.toString());
  }, minutes);
  
  // Trigger session check
  await this.page.reload();
});

Then('my session should expire', async function (this: World) {
  const authToken = await this.page.evaluate(() => localStorage.getItem('authToken'));
  expect(authToken).toBeFalsy();
});

Then('I should be redirected to the login page', async function (this: World) {
  await this.page.waitForURL('/login');
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/login');
});

Then('I should see a session timeout message', async function (this: World) {
  await this.page.waitForSelector('[data-testid="session-timeout-message"]');
  const timeoutMessage = await this.page.textContent('[data-testid="session-timeout-message"]');
  expect(timeoutMessage).toContain('Session expired');
});

Then('I should be logged out', async function (this: World) {
  const authToken = await this.page.evaluate(() => localStorage.getItem('authToken'));
  expect(authToken).toBeFalsy();
});

Then('my session should be invalidated', async function (this: World) {
  // Check session invalidation on server
  const response = await this.apiClient.get('/api/auth/verify', {
    headers: { Authorization: `Bearer ${this.sessionToken}` }
  });
  expect(response.status).toBe(401);
});

Then('I should not be able to access protected pages', async function (this: World) {
  await this.page.goto('/dashboard');
  await this.page.waitForURL('/login');
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/login');
});

// Multiple device sessions
Given('I am logged in on device A', async function (this: World) {
  this.deviceASessions = await this.createSession('device-a');
});

When('I login on device B', async function (this: World) {
  this.deviceBSessions = await this.createSession('device-b');
});

Then('I should be logged in on both devices', async function (this: World) {
  expect(this.deviceASessions.valid).toBe(true);
  expect(this.deviceBSessions.valid).toBe(true);
});

When('I logout from device A', async function (this: World) {
  await this.invalidateSession(this.deviceASessions.token);
});

Then('I should remain logged in on device B', async function (this: World) {
  const sessionValid = await this.verifySession(this.deviceBSessions.token);
  expect(sessionValid).toBe(true);
});

Then('device A session should be invalidated', async function (this: World) {
  const sessionValid = await this.verifySession(this.deviceASessions.token);
  expect(sessionValid).toBe(false);
});

// Privacy settings scenarios
Given('I am on my profile settings', async function (this: World) {
  await this.page.goto('/settings/profile');
  await this.page.waitForSelector('[data-testid="profile-settings"]');
});

Given('I am on my privacy settings', async function (this: World) {
  await this.page.goto('/settings/privacy');
  await this.page.waitForSelector('[data-testid="privacy-settings"]');
});

When('I set my profile visibility to {string}', async function (this: World, visibility: string) {
  await this.page.selectOption('[data-testid="profile-visibility-select"]', visibility.toLowerCase());
});

When('I save the settings', async function (this: World) {
  await this.page.click('[data-testid="save-settings-button"]');
  await this.page.waitForSelector('[data-testid="settings-saved-message"]');
});

Then('my profile should not be visible to other users', async function (this: World) {
  const user = await this.mockDatabase.users.findById(this.testUser.id);
  expect(user.profileVisibility).toBe('private');
});

Then('I should not appear in discovery', async function (this: World) {
  const discoveryUsers = await this.mockDatabase.discovery.getVisibleUsers();
  const userInDiscovery = discoveryUsers.find(u => u.id === this.testUser.id);
  expect(userInDiscovery).toBeUndefined();
});

Then('only matched users should see my profile', async function (this: World) {
  // Test profile visibility for matched vs unmatched users
  const matchedUser = await this.createTestUser('matched-user');
  const unmatchedUser = await this.createTestUser('unmatched-user');
  
  await this.mockDatabase.matches.create({
    userId1: this.testUser.id,
    userId2: matchedUser.id,
    status: 'matched'
  });
  
  const profileForMatched = await this.getProfileVisibility(this.testUser.id, matchedUser.id);
  const profileForUnmatched = await this.getProfileVisibility(this.testUser.id, unmatchedUser.id);
  
  expect(profileForMatched.visible).toBe(true);
  expect(profileForUnmatched.visible).toBe(false);
});

// Hide specific information
When('I choose to hide my age', async function (this: World) {
  await this.page.check('[data-testid="hide-age-checkbox"]');
});

When('I choose to hide my last seen', async function (this: World) {
  await this.page.check('[data-testid="hide-last-seen-checkbox"]');
});

Then('other users should not see my age', async function (this: World) {
  const otherUser = await this.createTestUser('other-user');
  const profile = await this.getProfileForUser(this.testUser.id, otherUser.id);
  expect(profile.age).toBeUndefined();
});

Then('other users should not see when I was last online', async function (this: World) {
  const otherUser = await this.createTestUser('other-user');
  const profile = await this.getProfileForUser(this.testUser.id, otherUser.id);
  expect(profile.lastSeen).toBeUndefined();
});

Then('my other profile information should remain visible', async function (this: World) {
  const otherUser = await this.createTestUser('other-user');
  const profile = await this.getProfileForUser(this.testUser.id, otherUser.id);
  expect(profile.name).toBeTruthy();
  expect(profile.bio).toBeTruthy();
  expect(profile.photos).toBeTruthy();
});

// Location privacy
When('I disable location sharing', async function (this: World) {
  await this.page.uncheck('[data-testid="location-sharing-checkbox"]');
});

Then('my exact location should not be shared', async function (this: World) {
  const user = await this.mockDatabase.users.findById(this.testUser.id);
  expect(user.shareLocation).toBe(false);
});

Then('other users should not see my distance', async function (this: World) {
  const otherUser = await this.createTestUser('other-user');
  const profile = await this.getProfileForUser(this.testUser.id, otherUser.id);
  expect(profile.distance).toBeUndefined();
});

Then('location-based matching should be disabled', async function (this: World) {
  const matches = await this.mockDatabase.discovery.getLocationBasedMatches(this.testUser.id);
  expect(matches).toHaveLength(0);
});

When('I enable {string}', async function (this: World, setting: string) {
  const settingMap: { [key: string]: string } = {
    'Show approximate location only': '[data-testid="approximate-location-checkbox"]'
  };
  
  const selector = settingMap[setting];
  if (selector) {
    await this.page.check(selector);
  }
});

Then('other users should see my city but not exact location', async function (this: World) {
  const otherUser = await this.createTestUser('other-user');
  const profile = await this.getProfileForUser(this.testUser.id, otherUser.id);
  expect(profile.city).toBeTruthy();
  expect(profile.exactLocation).toBeUndefined();
});

Then('distance should be shown as approximate ranges', async function (this: World) {
  const otherUser = await this.createTestUser('other-user');
  const profile = await this.getProfileForUser(this.testUser.id, otherUser.id);
  expect(profile.distance).toMatch(/^\d+-\d+ km$/);
});

Then('my precise coordinates should remain private', async function (this: World) {
  const user = await this.mockDatabase.users.findById(this.testUser.id);
  expect(user.coordinates.shared).toBe(false);
});

// Blocking and reporting
Given('I am viewing another user\'s profile', async function (this: World) {
  this.targetUser = await this.createTestUser('target-user');
  await this.page.goto(`/profile/${this.targetUser.id}`);
  await this.page.waitForSelector('[data-testid="user-profile"]');
});

When('I confirm the blocking action', async function (this: World) {
  await this.page.click('[data-testid="confirm-block-button"]');
  await this.page.waitForSelector('[data-testid="block-success-message"]');
});

Then('the user should be added to my blocked list', async function (this: World) {
  const blockedUsers = await this.mockDatabase.blocks.getBlockedUsers(this.testUser.id);
  const isBlocked = blockedUsers.some(user => user.id === this.targetUser.id);
  expect(isBlocked).toBe(true);
});

Then('they should not be able to see my profile', async function (this: World) {
  const profileVisible = await this.getProfileVisibility(this.testUser.id, this.targetUser.id);
  expect(profileVisible.visible).toBe(false);
});

Then('they should not be able to message me', async function (this: World) {
  const canMessage = await this.checkMessagingPermission(this.targetUser.id, this.testUser.id);
  expect(canMessage).toBe(false);
});

Then('I should not see them in discovery', async function (this: World) {
  const discoveryUsers = await this.mockDatabase.discovery.getUsersForDiscovery(this.testUser.id);
  const blockedUserInDiscovery = discoveryUsers.find(user => user.id === this.targetUser.id);
  expect(blockedUserInDiscovery).toBeUndefined();
});

// Reporting
When('I select {string} as the reason', async function (this: World, reason: string) {
  await this.page.selectOption('[data-testid="report-reason-select"]', reason);
});

When('I provide additional details', async function (this: World) {
  await this.page.fill('[data-testid="report-details-textarea"]', 'This user has inappropriate photos in their profile.');
});

When('I submit the report', async function (this: World) {
  await this.page.click('[data-testid="submit-report-button"]');
});

Then('the report should be submitted successfully', async function (this: World) {
  await this.page.waitForSelector('[data-testid="report-success-message"]');
  const reports = await this.mockDatabase.reports.getReports();
  const userReport = reports.find(report => 
    report.reporterId === this.testUser.id && 
    report.reportedUserId === this.targetUser.id
  );
  expect(userReport).toBeTruthy();
});

Then('the user should be automatically blocked', async function (this: World) {
  const blockedUsers = await this.mockDatabase.blocks.getBlockedUsers(this.testUser.id);
  const isBlocked = blockedUsers.some(user => user.id === this.targetUser.id);
  expect(isBlocked).toBe(true);
});

Then('I should receive a confirmation message', async function (this: World) {
  const confirmationMessage = await this.page.textContent('[data-testid="report-success-message"]');
  expect(confirmationMessage).toContain('Report submitted successfully');
});

// Message encryption and security
Given('I have a conversation with another user', async function (this: World) {
  this.conversationPartner = await this.createTestUser('conversation-partner');
  await this.mockDatabase.conversations.create({
    participants: [this.testUser.id, this.conversationPartner.id],
    id: 'conversation-123'
  });
  
  await this.page.goto('/messages/conversation-123');
  await this.page.waitForSelector('[data-testid="conversation"]');
});

When('I send a message {string}', async function (this: World, messageText: string) {
  await this.page.fill('[data-testid="message-input"]', messageText);
  await this.page.click('[data-testid="send-message-button"]');
  await this.page.waitForSelector(`[data-testid="message"]:has-text("${messageText}")`);
});

Then('the message should be encrypted in transit', async function (this: World) {
  // Verify HTTPS and TLS encryption
  const response = await this.page.waitForResponse(response => 
    response.url().includes('/api/messages') && response.request().method() === 'POST'
  );
  
  const request = response.request();
  expect(request.url()).toMatch(/^https:/);
});

Then('the message should be encrypted at rest', async function (this: World) {
  const messages = await this.mockDatabase.messages.getConversationMessages('conversation-123');
  const lastMessage = messages[messages.length - 1];
  
  // Check that message content is encrypted in database
  expect(lastMessage.encryptedContent).toBeTruthy();
  expect(lastMessage.content).toBeUndefined();
});

Then('only the recipient and I should be able to read it', async function (this: World) {
  // Verify end-to-end encryption keys
  const messageKeys = await this.mockDatabase.messageKeys.getKeys('conversation-123');
  expect(messageKeys.participants).toEqual([this.testUser.id, this.conversationPartner.id]);
});

// Message deletion
Given('I have sent messages in a conversation', async function (this: World) {
  await this.mockDatabase.messages.create({
    conversationId: 'conversation-123',
    senderId: this.testUser.id,
    content: 'Test message to be deleted',
    timestamp: new Date()
  });
});

When('I delete a message', async function (this: World) {
  await this.page.click('[data-testid="message-options-button"]');
  await this.page.click('[data-testid="delete-message-button"]');
  await this.page.click('[data-testid="confirm-delete-button"]');
});

Then('the message should be removed from my view', async function (this: World) {
  const deletedMessage = await this.page.locator('[data-testid="deleted-message"]');
  await expect(deletedMessage).toBeVisible();
});

Then('the message should be marked as deleted in the database', async function (this: World) {
  const messages = await this.mockDatabase.messages.getConversationMessages('conversation-123');
  const deletedMessage = messages.find(msg => msg.senderId === this.testUser.id);
  expect(deletedMessage.deleted).toBe(true);
});

Then('the recipient should see {string} placeholder', async function (this: World, placeholder: string) {
  // Switch to recipient's view
  await this.switchToUser(this.conversationPartner.id);
  await this.page.goto('/messages/conversation-123');
  
  const messageText = await this.page.textContent('[data-testid="deleted-message"]');
  expect(messageText).toContain(placeholder);
});

// Data export and deletion
Given('I am on the data privacy page', async function (this: World) {
  await this.page.goto('/settings/data-privacy');
  await this.page.waitForSelector('[data-testid="data-privacy-settings"]');
});

When('I request to export my data', async function (this: World) {
  await this.page.click('[data-testid="export-data-button"]');
  await this.page.click('[data-testid="confirm-export-button"]');
});

Then('I should receive a confirmation email', async function (this: World) {
  const emails = await this.mockEmailService.getEmailsForUser(this.testUser.email);
  const exportEmail = emails.find(email => email.subject.includes('Data Export Request'));
  expect(exportEmail).toBeTruthy();
});

Then('my data export should be prepared within {int} days', async function (this: World, days: number) {
  const exportRequest = await this.mockDatabase.dataExports.getRequest(this.testUser.id);
  const expectedCompletionDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  expect(new Date(exportRequest.expectedCompletion)).toBeLessThanOrEqual(expectedCompletionDate);
});

Then('I should receive a download link when ready', async function (this: World) {
  // Mock export completion
  await this.mockDatabase.dataExports.markComplete(this.testUser.id, 'https://example.com/export/user-data.zip');
  
  const emails = await this.mockEmailService.getEmailsForUser(this.testUser.email);
  const downloadEmail = emails.find(email => email.subject.includes('Data Export Ready'));
  expect(downloadEmail).toBeTruthy();
  expect(downloadEmail.body).toContain('https://example.com/export/user-data.zip');
});

Then('the export should include all my personal data', async function (this: World) {
  const exportData = await this.mockDatabase.dataExports.getExportData(this.testUser.id);
  
  expect(exportData.profile).toBeTruthy();
  expect(exportData.messages).toBeTruthy();
  expect(exportData.matches).toBeTruthy();
  expect(exportData.preferences).toBeTruthy();
  expect(exportData.photos).toBeTruthy();
});

// Account deletion
Given('I am on the account deletion page', async function (this: World) {
  await this.page.goto('/settings/delete-account');
  await this.page.waitForSelector('[data-testid="delete-account-form"]');
});

When('I request to delete my account', async function (this: World) {
  await this.page.click('[data-testid="delete-account-button"]');
});

When('I confirm the deletion', async function (this: World) {
  await this.page.fill('[data-testid="confirm-password-input"]', this.testUser.password);
  await this.page.click('[data-testid="confirm-deletion-button"]');
});

Then('my account should be scheduled for deletion', async function (this: World) {
  const user = await this.mockDatabase.users.findById(this.testUser.id);
  expect(user.deletionScheduled).toBe(true);
  expect(user.deletionDate).toBeTruthy();
});

Then('my profile should be immediately hidden', async function (this: World) {
  const user = await this.mockDatabase.users.findById(this.testUser.id);
  expect(user.profileVisible).toBe(false);
});

Then('my data should be permanently deleted within {int} days', async function (this: World, days: number) {
  const user = await this.mockDatabase.users.findById(this.testUser.id);
  const deletionDate = new Date(user.deletionDate);
  const expectedDeletion = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  expect(deletionDate).toBeLessThanOrEqual(expectedDeletion);
});

Then('I should receive deletion confirmation', async function (this: World) {
  const emails = await this.mockEmailService.getEmailsForUser(this.testUser.email);
  const deletionEmail = emails.find(email => email.subject.includes('Account Deletion Confirmed'));
  expect(deletionEmail).toBeTruthy();
});

// API Security scenarios
When('I make an API request without authentication', async function (this: World) {
  this.apiResponse = await this.apiClient.get('/api/user/profile');
});

Then('the API should respond with status code {int}', async function (this: World, statusCode: number) {
  expect(this.apiResponse.status).toBe(statusCode);
});

Then('the response should contain {string}', async function (this: World, expectedText: string) {
  const responseText = await this.apiResponse.text();
  expect(responseText).toContain(expectedText);
});

// Rate limiting
Given('I am authenticated', async function (this: World) {
  this.authToken = await this.getAuthToken(this.testUser.id);
});

When('I make {int} API requests within {int} minute', async function (this: World, requestCount: number, minutes: number) {
  const requests = [];
  
  for (let i = 0; i < requestCount; i++) {
    const request = this.apiClient.get('/api/user/profile', {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });
    requests.push(request);
  }
  
  this.apiResponses = await Promise.all(requests);
});

Then('subsequent requests should be rate limited', async function (this: World) {
  const rateLimitedResponse = await this.apiClient.get('/api/user/profile', {
    headers: { Authorization: `Bearer ${this.authToken}` }
  });
  
  expect(rateLimitedResponse.status).toBe(429);
});

Then('the response should contain rate limit information', async function (this: World) {
  const rateLimitedResponse = await this.apiClient.get('/api/user/profile', {
    headers: { Authorization: `Bearer ${this.authToken}` }
  });
  
  const rateLimitHeaders = rateLimitedResponse.headers;
  expect(rateLimitHeaders['x-ratelimit-limit']).toBeTruthy();
  expect(rateLimitHeaders['x-ratelimit-remaining']).toBeTruthy();
  expect(rateLimitHeaders['x-ratelimit-reset']).toBeTruthy();
});

// Security vulnerability protection
When('I send a malicious SQL payload in a request', async function (this: World) {
  const maliciousPayload = "'; DROP TABLE users; --";
  this.apiResponse = await this.apiClient.post('/api/user/search', {
    query: maliciousPayload
  }, {
    headers: { Authorization: `Bearer ${this.authToken}` }
  });
});

Then('the API should sanitize the input', async function (this: World) {
  expect(this.apiResponse.status).toBe(200);
  
  // Verify that the database is still intact
  const users = await this.mockDatabase.users.getAll();
  expect(users.length).toBeGreaterThan(0);
});

Then('no SQL injection should occur', async function (this: World) {
  // Verify database integrity
  const tableExists = await this.mockDatabase.checkTableExists('users');
  expect(tableExists).toBe(true);
});

Then('the request should be processed safely', async function (this: World) {
  const responseData = await this.apiResponse.json();
  expect(responseData.results).toBeDefined();
  expect(Array.isArray(responseData.results)).toBe(true);
});

// XSS protection
When('I submit content with malicious scripts', async function (this: World) {
  const maliciousContent = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
  
  await this.page.goto('/profile/edit');
  await this.page.fill('[data-testid="bio-textarea"]', maliciousContent);
  await this.page.click('[data-testid="save-profile-button"]');
});

Then('the scripts should be sanitized', async function (this: World) {
  await this.page.goto('/profile');
  const bioContent = await this.page.textContent('[data-testid="user-bio"]');
  
  expect(bioContent).not.toContain('<script>');
  expect(bioContent).not.toContain('onerror');
  expect(bioContent).not.toContain('alert');
});

Then('no XSS attack should be possible', async function (this: World) {
  // Check that no scripts are executed
  const alertDialogs = [];
  this.page.on('dialog', dialog => {
    alertDialogs.push(dialog.message());
    dialog.dismiss();
  });
  
  await this.page.reload();
  await this.page.waitForTimeout(1000);
  
  expect(alertDialogs).toHaveLength(0);
});

Then('the content should be safely displayed', async function (this: World) {
  const bioContent = await this.page.textContent('[data-testid="user-bio"]');
  expect(bioContent).toBeTruthy();
  expect(bioContent).not.toContain('<');
  expect(bioContent).not.toContain('>');
});

// Password security
Given('I am creating a new account', async function (this: World) {
  await this.page.goto('/register');
  await this.page.waitForSelector('[data-testid="registration-form"]');
});

When('I enter a weak password {string}', async function (this: World, weakPassword: string) {
  await this.page.fill('[data-testid="email-input"]', 'newuser@example.com');
  await this.page.fill('[data-testid="password-input"]', weakPassword);
  await this.page.fill('[data-testid="confirm-password-input"]', weakPassword);
});

Then('I should see password strength requirements', async function (this: World) {
  await this.page.waitForSelector('[data-testid="password-requirements"]');
  const requirements = await this.page.textContent('[data-testid="password-requirements"]');
  expect(requirements).toContain('at least 8 characters');
  expect(requirements).toContain('uppercase letter');
  expect(requirements).toContain('lowercase letter');
  expect(requirements).toContain('number');
  expect(requirements).toContain('special character');
});

Then('I should not be able to proceed', async function (this: World) {
  const submitButton = await this.page.locator('[data-testid="register-button"]');
  await expect(submitButton).toBeDisabled();
});

Then('the password should be rejected', async function (this: World) {
  await this.page.click('[data-testid="register-button"]');
  const errorMessage = await this.page.textContent('[data-testid="password-error"]');
  expect(errorMessage).toContain('Password does not meet requirements');
});

// Password hashing
Given('I create an account with password {string}', async function (this: World, password: string) {
  const newUser = {
    email: 'secure@example.com',
    password: password,
    name: 'Secure User'
  };
  
  await this.mockDatabase.users.create(newUser);
  this.secureUser = newUser;
});

When('I check the database', async function (this: World) {
  this.storedUser = await this.mockDatabase.users.findByEmail(this.secureUser.email);
});

Then('my password should be hashed', async function (this: World) {
  expect(this.storedUser.passwordHash).toBeTruthy();
  expect(this.storedUser.passwordHash).not.toBe(this.secureUser.password);
});

Then('the plain text password should not be stored', async function (this: World) {
  expect(this.storedUser.password).toBeUndefined();
});

Then('the hash should use a secure algorithm', async function (this: World) {
  // Check for bcrypt hash format
  expect(this.storedUser.passwordHash).toMatch(/^\$2[aby]\$\d+\$/);
});

// Password reset security
Given('I request a password reset', async function (this: World) {
  await this.page.goto('/forgot-password');
  await this.page.fill('[data-testid="email-input"]', this.testUser.email);
  await this.page.click('[data-testid="reset-password-button"]');
});

When('I receive the reset email', async function (this: World) {
  const emails = await this.mockEmailService.getEmailsForUser(this.testUser.email);
  this.resetEmail = emails.find(email => email.subject.includes('Password Reset'));
  expect(this.resetEmail).toBeTruthy();
  
  // Extract reset token from email
  const tokenMatch = this.resetEmail.body.match(/token=([a-zA-Z0-9-_]+)/);
  this.resetToken = tokenMatch ? tokenMatch[1] : null;
});

Then('the reset link should expire after {int} hour', async function (this: World, hours: number) {
  const resetRequest = await this.mockDatabase.passwordResets.findByToken(this.resetToken);
  const expiryTime = new Date(resetRequest.expiresAt);
  const expectedExpiry = new Date(Date.now() + hours * 60 * 60 * 1000);
  
  expect(expiryTime.getTime()).toBeCloseTo(expectedExpiry.getTime(), -4);
});

Then('the reset token should be single-use', async function (this: World) {
  // Use the token once
  await this.page.goto(`/reset-password?token=${this.resetToken}`);
  await this.page.fill('[data-testid="new-password-input"]', 'NewSecurePass123!');
  await this.page.click('[data-testid="update-password-button"]');
  
  // Try to use the token again
  await this.page.goto(`/reset-password?token=${this.resetToken}`);
  const errorMessage = await this.page.textContent('[data-testid="error-message"]');
  expect(errorMessage).toContain('Invalid or expired reset token');
});

Then('the token should be cryptographically secure', async function (this: World) {
  expect(this.resetToken).toMatch(/^[a-zA-Z0-9-_]{32,}$/);
  expect(this.resetToken.length).toBeGreaterThanOrEqual(32);
});

// Helper methods
private async createSession(deviceId: string) {
  const token = await this.authService.createSession(this.testUser.id, deviceId);
  return { token, valid: true, deviceId };
}

private async invalidateSession(token: string) {
  await this.authService.invalidateSession(token);
}

private async verifySession(token: string): Promise<boolean> {
  try {
    const session = await this.authService.verifySession(token);
    return session.valid;
  } catch {
    return false;
  }
}

private async createTestUser(identifier: string) {
  const user = {
    id: `test-${identifier}-${Date.now()}`,
    email: `${identifier}@example.com`,
    name: `Test ${identifier}`,
    age: 25
  };
  
  await this.mockDatabase.users.create(user);
  return user;
}

private async getProfileVisibility(profileUserId: string, viewerUserId: string) {
  return await this.privacyService.checkProfileVisibility(profileUserId, viewerUserId);
}

private async getProfileForUser(profileUserId: string, viewerUserId: string) {
  return await this.profileService.getProfileForViewer(profileUserId, viewerUserId);
}

private async checkMessagingPermission(senderId: string, recipientId: string): Promise<boolean> {
  return await this.messagingService.canSendMessage(senderId, recipientId);
}

private async switchToUser(userId: string) {
  // Switch context to different user for testing
  this.currentUserId = userId;
  const authToken = await this.getAuthToken(userId);
  await this.page.evaluate((token) => {
    localStorage.setItem('authToken', token);
  }, authToken);
}

private async getAuthToken(userId: string): Promise<string> {
  return await this.authService.generateToken(userId);
}

private generateTOTP(secret: string): string {
  // Generate valid TOTP code for testing
  const time = Math.floor(Date.now() / 30000);
  return this.totpService.generate(secret, time);
}