# Changelog

This file records all important changes to the SoulMatting project.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Planned Additions
- User registration and authentication system
- Basic user profile management
- Core matching algorithm implementation
- Real-time chat functionality
- Search and discovery features
- Admin dashboard system

## [0.1.0] - 2024-01-20

### Added
- Project initialization and basic architecture design
- Complete project documentation system
  - Product Requirements Document (PRD)
  - Technical Requirements Document
  - System Design Document
  - Development Task Planning
  - 6A Development Process Documentation
- Technology stack selection and architectural decisions
  - Frontend: React 18 + Shadcn UI + Zustand
  - Backend: NestJS + Node.js
  - Database: PostgreSQL + MongoDB + Redis
  - Search: Meilisearch / Typesense
  - Message Queue: RabbitMQ + Bull Queue
  - Real-time Communication: Socket.io + WebRTC
- Development standards and workflow definition
- Project structure planning

### Documentation
- Created comprehensive README.md
- Established 6A development process documentation
  - ALIGNMENT_SoulMatting.md - Requirements alignment document
  - CONSENSUS_SoulMatting.md - Consensus document
  - DESIGN_SoulMatting.md - Design document
  - TASK_SoulMatting.md - Task breakdown document
- Technical architecture and design decision documentation
- Development tasks and milestone planning

### Technical Decisions
- Adopted microservices architecture pattern
- Selected Docker + Kubernetes for containerization and orchestration
- Determined pnpm as frontend package management tool
- Chose Swagger/OpenAPI as API documentation standard
- Adopted gRPC + RabbitMQ for inter-service communication

---

## Version Information

### Version Number Format
- **Major Version**: When making incompatible API changes
- **Minor Version**: When adding functionality in a backwards compatible manner
- **Patch Version**: When making backwards compatible bug fixes

### Change Types
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features that will be removed soon
- **Removed**: Features that have been removed
- **Fixed**: Bug fixes
- **Security**: Security-related fixes

### Release Cycle
- **Major versions**: Released based on major feature milestones
- **Minor versions**: Released every 2-4 weeks
- **Patch versions**: Released as needed

### Support Policy
- Current major version: Full support
- Previous major version: Security updates and critical bug fixes
- Earlier versions: No longer supported

---

## Contributing Guidelines

When submitting a Pull Request, please ensure:

1. Update this CHANGELOG.md file
2. Add your changes under the `[Unreleased]` section
3. Use appropriate change type labels
4. Provide clear change descriptions
5. Include relevant Issue or PR numbers

### Example Format

```markdown
### Added
- Added user registration functionality (#123)
- Implemented basic matching algorithm (#124)

### Fixed
- Fixed responsive layout issue on login page (#125)
- Resolved database connection pool leak (#126)
```

---

**Note**: This file will be continuously updated as the project develops. All important changes will be recorded here.