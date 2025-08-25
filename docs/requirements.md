# Technical Requirements Document - SoulMatting Platform

**Version:** 1.0.0 **Created:** 2025-01-21 **Updated:** 2025-01-21 **Author:** Kim Hsiao

## Changelog

- v1.0.0 (2025-01-21): Initial technical requirements specification

---

## 1. System Architecture Overview

### 1.1 Architecture Pattern

- **Microservices Architecture:** Distributed services with clear boundaries
- **Event-Driven Design:** Asynchronous communication between services
- **API-First Approach:** RESTful APIs with OpenAPI/Swagger documentation
- **Self-Hosted:** Docker-based containerized deployment
- **Security-First:** Zero-trust security model with comprehensive authentication

### 1.2 Communication Protocols

- **Inter-service Communication:** HTTP/REST via Supabase PostgREST API
- **Message Queue:** Redis with Bull Queue for job processing
- **Real-time Communication:** Supabase Realtime + Socket.io for WebSocket connections
- **API Gateway:** Kong Gateway (Supabase) with rate limiting and authentication
- **Authentication:** GoTrue (Supabase Auth) with JWT token management

### 1.3 High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Load Balancer │
│   React 18      │◄──►│   NestJS        │◄──►│   Nginx         │
│   Shadcn UI     │    │   Swagger       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │ Auth Service │ │ User Service│ │Match Service│
        │   NestJS     │ │   NestJS    │ │   NestJS   │
        └──────────────┘ └─────────────┘ └────────────┘
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │  PostgreSQL  │ │  PostgreSQL │ │   Redis    │
        │   (Users)    │ │ (Profiles)  │ │  (Cache)   │
        └──────────────┘ └─────────────┘ └────────────┘
                                │
                        ┌───────▼──────┐
                        │    MinIO     │
                        │   (Media)    │
                        └──────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend Technologies

#### 2.1.1 Core Framework

- **React 18:** Latest React with concurrent features
- **TypeScript:** Type-safe development with strict mode
- **Vite:** Fast build tool with HMR support
- **pnpm:** Efficient package management

#### 2.1.2 UI Framework & Styling

- **Shadcn UI:** Modern component library
- **Tailwind CSS:** Utility-first CSS framework
- **Radix UI:** Accessible primitive components
- **Lucide React:** Consistent icon library

#### 2.1.3 State Management

- **Zustand:** Lightweight state management
- **React Query (TanStack Query):** Server state management
- **React Hook Form:** Form state and validation

### 2.2 Backend Technologies

#### 2.2.1 Core Framework

- **NestJS:** Enterprise-grade Node.js framework
- **Node.js 22+:** Latest LTS version
- **TypeScript:** Strict type checking enabled
- **pnpm:** Package management consistency

#### 2.2.2 API & Documentation

- **Swagger/OpenAPI:** Comprehensive API documentation
- **Class Validator:** Request validation
- **Class Transformer:** Data transformation
- **Helmet:** Security headers

### 2.3 Database Technologies

#### 2.3.1 Primary Database

- **PostgreSQL 16+:** ACID-compliant relational database
- **Prisma:** Type-safe database ORM
- **Connection Pooling:** PgBouncer for connection management

#### 2.3.2 Caching & Session Store

- **Redis 7+:** In-memory data structure store
- **Redis Cluster:** High availability setup
- **Bull Queue:** Job queue management

### 2.4 Search & Analytics

#### 2.4.1 Search Engines

- **PostgreSQL Full-Text Search:** Built-in search capabilities
- **PostGIS:** Geospatial extensions for location-based features
- **Redis Search:** Fast in-memory search indexing

### 2.5 Storage & Media

#### 2.5.1 Object Storage

- **MinIO:** S3-compatible object storage for media files
- **Sharp:** High-performance image processing
- **FFmpeg:** Video processing and optimization

### 2.5 Communication & Real-time

#### 2.5.1 Real-time Communication

- **Socket.io:** WebSocket implementation
- **WebRTC:** Peer-to-peer video/audio
- **Redis Adapter:** Socket.io scaling

#### 2.5.2 Message Queue

- **RabbitMQ:** Reliable message broker
- **Bull Queue:** Job processing with Redis
- **Event Sourcing:** Domain event handling

### 2.6 DevOps & Infrastructure

#### 2.6.1 Containerization

- **Docker:** Application containerization
- **Docker Compose:** Local development environment
- **Multi-stage builds:** Optimized container images

#### 2.6.2 Orchestration

- **Docker Compose:** Multi-container application orchestration with Supabase stack integration
- **Self-Hosted Stack:** PostgreSQL + Supabase + MinIO + Redis
- **Nginx:** Reverse proxy and load balancer
- **Traefik:** Alternative reverse proxy with automatic SSL
- **Prometheus:** Metrics collection
- **Grafana:** Metrics visualization
- **Loki:** Centralized logging
- **Service Discovery:** Docker Compose networking with health checks

---

## 3. Functional Requirements

### 3.1 Authentication Service

#### 3.1.1 Core Features

- **Multi-provider Authentication:** Email, Google, Discord OAuth
- **JWT Token Management:** Access and refresh token handling
- **Two-Factor Authentication:** TOTP-based 2FA
- **Password Security:** Bcrypt hashing with salt
- **Session Management:** Redis-based session store

#### 3.1.2 API Endpoints

```typescript
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-email
POST /auth/enable-2fa
POST /auth/verify-2fa
```

#### 3.1.3 Data Models

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Session {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
}
```

### 3.2 User Profile Service

#### 3.2.1 Core Features

- **Profile Management:** Comprehensive user profiles
- **Photo Upload:** Multiple photo support with optimization
- **Interest Management:** Categorized interests and hobbies
- **Privacy Controls:** Granular visibility settings
- **Verification System:** Photo and document verification

#### 3.2.2 API Endpoints

```typescript
GET /profiles/:id
PUT /profiles/:id
POST /profiles/:id/photos
DELETE /profiles/:id/photos/:photoId
PUT /profiles/:id/interests
PUT /profiles/:id/privacy
POST /profiles/:id/verify
```

#### 3.2.3 Data Models

```typescript
interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  age: number;
  location: GeoLocation;
  occupation: string;
  education: string;
  bio: string;
  interests: Interest[];
  photos: Photo[];
  verification: VerificationStatus;
  privacy: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}

interface Interest {
  id: string;
  category: string;
  name: string;
  weight: number;
}

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  verified: boolean;
  uploadedAt: Date;
}
```

### 3.3 Matching Service

#### 3.3.1 Core Features

- **Compatibility Algorithm:** Multi-factor matching
- **Geographic Matching:** Location-based recommendations
- **Interest Scoring:** Weighted interest compatibility
- **Behavioral Learning:** ML-based preference learning
- **Match Queue:** Efficient match generation

#### 3.3.2 API Endpoints

```typescript
GET /matches/recommendations
POST /matches/like
POST /matches/pass
GET /matches/mutual
GET /matches/compatibility/:userId
PUT /matches/preferences
```

#### 3.3.3 Matching Algorithm

```typescript
interface CompatibilityScore {
  overall: number;
  interests: number;
  location: number;
  age: number;
  lifestyle: number;
  values: number;
}

interface MatchingCriteria {
  ageRange: [number, number];
  maxDistance: number;
  requiredInterests: string[];
  dealBreakers: string[];
  preferences: UserPreferences;
}
```

### 3.4 Communication Service

#### 3.4.1 Core Features

- **Real-time Messaging:** Instant message delivery
- **Media Sharing:** Photo, video, and file sharing
- **Message Encryption:** End-to-end encryption
- **Typing Indicators:** Real-time typing status
- **Message History:** Searchable conversation history

#### 3.4.2 WebSocket Events

```typescript
// Client to Server
'message:send';
'message:typing';
'message:read';
'conversation:join';
'conversation:leave';

// Server to Client
'message:received';
'message:delivered';
'message:read';
'user:typing';
'user:online';
'user:offline';
```

#### 3.4.3 Data Models

```typescript
interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file';
  encrypted: boolean;
  readBy: Record<string, Date>;
  createdAt: Date;
}
```

### 3.5 Search & Discovery Service

#### 3.5.1 Search Architecture

- **Primary Search:** PostgreSQL Full-Text Search for user discovery
- **Geo Search:** PostGIS for location-based search
- **Full-text Search:** Profile and interest searching with tsvector
- **Faceted Search:** Multi-criteria filtering with indexed queries
- **Cache Layer:** Redis for frequently accessed search results

#### 3.5.2 Search Implementation

```typescript
// User Search Document (PostgreSQL View)
interface UserSearchDocument {
  id: string;
  displayName: string;
  age: number;
  location: Point; // PostGIS geometry
  interests: string[];
  occupation: string;
  education: string;
  verified: boolean;
  lastActive: Date;
  searchVector: string; // tsvector for full-text search
}

// Interest Search Document
interface InterestSearchDocument {
  id: string;
  name: string;
  category: string;
  popularity: number;
  relatedInterests: string[];
  searchVector: string; // tsvector for full-text search
}

// Search Query Builder
interface SearchQuery {
  text?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  ageRange?: [number, number];
  interests?: string[];
  verified?: boolean;
  lastActiveWithin?: number; // days
}
```

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

#### 4.1.1 Response Times

- **API Response:** < 200ms for 95th percentile
- **Page Load:** < 3 seconds initial load
- **Real-time Messaging:** < 100ms latency
- **Search Results:** < 500ms for complex queries

#### 4.1.2 Throughput

- **Concurrent Users:** 1,000+ simultaneous users
- **API Requests:** 10,000+ requests per minute
- **Message Throughput:** 1,000+ messages per second
- **Search Queries:** 500+ searches per second

### 4.2 Scalability Requirements

#### 4.2.1 Horizontal Scaling

- **Stateless Services:** All services designed for horizontal scaling
- **Database Sharding:** Prepared for database partitioning
- **Load Balancing:** Automatic traffic distribution
- **Auto-scaling:** Kubernetes-based auto-scaling

#### 4.2.2 Data Growth

- **User Growth:** Support for 100K+ users
- **Message Volume:** Millions of messages per day
- **Media Storage:** Terabytes of user-generated content
- **Search Index:** Millions of searchable documents

### 4.3 Reliability Requirements

#### 4.3.1 Availability

- **Uptime Target:** 99.9% availability (8.76 hours downtime/year)
- **Fault Tolerance:** Graceful degradation of non-critical features
- **Disaster Recovery:** < 4 hours recovery time objective
- **Data Backup:** Daily automated backups with point-in-time recovery

#### 4.3.2 Error Handling

- **Circuit Breakers:** Prevent cascade failures
- **Retry Mechanisms:** Exponential backoff for transient failures
- **Graceful Degradation:** Fallback mechanisms for service failures
- **Error Monitoring:** Real-time error tracking and alerting

### 4.4 Security Requirements

#### 4.4.1 Authentication & Authorization

- **JWT Security:** Short-lived access tokens with refresh rotation
- **Role-Based Access Control:** Granular permission system
- **API Rate Limiting:** Prevent abuse and DDoS attacks
- **Input Validation:** Comprehensive input sanitization

#### 4.4.2 Data Protection

- **Encryption at Rest:** AES-256 encryption for sensitive data
- **Encryption in Transit:** TLS 1.3 for all communications
- **Message Encryption:** End-to-end encryption for private messages
- **PII Protection:** Anonymization and pseudonymization

---

## 5. Integration Requirements

### 5.1 Third-Party Services

#### 5.1.1 Authentication Providers

- **Google OAuth 2.0:** Social login integration
- **Discord OAuth 2.0:** Gaming community integration
- **Apple Sign-In:** iOS ecosystem integration (future)
- **Local Authentication:** Email/password with JWT tokens

#### 5.1.2 Media Services

- **MinIO:** Self-hosted S3-compatible object storage
- **Sharp:** Server-side image optimization
- **FFmpeg:** Video processing and optimization
- **WebRTC STUN/TURN:** Video call infrastructure (self-hosted or public)

#### 5.1.3 Communication Services

- **SMTP Server:** Self-hosted or external email service
- **Nodemailer:** Email delivery library
- **SMS Gateway:** Optional SMS verification service
- **Web Push:** Browser push notifications (self-hosted)

#### 5.1.4 Self-Hosted Alternatives

- **Mailhog/MailCatcher:** Development email testing
- **Coturn:** Self-hosted STUN/TURN server
- **Postal:** Self-hosted email delivery platform
- **Gotify:** Self-hosted push notification server

### 5.2 API Specifications

#### 5.2.1 RESTful API Standards

- **HTTP Methods:** Proper use of GET, POST, PUT, DELETE
- **Status Codes:** Consistent HTTP status code usage
- **Content Types:** JSON for data exchange
- **Versioning:** URL-based API versioning (/v1/)

#### 5.2.2 OpenAPI Documentation

- **Swagger UI:** Interactive API documentation
- **Schema Validation:** Request/response validation
- **Code Generation:** Client SDK generation
- **Testing Integration:** Automated API testing

---

## 6. Development Requirements

### 6.1 Code Quality Standards

#### 6.1.1 Coding Standards

- **TypeScript Strict Mode:** Strict type checking enabled
- **ESLint Configuration:** Consistent code style enforcement
- **Prettier Formatting:** Automated code formatting
- **Husky Git Hooks:** Pre-commit quality checks

#### 6.1.2 Documentation Standards

- **Code Comments:** Comprehensive inline documentation
- **JSDoc/TSDoc:** Function and class documentation
- **README Files:** Clear setup and usage instructions
- **API Documentation:** OpenAPI/Swagger specifications

### 6.2 Development Workflow

#### 6.2.1 Version Control

- **Git Flow:** Structured branching strategy
- **Conventional Commits:** Standardized commit messages
- **Pull Request Reviews:** Mandatory code reviews
- **Semantic Versioning:** Consistent version numbering

#### 6.2.2 Package Management

- **pnpm Workspaces:** Monorepo package management
- **Lock Files:** Deterministic dependency resolution
- **Security Audits:** Regular dependency vulnerability scans
- **Update Strategy:** Controlled dependency updates

### 6.3 Testing Requirements

#### 6.3.1 Testing Framework

- **Jest:** Unit and integration testing
- **Supertest:** API endpoint testing
- **React Testing Library:** Component testing
- **Playwright:** End-to-end testing

#### 6.3.2 Testing Coverage

- **Unit Tests:** > 80% code coverage
- **Integration Tests:** Critical path coverage
- **E2E Tests:** User journey validation
- **Performance Tests:** Load and stress testing

---

## 7. Deployment Requirements

### 7.1 Infrastructure Requirements

#### 7.1.1 Container Platform

- **Docker Compose:** Multi-container application orchestration
- **Docker Registry:** Optional private container registry
- **Nginx:** Reverse proxy and load balancer
- **SSL/TLS:** Let's Encrypt or custom certificates

#### 7.1.2 Resource Requirements

```yaml
# Minimum Resource Allocation (Docker Compose)
services:
  api-gateway:
    cpu_limit: 0.5
    memory_limit: 1G
    deploy:
      replicas: 1

  auth-service:
    cpu_limit: 0.25
    memory_limit: 512M
    deploy:
      replicas: 1

  user-service:
    cpu_limit: 0.5
    memory_limit: 1G
    deploy:
      replicas: 1

  match-service:
    cpu_limit: 1.0
    memory_limit: 2G
    deploy:
      replicas: 1

  communication-service:
    cpu_limit: 0.5
    memory_limit: 1G
    deploy:
      replicas: 1

  search-service:
    cpu_limit: 0.5
    memory_limit: 1G
    deploy:
      replicas: 1

databases:
  postgresql:
    cpu_limit: 1.0
    memory_limit: 4G
    volumes:
      - postgres_data:/var/lib/postgresql/data
    shm_size: 256M

  redis:
    cpu_limit: 0.25
    memory_limit: 1G
    volumes:
      - redis_data:/data

  minio:
    cpu_limit: 0.5
    memory_limit: 1G
    volumes:
      - minio_data:/data

  rabbitmq:
    cpu_limit: 0.5
    memory_limit: 1G
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
```

### 7.2 Environment Strategy

#### 7.2.1 Environment Tiers

- **Development:** Local development with Docker Compose
- **Staging:** Production-like environment for testing (optional)
- **Production:** Self-hosted production deployment with Docker Compose
- **Backup:** Regular database and media backups to external storage

#### 7.2.2 Deployment Strategy

- **Source Control:** Git-based workflow with feature branches
- **Build Pipeline:** GitHub Actions or GitLab CI for automated testing
- **Deployment:** Docker Compose with rolling updates
- **Rollback Strategy:** Tagged Docker images for quick rollback
- **Health Checks:** Container health monitoring and auto-restart
- **Backup Strategy:** Automated daily backups with retention policy

#### 7.2.3 Self-Hosted Deployment

```yaml
# Production Docker Compose Configuration
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - api-gateway

  api-gateway:
    image: soulmatting/api-gateway:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgresql
      - redis

  postgresql:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - '6379:6379'

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - '9000:9000'
      - '9001:9001'

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## 8. Monitoring & Observability

### 8.1 Monitoring Requirements

#### 8.1.1 Application Metrics

- **Performance Metrics:** Response times, throughput, error rates
- **Business Metrics:** User engagement, match success rates
- **Infrastructure Metrics:** CPU, memory, disk, network usage
- **Custom Metrics:** Domain-specific KPIs

#### 8.1.2 Logging Strategy

- **Structured Logging:** JSON-formatted logs
- **Log Aggregation:** Centralized log collection
- **Log Retention:** 30-day retention policy
- **Log Analysis:** Searchable and filterable logs

### 8.2 Alerting & Notifications

#### 8.2.1 Alert Categories

- **Critical:** Service outages, data corruption
- **Warning:** Performance degradation, high error rates
- **Info:** Deployment notifications, scheduled maintenance

#### 8.2.2 Notification Channels

- **Slack Integration:** Real-time team notifications
- **Email Alerts:** Critical issue notifications
- **PagerDuty:** On-call escalation (future)

---

## 9. Compliance & Legal Requirements

### 9.1 Data Privacy Compliance

#### 9.1.1 GDPR Requirements

- **Data Minimization:** Collect only necessary data
- **Consent Management:** Explicit user consent tracking
- **Right to Erasure:** Data deletion capabilities
- **Data Portability:** User data export functionality
- **Privacy by Design:** Built-in privacy protections

#### 9.1.2 CCPA Requirements

- **Data Transparency:** Clear data usage disclosure
- **Opt-out Rights:** User data sale opt-out
- **Data Access Rights:** User data access requests
- **Non-discrimination:** Equal service regardless of privacy choices

### 9.2 Content Moderation

#### 9.2.1 Automated Moderation

- **Content Filtering:** AI-powered inappropriate content detection
- **Image Moderation:** Automated image content analysis
- **Spam Detection:** Automated spam and abuse detection
- **Behavioral Analysis:** Suspicious activity detection

#### 9.2.2 Manual Review Process

- **Human Moderation:** Manual review of flagged content
- **Appeal Process:** User appeal and review system
- **Community Guidelines:** Clear content policies
- **Moderation Tools:** Admin tools for content management

---

## 10. Success Criteria

### 10.1 Technical Success Metrics

#### 10.1.1 Performance Metrics

- **API Response Time:** < 200ms average
- **Page Load Time:** < 3 seconds
- **Uptime:** > 99.9%
- **Error Rate:** < 0.1%

#### 10.1.2 Quality Metrics

- **Code Coverage:** > 80%
- **Security Vulnerabilities:** Zero critical vulnerabilities
- **Technical Debt:** Manageable debt ratio
- **Documentation Coverage:** 100% API documentation

### 10.2 Business Success Metrics

#### 10.2.1 User Engagement

- **Daily Active Users:** Consistent growth
- **Session Duration:** > 10 minutes average
- **Match Success Rate:** > 15% mutual matches
- **Message Response Rate:** > 60%

#### 10.2.2 Platform Health

- **User Retention:** > 70% 7-day retention
- **Safety Metrics:** < 1% reported incidents
- **Content Quality:** > 95% appropriate content
- **User Satisfaction:** > 4.0/5.0 rating

---

**Document Status:** Approved for Implementation **Next Review Date:** 2025-02-21 **Technical Lead
Approval:** [Approved]
