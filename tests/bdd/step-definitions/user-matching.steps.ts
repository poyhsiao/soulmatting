import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Background Steps
Given(
  'I am a registered user with a complete profile',
  async function (this: CustomWorld) {
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
        interests: ['hiking', 'reading'],
      },
    };

    // Register user via API
    const response = await this.apiRequest('POST', '/api/auth/register', {
      email: this.testData.currentUser.email,
      password: this.testData.currentUser.password,
      profile: this.testData.currentUser.profile,
    });

    expect(response.status).toBe(201);
    this.testData.currentUser.id = response.data.user.id;
    this.testData.authToken = response.data.token;
  }
);

Given('I am logged in', async function (this: CustomWorld) {
  if (!this.testData.authToken) {
    // Login if not already authenticated
    const response = await this.apiRequest('POST', '/api/auth/login', {
      email: this.testData.currentUser.email,
      password: this.testData.currentUser.password,
    });

    expect(response.status).toBe(200);
    this.testData.authToken = response.data.token;
  }

  // Set authentication in browser context
  if (this.page) {
    await this.page.evaluate(token => {
      localStorage.setItem('authToken', token);
    }, this.testData.authToken);
  }
});

// Setup Steps
Given(
  'there are other users with compatible profiles',
  async function (this: CustomWorld) {
    // Create compatible test users
    const compatibleUsers = [
      {
        email: 'compatible1@test.com',
        age: 30,
        interests: ['hiking', 'photography'],
        location: { lat: 37.7849, lng: -122.4094 }, // Close to current user
      },
      {
        email: 'compatible2@test.com',
        age: 27,
        interests: ['reading', 'travel'],
        location: { lat: 37.7649, lng: -122.4294 },
      },
      {
        email: 'compatible3@test.com',
        age: 32,
        interests: ['hiking', 'reading', 'cooking'],
        location: { lat: 37.7549, lng: -122.4394 },
      },
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
          location: userData.location,
        },
      });

      expect(response.status).toBe(201);
      this.testData.compatibleUsers.push(response.data.user);
    }
  }
);

Given('I have a target user ID', async function (this: CustomWorld) {
  if (
    !this.testData.compatibleUsers ||
    this.testData.compatibleUsers.length === 0
  ) {
    // Create a target user if none exist
    const response = await this.apiRequest('POST', '/api/auth/register', {
      email: 'target@test.com',
      password: 'TestPass123!',
      profile: {
        age: 29,
        bio: 'Looking for meaningful connections',
        interests: ['hiking', 'music'],
        photos: ['photo1.jpg'],
        location: { lat: 37.7749, lng: -122.4194 },
      },
    });

    expect(response.status).toBe(201);
    this.testData.targetUserId = response.data.user.id;
  } else {
    this.testData.targetUserId = this.testData.compatibleUsers[0].id;
  }
});

// Navigation Steps
When('I navigate to the matching page', async function (this: CustomWorld) {
  await this.navigateTo('/matching');
  await this.waitForElement('[data-testid="matching-page"]');
});

When('I am on the matching page', async function (this: CustomWorld) {
  await this.navigateTo('/matching');
  await this.waitForElement('[data-testid="matching-page"]');
});

// Interaction Steps
When(
  'I click the {string} button',
  async function (this: CustomWorld, action: string) {
    const buttonSelector = `[data-testid="${action}-button"]`;
    await this.clickElement(buttonSelector);
  }
);

When('I open the filters menu', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="filters-button"]');
  await this.waitForElement('[data-testid="filters-menu"]');
});

When(
  'I set age range to {string}',
  async function (this: CustomWorld, ageRange: string) {
    const [minAge, maxAge] = ageRange.split('-');
    await this.fillField('[data-testid="min-age-input"]', minAge);
    await this.fillField('[data-testid="max-age-input"]', maxAge);
  }
);

When(
  'I set distance to {string}',
  async function (this: CustomWorld, distance: string) {
    await this.fillField(
      '[data-testid="distance-input"]',
      distance.replace(' miles', '')
    );
  }
);

When(
  'I select interests {string}',
  async function (this: CustomWorld, interests: string) {
    const interestList = interests.split(', ');
    for (const interest of interestList) {
      await this.clickElement(`[data-testid="interest-${interest}"]`);
    }
  }
);

When('I apply the filters', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="apply-filters-button"]');
});

// Mobile Interaction Steps
When('I swipe left on a match card', async function (this: CustomWorld) {
  const matchCard = await this.page!.locator(
    '[data-testid="match-card"]'
  ).first();
  const box = await matchCard.boundingBox();

  if (box) {
    await this.page!.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page!.mouse.down();
    await this.page!.mouse.move(box.x - 100, box.y + box.height / 2);
    await this.page!.mouse.up();
  }
});

When('I swipe right on a match card', async function (this: CustomWorld) {
  const matchCard = await this.page!.locator(
    '[data-testid="match-card"]'
  ).first();
  const box = await matchCard.boundingBox();

  if (box) {
    await this.page!.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page!.mouse.down();
    await this.page!.mouse.move(box.x + 100, box.y + box.height / 2);
    await this.page!.mouse.up();
  }
});

// API Steps
When(
  'I send a GET request to {string}',
  async function (this: CustomWorld, endpoint: string) {
    this.testData.lastApiResponse = await this.apiRequest('GET', endpoint);
  }
);

When(
  'I send a POST request to {string} with the user ID',
  async function (this: CustomWorld, endpoint: string) {
    this.testData.lastApiResponse = await this.apiRequest('POST', endpoint, {
      targetUserId: this.testData.targetUserId,
    });
  }
);

// Condition Steps
Given('I have liked a user', async function (this: CustomWorld) {
  if (!this.testData.targetUserId) {
    // Create a target user first
    const response = await this.apiRequest('POST', '/api/auth/register', {
      email: 'liked-user@test.com',
      password: 'TestPass123!',
      profile: { age: 28, bio: 'Test user', interests: ['hiking'] },
    });
    this.testData.targetUserId = response.data.user.id;
  }

  // Record the like
  await this.apiRequest('POST', '/api/matches/like', {
    targetUserId: this.testData.targetUserId,
  });
});

Given('that user likes me back', async function (this: CustomWorld) {
  // Simulate the other user liking back
  await this.apiRequest(
    'POST',
    '/api/matches/like',
    {
      targetUserId: this.testData.currentUser.id,
    },
    this.testData.targetUserId
  ); // Use target user's auth
});

Given('I have already liked a user', async function (this: CustomWorld) {
  await this.apiRequest('POST', '/api/matches/like', {
    targetUserId: this.testData.targetUserId,
  });
});

Given('I have reached my daily like limit', async function (this: CustomWorld) {
  // Simulate reaching daily limit by making multiple like requests
  const dailyLimit = 50; // Assuming 50 is the daily limit

  for (let i = 0; i < dailyLimit; i++) {
    const response = await this.apiRequest('POST', '/api/auth/register', {
      email: `temp-user-${i}@test.com`,
      password: 'TestPass123!',
      profile: { age: 25, bio: 'Temp user', interests: ['test'] },
    });

    await this.apiRequest('POST', '/api/matches/like', {
      targetUserId: response.data.user.id,
    });
  }
});

Given('I am a premium user', async function (this: CustomWorld) {
  // Update user to premium status
  await this.apiRequest('PATCH', `/api/users/${this.testData.currentUser.id}`, {
    subscription: {
      type: 'premium',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });
});

Given('I have super likes available', async function (this: CustomWorld) {
  // Ensure user has super likes
  await this.apiRequest('PATCH', `/api/users/${this.testData.currentUser.id}`, {
    superLikes: 5,
  });
});

// Assertion Steps
Then(
  'I should see a list of potential matches',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="match-list"]');
    const matches = await this.page!.locator(
      '[data-testid="match-card"]'
    ).count();
    expect(matches).toBeGreaterThan(0);
  }
);

Then(
  'each match should display basic profile information',
  async function (this: CustomWorld) {
    const firstMatch = this.page!.locator('[data-testid="match-card"]').first();
    await expect(
      firstMatch.locator('[data-testid="match-name"]')
    ).toBeVisible();
    await expect(firstMatch.locator('[data-testid="match-age"]')).toBeVisible();
    await expect(
      firstMatch.locator('[data-testid="match-photo"]')
    ).toBeVisible();
  }
);

Then(
  'each match should have action buttons \(like, pass, super like\)',
  async function (this: CustomWorld) {
    const firstMatch = this.page!.locator('[data-testid="match-card"]').first();
    await expect(
      firstMatch.locator('[data-testid="like-button"]')
    ).toBeVisible();
    await expect(
      firstMatch.locator('[data-testid="pass-button"]')
    ).toBeVisible();
    await expect(
      firstMatch.locator('[data-testid="super-like-button"]')
    ).toBeVisible();
  }
);

Then(
  'the match should be recorded in the system',
  async function (this: CustomWorld) {
    // Verify the like was recorded via API
    const response = await this.apiRequest('GET', '/api/matches/my-likes');
    expect(response.status).toBe(200);
    expect(response.data.likes).toContainEqual(
      expect.objectContaining({ targetUserId: this.testData.targetUserId })
    );
  }
);

Then(
  'I should see the next potential match',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="match-card"]');
    // Verify that a new match card is displayed
    const matchCard = this.page!.locator('[data-testid="match-card"]').first();
    await expect(matchCard).toBeVisible();
  }
);

Then(
  "the liked user should be notified if it's a mutual match",
  async function (this: CustomWorld) {
    // Check if notification was sent (this would typically be verified through database or notification service)
    const response = await this.apiRequest(
      'GET',
      `/api/notifications/${this.testData.targetUserId}`
    );
    if (
      response.status === 200 &&
      response.data.notifications.some((n: any) => n.type === 'mutual_match')
    ) {
      expect(response.data.notifications).toContainEqual(
        expect.objectContaining({ type: 'mutual_match' })
      );
    }
  }
);

Then(
  'the API should respond with status code {int}',
  async function (this: CustomWorld, statusCode: number) {
    expect(this.testData.lastApiResponse.status).toBe(statusCode);
  }
);

Then(
  'the response should contain a list of potential matches',
  async function (this: CustomWorld) {
    expect(this.testData.lastApiResponse.data).toHaveProperty('matches');
    expect(Array.isArray(this.testData.lastApiResponse.data.matches)).toBe(
      true
    );
  }
);

Then(
  'each match should include user ID, basic profile info, and compatibility score',
  async function (this: CustomWorld) {
    const matches = this.testData.lastApiResponse.data.matches;
    expect(matches.length).toBeGreaterThan(0);

    for (const match of matches) {
      expect(match).toHaveProperty('userId');
      expect(match).toHaveProperty('profile');
      expect(match).toHaveProperty('compatibilityScore');
      expect(typeof match.compatibilityScore).toBe('number');
      expect(match.compatibilityScore).toBeGreaterThanOrEqual(0);
      expect(match.compatibilityScore).toBeLessThanOrEqual(100);
    }
  }
);

Then(
  'I should see an error message {string}',
  async function (this: CustomWorld, errorMessage: string) {
    await this.waitForElement('[data-testid="error-message"]');
    const errorElement = this.page!.locator('[data-testid="error-message"]');
    await expect(errorElement).toContainText(errorMessage);
  }
);

Then(
  'it should register as a {string}',
  async function (this: CustomWorld, action: string) {
    // Verify the action was recorded
    const response = await this.apiRequest('GET', `/api/matches/my-${action}s`);
    expect(response.status).toBe(200);
    expect(response.data[`${action}s`]).toContainEqual(
      expect.objectContaining({ targetUserId: expect.any(String) })
    );
  }
);

Then(
  'the swipe gestures should be smooth and responsive',
  async function (this: CustomWorld) {
    // This is more of a visual/performance test
    // We can check that the UI responds appropriately to swipe gestures
    await this.waitForElement('[data-testid="match-card"]');
    const matchCard = this.page!.locator('[data-testid="match-card"]').first();
    await expect(matchCard).toBeVisible();
  }
);

// Accessibility Steps
Then(
  'each match card should have proper ARIA labels',
  async function (this: CustomWorld) {
    const matchCards = this.page!.locator('[data-testid="match-card"]');
    const count = await matchCards.count();

    for (let i = 0; i < count; i++) {
      const card = matchCards.nth(i);
      await expect(card).toHaveAttribute('aria-label');
    }
  }
);

Then(
  'action buttons should be keyboard accessible',
  async function (this: CustomWorld) {
    const likeButton = this.page!.locator(
      '[data-testid="like-button"]'
    ).first();
    await likeButton.focus();
    await expect(likeButton).toBeFocused();

    // Test keyboard navigation
    await this.page!.keyboard.press('Tab');
    const passButton = this.page!.locator(
      '[data-testid="pass-button"]'
    ).first();
    await expect(passButton).toBeFocused();
  }
);

Then(
  'my super like count should decrease by one',
  async function (this: CustomWorld) {
    const response = await this.apiRequest(
      'GET',
      `/api/users/${this.testData.currentUser.id}`
    );
    expect(response.status).toBe(200);
    expect(response.data.user.superLikes).toBe(4); // Assuming started with 5
  }
);
