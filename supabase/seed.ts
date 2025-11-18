/**
 * Twibby Seed Script
 *
 * This script programmatically creates mock users, tweets, likes, follows,
 * and bookmarks for development/testing.
 *
 * Requirements:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (never commit this key)
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=xxx NEXT_PUBLIC_SUPABASE_URL=xxx npx tsx supabase/seed.ts
 *
 * Optional environment overrides:
 *   SEED_USER_COUNT (default 50)
 *   SEED_TWEET_COUNT (default 200)
 */

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { existsSync, readFileSync } from "fs";

// ============================================
// CONFIGURATION
// ============================================

function loadEnvFiles() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    if (!existsSync(file)) continue;
    const contents = readFileSync(file, "utf8");

    contents.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) return;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      if (!key || process.env[key]) return;

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    });
  }
}

loadEnvFiles();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const USER_COUNT = Number(process.env.SEED_USER_COUNT || 50);
const TWEET_COUNT = Number(process.env.SEED_TWEET_COUNT || 200);
const MAX_FOLLOWS_PER_USER = 15;
const MAX_LIKES_PER_USER = 40;
const MAX_BOOKMARKS_PER_USER = 10;

// ============================================
// MOCK DATA POOLS
// ============================================
const firstNames = [
  "Alex",
  "Sam",
  "Jordan",
  "Taylor",
  "Charlie",
  "Morgan",
  "Jamie",
  "Dana",
  "Casey",
  "Riley",
  "Cameron",
  "Quinn",
  "Avery",
  "Elliot",
  "Parker",
  "Rowan",
  "Skyler",
  "Hayden",
  "Reese",
  "Phoenix",
];

const lastNames = [
  "Stone",
  "Rivera",
  "Nguyen",
  "Patel",
  "Garcia",
  "Khan",
  "O'Connor",
  "Miller",
  "Brown",
  "Kim",
  "Lopez",
  "Adams",
  "Singh",
  "Ali",
  "Chen",
  "Liu",
  "Scott",
  "Brooks",
  "Diaz",
  "Becker",
];

const taglines = [
  "Building cool things on the internet.",
  "Coffee-fueled creative.",
  "Designing for humans, coding for fun.",
  "Documenting my startup journey.",
  "Tech enthusiast and avid reader.",
  "Sharing ideas, one tweet at a time.",
  "Product builder focused on delightful UX.",
  "Fusing art and code daily.",
  "Helping teams ship faster.",
  "Chasing simplicity in everything.",
  "Learning in public.",
  "Making complex things simple.",
  "Fan of open source and good coffee.",
  "Words + code + curiosity.",
  "Turning sketches into pixels.",
];

const tweetIdeas = [
  "Just shipped a new feature and the dopamine hit is real.",
  "Today's win: deleted 200 lines of code by writing 20 better ones.",
  "Dark mode is not a feature, it's a lifestyle.",
  "Don't underestimate the power of a well-written README.",
  "Design is the silent ambassador of your brand.",
  "Half of programming is debugging the other half.",
  "Meetings that could have been a Loom recording: a thread.",
  "Prototyped something wild today. Can't wait to share it soon.",
  "Feedback is a gift—even when it stings a little.",
  "Learning Remix, Next, and Svelte at the same time was a choice.",
  "Tried to take a break today. Ended up building a new component.",
  "Nothing beats the feeling of closing that final PR before the weekend.",
  "If you're stuck on a problem, take a walk. Works every time.",
  "Consistency beats intensity. Keep showing up.",
  "Writing tests is like future-proofing your sanity.",
  "UI polish matters more than we admit.",
  "Big believer in building in public.",
  "The best ideas come when you're not staring at the screen.",
  "Small improvements compound over time.",
  "Today I realized: simple > clever.",
];

const tweetAdditions = [
  " 🚀",
  " 💡",
  " ☕",
  " 🔁",
  " ✨",
  " 🤔",
  " 💭",
  " 🧠",
  " 🎯",
  " 💬",
  "",
  "",
  "",
];

// ============================================
// HELPERS
// ============================================
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

type SupabaseUser = {
  id: string;
  username: string;
  name: string;
  email: string;
};

function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function slugify(str: string, maxLength = 24) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, maxLength);
}

function randomPastDate(days = 30) {
  const now = Date.now();
  const offset = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000);
  return new Date(now - offset).toISOString();
}

async function getOrCreateUser(email: string, password: string, metadata: any) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

async function batchInsert(
  table: string,
  rows: Record<string, any>[],
  chunkSize = 100
) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      throw error;
    }
  }
}

// ============================================
// MAIN SEED LOGIC
// ============================================
async function seed() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing Supabase credentials!");
    console.error(
      "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  console.log("🌱 Starting seed process...\n");
  console.log(
    `Target: ${USER_COUNT} users, ${TWEET_COUNT} tweets (max ${MAX_FOLLOWS_PER_USER} follows/user)`
  );

  try {
    // ----------------------------------------
    // Create Users + Profiles
    // ----------------------------------------
    const users: SupabaseUser[] = [];
    console.log("\n👤 Creating users...");

    for (let i = 0; i < USER_COUNT; i++) {
      const first = randomFrom(firstNames);
      const last = randomFrom(lastNames);
      const uniqueSuffix = randomUUID().replace(/-/g, "").slice(0, 5);
      const base = slugify(`${first}${last}`, 16);
      const username = slugify(`${base}${uniqueSuffix}`, 24);
      const email = `${username}@twibby.dev`;
      const password = `Password123!${i}`;

      const user = await getOrCreateUser(email, password, {
        username,
        name: `${first} ${last}`,
      });

      users.push({
        id: user.id,
        username,
        name: `${first} ${last}`,
        email,
      });

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          username,
          name: `${first} ${last}`,
          bio: randomFrom(taglines),
          created_at: randomPastDate(90),
        },
        { onConflict: "id" }
      );

      if (profileError) {
        throw profileError;
      }

      console.log(`  • ${email}`);
    }

    // ----------------------------------------
    // Create Tweets
    // ----------------------------------------
    console.log("\n🐦 Creating tweets...");

    const tweetRows = Array.from({ length: TWEET_COUNT }, () => {
      const user = randomFrom(users);
      const base = randomFrom(tweetIdeas);
      const addition = randomFrom(tweetAdditions);
      const content = `${base}${addition}`.trim();
      const created_at = randomPastDate(45);

      return {
        id: randomUUID(),
        user_id: user.id,
        content,
        created_at,
        updated_at: created_at,
      };
    });

    await batchInsert("tweets", tweetRows, 100);

    const { data: insertedTweets } = await supabase
      .from("tweets")
      .select("id, user_id")
      .order("created_at", { ascending: false })
      .limit(TWEET_COUNT);

    const tweets = insertedTweets || [];
    console.log(`  • Inserted ${tweets.length} tweets`);

    // ----------------------------------------
    // Create Follows
    // ----------------------------------------
    console.log("\n👥 Creating follows...");
    const followSet = new Set<string>();
    const followRows: { follower_id: string; following_id: string }[] = [];

    for (const user of users) {
      const followTargets = new Set<string>();
      const followCount = Math.floor(Math.random() * MAX_FOLLOWS_PER_USER);

      while (followTargets.size < followCount) {
        const target = randomFrom(users);
        if (target.id === user.id) continue;
        const key = `${user.id}-${target.id}`;
        if (followSet.has(key)) continue;

        followSet.add(key);
        followTargets.add(target.id);
        followRows.push({ follower_id: user.id, following_id: target.id });
      }
    }

    if (followRows.length) {
      await batchInsert("follows", followRows, 200);
    }
    console.log(`  • Inserted ${followRows.length} follow relationships`);

    // ----------------------------------------
    // Create Likes
    // ----------------------------------------
    console.log("\n❤️ Creating likes...");
    const likePairs = new Set<string>();
    const likeRows: { user_id: string; tweet_id: string }[] = [];

    for (const user of users) {
      const likeCount = Math.floor(Math.random() * MAX_LIKES_PER_USER);
      const userTargets = new Set<string>();
      let attempts = 0;

      while (userTargets.size < likeCount && attempts < likeCount * 5) {
        attempts++;
        const tweet = randomFrom(tweets);
        const key = `${user.id}-${tweet.id}`;
        if (likePairs.has(key) || userTargets.has(tweet.id)) continue;
        userTargets.add(tweet.id);
        likePairs.add(key);
        likeRows.push({ user_id: user.id, tweet_id: tweet.id });
      }
    }

    if (likeRows.length) {
      await batchInsert("likes", likeRows, 200);
    }
    console.log(`  • Inserted ${likeRows.length} likes`);

    // ----------------------------------------
    // Create Bookmarks
    // ----------------------------------------
    console.log("\n🔖 Creating bookmarks...");
    const bookmarkPairs = new Set<string>();
    const bookmarkRows: { user_id: string; tweet_id: string }[] = [];

    for (const user of users) {
      const bookmarkCount = Math.floor(Math.random() * MAX_BOOKMARKS_PER_USER);
      let attempts = 0;
      let added = 0;

      while (added < bookmarkCount && attempts < bookmarkCount * 5) {
        attempts++;
        const tweet = randomFrom(tweets);
        const key = `${user.id}-${tweet.id}`;
        if (bookmarkPairs.has(key)) continue;
        bookmarkPairs.add(key);
        bookmarkRows.push({ user_id: user.id, tweet_id: tweet.id });
        added++;
      }
    }

    if (bookmarkRows.length) {
      await batchInsert("bookmarks", bookmarkRows, 200);
    }
    console.log(`  • Inserted ${bookmarkRows.length} bookmarks`);

    console.log("\n✅ Seed process completed successfully!");
    console.log(
      "You can now log in with any generated account (email: username@twibby.dev, password: Password123!<index>)"
    );
  } catch (error: any) {
    console.error("❌ Seed process failed:", error.message);
    process.exit(1);
  }
}

seed();
