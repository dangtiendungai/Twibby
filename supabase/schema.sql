-- ============================================
-- Twibby Database Schema
-- ============================================
-- NOTE: This assumes the profiles table already exists
-- If not, run the profiles table creation from README.md first

-- ============================================
-- 1. TWEETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tweets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for tweets
CREATE INDEX IF NOT EXISTS tweets_user_id_idx ON public.tweets(user_id);
CREATE INDEX IF NOT EXISTS tweets_created_at_idx ON public.tweets(created_at DESC);

-- Enable RLS
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tweets
-- Everyone can read tweets
CREATE POLICY "Tweets are viewable by everyone"
  ON public.tweets
  FOR SELECT
  USING (true);

-- Users can insert their own tweets
CREATE POLICY "Users can insert their own tweets"
  ON public.tweets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tweets
CREATE POLICY "Users can update their own tweets"
  ON public.tweets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own tweets
CREATE POLICY "Users can delete their own tweets"
  ON public.tweets
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tweet_id UUID REFERENCES public.tweets(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, tweet_id)
);

-- Indexes for likes
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS likes_tweet_id_idx ON public.likes(tweet_id);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
-- Everyone can read likes
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes
  FOR SELECT
  USING (true);

-- Users can insert their own likes
CREATE POLICY "Users can insert their own likes"
  ON public.likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
  ON public.likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes for follows
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON public.follows(following_id);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows
-- Everyone can read follows
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows
  FOR SELECT
  USING (true);

-- Users can insert their own follows
CREATE POLICY "Users can insert their own follows"
  ON public.follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follows
CREATE POLICY "Users can delete their own follows"
  ON public.follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================
-- 4. BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tweet_id UUID REFERENCES public.tweets(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, tweet_id)
);

-- Indexes for bookmarks
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_tweet_id_idx ON public.bookmarks(tweet_id);

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookmarks
-- Users can only read their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON public.bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks"
  ON public.bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. FUNCTIONS FOR COUNTS
-- ============================================

-- Function to get tweet like count
CREATE OR REPLACE FUNCTION get_tweet_like_count(tweet_uuid UUID)
RETURNS BIGINT AS $$
  SELECT COUNT(*)::BIGINT
  FROM public.likes
  WHERE tweet_id = tweet_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to get user follower count
CREATE OR REPLACE FUNCTION get_user_follower_count(user_uuid UUID)
RETURNS BIGINT AS $$
  SELECT COUNT(*)::BIGINT
  FROM public.follows
  WHERE following_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to get user following count
CREATE OR REPLACE FUNCTION get_user_following_count(user_uuid UUID)
RETURNS BIGINT AS $$
  SELECT COUNT(*)::BIGINT
  FROM public.follows
  WHERE follower_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to check if user is following another user
CREATE OR REPLACE FUNCTION is_following(follower_uuid UUID, following_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.follows
    WHERE follower_id = follower_uuid
    AND following_id = following_uuid
  );
$$ LANGUAGE SQL STABLE;

-- Function to check if user has liked a tweet
CREATE OR REPLACE FUNCTION has_liked_tweet(user_uuid UUID, tweet_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.likes
    WHERE user_id = user_uuid
    AND tweet_id = tweet_uuid
  );
$$ LANGUAGE SQL STABLE;

-- Function to check if user has bookmarked a tweet
CREATE OR REPLACE FUNCTION has_bookmarked_tweet(user_uuid UUID, tweet_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.bookmarks
    WHERE user_id = user_uuid
    AND tweet_id = tweet_uuid
  );
$$ LANGUAGE SQL STABLE;

