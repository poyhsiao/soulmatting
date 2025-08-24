Feature: Security and Privacy Protection
  As a user of the dating app
  I want my data and privacy to be protected
  So that I can use the app safely and securely

  Background:
    Given I am a registered user
    And I am logged into the app

  @security @authentication
  Scenario: Secure login with valid credentials
    Given I am on the login page
    When I enter valid credentials
    And I click "Login"
    Then I should be logged in successfully
    And I should see my dashboard
    And my session should be secure

  @security @authentication
  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I enter invalid credentials
    And I click "Login"
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page
    And no session should be created

  @security @authentication
  Scenario: Account lockout after multiple failed attempts
    Given I am on the login page
    When I enter invalid credentials 5 times
    Then my account should be temporarily locked
    And I should see a lockout message
    And I should not be able to login for 15 minutes

  @security @authentication
  Scenario: Two-factor authentication
    Given I have 2FA enabled on my account
    And I am on the login page
    When I enter valid credentials
    And I click "Login"
    Then I should be prompted for 2FA code
    When I enter the correct 2FA code
    Then I should be logged in successfully

  @security @authentication
  Scenario: Invalid 2FA code
    Given I have 2FA enabled on my account
    And I am on the 2FA verification page
    When I enter an invalid 2FA code
    Then I should see an error message "Invalid verification code"
    And I should remain on the 2FA page
    And I should not be logged in

  @security @session
  Scenario: Session timeout
    Given I am logged in
    When I remain inactive for 30 minutes
    Then my session should expire
    And I should be redirected to the login page
    And I should see a session timeout message

  @security @session
  Scenario: Secure logout
    Given I am logged in
    When I click "Logout"
    Then I should be logged out
    And my session should be invalidated
    And I should be redirected to the login page
    And I should not be able to access protected pages

  @security @session
  Scenario: Multiple device sessions
    Given I am logged in on device A
    When I login on device B
    Then I should be logged in on both devices
    When I logout from device A
    Then I should remain logged in on device B
    And device A session should be invalidated

  @privacy @profile
  Scenario: Profile visibility controls
    Given I am on my profile settings
    When I set my profile visibility to "Private"
    And I save the settings
    Then my profile should not be visible to other users
    And I should not appear in discovery
    And only matched users should see my profile

  @privacy @profile
  Scenario: Hide specific profile information
    Given I am on my privacy settings
    When I choose to hide my age
    And I choose to hide my last seen
    And I save the settings
    Then other users should not see my age
    And other users should not see when I was last online
    And my other profile information should remain visible

  @privacy @location
  Scenario: Location privacy
    Given I am on my privacy settings
    When I disable location sharing
    And I save the settings
    Then my exact location should not be shared
    And other users should not see my distance
    And location-based matching should be disabled

  @privacy @location
  Scenario: Approximate location sharing
    Given I am on my privacy settings
    When I enable "Show approximate location only"
    And I save the settings
    Then other users should see my city but not exact location
    And distance should be shown as approximate ranges
    And my precise coordinates should remain private

  @privacy @blocking
  Scenario: Block a user
    Given I am viewing another user's profile
    When I click "Block User"
    And I confirm the blocking action
    Then the user should be added to my blocked list
    And they should not be able to see my profile
    And they should not be able to message me
    And I should not see them in discovery

  @privacy @blocking
  Scenario: Report inappropriate behavior
    Given I am viewing another user's profile
    When I click "Report User"
    And I select "Inappropriate photos" as the reason
    And I provide additional details
    And I submit the report
    Then the report should be submitted successfully
    And the user should be automatically blocked
    And I should receive a confirmation message

  @privacy @messaging
  Scenario: Message encryption
    Given I have a conversation with another user
    When I send a message "Hello, how are you?"
    Then the message should be encrypted in transit
    And the message should be encrypted at rest
    And only the recipient and I should be able to read it

  @privacy @messaging
  Scenario: Message deletion
    Given I have sent messages in a conversation
    When I delete a message
    Then the message should be removed from my view
    And the message should be marked as deleted in the database
    And the recipient should see "Message deleted" placeholder

  @privacy @data
  Scenario: Data export request
    Given I am on the data privacy page
    When I request to export my data
    Then I should receive a confirmation email
    And my data export should be prepared within 30 days
    And I should receive a download link when ready
    And the export should include all my personal data

  @privacy @data
  Scenario: Account deletion and data removal
    Given I am on the account deletion page
    When I request to delete my account
    And I confirm the deletion
    Then my account should be scheduled for deletion
    And my profile should be immediately hidden
    And my data should be permanently deleted within 30 days
    And I should receive deletion confirmation

  @security @api
  Scenario: API authentication
    When I make an API request without authentication
    Then the API should respond with status code 401
    And the response should contain "Authentication required"

  @security @api
  Scenario: API rate limiting
    Given I am authenticated
    When I make 100 API requests within 1 minute
    Then subsequent requests should be rate limited
    And I should receive status code 429
    And the response should contain rate limit information

  @security @api
  Scenario: SQL injection protection
    When I send a malicious SQL payload in a request
    Then the API should sanitize the input
    And no SQL injection should occur
    And the request should be processed safely

  @security @api
  Scenario: XSS protection
    When I submit content with malicious scripts
    Then the scripts should be sanitized
    And no XSS attack should be possible
    And the content should be safely displayed

  @security @password
  Scenario: Password strength validation
    Given I am creating a new account
    When I enter a weak password "123"
    Then I should see password strength requirements
    And I should not be able to proceed
    And the password should be rejected

  @security @password
  Scenario: Password hashing
    Given I create an account with password "SecurePass123!"
    When I check the database
    Then my password should be hashed
    And the plain text password should not be stored
    And the hash should use a secure algorithm

  @security @password
  Scenario: Password reset security
    Given I request a password reset
    When I receive the reset email
    Then the reset link should expire after 1 hour
    And the reset token should be single-use
    And the token should be cryptographically secure

  @privacy @cookies
  Scenario: Cookie consent
    Given I am a new visitor to the site
    When I first visit the application
    Then I should see a cookie consent banner
    And I should be able to accept or decline cookies
    And my choice should be respected

  @privacy @cookies
  Scenario: Essential cookies only
    Given I am on the cookie consent banner
    When I choose "Essential cookies only"
    Then only necessary cookies should be set
    And tracking cookies should not be used
    And analytics should be disabled

  @privacy @tracking
  Scenario: Opt-out of analytics
    Given I am on the privacy settings page
    When I disable analytics tracking
    And I save the settings
    Then my usage should not be tracked
    And no analytics data should be collected
    And I should not appear in usage statistics

  @security @headers
  Scenario: Security headers
    When I make a request to the application
    Then the response should include security headers
    And Content-Security-Policy should be set
    And X-Frame-Options should prevent clickjacking
    And X-Content-Type-Options should prevent MIME sniffing

  @security @https
  Scenario: HTTPS enforcement
    When I try to access the site via HTTP
    Then I should be redirected to HTTPS
    And all subsequent requests should use HTTPS
    And no sensitive data should be transmitted over HTTP

  @privacy @gdpr
  Scenario: GDPR compliance - Right to access
    Given I am an EU user
    When I request access to my personal data
    Then I should receive all data held about me
    And the data should be in a readable format
    And I should receive it within 30 days

  @privacy @gdpr
  Scenario: GDPR compliance - Right to rectification
    Given I am an EU user
    When I request correction of incorrect data
    Then the data should be corrected promptly
    And I should be notified of the correction
    And third parties should be informed if applicable

  @privacy @gdpr
  Scenario: GDPR compliance - Right to erasure
    Given I am an EU user
    When I request deletion of my data
    Then my data should be deleted without undue delay
    And I should receive confirmation of deletion
    And third parties should be notified if applicable

  @privacy @minors
  Scenario: Age verification
    Given I am registering for an account
    When I enter an age under 18
    Then my registration should be rejected
    And I should see an age requirement message
    And no account should be created

  @privacy @minors
  Scenario: Additional protection for young adults
    Given I am 18-21 years old
    When I use the app
    Then I should have additional privacy protections
    And my profile should have restricted visibility
    And I should receive safety tips

  @security @audit
  Scenario: Security audit logging
    Given I perform sensitive actions
    When I change my password
    And I update privacy settings
    And I delete my account
    Then all actions should be logged
    And logs should include timestamps
    And logs should include IP addresses
    And logs should be tamper-proof

  @security @backup
  Scenario: Data backup security
    Given the system performs regular backups
    When backups are created
    Then backup data should be encrypted
    And backups should be stored securely
    And access to backups should be restricted
    And backup integrity should be verified

  @security @incident
  Scenario: Security incident response
    Given a security incident occurs
    When the incident is detected
    Then affected users should be notified
    And appropriate security measures should be taken
    And the incident should be logged and investigated
    And users should receive guidance on protective actions

  @privacy @transparency
  Scenario: Privacy policy accessibility
    Given I want to understand data usage
    When I access the privacy policy
    Then it should be written in clear language
    And it should explain what data is collected
    And it should explain how data is used
    And it should explain data sharing practices

  @privacy @consent
  Scenario: Granular consent management
    Given I am on the consent management page
    When I view my consent options
    Then I should see separate options for different data uses
    And I should be able to consent to some but not all uses
    And I should be able to withdraw consent at any time
    And my choices should be respected immediately

  @security @mobile
  Scenario: Mobile app security
    Given I am using the mobile app
    When I store sensitive data
    Then data should be encrypted on the device
    And the app should use secure storage
    And biometric authentication should be available
    And the app should detect jailbroken/rooted devices

  @security @network
  Scenario: Network security
    Given I am using the app on public WiFi
    When I transmit data
    Then all communications should be encrypted
    And certificate pinning should be used
    And man-in-the-middle attacks should be prevented

  @privacy @analytics
  Scenario: Privacy-preserving analytics
    Given analytics are enabled
    When usage data is collected
    Then personal identifiers should be removed
    And data should be aggregated
    And individual users should not be identifiable
    And data retention should be limited

  @security @vulnerability
  Scenario: Vulnerability disclosure
    Given a security researcher finds a vulnerability
    When they report it through proper channels
    Then the report should be acknowledged promptly
    And the vulnerability should be investigated
    And a fix should be developed and deployed
    And the researcher should be credited appropriately