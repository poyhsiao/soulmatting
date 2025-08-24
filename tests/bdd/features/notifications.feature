Feature: Notifications
  As a user of the dating app
  I want to receive notifications about important events
  So that I can stay engaged and respond to matches and messages promptly

  Background:
    Given the application is running
    And I am a registered user
    And I am logged in

  @notifications @push
  Scenario: Receive push notification for new match
    Given I have enabled push notifications
    And I have a new mutual match
    When the match is created
    Then I should receive a push notification
    And the notification should contain the match information
    And the notification should have a deep link to the match

  @notifications @push
  Scenario: Receive push notification for new message
    Given I have enabled push notifications
    And I have an active conversation
    When I receive a new message
    Then I should receive a push notification
    And the notification should contain the message preview
    And the notification should have a deep link to the conversation

  @notifications @in-app
  Scenario: View in-app notifications
    Given I have unread notifications
    When I open the notifications panel
    Then I should see a list of my notifications
    And each notification should show the type and timestamp
    And unread notifications should be highlighted

  @notifications @in-app
  Scenario: Mark notifications as read
    Given I have unread notifications
    When I click on a notification
    Then the notification should be marked as read
    And the notification count should decrease
    And I should be navigated to the relevant content

  @notifications @in-app
  Scenario: Clear all notifications
    Given I have multiple notifications
    When I click the "Clear All" button
    And I confirm the action
    Then all notifications should be removed
    And the notification count should be zero

  @notifications @email
  Scenario: Receive email notification for new match
    Given I have enabled email notifications
    And I have a new mutual match
    When the match is created
    Then I should receive an email notification
    And the email should contain match details
    And the email should have a link to view the match

  @notifications @email
  Scenario: Receive weekly digest email
    Given I have enabled weekly digest emails
    And it's time for the weekly digest
    When the digest is generated
    Then I should receive a digest email
    And the email should contain my activity summary
    And the email should contain new matches and messages

  @notifications @settings
  Scenario: Manage notification preferences
    Given I am on the notification settings page
    When I toggle push notifications off
    And I save the settings
    Then push notifications should be disabled
    And I should not receive push notifications

  @notifications @settings
  Scenario: Customize notification types
    Given I am on the notification settings page
    When I enable notifications for matches only
    And I disable notifications for messages
    And I save the settings
    Then I should only receive match notifications
    And I should not receive message notifications

  @notifications @settings
  Scenario: Set quiet hours
    Given I am on the notification settings page
    When I set quiet hours from 10 PM to 8 AM
    And I save the settings
    Then I should not receive notifications during quiet hours
    And notifications should resume after quiet hours

  @notifications @real-time
  Scenario: Real-time notification delivery
    Given I have the app open
    And I have enabled real-time notifications
    When I receive a new message
    Then I should see an in-app notification immediately
    And the notification should appear without page refresh

  @notifications @real-time
  Scenario: Notification badge updates
    Given I have unread notifications
    When I view the app
    Then I should see a notification badge with the count
    When I read a notification
    Then the badge count should update immediately

  @notifications @api
  Scenario: Get notifications via API
    When I send a GET request to "/api/notifications"
    Then the API should respond with status code 200
    And the response should contain my notifications
    And each notification should have id, type, message, timestamp, and read status

  @notifications @api
  Scenario: Mark notification as read via API
    Given I have an unread notification with ID "123"
    When I send a PUT request to "/api/notifications/123/read"
    Then the API should respond with status code 200
    And the notification should be marked as read
    And subsequent API calls should show the notification as read

  @notifications @api
  Scenario: Delete notification via API
    Given I have a notification with ID "456"
    When I send a DELETE request to "/api/notifications/456"
    Then the API should respond with status code 204
    And the notification should be removed
    And subsequent API calls should not include the notification

  @notifications @api
  Scenario: Update notification preferences via API
    When I send a PUT request to "/api/notifications/preferences" with updated settings
    Then the API should respond with status code 200
    And the response should contain the updated preferences
    And my notification behavior should change accordingly

  @notifications @validation
  Scenario: Handle invalid notification preferences
    When I send a PUT request to "/api/notifications/preferences" with invalid data
    Then the API should respond with status code 400
    And the response should contain validation errors
    And my notification preferences should remain unchanged

  @notifications @validation
  Scenario: Handle non-existent notification
    When I send a GET request to "/api/notifications/999999"
    Then the API should respond with status code 404
    And the response should contain an error message

  @notifications @types
  Scenario: Different notification types
    Given I have various types of notifications
    When I view my notifications
    Then I should see match notifications with heart icons
    And I should see message notifications with chat icons
    And I should see like notifications with thumbs up icons
    And I should see system notifications with info icons

  @notifications @priority
  Scenario: High priority notifications
    Given I receive a super like notification
    When the notification is delivered
    Then it should be marked as high priority
    And it should appear at the top of the notification list
    And it should have a distinct visual indicator

  @notifications @grouping
  Scenario: Group similar notifications
    Given I receive multiple like notifications
    When I view my notifications
    Then similar notifications should be grouped together
    And I should see a summary like "3 people liked your profile"
    And I should be able to expand to see individual notifications

  @notifications @sound
  Scenario: Notification sounds
    Given I have enabled notification sounds
    And I receive a new match notification
    Then I should hear the match notification sound
    When I receive a message notification
    Then I should hear the message notification sound

  @notifications @vibration
  Scenario: Notification vibration on mobile
    Given I am using a mobile device
    And I have enabled vibration for notifications
    When I receive a notification
    Then the device should vibrate
    And the vibration pattern should match the notification type

  @notifications @do-not-disturb
  Scenario: Do not disturb mode
    Given I have enabled do not disturb mode
    When I receive notifications
    Then I should not receive push notifications
    But I should still see in-app notifications when I open the app
    And notifications should be queued for later delivery

  @notifications @mobile @responsive
  Scenario: Notifications on mobile devices
    Given I am using a mobile device
    When I receive notifications
    Then the notification panel should be touch-friendly
    And notifications should be easy to swipe and dismiss
    And the notification layout should be optimized for mobile

  @notifications @accessibility
  Scenario: Notification accessibility
    When I view notifications
    Then all notifications should have proper ARIA labels
    And notifications should be announced by screen readers
    And I should be able to navigate notifications with keyboard
    And notification actions should be accessible

  @notifications @performance
  Scenario: Notification performance
    Given I have many notifications
    When I open the notifications panel
    Then the notifications should load within 2 seconds
    And scrolling through notifications should be smooth
    And the app should remain responsive

  @notifications @offline
  Scenario: Offline notification handling
    Given I lose internet connectivity
    And I receive notifications while offline
    When connectivity is restored
    Then I should receive all missed notifications
    And notifications should be delivered in the correct order

  @notifications @privacy
  Scenario: Notification privacy
    Given I have enabled privacy mode
    When I receive a message notification
    Then the notification should not show the message content
    And the notification should only show "New message"
    And I should need to open the app to see the content

  @notifications @batch
  Scenario: Batch notification delivery
    Given I have multiple pending notifications
    When the batch delivery time arrives
    Then I should receive notifications in a single batch
    And the notifications should be ordered by priority
    And I should not be overwhelmed with individual notifications

  @notifications @unsubscribe
  Scenario: Unsubscribe from email notifications
    Given I receive an email notification
    When I click the unsubscribe link
    Then I should be taken to the unsubscribe page
    And I should be able to choose which emails to unsubscribe from
    And my preferences should be updated immediately

  @notifications @analytics
  Scenario: Notification analytics
    Given I am an admin user
    When I view notification analytics
    Then I should see delivery rates for different notification types
    And I should see user engagement with notifications
    And I should see notification performance metrics