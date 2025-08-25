'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const cucumber_1 = require('@cucumber/cucumber');
const globals_1 = require('@jest/globals');
// Background steps
(0, cucumber_1.Given)('I am a registered user', async function () {
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
    failedLoginAttempts: 0,
  };
  // Mock user creation in database
  await this.mockDatabase.users.create(this.testUser);
});
(0, cucumber_1.Given)('I am logged into the app', async function () {
  // Simulate login process
  await this.page.goto('/login');
  await this.page.fill('[data-testid="email-input"]', this.testUser.email);
  await this.page.fill(
    '[data-testid="password-input"]',
    this.testUser.password
  );
  await this.page.click('[data-testid="login-button"]');
  // Wait for successful login
  await this.page.waitForURL('/dashboard');
  // Store session token
  this.sessionToken = await this.page.evaluate(() =>
    localStorage.getItem('authToken')
  );
});
// Authentication scenarios
(0, cucumber_1.Given)('I am on the login page', async function () {
  await this.page.goto('/login');
  await this.page.waitForSelector('[data-testid="login-form"]');
});
(0, cucumber_1.When)('I enter valid credentials', async function () {
  await this.page.fill('[data-testid="email-input"]', this.testUser.email);
  await this.page.fill(
    '[data-testid="password-input"]',
    this.testUser.password
  );
});
(0, cucumber_1.When)('I enter invalid credentials', async function () {
  await this.page.fill('[data-testid="email-input"]', 'invalid@example.com');
  await this.page.fill('[data-testid="password-input"]', 'wrongpassword');
});
(0, cucumber_1.When)('I click {string}', async function (buttonText) {
  const buttonMap = {
    Login: '[data-testid="login-button"]',
    Logout: '[data-testid="logout-button"]',
    'Block User': '[data-testid="block-user-button"]',
    'Report User': '[data-testid="report-user-button"]',
  };
  const selector = buttonMap[buttonText] || `button:has-text("${buttonText}")`;
  await this.page.click(selector);
});
(0, cucumber_1.Then)('I should be logged in successfully', async function () {
  await this.page.waitForURL('/dashboard');
  const authToken = await this.page.evaluate(() =>
    localStorage.getItem('authToken')
  );
  (0, globals_1.expect)(authToken).toBeTruthy();
});
(0, cucumber_1.Then)('I should see my dashboard', async function () {
  await this.page.waitForSelector('[data-testid="dashboard"]');
  const dashboardVisible = await this.page.isVisible(
    '[data-testid="dashboard"]'
  );
  (0, globals_1.expect)(dashboardVisible).toBe(true);
});
(0, cucumber_1.Then)('my session should be secure', async function () {
  // Check for secure session attributes
  const cookies = await this.page.context().cookies();
  const sessionCookie = cookies.find(cookie => cookie.name === 'session');
  if (sessionCookie) {
    (0, globals_1.expect)(sessionCookie.secure).toBe(true);
    (0, globals_1.expect)(sessionCookie.httpOnly).toBe(true);
    (0, globals_1.expect)(sessionCookie.sameSite).toBe('Strict');
  }
});
(0, cucumber_1.Then)(
  'I should see an error message {string}',
  async function (expectedMessage) {
    await this.page.waitForSelector('[data-testid="error-message"]');
    const errorMessage = await this.page.textContent(
      '[data-testid="error-message"]'
    );
    (0, globals_1.expect)(errorMessage).toContain(expectedMessage);
  }
);
(0, cucumber_1.Then)('I should remain on the login page', async function () {
  const currentUrl = this.page.url();
  (0, globals_1.expect)(currentUrl).toContain('/login');
});
(0, cucumber_1.Then)('no session should be created', async function () {
  const authToken = await this.page.evaluate(() =>
    localStorage.getItem('authToken')
  );
  (0, globals_1.expect)(authToken).toBeFalsy();
});
// Account lockout scenarios
(0, cucumber_1.When)(
  'I enter invalid credentials {int} times',
  async function (attempts) {
    for (let i = 0; i < attempts; i++) {
      await this.page.fill('[data-testid="email-input"]', this.testUser.email);
      await this.page.fill('[data-testid="password-input"]', 'wrongpassword');
      await this.page.click('[data-testid="login-button"]');
      if (i < attempts - 1) {
        await this.page.waitForSelector('[data-testid="error-message"]');
        await this.page.reload();
      }
    }
  }
);
(0, cucumber_1.Then)(
  'my account should be temporarily locked',
  async function () {
    // Check if account is locked in database
    const user = await this.mockDatabase.users.findById(this.testUser.id);
    (0, globals_1.expect)(user.accountLocked).toBe(true);
    (0, globals_1.expect)(user.lockoutExpiry).toBeTruthy();
  }
);
(0, cucumber_1.Then)('I should see a lockout message', async function () {
  await this.page.waitForSelector('[data-testid="lockout-message"]');
  const lockoutMessage = await this.page.textContent(
    '[data-testid="lockout-message"]'
  );
  (0, globals_1.expect)(lockoutMessage).toContain('Account temporarily locked');
});
(0, cucumber_1.Then)(
  'I should not be able to login for {int} minutes',
  async function (minutes) {
    // Verify lockout duration
    const user = await this.mockDatabase.users.findById(this.testUser.id);
    const lockoutExpiry = new Date(user.lockoutExpiry);
    const expectedExpiry = new Date(Date.now() + minutes * 60 * 1000);
    (0, globals_1.expect)(lockoutExpiry.getTime()).toBeCloseTo(
      expectedExpiry.getTime(),
      -4
    ); // Within 10 seconds
  }
);
// Two-factor authentication scenarios
(0, cucumber_1.Given)('I have 2FA enabled on my account', async function () {
  this.testUser.twoFactorEnabled = true;
  this.testUser.twoFactorSecret = 'JBSWY3DPEHPK3PXP';
  await this.mockDatabase.users.update(this.testUser.id, this.testUser);
});
(0, cucumber_1.Then)('I should be prompted for 2FA code', async function () {
  await this.page.waitForSelector('[data-testid="2fa-input"]');
  const twoFAVisible = await this.page.isVisible('[data-testid="2fa-input"]');
  (0, globals_1.expect)(twoFAVisible).toBe(true);
});
(0, cucumber_1.Given)('I am on the 2FA verification page', async function () {
  await this.page.goto('/login/2fa');
  await this.page.waitForSelector('[data-testid="2fa-form"]');
});
(0, cucumber_1.When)('I enter the correct 2FA code', async function () {
  // Generate valid TOTP code
  const validCode = this.generateTOTP(this.testUser.twoFactorSecret);
  await this.page.fill('[data-testid="2fa-input"]', validCode);
  await this.page.click('[data-testid="verify-2fa-button"]');
});
(0, cucumber_1.When)('I enter an invalid 2FA code', async function () {
  await this.page.fill('[data-testid="2fa-input"]', '000000');
  await this.page.click('[data-testid="verify-2fa-button"]');
});
(0, cucumber_1.Then)('I should remain on the 2FA page', async function () {
  const currentUrl = this.page.url();
  (0, globals_1.expect)(currentUrl).toContain('/login/2fa');
});
(0, cucumber_1.Then)('I should not be logged in', async function () {
  const authToken = await this.page.evaluate(() =>
    localStorage.getItem('authToken')
  );
  (0, globals_1.expect)(authToken).toBeFalsy();
});
// Session management scenarios
(0, cucumber_1.When)(
  'I remain inactive for {int} minutes',
  async function (minutes) {
    // Mock session timeout
    await this.page.evaluate(timeoutMinutes => {
      const expiryTime = Date.now() - timeoutMinutes * 60 * 1000;
      localStorage.setItem('sessionExpiry', expiryTime.toString());
    }, minutes);
    // Trigger session check
    await this.page.reload();
  }
);
(0, cucumber_1.Then)('my session should expire', async function () {
  const authToken = await this.page.evaluate(() =>
    localStorage.getItem('authToken')
  );
  (0, globals_1.expect)(authToken).toBeFalsy();
});
(0, cucumber_1.Then)(
  'I should be redirected to the login page',
  async function () {
    await this.page.waitForURL('/login');
    const currentUrl = this.page.url();
    (0, globals_1.expect)(currentUrl).toContain('/login');
  }
);
(0, cucumber_1.Then)(
  'I should see a session timeout message',
  async function () {
    await this.page.waitForSelector('[data-testid="session-timeout-message"]');
    const timeoutMessage = await this.page.textContent(
      '[data-testid="session-timeout-message"]'
    );
    (0, globals_1.expect)(timeoutMessage).toContain('Session expired');
  }
);
(0, cucumber_1.Then)('I should be logged out', async function () {
  const authToken = await this.page.evaluate(() =>
    localStorage.getItem('authToken')
  );
  (0, globals_1.expect)(authToken).toBeFalsy();
});
(0, cucumber_1.Then)('my session should be invalidated', async function () {
  // Check session invalidation on server
  const response = await this.apiClient.get('/api/auth/verify', {
    headers: { Authorization: `Bearer ${this.sessionToken}` },
  });
  (0, globals_1.expect)(response.status).toBe(401);
});
(0, cucumber_1.Then)(
  'I should not be able to access protected pages',
  async function () {
    await this.page.goto('/dashboard');
    await this.page.waitForURL('/login');
    const currentUrl = this.page.url();
    (0, globals_1.expect)(currentUrl).toContain('/login');
  }
);
// Multiple device sessions
(0, cucumber_1.Given)('I am logged in on device A', async function () {
  this.deviceASessions = await this.createSession('device-a');
});
(0, cucumber_1.When)('I login on device B', async function () {
  this.deviceBSessions = await this.createSession('device-b');
});
(0, cucumber_1.Then)(
  'I should be logged in on both devices',
  async function () {
    (0, globals_1.expect)(this.deviceASessions.valid).toBe(true);
    (0, globals_1.expect)(this.deviceBSessions.valid).toBe(true);
  }
);
(0, cucumber_1.When)('I logout from device A', async function () {
  await this.invalidateSession(this.deviceASessions.token);
});
(0, cucumber_1.Then)(
  'I should remain logged in on device B',
  async function () {
    const sessionValid = await this.verifySession(this.deviceBSessions.token);
    (0, globals_1.expect)(sessionValid).toBe(true);
  }
);
(0, cucumber_1.Then)(
  'device A session should be invalidated',
  async function () {
    const sessionValid = await this.verifySession(this.deviceASessions.token);
    (0, globals_1.expect)(sessionValid).toBe(false);
  }
);
// Privacy settings scenarios
(0, cucumber_1.Given)('I am on my profile settings', async function () {
  await this.page.goto('/settings/profile');
  await this.page.waitForSelector('[data-testid="profile-settings"]');
});
(0, cucumber_1.Given)('I am on my privacy settings', async function () {
  await this.page.goto('/settings/privacy');
  await this.page.waitForSelector('[data-testid="privacy-settings"]');
});
(0, cucumber_1.When)(
  'I set my profile visibility to {string}',
  async function (visibility) {
    await this.page.selectOption(
      '[data-testid="profile-visibility-select"]',
      visibility.toLowerCase()
    );
  }
);
(0, cucumber_1.When)('I save the settings', async function () {
  await this.page.click('[data-testid="save-settings-button"]');
  await this.page.waitForSelector('[data-testid="settings-saved-message"]');
});
(0, cucumber_1.Then)(
  'my profile should not be visible to other users',
  async function () {
    const user = await this.mockDatabase.users.findById(this.testUser.id);
    (0, globals_1.expect)(user.profileVisibility).toBe('private');
  }
);
(0, cucumber_1.Then)('I should not appear in discovery', async function () {
  const discoveryUsers = await this.mockDatabase.discovery.getVisibleUsers();
  const userInDiscovery = discoveryUsers.find(u => u.id === this.testUser.id);
  (0, globals_1.expect)(userInDiscovery).toBeUndefined();
});
(0, cucumber_1.Then)(
  'only matched users should see my profile',
  async function () {
    // Test profile visibility for matched vs unmatched users
    const matchedUser = await this.createTestUser('matched-user');
    const unmatchedUser = await this.createTestUser('unmatched-user');
    await this.mockDatabase.matches.create({
      userId1: this.testUser.id,
      userId2: matchedUser.id,
      status: 'matched',
    });
    const profileForMatched = await this.getProfileVisibility(
      this.testUser.id,
      matchedUser.id
    );
    const profileForUnmatched = await this.getProfileVisibility(
      this.testUser.id,
      unmatchedUser.id
    );
    (0, globals_1.expect)(profileForMatched.visible).toBe(true);
    (0, globals_1.expect)(profileForUnmatched.visible).toBe(false);
  }
);
// Hide specific information
(0, cucumber_1.When)('I choose to hide my age', async function () {
  await this.page.check('[data-testid="hide-age-checkbox"]');
});
(0, cucumber_1.When)('I choose to hide my last seen', async function () {
  await this.page.check('[data-testid="hide-last-seen-checkbox"]');
});
(0, cucumber_1.Then)('other users should not see my age', async function () {
  const otherUser = await this.createTestUser('other-user');
  const profile = await this.getProfileForUser(this.testUser.id, otherUser.id);
  (0, globals_1.expect)(profile.age).toBeUndefined();
});
(0, cucumber_1.Then)(
  'other users should not see when I was last online',
  async function () {
    const otherUser = await this.createTestUser('other-user');
    const profile = await this.getProfileForUser(
      this.testUser.id,
      otherUser.id
    );
    (0, globals_1.expect)(profile.lastSeen).toBeUndefined();
  }
);
(0, cucumber_1.Then)(
  'my other profile information should remain visible',
  async function () {
    const otherUser = await this.createTestUser('other-user');
    const profile = await this.getProfileForUser(
      this.testUser.id,
      otherUser.id
    );
    (0, globals_1.expect)(profile.name).toBeTruthy();
    (0, globals_1.expect)(profile.bio).toBeTruthy();
    (0, globals_1.expect)(profile.photos).toBeTruthy();
  }
);
// Location privacy
(0, cucumber_1.When)('I disable location sharing', async function () {
  await this.page.uncheck('[data-testid="location-sharing-checkbox"]');
});
(0, cucumber_1.Then)(
  'my exact location should not be shared',
  async function () {
    const user = await this.mockDatabase.users.findById(this.testUser.id);
    (0, globals_1.expect)(user.shareLocation).toBe(false);
  }
);
(0, cucumber_1.Then)(
  'other users should not see my distance',
  async function () {
    const otherUser = await this.createTestUser('other-user');
    const profile = await this.getProfileForUser(
      this.testUser.id,
      otherUser.id
    );
    (0, globals_1.expect)(profile.distance).toBeUndefined();
  }
);
(0, cucumber_1.Then)(
  'location-based matching should be disabled',
  async function () {
    const matches = await this.mockDatabase.discovery.getLocationBasedMatches(
      this.testUser.id
    );
    (0, globals_1.expect)(matches).toHaveLength(0);
  }
);
(0, cucumber_1.When)('I enable {string}', async function (setting) {
  const settingMap = {
    'Show approximate location only':
      '[data-testid="approximate-location-checkbox"]',
  };
  const selector = settingMap[setting];
  if (selector) {
    await this.page.check(selector);
  }
});
(0, cucumber_1.Then)(
  'other users should see my city but not exact location',
  async function () {
    const otherUser = await this.createTestUser('other-user');
    const profile = await this.getProfileForUser(
      this.testUser.id,
      otherUser.id
    );
    (0, globals_1.expect)(profile.city).toBeTruthy();
    (0, globals_1.expect)(profile.exactLocation).toBeUndefined();
  }
);
(0, cucumber_1.Then)(
  'distance should be shown as approximate ranges',
  async function () {
    const otherUser = await this.createTestUser('other-user');
    const profile = await this.getProfileForUser(
      this.testUser.id,
      otherUser.id
    );
    (0, globals_1.expect)(profile.distance).toMatch(/^\d+-\d+ km$/);
  }
);
(0, cucumber_1.Then)(
  'my precise coordinates should remain private',
  async function () {
    const user = await this.mockDatabase.users.findById(this.testUser.id);
    (0, globals_1.expect)(user.coordinates.shared).toBe(false);
  }
);
// Blocking and reporting
(0, cucumber_1.Given)("I am viewing another user's profile", async function () {
  this.targetUser = await this.createTestUser('target-user');
  await this.page.goto(`/profile/${this.targetUser.id}`);
  await this.page.waitForSelector('[data-testid="user-profile"]');
});
(0, cucumber_1.When)('I confirm the blocking action', async function () {
  await this.page.click('[data-testid="confirm-block-button"]');
  await this.page.waitForSelector('[data-testid="block-success-message"]');
});
(0, cucumber_1.Then)(
  'the user should be added to my blocked list',
  async function () {
    const blockedUsers = await this.mockDatabase.blocks.getBlockedUsers(
      this.testUser.id
    );
    const isBlocked = blockedUsers.some(user => user.id === this.targetUser.id);
    (0, globals_1.expect)(isBlocked).toBe(true);
  }
);
(0, cucumber_1.Then)(
  'they should not be able to see my profile',
  async function () {
    const profileVisible = await this.getProfileVisibility(
      this.testUser.id,
      this.targetUser.id
    );
    (0, globals_1.expect)(profileVisible.visible).toBe(false);
  }
);
(0, cucumber_1.Then)(
  'they should not be able to message me',
  async function () {
    const canMessage = await this.checkMessagingPermission(
      this.targetUser.id,
      this.testUser.id
    );
    (0, globals_1.expect)(canMessage).toBe(false);
  }
);
(0, cucumber_1.Then)('I should not see them in discovery', async function () {
  const discoveryUsers = await this.mockDatabase.discovery.getUsersForDiscovery(
    this.testUser.id
  );
  const blockedUserInDiscovery = discoveryUsers.find(
    user => user.id === this.targetUser.id
  );
  (0, globals_1.expect)(blockedUserInDiscovery).toBeUndefined();
});
// Reporting
(0, cucumber_1.When)(
  'I select {string} as the reason',
  async function (reason) {
    await this.page.selectOption(
      '[data-testid="report-reason-select"]',
      reason
    );
  }
);
(0, cucumber_1.When)('I provide additional details', async function () {
  await this.page.fill(
    '[data-testid="report-details-textarea"]',
    'This user has inappropriate photos in their profile.'
  );
});
(0, cucumber_1.When)('I submit the report', async function () {
  await this.page.click('[data-testid="submit-report-button"]');
});
(0, cucumber_1.Then)(
  'the report should be submitted successfully',
  async function () {
    await this.page.waitForSelector('[data-testid="report-success-message"]');
    const reports = await this.mockDatabase.reports.getReports();
    const userReport = reports.find(
      report =>
        report.reporterId === this.testUser.id &&
        report.reportedUserId === this.targetUser.id
    );
    (0, globals_1.expect)(userReport).toBeTruthy();
  }
);
(0, cucumber_1.Then)(
  'the user should be automatically blocked',
  async function () {
    const blockedUsers = await this.mockDatabase.blocks.getBlockedUsers(
      this.testUser.id
    );
    const isBlocked = blockedUsers.some(user => user.id === this.targetUser.id);
    (0, globals_1.expect)(isBlocked).toBe(true);
  }
);
(0, cucumber_1.Then)(
  'I should receive a confirmation message',
  async function () {
    const confirmationMessage = await this.page.textContent(
      '[data-testid="report-success-message"]'
    );
    (0, globals_1.expect)(confirmationMessage).toContain(
      'Report submitted successfully'
    );
  }
);
// Message encryption and security
(0, cucumber_1.Given)(
  'I have a conversation with another user',
  async function () {
    this.conversationPartner = await this.createTestUser(
      'conversation-partner'
    );
    await this.mockDatabase.conversations.create({
      participants: [this.testUser.id, this.conversationPartner.id],
      id: 'conversation-123',
    });
    await this.page.goto('/messages/conversation-123');
    await this.page.waitForSelector('[data-testid="conversation"]');
  }
);
(0, cucumber_1.When)('I send a message {string}', async function (messageText) {
  await this.page.fill('[data-testid="message-input"]', messageText);
  await this.page.click('[data-testid="send-message-button"]');
  await this.page.waitForSelector(
    `[data-testid="message"]:has-text("${messageText}")`
  );
});
(0, cucumber_1.Then)(
  'the message should be encrypted in transit',
  async function () {
    // Verify HTTPS and TLS encryption
    const response = await this.page.waitForResponse(
      response =>
        response.url().includes('/api/messages') &&
        response.request().method() === 'POST'
    );
    const request = response.request();
    (0, globals_1.expect)(request.url()).toMatch(/^https:/);
  }
);
(0, cucumber_1.Then)(
  'the message should be encrypted at rest',
  async function () {
    const messages =
      await this.mockDatabase.messages.getConversationMessages(
        'conversation-123'
      );
    const lastMessage = messages[messages.length - 1];
    // Check that message content is encrypted in database
    (0, globals_1.expect)(lastMessage.encryptedContent).toBeTruthy();
    (0, globals_1.expect)(lastMessage.content).toBeUndefined();
  }
);
(0, cucumber_1.Then)(
  'only the recipient and I should be able to read it',
  async function () {
    // Verify end-to-end encryption keys
    const messageKeys =
      await this.mockDatabase.messageKeys.getKeys('conversation-123');
    (0, globals_1.expect)(messageKeys.participants).toEqual([
      this.testUser.id,
      this.conversationPartner.id,
    ]);
  }
);
// Message deletion
(0, cucumber_1.Given)(
  'I have sent messages in a conversation',
  async function () {
    await this.mockDatabase.messages.create({
      conversationId: 'conversation-123',
      senderId: this.testUser.id,
      content: 'Test message to be deleted',
      timestamp: new Date(),
    });
  }
);
(0, cucumber_1.When)('I delete a message', async function () {
  await this.page.click('[data-testid="message-options-button"]');
  await this.page.click('[data-testid="delete-message-button"]');
  await this.page.click('[data-testid="confirm-delete-button"]');
});
(0, cucumber_1.Then)(
  'the message should be removed from my view',
  async function () {
    const deletedMessage = await this.page.locator(
      '[data-testid="deleted-message"]'
    );
    await (0, globals_1.expect)(deletedMessage).toBeVisible();
  }
);
(0, cucumber_1.Then)(
  'the message should be marked as deleted in the database',
  async function () {
    const messages =
      await this.mockDatabase.messages.getConversationMessages(
        'conversation-123'
      );
    const deletedMessage = messages.find(
      msg => msg.senderId === this.testUser.id
    );
    (0, globals_1.expect)(deletedMessage.deleted).toBe(true);
  }
);
(0, cucumber_1.Then)(
  'the recipient should see {string} placeholder',
  async function (placeholder) {
    // Switch to recipient's view
    await this.switchToUser(this.conversationPartner.id);
    await this.page.goto('/messages/conversation-123');
    const messageText = await this.page.textContent(
      '[data-testid="deleted-message"]'
    );
    (0, globals_1.expect)(messageText).toContain(placeholder);
  }
);
// Data export and deletion
(0, cucumber_1.Given)('I am on the data privacy page', async function () {
  await this.page.goto('/settings/data-privacy');
  await this.page.waitForSelector('[data-testid="data-privacy-settings"]');
});
(0, cucumber_1.When)('I request to export my data', async function () {
  await this.page.click('[data-testid="export-data-button"]');
  await this.page.click('[data-testid="confirm-export-button"]');
});
(0, cucumber_1.Then)(
  'I should receive a confirmation email',
  async function () {
    const emails = await this.mockEmailService.getEmailsForUser(
      this.testUser.email
    );
    const exportEmail = emails.find(email =>
      email.subject.includes('Data Export Request')
    );
    (0, globals_1.expect)(exportEmail).toBeTruthy();
  }
);
(0, cucumber_1.Then)(
  'my data export should be prepared within {int} days',
  async function (days) {
    const exportRequest = await this.mockDatabase.dataExports.getRequest(
      this.testUser.id
    );
    const expectedCompletionDate = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    );
    (0, globals_1.expect)(
      new Date(exportRequest.expectedCompletion)
    ).toBeLessThanOrEqual(expectedCompletionDate);
  }
);
(0, cucumber_1.Then)(
  'I should receive a download link when ready',
  async function () {
    // Mock export completion
    await this.mockDatabase.dataExports.markComplete(
      this.testUser.id,
      'https://example.com/export/user-data.zip'
    );
    const emails = await this.mockEmailService.getEmailsForUser(
      this.testUser.email
    );
    const downloadEmail = emails.find(email =>
      email.subject.includes('Data Export Ready')
    );
    (0, globals_1.expect)(downloadEmail).toBeTruthy();
    (0, globals_1.expect)(downloadEmail.body).toContain(
      'https://example.com/export/user-data.zip'
    );
  }
);
(0, cucumber_1.Then)(
  'the export should include all my personal data',
  async function () {
    const exportData = await this.mockDatabase.dataExports.getExportData(
      this.testUser.id
    );
    (0, globals_1.expect)(exportData.profile).toBeTruthy();
    (0, globals_1.expect)(exportData.messages).toBeTruthy();
    (0, globals_1.expect)(exportData.matches).toBeTruthy();
    (0, globals_1.expect)(exportData.preferences).toBeTruthy();
    (0, globals_1.expect)(exportData.photos).toBeTruthy();
  }
);
// Account deletion
(0, cucumber_1.Given)('I am on the account deletion page', async function () {
  await this.page.goto('/settings/delete-account');
  await this.page.waitForSelector('[data-testid="delete-account-form"]');
});
(0, cucumber_1.When)('I request to delete my account', async function () {
  await this.page.click('[data-testid="delete-account-button"]');
});
(0, cucumber_1.When)('I confirm the deletion', async function () {
  await this.page.fill(
    '[data-testid="confirm-password-input"]',
    this.testUser.password
  );
  await this.page.click('[data-testid="confirm-deletion-button"]');
});
(0, cucumber_1.Then)(
  'my account should be scheduled for deletion',
  async function () {
    const user = await this.mockDatabase.users.findById(this.testUser.id);
    (0, globals_1.expect)(user.deletionScheduled).toBe(true);
    (0, globals_1.expect)(user.deletionDate).toBeTruthy();
  }
);
(0, cucumber_1.Then)(
  'my profile should be immediately hidden',
  async function () {
    const user = await this.mockDatabase.users.findById(this.testUser.id);
    (0, globals_1.expect)(user.profileVisible).toBe(false);
  }
);
(0, cucumber_1.Then)(
  'my data should be permanently deleted within {int} days',
  async function (days) {
    const user = await this.mockDatabase.users.findById(this.testUser.id);
    const deletionDate = new Date(user.deletionDate);
    const expectedDeletion = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    (0, globals_1.expect)(deletionDate).toBeLessThanOrEqual(expectedDeletion);
  }
);
(0, cucumber_1.Then)(
  'I should receive deletion confirmation',
  async function () {
    const emails = await this.mockEmailService.getEmailsForUser(
      this.testUser.email
    );
    const deletionEmail = emails.find(email =>
      email.subject.includes('Account Deletion Confirmed')
    );
    (0, globals_1.expect)(deletionEmail).toBeTruthy();
  }
);
// API Security scenarios
(0, cucumber_1.When)(
  'I make an API request without authentication',
  async function () {
    this.apiResponse = await this.apiClient.get('/api/user/profile');
  }
);
(0, cucumber_1.Then)(
  'the API should respond with status code {int}',
  async function (statusCode) {
    (0, globals_1.expect)(this.apiResponse.status).toBe(statusCode);
  }
);
(0, cucumber_1.Then)(
  'the response should contain {string}',
  async function (expectedText) {
    const responseText = await this.apiResponse.text();
    (0, globals_1.expect)(responseText).toContain(expectedText);
  }
);
// Rate limiting
(0, cucumber_1.Given)('I am authenticated', async function () {
  this.authToken = await this.getAuthToken(this.testUser.id);
});
(0, cucumber_1.When)(
  'I make {int} API requests within {int} minute',
  async function (requestCount, minutes) {
    const requests = [];
    for (let i = 0; i < requestCount; i++) {
      const request = this.apiClient.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });
      requests.push(request);
    }
    this.apiResponses = await Promise.all(requests);
  }
);
(0, cucumber_1.Then)(
  'subsequent requests should be rate limited',
  async function () {
    const rateLimitedResponse = await this.apiClient.get('/api/user/profile', {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });
    (0, globals_1.expect)(rateLimitedResponse.status).toBe(429);
  }
);
(0, cucumber_1.Then)(
  'the response should contain rate limit information',
  async function () {
    const rateLimitedResponse = await this.apiClient.get('/api/user/profile', {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });
    const rateLimitHeaders = rateLimitedResponse.headers;
    (0, globals_1.expect)(rateLimitHeaders['x-ratelimit-limit']).toBeTruthy();
    (0, globals_1.expect)(
      rateLimitHeaders['x-ratelimit-remaining']
    ).toBeTruthy();
    (0, globals_1.expect)(rateLimitHeaders['x-ratelimit-reset']).toBeTruthy();
  }
);
// Security vulnerability protection
(0, cucumber_1.When)(
  'I send a malicious SQL payload in a request',
  async function () {
    const maliciousPayload = "'; DROP TABLE users; --";
    this.apiResponse = await this.apiClient.post(
      '/api/user/search',
      {
        query: maliciousPayload,
      },
      {
        headers: { Authorization: `Bearer ${this.authToken}` },
      }
    );
  }
);
(0, cucumber_1.Then)('the API should sanitize the input', async function () {
  (0, globals_1.expect)(this.apiResponse.status).toBe(200);
  // Verify that the database is still intact
  const users = await this.mockDatabase.users.getAll();
  (0, globals_1.expect)(users.length).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('no SQL injection should occur', async function () {
  // Verify database integrity
  const tableExists = await this.mockDatabase.checkTableExists('users');
  (0, globals_1.expect)(tableExists).toBe(true);
});
(0, cucumber_1.Then)(
  'the request should be processed safely',
  async function () {
    const responseData = await this.apiResponse.json();
    (0, globals_1.expect)(responseData.results).toBeDefined();
    (0, globals_1.expect)(Array.isArray(responseData.results)).toBe(true);
  }
);
// XSS protection
(0, cucumber_1.When)(
  'I submit content with malicious scripts',
  async function () {
    const maliciousContent =
      '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
    await this.page.goto('/profile/edit');
    await this.page.fill('[data-testid="bio-textarea"]', maliciousContent);
    await this.page.click('[data-testid="save-profile-button"]');
  }
);
(0, cucumber_1.Then)('the scripts should be sanitized', async function () {
  await this.page.goto('/profile');
  const bioContent = await this.page.textContent('[data-testid="user-bio"]');
  (0, globals_1.expect)(bioContent).not.toContain('<script>');
  (0, globals_1.expect)(bioContent).not.toContain('onerror');
  (0, globals_1.expect)(bioContent).not.toContain('alert');
});
(0, cucumber_1.Then)('no XSS attack should be possible', async function () {
  // Check that no scripts are executed
  const alertDialogs = [];
  this.page.on('dialog', dialog => {
    alertDialogs.push(dialog.message());
    dialog.dismiss();
  });
  await this.page.reload();
  await this.page.waitForTimeout(1000);
  (0, globals_1.expect)(alertDialogs).toHaveLength(0);
});
(0, cucumber_1.Then)(
  'the content should be safely displayed',
  async function () {
    const bioContent = await this.page.textContent('[data-testid="user-bio"]');
    (0, globals_1.expect)(bioContent).toBeTruthy();
    (0, globals_1.expect)(bioContent).not.toContain('<');
    (0, globals_1.expect)(bioContent).not.toContain('>');
  }
);
// Password security
(0, cucumber_1.Given)('I am creating a new account', async function () {
  await this.page.goto('/register');
  await this.page.waitForSelector('[data-testid="registration-form"]');
});
(0, cucumber_1.When)(
  'I enter a weak password {string}',
  async function (weakPassword) {
    await this.page.fill('[data-testid="email-input"]', 'newuser@example.com');
    await this.page.fill('[data-testid="password-input"]', weakPassword);
    await this.page.fill(
      '[data-testid="confirm-password-input"]',
      weakPassword
    );
  }
);
(0, cucumber_1.Then)(
  'I should see password strength requirements',
  async function () {
    await this.page.waitForSelector('[data-testid="password-requirements"]');
    const requirements = await this.page.textContent(
      '[data-testid="password-requirements"]'
    );
    (0, globals_1.expect)(requirements).toContain('at least 8 characters');
    (0, globals_1.expect)(requirements).toContain('uppercase letter');
    (0, globals_1.expect)(requirements).toContain('lowercase letter');
    (0, globals_1.expect)(requirements).toContain('number');
    (0, globals_1.expect)(requirements).toContain('special character');
  }
);
(0, cucumber_1.Then)('I should not be able to proceed', async function () {
  const submitButton = await this.page.locator(
    '[data-testid="register-button"]'
  );
  await (0, globals_1.expect)(submitButton).toBeDisabled();
});
(0, cucumber_1.Then)('the password should be rejected', async function () {
  await this.page.click('[data-testid="register-button"]');
  const errorMessage = await this.page.textContent(
    '[data-testid="password-error"]'
  );
  (0, globals_1.expect)(errorMessage).toContain(
    'Password does not meet requirements'
  );
});
// Password hashing
(0, cucumber_1.Given)(
  'I create an account with password {string}',
  async function (password) {
    const newUser = {
      email: 'secure@example.com',
      password: password,
      name: 'Secure User',
    };
    await this.mockDatabase.users.create(newUser);
    this.secureUser = newUser;
  }
);
(0, cucumber_1.When)('I check the database', async function () {
  this.storedUser = await this.mockDatabase.users.findByEmail(
    this.secureUser.email
  );
});
(0, cucumber_1.Then)('my password should be hashed', async function () {
  (0, globals_1.expect)(this.storedUser.passwordHash).toBeTruthy();
  (0, globals_1.expect)(this.storedUser.passwordHash).not.toBe(
    this.secureUser.password
  );
});
(0, cucumber_1.Then)(
  'the plain text password should not be stored',
  async function () {
    (0, globals_1.expect)(this.storedUser.password).toBeUndefined();
  }
);
(0, cucumber_1.Then)(
  'the hash should use a secure algorithm',
  async function () {
    // Check for bcrypt hash format
    (0, globals_1.expect)(this.storedUser.passwordHash).toMatch(
      /^\$2[aby]\$\d+\$/
    );
  }
);
// Password reset security
(0, cucumber_1.Given)('I request a password reset', async function () {
  await this.page.goto('/forgot-password');
  await this.page.fill('[data-testid="email-input"]', this.testUser.email);
  await this.page.click('[data-testid="reset-password-button"]');
});
(0, cucumber_1.When)('I receive the reset email', async function () {
  const emails = await this.mockEmailService.getEmailsForUser(
    this.testUser.email
  );
  this.resetEmail = emails.find(email =>
    email.subject.includes('Password Reset')
  );
  (0, globals_1.expect)(this.resetEmail).toBeTruthy();
  // Extract reset token from email
  const tokenMatch = this.resetEmail.body.match(/token=([a-zA-Z0-9-_]+)/);
  this.resetToken = tokenMatch ? tokenMatch[1] : null;
});
(0, cucumber_1.Then)(
  'the reset link should expire after {int} hour',
  async function (hours) {
    const resetRequest = await this.mockDatabase.passwordResets.findByToken(
      this.resetToken
    );
    const expiryTime = new Date(resetRequest.expiresAt);
    const expectedExpiry = new Date(Date.now() + hours * 60 * 60 * 1000);
    (0, globals_1.expect)(expiryTime.getTime()).toBeCloseTo(
      expectedExpiry.getTime(),
      -4
    );
  }
);
(0, cucumber_1.Then)('the reset token should be single-use', async function () {
  // Use the token once
  await this.page.goto(`/reset-password?token=${this.resetToken}`);
  await this.page.fill(
    '[data-testid="new-password-input"]',
    'NewSecurePass123!'
  );
  await this.page.click('[data-testid="update-password-button"]');
  // Try to use the token again
  await this.page.goto(`/reset-password?token=${this.resetToken}`);
  const errorMessage = await this.page.textContent(
    '[data-testid="error-message"]'
  );
  (0, globals_1.expect)(errorMessage).toContain(
    'Invalid or expired reset token'
  );
});
(0, cucumber_1.Then)(
  'the token should be cryptographically secure',
  async function () {
    (0, globals_1.expect)(this.resetToken).toMatch(/^[a-zA-Z0-9-_]{32,}$/);
    (0, globals_1.expect)(this.resetToken.length).toBeGreaterThanOrEqual(32);
  }
);
async;
createSession(deviceId, string);
{
  const token = await this.authService.createSession(
    this.testUser.id,
    deviceId
  );
  return { token, valid: true, deviceId };
}
async;
invalidateSession(token, string);
{
  await this.authService.invalidateSession(token);
}
async;
verifySession(token, string);
Promise <
  boolean >
  {
    try: {
      const: (session = await this.authService.verifySession(token)),
      return: session.valid,
    },
    catch: {
      return: false,
    },
  };
async;
createTestUser(identifier, string);
{
  const user = {
    id: `test-${identifier}-${Date.now()}`,
    email: `${identifier}@example.com`,
    name: `Test ${identifier}`,
    age: 25,
  };
  await this.mockDatabase.users.create(user);
  return user;
}
async;
getProfileVisibility(profileUserId, string, viewerUserId, string);
{
  return await this.privacyService.checkProfileVisibility(
    profileUserId,
    viewerUserId
  );
}
async;
getProfileForUser(profileUserId, string, viewerUserId, string);
{
  return await this.profileService.getProfileForViewer(
    profileUserId,
    viewerUserId
  );
}
async;
checkMessagingPermission(senderId, string, recipientId, string);
Promise <
  boolean >
  {
    return: await this.messagingService.canSendMessage(senderId, recipientId),
  };
async;
switchToUser(userId, string);
{
  // Switch context to different user for testing
  this.currentUserId = userId;
  const authToken = await this.getAuthToken(userId);
  await this.page.evaluate(token => {
    localStorage.setItem('authToken', token);
  }, authToken);
}
async;
getAuthToken(userId, string);
Promise <
  string >
  {
    return: await this.authService.generateToken(userId),
  };
generateTOTP(secret, string);
string;
{
  // Generate valid TOTP code for testing
  const time = Math.floor(Date.now() / 30000);
  return this.totpService.generate(secret, time);
}
