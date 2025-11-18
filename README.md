# Twibby - A Twitter-like Social Platform

Twibby is a modern social media platform built with Next.js and Supabase, inspired by Twitter. Connect, share, and discover on Twibby.

## Features

- 🔐 **Authentication**: Email/password and magic link authentication
- 👤 **User Profiles**: Customizable profiles with username, bio, avatar, and more
- 📝 **Tweets**: Create and share text-based posts
- ❤️ **Likes**: Like and interact with tweets
- 👥 **Follows**: Follow other users and build your network
- 🔖 **Bookmarks**: Save tweets for later
- 🔔 **Notifications**: Stay updated with real-time notifications
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Font**: Google Sarala
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up here](https://supabase.com))

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd Twibby
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings (Settings → API).

4. Set up the database:

   - Open your Supabase dashboard
   - Go to SQL Editor
   - Run the SQL script below to create the required tables

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Step 1: Create All Tables

Run the SQL script in `supabase/schema.sql` in your Supabase SQL Editor. This will create:

- `profiles` table (user profiles)
- `tweets` table (posts/tweets)
- `likes` table (tweet likes)
- `follows` table (user follow relationships)
- `bookmarks` table (saved tweets)
- Helper functions for counts and checks

You can copy the entire contents of `supabase/schema.sql` and run it in the Supabase SQL Editor.

### Step 2: Create the Profiles Table (if not using schema.sql)

If you prefer to run the profiles table separately first:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read all profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 2: Verify the Setup

1. Go to your Supabase dashboard
2. Navigate to Table Editor
3. You should see the `profiles` table
4. Check that RLS policies are enabled (Settings → API → Row Level Security)

### Step 3: Test

Try signing up a new user. The profile should be created automatically via the trigger, or manually if the trigger doesn't work.

## Troubleshooting

### Profile creation fails during signup

If you see "Profile creation error" in the console:

1. **Check if the table exists**: Go to Table Editor in Supabase
2. **Check RLS policies**: Make sure the insert policy allows users to insert their own profile
3. **Check the trigger**: The trigger should automatically create a profile, so manual creation might fail if the profile already exists
4. **Check console logs**: The improved error logging will show more details about what went wrong

### Username already exists

The username field has a UNIQUE constraint. If a username is taken, you'll need to choose a different one.

## Project Structure

```
app/
├── (app)/          # Authenticated pages (with sidebar)
│   ├── page.tsx    # Home feed
│   ├── explore/    # Explore page
│   ├── profile/    # User profile pages
│   └── ...
├── (auth)/         # Authentication pages
│   ├── login/      # Login page
│   ├── signup/     # Signup page
│   └── ...
├── components/     # Reusable components
│   ├── Button.tsx
│   ├── Dialog.tsx
│   ├── TextField.tsx
│   └── ...
└── auth/           # Auth callbacks
    └── callback/   # OAuth/magic link callback

lib/
└── supabase/       # Supabase client utilities
    ├── client.ts   # Browser client
    └── server.ts   # Server client
```

## Seeding Mock Data

After creating the database schema, you can seed it with mock data:

### Option 1: Using the TypeScript Seed Script (recommended)

This script programmatically creates mock users (defaults to 50) and tweets (defaults to 200), along with likes, follows, and bookmarks.

> ⚠️ The script requires your **Supabase service role key**. **Never commit or share this key.**

1. Ensure you have `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` available
2. The script automatically tries to read `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` or `.env`. You can also inline them when running.
3. Run the script (you can override counts with `SEED_USER_COUNT` and `SEED_TWEET_COUNT`):
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_key \
   NEXT_PUBLIC_SUPABASE_URL=your_url \
   npx tsx supabase/seed.ts
   ```
4. After the script runs you can log in with any generated account: `username@twibby.dev` / `Password123!<index>`

### Option 2: Using SQL (manual)

1. Create test users through the signup page
2. Get their user IDs from `auth.users` table
3. Update `supabase/seed.sql` with real UUIDs
4. Run the SQL in Supabase SQL Editor

## Database Schema

The database includes the following tables:

- **profiles** - User profile information
- **tweets** - Posts/tweets created by users
- **likes** - User likes on tweets
- **follows** - User follow relationships
- **bookmarks** - User bookmarked tweets

All tables have Row Level Security (RLS) enabled with appropriate policies.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Make sure to add your environment variables in Vercel's project settings.
