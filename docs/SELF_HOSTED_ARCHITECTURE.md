# Self-Hosted Architecture Design for SoulMatting

## Overview

This document outlines the self-hosted architecture design for SoulMatting using PostgreSQL +
Supabase + MinIO stack deployed via Docker Compose. This approach provides complete control over
data, infrastructure, and costs while maintaining scalability and security.

## Architecture Components

### Core Services Stack

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App]
        MOBILE[Mobile App]
    end

    subgraph "Load Balancer"
        TRAEFIK[Traefik Proxy]
    end

    subgraph "Application Layer"
        SUPABASE[Supabase Stack]
        subgraph "Supabase Services"
            KONG[Kong Gateway]
            GOTRUE[GoTrue Auth]
            POSTGREST[PostgREST API]
            REALTIME[Realtime Server]
            STORAGE[Storage API]
            FUNCTIONS[Edge Functions]
            STUDIO[Supabase Studio]
        end
    end

    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis Cache)]
        MINIO[(MinIO Object Storage)]
    end

    subgraph "Monitoring"
        PROMETHEUS[Prometheus]
        GRAFANA[Grafana]
        LOKI[Loki Logs]
    end

    WEB --> TRAEFIK
    MOBILE --> TRAEFIK
    TRAEFIK --> KONG
    KONG --> GOTRUE
    KONG --> POSTGREST
    KONG --> REALTIME
    KONG --> STORAGE
    KONG --> FUNCTIONS
    KONG --> STUDIO

    POSTGREST --> POSTGRES
    GOTRUE --> POSTGRES
    REALTIME --> POSTGRES
    STORAGE --> MINIO
    FUNCTIONS --> POSTGRES

    SUPABASE --> REDIS
    SUPABASE --> PROMETHEUS
    PROMETHEUS --> GRAFANA
```

## Docker Compose Configuration

### Directory Structure

```
soulmatting/
├── docker-compose.yml
├── docker-compose.override.yml
├── .env
├── volumes/
│   ├── postgres/
│   ├── minio/
│   ├── redis/
│   ├── supabase/
│   └── monitoring/
├── config/
│   ├── traefik/
│   ├── supabase/
│   ├── postgres/
│   └── minio/
└── scripts/
    ├── init-db.sql
    ├── backup.sh
    └── restore.sh
```

### Core Services Configuration

#### 1. PostgreSQL Database

```yaml
postgres:
  image: postgres:15-alpine
  container_name: soulmatting-postgres
  environment:
    POSTGRES_DB: ${POSTGRES_DB}
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    POSTGRES_HOST_AUTH_METHOD: trust
  volumes:
    - ./volumes/postgres:/var/lib/postgresql/data
    - ./config/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
  ports:
    - '5432:5432'
  networks:
    - soulmatting-network
  restart: unless-stopped
  healthcheck:
    test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
    interval: 30s
    timeout: 10s
    retries: 3
```

#### 2. MinIO Object Storage

```yaml
minio:
  image: quay.io/minio/minio:latest
  container_name: soulmatting-minio
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: ${MINIO_ROOT_USER}
    MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    MINIO_BROWSER_REDIRECT_URL: https://minio.${DOMAIN}
  volumes:
    - ./volumes/minio:/data
  ports:
    - '9000:9000'
    - '9001:9001'
  networks:
    - soulmatting-network
  restart: unless-stopped
  healthcheck:
    test: ['CMD', 'curl', '-f', 'http://localhost:9000/minio/health/live']
    interval: 30s
    timeout: 10s
    retries: 3
```

#### 3. Redis Cache

```yaml
redis:
  image: redis:7-alpine
  container_name: soulmatting-redis
  command: redis-server --requirepass ${REDIS_PASSWORD}
  volumes:
    - ./volumes/redis:/data
  ports:
    - '6379:6379'
  networks:
    - soulmatting-network
  restart: unless-stopped
  healthcheck:
    test: ['CMD', 'redis-cli', 'ping']
    interval: 30s
    timeout: 10s
    retries: 3
```

#### 4. Supabase Stack

```yaml
# Kong Gateway
kong:
  image: kong:2.8-alpine
  container_name: soulmatting-kong
  environment:
    KONG_DATABASE: 'off'
    KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
    KONG_DNS_ORDER: LAST,A,CNAME
    KONG_PLUGINS: request-transformer,cors,key-auth,acl,basic-auth
  volumes:
    - ./config/supabase/kong.yml:/var/lib/kong/kong.yml
  ports:
    - '8000:8000'
  networks:
    - soulmatting-network
  depends_on:
    - postgres
  restart: unless-stopped

# GoTrue Auth
auth:
  image: supabase/gotrue:v2.99.0
  container_name: soulmatting-auth
  environment:
    GOTRUE_API_HOST: 0.0.0.0
    GOTRUE_API_PORT: 9999
    GOTRUE_DB_DRIVER: postgres
    GOTRUE_DB_DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?search_path=auth
    GOTRUE_SITE_URL: ${SITE_URL}
    GOTRUE_URI_ALLOW_LIST: ${ADDITIONAL_REDIRECT_URLS}
    GOTRUE_JWT_ADMIN_ROLES: service_role
    GOTRUE_JWT_AUD: authenticated
    GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
    GOTRUE_JWT_EXP: ${JWT_EXPIRY}
    GOTRUE_JWT_SECRET: ${JWT_SECRET}
    GOTRUE_DISABLE_SIGNUP: ${DISABLE_SIGNUP}
    GOTRUE_SMTP_HOST: ${SMTP_HOST}
    GOTRUE_SMTP_PORT: ${SMTP_PORT}
    GOTRUE_SMTP_USER: ${SMTP_USER}
    GOTRUE_SMTP_PASS: ${SMTP_PASS}
    GOTRUE_SMTP_ADMIN_EMAIL: ${SMTP_ADMIN_EMAIL}
  networks:
    - soulmatting-network
  depends_on:
    - postgres
  restart: unless-stopped

# PostgREST API
rest:
  image: postgrest/postgrest:v11.2.0
  container_name: soulmatting-rest
  environment:
    PGRST_DB_URI: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
    PGRST_DB_SCHEMAS: ${PGRST_DB_SCHEMAS}
    PGRST_DB_ANON_ROLE: anon
    PGRST_JWT_SECRET: ${JWT_SECRET}
    PGRST_DB_USE_LEGACY_GUCS: 'false'
  networks:
    - soulmatting-network
  depends_on:
    - postgres
  restart: unless-stopped

# Realtime Server
realtime:
  image: supabase/realtime:v2.25.35
  container_name: soulmatting-realtime
  environment:
    PORT: 4000
    DB_HOST: postgres
    DB_PORT: 5432
    DB_USER: ${POSTGRES_USER}
    DB_PASSWORD: ${POSTGRES_PASSWORD}
    DB_NAME: ${POSTGRES_DB}
    DB_AFTER_CONNECT_QUERY: 'SET search_path TO _realtime'
    DB_ENC_KEY: supabaserealtime
    API_JWT_SECRET: ${JWT_SECRET}
    FLY_ALLOC_ID: fly123
    FLY_APP_NAME: realtime
    SECRET_KEY_BASE: ${SECRET_KEY_BASE}
    ERL_AFLAGS: -proto_dist inet_tcp
    ENABLE_TAILSCALE: 'false'
    DNS_NODES: "'"
  networks:
    - soulmatting-network
  depends_on:
    - postgres
  restart: unless-stopped

# Storage API
storage:
  image: supabase/storage-api:v0.40.4
  container_name: soulmatting-storage
  environment:
    ANON_KEY: ${ANON_KEY}
    SERVICE_KEY: ${SERVICE_ROLE_KEY}
    POSTGREST_URL: http://rest:3000
    PGRST_JWT_SECRET: ${JWT_SECRET}
    DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
    FILE_SIZE_LIMIT: 52428800
    STORAGE_BACKEND: s3
    GLOBAL_S3_BUCKET: ${STORAGE_S3_BUCKET}
    REGION: ${STORAGE_S3_REGION}
    GLOBAL_S3_ENDPOINT: http://minio:9000
    GLOBAL_S3_FORCE_PATH_STYLE: 'true'
    AWS_ACCESS_KEY_ID: ${MINIO_ROOT_USER}
    AWS_SECRET_ACCESS_KEY: ${MINIO_ROOT_PASSWORD}
  networks:
    - soulmatting-network
  depends_on:
    - postgres
    - minio
    - rest
  restart: unless-stopped

# Edge Functions
functions:
  image: supabase/edge-runtime:v1.22.4
  container_name: soulmatting-functions
  environment:
    JWT_SECRET: ${JWT_SECRET}
    SUPABASE_URL: http://kong:8000
    SUPABASE_ANON_KEY: ${ANON_KEY}
    SUPABASE_SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY}
  volumes:
    - ./volumes/functions:/home/deno/functions
  networks:
    - soulmatting-network
  depends_on:
    - postgres
    - kong
  restart: unless-stopped

# Supabase Studio
studio:
  image: supabase/studio:20231123-233b56d
  container_name: soulmatting-studio
  environment:
    STUDIO_PG_META_URL: http://meta:8080
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    DEFAULT_ORGANIZATION_NAME: ${STUDIO_DEFAULT_ORGANIZATION}
    DEFAULT_PROJECT_NAME: ${STUDIO_DEFAULT_PROJECT}
    SUPABASE_URL: http://kong:8000
    SUPABASE_PUBLIC_URL: ${SUPABASE_PUBLIC_URL}
    SUPABASE_ANON_KEY: ${ANON_KEY}
    SUPABASE_SERVICE_KEY: ${SERVICE_ROLE_KEY}
  ports:
    - '3000:3000'
  networks:
    - soulmatting-network
  depends_on:
    - kong
  restart: unless-stopped
```

#### 5. Traefik Load Balancer

```yaml
traefik:
  image: traefik:v3.0
  container_name: soulmatting-traefik
  command:
    - --api.dashboard=true
    - --api.debug=true
    - --log.level=INFO
    - --providers.docker=true
    - --providers.docker.exposedbydefault=false
    - --entrypoints.web.address=:80
    - --entrypoints.websecure.address=:443
    - --certificatesresolvers.letsencrypt.acme.tlschallenge=true
    - --certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}
    - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
  ports:
    - '80:80'
    - '443:443'
    - '8080:8080'
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - ./volumes/traefik/letsencrypt:/letsencrypt
  networks:
    - soulmatting-network
  restart: unless-stopped
  labels:
    - 'traefik.enable=true'
    - 'traefik.http.routers.dashboard.rule=Host(`traefik.${DOMAIN}`)'
    - 'traefik.http.routers.dashboard.tls.certresolver=letsencrypt'
```

## Environment Configuration

### .env File Template

```bash
# Domain Configuration
DOMAIN=yourdomain.com
SITE_URL=https://app.yourdomain.com
SUPABASE_PUBLIC_URL=https://api.yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# Database Configuration
POSTGRES_DB=soulmatting
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_postgres_password
PGRST_DB_SCHEMAS=public,storage,graphql_public

# MinIO Configuration
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=your_secure_minio_password
STORAGE_S3_BUCKET=soulmatting-storage
STORAGE_S3_REGION=us-east-1

# Redis Configuration
REDIS_PASSWORD=your_secure_redis_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
JWT_EXPIRY=3600
ANON_KEY=your_anon_key_here
SERVICE_ROLE_KEY=your_service_role_key_here

# Auth Configuration
DISABLE_SIGNUP=false
ADDITIONAL_REDIRECT_URLS=https://app.yourdomain.com/**

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_ADMIN_EMAIL=admin@yourdomain.com

# Studio Configuration
STUDIO_DEFAULT_ORGANIZATION=SoulMatting
STUDIO_DEFAULT_PROJECT=Production

# Realtime Configuration
SECRET_KEY_BASE=your-secret-key-base-for-realtime
```

## Security Configuration

### 1. Network Security

```yaml
networks:
  soulmatting-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### 2. SSL/TLS Configuration

- Automatic SSL certificate generation via Let's Encrypt
- Force HTTPS redirects
- HSTS headers
- Secure cookie settings

### 3. Database Security

- Row Level Security (RLS) enabled
- Encrypted connections
- Regular automated backups
- Database user privilege separation

### 4. Object Storage Security

- MinIO access policies
- Bucket-level permissions
- Signed URL generation
- CORS configuration

## Monitoring and Logging

### Prometheus Configuration

```yaml
prometheus:
  image: prom/prometheus:latest
  container_name: soulmatting-prometheus
  volumes:
    - ./config/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    - ./volumes/prometheus:/prometheus
  ports:
    - '9090:9090'
  networks:
    - soulmatting-network
  restart: unless-stopped
```

### Grafana Configuration

```yaml
grafana:
  image: grafana/grafana:latest
  container_name: soulmatting-grafana
  environment:
    GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
  volumes:
    - ./volumes/grafana:/var/lib/grafana
    - ./config/grafana/dashboards:/etc/grafana/provisioning/dashboards
    - ./config/grafana/datasources:/etc/grafana/provisioning/datasources
  ports:
    - '3001:3000'
  networks:
    - soulmatting-network
  restart: unless-stopped
```

## Backup and Recovery

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# PostgreSQL Backup
docker exec soulmatting-postgres pg_dump -U postgres soulmatting > $BACKUP_DIR/postgres.sql

# MinIO Backup
docker exec soulmatting-minio mc mirror /data $BACKUP_DIR/minio/

# Configuration Backup
cp -r ./config $BACKUP_DIR/
cp .env $BACKUP_DIR/

# Compress backup
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

## Deployment Instructions

### 1. Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd soulmatting

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env

# Create required directories
mkdir -p volumes/{postgres,minio,redis,supabase,monitoring}
mkdir -p config/{traefik,supabase,postgres,minio}
```

### 2. Generate JWT Keys

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate anon and service role keys using Supabase CLI
npx supabase gen keys --anon --service-role --jwt-secret <your-jwt-secret>
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Initialize Database

```bash
# Run database migrations
docker exec -it soulmatting-postgres psql -U postgres -d soulmatting -f /docker-entrypoint-initdb.d/init.sql
```

### 5. Configure MinIO

```bash
# Create storage bucket
docker exec soulmatting-minio mc mb /data/soulmatting-storage

# Set bucket policy
docker exec soulmatting-minio mc policy set public /data/soulmatting-storage
```

## Performance Optimization

### 1. Database Optimization

- Connection pooling via PgBouncer
- Read replicas for scaling
- Proper indexing strategy
- Query optimization

### 2. Caching Strategy

- Redis for session storage
- Application-level caching
- CDN for static assets
- Database query caching

### 3. Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '1.0'
      memory: 2G
```

## Scaling Considerations

### Horizontal Scaling

1. **Database Scaling**
   - PostgreSQL read replicas
   - Connection pooling
   - Sharding strategies

2. **Application Scaling**
   - Multiple Supabase instances
   - Load balancer configuration
   - Session affinity

3. **Storage Scaling**
   - MinIO distributed mode
   - Multiple storage nodes
   - Erasure coding

### Vertical Scaling

- CPU and memory allocation
- Storage capacity expansion
- Network bandwidth optimization

## Maintenance and Updates

### Regular Maintenance Tasks

1. **Daily**
   - Monitor service health
   - Check disk usage
   - Review error logs

2. **Weekly**
   - Database maintenance
   - Security updates
   - Performance analysis

3. **Monthly**
   - Full system backup
   - Capacity planning
   - Security audit

### Update Strategy

```bash
# Update services
docker-compose pull
docker-compose up -d

# Rollback if needed
docker-compose down
docker-compose up -d --force-recreate
```

## Cost Analysis

### Infrastructure Costs (Self-Hosted)

| Component          | Minimum Specs             | Monthly Cost (VPS) |
| ------------------ | ------------------------- | ------------------ |
| Application Server | 4 CPU, 8GB RAM, 100GB SSD | $40-60             |
| Database Server    | 2 CPU, 4GB RAM, 200GB SSD | $25-40             |
| Storage Server     | 2 CPU, 4GB RAM, 1TB HDD   | $20-30             |
| **Total**          |                           | **$85-130**        |

### Operational Costs

- Domain and SSL: $15/year
- Monitoring tools: $0 (self-hosted)
- Backup storage: $10-20/month
- **Total Monthly**: $95-150

## Advantages of Self-Hosted Approach

1. **Cost Control**
   - Predictable monthly costs
   - No per-user or per-request charges
   - Significant savings at scale

2. **Data Sovereignty**
   - Complete control over data
   - Compliance with local regulations
   - No vendor lock-in

3. **Customization**
   - Full configuration control
   - Custom integrations
   - Tailored performance optimization

4. **Security**
   - Private infrastructure
   - Custom security policies
   - Direct access control

## Potential Challenges

1. **Operational Complexity**
   - Requires DevOps expertise
   - 24/7 monitoring needs
   - Update management

2. **Scalability Planning**
   - Manual scaling decisions
   - Capacity planning
   - Performance optimization

3. **Disaster Recovery**
   - Backup strategy implementation
   - Recovery procedures
   - High availability setup

## Conclusion

The self-hosted PostgreSQL + Supabase + MinIO architecture provides a robust, cost-effective, and
scalable solution for SoulMatting. This approach offers complete control over the infrastructure
while maintaining the developer experience benefits of modern Backend-as-a-Service platforms.

The Docker Compose setup ensures easy deployment and management, while the comprehensive monitoring
and backup strategies provide production-ready reliability. With proper implementation and
maintenance, this architecture can support SoulMatting's growth from MVP to enterprise scale.
