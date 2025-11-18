-- ============================================
-- Twibby Seed Data
-- ============================================
-- This script creates mock users and content for development
-- Run this AFTER creating the schema and AFTER creating at least one real user account

-- IMPORTANT: Before running this seed script:
-- 1. Create at least one real user account through the signup page
-- 2. Get the user_id from auth.users table
-- 3. Update the user_ids in this script with real UUIDs from your auth.users table

-- ============================================
-- STEP 1: Get your real user IDs
-- ============================================
-- Run this query first to get your user IDs:
-- SELECT id, email FROM auth.users;

-- ============================================
-- STEP 2: Update the variables below with real UUIDs
-- ============================================
-- Replace these placeholder UUIDs with real ones from your auth.users table

-- Example: If you have a user with email 'test@example.com', get their UUID and replace below
-- DO $$ 
-- DECLARE
--   user1_id UUID := 'YOUR-FIRST-USER-UUID-HERE';
--   user2_id UUID := 'YOUR-SECOND-USER-UUID-HERE';
--   user3_id UUID := 'YOUR-THIRD-USER-UUID-HERE';
-- BEGIN

-- ============================================
-- Alternative: Create seed users via Supabase Auth API
-- ============================================
-- You can also create test users programmatically using Supabase Admin API
-- Or use the Supabase dashboard to create users manually

-- ============================================
-- Seed Profiles (Update existing profiles with mock data)
-- ============================================
-- Update profiles for existing users with mock data
-- Replace 'YOUR-USER-ID' with actual user IDs

-- Example: Update first user's profile
-- UPDATE public.profiles
-- SET 
--   username = 'johndoe',
--   name = 'John Doe',
--   bio = 'Software developer, coffee enthusiast, and occasional writer. Building cool things one line of code at a time.',
--   avatar_url = NULL,
--   banner_url = NULL
-- WHERE id = 'YOUR-FIRST-USER-UUID-HERE';

-- Example: Update second user's profile
-- UPDATE public.profiles
-- SET 
--   username = 'janedoe',
--   name = 'Jane Doe',
--   bio = 'Designer and artist. Creating beautiful things.',
--   avatar_url = NULL,
--   banner_url = NULL
-- WHERE id = 'YOUR-SECOND-USER-UUID-HERE';

-- ============================================
-- Seed Tweets (Replace user_id with real UUIDs)
-- ============================================
-- INSERT INTO public.tweets (user_id, content, created_at) VALUES
--   ('YOUR-FIRST-USER-UUID-HERE', 'Just launched my new project! Excited to share it with everyone. 🚀', NOW() - INTERVAL '30 minutes'),
--   ('YOUR-FIRST-USER-UUID-HERE', 'Beautiful sunset today! Sometimes you just need to stop and appreciate the little things in life. 🌅', NOW() - INTERVAL '2 hours'),
--   ('YOUR-SECOND-USER-UUID-HERE', 'Working on something exciting. Can''t wait to reveal it! Stay tuned. 💫', NOW() - INTERVAL '5 hours'),
--   ('YOUR-FIRST-USER-UUID-HERE', 'Coffee and code. The perfect combination. ☕💻', NOW() - INTERVAL '1 day'),
--   ('YOUR-SECOND-USER-UUID-HERE', 'New design system is coming together nicely. Excited to share it soon! 🎨', NOW() - INTERVAL '2 days');

-- ============================================
-- Seed Follows (Replace UUIDs with real ones)
-- ============================================
-- INSERT INTO public.follows (follower_id, following_id, created_at) VALUES
--   ('YOUR-FIRST-USER-UUID-HERE', 'YOUR-SECOND-USER-UUID-HERE', NOW() - INTERVAL '1 week'),
--   ('YOUR-SECOND-USER-UUID-HERE', 'YOUR-FIRST-USER-UUID-HERE', NOW() - INTERVAL '5 days');

-- ============================================
-- Seed Likes (Replace UUIDs with real ones, get tweet IDs from tweets table)
-- ============================================
-- First, get tweet IDs:
-- SELECT id, content FROM public.tweets;

-- Then insert likes:
-- INSERT INTO public.likes (user_id, tweet_id, created_at) VALUES
--   ('YOUR-SECOND-USER-UUID-HERE', 'TWEET-ID-1', NOW() - INTERVAL '1 hour'),
--   ('YOUR-FIRST-USER-UUID-HERE', 'TWEET-ID-3', NOW() - INTERVAL '2 hours');

-- ============================================
-- Seed Bookmarks (Replace UUIDs with real ones)
-- ============================================
-- INSERT INTO public.bookmarks (user_id, tweet_id, created_at) VALUES
--   ('YOUR-FIRST-USER-UUID-HERE', 'TWEET-ID-2', NOW() - INTERVAL '1 day'),
--   ('YOUR-SECOND-USER-UUID-HERE', 'TWEET-ID-1', NOW() - INTERVAL '2 days');

-- ============================================
-- NOTE: For easier seeding, use the seed script in supabase/seed.ts
-- ============================================

