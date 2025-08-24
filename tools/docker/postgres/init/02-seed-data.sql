-- PostgreSQL Seed Data Script for SoulMatting Platform
-- Version: 1.0.0
-- Created: 2024-01-20
-- Last Updated: 2024-01-20
-- Author: Kim Hsiao
-- Description: Initialize development environment with seed data

-- Insert default storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'], now(), now()),
    ('photos', 'photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'], now(), now()),
    ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], now(), now()),
    ('videos', 'videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime'], now(), now()),
    ('audio', 'audio', true, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg'], now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create development test users
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    confirmed_at
)
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@soulmatting.com',
        '$2a$10$rQvGKz5z5z5z5z5z5z5z5O', -- password: admin123
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Admin User", "avatar_url": ""}',
        true,
        now(),
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'user1@example.com',
        '$2a$10$rQvGKz5z5z5z5z5z5z5z5O', -- password: user123
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "John Doe", "avatar_url": ""}',
        false,
        now(),
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'user2@example.com',
        '$2a$10$rQvGKz5z5z5z5z5z5z5z5O', -- password: user123
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Jane Smith", "avatar_url": ""}',
        false,
        now(),
        now(),
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- Create corresponding identities for the test users
INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
VALUES 
    (
        '10000000-0000-0000-0000-000000000001',
        'admin@soulmatting.com',
        '00000000-0000-0000-0000-000000000001',
        '{"sub": "00000000-0000-0000-0000-000000000001", "email": "admin@soulmatting.com", "email_verified": true, "phone_verified": false}',
        'email',
        now(),
        now(),
        now()
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'user1@example.com',
        '00000000-0000-0000-0000-000000000002',
        '{"sub": "00000000-0000-0000-0000-000000000002", "email": "user1@example.com", "email_verified": true, "phone_verified": false}',
        'email',
        now(),
        now(),
        now()
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'user2@example.com',
        '00000000-0000-0000-0000-000000000003',
        '{"sub": "00000000-0000-0000-0000-000000000003", "email": "user2@example.com", "email_verified": true, "phone_verified": false}',
        'email',
        now(),
        now(),
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- Create a default instance
INSERT INTO auth.instances (
    id,
    uuid,
    raw_base_config,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    '{"SITE_URL": "http://localhost:3000", "JWT_SECRET": "your-super-secret-jwt-token-with-at-least-32-characters-long", "JWT_EXP": 3600}',
    now(),
    now()
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for public access to avatars and photos
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Photo images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Anyone can upload a photo" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own photos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" ON storage.objects
    FOR DELETE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create bucket policies
CREATE POLICY "Avatar bucket is publicly accessible" ON storage.buckets
    FOR SELECT USING (id = 'avatars');

CREATE POLICY "Photo bucket is publicly accessible" ON storage.buckets
    FOR SELECT USING (id = 'photos');

CREATE POLICY "Video bucket is publicly accessible" ON storage.buckets
    FOR SELECT USING (id = 'videos');

CREATE POLICY "Audio bucket is publicly accessible" ON storage.buckets
    FOR SELECT USING (id = 'audio');

CREATE POLICY "Document bucket is accessible to authenticated users" ON storage.buckets
    FOR SELECT USING (id = 'documents' AND auth.role() = 'authenticated');

-- Create helper functions for storage
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[]
LANGUAGE sql
AS $$
    SELECT string_to_array(name, '/');
$$;

CREATE OR REPLACE FUNCTION storage.filename(name text)
RETURNS text
LANGUAGE sql
AS $$
    SELECT (string_to_array(name, '/'))[array_length(string_to_array(name, '/'), 1)];
$$;

CREATE OR REPLACE FUNCTION storage.extension(name text)
RETURNS text
LANGUAGE sql
AS $$
    SELECT reverse(split_part(reverse(storage.filename(name)), '.', 1));
$$;

-- Log seed data completion
DO $$
BEGIN
    RAISE NOTICE 'Seed data initialization completed successfully';
    RAISE NOTICE 'Test users created:';
    RAISE NOTICE '  - admin@soulmatting.com (admin, password: admin123)';
    RAISE NOTICE '  - user1@example.com (user, password: user123)';
    RAISE NOTICE '  - user2@example.com (user, password: user123)';
    RAISE NOTICE 'Storage buckets created: avatars, photos, documents, videos, audio';
END
$$;