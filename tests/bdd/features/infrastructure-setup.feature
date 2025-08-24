Feature: Project Setup & Infrastructure (Task 1.1)
  As a DevOps Engineer
  I want to set up the project infrastructure and development environment
  So that the development team can work efficiently and deploy reliably

  Background:
    Given I have access to the SoulMatting project repository
    And I have Docker and Docker Compose installed
    And I have Node.js 22+ and pnpm installed

  @infrastructure @setup @high-priority
  Scenario: Project repository structure is properly organized
    Given I am in the project root directory
    When I examine the project structure
    Then I should see the following directories:
      | Directory | Purpose |
      | apps/     | Frontend applications |
      | services/ | Backend microservices |
      | packages/ | Shared packages |
      | tools/    | Development tools |
      | docs/     | Documentation |
      | tests/    | Test suites |
    And each directory should contain appropriate configuration files
    And the monorepo structure should follow best practices

  @docker @containerization
  Scenario: Docker configuration is properly set up
    Given I have Docker installed
    When I examine the Docker configuration files
    Then I should see a "Dockerfile" in each service directory
    And I should see a "docker-compose.yml" file in the root
    And I should see a "docker-compose.dev.yml" file for development
    And each Dockerfile should follow security best practices
    And the Docker images should be optimized for size and performance

  @docker-compose @local-development
  Scenario: Docker Compose enables local development environment
    Given I have the Docker Compose configuration
    When I run "docker-compose -f docker-compose.dev.yml up"
    Then all required services should start successfully:
      | Service | Port | Health Check |
      | PostgreSQL | 5432 | Connection successful |
      | Redis | 6379 | Ping successful |
      | MinIO | 9000 | API accessible |
      | API Gateway | 3000 | Health endpoint returns 200 |
    And the services should be able to communicate with each other
    And the development environment should be ready for coding

  @cicd @github-actions
  Scenario: CI/CD pipeline is configured with GitHub Actions
    Given I have access to the GitHub repository
    When I examine the ".github/workflows" directory
    Then I should see the following workflow files:
      | Workflow | Purpose |
      | ci.yml | Continuous Integration |
      | cd.yml | Continuous Deployment |
      | security.yml | Security scanning |
      | quality.yml | Code quality checks |
    And each workflow should have proper triggers
    And the workflows should include automated testing
    And security scanning should be integrated

  @environment @configuration
  Scenario: Environment configuration files are properly set up
    Given I am setting up the development environment
    When I examine the environment configuration
    Then I should see the following configuration files:
      | File | Environment | Purpose |
      | .env.example | Template | Environment variables template |
      | .env.development | Development | Local development settings |
      | .env.staging | Staging | Staging environment settings |
      | .env.production | Production | Production environment settings |
    And each configuration should have appropriate security settings
    And sensitive information should not be committed to version control
    And environment-specific variables should be properly documented

  @secrets @security
  Scenario: Secret management is properly configured
    Given I am configuring the application secrets
    When I set up the secret management system
    Then JWT secrets should be properly generated and stored
    And database credentials should be securely managed
    And API keys should be environment-specific
    And no secrets should be hardcoded in the source code
    And secret rotation procedures should be documented

  @testing @automation
  Scenario: Automated testing is integrated in CI pipeline
    Given I have the CI/CD pipeline configured
    When I push code to the repository
    Then the following tests should run automatically:
      | Test Type | Coverage |
      | Unit Tests | > 80% |
      | Integration Tests | Critical paths |
      | E2E Tests | User workflows |
      | Security Tests | OWASP compliance |
    And test results should be reported
    And failed tests should block deployment
    And test coverage reports should be generated

  @monitoring @health-checks
  Scenario: Health monitoring and logging are configured
    Given I have the infrastructure running
    When I check the monitoring setup
    Then each service should have health check endpoints
    And logs should be centralized and structured
    And metrics should be collected for performance monitoring
    And alerts should be configured for critical issues
    And monitoring dashboards should be accessible

  @documentation @setup-instructions
  Scenario: Setup documentation is comprehensive and accurate
    Given I am a new developer joining the team
    When I follow the setup instructions in README.md
    Then I should be able to set up the development environment
    And all prerequisites should be clearly documented
    And step-by-step instructions should be provided
    And troubleshooting guides should be available
    And the documentation should be kept up-to-date

  @performance @optimization
  Scenario: Development environment is optimized for performance
    Given I have the development environment running
    When I measure the startup time and resource usage
    Then Docker containers should start within reasonable time
    And memory usage should be optimized
    And hot reload should work efficiently
    And build times should be minimized
    And the development experience should be smooth

  @backup @disaster-recovery
  Scenario: Backup and disaster recovery procedures are documented
    Given I am setting up the production environment
    When I review the disaster recovery plan
    Then database backup procedures should be automated
    And backup restoration should be tested
    And disaster recovery procedures should be documented
    And Recovery Time Objective (RTO) should be defined
    And Recovery Point Objective (RPO) should be specified