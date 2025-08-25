@matching @api @ui
Feature: User Matching
  As a registered user
  I want to find potential matches
  So that I can connect with compatible people

  Background:
    Given the application is running
    And I am a registered user with a complete profile
    And I am logged in

  @smoke
  Scenario: View potential matches
    Given there are other users with compatible profiles
    When I navigate to the matching page
    Then I should see a list of potential matches
    And each match should display basic profile information
    And each match should have action buttons (like, pass, super like)

  @interaction
  Scenario: Like a potential match
    Given I am on the matching page
    And I can see a potential match
    When I click the "like" button
    Then the match should be recorded in the system
    And I should see the next potential match
    And the liked user should be notified if it's a mutual match

  @interaction
  Scenario: Pass on a potential match
    Given I am on the matching page
    And I can see a potential match
    When I click the "pass" button
    Then the match should be recorded as passed
    And I should see the next potential match
    And the passed user should not appear again

  @interaction
  Scenario: Super like a potential match
    Given I am on the matching page
    And I can see a potential match
    And I have super likes available
    When I click the "super like" button
    Then the super like should be recorded in the system
    And I should see the next potential match
    And the super liked user should be notified immediately
    And my super like count should decrease by one

  @mutual
  Scenario: Mutual match notification
    Given I have liked a user
    And that user likes me back
    When the mutual match is detected
    Then both users should receive a match notification
    And a new conversation should be created
    And both users should be able to start messaging

  @filters
  Scenario: Apply matching filters
    Given I am on the matching page
    When I open the filters menu
    And I set age range to "25-35"
    And I set distance to "10 miles"
    And I select interests "hiking, reading"
    And I apply the filters
    Then I should only see matches that meet the criteria
    And the filter settings should be saved for future sessions

  @api
  Scenario: Get potential matches via API
    Given I have a valid authentication token
    When I send a GET request to "/api/matches/potential"
    Then the API should respond with status code 200
    And the response should contain a list of potential matches
    And each match should include user ID, basic profile info, and compatibility score
    And the matches should be ordered by compatibility score

  @api
  Scenario: Record a like via API
    Given I have a valid authentication token
    And I have a target user ID
    When I send a POST request to "/api/matches/like" with the user ID
    Then the API should respond with status code 201
    And the like should be recorded in the database
    And if it's a mutual match, both users should be notified

  @api
  Scenario: Record a pass via API
    Given I have a valid authentication token
    And I have a target user ID
    When I send a POST request to "/api/matches/pass" with the user ID
    Then the API should respond with status code 201
    And the pass should be recorded in the database
    And the user should not appear in future match suggestions

  @validation
  Scenario: Cannot like the same user twice
    Given I have already liked a user
    When I try to like the same user again
    Then I should see an error message "You have already liked this user"
    And no duplicate like should be recorded

  @validation
  Scenario: Cannot like yourself
    Given I am viewing my own profile in the match list
    When I try to like my own profile
    Then I should see an error message "You cannot like yourself"
    And no like should be recorded

  @limits
  Scenario: Daily like limit reached
    Given I have reached my daily like limit
    When I try to like another user
    Then I should see a message about reaching the daily limit
    And I should be prompted to upgrade to premium
    And no like should be recorded

  @premium
  Scenario: Premium user has unlimited likes
    Given I am a premium user
    And I have already used more likes than the free limit
    When I try to like another user
    Then the like should be recorded successfully
    And I should not see any limit warnings

  @algorithm
  Scenario: Compatibility score calculation
    Given there are users with different profile attributes
    When the matching algorithm calculates compatibility
    Then users with similar interests should have higher scores
    And users within preferred age range should have higher scores
    And users within preferred distance should have higher scores
    And the scores should be between 0 and 100

  @privacy
  Scenario: Hidden profiles are not shown in matches
    Given there are users who have hidden their profiles
    When I view potential matches
    Then hidden profiles should not appear in the match list
    And only active, visible profiles should be shown

  @ui @responsive
  Scenario: Matching interface works on mobile
    Given I am using a mobile device
    And I am on the matching page
    When I swipe left on a match card
    Then it should register as a "pass"
    When I swipe right on a match card
    Then it should register as a "like"
    And the swipe gestures should be smooth and responsive

  @accessibility
  Scenario: Matching interface is accessible
    Given I am using a screen reader
    And I am on the matching page
    Then each match card should have proper ARIA labels
    And action buttons should be keyboard accessible
    And match information should be announced clearly
    And navigation should follow logical tab order