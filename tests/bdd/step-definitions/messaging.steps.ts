import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Background Steps
Given('I have mutual matches', async function (this: CustomWorld) {
  // Create mutual matches for testing
  this.testData.mutualMatches = [];

  const matchUsers = [
    {
      email: 'match1@test.com',
      name: 'Alice Johnson',
      age: 27,
      bio: 'Love hiking and photography',
    },
    {
      email: 'match2@test.com',
      name: 'Sarah Wilson',
      age: 29,
      bio: 'Yoga instructor and book lover',
    },
  ];

  for (const userData of matchUsers) {
    // Register the match user
    const registerResponse = await this.apiRequest(
      'POST',
      '/api/auth/register',
      {
        email: userData.email,
        password: 'TestPass123!',
        profile: {
          name: userData.name,
          age: userData.age,
          bio: userData.bio,
          interests: ['hiking', 'reading'],
          photos: ['photo1.jpg'],
        },
      }
    );

    const matchUser = registerResponse.data.user;

    // Create mutual likes
    await this.apiRequest('POST', '/api/matches/like', {
      targetUserId: matchUser.id,
    });

    // Simulate the other user liking back
    await this.apiRequest(
      'POST',
      '/api/matches/like',
      {
        targetUserId: this.testData.currentUser.id,
      },
      matchUser.id
    );

    this.testData.mutualMatches.push(matchUser);
  }
});

Given('I have active conversations', async function (this: CustomWorld) {
  // Create conversations with mutual matches
  this.testData.conversations = [];

  for (const match of this.testData.mutualMatches) {
    const conversationResponse = await this.apiRequest(
      'POST',
      '/api/conversations',
      {
        participantId: match.id,
      }
    );

    const conversation = conversationResponse.data.conversation;

    // Add some sample messages
    await this.apiRequest(
      'POST',
      `/api/conversations/${conversation.id}/messages`,
      {
        content: `Hello ${match.profile.name}! Nice to meet you.`,
        type: 'text',
      }
    );

    await this.apiRequest(
      'POST',
      `/api/conversations/${conversation.id}/messages`,
      {
        content: 'Hi there! How are you doing?',
        type: 'text',
      },
      match.id
    );

    this.testData.conversations.push(conversation);
  }
});

Given('I have a new mutual match', async function (this: CustomWorld) {
  // Create a new mutual match without existing conversation
  const registerResponse = await this.apiRequest('POST', '/api/auth/register', {
    email: 'newmatch@test.com',
    password: 'TestPass123!',
    profile: {
      name: 'Emma Davis',
      age: 26,
      bio: 'Artist and coffee enthusiast',
      interests: ['art', 'coffee'],
      photos: ['photo1.jpg'],
    },
  });

  this.testData.newMatch = registerResponse.data.user;

  // Create mutual likes
  await this.apiRequest('POST', '/api/matches/like', {
    targetUserId: this.testData.newMatch.id,
  });

  await this.apiRequest(
    'POST',
    '/api/matches/like',
    {
      targetUserId: this.testData.currentUser.id,
    },
    this.testData.newMatch.id
  );
});

Given('I am in an active conversation', async function (this: CustomWorld) {
  if (
    !this.testData.conversations ||
    this.testData.conversations.length === 0
  ) {
    // Create a conversation if none exists
    const conversationResponse = await this.apiRequest(
      'POST',
      '/api/conversations',
      {
        participantId: this.testData.mutualMatches[0].id,
      }
    );
    this.testData.currentConversation = conversationResponse.data.conversation;
  } else {
    this.testData.currentConversation = this.testData.conversations[0];
  }

  // Navigate to the conversation
  await this.navigateTo(`/messages/${this.testData.currentConversation.id}`);
  await this.waitForElement('[data-testid="chat-interface"]');
});

Given('I have an active conversation ID', async function (this: CustomWorld) {
  if (!this.testData.currentConversation) {
    const conversationResponse = await this.apiRequest(
      'POST',
      '/api/conversations',
      {
        participantId: this.testData.mutualMatches[0].id,
      }
    );
    this.testData.currentConversation = conversationResponse.data.conversation;
  }
});

// Navigation Steps
When('I navigate to the messages page', async function (this: CustomWorld) {
  await this.navigateTo('/messages');
  await this.waitForElement('[data-testid="messages-page"]');
});

When('I am on the messages page', async function (this: CustomWorld) {
  await this.navigateTo('/messages');
  await this.waitForElement('[data-testid="messages-page"]');
});

When(
  'I click on the new match conversation',
  async function (this: CustomWorld) {
    const conversationSelector = `[data-testid="conversation-${this.testData.newMatch.id}"]`;
    await this.clickElement(conversationSelector);
  }
);

// Message Interaction Steps
When(
  'I type {string} in the message input',
  async function (this: CustomWorld, message: string) {
    await this.fillField('[data-testid="message-input"]', message);
    this.testData.lastMessage = message;
  }
);

When('I click the send button', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="send-button"]');
});

When('I click the emoji button', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="emoji-button"]');
  await this.waitForElement('[data-testid="emoji-picker"]');
});

When('I select a heart emoji', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="emoji-❤️"]');
});

When('I click the photo attachment button', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="photo-attachment-button"]');
});

When('I select a photo from my device', async function (this: CustomWorld) {
  // Simulate file upload
  const fileInput = this.page!.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'test-photo.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
  });
});

When('I click the GIF button', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="gif-button"]');
  await this.waitForElement('[data-testid="gif-picker"]');
});

When(
  'I search for {string} GIFs',
  async function (this: CustomWorld, searchTerm: string) {
    await this.fillField('[data-testid="gif-search-input"]', searchTerm);
    await this.page!.keyboard.press('Enter');
    await this.waitForElement('[data-testid="gif-results"]');
  }
);

When('I select a GIF from the results', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="gif-result"]');
});

// Real-time and Status Steps
Given('the other user is also online', async function (this: CustomWorld) {
  // Simulate other user being online
  const otherUserId = this.testData.mutualMatches[0].id;
  await this.apiRequest('POST', `/api/users/${otherUserId}/status`, {
    status: 'online',
  });
});

When('the other user types a message', async function (this: CustomWorld) {
  // Simulate typing indicator via WebSocket or API
  const otherUserId = this.testData.mutualMatches[0].id;
  await this.apiRequest(
    'POST',
    `/api/conversations/${this.testData.currentConversation.id}/typing`,
    {
      userId: otherUserId,
      isTyping: true,
    }
  );
});

When('the other user sends the message', async function (this: CustomWorld) {
  const otherUserId = this.testData.mutualMatches[0].id;

  // Stop typing indicator
  await this.apiRequest(
    'POST',
    `/api/conversations/${this.testData.currentConversation.id}/typing`,
    {
      userId: otherUserId,
      isTyping: false,
    }
  );

  // Send message
  this.testData.receivedMessage = await this.apiRequest(
    'POST',
    `/api/conversations/${this.testData.currentConversation.id}/messages`,
    {
      content: 'Hey! How are you?',
      type: 'text',
    },
    otherUserId
  );
});

Given('the other user sends me a message', async function (this: CustomWorld) {
  const otherUserId = this.testData.mutualMatches[0].id;
  this.testData.receivedMessage = await this.apiRequest(
    'POST',
    `/api/conversations/${this.testData.currentConversation.id}/messages`,
    {
      content: 'Hello! Nice to meet you.',
      type: 'text',
    },
    otherUserId
  );
});

When('the message is delivered', async function (this: CustomWorld) {
  // Wait for message to appear in UI
  await this.waitForElement('[data-testid="message-received"]');
});

When(
  'the other user opens the conversation',
  async function (this: CustomWorld) {
    // Simulate read receipt
    const otherUserId = this.testData.mutualMatches[0].id;
    await this.apiRequest(
      'POST',
      `/api/conversations/${this.testData.currentConversation.id}/read`,
      {
        userId: otherUserId,
      }
    );
  }
);

When('reads my message', async function (this: CustomWorld) {
  // This is typically handled automatically when the conversation is opened
  // The read receipt should be updated in real-time
  await this.page!.waitForTimeout(1000); // Wait for read receipt to update
});

// Search Steps
When('I use the search function', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="search-button"]');
  await this.waitForElement('[data-testid="search-input"]');
});

When("I search for a match's name", async function (this: CustomWorld) {
  const searchTerm = this.testData.mutualMatches[0].profile.name;
  await this.fillField('[data-testid="search-input"]', searchTerm);
});

When(
  'I open the search function within the chat',
  async function (this: CustomWorld) {
    await this.clickElement('[data-testid="chat-search-button"]');
    await this.waitForElement('[data-testid="chat-search-input"]');
  }
);

When(
  'I search for a specific word or phrase',
  async function (this: CustomWorld) {
    await this.fillField('[data-testid="chat-search-input"]', 'hello');
    await this.page!.keyboard.press('Enter');
  }
);

// Moderation Steps
When('I receive an inappropriate message', async function (this: CustomWorld) {
  const otherUserId = this.testData.mutualMatches[0].id;
  this.testData.inappropriateMessage = await this.apiRequest(
    'POST',
    `/api/conversations/${this.testData.currentConversation.id}/messages`,
    {
      content: 'This is an inappropriate message',
      type: 'text',
    },
    otherUserId
  );

  await this.waitForElement('[data-testid="message-received"]');
});

When('I long-press on the message', async function (this: CustomWorld) {
  const messageElement = this.page!.locator(
    '[data-testid="message-received"]'
  ).last();
  await messageElement.click({ button: 'right' }); // Right-click to simulate long-press
});

When(
  'I select {string} from the context menu',
  async function (this: CustomWorld, action: string) {
    await this.clickElement(
      `[data-testid="context-menu-${action.toLowerCase()}"]`
    );
  }
);

When('I choose a reason for reporting', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="report-reason-inappropriate"]');
});

When('I submit the report', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="submit-report-button"]');
});

When('I access the conversation settings', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="conversation-settings-button"]');
  await this.waitForElement('[data-testid="conversation-settings-menu"]');
});

When('I select {string}', async function (this: CustomWorld, action: string) {
  await this.clickElement(
    `[data-testid="${action.toLowerCase().replace(' ', '-')}"]`
  );
});

When('I confirm the blocking action', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="confirm-block-button"]');
});

// API Steps
When(
  'I send a GET request to {string}',
  async function (this: CustomWorld, endpoint: string) {
    this.testData.lastApiResponse = await this.apiRequest('GET', endpoint);
  }
);

When(
  'I send a POST request to {string} with message content',
  async function (this: CustomWorld, endpoint: string) {
    const conversationId = this.testData.currentConversation.id;
    const fullEndpoint = endpoint.replace('{conversationId}', conversationId);

    this.testData.lastApiResponse = await this.apiRequest(
      'POST',
      fullEndpoint,
      {
        content: 'Test message via API',
        type: 'text',
      }
    );
  }
);

// Validation Steps
When('I try to send an empty message', async function (this: CustomWorld) {
  await this.fillField('[data-testid="message-input"]', '');
  // Try to click send button
});

When(
  'I type a message longer than the character limit',
  async function (this: CustomWorld) {
    const longMessage = 'a'.repeat(1001); // Assuming 1000 character limit
    await this.fillField('[data-testid="message-input"]', longMessage);
  }
);

When(
  'I try to send them a message via API',
  async function (this: CustomWorld) {
    // Try to send message to unmatched user
    this.testData.lastApiResponse = await this.apiRequest(
      'POST',
      '/api/conversations',
      {
        participantId: 'unmatched-user-id',
      }
    );
  }
);

// Condition Steps
Given('I have the app in the background', async function (this: CustomWorld) {
  // Simulate app being in background
  await this.page!.evaluate(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'hidden', { value: true, writable: true });
  });
});

Given(
  'I am using the app but not in the conversation',
  async function (this: CustomWorld) {
    await this.navigateTo('/profile'); // Navigate away from conversation
  }
);

Given(
  'I have a conversation with over 1000 messages',
  async function (this: CustomWorld) {
    // Create a conversation with many messages (simulate via API)
    const conversationResponse = await this.apiRequest(
      'POST',
      '/api/conversations',
      {
        participantId: this.testData.mutualMatches[0].id,
      }
    );

    this.testData.largeConversation = conversationResponse.data.conversation;

    // Simulate having many messages
    await this.apiRequest(
      'POST',
      `/api/conversations/${this.testData.largeConversation.id}/bulk-messages`,
      {
        count: 1000,
      }
    );
  }
);

Given('I lose internet connectivity', async function (this: CustomWorld) {
  // Simulate offline mode
  await this.page!.context().setOffline(true);
});

When('connectivity is restored', async function (this: CustomWorld) {
  await this.page!.context().setOffline(false);
});

// Assertion Steps
Then(
  'I should see a list of my conversations',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="conversation-list"]');
    const conversations = await this.page!.locator(
      '[data-testid="conversation-item"]'
    ).count();
    expect(conversations).toBeGreaterThan(0);
  }
);

Then(
  "each conversation should show the match's name and photo",
  async function (this: CustomWorld) {
    const firstConversation = this.page!.locator(
      '[data-testid="conversation-item"]'
    ).first();
    await expect(
      firstConversation.locator('[data-testid="match-name"]')
    ).toBeVisible();
    await expect(
      firstConversation.locator('[data-testid="match-photo"]')
    ).toBeVisible();
  }
);

Then(
  'each conversation should show the last message preview',
  async function (this: CustomWorld) {
    const firstConversation = this.page!.locator(
      '[data-testid="conversation-item"]'
    ).first();
    await expect(
      firstConversation.locator('[data-testid="last-message-preview"]')
    ).toBeVisible();
  }
);

Then(
  'I should be taken to the chat interface',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="chat-interface"]');
    await expect(
      this.page!.locator('[data-testid="chat-interface"]')
    ).toBeVisible();
  }
);

Then(
  'I should see a welcome message or ice breaker suggestions',
  async function (this: CustomWorld) {
    const welcomeMessage = this.page!.locator(
      '[data-testid="welcome-message"]'
    );
    const iceBreakerSuggestions = this.page!.locator(
      '[data-testid="ice-breaker-suggestions"]'
    );

    const welcomeVisible = await welcomeMessage.isVisible();
    const iceBreakersVisible = await iceBreakerSuggestions.isVisible();

    expect(welcomeVisible || iceBreakersVisible).toBe(true);
  }
);

Then(
  'the message should appear in the chat',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="message-sent"]');
    const lastMessage = this.page!.locator(
      '[data-testid="message-sent"]'
    ).last();
    await expect(lastMessage).toContainText(this.testData.lastMessage);
  }
);

Then(
  'the message should be marked as sent',
  async function (this: CustomWorld) {
    const lastMessage = this.page!.locator(
      '[data-testid="message-sent"]'
    ).last();
    await expect(
      lastMessage.locator('[data-testid="message-status-sent"]')
    ).toBeVisible();
  }
);

Then(
  'the other user should receive the message',
  async function (this: CustomWorld) {
    // Verify via API that the message was delivered
    const response = await this.apiRequest(
      'GET',
      `/api/conversations/${this.testData.currentConversation.id}/messages`
    );
    expect(response.status).toBe(200);
    expect(response.data.messages).toContainEqual(
      expect.objectContaining({ content: this.testData.lastMessage })
    );
  }
);

Then(
  'I should see the new message in the chat',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="message-received"]');
    const receivedMessage = this.page!.locator(
      '[data-testid="message-received"]'
    ).last();
    await expect(receivedMessage).toBeVisible();
  }
);

Then('I should receive a notification', async function (this: CustomWorld) {
  // Check for notification (this might be browser notification or in-app)
  await this.waitForElement('[data-testid="notification"]');
  const notification = this.page!.locator('[data-testid="notification"]');
  await expect(notification).toBeVisible();
});

Then(
  'I should see a {string} indicator',
  async function (this: CustomWorld, indicatorType: string) {
    await this.waitForElement(`[data-testid="${indicatorType}-indicator"]`);
    const indicator = this.page!.locator(
      `[data-testid="${indicatorType}-indicator"]`
    );
    await expect(indicator).toBeVisible();
  }
);

Then(
  'the emoji should be sent as a message',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="message-sent"]');
    const lastMessage = this.page!.locator(
      '[data-testid="message-sent"]'
    ).last();
    await expect(lastMessage).toContainText('❤️');
  }
);

Then('the photo should be uploaded', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="message-photo"]');
  const photoMessage = this.page!.locator(
    '[data-testid="message-photo"]'
  ).last();
  await expect(photoMessage).toBeVisible();
});

Then('the send button should be disabled', async function (this: CustomWorld) {
  const sendButton = this.page!.locator('[data-testid="send-button"]');
  await expect(sendButton).toBeDisabled();
});

Then(
  'I should see a character count indicator',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="character-count"]');
    const charCount = this.page!.locator('[data-testid="character-count"]');
    await expect(charCount).toBeVisible();
  }
);

Then(
  'the API should respond with status code {int}',
  async function (this: CustomWorld, statusCode: number) {
    expect(this.testData.lastApiResponse.status).toBe(statusCode);
  }
);

Then(
  'the response should contain a list of my conversations',
  async function (this: CustomWorld) {
    expect(this.testData.lastApiResponse.data).toHaveProperty('conversations');
    expect(
      Array.isArray(this.testData.lastApiResponse.data.conversations)
    ).toBe(true);
  }
);

Then(
  'the message should be reported to moderators',
  async function (this: CustomWorld) {
    // Verify report was created
    const response = await this.apiRequest('GET', '/api/admin/reports');
    expect(response.status).toBe(200);
    expect(response.data.reports).toContainEqual(
      expect.objectContaining({ type: 'inappropriate_message' })
    );
  }
);

Then('the user should be blocked', async function (this: CustomWorld) {
  // Verify user is blocked
  const response = await this.apiRequest('GET', '/api/users/blocked');
  expect(response.status).toBe(200);
  expect(response.data.blockedUsers).toContainEqual(
    expect.objectContaining({ id: this.testData.mutualMatches[0].id })
  );
});

Then(
  'the queued message should be sent automatically',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="message-sent"]');
    const lastMessage = this.page!.locator(
      '[data-testid="message-sent"]'
    ).last();
    await expect(
      lastMessage.locator('[data-testid="message-status-sent"]')
    ).toBeVisible();
  }
);
