Feature: User Profile Management
  As a user of the dating app
  I want to manage my profile information
  So that I can present myself accurately to potential matches

  Background:
    Given the application is running
    And I am a registered user
    And I am logged in

  @profile @ui
  Scenario: View my profile
    When I navigate to my profile page
    Then I should see my profile information
    And I should see my photos
    And I should see my bio
    And I should see my interests
    And I should see my basic information

  @profile @ui
  Scenario: Edit basic profile information
    Given I am on my profile page
    When I click the edit profile button
    And I update my name to "John Updated"
    And I update my age to "30"
    And I update my bio to "Updated bio description"
    And I save the changes
    Then I should see a success message
    And my profile should display the updated information

  @profile @ui
  Scenario: Add new photos
    Given I am on my profile page
    When I click the add photo button
    And I select a photo from my device
    And I confirm the photo upload
    Then the photo should be added to my profile
    And I should see the new photo in my photo gallery

  @profile @ui
  Scenario: Reorder photos
    Given I am on my profile page
    And I have multiple photos
    When I drag and drop photos to reorder them
    Then the photos should be reordered
    And the new order should be saved

  @profile @ui
  Scenario: Delete a photo
    Given I am on my profile page
    And I have multiple photos
    When I click on a photo to select it
    And I click the delete photo button
    And I confirm the deletion
    Then the photo should be removed from my profile

  @profile @ui
  Scenario: Update interests
    Given I am on my profile page
    When I click the edit interests button
    And I add new interests "cooking, traveling"
    And I remove existing interest "reading"
    And I save the interest changes
    Then my interests should be updated
    And I should see the new interests displayed

  @profile @ui
  Scenario: Update location
    Given I am on my profile page
    When I click the edit location button
    And I enter a new city "San Francisco"
    And I save the location change
    Then my location should be updated
    And I should see the new location displayed

  @profile @validation
  Scenario: Validation for required fields
    Given I am on my profile page
    When I click the edit profile button
    And I clear the name field
    And I try to save the changes
    Then I should see a validation error for name
    And the changes should not be saved

  @profile @validation
  Scenario: Bio character limit validation
    Given I am on my profile page
    When I click the edit profile button
    And I enter a bio longer than 500 characters
    Then I should see a character count indicator
    And I should see a validation warning
    And the save button should be disabled

  @profile @validation
  Scenario: Age validation
    Given I am on my profile page
    When I click the edit profile button
    And I enter an age below 18
    And I try to save the changes
    Then I should see an age validation error
    And the changes should not be saved

  @profile @api
  Scenario: Get profile via API
    When I send a GET request to "/api/profile"
    Then the API should respond with status code 200
    And the response should contain my profile data
    And the profile data should include name, age, bio, photos, and interests

  @profile @api
  Scenario: Update profile via API
    When I send a PUT request to "/api/profile" with updated profile data
    Then the API should respond with status code 200
    And the response should contain the updated profile
    And the profile should be updated in the database

  @profile @api
  Scenario: Upload photo via API
    When I send a POST request to "/api/profile/photos" with a photo file
    Then the API should respond with status code 201
    And the response should contain the photo URL
    And the photo should be added to my profile

  @profile @api
  Scenario: Delete photo via API
    Given I have a photo with ID "photo123"
    When I send a DELETE request to "/api/profile/photos/photo123"
    Then the API should respond with status code 200
    And the photo should be removed from my profile

  @profile @validation @api
  Scenario: API validation for invalid profile data
    When I send a PUT request to "/api/profile" with invalid data
    Then the API should respond with status code 400
    And the response should contain validation errors
    And the profile should not be updated

  @profile @validation @api
  Scenario: API validation for unsupported photo format
    When I send a POST request to "/api/profile/photos" with an unsupported file format
    Then the API should respond with status code 400
    And the response should contain a file format error

  @profile @privacy
  Scenario: Profile visibility settings
    Given I am on my profile page
    When I access privacy settings
    And I set my profile to "private"
    And I save the privacy settings
    Then my profile should not be visible to other users
    And I should not appear in discovery

  @profile @privacy
  Scenario: Hide specific information
    Given I am on my profile page
    When I access privacy settings
    And I choose to hide my age
    And I save the privacy settings
    Then my age should not be visible to other users
    But other profile information should remain visible

  @profile @verification
  Scenario: Photo verification process
    Given I am on my profile page
    When I click the verify photos button
    And I follow the verification instructions
    And I submit the verification
    Then I should see a verification pending status
    And I should receive a confirmation message

  @profile @premium
  Scenario: Premium profile features
    Given I am a premium user
    And I am on my profile page
    When I access premium features
    Then I should see additional customization options
    And I should be able to add more photos
    And I should see advanced privacy controls

  @profile @mobile @responsive
  Scenario: Profile management on mobile
    Given I am using a mobile device
    And I am on my profile page
    When I interact with profile elements
    Then all buttons should be easily tappable
    And the photo upload should work on mobile
    And the interface should be responsive

  @profile @accessibility
  Scenario: Profile accessibility
    Given I am on my profile page
    Then all interactive elements should have proper ARIA labels
    And the page should be navigable with keyboard
    And images should have appropriate alt text
    And form fields should have proper labels

  @profile @performance
  Scenario: Profile loading performance
    When I navigate to my profile page
    Then the page should load within 3 seconds
    And photos should load progressively
    And the interface should remain responsive during loading

  @profile @offline
  Scenario: Profile editing offline
    Given I am on my profile page
    And I lose internet connectivity
    When I make changes to my profile
    Then the changes should be saved locally
    And when connectivity is restored
    Then the changes should be synced to the server

  @profile @analytics
  Scenario: Profile view analytics
    Given I am on my profile page
    When I view my profile analytics
    Then I should see how many people viewed my profile
    And I should see which photos are most popular
    And I should see profile completion percentage