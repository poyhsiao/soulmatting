# SoulMatting System Architecture Design

## Overview

This document provides a detailed description of the SoulMatting system architecture design based on PostgreSQL + Supabase + MinIO, including data flow, security, scalability, and deployment strategies.

## Overall Architecture

### Architecture Layers

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web App - React]
        B[Mobile App - React Native]
        C[Admin Panel - React]
    end
    
    subgraph "CDN & Load Balancer"
        D[Cloudflare/Nginx]
    end
    
    subgraph "API Gateway Layer"
        E[Supabase API Gateway]
        F[Rate Limiting]
        G[Authentication]
    end
    
    subgraph "Application Layer"
        H[Supabase Auth Service]
        I[Supabase Realtime]
        J[Edge Functions]
        K[Background Jobs]
    end
    
    subgraph "Data Layer"
        L[PostgreSQL Primary]
        M[PostgreSQL Replica]
        N[Redis Cache]
        O[MinIO Cluster]
    end
    
    subgraph "External Services"
        P[Push Notifications]
        Q[Email Service]
        R[SMS Gateway]
        S[Payment Gateway]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    G --> I
    G --> J
    J --> K
    J --> L
    J --> M
    J --> N
    J --> O
    J --> P
    J --> Q
    J --> R
    J --> S
```

## Core Component Design

### 1. Authentication and Authorization System

#### Supabase Auth Configuration
```typescript
// supabase-auth-config.ts
export const authConfig = {
  providers: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    facebook: {
      enabled: true,
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    },
    apple: {
      enabled: true,
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET
    }
  },
  jwt: {
    expiryLimit: 3600, // 1 hour
    secret: process.env.JWT_SECRET
  },
  session: {
    timebox: 86400 // 24 hours
  }
};
```

#### Permission Control (RLS)
```sql
-- Row Level Security policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Match record permissions
CREATE POLICY "Users can view their matches" ON matches
  FOR SELECT USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Chat message permissions
CREATE POLICY "Users can view chat messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE match_id = messages.match_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );
```

### 2. Database Design

#### Core Table Structure
```sql
-- User profile table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  birth_date DATE,
  gender VARCHAR(20),
  location POINT, -- PostGIS 地理位置
  preferences JSONB, -- 偏好設定
  photos TEXT[], -- MinIO 中的照片 URL
  verification_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match records table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(user_id),
  user2_id UUID REFERENCES profiles(user_id),
  match_score DECIMAL(3,2), -- 匹配分數 0.00-1.00
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user1_id, user2_id)
);

-- Chat messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(user_id),
  content TEXT,
  message_type VARCHAR(20) DEFAULT 'text', -- text, image, file
  media_url TEXT, -- MinIO 中的媒體文件 URL
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User activities table
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  activity_type VARCHAR(50), -- login, logout, swipe, message
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index optimization
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);
CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_messages_match ON messages(match_id, created_at);
CREATE INDEX idx_activities_user_time ON user_activities(user_id, created_at);
```

### 3. MinIO Storage Architecture

#### Bucket Design
```bash
# Bucket structure
soulmatting-dev/
├── avatars/           # User avatars
├── photos/           # User photos
├── chat-media/       # Chat media files
├── documents/        # Identity verification documents
└── temp/            # Temporary files

soulmatting-prod/
├── avatars/
├── photos/
├── chat-media/
├── documents/
└── temp/
```

#### MinIO Configuration
```yaml
# minio-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: minio-config
data:
  MINIO_ROOT_USER: "admin"
  MINIO_ROOT_PASSWORD: "your-secure-password"
  MINIO_REGION: "us-east-1"
  MINIO_BROWSER: "on"
  MINIO_DOMAIN: "storage.soulmatting.com"
  MINIO_SERVER_URL: "https://storage.soulmatting.com"
  # Storage class configuration
  MINIO_STORAGE_CLASS_STANDARD: "EC:4"  # 標準存儲
  MINIO_STORAGE_CLASS_RRS: "EC:2"       # 降低冗餘存儲
```

#### File Upload Strategy
```typescript
// file-upload-service.ts
export class FileUploadService {
  private minioClient: Minio.Client;
  
  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT!,
      port: parseInt(process.env.MINIO_PORT!),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!
    });
  }
  
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileName = `avatars/${userId}/${Date.now()}-${file.name}`;
    const bucketName = process.env.MINIO_BUCKET!;
    
    // Image compression and format conversion
    const processedFile = await this.processImage(file, {
      width: 400,
      height: 400,
      format: 'webp',
      quality: 80
    });
    
    await this.minioClient.putObject(
      bucketName,
      fileName,
      processedFile,
      processedFile.size,
      {
        'Content-Type': 'image/webp',
        'Cache-Control': 'max-age=31536000', // 1 year
        'x-amz-storage-class': 'STANDARD'
      }
    );
    
    return `https://${process.env.MINIO_ENDPOINT}/${bucketName}/${fileName}`;
  }
  
  private async processImage(file: File, options: ImageProcessOptions): Promise<Buffer> {
    // Use Sharp or similar library to process images
    // Implement image compression, format conversion, size adjustment
  }
}
```

### 4. Real-time Communication Architecture

#### Supabase Realtime Configuration
```typescript
// realtime-service.ts
export class RealtimeService {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }
  
  // Subscribe to chat messages
  subscribeToMessages(matchId: string, callback: (message: Message) => void) {
    return this.supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        callback
      )
      .subscribe();
  }
  
  // Subscribe to match notifications
  subscribeToMatches(userId: string, callback: (match: Match) => void) {
    return this.supabase
      .channel(`matches:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${userId},user2_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
  
  // Send message
  async sendMessage(matchId: string, senderId: string, content: string, type: string = 'text') {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        content,
        message_type: type
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}
```

### 5. Edge Functions Architecture

#### Matching Algorithm Edge Function
```typescript
// edge-functions/matching-algorithm.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface MatchingRequest {
  userId: string;
  preferences: UserPreferences;
  location: [number, number];
}

serve(async (req) => {
  try {
    const { userId, preferences, location }: MatchingRequest = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Geographic location query (using PostGIS)
    const { data: nearbyUsers } = await supabase.rpc('find_nearby_users', {
      user_location: `POINT(${location[0]} ${location[1]})`,
      max_distance: preferences.maxDistance || 50000, // 50km
      exclude_user_id: userId
    });
    
    // Calculate match scores
    const matches = await Promise.all(
      nearbyUsers.map(async (user: any) => {
        const score = await calculateMatchScore(preferences, user);
        return {
          userId: user.user_id,
          score,
          profile: user
        };
      })
    );
    
    // Sort and return top 10 matches
    const topMatches = matches
      .filter(match => match.score > 0.6) // Minimum match score
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    return new Response(JSON.stringify({ matches: topMatches }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Match score calculation function
async function calculateMatchScore(userPrefs: UserPreferences, candidate: any): Promise<number> {
  let score = 0;
  
  // Age matching (weight: 0.2)
  const ageScore = calculateAgeCompatibility(userPrefs.ageRange, candidate.age);
  score += ageScore * 0.2;
  
  // Interest matching (weight: 0.3)
  const interestScore = calculateInterestCompatibility(userPrefs.interests, candidate.interests);
  score += interestScore * 0.3;
  
  // Values matching (weight: 0.3)
  const valueScore = calculateValueCompatibility(userPrefs.values, candidate.values);
  score += valueScore * 0.3;
  
  // Lifestyle matching (weight: 0.2)
  const lifestyleScore = calculateLifestyleCompatibility(userPrefs.lifestyle, candidate.lifestyle);
  score += lifestyleScore * 0.2;
  
  return Math.min(score, 1.0); // Ensure score doesn't exceed 1.0
}
```

#### Push Notification Edge Function
```typescript
// edge-functions/push-notifications.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface NotificationRequest {
  userId: string;
  type: 'match' | 'message' | 'like';
  data: any;
}

serve(async (req) => {
  try {
    const { userId, type, data }: NotificationRequest = await req.json();
    
    // Get user's push tokens
    const { data: userTokens } = await supabase
      .from('push_tokens')
      .select('token, platform')
      .eq('user_id', userId)
      .eq('active', true);
    
    if (!userTokens || userTokens.length === 0) {
      return new Response(JSON.stringify({ message: 'No active tokens found' }));
    }
    
    // Generate message based on notification type
    const notification = generateNotificationContent(type, data);
    
    // Send push notifications
    const results = await Promise.all(
      userTokens.map(tokenData => 
        sendPushNotification(tokenData.token, tokenData.platform, notification)
      )
    );
    
    return new Response(JSON.stringify({ 
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }));
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
});
```

## Security Design

### 1. Data Encryption

#### Transmission Encryption
- All API communications use HTTPS/TLS 1.3
- WebSocket connections use WSS
- MinIO uses HTTPS and TLS encryption

#### Storage Encryption
```yaml
# MinIO 加密配置
encryption:
  sse:
    kms:
      key-id: "your-kms-key-id"
    s3:
      enabled: true
  vault:
    endpoint: "https://vault.example.com"
    auth:
      type: "approle"
```

### 2. Authentication and Authorization

#### JWT Configuration
```typescript
// jwt-config.ts
export const jwtConfig = {
  algorithm: 'HS256',
  expiresIn: '1h',
  refreshExpiresIn: '7d',
  issuer: 'soulmatting.com',
  audience: 'soulmatting-app'
};
```

#### API Rate Limiting
```typescript
// rate-limiting.ts
export const rateLimitConfig = {
  // General API
  general: {
    windowMs: 15 * 60 * 1000, // 15 分鐘
    max: 100 // Maximum 100 requests
  },
  // Authentication related API
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5 // Maximum 5 login attempts
  },
  // File upload
  upload: {
    windowMs: 60 * 60 * 1000, // 1 小時
    max: 20 // Maximum 20 uploads
  }
};
```

### 3. Data Privacy Protection

#### Personal Data Anonymization
```sql
-- Data anonymization function
CREATE OR REPLACE FUNCTION anonymize_user_data(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Anonymize personal data
  UPDATE profiles SET
    username = 'deleted_user_' || EXTRACT(EPOCH FROM NOW()),
    display_name = 'Deleted User',
    bio = NULL,
    birth_date = NULL,
    location = NULL,
    photos = '{}',
    preferences = '{}'
  WHERE user_id = user_uuid;
  
  -- Anonymize chat records
  UPDATE messages SET
    content = '[Message deleted]'
  WHERE sender_id = user_uuid;
END;
$$ LANGUAGE plpgsql;
```

## Performance Optimization

### 1. Database Optimization

#### Connection Pool Configuration
```typescript
// database-config.ts
export const dbConfig = {
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100
  },
  // Read-write separation
  replicas: [
    {
      host: 'postgres-replica-1.example.com',
      port: 5432,
      database: 'soulmatting'
    },
    {
      host: 'postgres-replica-2.example.com',
      port: 5432,
      database: 'soulmatting'
    }
  ]
};
```

#### Query Optimization
```sql
-- Geographic location query optimization
CREATE OR REPLACE FUNCTION find_nearby_users(
  user_location GEOMETRY,
  max_distance INTEGER DEFAULT 50000,
  exclude_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  user_id UUID,
  username VARCHAR,
  display_name VARCHAR,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.username,
    p.display_name,
    ST_Distance(p.location, user_location) as distance_meters
  FROM profiles p
  WHERE 
    p.user_id != COALESCE(exclude_user_id, '00000000-0000-0000-0000-000000000000')
    AND ST_DWithin(p.location, user_location, max_distance)
    AND p.verification_status = 'verified'
  ORDER BY p.location <-> user_location
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;
```

### 2. Caching Strategy

#### Redis Cache Configuration
```typescript
// cache-service.ts
export class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
  }
  
  // Cache user profile
  async cacheUserProfile(userId: string, profile: UserProfile, ttl: number = 3600) {
    await this.redis.setex(`user:${userId}`, ttl, JSON.stringify(profile));
  }
  
  // Cache match results
  async cacheMatches(userId: string, matches: Match[], ttl: number = 1800) {
    await this.redis.setex(`matches:${userId}`, ttl, JSON.stringify(matches));
  }
  
  // Cache chat messages
  async cacheMessages(matchId: string, messages: Message[], ttl: number = 7200) {
    await this.redis.setex(`messages:${matchId}`, ttl, JSON.stringify(messages));
  }
}
```

### 3. CDN Configuration

#### Cloudflare Configuration
```yaml
# cloudflare-config.yaml
zones:
  - zone: soulmatting.com
    settings:
      ssl: full
      cache_level: aggressive
      browser_cache_ttl: 31536000 # 1 year for static assets
      edge_cache_ttl: 86400 # 1 day for API responses
    page_rules:
      - url: "*.soulmatting.com/api/*"
        settings:
          cache_level: bypass
      - url: "*.soulmatting.com/static/*"
        settings:
          cache_level: cache_everything
          edge_cache_ttl: 31536000
```

## Monitoring and Logging

### 1. Application Monitoring

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'supabase'
    static_configs:
      - targets: ['supabase:3000']
    metrics_path: '/metrics'
    
  - job_name: 'minio'
    static_configs:
      - targets: ['minio:9000']
    metrics_path: '/minio/v2/metrics/cluster'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
    
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "SoulMatting System Metrics",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "stat",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Active Connections"
          }
        ]
      },
      {
        "title": "MinIO Storage Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "minio_cluster_usage_total_bytes",
            "legendFormat": "Total Storage"
          }
        ]
      }
    ]
  }
}
```

### 2. Log Management

#### Structured Logging
```typescript
// logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'soulmatting-api',
    version: process.env.APP_VERSION
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage example
logger.info('User login', {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});

logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  query: 'SELECT * FROM users'
});
```

## Disaster Recovery

### 1. Backup Strategy

#### PostgreSQL Backup
```bash
#!/bin/bash
# backup-postgres.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DATABASE="soulmatting"

# Create backup directory
mkdir -p $BACKUP_DIR

# Execute backup
pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $DATABASE \
  --verbose --clean --no-owner --no-privileges \
  --format=custom \
  --file=$BACKUP_DIR/soulmatting_$DATE.backup

# Compress backup file
gzip $BACKUP_DIR/soulmatting_$DATE.backup

# Upload to MinIO
mc cp $BACKUP_DIR/soulmatting_$DATE.backup.gz \
  minio/backups/postgres/

# Clean local backups (keep 7 days)
find $BACKUP_DIR -name "*.backup.gz" -mtime +7 -delete

echo "Backup completed: soulmatting_$DATE.backup.gz"
```

#### MinIO Backup
```bash
#!/bin/bash
# backup-minio.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/minio"

# Sync to backup storage
mc mirror --overwrite minio/soulmatting-prod \
  backup-storage/soulmatting-backup-$DATE/

# Create snapshot
mc admin snapshot minio > $BACKUP_DIR/snapshot_$DATE.json

echo "MinIO backup completed: $DATE"
```

### 2. Recovery Procedures

#### Database Recovery
```bash
#!/bin/bash
# restore-postgres.sh

BACKUP_FILE=$1
DATABASE="soulmatting"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# Stop application service
systemctl stop soulmatting-api

# Restore database
pg_restore -h $POSTGRES_HOST -U $POSTGRES_USER \
  --clean --if-exists --verbose \
  --dbname=$DATABASE $BACKUP_FILE

# Rebuild indexes
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $DATABASE \
  -c "REINDEX DATABASE $DATABASE;"

# Update statistics
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $DATABASE \
  -c "ANALYZE;"

# Start application service
systemctl start soulmatting-api

echo "Database restore completed"
```

## Deployment Strategy

### 1. Containerized Deployment

#### Docker Compose Production Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: soulmatting
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - backend
    deploy:
      replicas: 1
      resources:
        limits:
          memory: 2G
          cpus: '1.0'

  postgres-replica:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: soulmatting
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_MASTER_SERVICE: postgres
    volumes:
      - postgres_replica_data:/var/lib/postgresql/data
    networks:
      - backend
    depends_on:
      - postgres

  supabase:
    image: supabase/supabase:latest
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/soulmatting
      JWT_SECRET: ${JWT_SECRET}
      ANON_KEY: ${SUPABASE_ANON_KEY}
      SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
    ports:
      - "3000:3000"
    networks:
      - frontend
      - backend
    depends_on:
      - postgres
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
          cpus: '0.5'

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
      MINIO_DOMAIN: ${MINIO_DOMAIN}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    networks:
      - frontend
      - backend
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
          cpus: '0.5'

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - backend
    deploy:
      replicas: 1
      resources:
        limits:
          memory: 512M
          cpus: '0.25'

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    networks:
      - frontend
    depends_on:
      - supabase
    deploy:
      replicas: 2

volumes:
  postgres_data:
  postgres_replica_data:
  minio_data:
  redis_data:

networks:
  frontend:
    driver: overlay
  backend:
    driver: overlay
    internal: true
```

### 2. Kubernetes Deployment

#### Kubernetes Configuration
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: soulmatting-supabase
spec:
  replicas: 3
  selector:
    matchLabels:
      app: soulmatting-supabase
  template:
    metadata:
      labels:
        app: soulmatting-supabase
    spec:
      containers:
      - name: supabase
        image: supabase/supabase:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: soulmatting-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: soulmatting-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: soulmatting-supabase-service
spec:
  selector:
    app: soulmatting-supabase
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Summary

This system architecture design provides:

1. **High Availability**: Multi-replica deployment and failover mechanisms
2. **Scalability**: Horizontal scaling support and load balancing
3. **Security**: Multi-layer security protection and data encryption
4. **Performance**: Caching strategies and database optimization
5. **Monitoring**: Comprehensive monitoring and logging systems
6. **Disaster Recovery**: Complete backup and recovery strategies

This architecture can support SoulMatting from MVP to large-scale production environment requirements and provides a clear expansion path.