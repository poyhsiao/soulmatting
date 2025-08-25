-- Development seed data for SoulMatting Platform
\c soulmatting_dev;

-- Insert test users into auth schema
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'alice@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'bob@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'charlie@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'diana@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'eve@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test user profiles into users schema
INSERT INTO users.profiles (id, user_id, display_name, bio, age, gender, location, interests, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Alice Johnson', 'Love hiking and photography. Looking for someone who shares my passion for adventure!', 28, 'female', 'San Francisco, CA', ARRAY['hiking', 'photography', 'travel', 'cooking'], NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Bob Smith', 'Software engineer by day, musician by night. Always up for trying new restaurants.', 32, 'male', 'New York, NY', ARRAY['music', 'technology', 'food', 'concerts'], NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Charlie Brown', 'Yoga instructor and meditation enthusiast. Seeking mindful connections.', 26, 'non-binary', 'Los Angeles, CA', ARRAY['yoga', 'meditation', 'wellness', 'reading'], NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Diana Prince', 'Art curator with a love for contemporary pieces. Weekend warrior on the tennis court.', 30, 'female', 'Chicago, IL', ARRAY['art', 'tennis', 'museums', 'wine'], NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Eve Wilson', 'Marine biologist passionate about ocean conservation. Scuba diving enthusiast.', 29, 'female', 'Miami, FL', ARRAY['marine-biology', 'scuba-diving', 'conservation', 'beach'], NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test matches into matches schema
INSERT INTO matches.user_matches (id, user_id, matched_user_id, match_score, status, created_at, updated_at) VALUES
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 85.5, 'pending', NOW(), NOW()),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 78.2, 'matched', NOW(), NOW()),
(uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 92.1, 'matched', NOW(), NOW()),
(uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 76.8, 'pending', NOW(), NOW()),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 88.9, 'matched', NOW(), NOW());

-- Insert test conversations into communication schema
INSERT INTO communication.conversations (id, participant_ids, created_at, updated_at) VALUES
(uuid_generate_v4(), ARRAY['11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333'], NOW(), NOW()),
(uuid_generate_v4(), ARRAY['22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444'], NOW(), NOW()),
(uuid_generate_v4(), ARRAY['44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555'], NOW(), NOW());

-- Insert test messages into communication schema
WITH conversation_data AS (
  SELECT id, participant_ids FROM communication.conversations LIMIT 3
)
INSERT INTO communication.messages (id, conversation_id, sender_id, content, message_type, created_at, updated_at)
SELECT 
  uuid_generate_v4(),
  c.id,
  c.participant_ids[1],
  'Hey there! I saw we matched and wanted to say hi. How''s your day going?',
  'text',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
FROM conversation_data c
UNION ALL
SELECT 
  uuid_generate_v4(),
  c.id,
  c.participant_ids[2],
  'Hi! Nice to meet you! My day has been great, thanks for asking. I love your profile photos!',
  'text',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
FROM conversation_data c
UNION ALL
SELECT 
  uuid_generate_v4(),
  c.id,
  c.participant_ids[1],
  'Thank you! I''d love to know more about your interests. Are you free for coffee sometime?',
  'text',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes'
FROM conversation_data c;

-- Insert test notifications into notifications schema
INSERT INTO notifications.user_notifications (id, user_id, type, title, message, read, created_at, updated_at) VALUES
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'new_match', 'New Match!', 'You have a new match with Charlie Brown', false, NOW(), NOW()),
(uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'new_message', 'New Message', 'Diana sent you a message', false, NOW(), NOW()),
(uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'profile_view', 'Profile View', 'Someone viewed your profile', true, NOW(), NOW()),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 'new_match', 'New Match!', 'You have a new match with Eve Wilson', false, NOW(), NOW()),
(uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 'system', 'Welcome!', 'Welcome to SoulMatting! Complete your profile to get better matches.', true, NOW(), NOW());

-- Insert test media files into media schema
INSERT INTO media.user_media (id, user_id, file_path, file_type, file_size, is_profile_photo, created_at, updated_at) VALUES
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '/uploads/users/alice/profile_1.jpg', 'image/jpeg', 2048576, true, NOW(), NOW()),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '/uploads/users/alice/photo_2.jpg', 'image/jpeg', 1536000, false, NOW(), NOW()),
(uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', '/uploads/users/bob/profile_1.jpg', 'image/jpeg', 1843200, true, NOW(), NOW()),
(uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', '/uploads/users/charlie/profile_1.jpg', 'image/jpeg', 2304000, true, NOW(), NOW()),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', '/uploads/users/diana/profile_1.jpg', 'image/jpeg', 1920000, true, NOW(), NOW()),
(uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', '/uploads/users/eve/profile_1.jpg', 'image/jpeg', 2560000, true, NOW(), NOW());

-- Create indexes for better performance in development
CREATE INDEX IF NOT EXISTS idx_profiles_location ON users.profiles USING gin(location gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON users.profiles USING gin(interests);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches.user_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches.user_matches(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON communication.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON communication.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications.user_notifications(read);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media.user_media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_profile_photo ON media.user_media(is_profile_photo) WHERE is_profile_photo = true;

-- Insert sample analytics data
INSERT INTO analytics.user_events (id, user_id, event_type, event_data, created_at) VALUES
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'profile_view', '{"viewed_user_id": "22222222-2222-2222-2222-222222222222"}', NOW() - INTERVAL '1 day'),
(uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'swipe_right', '{"target_user_id": "11111111-1111-1111-1111-111111111111"}', NOW() - INTERVAL '1 day'),
(uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'message_sent', '{"conversation_id": "conversation_id_placeholder"}', NOW() - INTERVAL '2 hours'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 'profile_update', '{"fields_updated": ["bio", "interests"]}', NOW() - INTERVAL '3 days'),
(uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 'login', '{"device": "mobile", "location": "Miami, FL"}', NOW() - INTERVAL '1 hour');

COMMIT;