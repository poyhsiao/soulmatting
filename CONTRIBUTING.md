# Contributing Guide

Thank you for your interest in the SoulMatting project! We welcome all forms of contributions, including but not limited to code, documentation, testing, issue reports, and feature suggestions.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Environment Setup](#development-environment-setup)
- [Code Standards](#code-standards)
- [Commit Standards](#commit-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Documentation Contributions](#documentation-contributions)

## 🤝 Code of Conduct

This project adopts the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct. By participating in this project, you agree to abide by its terms.

### Our Pledge

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 How to Contribute

### Types of Contributions

1. **Code Contributions**
   - New feature development
   - Bug fixes
   - Performance optimization
   - Refactoring improvements

2. **Documentation Contributions**
   - API documentation
   - User guides
   - Development documentation
   - Translation work

3. **Testing Contributions**
   - Unit tests
   - Integration tests
   - End-to-end tests
   - Performance tests

4. **Other Contributions**
   - Issue reports
   - Feature suggestions
   - Code reviews
   - Community support

## 🛠️ Development Environment Setup

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 10.0.0
- Docker >= 20.0.0
- Docker Compose >= 2.0.0
- Git >= 2.30.0

### Setup Steps

1. **Fork and Clone the Project**
   ```bash
   git clone https://github.com/YOUR_USERNAME/soulmatting.git
   cd soulmatting
   ```

2. **Add Upstream Repository**
   ```bash
   git remote add upstream https://github.com/kimhsiao/soulmatting.git
   ```

3. **Install Dependencies**
   ```bash
   # Frontend dependencies
   cd frontend
   pnpm install
   
   # Backend dependencies
   cd ../backend
   pnpm install
   ```

4. **Setup Environment Variables**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

5. **Start Development Environment**
   ```bash
   docker-compose up -d
   ```

6. **Run Tests**
   ```bash
   # Frontend tests
   cd frontend && pnpm test
   
   # Backend tests
   cd backend && pnpm test
   ```

## 📝 Code Standards

### General Standards

- Use English for code comments and variable names
- Keep code concise and readable
- Follow DRY (Don't Repeat Yourself) principle
- Write meaningful test cases

### Frontend Standards

- Use TypeScript for type checking
- Follow ESLint and Prettier configuration
- Use PascalCase for component naming
- Use camelCase for Hook naming, starting with "use"
- Use UPPER_SNAKE_CASE for constants

```typescript
// ✅ Good example
const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { user, loading } = useUserData(userId);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
    </div>
  );
};
```

### Backend Standards

- Use NestJS decorators and dependency injection
- Follow RESTful API design principles
- Use DTOs for data validation
- Implement proper error handling
- Add Swagger documentation annotations

```typescript
// ✅ Good example
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserDto })
  async findOne(@Param('id') id: string): Promise<UserDto> {
    return this.usersService.findOne(id);
  }
}
```

### Database Standards

- Use Prisma for database operations
- Follow database naming conventions
- Write database migration scripts
- Add appropriate indexes and constraints

## 📋 Commit Standards

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation updates
- `style`: Code formatting (no functional changes)
- `refactor`: Code refactoring
- `test`: Testing related
- `chore`: Build process or auxiliary tool changes
- `perf`: Performance optimization
- `ci`: CI/CD related

### Commit Examples

```bash
# New feature
git commit -m "feat(auth): add JWT authentication system"

# Bug fix
git commit -m "fix(api): resolve user profile update issue"

# Documentation update
git commit -m "docs: update API documentation for user endpoints"

# Refactoring
git commit -m "refactor(database): optimize user query performance"
```

## 🔄 Pull Request Process

### Pre-submission Checklist

- [ ] Code passes all tests
- [ ] Code passes ESLint and Prettier checks
- [ ] Added or updated relevant tests
- [ ] Updated relevant documentation
- [ ] Updated CHANGELOG.md
- [ ] Commit messages follow conventions

### PR Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop and Test**
   ```bash
   # Perform development
   # Run tests
   pnpm test
   ```

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Use clear title and description
   - Link related Issues
   - Add appropriate labels
   - Request code review

### PR Template

```markdown
## Change Description
Briefly describe the changes in this PR

## Change Type
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation update
- [ ] Other

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Added necessary comments
- [ ] Updated relevant documentation
- [ ] No merge conflicts

## Related Issues
Closes #(issue number)

## Screenshots (if applicable)
```

## 🐛 Issue Reporting

### Before Reporting a Bug

1. Check if there's already an Issue for the same problem
2. Ensure you're using the latest version
3. Check documentation and FAQ

### Bug Report Template

```markdown
**Bug Description**
Clear and concise description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
Describe what you expected to happen

**Actual Behavior**
Describe what actually happened

**Environment Information**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 95.0]
- Node.js: [e.g. 18.0.0]
- Project version: [e.g. 1.0.0]

**Additional Information**
Add any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clearly describe the feature you want

**Problem Background**
Describe the problem this feature would solve

**Proposed Solution**
Describe your desired solution

**Alternative Solutions**
Describe other solutions you've considered

**Additional Information**
Add any other relevant information
```

## 📚 Documentation Contributions

### Documentation Types

- **API Documentation**: Using Swagger/OpenAPI
- **User Guides**: Markdown format
- **Development Documentation**: Technical implementation details
- **Architecture Documentation**: System design and architecture

### Documentation Standards

- Use clear heading structure
- Provide code examples
- Include necessary screenshots
- Keep content updated

## 🏷️ Label System

### Issue Labels

- `bug`: Bug reports
- `enhancement`: Feature enhancements
- `documentation`: Documentation related
- `good first issue`: Good for newcomers
- `help wanted`: Help needed
- `priority/high`: High priority
- `priority/medium`: Medium priority
- `priority/low`: Low priority

### PR Labels

- `ready for review`: Ready for review
- `work in progress`: Work in progress
- `needs changes`: Needs changes
- `approved`: Approved

## 🎯 Code Review

### Review Focus Areas

1. **Functional Correctness**: Does the code implement expected functionality
2. **Code Quality**: Does it follow project standards
3. **Performance Impact**: Are there performance issues
4. **Security**: Are there security vulnerabilities
5. **Test Coverage**: Is there sufficient testing
6. **Documentation Completeness**: Are relevant docs updated

### Review Guidelines

- Provide constructive feedback
- Explain reasons for suggested changes
- Acknowledge good coding practices
- Maintain friendly and professional tone

## 📞 Contact

If you have any questions or need help, please contact us through the following methods:

- GitHub Issues: [Project Issues](https://github.com/kimhsiao/soulmatting/issues)
- Email: kim.hsiao@example.com
- Discussions: [GitHub Discussions](https://github.com/kimhsiao/soulmatting/discussions)

---

Thank you again for your contributions! Your participation makes SoulMatting better. 💕