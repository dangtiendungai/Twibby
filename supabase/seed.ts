/**
 * Twibby Seed Script
 * 
 * This script creates mock users and content for development.
 * 
 * Usage:
 * 1. Make sure you have created at least one user account through the signup page
 * 2. Update the USER_EMAILS array below with your test user emails
 * 3. Run: npx tsx supabase/seed.ts
 * 
 * Or use the Supabase dashboard to run the SQL seed script manually.
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURATION
// ============================================
// Update these with your Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Update with emails of users you've created through signup
const USER_EMAILS = [
  'test1@example.com',
  'test2@example.com',
  'test3@example.com',
];

// ============================================
// MOCK DATA
// ============================================
const mockProfiles = [
  {
    username: 'johndoe',
    name: 'John Doe',
    bio: 'Software developer, coffee enthusiast, and occasional writer. Building cool things one line of code at a time.',
  },
  {
    username: 'janedoe',
    name: 'Jane Doe',
    bio: 'Designer and artist. Creating beautiful things.',
  },
  {
    username: 'devmaster',
    name: 'Dev Master',
    bio: 'Full-stack developer. Teaching code one tweet at a time.',
  },
];

const mockTweets = [
  {
    content: 'Just launched my new project! Excited to share it with everyone. 🚀',
    minutesAgo: 30,
  },
  {
    content: 'Beautiful sunset today! Sometimes you just need to stop and appreciate the little things in life. 🌅',
    hoursAgo: 2,
  },
  {
    content: 'Working on something exciting. Can\'t wait to reveal it! Stay tuned. 💫',
    hoursAgo: 5,
  },
  {
    content: 'Coffee and code. The perfect combination. ☕💻',
    daysAgo: 1,
  },
  {
    content: 'New design system is coming together nicely. Excited to share it soon! 🎨',
    daysAgo: 2,
  },
];

// ============================================
// SEED FUNCTION
// ============================================
async function seed() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials!');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('🌱 Starting seed process...\n');

  try {
    // Get user IDs from emails
    const userIds: string[] = [];
    for (const email of USER_EMAILS) {
      const { data: users, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;

      const user = users.users.find((u) => u.email === email);
      if (user) {
        userIds.push(user.id);
        console.log(`✓ Found user: ${email} (${user.id})`);
      } else {
        console.warn(`⚠ User not found: ${email}`);
      }
    }

    if (userIds.length === 0) {
      console.error('❌ No users found! Please create at least one user through signup first.');
      process.exit(1);
    }

    // Update profiles
    console.log('\n📝 Updating profiles...');
    for (let i = 0; i < userIds.length && i < mockProfiles.length; i++) {
      const { error } = await supabase
        .from('profiles')
        .update(mockProfiles[i])
        .eq('id', userIds[i]);

      if (error) {
        console.error(`❌ Error updating profile for user ${userIds[i]}:`, error.message);
      } else {
        console.log(`✓ Updated profile: ${mockProfiles[i].username}`);
      }
    }

    // Create tweets
    console.log('\n🐦 Creating tweets...');
    const tweetIds: string[] = [];
    for (let i = 0; i < mockTweets.length; i++) {
      const tweet = mockTweets[i];
      const userId = userIds[i % userIds.length];
      
      const createdAt = new Date();
      if (tweet.minutesAgo) {
        createdAt.setMinutes(createdAt.getMinutes() - tweet.minutesAgo);
      } else if (tweet.hoursAgo) {
        createdAt.setHours(createdAt.getHours() - tweet.hoursAgo);
      } else if (tweet.daysAgo) {
        createdAt.setDate(createdAt.getDate() - tweet.daysAgo);
      }

      const { data, error } = await supabase
        .from('tweets')
        .insert({
          user_id: userId,
          content: tweet.content,
          created_at: createdAt.toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error(`❌ Error creating tweet:`, error.message);
      } else {
        tweetIds.push(data.id);
        console.log(`✓ Created tweet: ${tweet.content.substring(0, 50)}...`);
      }
    }

    // Create follows
    if (userIds.length >= 2) {
      console.log('\n👥 Creating follows...');
      const { error } = await supabase
        .from('follows')
        .insert([
          { follower_id: userIds[0], following_id: userIds[1] },
          { follower_id: userIds[1], following_id: userIds[0] },
        ]);

      if (error) {
        console.error(`❌ Error creating follows:`, error.message);
      } else {
        console.log('✓ Created follow relationships');
      }
    }

    // Create likes
    if (tweetIds.length > 0 && userIds.length >= 2) {
      console.log('\n❤️ Creating likes...');
      const likes = [
        { user_id: userIds[1], tweet_id: tweetIds[0] },
        { user_id: userIds[0], tweet_id: tweetIds[2] },
      ];

      for (const like of likes) {
        const { error } = await supabase.from('likes').insert(like);
        if (error && !error.message.includes('duplicate')) {
          console.error(`❌ Error creating like:`, error.message);
        }
      }
      console.log('✓ Created likes');
    }

    // Create bookmarks
    if (tweetIds.length > 0 && userIds.length >= 1) {
      console.log('\n🔖 Creating bookmarks...');
      const bookmarks = [
        { user_id: userIds[0], tweet_id: tweetIds[1] },
      ];

      for (const bookmark of bookmarks) {
        const { error } = await supabase.from('bookmarks').insert(bookmark);
        if (error && !error.message.includes('duplicate')) {
          console.error(`❌ Error creating bookmark:`, error.message);
        }
      }
      console.log('✓ Created bookmarks');
    }

    console.log('\n✅ Seed process completed!');
  } catch (error: any) {
    console.error('❌ Seed process failed:', error.message);
    process.exit(1);
  }
}

// Run seed
seed();

