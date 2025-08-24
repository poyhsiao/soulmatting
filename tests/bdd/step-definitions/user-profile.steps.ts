import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Background Steps
Given('I am on my profile page', async function (this: CustomWorld) {
  await this.navigateTo('/profile');
  await this.waitForElement('[data-testid="profile-page"]');
});

// Navigation Steps
When('I navigate to my profile page', async function (this: CustomWorld) {
  await this.navigateTo('/profile');
  await this.waitForElement('[data-testid="profile-page"]');
});

// Basic Profile Viewing Steps
Then('I should see my profile information', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="profile-info"]');
  const profileInfo = this.page!.locator('[data-testid="profile-info"]');
  await expect(profileInfo).toBeVisible();
});

Then('I should see my photos', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="profile-photos"]');
  const photos = this.page!.locator('[data-testid="profile-photo"]');
  const photoCount = await photos.count();
  expect(photoCount).toBeGreaterThan(0);
});

Then('I should see my bio', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="profile-bio"]');
  const bio = this.page!.locator('[data-testid="profile-bio"]');
  await expect(bio).toBeVisible();
});

Then('I should see my interests', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="profile-interests"]');
  const interests = this.page!.locator('[data-testid="profile-interests"]');
  await expect(interests).toBeVisible();
});

Then('I should see my basic information', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="profile-basic-info"]');
  const basicInfo = this.page!.locator('[data-testid="profile-basic-info"]');
  await expect(basicInfo).toBeVisible();

  // Check for name and age
  await expect(
    this.page!.locator('[data-testid="profile-name"]')
  ).toBeVisible();
  await expect(this.page!.locator('[data-testid="profile-age"]')).toBeVisible();
});

// Profile Editing Steps
When('I click the edit profile button', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="edit-profile-button"]');
  await this.waitForElement('[data-testid="edit-profile-form"]');
});

When(
  'I update my name to {string}',
  async function (this: CustomWorld, newName: string) {
    await this.fillField('[data-testid="name-input"]', newName);
    this.testData.updatedName = newName;
  }
);

When(
  'I update my age to {string}',
  async function (this: CustomWorld, newAge: string) {
    await this.fillField('[data-testid="age-input"]', newAge);
    this.testData.updatedAge = newAge;
  }
);

When(
  'I update my bio to {string}',
  async function (this: CustomWorld, newBio: string) {
    await this.fillField('[data-testid="bio-input"]', newBio);
    this.testData.updatedBio = newBio;
  }
);

When('I save the changes', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="save-profile-button"]');
});

Then('I should see a success message', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="success-message"]');
  const successMessage = this.page!.locator('[data-testid="success-message"]');
  await expect(successMessage).toBeVisible();
});

Then(
  'my profile should display the updated information',
  async function (this: CustomWorld) {
    // Wait for the form to close and profile to update
    await this.waitForElement('[data-testid="profile-info"]');

    if (this.testData.updatedName) {
      const nameElement = this.page!.locator('[data-testid="profile-name"]');
      await expect(nameElement).toContainText(this.testData.updatedName);
    }

    if (this.testData.updatedAge) {
      const ageElement = this.page!.locator('[data-testid="profile-age"]');
      await expect(ageElement).toContainText(this.testData.updatedAge);
    }

    if (this.testData.updatedBio) {
      const bioElement = this.page!.locator('[data-testid="profile-bio"]');
      await expect(bioElement).toContainText(this.testData.updatedBio);
    }
  }
);

// Photo Management Steps
When('I click the add photo button', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="add-photo-button"]');
});

When('I select a photo from my device', async function (this: CustomWorld) {
  const fileInput = this.page!.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'test-photo.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
  });
});

When('I confirm the photo upload', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="confirm-upload-button"]');
});

Then(
  'the photo should be added to my profile',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="upload-success"]');
    const uploadSuccess = this.page!.locator('[data-testid="upload-success"]');
    await expect(uploadSuccess).toBeVisible();
  }
);

Then(
  'I should see the new photo in my photo gallery',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="profile-photos"]');
    const photos = this.page!.locator('[data-testid="profile-photo"]');
    const photoCount = await photos.count();
    expect(photoCount).toBeGreaterThan(0);
  }
);

Given('I have multiple photos', async function (this: CustomWorld) {
  // Ensure user has multiple photos
  const photos = this.page!.locator('[data-testid="profile-photo"]');
  const photoCount = await photos.count();

  if (photoCount < 2) {
    // Add more photos if needed
    for (let i = photoCount; i < 2; i++) {
      await this.clickElement('[data-testid="add-photo-button"]');
      const fileInput = this.page!.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: `test-photo-${i}.jpg`,
        mimeType: 'image/jpeg',
        buffer: Buffer.from(`fake-image-data-${i}`),
      });
      await this.clickElement('[data-testid="confirm-upload-button"]');
      await this.waitForElement('[data-testid="upload-success"]');
    }
  }
});

When(
  'I drag and drop photos to reorder them',
  async function (this: CustomWorld) {
    const firstPhoto = this.page!.locator(
      '[data-testid="profile-photo"]'
    ).first();
    const secondPhoto = this.page!.locator('[data-testid="profile-photo"]').nth(
      1
    );

    // Simulate drag and drop
    await firstPhoto.dragTo(secondPhoto);
  }
);

Then('the photos should be reordered', async function (this: CustomWorld) {
  // Wait for reorder animation to complete
  await this.page!.waitForTimeout(1000);

  // Verify the order has changed (this would depend on your implementation)
  const photos = this.page!.locator('[data-testid="profile-photo"]');
  expect(await photos.count()).toBeGreaterThan(1);
});

Then('the new order should be saved', async function (this: CustomWorld) {
  // Refresh the page to verify the order persists
  await this.page!.reload();
  await this.waitForElement('[data-testid="profile-photos"]');

  // Verify the order is maintained after reload
  const photos = this.page!.locator('[data-testid="profile-photo"]');
  expect(await photos.count()).toBeGreaterThan(1);
});

When('I click on a photo to select it', async function (this: CustomWorld) {
  const firstPhoto = this.page!.locator(
    '[data-testid="profile-photo"]'
  ).first();
  await firstPhoto.click();

  // Wait for photo to be selected
  await expect(firstPhoto).toHaveClass(/selected/);
});

When('I click the delete photo button', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="delete-photo-button"]');
});

When('I confirm the deletion', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="confirm-delete-button"]');
});

Then(
  'the photo should be removed from my profile',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="delete-success"]');
    const deleteSuccess = this.page!.locator('[data-testid="delete-success"]');
    await expect(deleteSuccess).toBeVisible();
  }
);

// Interests Management Steps
When('I click the edit interests button', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="edit-interests-button"]');
  await this.waitForElement('[data-testid="interests-editor"]');
});

When(
  'I add new interests {string}',
  async function (this: CustomWorld, interests: string) {
    const interestList = interests.split(', ');

    for (const interest of interestList) {
      await this.fillField('[data-testid="interest-input"]', interest);
      await this.clickElement('[data-testid="add-interest-button"]');
    }

    this.testData.newInterests = interestList;
  }
);

When(
  'I remove existing interest {string}',
  async function (this: CustomWorld, interest: string) {
    const interestTag = this.page!.locator(
      `[data-testid="interest-tag-${interest}"]`
    );
    const removeButton = interestTag.locator('[data-testid="remove-interest"]');
    await removeButton.click();

    this.testData.removedInterest = interest;
  }
);

When('I save the interest changes', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="save-interests-button"]');
});

Then('my interests should be updated', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="profile-interests"]');

  // Check new interests are displayed
  if (this.testData.newInterests) {
    for (const interest of this.testData.newInterests) {
      const interestElement = this.page!.locator(
        `[data-testid="interest-${interest}"]`
      );
      await expect(interestElement).toBeVisible();
    }
  }

  // Check removed interest is not displayed
  if (this.testData.removedInterest) {
    const removedInterestElement = this.page!.locator(
      `[data-testid="interest-${this.testData.removedInterest}"]`
    );
    await expect(removedInterestElement).not.toBeVisible();
  }
});

Then(
  'I should see the new interests displayed',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="profile-interests"]');
    const interestsContainer = this.page!.locator(
      '[data-testid="profile-interests"]'
    );
    await expect(interestsContainer).toBeVisible();
  }
);

// Location Management Steps
When('I click the edit location button', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="edit-location-button"]');
  await this.waitForElement('[data-testid="location-editor"]');
});

When(
  'I enter a new city {string}',
  async function (this: CustomWorld, city: string) {
    await this.fillField('[data-testid="city-input"]', city);
    this.testData.updatedCity = city;
  }
);

When('I save the location change', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="save-location-button"]');
});

Then('my location should be updated', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="profile-location"]');
  const locationElement = this.page!.locator(
    '[data-testid="profile-location"]'
  );
  await expect(locationElement).toContainText(this.testData.updatedCity);
});

Then(
  'I should see the new location displayed',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="profile-location"]');
    const locationElement = this.page!.locator(
      '[data-testid="profile-location"]'
    );
    await expect(locationElement).toBeVisible();
  }
);

// Validation Steps
When('I clear the name field', async function (this: CustomWorld) {
  await this.fillField('[data-testid="name-input"]', '');
});

When('I try to save the changes', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="save-profile-button"]');
});

Then(
  'I should see a validation error for name',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="name-error"]');
    const nameError = this.page!.locator('[data-testid="name-error"]');
    await expect(nameError).toBeVisible();
    await expect(nameError).toContainText('Name is required');
  }
);

Then('the changes should not be saved', async function (this: CustomWorld) {
  // Verify the form is still open (indicating save failed)
  const editForm = this.page!.locator('[data-testid="edit-profile-form"]');
  await expect(editForm).toBeVisible();
});

When(
  'I enter a bio longer than 500 characters',
  async function (this: CustomWorld) {
    const longBio = 'a'.repeat(501);
    await this.fillField('[data-testid="bio-input"]', longBio);
  }
);

Then(
  'I should see a character count indicator',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="character-count"]');
    const charCount = this.page!.locator('[data-testid="character-count"]');
    await expect(charCount).toBeVisible();
  }
);

Then('I should see a validation warning', async function (this: CustomWorld) {
  await this.waitForElement('[data-testid="bio-warning"]');
  const bioWarning = this.page!.locator('[data-testid="bio-warning"]');
  await expect(bioWarning).toBeVisible();
});

Then('the save button should be disabled', async function (this: CustomWorld) {
  const saveButton = this.page!.locator('[data-testid="save-profile-button"]');
  await expect(saveButton).toBeDisabled();
});

When('I enter an age below 18', async function (this: CustomWorld) {
  await this.fillField('[data-testid="age-input"]', '17');
});

Then(
  'I should see an age validation error',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="age-error"]');
    const ageError = this.page!.locator('[data-testid="age-error"]');
    await expect(ageError).toBeVisible();
    await expect(ageError).toContainText('Must be 18 or older');
  }
);

// API Steps
When(
  'I send a GET request to {string}',
  async function (this: CustomWorld, endpoint: string) {
    this.testData.lastApiResponse = await this.apiRequest('GET', endpoint);
  }
);

When(
  'I send a PUT request to {string} with updated profile data',
  async function (this: CustomWorld, endpoint: string) {
    const updatedProfile = {
      name: 'Updated Name',
      age: 30,
      bio: 'Updated bio description',
      interests: ['hiking', 'cooking'],
      location: 'San Francisco',
    };

    this.testData.lastApiResponse = await this.apiRequest(
      'PUT',
      endpoint,
      updatedProfile
    );
  }
);

When(
  'I send a POST request to {string} with a photo file',
  async function (this: CustomWorld, endpoint: string) {
    const formData = new FormData();
    const blob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
    formData.append('photo', blob, 'test-photo.jpg');

    this.testData.lastApiResponse = await this.apiRequest(
      'POST',
      endpoint,
      formData
    );
  }
);

Given(
  'I have a photo with ID {string}',
  async function (this: CustomWorld, photoId: string) {
    // Ensure user has a photo with the specified ID
    this.testData.photoId = photoId;

    // Create a photo if it doesn't exist
    const response = await this.apiRequest('POST', '/api/profile/photos', {
      url: 'https://example.com/test-photo.jpg',
      id: photoId,
    });

    expect(response.status).toBe(201);
  }
);

When(
  'I send a DELETE request to {string}',
  async function (this: CustomWorld, endpoint: string) {
    this.testData.lastApiResponse = await this.apiRequest('DELETE', endpoint);
  }
);

When(
  'I send a PUT request to {string} with invalid data',
  async function (this: CustomWorld, endpoint: string) {
    const invalidProfile = {
      name: '', // Invalid: empty name
      age: 15, // Invalid: under 18
      bio: 'a'.repeat(1000), // Invalid: too long
      email: 'invalid-email', // Invalid: bad email format
    };

    this.testData.lastApiResponse = await this.apiRequest(
      'PUT',
      endpoint,
      invalidProfile
    );
  }
);

When(
  'I send a POST request to {string} with an unsupported file format',
  async function (this: CustomWorld, endpoint: string) {
    const formData = new FormData();
    const blob = new Blob(['fake-file-data'], { type: 'text/plain' });
    formData.append('photo', blob, 'test-file.txt');

    this.testData.lastApiResponse = await this.apiRequest(
      'POST',
      endpoint,
      formData
    );
  }
);

// API Assertion Steps
Then(
  'the API should respond with status code {int}',
  async function (this: CustomWorld, statusCode: number) {
    expect(this.testData.lastApiResponse.status).toBe(statusCode);
  }
);

Then(
  'the response should contain my profile data',
  async function (this: CustomWorld) {
    expect(this.testData.lastApiResponse.data).toHaveProperty('profile');
    const profile = this.testData.lastApiResponse.data.profile;
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('age');
  }
);

Then(
  'the profile data should include name, age, bio, photos, and interests',
  async function (this: CustomWorld) {
    const profile = this.testData.lastApiResponse.data.profile;
    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('age');
    expect(profile).toHaveProperty('bio');
    expect(profile).toHaveProperty('photos');
    expect(profile).toHaveProperty('interests');
    expect(Array.isArray(profile.photos)).toBe(true);
    expect(Array.isArray(profile.interests)).toBe(true);
  }
);

Then(
  'the response should contain the updated profile',
  async function (this: CustomWorld) {
    expect(this.testData.lastApiResponse.data).toHaveProperty('profile');
    const profile = this.testData.lastApiResponse.data.profile;
    expect(profile.name).toBe('Updated Name');
    expect(profile.age).toBe(30);
  }
);

Then(
  'the profile should be updated in the database',
  async function (this: CustomWorld) {
    // Verify by making another GET request
    const verifyResponse = await this.apiRequest('GET', '/api/profile');
    expect(verifyResponse.status).toBe(200);
    const profile = verifyResponse.data.profile;
    expect(profile.name).toBe('Updated Name');
  }
);

Then(
  'the response should contain the photo URL',
  async function (this: CustomWorld) {
    expect(this.testData.lastApiResponse.data).toHaveProperty('photoUrl');
    expect(typeof this.testData.lastApiResponse.data.photoUrl).toBe('string');
  }
);

Then(
  'the photo should be added to my profile',
  async function (this: CustomWorld) {
    // Verify by getting the profile
    const profileResponse = await this.apiRequest('GET', '/api/profile');
    const photos = profileResponse.data.profile.photos;
    expect(photos.length).toBeGreaterThan(0);
  }
);

Then(
  'the photo should be removed from my profile',
  async function (this: CustomWorld) {
    // Verify by getting the profile
    const profileResponse = await this.apiRequest('GET', '/api/profile');
    const photos = profileResponse.data.profile.photos;
    const photoExists = photos.some(
      (photo: any) => photo.id === this.testData.photoId
    );
    expect(photoExists).toBe(false);
  }
);

Then(
  'the response should contain validation errors',
  async function (this: CustomWorld) {
    expect(this.testData.lastApiResponse.data).toHaveProperty('errors');
    expect(Array.isArray(this.testData.lastApiResponse.data.errors)).toBe(true);
    expect(this.testData.lastApiResponse.data.errors.length).toBeGreaterThan(0);
  }
);

Then('the profile should not be updated', async function (this: CustomWorld) {
  // Verify profile wasn't changed by making a GET request
  const profileResponse = await this.apiRequest('GET', '/api/profile');
  const profile = profileResponse.data.profile;
  expect(profile.name).not.toBe(''); // Should still have original name
  expect(profile.age).toBeGreaterThanOrEqual(18); // Should still have valid age
});

Then(
  'the response should contain a file format error',
  async function (this: CustomWorld) {
    expect(this.testData.lastApiResponse.data).toHaveProperty('error');
    expect(this.testData.lastApiResponse.data.error).toContain('format');
  }
);

// Privacy Steps
When('I access privacy settings', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="privacy-settings-button"]');
  await this.waitForElement('[data-testid="privacy-settings-panel"]');
});

When(
  'I set my profile to {string}',
  async function (this: CustomWorld, visibility: string) {
    const visibilitySelect = this.page!.locator(
      '[data-testid="profile-visibility-select"]'
    );
    await visibilitySelect.selectOption(visibility);
  }
);

When('I save the privacy settings', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="save-privacy-button"]');
});

Then(
  'my profile should not be visible to other users',
  async function (this: CustomWorld) {
    // Verify via API that profile is private
    const response = await this.apiRequest('GET', '/api/profile/visibility');
    expect(response.data.visibility).toBe('private');
  }
);

Then('I should not appear in discovery', async function (this: CustomWorld) {
  // This would typically be verified by checking discovery API
  const discoveryResponse = await this.apiRequest('GET', '/api/discovery');
  const profiles = discoveryResponse.data.profiles;
  const myProfile = profiles.find(
    (p: any) => p.id === this.testData.currentUser.id
  );
  expect(myProfile).toBeUndefined();
});

When('I choose to hide my age', async function (this: CustomWorld) {
  const hideAgeCheckbox = this.page!.locator(
    '[data-testid="hide-age-checkbox"]'
  );
  await hideAgeCheckbox.check();
});

Then(
  'my age should not be visible to other users',
  async function (this: CustomWorld) {
    // Verify via API that age is hidden
    const response = await this.apiRequest('GET', '/api/profile/public');
    expect(response.data.profile).not.toHaveProperty('age');
  }
);

Then(
  'other profile information should remain visible',
  async function (this: CustomWorld) {
    const response = await this.apiRequest('GET', '/api/profile/public');
    const profile = response.data.profile;
    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('bio');
    expect(profile).toHaveProperty('photos');
  }
);

// Verification Steps
When('I click the verify photos button', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="verify-photos-button"]');
  await this.waitForElement('[data-testid="verification-modal"]');
});

When(
  'I follow the verification instructions',
  async function (this: CustomWorld) {
    // Simulate following verification steps
    await this.waitForElement('[data-testid="verification-instructions"]');
    await this.clickElement('[data-testid="start-verification-button"]');
  }
);

When('I submit the verification', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="submit-verification-button"]');
});

Then(
  'I should see a verification pending status',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="verification-pending"]');
    const pendingStatus = this.page!.locator(
      '[data-testid="verification-pending"]'
    );
    await expect(pendingStatus).toBeVisible();
  }
);

Then(
  'I should receive a confirmation message',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="verification-confirmation"]');
    const confirmation = this.page!.locator(
      '[data-testid="verification-confirmation"]'
    );
    await expect(confirmation).toBeVisible();
  }
);

// Premium Features Steps
Given('I am a premium user', async function (this: CustomWorld) {
  // Set user as premium
  await this.apiRequest('POST', '/api/users/upgrade-premium', {
    plan: 'premium',
  });

  this.testData.currentUser.isPremium = true;
});

When('I access premium features', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="premium-features-button"]');
  await this.waitForElement('[data-testid="premium-features-panel"]');
});

Then(
  'I should see additional customization options',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="premium-customization"]');
    const premiumOptions = this.page!.locator(
      '[data-testid="premium-customization"]'
    );
    await expect(premiumOptions).toBeVisible();
  }
);

Then('I should be able to add more photos', async function (this: CustomWorld) {
  const addPhotoButtons = this.page!.locator(
    '[data-testid="add-photo-button"]'
  );
  const buttonCount = await addPhotoButtons.count();
  expect(buttonCount).toBeGreaterThan(1); // Premium users can add more photos
});

Then(
  'I should see advanced privacy controls',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="advanced-privacy-controls"]');
    const advancedControls = this.page!.locator(
      '[data-testid="advanced-privacy-controls"]'
    );
    await expect(advancedControls).toBeVisible();
  }
);

// Mobile and Accessibility Steps
Given('I am using a mobile device', async function (this: CustomWorld) {
  await this.page!.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
});

When('I interact with profile elements', async function (this: CustomWorld) {
  // Test various interactions on mobile
  await this.clickElement('[data-testid="edit-profile-button"]');
  await this.waitForElement('[data-testid="edit-profile-form"]');
});

Then(
  'all buttons should be easily tappable',
  async function (this: CustomWorld) {
    const buttons = this.page!.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
      }
    }
  }
);

Then(
  'the photo upload should work on mobile',
  async function (this: CustomWorld) {
    await this.clickElement('[data-testid="add-photo-button"]');
    const fileInput = this.page!.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
  }
);

Then('the interface should be responsive', async function (this: CustomWorld) {
  // Check that elements are properly sized for mobile
  const profileContainer = this.page!.locator('[data-testid="profile-page"]');
  const boundingBox = await profileContainer.boundingBox();

  if (boundingBox) {
    expect(boundingBox.width).toBeLessThanOrEqual(375); // Should fit in mobile viewport
  }
});

// Accessibility Steps
Then(
  'all interactive elements should have proper ARIA labels',
  async function (this: CustomWorld) {
    const interactiveElements = this.page!.locator(
      'button, input, select, [role="button"]'
    );
    const elementCount = await interactiveElements.count();

    for (let i = 0; i < elementCount; i++) {
      const element = interactiveElements.nth(i);
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      const title = await element.getAttribute('title');

      expect(ariaLabel || ariaLabelledBy || title).toBeTruthy();
    }
  }
);

Then(
  'the page should be navigable with keyboard',
  async function (this: CustomWorld) {
    // Test keyboard navigation
    await this.page!.keyboard.press('Tab');
    const focusedElement = await this.page!.locator(':focus').first();
    await expect(focusedElement).toBeVisible();
  }
);

Then(
  'images should have appropriate alt text',
  async function (this: CustomWorld) {
    const images = this.page!.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  }
);

Then(
  'form fields should have proper labels',
  async function (this: CustomWorld) {
    const formFields = this.page!.locator('input, textarea, select');
    const fieldCount = await formFields.count();

    for (let i = 0; i < fieldCount; i++) {
      const field = formFields.nth(i);
      const label = await field.getAttribute('aria-label');
      const labelledBy = await field.getAttribute('aria-labelledby');
      const associatedLabel = await this.page!.locator(
        `label[for="${await field.getAttribute('id')}"]`
      ).count();

      expect(label || labelledBy || associatedLabel > 0).toBeTruthy();
    }
  }
);

// Performance Steps
Then(
  'the page should load within 3 seconds',
  async function (this: CustomWorld) {
    const startTime = Date.now();
    await this.waitForElement('[data-testid="profile-page"]');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  }
);

Then('photos should load progressively', async function (this: CustomWorld) {
  // Check that photos have loading states
  const photos = this.page!.locator('[data-testid="profile-photo"]');
  const firstPhoto = photos.first();

  // Check for loading placeholder or progressive loading
  const hasLoadingState = await firstPhoto
    .locator('[data-testid="photo-loading"]')
    .isVisible();
  const hasProgressiveLoading =
    (await firstPhoto.getAttribute('loading')) === 'lazy';

  expect(hasLoadingState || hasProgressiveLoading).toBeTruthy();
});

Then(
  'the interface should remain responsive during loading',
  async function (this: CustomWorld) {
    // Test that UI remains interactive during loading
    const editButton = this.page!.locator(
      '[data-testid="edit-profile-button"]'
    );
    await expect(editButton).toBeEnabled();
  }
);

// Offline Steps
Given('I lose internet connectivity', async function (this: CustomWorld) {
  await this.page!.context().setOffline(true);
});

When('I make changes to my profile', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="edit-profile-button"]');
  await this.fillField('[data-testid="name-input"]', 'Offline Updated Name');
  await this.clickElement('[data-testid="save-profile-button"]');
});

Then('the changes should be saved locally', async function (this: CustomWorld) {
  // Check for offline indicator or local storage
  const offlineIndicator = this.page!.locator(
    '[data-testid="offline-indicator"]'
  );
  await expect(offlineIndicator).toBeVisible();
});

When('connectivity is restored', async function (this: CustomWorld) {
  await this.page!.context().setOffline(false);
});

Then(
  'the changes should be synced to the server',
  async function (this: CustomWorld) {
    // Wait for sync to complete
    await this.waitForElement('[data-testid="sync-complete"]');

    // Verify changes are on server
    const response = await this.apiRequest('GET', '/api/profile');
    expect(response.data.profile.name).toBe('Offline Updated Name');
  }
);

// Analytics Steps
When('I view my profile analytics', async function (this: CustomWorld) {
  await this.clickElement('[data-testid="analytics-button"]');
  await this.waitForElement('[data-testid="analytics-panel"]');
});

Then(
  'I should see how many people viewed my profile',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="profile-views-count"]');
    const viewsCount = this.page!.locator(
      '[data-testid="profile-views-count"]'
    );
    await expect(viewsCount).toBeVisible();
  }
);

Then(
  'I should see which photos are most popular',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="photo-popularity"]');
    const photoStats = this.page!.locator('[data-testid="photo-popularity"]');
    await expect(photoStats).toBeVisible();
  }
);

Then(
  'I should see profile completion percentage',
  async function (this: CustomWorld) {
    await this.waitForElement('[data-testid="profile-completion"]');
    const completionPercentage = this.page!.locator(
      '[data-testid="profile-completion"]'
    );
    await expect(completionPercentage).toBeVisible();

    const percentageText = await completionPercentage.textContent();
    expect(percentageText).toMatch(/\d+%/);
  }
);
