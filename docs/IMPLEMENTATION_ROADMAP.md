# SoulMatting Implementation Roadmap

## Overview

This document provides a detailed implementation roadmap for the SoulMatting project based on the
PostgreSQL + Supabase + MinIO technology stack, including development phases, scheduling,
milestones, and risk management.

## Project Phase Planning

### Phase 1: Infrastructure Setup (4-6 weeks)

#### 1.1 Development Environment Setup (1 week)

**Objective**: Establish complete development environment and toolchain

**Task List**:

- [ ] Setup Git repository and branching strategy
- [ ] Configure Docker development environment
- [ ] Establish CI/CD pipeline (GitHub Actions)
- [ ] Setup code quality tools (ESLint, Prettier, Husky)
- [ ] Configure testing frameworks (Jest, Cypress)

**Technical Configuration**:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run linting
        run: pnpm lint

      - name: Run tests
        run: pnpm test:coverage

      - name: Build application
        run: pnpm build
```

**Deliverables**:

- Complete development environment configuration
- CI/CD pipeline setup
- Code standards and quality checking tools

#### 1.2 Database Design and Setup (2 weeks)

**Objective**: Establish PostgreSQL database architecture and Supabase configuration

**Task List**:

- [ ] Design database ERD
- [ ] Create database table structure
- [ ] Setup Row Level Security (RLS) policies
- [ ] Configure database indexes and optimization
- [ ] Establish data migration scripts
- [ ] Setup database backup strategy

**Database Migration Scripts**:

```sql
-- migrations/001_initial_schema.sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- User profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  birth_date DATE,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'non-binary', 'other')),
  location GEOGRAPHY(POINT, 4326),
  preferences JSONB DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (
    verification_status IN ('pending', 'verified', 'rejected')
  ),
  is_active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_active ON profiles(is_active, last_active_at);

-- Setup RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Deliverables**:

- Complete database architecture
- RLS security policies
- Data migration and seed scripts

#### 1.3 Supabase Configuration (1 week)

**Objective**: Configure Supabase services and authentication system

**Task List**:

- [ ] Setup Supabase project
- [ ] Configure authentication providers (Google, Facebook, Apple)
- [ ] Setup Edge Functions
- [ ] Configure Realtime subscriptions
- [ ] Setup Storage buckets and policies

**Supabase Configuration**:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Authentication configuration
export const authConfig = {
  redirectTo: `${window.location.origin}/auth/callback`,
  providers: {
    google: {
      scopes: 'email profile',
    },
    facebook: {
      scopes: 'email public_profile',
    },
  },
};
```

**Deliverables**:

- Supabase project configuration
- Authentication system setup
- Edge Functions infrastructure

#### 1.4 MinIO Storage Setup (1 week)

**Objective**: Establish MinIO object storage service

**Task List**:

- [ ] Deploy MinIO cluster
- [ ] Configure storage buckets and policies
- [ ] Setup CDN integration
- [ ] Establish file upload service
- [ ] Configure image processing pipeline

**MinIO Configuration**:

```typescript
// services/storage.service.ts
import { Client as MinioClient } from 'minio';
import sharp from 'sharp';

export class StorageService {
  private minioClient: MinioClient;
  private bucketName: string;

  constructor() {
    this.minioClient = new MinioClient({
      endPoint: process.env.MINIO_ENDPOINT!,
      port: parseInt(process.env.MINIO_PORT!),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!,
    });
    this.bucketName = process.env.MINIO_BUCKET_NAME!;
  }

  async uploadProfilePhoto(userId: string, file: Buffer, filename: string): Promise<string> {
    // Image processing
    const processedImage = await sharp(file)
      .resize(800, 800, { fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer();

    const objectName = `profiles/${userId}/${Date.now()}-${filename}.webp`;

    await this.minioClient.putObject(
      this.bucketName,
      objectName,
      processedImage,
      processedImage.length,
      {
        'Content-Type': 'image/webp',
        'Cache-Control': 'max-age=31536000',
      }
    );

    return `https://${process.env.MINIO_ENDPOINT}/${this.bucketName}/${objectName}`;
  }
}
```

**Deliverables**:

- MinIO cluster deployment
- File upload and processing service
- CDN integration configuration

### Phase 2: Core Feature Development (8-10 weeks)

#### 2.1 User Authentication & Profile Management (3 weeks)

**Objective**: Implement user registration, login and profile management features

**Task List**:

- [ ] User registration flow
- [ ] Social login integration
- [ ] User profile editing
- [ ] Photo upload and management
- [ ] Identity verification system

**User Authentication Service**:

```typescript
// services/auth.service.ts
export class AuthService {
  async signUpWithEmail(email: string, password: string, userData: UserData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: userData.displayName,
          birth_date: userData.birthDate,
        },
      },
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      await this.createUserProfile(data.user.id, userData);
    }

    return data;
  }

  async signInWithProvider(provider: 'google' | 'facebook' | 'apple') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  }

  private async createUserProfile(userId: string, userData: UserData) {
    const { error } = await supabase.from('profiles').insert({
      user_id: userId,
      username: userData.username,
      display_name: userData.displayName,
      bio: userData.bio,
      birth_date: userData.birthDate,
      gender: userData.gender,
    });

    if (error) throw error;
  }
}
```

#### 2.2 Matching Algorithm Implementation (3 weeks)

**Objective**: Develop intelligent matching algorithm and recommendation system

**Task List**:

- [ ] Geographic location matching
- [ ] Interest and preference matching
- [ ] Machine learning recommendation model
- [ ] Match score calculation
- [ ] A/B testing framework

**Matching Algorithm Edge Function**:

```typescript
// supabase/functions/matching-algorithm/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface MatchingRequest {
  userId: string;
  maxDistance: number;
  ageRange: [number, number];
  interests: string[];
  preferences: Record<string, any>;
}

serve(async req => {
  try {
    const { userId, maxDistance, ageRange, interests, preferences }: MatchingRequest =
      await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user location
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('location, birth_date')
      .eq('user_id', userId)
      .single();

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Geographic location query
    const { data: nearbyUsers } = await supabase.rpc('find_nearby_users', {
      user_location: userProfile.location,
      max_distance: maxDistance * 1000, // Convert to meters
      exclude_user_id: userId,
      min_age: ageRange[0],
      max_age: ageRange[1],
    });

    // Calculate match scores
    const matches = await Promise.all(
      nearbyUsers.map(async (candidate: any) => {
        const score = await calculateMatchScore(
          {
            interests,
            preferences,
            userAge: calculateAge(userProfile.birth_date),
          },
          candidate
        );

        return {
          userId: candidate.user_id,
          score,
          distance: candidate.distance_meters,
          profile: candidate,
        };
      })
    );

    // Sort and return top 20 matches
    const topMatches = matches
      .filter(match => match.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return new Response(JSON.stringify({ matches: topMatches }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Match score calculation
async function calculateMatchScore(user: any, candidate: any): Promise<number> {
  let score = 0;
  let totalWeight = 0;

  // Age compatibility (weight: 0.2)
  const ageWeight = 0.2;
  const ageScore = calculateAgeCompatibility(user.userAge, candidate.age);
  score += ageScore * ageWeight;
  totalWeight += ageWeight;

  // Interest matching (weight: 0.3)
  const interestWeight = 0.3;
  const interestScore = calculateInterestSimilarity(user.interests, candidate.interests);
  score += interestScore * interestWeight;
  totalWeight += interestWeight;

  // Lifestyle compatibility (weight: 0.25)
  const lifestyleWeight = 0.25;
  const lifestyleScore = calculateLifestyleCompatibility(user.preferences, candidate.preferences);
  score += lifestyleScore * lifestyleWeight;
  totalWeight += lifestyleWeight;

  // Activity level (weight: 0.15)
  const activityWeight = 0.15;
  const activityScore = calculateActivityScore(candidate.last_active_at);
  score += activityScore * activityWeight;
  totalWeight += activityWeight;

  // Photo quality (weight: 0.1)
  const photoWeight = 0.1;
  const photoScore = calculatePhotoScore(candidate.photos);
  score += photoScore * photoWeight;
  totalWeight += photoWeight;

  return totalWeight > 0 ? score / totalWeight : 0;
}
```

#### 2.3 Real-time Chat System (2 weeks)

**Objective**: Implement real-time chat and messaging system

**Task List**:

- [ ] WebSocket connection management
- [ ] Message sending and receiving
- [ ] Media file sharing
- [ ] Message status tracking
- [ ] Push notification integration

**Chat Service**:

```typescript
// services/chat.service.ts
export class ChatService {
  private subscription: RealtimeChannel | null = null;

  async subscribeToMessages(matchId: string, onMessage: (message: Message) => void) {
    this.subscription = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        payload => {
          onMessage(payload.new as Message);
        }
      )
      .subscribe();

    return this.subscription;
  }

  async sendMessage(matchId: string, content: string, type: 'text' | 'image' | 'file' = 'text') {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        content,
        message_type: type,
      })
      .select()
      .single();

    if (error) throw error;

    // Send push notification
    await this.sendPushNotification(matchId, content);

    return data;
  }

  async sendMediaMessage(matchId: string, file: File) {
    // Upload file to MinIO
    const storageService = new StorageService();
    const mediaUrl = await storageService.uploadChatMedia(matchId, file);

    return this.sendMessage(matchId, mediaUrl, file.type.startsWith('image/') ? 'image' : 'file');
  }

  private async sendPushNotification(matchId: string, content: string) {
    // Call push notification Edge Function
    await supabase.functions.invoke('push-notification', {
      body: {
        matchId,
        type: 'message',
        content: content.substring(0, 100),
      },
    });
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}
```

### Phase 3: Frontend Application Development (6-8 weeks)

#### 3.1 React Application Architecture (2 weeks)

**Objective**: Establish React frontend application foundation

**Task List**:

- [ ] Next.js project setup
- [ ] Tailwind CSS and Shadcn UI integration
- [ ] State management (Zustand)
- [ ] Routing and navigation
- [ ] Responsive design framework

**Project Structure**:

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication related pages
│   ├── (main)/            # Main application pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── hooks/                # Custom Hooks
├── lib/                  # Utility libraries
├── services/             # API services
├── stores/               # State management
├── types/                # TypeScript types
└── utils/                # Utility functions
```

#### 3.2 User Interface Implementation (3 weeks)

**Objective**: Implement main user interfaces and interactions

**Task List**:

- [ ] Login/registration pages
- [ ] User profile setup
- [ ] Home page and card swiping
- [ ] Match list
- [ ] Chat interface

**Swipe Card Component**:

```typescript
// components/features/SwipeCard.tsx
import { useState, useRef } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, X } from 'lucide-react'

interface SwipeCardProps {
  profile: UserProfile
  onSwipe: (direction: 'left' | 'right') => void
}

export function SwipeCard({ profile, onSwipe }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100

    if (info.offset.x > threshold) {
      setExitX(1000)
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      setExitX(-1000)
      onSwipe('left')
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full w-full overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-full">
            <img
              src={profile.photos[0]}
              alt={profile.displayName}
              className="h-full w-full object-cover"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <h3 className="text-2xl font-bold">
                {profile.displayName}, {calculateAge(profile.birthDate)}
              </h3>
              <p className="text-sm opacity-90">{profile.bio}</p>
            </div>

            <div className="absolute bottom-6 right-6 flex gap-4">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full bg-white/20 backdrop-blur-sm"
                onClick={() => onSwipe('left')}
              >
                <X className="h-6 w-6" />
              </Button>
              <Button
                size="lg"
                className="rounded-full bg-red-500 hover:bg-red-600"
                onClick={() => onSwipe('right')}
              >
                <Heart className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

#### 3.3 Mobile Optimization (1 week)

**Objective**: Optimize mobile experience and performance

**Task List**:

- [ ] Touch gesture optimization
- [ ] Performance optimization
- [ ] PWA configuration
- [ ] Offline support
- [ ] Push notifications

### Phase 4: Testing & Optimization (4-6 weeks)

#### 4.1 Automated Testing (2 weeks)

**Objective**: Establish comprehensive test coverage

**Task List**:

- [ ] Unit testing (Jest)
- [ ] Integration testing (Supertest)
- [ ] E2E testing (Cypress)
- [ ] Performance testing (Lighthouse)
- [ ] Security testing

**Test Configuration**:

```typescript
// __tests__/services/auth.service.test.ts
import { AuthService } from '@/services/auth.service';
import { createMockSupabaseClient } from '@/test-utils/mocks';

jest.mock('@/lib/supabase');

describe('AuthService', () => {
  let authService: AuthService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    authService = new AuthService();
  });

  describe('signUpWithEmail', () => {
    it('should create user account and profile', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        username: 'testuser',
        birthDate: '1990-01-01',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          error: null,
        }),
      });

      const result = await authService.signUpWithEmail(userData.email, userData.password, userData);

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            display_name: userData.displayName,
            birth_date: userData.birthDate,
          },
        },
      });

      expect(result.user).toBeDefined();
    });
  });
});
```

#### 4.2 Performance Optimization (2 weeks)

**Objective**: Optimize application performance and user experience

**Task List**:

- [ ] Image lazy loading and optimization
- [ ] Code splitting and lazy loading
- [ ] Cache strategy optimization
- [ ] Database query optimization
- [ ] CDN configuration

**Performance Optimization Configuration**:

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['storage.soulmatting.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
};

module.exports = nextConfig;
```

### Phase 5: Deployment & Monitoring (2-3 weeks)

#### 5.1 Production Environment Deployment (1 week)

**Objective**: Deploy to production environment

**Task List**:

- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Domain and SSL configuration
- [ ] Load balancer setup
- [ ] Backup and disaster recovery

#### 5.2 Monitoring and Logging (1 week)

**Objective**: Establish monitoring and logging system

**Task List**:

- [ ] Prometheus and Grafana setup
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] User behavior analytics
- [ ] Alert system

## Risk Management

### Technical Risks

| Risk                            | Impact | Probability | Mitigation Strategy                                         |
| ------------------------------- | ------ | ----------- | ----------------------------------------------------------- |
| Supabase service outage         | High   | Low         | Establish backup authentication system, regular backups     |
| MinIO storage failure           | Medium | Medium      | Multi-replica deployment, regular backups                   |
| Database performance bottleneck | High   | Medium      | Read-write separation, query optimization, caching strategy |
| Third-party API limitations     | Medium | Medium      | Multi-provider strategy, API rate limiting                  |

### Business Risks

| Risk                | Impact | Probability | Mitigation Strategy                                   |
| ------------------- | ------ | ----------- | ----------------------------------------------------- |
| Rapid user growth   | High   | Medium      | Auto-scaling, performance monitoring                  |
| Data privacy issues | High   | Low         | Strict privacy policy, data encryption                |
| Competitors         | Medium | High        | Differentiated features, user experience optimization |

## Resource Requirements

### Human Resources

- **Full-stack Developer**: 2-3 people
- **UI/UX Designer**: 1 person
- **DevOps Engineer**: 1 person
- **QA Tester**: 1 person
- **Project Manager**: 1 person

### Infrastructure Costs (Monthly)

| Service             | Configuration   | Cost (USD) |
| ------------------- | --------------- | ---------- |
| Supabase Pro        | 25GB Database   | $25        |
| MinIO (Self-hosted) | 3-node cluster  | $150       |
| VPS/Cloud Server    | 4 vCPU, 8GB RAM | $80        |
| CDN (Cloudflare)    | Pro Plan        | $20        |
| Monitoring Service  | Grafana Cloud   | $50        |
| **Total**           |                 | **$325**   |

## Milestones and Deliverables

### Milestone 1: Infrastructure Complete (Week 6)

- ✅ Development environment setup
- ✅ Database architecture
- ✅ Supabase configuration
- ✅ MinIO storage

### Milestone 2: Core Features Complete (Week 16)

- ✅ User authentication system
- ✅ Matching algorithm
- ✅ Real-time chat

### Milestone 3: Frontend Application Complete (Week 24)

- ✅ React application
- ✅ User interface
- ✅ Mobile optimization

### Milestone 4: Testing Complete (Week 30)

- ✅ Automated testing
- ✅ Performance optimization

### Milestone 5: Production Deployment (Week 33)

- ✅ Production environment
- ✅ Monitoring system

## Future Planning

### Phase 6: Feature Expansion (3-6 months)

- Video calling functionality
- AI chat assistant
- Advanced matching algorithms
- Social feature expansion

### Phase 7: Commercialization (6-12 months)

- Premium membership features
- Advertising system
- Data analytics platform
- Internationalization support

## Summary

This implementation roadmap provides a complete development plan for the SoulMatting project from
concept to production. Through a phased approach, we can:

1. **Reduce Risk**: Gradually validate technology choices and architectural decisions
2. **Rapid Iteration**: Get early user feedback and adjust direction
3. **Control Costs**: Adjust resource investment based on actual needs
4. **Ensure Quality**: Each phase has clear testing and acceptance criteria

The estimated MVP development cycle is **33 weeks** (approximately 8 months), with total development
costs of approximately **$50,000-80,000** (excluding labor costs).
