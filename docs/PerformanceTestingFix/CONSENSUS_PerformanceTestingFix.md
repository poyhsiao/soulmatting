# Performance Testing Fix - Consensus Document

**Version:** 1.0.0  
**Created:** 2025-01-14  
**Last Updated:** 2025-01-14  
**Author:** Kim Hsiao

## Table of Contents

1. [Clear Requirement Description](#clear-requirement-description)
2. [Acceptance Criteria](#acceptance-criteria)
3. [Technical Solutions](#technical-solutions)
4. [Integration Plan](#integration-plan)
5. [Task Boundaries](#task-boundaries)
6. [Acceptance Conditions](#acceptance-conditions)

## Clear Requirement Description

### Problem Statement
The GitHub Actions Performance Testing workflow in the SoulMatting project is consistently failing due to multiple configuration and dependency issues. The workflow needs to be fixed to ensure reliable automated performance testing for both frontend and backend components.

### Solution Overview
Implement comprehensive fixes to the performance testing workflow including:
- Standardizing pnpm action setup configurations
- Implementing proper dependency management and caching
- Configuring reliable Docker service orchestration
- Creating missing test configuration files
- Adding required dependencies
- Updating documentation

## Acceptance Criteria

### Functional Requirements
1. **Workflow Execution**
   - [ ] GitHub Actions Performance Testing workflow runs without errors
   - [ ] All jobs (setup, lighthouse, load-test, api-performance, performance-summary) complete successfully
   - [ ] Proper dependency caching and restoration
   - [ ] Reliable service startup and health checks

2. **Test Coverage**
   - [ ] Lighthouse CI tests execute for frontend performance
   - [ ] Artillery load tests run against API endpoints
   - [ ] API-specific performance tests complete
   - [ ] Test results are properly collected and reported

3. **Configuration Management**
   - [ ] Consistent pnpm action setup across all jobs
   - [ ] Proper environment variable configuration
   - [ ] Correct test file paths and references
   - [ ] Required dependencies available

### Non-Functional Requirements
1. **Reliability**
   - Workflow success rate > 95%
   - Proper error handling and timeout mechanisms
   - Robust service health checks

2. **Performance**
   - Workflow completion time < 30 minutes
   - Efficient caching to reduce build times
   - Parallel job execution where possible

3. **Maintainability**
   - Clear configuration structure
   - Comprehensive documentation
   - Reusable test configurations

## Technical Solutions

### 1. pnpm Action Setup Standardization
```yaml
- name: Install pnpm
  uses: pnpm/action-setup@v2
  with:
    version: ${{ env.PNPM_VERSION }}
    run_install: false
```

### 2. Dependency Management
```yaml
- name: Install dependencies
  if: steps.cache.outputs.cache-hit != 'true'
  run: pnpm install --frozen-lockfile
```

### 3. Docker Service Orchestration
```yaml
- name: Start API server
  run: |
    # Start required services
    docker compose up -d postgres redis
    sleep 10
    # Wait for services to be ready
    timeout 60 bash -c 'until docker compose exec postgres pg_isready -U postgres; do sleep 2; done'
    timeout 60 bash -c 'until docker compose exec redis redis-cli ping; do sleep 2; done'
    # Start REST API
    docker compose up -d rest
    sleep 15
    # Wait for API to be ready
    timeout 60 bash -c 'until curl -f http://localhost:3001/; do sleep 2; done'
```

### 4. Test Configuration Files
- **API Test Configuration:** `tests/performance/api-test.yml`
- **Test Processor:** `tests/performance/processor.js`
- **Load Test Configuration:** `tests/performance/load-test.yml` (existing)

### 5. Package Dependencies
```json
{
  "devDependencies": {
    "artillery": "^2.0.20",
    "@faker-js/faker": "^9.4.0"
  }
}
```

## Integration Plan

### Phase 1: Core Fixes
1. Update GitHub Actions workflow configuration
2. Standardize pnpm action setup
3. Implement proper dependency installation
4. Configure Docker service orchestration

### Phase 2: Test Configuration
1. Create API test configuration file
2. Implement test processor functions
3. Update test file path references
4. Add required dependencies

### Phase 3: Documentation
1. Create comprehensive documentation
2. Update existing documentation
3. Provide troubleshooting guides

### Phase 4: Validation
1. Test workflow execution
2. Verify all jobs complete successfully
3. Validate test results
4. Confirm documentation accuracy

## Task Boundaries

### Included Tasks
- GitHub Actions workflow configuration updates
- Docker Compose service configuration
- Test file creation and configuration
- Package dependency management
- Documentation creation and updates

### Excluded Tasks
- Application code modifications
- Database schema changes
- API endpoint modifications
- Frontend component updates
- Infrastructure provisioning

## Acceptance Conditions

### Technical Validation
1. **Workflow Success**
   - All GitHub Actions jobs complete without errors
   - Proper artifact generation and upload
   - Correct environment variable usage

2. **Service Health**
   - PostgreSQL database starts and accepts connections
   - Redis cache service responds to ping
   - REST API service responds to health checks
   - Web application serves content

3. **Test Execution**
   - Lighthouse CI generates performance reports
   - Artillery load tests complete with results
   - API performance tests execute successfully
   - Test artifacts are properly uploaded

### Quality Assurance
1. **Code Quality**
   - Configuration files follow YAML best practices
   - JavaScript code follows project standards
   - Proper error handling and logging

2. **Documentation Quality**
   - Comprehensive coverage of changes
   - Clear troubleshooting instructions
   - Updated version information

3. **Maintainability**
   - Modular configuration structure
   - Reusable components
   - Clear naming conventions

### Final Deliverables
1. Updated `.github/workflows/performance.yml`
2. New `tests/performance/api-test.yml`
3. New `tests/performance/processor.js`
4. Updated `package.json` with dependencies
5. Comprehensive documentation in `docs/PerformanceTestingFix/`
6. Validation of successful workflow execution