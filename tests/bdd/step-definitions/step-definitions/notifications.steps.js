"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
// Background Steps
(0, cucumber_1.Given)('I have enabled push notifications', async function () {
    // Set up push notification permissions
    await this.page.context().grantPermissions(['notifications']);
    // Enable push notifications in user settings
    await this.apiRequest('PUT', '/api/notifications/preferences', {
        pushNotifications: true,
        types: ['matches', 'messages', 'likes']
    });
    this.testData.notificationsEnabled = true;
});
(0, cucumber_1.Given)('I have a new mutual match', async function () {
    // Create a mutual match for the user
    const matchUser = this.generateTestUser();
    const matchResponse = await this.apiRequest('POST', '/api/matches', {
        userId: this.testData.currentUser.id,
        targetUserId: matchUser.id,
        type: 'mutual'
    });
    (0, test_1.expect)(matchResponse.status).toBe(201);
    this.testData.newMatch = matchResponse.data.match;
});
(0, cucumber_1.Given)('I have an active conversation', async function () {
    // Create an active conversation
    const conversationResponse = await this.apiRequest('POST', '/api/conversations', {
        participantIds: [this.testData.currentUser.id, this.testData.targetUserId]
    });
    (0, test_1.expect)(conversationResponse.status).toBe(201);
    this.testData.activeConversation = conversationResponse.data.conversation;
});
(0, cucumber_1.Given)('I have unread notifications', async function () {
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
(0, cucumber_1.Given)('I have multiple notifications', async function () {
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
(0, cucumber_1.Given)('I have enabled email notifications', async function () {
    await this.apiRequest('PUT', '/api/notifications/preferences', {
        emailNotifications: true,
        emailTypes: ['matches', 'messages', 'digest']
    });
    this.testData.emailNotificationsEnabled = true;
});
(0, cucumber_1.Given)('I have enabled weekly digest emails', async function () {
    await this.apiRequest('PUT', '/api/notifications/preferences', {
        emailNotifications: true,
        weeklyDigest: true
    });
});
(0, cucumber_1.Given)('it\'s time for the weekly digest', async function () {
    // Simulate weekly digest trigger time
    this.testData.digestTime = new Date();
    this.testData.digestTime.setDate(this.testData.digestTime.getDate() - 7);
});
(0, cucumber_1.Given)('I am on the notification settings page', async function () {
    await this.navigateTo('/settings/notifications');
    await this.waitForElement('[data-testid="notification-settings"]');
});
(0, cucumber_1.Given)('I have the app open', async function () {
    await this.navigateTo('/dashboard');
    await this.waitForElement('[data-testid="dashboard"]');
});
(0, cucumber_1.Given)('I have enabled real-time notifications', async function () {
    await this.apiRequest('PUT', '/api/notifications/preferences', {
        realTimeNotifications: true
    });
});
(0, cucumber_1.Given)('I have an unread notification with ID {string}', async function (notificationId) {
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
(0, cucumber_1.Given)('I have a notification with ID {string}', async function (notificationId) {
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
(0, cucumber_1.Given)('I have various types of notifications', async function () {
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
(0, cucumber_1.Given)('I receive a super like notification', async function () {
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
(0, cucumber_1.Given)('I receive multiple like notifications', async function () {
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
(0, cucumber_1.Given)('I have enabled notification sounds', async function () {
    await this.apiRequest('PUT', '/api/notifications/preferences', {
        soundEnabled: true,
        matchSound: 'match_sound.mp3',
        messageSound: 'message_sound.mp3'
    });
});
(0, cucumber_1.Given)('I am using a mobile device', async function () {
    await this.page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    this.testData.isMobile = true;
});
(0, cucumber_1.Given)('I have enabled vibration for notifications', async function () {
    await this.apiRequest('PUT', '/api/notifications/preferences', {
        vibrationEnabled: true
    });
});
(0, cucumber_1.Given)('I have enabled do not disturb mode', async function () {
    await this.apiRequest('PUT', '/api/notifications/preferences', {
        doNotDisturb: true,
        doNotDisturbStart: '22:00',
        doNotDisturbEnd: '08:00'
    });
});
(0, cucumber_1.Given)('I have many notifications', async function () {
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
(0, cucumber_1.Given)('I lose internet connectivity', async function () {
    await this.page.context().setOffline(true);
    this.testData.isOffline = true;
});
(0, cucumber_1.Given)('I receive notifications while offline', async function () {
    // Simulate notifications that would be received while offline
    this.testData.offlineNotifications = [
        { type: 'message', message: 'Offline message 1' },
        { type: 'like', message: 'Offline like 1' }
    ];
});
(0, cucumber_1.Given)('I have enabled privacy mode', async function () {
    await this.apiRequest('PUT', '/api/notifications/preferences', {
        privacyMode: true,
        hideMessageContent: true
    });
});
(0, cucumber_1.Given)('I have multiple pending notifications', async function () {
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
(0, cucumber_1.Given)('I receive an email notification', async function () {
    // Simulate receiving an email notification
    this.testData.emailNotification = {
        to: this.testData.currentUser.email,
        subject: 'You have a new match!',
        unsubscribeLink: 'https://app.example.com/unsubscribe?token=abc123'
    };
});
(0, cucumber_1.Given)('I am an admin user', async function () {
    // Set user as admin
    await this.apiRequest('PUT', '/api/users/role', {
        userId: this.testData.currentUser.id,
        role: 'admin'
    });
    this.testData.currentUser.role = 'admin';
});
// When Steps - Actions
(0, cucumber_1.When)('the match is created', async function () {
    // Trigger match creation event
    await this.apiRequest('POST', '/api/matches/trigger-notification', {
        matchId: this.testData.newMatch.id
    });
});
(0, cucumber_1.When)('I receive a new message', async function () {
    // Send a message to trigger notification
    const messageResponse = await this.apiRequest('POST', '/api/messages', {
        conversationId: this.testData.activeConversation.id,
        senderId: this.testData.targetUserId,
        content: 'Hello! How are you?',
        type: 'text'
    });
    (0, test_1.expect)(messageResponse.status).toBe(201);
    this.testData.newMessage = messageResponse.data.message;
});
(0, cucumber_1.When)('I open the notifications panel', async function () {
    await this.clickElement('[data-testid="notifications-button"]');
    await this.waitForElement('[data-testid="notifications-panel"]');
});
(0, cucumber_1.When)('I click on a notification', async function () {
    const firstNotification = this.page.locator('[data-testid="notification-item"]').first();
    await firstNotification.click();
});
(0, cucumber_1.When)('I click the {string} button', async function (buttonText) {
    const button = this.page.locator(`button:has-text("${buttonText}")`);
    await button.click();
});
(0, cucumber_1.When)('I confirm the action', async function () {
    await this.clickElement('[data-testid="confirm-button"]');
});
(0, cucumber_1.When)('the digest is generated', async function () {
    // Trigger weekly digest generation
    await this.apiRequest('POST', '/api/notifications/digest/generate', {
        userId: this.testData.currentUser.id,
        type: 'weekly'
    });
});
(0, cucumber_1.When)('I toggle push notifications off', async function () {
    const pushToggle = this.page.locator('[data-testid="push-notifications-toggle"]');
    await pushToggle.click();
});
(0, cucumber_1.When)('I save the settings', async function () {
    await this.clickElement('[data-testid="save-settings-button"]');
    await this.waitForElement('[data-testid="settings-saved"]');
});
(0, cucumber_1.When)('I enable notifications for matches only', async function () {
    await this.clickElement('[data-testid="matches-notifications-checkbox"]');
});
(0, cucumber_1.When)('I disable notifications for messages', async function () {
    const messageToggle = this.page.locator('[data-testid="messages-notifications-checkbox"]');
    if (await messageToggle.isChecked()) {
        await messageToggle.click();
    }
});
(0, cucumber_1.When)('I set quiet hours from 10 PM to 8 AM', async function () {
    await this.fillField('[data-testid="quiet-hours-start"]', '22:00');
    await this.fillField('[data-testid="quiet-hours-end"]', '08:00');
});
(0, cucumber_1.When)('I read a notification', async function () {
    const firstUnreadNotification = this.page.locator('[data-testid="notification-item"][data-read="false"]').first();
    await firstUnreadNotification.click();
});
(0, cucumber_1.When)('I send a GET request to {string}', async function (endpoint) {
    this.testData.lastApiResponse = await this.apiRequest('GET', endpoint);
});
(0, cucumber_1.When)('I send a PUT request to {string}', async function (endpoint) {
    this.testData.lastApiResponse = await this.apiRequest('PUT', endpoint, {
        read: true
    });
});
(0, cucumber_1.When)('I send a DELETE request to {string}', async function (endpoint) {
    this.testData.lastApiResponse = await this.apiRequest('DELETE', endpoint);
});
(0, cucumber_1.When)('I send a PUT request to {string} with updated settings', async function (endpoint) {
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
(0, cucumber_1.When)('I send a PUT request to {string} with invalid data', async function (endpoint) {
    const invalidData = {
        pushNotifications: 'invalid', // Should be boolean
        types: 'invalid', // Should be array
        quietHours: 'invalid' // Should be object
    };
    this.testData.lastApiResponse = await this.apiRequest('PUT', endpoint, invalidData);
});
(0, cucumber_1.When)('I view my notifications', async function () {
    await this.navigateTo('/notifications');
    await this.waitForElement('[data-testid="notifications-list"]');
});
(0, cucumber_1.When)('the notification is delivered', async function () {
    // Wait for notification to be processed
    await this.page.waitForTimeout(1000);
});
(0, cucumber_1.When)('I receive a new match notification', async function () {
    // Simulate receiving a match notification
    await this.apiRequest('POST', '/api/notifications/trigger', {
        type: 'match',
        userId: this.testData.currentUser.id
    });
});
(0, cucumber_1.When)('I receive a message notification', async function () {
    // Simulate receiving a message notification
    await this.apiRequest('POST', '/api/notifications/trigger', {
        type: 'message',
        userId: this.testData.currentUser.id
    });
});
(0, cucumber_1.When)('I receive a notification', async function () {
    // Simulate receiving a general notification
    await this.apiRequest('POST', '/api/notifications/trigger', {
        type: 'like',
        userId: this.testData.currentUser.id
    });
});
(0, cucumber_1.When)('I receive notifications', async function () {
    // Simulate receiving multiple notifications
    const notificationTypes = ['match', 'message', 'like'];
    for (const type of notificationTypes) {
        await this.apiRequest('POST', '/api/notifications/trigger', {
            type,
            userId: this.testData.currentUser.id
        });
    }
});
(0, cucumber_1.When)('I open the notifications panel', async function () {
    await this.clickElement('[data-testid="notifications-button"]');
    await this.waitForElement('[data-testid="notifications-panel"]');
});
(0, cucumber_1.When)('connectivity is restored', async function () {
    await this.page.context().setOffline(false);
    this.testData.isOffline = false;
});
(0, cucumber_1.When)('the batch delivery time arrives', async function () {
    // Trigger batch delivery
    await this.apiRequest('POST', '/api/notifications/batch-deliver', {
        userId: this.testData.currentUser.id
    });
});
(0, cucumber_1.When)('I click the unsubscribe link', async function () {
    // Navigate to unsubscribe page
    await this.navigateTo('/unsubscribe?token=abc123');
    await this.waitForElement('[data-testid="unsubscribe-page"]');
});
(0, cucumber_1.When)('I view notification analytics', async function () {
    await this.navigateTo('/admin/analytics/notifications');
    await this.waitForElement('[data-testid="notification-analytics"]');
});
(0, cucumber_1.When)('I make changes to my profile', async function () {
    // Simulate making profile changes while offline
    this.testData.offlineChanges = {
        name: 'Offline Updated Name',
        bio: 'Updated while offline'
    };
});
// Then Steps - Assertions
(0, cucumber_1.Then)('I should receive a push notification', async function () {
    // Check for push notification (this would typically involve checking browser notifications API)
    await this.waitForElement('[data-testid="push-notification"]');
    const pushNotification = this.page.locator('[data-testid="push-notification"]');
    await (0, test_1.expect)(pushNotification).toBeVisible();
});
(0, cucumber_1.Then)('the notification should contain the match information', async function () {
    const notificationContent = this.page.locator('[data-testid="notification-content"]');
    await (0, test_1.expect)(notificationContent).toContainText('match');
});
(0, cucumber_1.Then)('the notification should have a deep link to the match', async function () {
    const notificationLink = this.page.locator('[data-testid="notification-link"]');
    const href = await notificationLink.getAttribute('href');
    (0, test_1.expect)(href).toContain('/matches/');
});
(0, cucumber_1.Then)('the notification should contain the message preview', async function () {
    const notificationContent = this.page.locator('[data-testid="notification-content"]');
    await (0, test_1.expect)(notificationContent).toContainText('Hello! How are you?');
});
(0, cucumber_1.Then)('the notification should have a deep link to the conversation', async function () {
    const notificationLink = this.page.locator('[data-testid="notification-link"]');
    const href = await notificationLink.getAttribute('href');
    (0, test_1.expect)(href).toContain('/conversations/');
});
(0, cucumber_1.Then)('I should see a list of my notifications', async function () {
    await this.waitForElement('[data-testid="notifications-list"]');
    const notificationsList = this.page.locator('[data-testid="notifications-list"]');
    await (0, test_1.expect)(notificationsList).toBeVisible();
    const notifications = this.page.locator('[data-testid="notification-item"]');
    const notificationCount = await notifications.count();
    (0, test_1.expect)(notificationCount).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('each notification should show the type and timestamp', async function () {
    const notifications = this.page.locator('[data-testid="notification-item"]');
    const firstNotification = notifications.first();
    await (0, test_1.expect)(firstNotification.locator('[data-testid="notification-type"]')).toBeVisible();
    await (0, test_1.expect)(firstNotification.locator('[data-testid="notification-timestamp"]')).toBeVisible();
});
(0, cucumber_1.Then)('unread notifications should be highlighted', async function () {
    const unreadNotifications = this.page.locator('[data-testid="notification-item"][data-read="false"]');
    const firstUnread = unreadNotifications.first();
    await (0, test_1.expect)(firstUnread).toHaveClass(/unread/);
});
(0, cucumber_1.Then)('the notification should be marked as read', async function () {
    await this.waitForElement('[data-testid="notification-read"]');
    const readNotification = this.page.locator('[data-testid="notification-read"]');
    await (0, test_1.expect)(readNotification).toBeVisible();
});
(0, cucumber_1.Then)('the notification count should decrease', async function () {
    const notificationBadge = this.page.locator('[data-testid="notification-badge"]');
    const badgeText = await notificationBadge.textContent();
    const count = parseInt(badgeText || '0');
    (0, test_1.expect)(count).toBeLessThan(this.testData.unreadNotifications.length);
});
(0, cucumber_1.Then)('I should be navigated to the relevant content', async function () {
    // Check that we're navigated to the correct page
    const currentUrl = this.page.url();
    (0, test_1.expect)(currentUrl).toMatch(/(matches|conversations|profile)/);
});
(0, cucumber_1.Then)('all notifications should be removed', async function () {
    const notifications = this.page.locator('[data-testid="notification-item"]');
    const notificationCount = await notifications.count();
    (0, test_1.expect)(notificationCount).toBe(0);
});
(0, cucumber_1.Then)('the notification count should be zero', async function () {
    const notificationBadge = this.page.locator('[data-testid="notification-badge"]');
    await (0, test_1.expect)(notificationBadge).not.toBeVisible();
});
(0, cucumber_1.Then)('I should receive an email notification', async function () {
    // Check for email notification (this would typically involve checking email service)
    const emailResponse = await this.apiRequest('GET', '/api/notifications/emails/recent');
    (0, test_1.expect)(emailResponse.status).toBe(200);
    (0, test_1.expect)(emailResponse.data.emails.length).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('the email should contain match details', async function () {
    const emailResponse = await this.apiRequest('GET', '/api/notifications/emails/recent');
    const latestEmail = emailResponse.data.emails[0];
    (0, test_1.expect)(latestEmail.subject).toContain('match');
    (0, test_1.expect)(latestEmail.content).toContain('new match');
});
(0, cucumber_1.Then)('the email should have a link to view the match', async function () {
    const emailResponse = await this.apiRequest('GET', '/api/notifications/emails/recent');
    const latestEmail = emailResponse.data.emails[0];
    (0, test_1.expect)(latestEmail.content).toContain('href');
    (0, test_1.expect)(latestEmail.content).toContain('/matches/');
});
(0, cucumber_1.Then)('I should receive a digest email', async function () {
    const emailResponse = await this.apiRequest('GET', '/api/notifications/emails/digest');
    (0, test_1.expect)(emailResponse.status).toBe(200);
    (0, test_1.expect)(emailResponse.data.digest).toBeDefined();
});
(0, cucumber_1.Then)('the email should contain my activity summary', async function () {
    const emailResponse = await this.apiRequest('GET', '/api/notifications/emails/digest');
    const digest = emailResponse.data.digest;
    (0, test_1.expect)(digest.content).toContain('activity');
    (0, test_1.expect)(digest.content).toContain('summary');
});
(0, cucumber_1.Then)('the email should contain new matches and messages', async function () {
    const emailResponse = await this.apiRequest('GET', '/api/notifications/emails/digest');
    const digest = emailResponse.data.digest;
    (0, test_1.expect)(digest.content).toContain('matches');
    (0, test_1.expect)(digest.content).toContain('messages');
});
(0, cucumber_1.Then)('push notifications should be disabled', async function () {
    const settingsResponse = await this.apiRequest('GET', '/api/notifications/preferences');
    (0, test_1.expect)(settingsResponse.data.preferences.pushNotifications).toBe(false);
});
(0, cucumber_1.Then)('I should not receive push notifications', async function () {
    // Trigger a notification and verify it's not pushed
    await this.apiRequest('POST', '/api/notifications/trigger', {
        type: 'test',
        userId: this.testData.currentUser.id
    });
    // Wait and check that no push notification appears
    await this.page.waitForTimeout(2000);
    const pushNotification = this.page.locator('[data-testid="push-notification"]');
    await (0, test_1.expect)(pushNotification).not.toBeVisible();
});
(0, cucumber_1.Then)('I should only receive match notifications', async function () {
    const settingsResponse = await this.apiRequest('GET', '/api/notifications/preferences');
    const enabledTypes = settingsResponse.data.preferences.types;
    (0, test_1.expect)(enabledTypes).toContain('matches');
    (0, test_1.expect)(enabledTypes).not.toContain('messages');
});
(0, cucumber_1.Then)('I should not receive message notifications', async function () {
    // Trigger a message notification and verify it's filtered
    await this.apiRequest('POST', '/api/notifications/trigger', {
        type: 'message',
        userId: this.testData.currentUser.id
    });
    const notificationsResponse = await this.apiRequest('GET', '/api/notifications');
    const messageNotifications = notificationsResponse.data.notifications.filter((n) => n.type === 'message');
    (0, test_1.expect)(messageNotifications.length).toBe(0);
});
(0, cucumber_1.Then)('I should not receive notifications during quiet hours', async function () {
    // Simulate quiet hours and verify notifications are suppressed
    const currentTime = new Date();
    currentTime.setHours(23, 0, 0, 0); // 11 PM
    await this.apiRequest('POST', '/api/notifications/trigger', {
        type: 'test',
        userId: this.testData.currentUser.id,
        timestamp: currentTime.toISOString()
    });
    const notificationsResponse = await this.apiRequest('GET', '/api/notifications/delivered');
    (0, test_1.expect)(notificationsResponse.data.delivered).toBe(false);
});
(0, cucumber_1.Then)('notifications should resume after quiet hours', async function () {
    // Simulate after quiet hours
    const currentTime = new Date();
    currentTime.setHours(9, 0, 0, 0); // 9 AM
    await this.apiRequest('POST', '/api/notifications/trigger', {
        type: 'test',
        userId: this.testData.currentUser.id,
        timestamp: currentTime.toISOString()
    });
    const notificationsResponse = await this.apiRequest('GET', '/api/notifications/delivered');
    (0, test_1.expect)(notificationsResponse.data.delivered).toBe(true);
});
(0, cucumber_1.Then)('I should see an in-app notification immediately', async function () {
    await this.waitForElement('[data-testid="in-app-notification"]');
    const inAppNotification = this.page.locator('[data-testid="in-app-notification"]');
    await (0, test_1.expect)(inAppNotification).toBeVisible();
});
(0, cucumber_1.Then)('the notification should appear without page refresh', async function () {
    // Verify notification appears via real-time update
    const notification = this.page.locator('[data-testid="real-time-notification"]');
    await (0, test_1.expect)(notification).toBeVisible();
});
(0, cucumber_1.Then)('I should see a notification badge with the count', async function () {
    const notificationBadge = this.page.locator('[data-testid="notification-badge"]');
    await (0, test_1.expect)(notificationBadge).toBeVisible();
    const badgeText = await notificationBadge.textContent();
    const count = parseInt(badgeText || '0');
    (0, test_1.expect)(count).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('the badge count should update immediately', async function () {
    // Wait for real-time update
    await this.page.waitForTimeout(500);
    const notificationBadge = this.page.locator('[data-testid="notification-badge"]');
    const badgeText = await notificationBadge.textContent();
    const newCount = parseInt(badgeText || '0');
    (0, test_1.expect)(newCount).toBeLessThan(this.testData.unreadNotifications.length);
});
// API Assertion Steps
(0, cucumber_1.Then)('the API should respond with status code {int}', async function (statusCode) {
    (0, test_1.expect)(this.testData.lastApiResponse.status).toBe(statusCode);
});
(0, cucumber_1.Then)('the response should contain my notifications', async function () {
    (0, test_1.expect)(this.testData.lastApiResponse.data).toHaveProperty('notifications');
    (0, test_1.expect)(Array.isArray(this.testData.lastApiResponse.data.notifications)).toBe(true);
});
(0, cucumber_1.Then)('each notification should have id, type, message, timestamp, and read status', async function () {
    const notifications = this.testData.lastApiResponse.data.notifications;
    (0, test_1.expect)(notifications.length).toBeGreaterThan(0);
    const firstNotification = notifications[0];
    (0, test_1.expect)(firstNotification).toHaveProperty('id');
    (0, test_1.expect)(firstNotification).toHaveProperty('type');
    (0, test_1.expect)(firstNotification).toHaveProperty('message');
    (0, test_1.expect)(firstNotification).toHaveProperty('timestamp');
    (0, test_1.expect)(firstNotification).toHaveProperty('read');
});
(0, cucumber_1.Then)('the notification should be marked as read', async function () {
    // Verify via API that notification is marked as read
    const verifyResponse = await this.apiRequest('GET', `/api/notifications/${this.testData.testNotificationId}`);
    (0, test_1.expect)(verifyResponse.data.notification.read).toBe(true);
});
(0, cucumber_1.Then)('subsequent API calls should show the notification as read', async function () {
    const notificationsResponse = await this.apiRequest('GET', '/api/notifications');
    const notification = notificationsResponse.data.notifications.find((n) => n.id === this.testData.testNotificationId);
    (0, test_1.expect)(notification.read).toBe(true);
});
(0, cucumber_1.Then)('the notification should be removed', async function () {
    // Verify notification is deleted
    const verifyResponse = await this.apiRequest('GET', `/api/notifications/${this.testData.testNotificationId}`);
    (0, test_1.expect)(verifyResponse.status).toBe(404);
});
(0, cucumber_1.Then)('subsequent API calls should not include the notification', async function () {
    const notificationsResponse = await this.apiRequest('GET', '/api/notifications');
    const notification = notificationsResponse.data.notifications.find((n) => n.id === this.testData.testNotificationId);
    (0, test_1.expect)(notification).toBeUndefined();
});
(0, cucumber_1.Then)('the response should contain the updated preferences', async function () {
    (0, test_1.expect)(this.testData.lastApiResponse.data).toHaveProperty('preferences');
    const preferences = this.testData.lastApiResponse.data.preferences;
    (0, test_1.expect)(preferences.pushNotifications).toBe(false);
    (0, test_1.expect)(preferences.emailNotifications).toBe(true);
});
(0, cucumber_1.Then)('my notification behavior should change accordingly', async function () {
    // Verify behavior change by triggering a notification
    await this.apiRequest('POST', '/api/notifications/trigger', {
        type: 'test',
        userId: this.testData.currentUser.id
    });
    // Check that notification follows new preferences
    const deliveryResponse = await this.apiRequest('GET', '/api/notifications/delivery-status');
    (0, test_1.expect)(deliveryResponse.data.pushDelivered).toBe(false);
    (0, test_1.expect)(deliveryResponse.data.emailDelivered).toBe(true);
});
(0, cucumber_1.Then)('the response should contain validation errors', async function () {
    (0, test_1.expect)(this.testData.lastApiResponse.data).toHaveProperty('errors');
    (0, test_1.expect)(Array.isArray(this.testData.lastApiResponse.data.errors)).toBe(true);
    (0, test_1.expect)(this.testData.lastApiResponse.data.errors.length).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('my notification preferences should remain unchanged', async function () {
    const currentPreferences = await this.apiRequest('GET', '/api/notifications/preferences');
    // Verify preferences haven't changed from invalid request
    (0, test_1.expect)(currentPreferences.data.preferences.pushNotifications).toBe(true); // Should still be original value
});
(0, cucumber_1.Then)('the response should contain an error message', async function () {
    (0, test_1.expect)(this.testData.lastApiResponse.data).toHaveProperty('error');
    (0, test_1.expect)(typeof this.testData.lastApiResponse.data.error).toBe('string');
});
// Visual and UX Assertions
(0, cucumber_1.Then)('I should see match notifications with heart icons', async function () {
    const matchNotifications = this.page.locator('[data-testid="notification-item"][data-type="match"]');
    const heartIcon = matchNotifications.first().locator('[data-testid="heart-icon"]');
    await (0, test_1.expect)(heartIcon).toBeVisible();
});
(0, cucumber_1.Then)('I should see message notifications with chat icons', async function () {
    const messageNotifications = this.page.locator('[data-testid="notification-item"][data-type="message"]');
    const chatIcon = messageNotifications.first().locator('[data-testid="chat-icon"]');
    await (0, test_1.expect)(chatIcon).toBeVisible();
});
(0, cucumber_1.Then)('I should see like notifications with thumbs up icons', async function () {
    const likeNotifications = this.page.locator('[data-testid="notification-item"][data-type="like"]');
    const thumbsUpIcon = likeNotifications.first().locator('[data-testid="thumbs-up-icon"]');
    await (0, test_1.expect)(thumbsUpIcon).toBeVisible();
});
(0, cucumber_1.Then)('I should see system notifications with info icons', async function () {
    const systemNotifications = this.page.locator('[data-testid="notification-item"][data-type="system"]');
    const infoIcon = systemNotifications.first().locator('[data-testid="info-icon"]');
    await (0, test_1.expect)(infoIcon).toBeVisible();
});
(0, cucumber_1.Then)('it should be marked as high priority', async function () {
    const priorityNotification = this.page.locator('[data-testid="notification-item"][data-priority="high"]');
    await (0, test_1.expect)(priorityNotification).toBeVisible();
});
(0, cucumber_1.Then)('it should appear at the top of the notification list', async function () {
    const firstNotification = this.page.locator('[data-testid="notification-item"]').first();
    const priority = await firstNotification.getAttribute('data-priority');
    (0, test_1.expect)(priority).toBe('high');
});
(0, cucumber_1.Then)('it should have a distinct visual indicator', async function () {
    const priorityIndicator = this.page.locator('[data-testid="priority-indicator"]');
    await (0, test_1.expect)(priorityIndicator).toBeVisible();
});
(0, cucumber_1.Then)('similar notifications should be grouped together', async function () {
    const groupedNotification = this.page.locator('[data-testid="grouped-notification"]');
    await (0, test_1.expect)(groupedNotification).toBeVisible();
});
(0, cucumber_1.Then)('I should see a summary like {string}', async function (summaryText) {
    const summaryElement = this.page.locator('[data-testid="notification-summary"]');
    await (0, test_1.expect)(summaryElement).toContainText(summaryText);
});
(0, cucumber_1.Then)('I should be able to expand to see individual notifications', async function () {
    const expandButton = this.page.locator('[data-testid="expand-notifications"]');
    await expandButton.click();
    const individualNotifications = this.page.locator('[data-testid="individual-notification"]');
    const count = await individualNotifications.count();
    (0, test_1.expect)(count).toBeGreaterThan(1);
});
(0, cucumber_1.Then)('I should hear the match notification sound', async function () {
    // Check for audio element or sound trigger
    const audioElement = this.page.locator('audio[data-sound="match"]');
    await (0, test_1.expect)(audioElement).toBeAttached();
});
(0, cucumber_1.Then)('I should hear the message notification sound', async function () {
    const audioElement = this.page.locator('audio[data-sound="message"]');
    await (0, test_1.expect)(audioElement).toBeAttached();
});
(0, cucumber_1.Then)('the device should vibrate', async function () {
    // Check for vibration API call (this would be mocked in tests)
    const vibrationTrigger = this.page.locator('[data-testid="vibration-triggered"]');
    await (0, test_1.expect)(vibrationTrigger).toBeVisible();
});
(0, cucumber_1.Then)('the vibration pattern should match the notification type', async function () {
    const vibrationPattern = await this.page.locator('[data-testid="vibration-pattern"]').getAttribute('data-pattern');
    (0, test_1.expect)(vibrationPattern).toBeTruthy();
});
(0, cucumber_1.Then)('I should not receive push notifications', async function () {
    // Verify no push notifications during DND
    const pushNotifications = this.page.locator('[data-testid="push-notification"]');
    await (0, test_1.expect)(pushNotifications).toHaveCount(0);
});
(0, cucumber_1.Then)('I should still see in-app notifications when I open the app', async function () {
    const inAppNotifications = this.page.locator('[data-testid="in-app-notification"]');
    await (0, test_1.expect)(inAppNotifications).toBeVisible();
});
(0, cucumber_1.Then)('notifications should be queued for later delivery', async function () {
    const queuedNotifications = await this.apiRequest('GET', '/api/notifications/queued');
    (0, test_1.expect)(queuedNotifications.data.queued.length).toBeGreaterThan(0);
});
// Mobile and Accessibility Assertions
(0, cucumber_1.Then)('the notification panel should be touch-friendly', async function () {
    const notificationItems = this.page.locator('[data-testid="notification-item"]');
    const firstItem = notificationItems.first();
    const boundingBox = await firstItem.boundingBox();
    if (boundingBox) {
        (0, test_1.expect)(boundingBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target
    }
});
(0, cucumber_1.Then)('notifications should be easy to swipe and dismiss', async function () {
    const firstNotification = this.page.locator('[data-testid="notification-item"]').first();
    // Simulate swipe gesture
    await firstNotification.hover();
    await this.page.mouse.down();
    await this.page.mouse.move(100, 0); // Swipe right
    await this.page.mouse.up();
    // Check for dismiss action
    const dismissButton = this.page.locator('[data-testid="dismiss-notification"]');
    await (0, test_1.expect)(dismissButton).toBeVisible();
});
(0, cucumber_1.Then)('the notification layout should be optimized for mobile', async function () {
    const notificationPanel = this.page.locator('[data-testid="notifications-panel"]');
    const boundingBox = await notificationPanel.boundingBox();
    if (boundingBox) {
        (0, test_1.expect)(boundingBox.width).toBeLessThanOrEqual(375); // Mobile viewport width
    }
});
(0, cucumber_1.Then)('all notifications should have proper ARIA labels', async function () {
    const notifications = this.page.locator('[data-testid="notification-item"]');
    const count = await notifications.count();
    for (let i = 0; i < count; i++) {
        const notification = notifications.nth(i);
        const ariaLabel = await notification.getAttribute('aria-label');
        (0, test_1.expect)(ariaLabel).toBeTruthy();
    }
});
(0, cucumber_1.Then)('notifications should be announced by screen readers', async function () {
    const liveRegion = this.page.locator('[aria-live="polite"]');
    await (0, test_1.expect)(liveRegion).toBeVisible();
});
(0, cucumber_1.Then)('I should be able to navigate notifications with keyboard', async function () {
    await this.page.keyboard.press('Tab');
    const focusedElement = await this.page.locator(':focus').first();
    await (0, test_1.expect)(focusedElement).toHaveAttribute('data-testid', 'notification-item');
});
(0, cucumber_1.Then)('notification actions should be accessible', async function () {
    const actionButtons = this.page.locator('[data-testid="notification-action"]');
    const firstButton = actionButtons.first();
    await (0, test_1.expect)(firstButton).toBeVisible();
    await (0, test_1.expect)(firstButton).toBeFocusable();
});
// Performance Assertions
(0, cucumber_1.Then)('the notifications should load within 2 seconds', async function () {
    const startTime = Date.now();
    await this.waitForElement('[data-testid="notifications-list"]');
    const loadTime = Date.now() - startTime;
    (0, test_1.expect)(loadTime).toBeLessThan(2000);
});
(0, cucumber_1.Then)('scrolling through notifications should be smooth', async function () {
    const notificationsList = this.page.locator('[data-testid="notifications-list"]');
    // Simulate scrolling
    await notificationsList.hover();
    await this.page.mouse.wheel(0, 500);
    // Check that scrolling works without lag
    await this.page.waitForTimeout(100);
    const scrollTop = await notificationsList.evaluate(el => el.scrollTop);
    (0, test_1.expect)(scrollTop).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('the app should remain responsive', async function () {
    // Test that other UI elements remain interactive
    const navigationButton = this.page.locator('[data-testid="navigation-button"]');
    await (0, test_1.expect)(navigationButton).toBeEnabled();
});
// Offline and Sync Assertions
(0, cucumber_1.Then)('I should receive all missed notifications', async function () {
    const notificationsResponse = await this.apiRequest('GET', '/api/notifications');
    const notifications = notificationsResponse.data.notifications;
    // Check that offline notifications are included
    const offlineNotificationCount = this.testData.offlineNotifications.length;
    (0, test_1.expect)(notifications.length).toBeGreaterThanOrEqual(offlineNotificationCount);
});
(0, cucumber_1.Then)('notifications should be delivered in the correct order', async function () {
    const notificationsResponse = await this.apiRequest('GET', '/api/notifications');
    const notifications = notificationsResponse.data.notifications;
    // Verify notifications are ordered by timestamp
    for (let i = 1; i < notifications.length; i++) {
        const prevTimestamp = new Date(notifications[i - 1].timestamp);
        const currentTimestamp = new Date(notifications[i].timestamp);
        (0, test_1.expect)(currentTimestamp.getTime()).toBeLessThanOrEqual(prevTimestamp.getTime());
    }
});
// Privacy Assertions
(0, cucumber_1.Then)('the notification should not show the message content', async function () {
    const notificationContent = this.page.locator('[data-testid="notification-content"]');
    const content = await notificationContent.textContent();
    (0, test_1.expect)(content).not.toContain('Hello! How are you?'); // Actual message content
});
(0, cucumber_1.Then)('the notification should only show {string}', async function (expectedText) {
    const notificationContent = this.page.locator('[data-testid="notification-content"]');
    await (0, test_1.expect)(notificationContent).toContainText(expectedText);
});
(0, cucumber_1.Then)('I should need to open the app to see the content', async function () {
    // Verify that full content is only visible in the app
    await this.navigateTo('/conversations');
    const messageContent = this.page.locator('[data-testid="message-content"]');
    await (0, test_1.expect)(messageContent).toContainText('Hello! How are you?');
});
// Batch and Analytics Assertions
(0, cucumber_1.Then)('I should receive notifications in a single batch', async function () {
    const batchNotification = this.page.locator('[data-testid="batch-notification"]');
    await (0, test_1.expect)(batchNotification).toBeVisible();
});
(0, cucumber_1.Then)('the notifications should be ordered by priority', async function () {
    const notifications = this.page.locator('[data-testid="notification-item"]');
    const firstNotification = notifications.first();
    const priority = await firstNotification.getAttribute('data-priority');
    (0, test_1.expect)(priority).toBe('high');
});
(0, cucumber_1.Then)('I should not be overwhelmed with individual notifications', async function () {
    // Verify that notifications are batched rather than sent individually
    const individualNotifications = this.page.locator('[data-testid="individual-push-notification"]');
    const count = await individualNotifications.count();
    (0, test_1.expect)(count).toBeLessThanOrEqual(1); // Should be batched
});
(0, cucumber_1.Then)('I should be taken to the unsubscribe page', async function () {
    await this.waitForElement('[data-testid="unsubscribe-page"]');
    const unsubscribePage = this.page.locator('[data-testid="unsubscribe-page"]');
    await (0, test_1.expect)(unsubscribePage).toBeVisible();
});
(0, cucumber_1.Then)('I should be able to choose which emails to unsubscribe from', async function () {
    const emailOptions = this.page.locator('[data-testid="email-option"]');
    const optionCount = await emailOptions.count();
    (0, test_1.expect)(optionCount).toBeGreaterThan(1);
});
(0, cucumber_1.Then)('my preferences should be updated immediately', async function () {
    await this.clickElement('[data-testid="unsubscribe-button"]');
    // Verify preferences are updated
    const preferencesResponse = await this.apiRequest('GET', '/api/notifications/preferences');
    (0, test_1.expect)(preferencesResponse.data.preferences.emailNotifications).toBe(false);
});
(0, cucumber_1.Then)('I should see delivery rates for different notification types', async function () {
    await this.waitForElement('[data-testid="delivery-rates"]');
    const deliveryRates = this.page.locator('[data-testid="delivery-rates"]');
    await (0, test_1.expect)(deliveryRates).toBeVisible();
});
(0, cucumber_1.Then)('I should see user engagement with notifications', async function () {
    await this.waitForElement('[data-testid="engagement-metrics"]');
    const engagementMetrics = this.page.locator('[data-testid="engagement-metrics"]');
    await (0, test_1.expect)(engagementMetrics).toBeVisible();
});
(0, cucumber_1.Then)('I should see notification performance metrics', async function () {
    await this.waitForElement('[data-testid="performance-metrics"]');
    const performanceMetrics = this.page.locator('[data-testid="performance-metrics"]');
    await (0, test_1.expect)(performanceMetrics).toBeVisible();
});
