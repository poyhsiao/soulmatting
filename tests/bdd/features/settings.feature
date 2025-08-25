Feature: Settings and Preferences Management
  As a user of the dating app
  I want to manage my account settings and preferences
  So that I can customize my experience and control my privacy

  Background:
    Given I am a registered user
    And I am logged into the app
    And I am on the settings page

  @ui @settings
  Scenario: View account settings
    When I navigate to account settings
    Then I should see my current email address
    And I should see my account creation date
    And I should see my subscription status
    And I should see options to change my password
    And I should see options to delete my account

  @ui @settings
  Scenario: Update email address
    Given I am on the account settings page
    When I click "Change Email"
    And I enter a new email address "newemail@example.com"
    And I enter my current password
    And I click "Update Email"
    Then I should see a confirmation message
    And I should receive a verification email
    And my email should be updated after verification

  @ui @settings
  Scenario: Change password
    Given I am on the account settings page
    When I click "Change Password"
    And I enter my current password
    And I enter a new password "NewSecurePass123!"
    And I confirm the new password
    And I click "Update Password"
    Then I should see a success message
    And I should be able to login with the new password

  @ui @settings @validation
  Scenario: Password change validation
    Given I am on the change password page
    When I enter an incorrect current password
    And I enter a new password
    And I click "Update Password"
    Then I should see an error message "Current password is incorrect"
    And my password should not be changed

  @ui @settings @validation
  Scenario: Weak password validation
    Given I am on the change password page
    When I enter my current password
    And I enter a weak password "123"
    And I click "Update Password"
    Then I should see an error message about password strength
    And I should see password requirements
    And my password should not be changed

  @ui @settings
  Scenario: Update privacy settings
    Given I am on the privacy settings page
    When I toggle "Show my age" off
    And I toggle "Show my distance" off
    And I set my profile visibility to "Friends of friends only"
    And I save the settings
    Then my privacy settings should be updated
    And other users should not see my age
    And other users should not see my distance

  @ui @settings
  Scenario: Configure discovery preferences
    Given I am on the discovery settings page
    When I set my age range to "25-35"
    And I set my distance range to "10 miles"
    And I select interested in "Women"
    And I enable "Show me people outside my preferences if I run out"
    And I save the settings
    Then my discovery preferences should be updated
    And I should see matches within my criteria

  @ui @settings
  Scenario: Manage blocked users
    Given I have blocked some users
    And I am on the blocked users page
    When I view my blocked list
    Then I should see all blocked users
    And I should be able to unblock users
    When I unblock a user
    Then they should be removed from my blocked list
    And they should be able to see my profile again

  @ui @settings
  Scenario: Configure notification preferences
    Given I am on the notification settings page
    When I disable push notifications
    And I enable email notifications for matches only
    And I set quiet hours from 10 PM to 8 AM
    And I save the settings
    Then I should not receive push notifications
    And I should only receive email notifications for matches
    And I should not receive notifications during quiet hours

  @ui @settings
  Scenario: Delete account
    Given I am on the account settings page
    When I click "Delete Account"
    And I see a warning about permanent deletion
    And I enter my password to confirm
    And I select a reason for leaving
    And I click "Permanently Delete Account"
    Then my account should be scheduled for deletion
    And I should receive a confirmation email
    And I should be logged out
    And I should not be able to login

  @ui @settings @validation
  Scenario: Cancel account deletion
    Given I am on the delete account page
    When I click "Delete Account"
    And I see the confirmation dialog
    And I click "Cancel"
    Then I should return to the settings page
    And my account should remain active

  @api @settings
  Scenario: Get user settings via API
    When I send a GET request to "/api/settings"
    Then the API should respond with status code 200
    And the response should contain my current settings
    And the response should include privacy preferences
    And the response should include notification preferences
    And the response should include discovery preferences

  @api @settings
  Scenario: Update settings via API
    When I send a PUT request to "/api/settings" with updated preferences
    Then the API should respond with status code 200
    And the response should confirm the settings update
    And subsequent API calls should return the updated settings

  @api @settings @validation
  Scenario: Invalid settings update
    When I send a PUT request to "/api/settings" with invalid data
    Then the API should respond with status code 400
    And the response should contain validation errors
    And my settings should remain unchanged

  @api @settings
  Scenario: Change password via API
    When I send a PUT request to "/api/settings/password" with current and new password
    Then the API should respond with status code 200
    And the response should confirm password change
    And I should be able to authenticate with the new password

  @api @settings
  Scenario: Delete account via API
    When I send a DELETE request to "/api/account"
    Then the API should respond with status code 200
    And the response should confirm account deletion
    And subsequent API calls should return 401 unauthorized

  @ui @settings @mobile
  Scenario: Settings on mobile device
    Given I am using a mobile device
    When I navigate to settings
    Then the settings menu should be touch-friendly
    And all options should be easily accessible
    And the layout should be optimized for mobile

  @ui @settings @accessibility
  Scenario: Settings accessibility
    Given I am using a screen reader
    When I navigate through the settings
    Then all settings should have proper labels
    And all toggles should be announced correctly
    And I should be able to navigate with keyboard only
    And all form fields should have descriptive labels

  @ui @settings @performance
  Scenario: Settings page performance
    When I navigate to the settings page
    Then the page should load within 2 seconds
    And all settings should be loaded progressively
    And the page should remain responsive during updates

  @ui @settings @offline
  Scenario: Settings changes while offline
    Given I am on the settings page
    When I lose internet connectivity
    And I make changes to my settings
    Then the changes should be saved locally
    When connectivity is restored
    Then the changes should sync to the server
    And I should see a confirmation of successful sync

  @ui @settings @premium
  Scenario: Premium settings
    Given I am a premium user
    When I navigate to premium settings
    Then I should see additional privacy options
    And I should see advanced filtering options
    And I should see options to hide ads
    And I should see priority support options

  @ui @settings @data
  Scenario: Data export
    Given I am on the data and privacy page
    When I request to download my data
    Then I should see a confirmation message
    And I should receive an email when the export is ready
    And the export should contain all my profile data
    And the export should contain my match history
    And the export should contain my message history

  @ui @settings @data
  Scenario: Data portability
    Given I am on the data and privacy page
    When I request data portability
    Then I should be able to export my data in standard formats
    And I should receive instructions for importing to other services
    And the export should be completed within 30 days

  @ui @settings @security
  Scenario: Two-factor authentication setup
    Given I am on the security settings page
    When I enable two-factor authentication
    And I scan the QR code with my authenticator app
    And I enter the verification code
    Then 2FA should be enabled on my account
    And I should see backup codes
    And I should need 2FA for future logins

  @ui @settings @security
  Scenario: Login activity monitoring
    Given I am on the security settings page
    When I view my login activity
    Then I should see recent login attempts
    And I should see device information
    And I should see location information
    And I should be able to log out other devices

  @ui @settings @analytics
  Scenario: View account analytics
    Given I am on the analytics page
    When I view my profile statistics
    Then I should see my profile view count
    And I should see my match rate
    And I should see my response rate
    And I should see trends over time

  @ui @settings @subscription
  Scenario: Manage subscription
    Given I have an active subscription
    And I am on the subscription page
    When I view my subscription details
    Then I should see my current plan
    And I should see my next billing date
    And I should see options to upgrade or downgrade
    And I should see options to cancel subscription

  @ui @settings @subscription
  Scenario: Cancel subscription
    Given I have an active subscription
    And I am on the subscription page
    When I click "Cancel Subscription"
    And I confirm the cancellation
    Then my subscription should be cancelled
    And I should retain premium features until the end of the billing period
    And I should receive a cancellation confirmation email