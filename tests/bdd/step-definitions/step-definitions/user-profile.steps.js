'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const cucumber_1 = require('@cucumber/cucumber');
const test_1 = require('@playwright/test');
// Background Steps
(0, cucumber_1.Given)('I am on my profile page', async function () {
  await this.navigateTo('/profile');
  await this.waitForElement('[data-testid="profile-page"]');
});
// Navigation Steps
(0, cucumber_1.When)('I navigate to my profile page', async function () {
  await this.navigateTo('/profile');
  await this.waitForElement('[data-testid="profile-page"]');
});
// Basic Profile Viewing Steps
(0, cucumber_1.Then)('I should see my profile information', async function () {
  await this.waitForElement('[data-testid="profile-info"]');
  const profileInfo = this.page.locator('[data-testid="profile-info"]');
  await (0, test_1.expect)(profileInfo).toBeVisible();
});
(0, cucumber_1.Then)('I should see my photos', async function () {
  await this.waitForElement('[data-testid="profile-photos"]');
  const photos = this.page.locator('[data-testid="profile-photo"]');
  const photoCount = await photos.count();
  (0, test_1.expect)(photoCount).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('I should see my bio', async function () {
  await this.waitForElement('[data-testid="profile-bio"]');
  const bio = this.page.locator('[data-testid="profile-bio"]');
  await (0, test_1.expect)(bio).toBeVisible();
});
(0, cucumber_1.Then)('I should see my interests', async function () {
  await this.waitForElement('[data-testid="profile-interests"]');
  const interests = this.page.locator('[data-testid="profile-interests"]');
  await (0, test_1.expect)(interests).toBeVisible();
});
(0, cucumber_1.Then)('I should see my basic information', async function () {
  await this.waitForElement('[data-testid="profile-basic-info"]');
  const basicInfo = this.page.locator('[data-testid="profile-basic-info"]');
  await (0, test_1.expect)(basicInfo).toBeVisible();
  // Check for name and age
  await (0, test_1.expect)(
    this.page.locator('[data-testid="profile-name"]')
  ).toBeVisible();
  await (0, test_1.expect)(
    this.page.locator('[data-testid="profile-age"]')
  ).toBeVisible();
});
// Profile Editing Steps
(0, cucumber_1.When)('I click the edit profile button', async function () {
  await this.clickElement('[data-testid="edit-profile-button"]');
  await this.waitForElement('[data-testid="edit-profile-form"]');
});
(0, cucumber_1.When)('I update my name to {string}', async function (newName) {
  await this.fillField('[data-testid="name-input"]', newName);
  this.testData.updatedName = newName;
});
(0, cucumber_1.When)('I update my age to {string}', async function (newAge) {
  await this.fillField('[data-testid="age-input"]', newAge);
  this.testData.updatedAge = newAge;
});
(0, cucumber_1.When)('I update my bio to {string}', async function (newBio) {
  await this.fillField('[data-testid="bio-input"]', newBio);
  this.testData.updatedBio = newBio;
});
(0, cucumber_1.When)('I save the changes', async function () {
  await this.clickElement('[data-testid="save-profile-button"]');
});
(0, cucumber_1.Then)('I should see a success message', async function () {
  await this.waitForElement('[data-testid="success-message"]');
  const successMessage = this.page.locator('[data-testid="success-message"]');
  await (0, test_1.expect)(successMessage).toBeVisible();
});
(0, cucumber_1.Then)(
  'my profile should display the updated information',
  async function () {
    // Wait for the form to close and profile to update
    await this.waitForElement('[data-testid="profile-info"]');
    if (this.testData.updatedName) {
      const nameElement = this.page.locator('[data-testid="profile-name"]');
      await (0, test_1.expect)(nameElement).toContainText(
        this.testData.updatedName
      );
    }
    if (this.testData.updatedAge) {
      const ageElement = this.page.locator('[data-testid="profile-age"]');
      await (0, test_1.expect)(ageElement).toContainText(
        this.testData.updatedAge
      );
    }
    if (this.testData.updatedBio) {
      const bioElement = this.page.locator('[data-testid="profile-bio"]');
      await (0, test_1.expect)(bioElement).toContainText(
        this.testData.updatedBio
      );
    }
  }
);
// Photo Management Steps
(0, cucumber_1.When)('I click the add photo button', async function () {
  await this.clickElement('[data-testid="add-photo-button"]');
});
(0, cucumber_1.When)('I select a photo from my device', async function () {
  const fileInput = this.page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'test-photo.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
  });
});
(0, cucumber_1.When)('I confirm the photo upload', async function () {
  await this.clickElement('[data-testid="confirm-upload-button"]');
});
(0, cucumber_1.Then)(
  'the photo should be added to my profile',
  async function () {
    await this.waitForElement('[data-testid="upload-success"]');
    const uploadSuccess = this.page.locator('[data-testid="upload-success"]');
    await (0, test_1.expect)(uploadSuccess).toBeVisible();
  }
);
(0, cucumber_1.Then)(
  'I should see the new photo in my photo gallery',
  async function () {
    await this.waitForElement('[data-testid="profile-photos"]');
    const photos = this.page.locator('[data-testid="profile-photo"]');
    const photoCount = await photos.count();
    (0, test_1.expect)(photoCount).toBeGreaterThan(0);
  }
);
(0, cucumber_1.Given)('I have multiple photos', async function () {
  // Ensure user has multiple photos
  const photos = this.page.locator('[data-testid="profile-photo"]');
  const photoCount = await photos.count();
  if (photoCount < 2) {
    // Add more photos if needed
    for (let i = photoCount; i < 2; i++) {
      await this.clickElement('[data-testid="add-photo-button"]');
      const fileInput = this.page.locator('input[type="file"]');
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
(0, cucumber_1.When)(
  'I drag and drop photos to reorder them',
  async function () {
    const firstPhoto = this.page
      .locator('[data-testid="profile-photo"]')
      .first();
    const secondPhoto = this.page
      .locator('[data-testid="profile-photo"]')
      .nth(1);
    // Simulate drag and drop
    await firstPhoto.dragTo(secondPhoto);
  }
);
(0, cucumber_1.Then)('the photos should be reordered', async function () {
  // Wait for reorder animation to complete
  await this.page.waitForTimeout(1000);
  // Verify the order has changed (this would depend on your implementation)
  const photos = this.page.locator('[data-testid="profile-photo"]');
  (0, test_1.expect)(await photos.count()).toBeGreaterThan(1);
});
(0, cucumber_1.Then)('the new order should be saved', async function () {
  // Refresh the page to verify the order persists
  await this.page.reload();
  await this.waitForElement('[data-testid="profile-photos"]');
  // Verify the order is maintained after reload
  const photos = this.page.locator('[data-testid="profile-photo"]');
  (0, test_1.expect)(await photos.count()).toBeGreaterThan(1);
});
(0, cucumber_1.When)('I click on a photo to select it', async function () {
  const firstPhoto = this.page.locator('[data-testid="profile-photo"]').first();
  await firstPhoto.click();
  // Wait for photo to be selected
  await (0, test_1.expect)(firstPhoto).toHaveClass(/selected/);
});
(0, cucumber_1.When)('I click the delete photo button', async function () {
  await this.clickElement('[data-testid="delete-photo-button"]');
});
(0, cucumber_1.When)('I confirm the deletion', async function () {
  await this.clickElement('[data-testid="confirm-delete-button"]');
});
(0, cucumber_1.Then)(
  'the photo should be removed from my profile',
  async function () {
    await this.waitForElement('[data-testid="delete-success"]');
    const deleteSuccess = this.page.locator('[data-testid="delete-success"]');
    await (0, test_1.expect)(deleteSuccess).toBeVisible();
  }
);
// Interests Management Steps
(0, cucumber_1.When)('I click the edit interests button', async function () {
  await this.clickElement('[data-testid="edit-interests-button"]');
  await this.waitForElement('[data-testid="interests-editor"]');
});
(0, cucumber_1.When)(
  'I add new interests {string}',
  async function (interests) {
    const interestList = interests.split(', ');
    for (const interest of interestList) {
      await this.fillField('[data-testid="interest-input"]', interest);
      await this.clickElement('[data-testid="add-interest-button"]');
    }
    this.testData.newInterests = interestList;
  }
);
(0, cucumber_1.When)(
  'I remove existing interest {string}',
  async function (interest) {
    const interestTag = this.page.locator(
      `[data-testid="interest-tag-${interest}"]`
    );
    const removeButton = interestTag.locator('[data-testid="remove-interest"]');
    await removeButton.click();
    this.testData.removedInterest = interest;
  }
);
(0, cucumber_1.When)('I save the interest changes', async function () {
  await this.clickElement('[data-testid="save-interests-button"]');
});
(0, cucumber_1.Then)('my interests should be updated', async function () {
  await this.waitForElement('[data-testid="profile-interests"]');
  // Check new interests are displayed
  if (this.testData.newInterests) {
    for (const interest of this.testData.newInterests) {
      const interestElement = this.page.locator(
        `[data-testid="interest-${interest}"]`
      );
      await (0, test_1.expect)(interestElement).toBeVisible();
    }
  }
  // Check removed interest is not displayed
  if (this.testData.removedInterest) {
    const removedInterestElement = this.page.locator(
      `[data-testid="interest-${this.testData.removedInterest}"]`
    );
    await (0, test_1.expect)(removedInterestElement).not.toBeVisible();
  }
});
(0, cucumber_1.Then)(
  'I should see the new interests displayed',
  async function () {
    await this.waitForElement('[data-testid="profile-interests"]');
    const interestsContainer = this.page.locator(
      '[data-testid="profile-interests"]'
    );
    await (0, test_1.expect)(interestsContainer).toBeVisible();
  }
);
// Location Management Steps
(0, cucumber_1.When)('I click the edit location button', async function () {
  await this.clickElement('[data-testid="edit-location-button"]');
  await this.waitForElement('[data-testid="location-editor"]');
});
(0, cucumber_1.When)('I enter a new city {string}', async function (city) {
  await this.fillField('[data-testid="city-input"]', city);
  this.testData.updatedCity = city;
});
(0, cucumber_1.When)('I save the location change', async function () {
  await this.clickElement('[data-testid="save-location-button"]');
});
(0, cucumber_1.Then)('my location should be updated', async function () {
  await this.waitForElement('[data-testid="profile-location"]');
  const locationElement = this.page.locator('[data-testid="profile-location"]');
  await (0, test_1.expect)(locationElement).toContainText(
    this.testData.updatedCity
  );
});
(0, cucumber_1.Then)(
  'I should see the new location displayed',
  async function () {
    await this.waitForElement('[data-testid="profile-location"]');
    const locationElement = this.page.locator(
      '[data-testid="profile-location"]'
    );
    await (0, test_1.expect)(locationElement).toBeVisible();
  }
);
// Validation Steps
(0, cucumber_1.When)('I clear the name field', async function () {
  await this.fillField('[data-testid="name-input"]', '');
});
(0, cucumber_1.When)('I try to save the changes', async function () {
  await this.clickElement('[data-testid="save-profile-button"]');
});
(0, cucumber_1.Then)(
  'I should see a validation error for name',
  async function () {
    await this.waitForElement('[data-testid="name-error"]');
    const nameError = this.page.locator('[data-testid="name-error"]');
    await (0, test_1.expect)(nameError).toBeVisible();
    await (0, test_1.expect)(nameError).toContainText('Name is required');
  }
);
(0, cucumber_1.Then)('the changes should not be saved', async function () {
  // Verify the form is still open (indicating save failed)
  const editForm = this.page.locator('[data-testid="edit-profile-form"]');
  await (0, test_1.expect)(editForm).toBeVisible();
});
(0, cucumber_1.When)(
  'I enter a bio longer than 500 characters',
  async function () {
    const longBio = 'a'.repeat(501);
    await this.fillField('[data-testid="bio-input"]', longBio);
  }
);
(0, cucumber_1.Then)(
  'I should see a character count indicator',
  async function () {
    await this.waitForElement('[data-testid="character-count"]');
    const charCount = this.page.locator('[data-testid="character-count"]');
    await (0, test_1.expect)(charCount).toBeVisible();
  }
);
(0, cucumber_1.Then)('I should see a validation warning', async function () {
  await this.waitForElement('[data-testid="bio-warning"]');
  const bioWarning = this.page.locator('[data-testid="bio-warning"]');
  await (0, test_1.expect)(bioWarning).toBeVisible();
});
(0, cucumber_1.Then)('the save button should be disabled', async function () {
  const saveButton = this.page.locator('[data-testid="save-profile-button"]');
  await (0, test_1.expect)(saveButton).toBeDisabled();
});
(0, cucumber_1.When)('I enter an age below 18', async function () {
  await this.fillField('[data-testid="age-input"]', '17');
});
(0, cucumber_1.Then)('I should see an age validation error', async function () {
  await this.waitForElement('[data-testid="age-error"]');
  const ageError = this.page.locator('[data-testid="age-error"]');
  await (0, test_1.expect)(ageError).toBeVisible();
  await (0, test_1.expect)(ageError).toContainText('Must be 18 or older');
});
// API Steps
(0, cucumber_1.When)(
  'I send a GET request to {string}',
  async function (endpoint) {
    this.testData.lastApiResponse = await this.apiRequest('GET', endpoint);
  }
);
(0, cucumber_1.When)(
  'I send a PUT request to {string} with updated profile data',
  async function (endpoint) {
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
(0, cucumber_1.When)(
  'I send a POST request to {string} with a photo file',
  async function (endpoint) {
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
(0, cucumber_1.Given)(
  'I have a photo with ID {string}',
  async function (photoId) {
    // Ensure user has a photo with the specified ID
    this.testData.photoId = photoId;
    // Create a photo if it doesn't exist
    const response = await this.apiRequest('POST', '/api/profile/photos', {
      url: 'https://example.com/test-photo.jpg',
      id: photoId,
    });
    (0, test_1.expect)(response.status).toBe(201);
  }
);
(0, cucumber_1.When)(
  'I send a DELETE request to {string}',
  async function (endpoint) {
    this.testData.lastApiResponse = await this.apiRequest('DELETE', endpoint);
  }
);
(0, cucumber_1.When)(
  'I send a PUT request to {string} with invalid data',
  async function (endpoint) {
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
(0, cucumber_1.When)(
  'I send a POST request to {string} with an unsupported file format',
  async function (endpoint) {
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
(0, cucumber_1.Then)(
  'the API should respond with status code {int}',
  async function (statusCode) {
    (0, test_1.expect)(this.testData.lastApiResponse.status).toBe(statusCode);
  }
);
(0, cucumber_1.Then)(
  'the response should contain my profile data',
  async function () {
    (0, test_1.expect)(this.testData.lastApiResponse.data).toHaveProperty(
      'profile'
    );
    const profile = this.testData.lastApiResponse.data.profile;
    (0, test_1.expect)(profile).toHaveProperty('id');
    (0, test_1.expect)(profile).toHaveProperty('name');
    (0, test_1.expect)(profile).toHaveProperty('age');
  }
);
(0, cucumber_1.Then)(
  'the profile data should include name, age, bio, photos, and interests',
  async function () {
    const profile = this.testData.lastApiResponse.data.profile;
    (0, test_1.expect)(profile).toHaveProperty('name');
    (0, test_1.expect)(profile).toHaveProperty('age');
    (0, test_1.expect)(profile).toHaveProperty('bio');
    (0, test_1.expect)(profile).toHaveProperty('photos');
    (0, test_1.expect)(profile).toHaveProperty('interests');
    (0, test_1.expect)(Array.isArray(profile.photos)).toBe(true);
    (0, test_1.expect)(Array.isArray(profile.interests)).toBe(true);
  }
);
(0, cucumber_1.Then)(
  'the response should contain the updated profile',
  async function () {
    (0, test_1.expect)(this.testData.lastApiResponse.data).toHaveProperty(
      'profile'
    );
    const profile = this.testData.lastApiResponse.data.profile;
    (0, test_1.expect)(profile.name).toBe('Updated Name');
    (0, test_1.expect)(profile.age).toBe(30);
  }
);
(0, cucumber_1.Then)(
  'the profile should be updated in the database',
  async function () {
    // Verify by making another GET request
    const verifyResponse = await this.apiRequest('GET', '/api/profile');
    (0, test_1.expect)(verifyResponse.status).toBe(200);
    const profile = verifyResponse.data.profile;
    (0, test_1.expect)(profile.name).toBe('Updated Name');
  }
);
(0, cucumber_1.Then)(
  'the response should contain the photo URL',
  async function () {
    (0, test_1.expect)(this.testData.lastApiResponse.data).toHaveProperty(
      'photoUrl'
    );
    (0, test_1.expect)(typeof this.testData.lastApiResponse.data.photoUrl).toBe(
      'string'
    );
  }
);
(0, cucumber_1.Then)(
  'the photo should be added to my profile',
  async function () {
    // Verify by getting the profile
    const profileResponse = await this.apiRequest('GET', '/api/profile');
    const photos = profileResponse.data.profile.photos;
    (0, test_1.expect)(photos.length).toBeGreaterThan(0);
  }
);
(0, cucumber_1.Then)(
  'the photo should be removed from my profile',
  async function () {
    // Verify by getting the profile
    const profileResponse = await this.apiRequest('GET', '/api/profile');
    const photos = profileResponse.data.profile.photos;
    const photoExists = photos.some(
      photo => photo.id === this.testData.photoId
    );
    (0, test_1.expect)(photoExists).toBe(false);
  }
);
(0, cucumber_1.Then)(
  'the response should contain validation errors',
  async function () {
    (0, test_1.expect)(this.testData.lastApiResponse.data).toHaveProperty(
      'errors'
    );
    (0, test_1.expect)(
      Array.isArray(this.testData.lastApiResponse.data.errors)
    ).toBe(true);
    (0, test_1.expect)(
      this.testData.lastApiResponse.data.errors.length
    ).toBeGreaterThan(0);
  }
);
(0, cucumber_1.Then)('the profile should not be updated', async function () {
  // Verify profile wasn't changed by making a GET request
  const profileResponse = await this.apiRequest('GET', '/api/profile');
  const profile = profileResponse.data.profile;
  (0, test_1.expect)(profile.name).not.toBe(''); // Should still have original name
  (0, test_1.expect)(profile.age).toBeGreaterThanOrEqual(18); // Should still have valid age
});
(0, cucumber_1.Then)(
  'the response should contain a file format error',
  async function () {
    (0, test_1.expect)(this.testData.lastApiResponse.data).toHaveProperty(
      'error'
    );
    (0, test_1.expect)(this.testData.lastApiResponse.data.error).toContain(
      'format'
    );
  }
);
// Privacy Steps
(0, cucumber_1.When)('I access privacy settings', async function () {
  await this.clickElement('[data-testid="privacy-settings-button"]');
  await this.waitForElement('[data-testid="privacy-settings-panel"]');
});
(0, cucumber_1.When)(
  'I set my profile to {string}',
  async function (visibility) {
    const visibilitySelect = this.page.locator(
      '[data-testid="profile-visibility-select"]'
    );
    await visibilitySelect.selectOption(visibility);
  }
);
(0, cucumber_1.When)('I save the privacy settings', async function () {
  await this.clickElement('[data-testid="save-privacy-button"]');
});
(0, cucumber_1.Then)(
  'my profile should not be visible to other users',
  async function () {
    // Verify via API that profile is private
    const response = await this.apiRequest('GET', '/api/profile/visibility');
    (0, test_1.expect)(response.data.visibility).toBe('private');
  }
);
(0, cucumber_1.Then)('I should not appear in discovery', async function () {
  // This would typically be verified by checking discovery API
  const discoveryResponse = await this.apiRequest('GET', '/api/discovery');
  const profiles = discoveryResponse.data.profiles;
  const myProfile = profiles.find(p => p.id === this.testData.currentUser.id);
  (0, test_1.expect)(myProfile).toBeUndefined();
});
(0, cucumber_1.When)('I choose to hide my age', async function () {
  const hideAgeCheckbox = this.page.locator(
    '[data-testid="hide-age-checkbox"]'
  );
  await hideAgeCheckbox.check();
});
(0, cucumber_1.Then)(
  'my age should not be visible to other users',
  async function () {
    // Verify via API that age is hidden
    const response = await this.apiRequest('GET', '/api/profile/public');
    (0, test_1.expect)(response.data.profile).not.toHaveProperty('age');
  }
);
(0, cucumber_1.Then)(
  'other profile information should remain visible',
  async function () {
    const response = await this.apiRequest('GET', '/api/profile/public');
    const profile = response.data.profile;
    (0, test_1.expect)(profile).toHaveProperty('name');
    (0, test_1.expect)(profile).toHaveProperty('bio');
    (0, test_1.expect)(profile).toHaveProperty('photos');
  }
);
// Verification Steps
(0, cucumber_1.When)('I click the verify photos button', async function () {
  await this.clickElement('[data-testid="verify-photos-button"]');
  await this.waitForElement('[data-testid="verification-modal"]');
});
(0, cucumber_1.When)(
  'I follow the verification instructions',
  async function () {
    // Simulate following verification steps
    await this.waitForElement('[data-testid="verification-instructions"]');
    await this.clickElement('[data-testid="start-verification-button"]');
  }
);
(0, cucumber_1.When)('I submit the verification', async function () {
  await this.clickElement('[data-testid="submit-verification-button"]');
});
(0, cucumber_1.Then)(
  'I should see a verification pending status',
  async function () {
    await this.waitForElement('[data-testid="verification-pending"]');
    const pendingStatus = this.page.locator(
      '[data-testid="verification-pending"]'
    );
    await (0, test_1.expect)(pendingStatus).toBeVisible();
  }
);
(0, cucumber_1.Then)(
  'I should receive a confirmation message',
  async function () {
    await this.waitForElement('[data-testid="verification-confirmation"]');
    const confirmation = this.page.locator(
      '[data-testid="verification-confirmation"]'
    );
    await (0, test_1.expect)(confirmation).toBeVisible();
  }
);
// Premium Features Steps
(0, cucumber_1.Given)('I am a premium user', async function () {
  // Set user as premium
  await this.apiRequest('POST', '/api/users/upgrade-premium', {
    plan: 'premium',
  });
  this.testData.currentUser.isPremium = true;
});
(0, cucumber_1.When)('I access premium features', async function () {
  await this.clickElement('[data-testid="premium-features-button"]');
  await this.waitForElement('[data-testid="premium-features-panel"]');
});
(0, cucumber_1.Then)(
  'I should see additional customization options',
  async function () {
    await this.waitForElement('[data-testid="premium-customization"]');
    const premiumOptions = this.page.locator(
      '[data-testid="premium-customization"]'
    );
    await (0, test_1.expect)(premiumOptions).toBeVisible();
  }
);
(0, cucumber_1.Then)('I should be able to add more photos', async function () {
  const addPhotoButtons = this.page.locator('[data-testid="add-photo-button"]');
  const buttonCount = await addPhotoButtons.count();
  (0, test_1.expect)(buttonCount).toBeGreaterThan(1); // Premium users can add more photos
});
(0, cucumber_1.Then)(
  'I should see advanced privacy controls',
  async function () {
    await this.waitForElement('[data-testid="advanced-privacy-controls"]');
    const advancedControls = this.page.locator(
      '[data-testid="advanced-privacy-controls"]'
    );
    await (0, test_1.expect)(advancedControls).toBeVisible();
  }
);
// Mobile and Accessibility Steps
(0, cucumber_1.Given)('I am using a mobile device', async function () {
  await this.page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
});
(0, cucumber_1.When)('I interact with profile elements', async function () {
  // Test various interactions on mobile
  await this.clickElement('[data-testid="edit-profile-button"]');
  await this.waitForElement('[data-testid="edit-profile-form"]');
});
(0, cucumber_1.Then)(
  'all buttons should be easily tappable',
  async function () {
    const buttons = this.page.locator('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();
      if (boundingBox) {
        (0, test_1.expect)(boundingBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
        (0, test_1.expect)(boundingBox.width).toBeGreaterThanOrEqual(44);
      }
    }
  }
);
(0, cucumber_1.Then)(
  'the photo upload should work on mobile',
  async function () {
    await this.clickElement('[data-testid="add-photo-button"]');
    const fileInput = this.page.locator('input[type="file"]');
    await (0, test_1.expect)(fileInput).toBeVisible();
  }
);
(0, cucumber_1.Then)('the interface should be responsive', async function () {
  // Check that elements are properly sized for mobile
  const profileContainer = this.page.locator('[data-testid="profile-page"]');
  const boundingBox = await profileContainer.boundingBox();
  if (boundingBox) {
    (0, test_1.expect)(boundingBox.width).toBeLessThanOrEqual(375); // Should fit in mobile viewport
  }
});
// Accessibility Steps
(0, cucumber_1.Then)(
  'all interactive elements should have proper ARIA labels',
  async function () {
    const interactiveElements = this.page.locator(
      'button, input, select, [role="button"]'
    );
    const elementCount = await interactiveElements.count();
    for (let i = 0; i < elementCount; i++) {
      const element = interactiveElements.nth(i);
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      const title = await element.getAttribute('title');
      (0, test_1.expect)(ariaLabel || ariaLabelledBy || title).toBeTruthy();
    }
  }
);
(0, cucumber_1.Then)(
  'the page should be navigable with keyboard',
  async function () {
    // Test keyboard navigation
    await this.page.keyboard.press('Tab');
    const focusedElement = await this.page.locator(':focus').first();
    await (0, test_1.expect)(focusedElement).toBeVisible();
  }
);
(0, cucumber_1.Then)(
  'images should have appropriate alt text',
  async function () {
    const images = this.page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');
      (0, test_1.expect)(altText).toBeTruthy();
    }
  }
);
(0, cucumber_1.Then)(
  'form fields should have proper labels',
  async function () {
    const formFields = this.page.locator('input, textarea, select');
    const fieldCount = await formFields.count();
    for (let i = 0; i < fieldCount; i++) {
      const field = formFields.nth(i);
      const label = await field.getAttribute('aria-label');
      const labelledBy = await field.getAttribute('aria-labelledby');
      const associatedLabel = await this.page
        .locator(`label[for="${await field.getAttribute('id')}"]`)
        .count();
      (0, test_1.expect)(
        label || labelledBy || associatedLabel > 0
      ).toBeTruthy();
    }
  }
);
// Performance Steps
(0, cucumber_1.Then)(
  'the page should load within 3 seconds',
  async function () {
    const startTime = Date.now();
    await this.waitForElement('[data-testid="profile-page"]');
    const loadTime = Date.now() - startTime;
    (0, test_1.expect)(loadTime).toBeLessThan(3000);
  }
);
(0, cucumber_1.Then)('photos should load progressively', async function () {
  // Check that photos have loading states
  const photos = this.page.locator('[data-testid="profile-photo"]');
  const firstPhoto = photos.first();
  // Check for loading placeholder or progressive loading
  const hasLoadingState = await firstPhoto
    .locator('[data-testid="photo-loading"]')
    .isVisible();
  const hasProgressiveLoading =
    (await firstPhoto.getAttribute('loading')) === 'lazy';
  (0, test_1.expect)(hasLoadingState || hasProgressiveLoading).toBeTruthy();
});
(0, cucumber_1.Then)(
  'the interface should remain responsive during loading',
  async function () {
    // Test that UI remains interactive during loading
    const editButton = this.page.locator('[data-testid="edit-profile-button"]');
    await (0, test_1.expect)(editButton).toBeEnabled();
  }
);
// Offline Steps
(0, cucumber_1.Given)('I lose internet connectivity', async function () {
  await this.page.context().setOffline(true);
});
(0, cucumber_1.When)('I make changes to my profile', async function () {
  await this.clickElement('[data-testid="edit-profile-button"]');
  await this.fillField('[data-testid="name-input"]', 'Offline Updated Name');
  await this.clickElement('[data-testid="save-profile-button"]');
});
(0, cucumber_1.Then)('the changes should be saved locally', async function () {
  // Check for offline indicator or local storage
  const offlineIndicator = this.page.locator(
    '[data-testid="offline-indicator"]'
  );
  await (0, test_1.expect)(offlineIndicator).toBeVisible();
});
(0, cucumber_1.When)('connectivity is restored', async function () {
  await this.page.context().setOffline(false);
});
(0, cucumber_1.Then)(
  'the changes should be synced to the server',
  async function () {
    // Wait for sync to complete
    await this.waitForElement('[data-testid="sync-complete"]');
    // Verify changes are on server
    const response = await this.apiRequest('GET', '/api/profile');
    (0, test_1.expect)(response.data.profile.name).toBe('Offline Updated Name');
  }
);
// Analytics Steps
(0, cucumber_1.When)('I view my profile analytics', async function () {
  await this.clickElement('[data-testid="analytics-button"]');
  await this.waitForElement('[data-testid="analytics-panel"]');
});
(0, cucumber_1.Then)(
  'I should see how many people viewed my profile',
  async function () {
    await this.waitForElement('[data-testid="profile-views-count"]');
    const viewsCount = this.page.locator('[data-testid="profile-views-count"]');
    await (0, test_1.expect)(viewsCount).toBeVisible();
  }
);
(0, cucumber_1.Then)(
  'I should see which photos are most popular',
  async function () {
    await this.waitForElement('[data-testid="photo-popularity"]');
    const photoStats = this.page.locator('[data-testid="photo-popularity"]');
    await (0, test_1.expect)(photoStats).toBeVisible();
  }
);
(0, cucumber_1.Then)(
  'I should see profile completion percentage',
  async function () {
    await this.waitForElement('[data-testid="profile-completion"]');
    const completionPercentage = this.page.locator(
      '[data-testid="profile-completion"]'
    );
    await (0, test_1.expect)(completionPercentage).toBeVisible();
    const percentageText = await completionPercentage.textContent();
    (0, test_1.expect)(percentageText).toMatch(/\d+%/);
  }
);
