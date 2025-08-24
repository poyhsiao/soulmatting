import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Background Steps
Given('I have enabled push notifications', async function (this: CustomWorld) {
  // Set up push notification permissions
  await this.page!.context().grantPermissions(['notifications']);
  
  // Enable push notifications in user settings
  await this.apiRequest('PUT', '/api/notifications/preferences', {
    pushNotifications: true,
    types: ['matches', 'messages', 'likes']
  });
  
  this.testData.notificationsEnabled = true;
});

Given('I have a new mutual match', async function (this: CustomWorld) {
  // Create a mutual match for the user
  const matchUser = this.generateTestUser();
  const matchResponse = await this.apiRequest('POST', '/api/matches', {
    userId: this.testData.currentUser.id,
    targetUserId: matchUser.id,
    type: 'mutual'
  });
  
  expect(matchResponse.status).toBe(201);
  this.testData.newMatch = matchResponse.data.match;
});

Given('I have an active conversation', async function (this: CustomWorld) {
  // Create an active conversation
  const conversationResponse = await this.apiRequest('POST', '/api/conversations', {
    participantIds: [this.testData.currentUser.id, this.testData.targetUserId]
  });
  
  expect(conversationResponse.status).toBe(201);
  this.testData.activeConversation = conversationResponse.data.conversation;
});

Given('I have unread notifications', async function (this: CustomWorld) {
  // Create some unread notifications
  const notifications = [
    {
      type: 'match',
      message: 'You have a new match!',
      userId: this.testData.currentUser.id,
      read: false
    },
    {
      type: 'message',
      message: 'You have a new message',
      userId: this.testData.currentUser.id,
      read: false
    },
    {
      type: 'like',
      message: 'Someone liked your profile',
      userId: this.testData.currentUser.id,
      read: false
    }
  ];
  
  for (const notification of notifications) {
    await this.apiRequest('POST', '/api/notifications', notification);
  }
  
  this.testData.unreadNotifications = notifications;
});

Given('I have multiple notifications', async function (this: CustomWorld) {
  // Create multiple notifications
  const notifications = [];
  for (let i = 0; i < 5; i++) {
    const notification = {
      type: 'like',
      message: `Notification ${i + 1}`,
      userId: this.testData.currentUser.id,
      read: i % 2 === 0 // Some read, some unread
    };
    
    const response = await this.apiRequest('POST', '/api/notifications', notification);
    notifications.push(response.data.notification);
  }
  
  this.testData.multipleNotifications = notifications;
});

Given('I have enabled email notifications', async function (this: CustomWorld) {
  await this.apiRequest('PUT', '/api/notifications/preferences', {
    emailNotifications: true,
    emailTypes: ['matches', 'messages', 'digest']
  });
  
  this.testData.emailNotificationsEnabled = true;
});

Given('I have enabled weekly digest emails', async function (this: CustomWorld) {
  await this.apiRequest('PUT', '/api/notifications/preferences', {
    emailNotifications: true,
    weeklyDigest: true
  });
});

Given('it\'s time for the weekly digest', async function (this: CustomWorld) {
  // Simulate weekly digest trigger time
  this.testData.digestTime = new Date();
  this.testData.digestTime.setDate(this.testData.digestTime.getDate() - 7);
});

Given('I am on the notification settings page', async function (this: CustomWorld) {
  await this.navigateTo('/settings/notifications');
  await this.waitForElement('[data-testid="notification-settings"]');
});

Given('I have the app open', async function (this: CustomWorld) {
  await this.navigateTo('/dashboard');
  await this.waitForElement('[data-testid="dashboard"]');
});

Given('I have enabled real-time notifications', async function (this: CustomWorld) {
  await this.apiRequest('PUT', '/api/notifications/preferences', {
    realTimeNotifications: true
  });
});

Given('I have an unread notification with ID {string}', async function (this: CustomWorld, notificationId: string) {
  const notification = {
    id: notificationId,
    type: 'message',
    message: 'Test notification',
    userId: this.testData.currentUser.id,
    read: false
  };
  
  await this.apiRequest('POST', '/api/notifications', notification);
  this.testData.testNotificationId = notificationId;
});

Given('I have a notification with ID {string}', async function (this: CustomWorld, notificationId: string) {
  const notification = {
    id: notificationId,
    type: 'like',
    message: 'Test notification to delete',
    userId: this.testData.currentUser.id,
    read: true
  };
  
  await this.apiRequest('POST', '/api/notifications', notification);
  this.testData.testNotificationId = notificationId;
});

Given('I have various types of notifications', async function (this: CustomWorld) {
  const notificationTypes = [
    { type: 'match', message: 'You have a new match!', icon: 'heart' },
    { type: 'message', message: 'New message received', icon: 'chat' },
    { type: 'like', message: 'Someone liked your profile', icon: 'thumbs-up' },
    { type: 'system', message: 'System update available', icon: 'info' }
  ];
  
  for (const notif of notificationTypes) {
    await this.apiRequest('POST', '/api/notifications', {
      ...notif,
      userId: this.testData.currentUser.id,
      read: false
    });
  }
  
  this.testData.variousNotifications = notificationTypes;
});

Given('I receive a super like notification', async function (this: CustomWorld) {
  const superLikeNotification = {
    type: 'super_like',
    message: 'Someone super liked you!',
    userId: this.testData.currentUser.id,
    priority: 'high',
    read: false
  };
  
  await this.apiRequest('POST', '/api/notifications', superLikeNotification);
  this.testData.superLikeNotification = superLikeNotification;
});

Given('I receive multiple like notifications', async function (this: CustomWorld) {
  const likeNotifications = [];
  for (let i = 0; i < 3; i++) {
    const notification = {
      type: 'like',
      message: `User ${i + 1} liked your profile`,
      userId: this.testData.currentUser.id,
      read: false,
      groupKey: 'profile_likes'
    };
    
    const response = await this.apiRequest('POST', '/api/notifications', notification);
    likeNotifications.push(response.data.notification);
  }
  
  this.testData.groupedNotifications = likeNotifications;
});

Given('I have enabled notification sounds', async function (this: CustomWorld) {
  await this.apiRequest('PUT', '/api/notifications/preferences', {
    soundEnabled: true,
    matchSound: 'match_sound.mp3',
    messageSound: 'message_sound.mp3'
  });
});

Given('I am using a mobile device', async function (this: CustomWorld) {
  await this.page!.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
  this.testData.isMobile = true;
});

Given('I have enabled vibration for notifications', async function (this: CustomWorld) {
  await this.apiRequest('PUT', '/api/notifications/preferences', {
    vibrationEnabled: true
  });
});

Given('I have enabled do not disturb mode', async function (this: CustomWorld) {
  await this.apiRequest('PUT', '/api/notifications/preferences', {
    doNotDisturb: true,
    doNotDisturbStart: '22:00',
    doNotDisturbEnd: '08:00'
  });
});

Given('I have many notifications', async function (this: CustomWorld) {
  // Create 50 notifications for performance testing
  const notifications = [];
  for (let i = 0; i < 50; i++) {
    const notification = {
      type: i % 3 === 0 ? 'match' : i % 3 === 1 ? 'message' : 'like',
      message: `Notification ${i + 1}`,
      userId: this.testData.currentUser.id,
      read: i % 4 === 0
    };
    
    const response = await this.apiRequest('POST', '/api/notifications', notification);
    notifications.push(response.data.notification);
  }
  
  this.testData.manyNotifications = notifications;
});

Given('I lose internet connectivity', async function (this: CustomWorld) {
  await this.page!.context().setOffline(true);
  this.testData.isOffline = true;
});

Given('I receive notifications while offline', async function (this: CustomWorld) {
  // Simulate notifications that would be received while offline
  this.testData.offlineNotifications = [
    { type: 'message', message: 'Offline message 1' },
    { type: 'like', message: 'Offline like 1' }
  ];
});

Given('I have enabled privacy mode', async function (this: CustomWorld) {
  await this.apiRequest('PUT', '/api/notifications/preferences', {
    privacyMode: true,
    hideMessageContent: true
  });
});

Given('I have multiple pending notifications', async function (this: CustomWorld) {
  // Create notifications that will be batched
  const pendingNotifications = [];
  for (let i = 0; i < 5; i++) {
    const notification = {
      type: 'like',
      message: `Pending notification ${i + 1}`,
      userId: this.testData.currentUser.id,
      batchDelivery: true,
      priority: i === 0 ? 'high' : 'normal'
    };
    
    pendingNotifications.push(notification);
  }
  
  this.testData.pendingNotifications = pendingNotifications;
});

Given('I receive an email notification', async function (this: CustomWorld) {
  // Simulate receiving an email notification
  this.testData.emailNotification = {
    to: this.testData.currentUser.email,
    subject: 'You have a new match!',
    unsubscribeLink: 'https://app.example.com/unsubscribe?token=abc123'
  };
});

Given('I am an admin user', async function (this: CustomWorld) {
  // Set user as admin
  await this.apiRequest('PUT', '/api/users/role', {
    userId: this.testData.currentUser.id,
    role: 'admin'
  });
  
  this.testData.currentUser.role = 'admin';
});

// When Steps - Actions
When('the match is created', async function (this: CustomWorld) {
  // Trigger match creation event
  await this.apiRequest('POST', '/api/matches/trigger-notification', {
    matchId: this.testData.newMatch.id
  });
});

When('I receive a new message', async function (this: CustomWorld) {
  // Send a message to trigger notification
  const messageResponse = await this.apiRequest('POST', '/api/messages', {
    conversationId: this.testData.activeConversation.id,
    senderId: this.testData.targetUserId,
    content: 'Hello! How are you?',
    type: 'text'
  });
  
  expect(messageResponse.status).toBe(201);
  this.testData.newMessage = messageResponse.data.message;
});

When('I open the notifications panel', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="notifications-button"]');
  await this.waitForElement('[data-testid="notifications-panel"]');
});

When('I click on a notification', async function (this: CustomWorld) {
  const firstNotification = this.page!.locator('[data-testid="notification-item"]').first();
  await firstNotification.click();
});

When('I click the {string} button', async function (this: CustomWorld, buttonText: string) {
  const button = this.page!.locator(`button:has-text("${buttonText}")`);
  await button.click();
});

When('I confirm the action', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="confirm-button"]');
});

When('the digest is generated', async function (this: CustomWorld) {
  // Trigger weekly digest generation
  await this.apiRequest('POST', '/api/notifications/digest/generate', {
    userId: this.testData.currentUser.id,
    type: 'weekly'
  });
});

When('I toggle push notifications off', async function (this: CustomWorld) {
  const pushToggle = this.page!.locator('[data-testid="push-notifications-toggle"]');
  await pushToggle.click();
});

When('I save the settings', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="save-settings-button"]');
  await this.waitForElement('[data-testid="settings-saved"]');
});

When('I enable notifications for matches only', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="matches-notifications-checkbox"]');
});

When('I disable notifications for messages', async function (this: CustomWorld) {
  const messageToggle = this.page!.locator('[data-testid="messages-notifications-checkbox"]');
  if (await messageToggle.isChecked()) {
    await messageToggle.click();
  }
});

When('I set quiet hours from 10 PM to 8 AM', async function (this: CustomWorld) {
  await this.fillField('[data-testid="quiet-hours-start"]', '22:00');
  await this.fillField('[data-testid="quiet-hours-end"]', '08:00');
});

When('I read a notification', async function (this: CustomWorld) {
  const firstUnreadNotification = this.page!.locator('[data-testid="notification-item"][data-read="false"]').first();
  await firstUnreadNotification.click();
});

When('I send a GET request to {string}', async function (this: CustomWorld, endpoint: string) {
  this.testData.lastApiResponse = await this.apiRequest('GET', endpoint);
});

When('I send a PUT request to {string}', async function (this: CustomWorld, endpoint: string) {
  this.testData.lastApiResponse = await this.apiRequest('PUT', endpoint, {
    read: true
  });
});

When('I send a DELETE request to {string}', async function (this: CustomWorld, endpoint: string) {
  this.testData.lastApiResponse = await this.apiRequest('DELETE', endpoint);
});

When('I send a PUT request to {string} with updated settings', async function (this: CustomWorld, endpoint: string) {
  const updatedSettings = {
    pushNotifications: false,
    emailNotifications: true,
    types: ['matches'],
    quietHours: {
      start: '22:00',
      end: '08:00'
    }
  };
  
  this.testData.lastApiResponse = await this.apiRequest('PUT', endpoint, updatedSettings);
});

When('I send a PUT request to {string} with invalid data', async function (this: CustomWorld, endpoint: string) {
  const invalidData = {
    pushNotifications: 'invalid', // Should be boolean
    types: 'invalid', // Should be array
    quietHours: 'invalid' // Should be object
  };
  
  this.testData.lastApiResponse = await this.apiRequest('PUT', endpoint, invalidData);
});

When('I view my notifications', async function (this: CustomWorld) {
  await this.navigateTo('/notifications');
  await this.waitForElement('[data-testid="notifications-list"]');
});

When('the notification is delivered', async function (this: CustomWorld) {
  // Wait for notification to be processed
  await this.page!.waitForTimeout(1000);
});

When('I receive a new match notification', async function (this: CustomWorld) {
  // Simulate receiving a match notification
  await this.apiRequest('POST', '/api/notifications/trigger', {
    type: 'match',
    userId: this.testData.currentUser.id
  });
});

When('I receive a message notification', async function (this: CustomWorld) {
  // Simulate receiving a message notification
  await this.apiRequest('POST', '/api/notifications/trigger', {
    type: 'message',
    userId: this.testData.currentUser.id
  });
});

When('I receive a notification', async function (this: CustomWorld) {
  // Simulate receiving a general notification
  await this.apiRequest('POST', '/api/notifications/trigger', {
    type: 'like',
    userId: this.testData.currentUser.id
  });
});

When('I receive notifications', async function (this: CustomWorld) {
  // Simulate receiving multiple notifications
  const notificationTypes = ['match', 'message', 'like'];
  
  for (const type of notificationTypes) {
    await this.apiRequest('POST', '/api/notifications/trigger', {
      type,
      userId: this.testData.currentUser.id
    });
  }
});

When('I open the notifications panel', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="notifications-button"]');
  await this.waitForElement('[data-testid="notifications-panel"]');
});

When('connectivity is restored', async function (this: CustomWorld) {
  await this.page!.context().setOffline(false);
  this.testData.isOffline = false;
});

When('the batch delivery time arrives', async function (this: CustomWorld) {
  // Trigger batch delivery
  await this.apiRequest('POST', '/api/notifications/batch-deliver', {
    userId: this.testData.currentUser.id
  });
});

When('I click the unsubscribe link', async function (this: CustomWorld) {
  // Navigate to unsubscribe page
  await this.navigateTo('/unsubscribe?token=abc123');
  await this.waitForElement('[data-testid="unsubscribe-page"]');
});

When('I view notification analytics', async function (this: CustomWorld) {
  await this.navigateTo('/admin/analytics/notifications');
  await this.waitForElement('[data-testid="notification-analytics"]');
});

When('I make changes to my profile', async function (this: CustomWorld) {
  // Simulate making profile changes while offline
  this.testData.offlineChanges = {
    name: 'Offline Updated Name',
    bio: 'Updated while offline'
  };
});

// Then Steps - Assertions
Then('I should receive a push notification', async function (this: CustomWorld) {
  // Check for push notification (this would typically involve checking browser notifications API)
  await this.waitForElement('[data-testid="push-notification"]');
  const pushNotification = this.page!.locator('[data-testid="push-notification"]');
  await expect(pushNotification).toBeVisible();
});

Then('the notification should contain the match information', async function (this: CustomWorld) {
  const notificationContent = this.page!.locator('[data-testid="notification-content"]');
  await expect(notificationContent).toContainText('match');
});

Then('the notification should have a deep link to the match', async function (this: CustomWorld) {
  const notificationLink = this.page!.locator('[data-testid="notification-link"]');
  const href = await notificationLink.getAttribute('href');
  expect(href).toContain('/matches/');
});

Then('the notification should contain the message preview', async function (this: CustomWorld) {
  const notificationContent = this.page!.locator('[data-testid="notification-content"]');
  await expect(notificationContent).toContainText('Hello! How are you?');
});

Then('the notification should have a deep link to the conversation', async function (this: CustomWorld) {
  const notificationLink = this.page!.locator('[data-testid="notification-link"]');
  const href = await notificationLink.getAttribute('href');
  expect(href).toContain('/conversations/');
});

Then('I should see a list of my notifications', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="notifications-list"]');
  const notificationsList = this.page!.locator('[data-testid="notifications-list"]');
  await expect(notificationsList).toBeVisible();
  
  const notifications = this.page!.locator('[data-testid="notification-item"]');
  const notificationCount = await notifications.count();
  expect(notificationCount).toBeGreaterThan(0);
});

Then('each notification should show the type and timestamp', async function (this: CustomWorld) {
  const notifications = this.page!.locator('[data-testid="notification-item"]');
  const firstNotification = notifications.first();
  
  await expect(firstNotification.locator('[data-testid="notification-type"]')).toBeVisible();
  await expect(firstNotification.locator('[data-testid="notification-timestamp"]')).toBeVisible();
});

Then('unread notifications should be highlighted', async function (this: CustomWorld) {
  const unreadNotifications = this.page!.locator('[data-testid="notification-item"][data-read="false"]');
  const firstUnread = unreadNotifications.first();
  
  await expect(firstUnread).toHaveClass(/unread/);
});

Then('the notification should be marked as read', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="notification-read"]');
  const readNotification = this.page!.locator('[data-testid="notification-read"]');
  await expect(readNotification).toBeVisible();
});

Then('the notification count should decrease', async function (this: CustomWorld) {
  const notificationBadge = this.page!.locator('[data-testid="notification-badge"]');
  const badgeText = await notificationBadge.textContent();
  const count = parseInt(badgeText || '0');
  expect(count).toBeLessThan(this.testData.unreadNotifications.length);
});

Then('I should be navigated to the relevant content', async function (this: CustomWorld) {
  // Check that we're navigated to the correct page
  const currentUrl = this.page!.url();
  expect(currentUrl).toMatch(/(matches|conversations|profile)/);
});

Then('all notifications should be removed', async function (this: CustomWorld) {
  const notifications = this.page!.locator('[data-testid="notification-item"]');
  const notificationCount = await notifications.count();
  expect(notificationCount).toBe(0);
});

Then('the notification count should be zero', async function (this: CustomWorld) {
  const notificationBadge = this.page!.locator('[data-testid="notification-badge"]');
  await expect(notificationBadge).not.toBeVisible();
});

Then('I should receive an email notification', async function (this: CustomWorld) {
  // Check for email notification (this would typically involve checking email service)
  const emailResponse = await this.apiRequest('GET', '/api/notifications/emails/recent');
  expect(emailResponse.status).toBe(200);
  expect(emailResponse.data.emails.length).toBeGreaterThan(0);
});

Then('the email should contain match details', async function (this: CustomWorld) {
  const emailResponse = await this.apiRequest('GET', '/api/notifications/emails/recent');
  const latestEmail = emailResponse.data.emails[0];
  expect(latestEmail.subject).toContain('match');
  expect(latestEmail.content).toContain('new match');
});

Then('the email should have a link to view the match', async function (this: CustomWorld) {
  const emailResponse = await this.apiRequest('GET', '/api/notifications/emails/recent');
  const latestEmail = emailResponse.data.emails[0];
  expect(latestEmail.content).toContain('href');
  expect(latestEmail.content).toContain('/matches/');
});

Then('I should receive a digest email', async function (this: CustomWorld) {
  const emailResponse = await this.apiRequest('GET', '/api/notifications/emails/digest');
  expect(emailResponse.status).toBe(200);
  expect(emailResponse.data.digest).toBeDefined();
});

Then('the email should contain my activity summary', async function (this: CustomWorld) {
  const emailResponse = await this.apiRequest('GET', '/api/notifications/emails/digest');
  const digest = emailResponse.data.digest;
  expect(digest.content).toContain('activity');
  expect(digest.content).toContain('summary');
});

Then('the email should contain new matches and messages', async function (this: CustomWorld) {
  const emailResponse = await this.apiRequest('GET', '/api/notifications/emails/digest');
  const digest = emailResponse.data.digest;
  expect(digest.content).toContain('matches');
  expect(digest.content).toContain('messages');
});

Then('push notifications should be disabled', async function (this: CustomWorld) {
  const settingsResponse = await this.apiRequest('GET', '/api/notifications/preferences');
  expect(settingsResponse.data.preferences.pushNotifications).toBe(false);
});

Then('I should not receive push notifications', async function (this: CustomWorld) {
  // Trigger a notification and verify it's not pushed
  await this.apiRequest('POST', '/api/notifications/trigger', {
    type: 'test',
    userId: this.testData.currentUser.id
  });
  
  // Wait and check that no push notification appears
  await this.page!.waitForTimeout(2000);
  const pushNotification = this.page!.locator('[data-testid="push-notification"]');
  await expect(pushNotification).not.toBeVisible();
});

Then('I should only receive match notifications', async function (this: CustomWorld) {
  const settingsResponse = await this.apiRequest('GET', '/api/notifications/preferences');
  const enabledTypes = settingsResponse.data.preferences.types;
  expect(enabledTypes).toContain('matches');
  expect(enabledTypes).not.toContain('messages');
});

Then('I should not receive message notifications', async function (this: CustomWorld) {
  // Trigger a message notification and verify it's filtered
  await this.apiRequest('POST', '/api/notifications/trigger', {
    type: 'message',
    userId: this.testData.currentUser.id
  });
  
  const notificationsResponse = await this.apiRequest('GET', '/api/notifications');
  const messageNotifications = notificationsResponse.data.notifications.filter(
    (n: any) => n.type === 'message'
  );
  expect(messageNotifications.length).toBe(0);
});

Then('I should not receive notifications during quiet hours', async function (this: CustomWorld) {
  // Simulate quiet hours and verify notifications are suppressed
  const currentTime = new Date();
  currentTime.setHours(23, 0, 0, 0); // 11 PM
  
  await this.apiRequest('POST', '/api/notifications/trigger', {
    type: 'test',
    userId: this.testData.currentUser.id,
    timestamp: currentTime.toISOString()
  });
  
  const notificationsResponse = await this.apiRequest('GET', '/api/notifications/delivered');
  expect(notificationsResponse.data.delivered).toBe(false);
});

Then('notifications should resume after quiet hours', async function (this: CustomWorld) {
  // Simulate after quiet hours
  const currentTime = new Date();
  currentTime.setHours(9, 0, 0, 0); // 9 AM
  
  await this.apiRequest('POST', '/api/notifications/trigger', {
    type: 'test',
    userId: this.testData.currentUser.id,
    timestamp: currentTime.toISOString()
  });
  
  const notificationsResponse = await this.apiRequest('GET', '/api/notifications/delivered');
  expect(notificationsResponse.data.delivered).toBe(true);
});

Then('I should see an in-app notification immediately', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="in-app-notification"]');
  const inAppNotification = this.page!.locator('[data-testid="in-app-notification"]');
  await expect(inAppNotification).toBeVisible();
});

Then('the notification should appear without page refresh', async function (this: CustomWorld) {
  // Verify notification appears via real-time update
  const notification = this.page!.locator('[data-testid="real-time-notification"]');
  await expect(notification).toBeVisible();
});

Then('I should see a notification badge with the count', async function (this: CustomWorld) {
  const notificationBadge = this.page!.locator('[data-testid="notification-badge"]');
  await expect(notificationBadge).toBeVisible();
  
  const badgeText = await notificationBadge.textContent();
  const count = parseInt(badgeText || '0');
  expect(count).toBeGreaterThan(0);
});

Then('the badge count should update immediately', async function (this: CustomWorld) {
  // Wait for real-time update
  await this.page!.waitForTimeout(500);
  
  const notificationBadge = this.page!.locator('[data-testid="notification-badge"]');
  const badgeText = await notificationBadge.textContent();
  const newCount = parseInt(badgeText || '0');
  
  expect(newCount).toBeLessThan(this.testData.unreadNotifications.length);
});

// API Assertion Steps
Then('the API should respond with status code {int}', async function (this: CustomWorld, statusCode: number) {
  expect(this.testData.lastApiResponse.status).toBe(statusCode);
});

Then('the response should contain my notifications', async function (this: CustomWorld) {
  expect(this.testData.lastApiResponse.data).toHaveProperty('notifications');
  expect(Array.isArray(this.testData.lastApiResponse.data.notifications)).toBe(true);
});

Then('each notification should have id, type, message, timestamp, and read status', async function (this: CustomWorld) {
  const notifications = this.testData.lastApiResponse.data.notifications;
  expect(notifications.length).toBeGreaterThan(0);
  
  const firstNotification = notifications[0];
  expect(firstNotification).toHaveProperty('id');
  expect(firstNotification).toHaveProperty('type');
  expect(firstNotification).toHaveProperty('message');
  expect(firstNotification).toHaveProperty('timestamp');
  expect(firstNotification).toHaveProperty('read');
});

Then('the notification should be marked as read', async function (this: CustomWorld) {
  // Verify via API that notification is marked as read
  const verifyResponse = await this.apiRequest('GET', `/api/notifications/${this.testData.testNotificationId}`);
  expect(verifyResponse.data.notification.read).toBe(true);
});

Then('subsequent API calls should show the notification as read', async function (this: CustomWorld) {
  const notificationsResponse = await this.apiRequest('GET', '/api/notifications');
  const notification = notificationsResponse.data.notifications.find(
    (n: any) => n.id === this.testData.testNotificationId
  );
  expect(notification.read).toBe(true);
});

Then('the notification should be removed', async function (this: CustomWorld) {
  // Verify notification is deleted
  const verifyResponse = await this.apiRequest('GET', `/api/notifications/${this.testData.testNotificationId}`);
  expect(verifyResponse.status).toBe(404);
});

Then('subsequent API calls should not include the notification', async function (this: CustomWorld) {
  const notificationsResponse = await this.apiRequest('GET', '/api/notifications');
  const notification = notificationsResponse.data.notifications.find(
    (n: any) => n.id === this.testData.testNotificationId
  );
  expect(notification).toBeUndefined();
});

Then('the response should contain the updated preferences', async function (this: CustomWorld) {
  expect(this.testData.lastApiResponse.data).toHaveProperty('preferences');
  const preferences = this.testData.lastApiResponse.data.preferences;
  expect(preferences.pushNotifications).toBe(false);
  expect(preferences.emailNotifications).toBe(true);
});

Then('my notification behavior should change accordingly', async function (this: CustomWorld) {
  // Verify behavior change by triggering a notification
  await this.apiRequest('POST', '/api/notifications/trigger', {
    type: 'test',
    userId: this.testData.currentUser.id
  });
  
  // Check that notification follows new preferences
  const deliveryResponse = await this.apiRequest('GET', '/api/notifications/delivery-status');
  expect(deliveryResponse.data.pushDelivered).toBe(false);
  expect(deliveryResponse.data.emailDelivered).toBe(true);
});

Then('the response should contain validation errors', async function (this: CustomWorld) {
  expect(this.testData.lastApiResponse.data).toHaveProperty('errors');
  expect(Array.isArray(this.testData.lastApiResponse.data.errors)).toBe(true);
  expect(this.testData.lastApiResponse.data.errors.length).toBeGreaterThan(0);
});

Then('my notification preferences should remain unchanged', async function (this: CustomWorld) {
  const currentPreferences = await this.apiRequest('GET', '/api/notifications/preferences');
  // Verify preferences haven't changed from invalid request
  expect(currentPreferences.data.preferences.pushNotifications).toBe(true); // Should still be original value
});

Then('the response should contain an error message', async function (this: CustomWorld) {
  expect(this.testData.lastApiResponse.data).toHaveProperty('error');
  expect(typeof this.testData.lastApiResponse.data.error).toBe('string');
});

// Visual and UX Assertions
Then('I should see match notifications with heart icons', async function (this: CustomWorld) {
  const matchNotifications = this.page!.locator('[data-testid="notification-item"][data-type="match"]');
  const heartIcon = matchNotifications.first().locator('[data-testid="heart-icon"]');
  await expect(heartIcon).toBeVisible();
});

Then('I should see message notifications with chat icons', async function (this: CustomWorld) {
  const messageNotifications = this.page!.locator('[data-testid="notification-item"][data-type="message"]');
  const chatIcon = messageNotifications.first().locator('[data-testid="chat-icon"]');
  await expect(chatIcon).toBeVisible();
});

Then('I should see like notifications with thumbs up icons', async function (this: CustomWorld) {
  const likeNotifications = this.page!.locator('[data-testid="notification-item"][data-type="like"]');
  const thumbsUpIcon = likeNotifications.first().locator('[data-testid="thumbs-up-icon"]');
  await expect(thumbsUpIcon).toBeVisible();
});

Then('I should see system notifications with info icons', async function (this: CustomWorld) {
  const systemNotifications = this.page!.locator('[data-testid="notification-item"][data-type="system"]');
  const infoIcon = systemNotifications.first().locator('[data-testid="info-icon"]');
  await expect(infoIcon).toBeVisible();
});

Then('it should be marked as high priority', async function (this: CustomWorld) {
  const priorityNotification = this.page!.locator('[data-testid="notification-item"][data-priority="high"]');
  await expect(priorityNotification).toBeVisible();
});

Then('it should appear at the top of the notification list', async function (this: CustomWorld) {
  const firstNotification = this.page!.locator('[data-testid="notification-item"]').first();
  const priority = await firstNotification.getAttribute('data-priority');
  expect(priority).toBe('high');
});

Then('it should have a distinct visual indicator', async function (this: CustomWorld) {
  const priorityIndicator = this.page!.locator('[data-testid="priority-indicator"]');
  await expect(priorityIndicator).toBeVisible();
});

Then('similar notifications should be grouped together', async function (this: CustomWorld) {
  const groupedNotification = this.page!.locator('[data-testid="grouped-notification"]');
  await expect(groupedNotification).toBeVisible();
});

Then('I should see a summary like {string}', async function (this: CustomWorld, summaryText: string) {
  const summaryElement = this.page!.locator('[data-testid="notification-summary"]');
  await expect(summaryElement).toContainText(summaryText);
});

Then('I should be able to expand to see individual notifications', async function (this: CustomWorld) {
  const expandButton = this.page!.locator('[data-testid="expand-notifications"]');
  await expandButton.click();
  
  const individualNotifications = this.page!.locator('[data-testid="individual-notification"]');
  const count = await individualNotifications.count();
  expect(count).toBeGreaterThan(1);
});

Then('I should hear the match notification sound', async function (this: CustomWorld) {
  // Check for audio element or sound trigger
  const audioElement = this.page!.locator('audio[data-sound="match"]');
  await expect(audioElement).toBeAttached();
});

Then('I should hear the message notification sound', async function (this: CustomWorld) {
  const audioElement = this.page!.locator('audio[data-sound="message"]');
  await expect(audioElement).toBeAttached();
});

Then('the device should vibrate', async function (this: CustomWorld) {
  // Check for vibration API call (this would be mocked in tests)
  const vibrationTrigger = this.page!.locator('[data-testid="vibration-triggered"]');
  await expect(vibrationTrigger).toBeVisible();
});

Then('the vibration pattern should match the notification type', async function (this: CustomWorld) {
  const vibrationPattern = await this.page!.locator('[data-testid="vibration-pattern"]').getAttribute('data-pattern');
  expect(vibrationPattern).toBeTruthy();
});

Then('I should not receive push notifications', async function (this: CustomWorld) {
  // Verify no push notifications during DND
  const pushNotifications = this.page!.locator('[data-testid="push-notification"]');
  await expect(pushNotifications).toHaveCount(0);
});

Then('I should still see in-app notifications when I open the app', async function (this: CustomWorld) {
  const inAppNotifications = this.page!.locator('[data-testid="in-app-notification"]');
  await expect(inAppNotifications).toBeVisible();
});

Then('notifications should be queued for later delivery', async function (this: CustomWorld) {
  const queuedNotifications = await this.apiRequest('GET', '/api/notifications/queued');
  expect(queuedNotifications.data.queued.length).toBeGreaterThan(0);
});

// Mobile and Accessibility Assertions
Then('the notification panel should be touch-friendly', async function (this: CustomWorld) {
  const notificationItems = this.page!.locator('[data-testid="notification-item"]');
  const firstItem = notificationItems.first();
  const boundingBox = await firstItem.boundingBox();
  
  if (boundingBox) {
    expect(boundingBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target
  }
});

Then('notifications should be easy to swipe and dismiss', async function (this: CustomWorld) {
  const firstNotification = this.page!.locator('[data-testid="notification-item"]').first();
  
  // Simulate swipe gesture
  await firstNotification.hover();
  await this.page!.mouse.down();
  await this.page!.mouse.move(100, 0); // Swipe right
  await this.page!.mouse.up();
  
  // Check for dismiss action
  const dismissButton = this.page!.locator('[data-testid="dismiss-notification"]');
  await expect(dismissButton).toBeVisible();
});

Then('the notification layout should be optimized for mobile', async function (this: CustomWorld) {
  const notificationPanel = this.page!.locator('[data-testid="notifications-panel"]');
  const boundingBox = await notificationPanel.boundingBox();
  
  if (boundingBox) {
    expect(boundingBox.width).toBeLessThanOrEqual(375); // Mobile viewport width
  }
});

Then('all notifications should have proper ARIA labels', async function (this: CustomWorld) {
  const notifications = this.page!.locator('[data-testid="notification-item"]');
  const count = await notifications.count();
  
  for (let i = 0; i < count; i++) {
    const notification = notifications.nth(i);
    const ariaLabel = await notification.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  }
});

Then('notifications should be announced by screen readers', async function (this: CustomWorld) {
  const liveRegion = this.page!.locator('[aria-live="polite"]');
  await expect(liveRegion).toBeVisible();
});

Then('I should be able to navigate notifications with keyboard', async function (this: CustomWorld) {
  await this.page!.keyboard.press('Tab');
  const focusedElement = await this.page!.locator(':focus').first();
  await expect(focusedElement).toHaveAttribute('data-testid', 'notification-item');
});

Then('notification actions should be accessible', async function (this: CustomWorld) {
  const actionButtons = this.page!.locator('[data-testid="notification-action"]');
  const firstButton = actionButtons.first();
  
  await expect(firstButton).toBeVisible();
  await expect(firstButton).toBeFocusable();
});

// Performance Assertions
Then('the notifications should load within 2 seconds', async function (this: CustomWorld) {
  const startTime = Date.now();
  await this.waitForElement('[data-testid="notifications-list"]');
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000);
});

Then('scrolling through notifications should be smooth', async function (this: CustomWorld) {
  const notificationsList = this.page!.locator('[data-testid="notifications-list"]');
  
  // Simulate scrolling
  await notificationsList.hover();
  await this.page!.mouse.wheel(0, 500);
  
  // Check that scrolling works without lag
  await this.page!.waitForTimeout(100);
  const scrollTop = await notificationsList.evaluate(el => el.scrollTop);
  expect(scrollTop).toBeGreaterThan(0);
});

Then('the app should remain responsive', async function (this: CustomWorld) {
  // Test that other UI elements remain interactive
  const navigationButton = this.page!.locator('[data-testid="navigation-button"]');
  await expect(navigationButton).toBeEnabled();
});

// Offline and Sync Assertions
Then('I should receive all missed notifications', async function (this: CustomWorld) {
  const notificationsResponse = await this.apiRequest('GET', '/api/notifications');
  const notifications = notificationsResponse.data.notifications;
  
  // Check that offline notifications are included
  const offlineNotificationCount = this.testData.offlineNotifications.length;
  expect(notifications.length).toBeGreaterThanOrEqual(offlineNotificationCount);
});

Then('notifications should be delivered in the correct order', async function (this: CustomWorld) {
  const notificationsResponse = await this.apiRequest('GET', '/api/notifications');
  const notifications = notificationsResponse.data.notifications;
  
  // Verify notifications are ordered by timestamp
  for (let i = 1; i < notifications.length; i++) {
    const prevTimestamp = new Date(notifications[i - 1].timestamp);
    const currentTimestamp = new Date(notifications[i].timestamp);
    expect(currentTimestamp.getTime()).toBeLessThanOrEqual(prevTimestamp.getTime());
  }
});

// Privacy Assertions
Then('the notification should not show the message content', async function (this: CustomWorld) {
  const notificationContent = this.page!.locator('[data-testid="notification-content"]');
  const content = await notificationContent.textContent();
  expect(content).not.toContain('Hello! How are you?'); // Actual message content
});

Then('the notification should only show {string}', async function (this: CustomWorld, expectedText: string) {
  const notificationContent = this.page!.locator('[data-testid="notification-content"]');
  await expect(notificationContent).toContainText(expectedText);
});

Then('I should need to open the app to see the content', async function (this: CustomWorld) {
  // Verify that full content is only visible in the app
  await this.navigateTo('/conversations');
  const messageContent = this.page!.locator('[data-testid="message-content"]');
  await expect(messageContent).toContainText('Hello! How are you?');
});

// Batch and Analytics Assertions
Then('I should receive notifications in a single batch', async function (this: CustomWorld) {
  const batchNotification = this.page!.locator('[data-testid="batch-notification"]');
  await expect(batchNotification).toBeVisible();
});

Then('the notifications should be ordered by priority', async function (this: CustomWorld) {
  const notifications = this.page!.locator('[data-testid="notification-item"]');
  const firstNotification = notifications.first();
  const priority = await firstNotification.getAttribute('data-priority');
  expect(priority).toBe('high');
});

Then('I should not be overwhelmed with individual notifications', async function (this: CustomWorld) {
  // Verify that notifications are batched rather than sent individually
  const individualNotifications = this.page!.locator('[data-testid="individual-push-notification"]');
  const count = await individualNotifications.count();
  expect(count).toBeLessThanOrEqual(1); // Should be batched
});

Then('I should be taken to the unsubscribe page', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="unsubscribe-page"]');
  const unsubscribePage = this.page!.locator('[data-testid="unsubscribe-page"]');
  await expect(unsubscribePage).toBeVisible();
});

Then('I should be able to choose which emails to unsubscribe from', async function (this: CustomWorld) {
  const emailOptions = this.page!.locator('[data-testid="email-option"]');
  const optionCount = await emailOptions.count();
  expect(optionCount).toBeGreaterThan(1);
});

Then('my preferences should be updated immediately', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="unsubscribe-button"]');
  
  // Verify preferences are updated
  const preferencesResponse = await this.apiRequest('GET', '/api/notifications/preferences');
  expect(preferencesResponse.data.preferences.emailNotifications).toBe(false);
});

Then('I should see delivery rates for different notification types', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="delivery-rates"]');
  const deliveryRates = this.page!.locator('[data-testid="delivery-rates"]');
  await expect(deliveryRates).toBeVisible();
});

Then('I should see user engagement with notifications', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="engagement-metrics"]');
  const engagementMetrics = this.page!.locator('[data-testid="engagement-metrics"]');
  await expect(engagementMetrics).toBeVisible();
});

Then('I should see notification performance metrics', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="performance-metrics"]');
  const performanceMetrics = this.page!.locator('[data-testid="performance-metrics"]');
  await expect(performanceMetrics).toBeVisible();
});