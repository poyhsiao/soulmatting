-- Create databases for different environments
CREATE DATABASE soulmatting_dev;
CREATE DATABASE soulmatting_test;
CREATE DATABASE soulmatting_prod;

-- Create schemas for microservices
\c soulmatting_dev;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS matches;
CREATE SCHEMA IF NOT EXISTS communication;
CREATE SCHEMA IF NOT EXISTS media;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS search;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create roles for microservices
CREATE ROLE auth_service WITH LOGIN PASSWORD 'auth_password';
CREATE ROLE user_service WITH LOGIN PASSWORD 'user_password';
CREATE ROLE match_service WITH LOGIN PASSWORD 'match_password';
CREATE ROLE communication_service WITH LOGIN PASSWORD 'communication_password';
CREATE ROLE media_service WITH LOGIN PASSWORD 'media_password';
CREATE ROLE notification_service WITH LOGIN PASSWORD 'notification_password';
CREATE ROLE search_service WITH LOGIN PASSWORD 'search_password';
CREATE ROLE analytics_service WITH LOGIN PASSWORD 'analytics_password';

-- Grant schema permissions
GRANT ALL PRIVILEGES ON SCHEMA auth TO auth_service;
GRANT ALL PRIVILEGES ON SCHEMA users TO user_service;
GRANT ALL PRIVILEGES ON SCHEMA matches TO match_service;
GRANT ALL PRIVILEGES ON SCHEMA communication TO communication_service;
GRANT ALL PRIVILEGES ON SCHEMA media TO media_service;
GRANT ALL PRIVILEGES ON SCHEMA notifications TO notification_service;
GRANT ALL PRIVILEGES ON SCHEMA search TO search_service;
GRANT ALL PRIVILEGES ON SCHEMA analytics TO analytics_service;

-- Grant cross-service read permissions where needed
GRANT USAGE ON SCHEMA users TO match_service, communication_service, notification_service;
GRANT SELECT ON ALL TABLES IN SCHEMA users TO match_service, communication_service, notification_service;
GRANT USAGE ON SCHEMA auth TO user_service, match_service, communication_service;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO user_service, match_service, communication_service;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO auth_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA users GRANT ALL ON TABLES TO user_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA matches GRANT ALL ON TABLES TO match_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA communication GRANT ALL ON TABLES TO communication_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA media GRANT ALL ON TABLES TO media_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA notifications GRANT ALL ON TABLES TO notification_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA search GRANT ALL ON TABLES TO search_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT ALL ON TABLES TO analytics_service;

-- Repeat for test database
\c soulmatting_test;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS matches;
CREATE SCHEMA IF NOT EXISTS communication;
CREATE SCHEMA IF NOT EXISTS media;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS search;
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Repeat for production database
\c soulmatting_prod;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS matches;
CREATE SCHEMA IF NOT EXISTS communication;
CREATE SCHEMA IF NOT EXISTS media;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS search;
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";