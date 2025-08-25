@auth @ui
Feature: User Registration
  As a new user
  I want to register for an account
  So that I can access the SoulMatting platform

  Background:
    Given the application is running
    And I am on the registration page

  @smoke
  Scenario: Successful user registration with valid data
    Given I am a new user with valid registration data
    When I fill in the registration form with valid data
    And I submit the registration form
    Then I should see a success message
    And I should be redirected to the profile setup page
    And a new user account should be created in the system

  @validation
  Scenario: Registration fails with invalid email format
    Given I am on the registration page
    When I enter an invalid email format "invalid-email"
    And I enter a valid password "ValidPassword123!"
    And I enter a valid name "John Doe"
    And I submit the registration form
    Then I should see an error message "Please enter a valid email address"
    And I should remain on the registration page

  @validation
  Scenario: Registration fails with weak password
    Given I am on the registration page
    When I enter a valid email "test@example.com"
    And I enter a weak password "123"
    And I enter a valid name "John Doe"
    And I submit the registration form
    Then I should see an error message "Password must be at least 8 characters long"
    And I should remain on the registration page

  @validation
  Scenario: Registration fails with missing required fields
    Given I am on the registration page
    When I leave the email field empty
    And I leave the password field empty
    And I leave the name field empty
    And I submit the registration form
    Then I should see validation errors for all required fields
    And I should remain on the registration page

  @duplicate
  Scenario: Registration fails with existing email
    Given a user already exists with email "existing@example.com"
    When I try to register with the same email "existing@example.com"
    And I enter a valid password "ValidPassword123!"
    And I enter a valid name "Jane Doe"
    And I submit the registration form
    Then I should see an error message "An account with this email already exists"
    And I should remain on the registration page

  @api
  Scenario: User registration via API
    Given I have valid user registration data
    When I send a POST request to "/api/auth/register" with the user data
    Then the API should respond with status code 201
    And the response should contain the user ID
    And the response should contain a JWT token
    And the user should be stored in the database

  @api @validation
  Scenario: API registration fails with invalid data
    Given I have invalid user registration data
    When I send a POST request to "/api/auth/register" with the invalid data
    Then the API should respond with status code 400
    And the response should contain validation errors
    And no user should be created in the database

  @security
  Scenario: Password is properly hashed in database
    Given I register a new user with password "MySecretPassword123!"
    When I check the user data in the database
    Then the password should be hashed
    And the password should not be stored in plain text
    And the password hash should be verifiable

  @ui @accessibility
  Scenario: Registration form is accessible
    Given I am on the registration page
    Then the form should have proper ARIA labels
    And all form fields should be keyboard accessible
    And error messages should be announced to screen readers
    And the form should have a logical tab order

  @ui @responsive
  Scenario: Registration form works on mobile devices
    Given I am using a mobile device
    And I am on the registration page
    When I fill in the registration form
    Then the form should be properly displayed on mobile
    And all form fields should be easily accessible
    And the submit button should be clearly visible