@messaging @api @ui
Feature: Messaging and Chat
  As a matched user
  I want to communicate with my matches
  So that I can get to know them better and build connections

  Background:
    Given the application is running
    And I am a registered user with a complete profile
    And I am logged in
    And I have mutual matches

  @smoke
  Scenario: View conversations list
    Given I have active conversations
    When I navigate to the messages page
    Then I should see a list of my conversations
    And each conversation should show the match's name and photo
    And each conversation should show the last message preview
    And each conversation should show the timestamp of the last message

  @interaction
  Scenario: Start a new conversation
    Given I have a new mutual match
    And I am on the messages page
    When I click on the new match conversation
    Then I should be taken to the chat interface
    And I should see a welcome message or ice breaker suggestions
    And I should be able to type a message

  @interaction
  Scenario: Send a text message
    Given I am in an active conversation
    When I type "Hello! How are you doing today?" in the message input
    And I click the send button
    Then the message should appear in the chat
    And the message should be marked as sent
    And the other user should receive the message
    And the conversation list should update with the new message

  @interaction
  Scenario: Receive a message
    Given I am in an active conversation
    And the other user sends me a message
    When the message is delivered
    Then I should see the new message in the chat
    And I should receive a notification
    And the message should be marked as delivered
    And the conversation should move to the top of my list

  @interaction
  Scenario: Send an emoji
    Given I am in an active conversation
    When I click the emoji button
    And I select a heart emoji
    Then the emoji should be sent as a message
    And it should appear in the chat
    And the other user should receive the emoji

  @interaction
  Scenario: Send a photo
    Given I am in an active conversation
    When I click the photo attachment button
    And I select a photo from my device
    Then the photo should be uploaded
    And it should appear in the chat as an image message
    And the other user should receive the photo
    And the photo should be properly sized and displayed

  @interaction
  Scenario: Send a GIF
    Given I am in an active conversation
    When I click the GIF button
    And I search for "happy" GIFs
    And I select a GIF from the results
    Then the GIF should be sent as a message
    And it should appear in the chat
    And the GIF should be animated
    And the other user should receive the GIF

  @realtime
  Scenario: Real-time message delivery
    Given I am in an active conversation
    And the other user is also online
    When the other user types a message
    Then I should see a "typing" indicator
    When the other user sends the message
    Then I should receive the message immediately
    And the typing indicator should disappear

  @status
  Scenario: Message read receipts
    Given I am in an active conversation
    And I have sent a message
    When the other user opens the conversation
    And reads my message
    Then my message should be marked as "read"
    And I should see a read receipt indicator

  @status
  Scenario: Online status indicators
    Given I am on the messages page
    When I view my conversation list
    Then I should see online status indicators for my matches
    And online users should be marked with a green dot
    And recently active users should show "last seen" time
    And offline users should not show any status indicator

  @search
  Scenario: Search conversations
    Given I have multiple conversations
    And I am on the messages page
    When I use the search function
    And I search for a match's name
    Then the conversation list should filter to show matching results
    And I should be able to quickly find the conversation I'm looking for

  @search
  Scenario: Search within a conversation
    Given I am in an active conversation with message history
    When I open the search function within the chat
    And I search for a specific word or phrase
    Then the chat should highlight matching messages
    And I should be able to navigate between search results

  @moderation
  Scenario: Report inappropriate message
    Given I am in an active conversation
    And I receive an inappropriate message
    When I long-press on the message
    And I select "Report" from the context menu
    And I choose a reason for reporting
    And I submit the report
    Then the message should be reported to moderators
    And I should see a confirmation that the report was submitted
    And I should have the option to block the user

  @moderation
  Scenario: Block a user
    Given I am in an active conversation
    When I access the conversation settings
    And I select "Block User"
    And I confirm the blocking action
    Then the user should be blocked
    And I should no longer receive messages from them
    And the conversation should be hidden from my list
    And the blocked user should not be able to see my profile

  @api
  Scenario: Get conversations via API
    Given I have a valid authentication token
    When I send a GET request to "/api/conversations"
    Then the API should respond with status code 200
    And the response should contain a list of my conversations
    And each conversation should include participant info and last message
    And conversations should be ordered by last message timestamp

  @api
  Scenario: Send message via API
    Given I have a valid authentication token
    And I have an active conversation ID
    When I send a POST request to "/api/conversations/{conversationId}/messages" with message content
    Then the API should respond with status code 201
    And the message should be saved in the database
    And the other participant should be notified
    And the response should include the message ID and timestamp

  @api
  Scenario: Get conversation messages via API
    Given I have a valid authentication token
    And I have an active conversation ID
    When I send a GET request to "/api/conversations/{conversationId}/messages"
    Then the API should respond with status code 200
    And the response should contain the conversation messages
    And messages should be ordered by timestamp
    And the response should support pagination

  @validation
  Scenario: Cannot send empty message
    Given I am in an active conversation
    When I try to send an empty message
    Then the send button should be disabled
    And no message should be sent
    And I should not see any error message

  @validation
  Scenario: Message length limit
    Given I am in an active conversation
    When I type a message longer than the character limit
    Then I should see a character count indicator
    And the send button should be disabled when over the limit
    And I should see a warning about the character limit

  @validation
  Scenario: Cannot message unmatched users
    Given I have a user ID of someone I haven't matched with
    When I try to send them a message via API
    Then the API should respond with status code 403
    And I should receive an error message "Cannot message unmatched users"
    And no message should be sent

  @notifications
  Scenario: Push notification for new message
    Given I have the app in the background
    And I receive a new message
    When the message is delivered
    Then I should receive a push notification
    And the notification should show the sender's name
    And the notification should show a preview of the message
    And tapping the notification should open the conversation

  @notifications
  Scenario: In-app notification for new message
    Given I am using the app but not in the conversation
    And I receive a new message
    When the message is delivered
    Then I should see an in-app notification
    And the notification should be non-intrusive
    And I should be able to quick-reply from the notification

  @ui @responsive
  Scenario: Chat interface works on mobile
    Given I am using a mobile device
    And I am in an active conversation
    Then the chat interface should be optimized for mobile
    And the message input should expand as I type
    And the keyboard should not cover the message input
    And I should be able to scroll through message history smoothly
    And touch targets should be appropriately sized

  @accessibility
  Scenario: Chat interface is accessible
    Given I am using a screen reader
    And I am in an active conversation
    Then each message should have proper ARIA labels
    And message timestamps should be announced
    And the message input should have a clear label
    And send button should be keyboard accessible
    And I should be able to navigate messages with keyboard shortcuts

  @performance
  Scenario: Large conversation history loads efficiently
    Given I have a conversation with over 1000 messages
    When I open the conversation
    Then the recent messages should load quickly
    And older messages should load as I scroll up
    And the interface should remain responsive
    And memory usage should be optimized

  @offline
  Scenario: Offline message handling
    Given I am in an active conversation
    And I lose internet connectivity
    When I type and send a message
    Then the message should be queued for sending
    And I should see a "pending" indicator
    When connectivity is restored
    Then the queued message should be sent automatically
    And the status should update to "sent"

  @privacy
  Scenario: Message encryption
    Given I am in an active conversation
    When I send a message
    Then the message should be encrypted in transit
    And the message should be encrypted at rest
    And only the intended recipient should be able to decrypt it
    And message content should not be readable in database logs

  @premium
  Scenario: Premium user features
    Given I am a premium user
    And I am in an active conversation
    Then I should be able to see read receipts
    And I should be able to send unlimited messages
    And I should have access to advanced emoji reactions
    And I should be able to send voice messages
    And I should have priority message delivery