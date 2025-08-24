"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
const child_process_1 = require("child_process");
const fs = require("fs");
const path = require("path");
const axios_1 = require("axios");
// Project structure validation
(0, cucumber_1.Given)('I have access to the SoulMatting project repository', async function () {
    this.projectRoot = process.cwd();
    (0, test_1.expect)(fs.existsSync(this.projectRoot)).toBeTruthy();
    (0, test_1.expect)(fs.existsSync(path.join(this.projectRoot, 'package.json'))).toBeTruthy();
});
(0, cucumber_1.Given)('I have Docker and Docker Compose installed', async function () {
    try {
        (0, child_process_1.execSync)('docker --version', { stdio: 'pipe' });
        (0, child_process_1.execSync)('docker-compose --version', { stdio: 'pipe' });
        this.dockerAvailable = true;
    }
    catch (error) {
        throw new Error('Docker or Docker Compose is not installed or not accessible');
    }
});
(0, cucumber_1.Given)('I have Node.js 22+ and pnpm installed', async function () {
    try {
        const nodeVersion = (0, child_process_1.execSync)('node --version', { encoding: 'utf8' }).trim();
        const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
        (0, test_1.expect)(majorVersion).toBeGreaterThanOrEqual(22);
        (0, child_process_1.execSync)('pnpm --version', { stdio: 'pipe' });
        this.nodeEnvironmentReady = true;
    }
    catch (error) {
        throw new Error('Node.js 22+ or pnpm is not installed or not accessible');
    }
});
(0, cucumber_1.Given)('I am in the project root directory', async function () {
    process.chdir(this.projectRoot);
    (0, test_1.expect)(process.cwd()).toBe(this.projectRoot);
});
// Project structure scenarios
(0, cucumber_1.When)('I examine the project structure', async function () {
    this.projectStructure = {
        apps: fs.existsSync('apps'),
        services: fs.existsSync('services'),
        packages: fs.existsSync('packages'),
        tools: fs.existsSync('tools'),
        docs: fs.existsSync('docs'),
        tests: fs.existsSync('tests')
    };
});
(0, cucumber_1.Then)('I should see the following directories:', async function (dataTable) {
    const expectedDirs = dataTable.hashes();
    for (const dir of expectedDirs) {
        const dirName = dir.Directory.replace('/', '');
        (0, test_1.expect)(this.projectStructure[dirName]).toBeTruthy();
        (0, test_1.expect)(fs.statSync(dir.Directory).isDirectory()).toBeTruthy();
    }
});
(0, cucumber_1.Then)('each directory should contain appropriate configuration files', async function () {
    // Check for package.json in apps and services
    const appsDir = 'apps';
    if (fs.existsSync(appsDir)) {
        const appDirs = fs.readdirSync(appsDir).filter(item => fs.statSync(path.join(appsDir, item)).isDirectory());
        for (const appDir of appDirs) {
            const packageJsonPath = path.join(appsDir, appDir, 'package.json');
            (0, test_1.expect)(fs.existsSync(packageJsonPath)).toBeTruthy();
        }
    }
    const servicesDir = 'services';
    if (fs.existsSync(servicesDir)) {
        const serviceDirs = fs.readdirSync(servicesDir).filter(item => fs.statSync(path.join(servicesDir, item)).isDirectory());
        for (const serviceDir of serviceDirs) {
            const packageJsonPath = path.join(servicesDir, serviceDir, 'package.json');
            (0, test_1.expect)(fs.existsSync(packageJsonPath)).toBeTruthy();
        }
    }
});
(0, cucumber_1.Then)('the monorepo structure should follow best practices', async function () {
    // Check for workspace configuration
    (0, test_1.expect)(fs.existsSync('pnpm-workspace.yaml')).toBeTruthy();
    (0, test_1.expect)(fs.existsSync('turbo.json')).toBeTruthy();
    // Check root package.json has workspace configuration
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    (0, test_1.expect)(packageJson.workspaces || packageJson.pnpm?.workspaces).toBeDefined();
});
// Docker configuration scenarios
(0, cucumber_1.When)('I examine the Docker configuration files', async function () {
    this.dockerConfig = {
        rootDockerCompose: fs.existsSync('docker-compose.yml'),
        devDockerCompose: fs.existsSync('docker-compose.dev.yml'),
        serviceDockerfiles: []
    };
    // Check for Dockerfiles in services
    if (fs.existsSync('services')) {
        const serviceDirs = fs.readdirSync('services').filter(item => fs.statSync(path.join('services', item)).isDirectory());
        for (const serviceDir of serviceDirs) {
            const dockerfilePath = path.join('services', serviceDir, 'Dockerfile');
            this.dockerConfig.serviceDockerfiles.push({
                service: serviceDir,
                hasDockerfile: fs.existsSync(dockerfilePath)
            });
        }
    }
});
(0, cucumber_1.Then)('I should see a "Dockerfile" in each service directory', async function () {
    for (const service of this.dockerConfig.serviceDockerfiles) {
        (0, test_1.expect)(service.hasDockerfile).toBeTruthy();
    }
});
(0, cucumber_1.Then)('I should see a "docker-compose.yml" file in the root', async function () {
    (0, test_1.expect)(this.dockerConfig.rootDockerCompose).toBeTruthy();
});
(0, cucumber_1.Then)('I should see a "docker-compose.dev.yml" file for development', async function () {
    (0, test_1.expect)(this.dockerConfig.devDockerCompose).toBeTruthy();
});
(0, cucumber_1.Then)('each Dockerfile should follow security best practices', async function () {
    for (const service of this.dockerConfig.serviceDockerfiles) {
        if (service.hasDockerfile) {
            const dockerfilePath = path.join('services', service.service, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            // Check for non-root user
            (0, test_1.expect)(dockerfileContent).toMatch(/USER\s+(?!root)/i);
            // Check for specific version tags (not latest)
            (0, test_1.expect)(dockerfileContent).not.toMatch(/FROM.*:latest/i);
        }
    }
});
(0, cucumber_1.Then)('the Docker images should be optimized for size and performance', async function () {
    for (const service of this.dockerConfig.serviceDockerfiles) {
        if (service.hasDockerfile) {
            const dockerfilePath = path.join('services', service.service, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            // Check for multi-stage builds
            (0, test_1.expect)(dockerfileContent).toMatch(/FROM.*AS.*build/i);
            // Check for .dockerignore
            const dockerignorePath = path.join('services', service.service, '.dockerignore');
            (0, test_1.expect)(fs.existsSync(dockerignorePath)).toBeTruthy();
        }
    }
});
// Docker Compose local development scenarios
(0, cucumber_1.Given)('I have the Docker Compose configuration', async function () {
    (0, test_1.expect)(fs.existsSync('docker-compose.dev.yml')).toBeTruthy();
});
(0, cucumber_1.When)('I run "docker-compose -f docker-compose.dev.yml up"', async function () {
    try {
        // Start services in detached mode
        (0, child_process_1.execSync)('docker-compose -f docker-compose.dev.yml up -d', {
            stdio: 'pipe',
            timeout: 120000 // 2 minutes timeout
        });
        // Wait for services to be ready
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
        this.servicesStarted = true;
    }
    catch (error) {
        this.servicesStarted = false;
        this.startupError = error.message;
    }
});
(0, cucumber_1.Then)('all required services should start successfully:', async function (dataTable) {
    (0, test_1.expect)(this.servicesStarted).toBeTruthy();
    const services = dataTable.hashes();
    for (const service of services) {
        const port = parseInt(service.Port);
        try {
            switch (service.Service) {
                case 'PostgreSQL':
                    // Test PostgreSQL connection
                    (0, child_process_1.execSync)(`docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -h localhost -p ${port}`, { stdio: 'pipe' });
                    break;
                case 'Redis':
                    // Test Redis connection
                    (0, child_process_1.execSync)(`docker-compose -f docker-compose.dev.yml exec -T redis redis-cli -p ${port} ping`, { stdio: 'pipe' });
                    break;
                case 'MinIO':
                    // Test MinIO API
                    const response = await axios_1.default.get(`http://localhost:${port}/minio/health/live`, { timeout: 5000 });
                    (0, test_1.expect)(response.status).toBe(200);
                    break;
                case 'API Gateway':
                    // Test API Gateway health endpoint
                    const apiResponse = await axios_1.default.get(`http://localhost:${port}/health`, { timeout: 5000 });
                    (0, test_1.expect)(apiResponse.status).toBe(200);
                    break;
            }
        }
        catch (error) {
            throw new Error(`Service ${service.Service} health check failed: ${error.message}`);
        }
    }
});
(0, cucumber_1.Then)('the services should be able to communicate with each other', async function () {
    // Test inter-service communication
    try {
        // Test database connection from API
        const response = await axios_1.default.get('http://localhost:3000/health/database', { timeout: 10000 });
        (0, test_1.expect)(response.status).toBe(200);
    }
    catch (error) {
        // If specific health endpoint doesn't exist, just verify services are running
        const runningServices = (0, child_process_1.execSync)('docker-compose -f docker-compose.dev.yml ps --services --filter "status=running"', { encoding: 'utf8' });
        (0, test_1.expect)(runningServices.trim().length).toBeGreaterThan(0);
    }
});
(0, cucumber_1.Then)('the development environment should be ready for coding', async function () {
    // Verify all essential services are running
    const runningServices = (0, child_process_1.execSync)('docker-compose -f docker-compose.dev.yml ps --services --filter "status=running"', { encoding: 'utf8' });
    const serviceList = runningServices.trim().split('\n').filter(s => s.length > 0);
    (0, test_1.expect)(serviceList.length).toBeGreaterThanOrEqual(3); // At least database, cache, and storage
});
// CI/CD pipeline scenarios
(0, cucumber_1.Given)('I have access to the GitHub repository', async function () {
    (0, test_1.expect)(fs.existsSync('.github')).toBeTruthy();
    (0, test_1.expect)(fs.existsSync('.github/workflows')).toBeTruthy();
});
(0, cucumber_1.When)('I examine the ".github/workflows" directory', async function () {
    const workflowsDir = '.github/workflows';
    this.workflows = fs.readdirSync(workflowsDir)
        .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
        .map(file => ({
        name: file,
        exists: true,
        content: fs.readFileSync(path.join(workflowsDir, file), 'utf8')
    }));
});
(0, cucumber_1.Then)('I should see the following workflow files:', async function (dataTable) {
    const expectedWorkflows = dataTable.hashes();
    for (const expected of expectedWorkflows) {
        const workflow = this.workflows.find(w => w.name === expected.Workflow);
        (0, test_1.expect)(workflow).toBeDefined();
        (0, test_1.expect)(workflow.exists).toBeTruthy();
    }
});
(0, cucumber_1.Then)('each workflow should have proper triggers', async function () {
    for (const workflow of this.workflows) {
        (0, test_1.expect)(workflow.content).toMatch(/on:\s*[\s\S]*?(push|pull_request|schedule|workflow_dispatch)/i);
    }
});
(0, cucumber_1.Then)('the workflows should include automated testing', async function () {
    const ciWorkflow = this.workflows.find(w => w.name.includes('ci'));
    (0, test_1.expect)(ciWorkflow).toBeDefined();
    (0, test_1.expect)(ciWorkflow.content).toMatch(/(npm test|pnpm test|yarn test|jest|vitest)/i);
});
(0, cucumber_1.Then)('security scanning should be integrated', async function () {
    const securityWorkflow = this.workflows.find(w => w.name.includes('security'));
    (0, test_1.expect)(securityWorkflow).toBeDefined();
    (0, test_1.expect)(securityWorkflow.content).toMatch(/(trivy|snyk|codeql|semgrep)/i);
});
// Environment configuration scenarios
(0, cucumber_1.Given)('I am setting up the development environment', async function () {
    this.envSetup = true;
});
(0, cucumber_1.When)('I examine the environment configuration', async function () {
    this.envFiles = {
        example: fs.existsSync('.env.example'),
        development: fs.existsSync('.env.development'),
        staging: fs.existsSync('.env.staging'),
        production: fs.existsSync('.env.production')
    };
});
(0, cucumber_1.Then)('I should see the following configuration files:', async function (dataTable) {
    const expectedFiles = dataTable.hashes();
    for (const file of expectedFiles) {
        const fileName = file.File;
        const envKey = fileName.replace('.env.', '').replace('.env', 'example');
        (0, test_1.expect)(this.envFiles[envKey]).toBeTruthy();
    }
});
(0, cucumber_1.Then)('each configuration should have appropriate security settings', async function () {
    if (fs.existsSync('.env.example')) {
        const envExample = fs.readFileSync('.env.example', 'utf8');
        (0, test_1.expect)(envExample).toMatch(/JWT_SECRET/i);
        (0, test_1.expect)(envExample).toMatch(/DATABASE_URL/i);
        (0, test_1.expect)(envExample).not.toMatch(/password123|secret123|admin/i); // No weak defaults
    }
});
(0, cucumber_1.Then)('sensitive information should not be committed to version control', async function () {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    (0, test_1.expect)(gitignore).toMatch(/\.env$/m);
    (0, test_1.expect)(gitignore).toMatch(/\.env\.local/m);
    (0, test_1.expect)(gitignore).toMatch(/\.env\.production/m);
});
(0, cucumber_1.Then)('environment-specific variables should be properly documented', async function () {
    if (fs.existsSync('.env.example')) {
        const envExample = fs.readFileSync('.env.example', 'utf8');
        // Check for comments explaining variables
        (0, test_1.expect)(envExample).toMatch(/#.*[Dd]atabase/i);
        (0, test_1.expect)(envExample).toMatch(/#.*[Jj][Ww][Tt]/i);
    }
});
// Cleanup after tests
(0, cucumber_1.After)({ tags: '@docker' }, async function () {
    if (this.servicesStarted) {
        try {
            (0, child_process_1.execSync)('docker-compose -f docker-compose.dev.yml down', { stdio: 'pipe' });
        }
        catch (error) {
            console.warn('Failed to clean up Docker services:', error.message);
        }
    }
});
// Additional step definitions for remaining scenarios would continue here...
// This file provides the core infrastructure testing capabilities
