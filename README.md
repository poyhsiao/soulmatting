# SoulMatting - Soul Mate Matching Platform

> A modern social matching platform based on advanced matching algorithms

## 📋 Project Overview

SoulMatting is an innovative social matching platform designed to help users find their true soul mates through advanced matching algorithms and rich social features. The platform adopts a microservices architecture to provide high-performance and high-availability service experience.

## ✨ Core Features

- 🔐 **Secure Authentication System** - JWT + OAuth2 multi-factor authentication
- 👤 **Intelligent User Profiles** - Multi-dimensional personal data management
- 💝 **Deep Matching Algorithm** - Smart matching based on interests, values, and geographic location
- 💬 **Real-time Communication System** - Text, voice, and video multimedia communication
- 🔍 **Intelligent Search & Discovery** - Efficient user search and recommendation system
- 🛡️ **Content Security Moderation** - AI + manual dual content moderation mechanism
- 📱 **Responsive Design** - Perfect adaptation for desktop and mobile devices

## 🏗️ Technical Architecture

### Frontend Tech Stack

- **Framework**: React 18 + TypeScript
- **UI Library**: Shadcn UI + Tailwind CSS
- **State Management**: Zustand
- **Package Manager**: pnpm

### Backend Tech Stack

- **Framework**: NestJS + Node.js
- **Database**: PostgreSQL + MongoDB + Redis
- **Search Engine**: Meilisearch / Typesense
- **Message Queue**: RabbitMQ + Bull Queue
- **Real-time Communication**: Socket.io + WebRTC
- **API Documentation**: Swagger/OpenAPI

### Infrastructure

- **Containerization**: Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

## 📁 Project Structure

```
soulmatting/
├── docs/                    # Project documentation
│   ├── SoulMatting/        # 6A development process docs
│   ├── prd.md              # Product requirements document
│   ├── requirements.md     # Technical requirements document
│   ├── design.md           # System design document
│   └── tasks.md            # Development task planning
├── frontend/               # Frontend application (to be created)
├── backend/                # Backend services (to be created)
├── infrastructure/         # Infrastructure configuration (to be created)
├── docker-compose.yml      # Local development environment (to be created)
└── README.md               # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker >= 20.0.0
- Docker Compose >= 2.0.0

### Local Development Environment Setup

```bash
# Clone the project
git clone https://github.com/kimhsiao/soulmatting.git
cd soulmatting

# Install dependencies (frontend)
cd frontend
pnpm install

# Install dependencies (backend)
cd ../backend
pnpm install

# Start development environment
docker-compose up -d

# Start frontend development server
cd frontend
pnpm dev

# Start backend development server
cd ../backend
pnpm start:dev
```

### Environment Variables Configuration

Copy environment variable templates and configure:

```bash
# Backend environment variables
cp backend/.env.example backend/.env

# Frontend environment variables
cp frontend/.env.example frontend/.env
```

## 📚 Documentation

- [Product Requirements Document (PRD)](./docs/prd.md)
- [Technical Requirements Document](./docs/requirements.md)
- [System Design Document](./docs/design.md)
- [Development Task Planning](./docs/tasks.md)
- [6A Development Process Documentation](./docs/SoulMatting/)

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
pnpm test

# Run backend tests
cd backend
pnpm test

# Run end-to-end tests
pnpm test:e2e
```

## 📦 Deployment

### Production Environment Deployment

```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Deploy to Kubernetes
kubectl apply -f infrastructure/k8s/
```

## 🤝 Contributing

1. Fork this project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Standards

- Follow [Conventional Commits](https://www.conventionalcommits.org/) specification
- Code must pass ESLint and Prettier checks
- All features must include unit tests
- Pull Requests must pass Code Review

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details

## 👥 Team

- **Project Lead**: Kim Hsiao
- **Technical Architect**: Kim Hsiao
- **Product Manager**: Kim Hsiao

## 📞 Contact

- Project Homepage: [https://github.com/kimhsiao/soulmatting](https://github.com/kimhsiao/soulmatting)
- Issue Reports: [GitHub Issues](https://github.com/kimhsiao/soulmatting/issues)
- Email: kim.hsiao@example.com

## 🔄 Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version update records.

---

**SoulMatting** - Let every soul find its other half 💕
