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
  "Building thoughtful products and sharing the journey.",
  "Coffee-fueled creative coder and weekend photographer.",
  "Designing for humans, coding for fun, building in public.",
  "Documenting my startup experiments and lessons learned.",
  "Tech enthusiast, avid reader, and occasional speaker.",
  "Sharing ideas, insights, and shenanigans—one tweet at a time.",
  "Product builder obsessed with delightful UX and accessibility.",
  "Fusing art, code, and curiosity to solve real problems.",
  "Helping teams ship faster with better collaboration.",
  "Chasing simplicity in everything from UI to routines.",
  "Learning in public because feedback accelerates progress.",
  "Making complex things simple and useful.",
  "Fan of open source, good coffee, and long walks.",
  "Words + code + curiosity = favorite combo.",
  "Turning sketches into pixels and ideas into products.",
];

const tweetIntros = [
  "Shipped a surprisingly big update tonight and had to jot down the highlights.",
  "Took a deep dive into the project this weekend and came away with a few lessons worth sharing.",
  "Documenting today's progress because future-me always forgets how messy the middle looked.",
  "Spending the week polishing the product and gathering feedback—here's a quick download.",
  "Slow morning, long afternoon, tons of creative breakthroughs. Writing them down before I forget.",
  "If you're curious how the build is going, here's a mini thread distilled into one post.",
  "Sharing the rollercoaster from prototype to something shippable.",
  "Did a mini retrospective on the roadmap and found a few gems worth keeping.",
  "Some scattered thoughts after pairing with customers and friends today.",
  "When the plan changes mid-sprint you either panic or take notes—guess which one I chose.",
  "Sketched an entirely new navigation concept on paper and somehow it survived contact with code.",
  "Woke up to customer feedback, spent the afternoon iterating, and ended the night with a grin.",
  "Blocking time for deep work paid off, so I'm writing a quick recap while it's fresh.",
  "Turned a plain checklist into a full story so I can remember why each piece mattered.",
  "Started the sprint overwhelmed and ended it with more clarity than expected.",
  "Refocus day: cleaned up tech debt, reorganized the repo, and wrote down the reasoning.",
  "Spontaneous hack session with friends yielded more than a week of solo work lately.",
  "Treated the day like a design studio critique and collected the sharpest insights.",
  "Spent the morning automating operations tasks I usually avoid talking about.",
  "Today was less about shipping and more about learning—here's what stuck.",
];

const tweetDetails = [
  "Refined the onboarding flow, added contextual hints, and finally killed the awkward loading state that haunted me all month. The best part is how the new timeline keeps people engaged without making them feel rushed, something I'd been struggling to balance for weeks.",
  "Realized most friction came from unclear copy, so I rewrote the empty states, added progressive disclosure, and the whole thing suddenly feels human. I even recorded quick Looms to embed in tooltips so folks get a glimpse of the reasoning behind each step.",
  "Spent way too long tweaking animations, but the micro-moments now guide attention instead of distracting from the task. Pausing to watch someone use the product in real time reminded me why motion design is worth the time investment.",
  "Wired up Supabase row-level security, added audit logging, and sprinkled in better error boundaries for the front end. Now I can ship faster without that nagging feeling that I'm one sloppy query away from a support nightmare.",
  "Mapped the entire journey from click to conversion and trimmed three redundant steps; the result already feels calmer. The data showed a 27% drop-off in the old flow, so I'm hopeful this cleans up a bunch of confusing metrics too.",
  "Blocked two hours for deep work, turned off Slack, and actually finished the advanced search filters everyone kept requesting. Built it so queries feel natural language friendly, which meant thinking way more about synonyms than I expected.",
  "Built a quick metrics dashboard to spot churn risks early; seeing real numbers was equal parts humbling and motivating. Already found a few power users whose behavior points to features I should double down on.",
  "Paired with another indie hacker and swapped notes on pricing: consensus is to launch faster, test more, worry less. Implemented a lightweight pricing experiment immediately after and the results are already interesting.",
  "I now have a library of reusable components with accessibility baked in, so shipping new views is finally fun again. Took the time to document usage guidelines, which future me will absolutely appreciate.",
  "Hooked the app up to a tiny content moderation service and added optimistic UI so responses appear instantly. Result: the experience feels lively even on spotty connections—and we catch the edge cases before users do.",
  "Introduced AI-assisted summaries for longer posts so readers get context without losing nuance. It was tricky to keep the tone consistent, but the payoff is a much friendlier first impression.",
  "Experimented with a timeline of product milestones where each step reveals an embedded video. Seeing the story unfold feels almost like a documentary, and it keeps stakeholders aligned.",
  "Rebuilt notification preferences from scratch with grouping, digest scheduling, and actual preview text. Judging by the early testers, this might be the difference between 'too noisy' and 'super useful'.",
  "Automated localized screenshots for the marketing site using Playwright—now updates take minutes instead of hours. Bonus: the translations team stopped pinging me for every small tweak.",
  "Connected the support inbox to the issue tracker so I can link conversations with fixes. Watching emails automatically attach to pull requests is the satisfying automation hit I needed.",
  "Spent extra time writing a long-form retrospective that documents not just what changed but why decisions felt risky. Turns out narrative context is the thing that makes changelogs actually readable.",
  "Shipped a multi-theme editor where users can remix the UI with a live preview. It started as an experiment and now it's a full-on selling point.",
  "Built a relational data explorer so admins can click through records without writing SQL. Added history, inline edits, and a handy diff view to keep mistakes recoverable.",
  "Designed a warm-up flow for new collaborators with bite-sized tasks and rewards. It's part education, part celebration, and it's testing well with early cohorts.",
  "Rolled out a new AI assistant that drafts replies from recent context. It doesn't replace humans, but it's perfect for nudging unblocked users toward the next step.",
];

const tweetConclusions = [
  "Moral of the story: celebrate small wins, document the weird fixes, and keep momentum rolling. 🚀",
  "Still lots to shape, but the product finally feels like it's growing up. Back to it tomorrow.",
  "Progress isn't linear, but it's incredibly satisfying when all the puzzle pieces start clicking together.",
  "More polish to come, but for now I'm calling it a day and touching grass before the next sprint.",
  "If you're building something similar, happy to swap notes—my DMs are open.",
  "Next up: tightening performance on mobile and stress-testing the Supabase policies under load.",
  "Thanks to everyone who sent feedback; your notes directly shaped the tweaks I shipped today.",
  "Time to queue up a playlist, push the branch, and write up the changelog before the glow fades.",
  "Going to sleep proud of the tiny improvements. Tomorrow I'll probably rewrite half of it. 😅",
  "Reminder to future me: commit early, write the docs, and don't wait for perfect.",
  "Calling it for the night with a notebook full of follow-ups and a calmer head.",
  "Shipping logs like this keep me accountable—will report back after the next milestone.",
  "Curious which of these ideas will actually stick in production, but that's half the fun.",
  "Kicking off tomorrow with usability testing and maybe a celebratory pastry.",
  "Now that the plumbing is solid, I can focus on the delightful surface details again.",
  "Setting a reminder to revisit this thread in a month and audit what held up.",
  "Shipping daily keeps the energy high; sharing daily keeps the story honest.",
  "Logging off before I break something, but the momentum is real.",
  "Here's to fewer TODOs in the code comments and more learnings in public.",
  "If you made it this far, thanks for following along—time to rest up.",
];

const tweetImageUrls = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80&sig=2",
  "https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=1200&q=80&sig=3",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sig=4",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sig=5",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80&sig=6",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sig=7",
  "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sig=8",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=1200&q=80&sig=9",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=10",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504610926078-a1611febcad3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=11",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80&sig=12",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80&sig=13",
  "https://images.unsplash.com/photo-1485841890310-6a055c88698a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1452723312111-3a7d0db0e024?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=14",
  "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=15",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=16",
  "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80&sig=17",
  "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sig=18",
  "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80&sig=19",
  "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1200&q=80&sig=20",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=21",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=22",
  "https://images.unsplash.com/photo-1474433188271-d3f339f41911?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=23",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sig=24",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sig=25",
  "https://images.unsplash.com/photo-1485841890310-6a055c88698a?auto=format&fit=crop&w=1200&q=80&sig=26",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1504610926078-a1611febcad3?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80&sig=20",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sig=26",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=27",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80&sig=28",
  "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sig=29",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=30",
  "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sig=21",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=22",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80&sig=13",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80&sig=29",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1452723312111-3a7d0db0e024?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sig=30",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80&sig=30",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=31",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=23",
  "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80&sig=21",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sig=27",
  "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sig=22",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80&sig=2",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80&sig=2",
  "https://images.unsplash.com/photo-1474433188271-d3f339f41911?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80&sig=1",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=32",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=24",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80&sig=2",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=33",
  "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80&sig=22",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=34",
  "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1200&q=80&sig=2",
  "https://images.unsplash.com/photo-1506773090264-ac0b07293a64?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sig=23",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=35",
  "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80&sig=23",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=36",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80&sig=31",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=25",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80&sig=2",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80&sig=2",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=37",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sig=31",
  "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80&sig=24",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=26",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=27",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80&sig=3",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80&sig=32",
  "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80&sig=25",
  "https://images.unsplash.com/photo-1452723312111-3a7d0db0e024?auto=format&fit=crop&w=1200&q=80&sig=2",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=38",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=28",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80&sig=3",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80&sig=4",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80&sig=3",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=39",
  "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80&sig=26",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=29",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80&sig=33",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=40",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80&sig=5",
  "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80&sig=27",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80&sig=4",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=41",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=30",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80&sig=34",
  "https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80&sig=28",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80&sig=6",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80&sig=4",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=42",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sig=32",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80&sig=35",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=31",
  "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80&sig=43",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80&sig=5",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80&sig=7",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80&sig=5",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80&sig=6",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&sig=32",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80&sig=36",
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
  avatar: string;
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

function generateAvatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/png?radius=50&seed=${encodeURIComponent(
    seed
  )}`;
}

function generateTweetContent() {
  const intro = randomFrom(tweetIntros);
  const detail = randomFrom(tweetDetails);
  const conclusion = randomFrom(tweetConclusions);
  return `${intro} ${detail} ${conclusion}`.trim();
}

async function getOrCreateUser(
  email: string,
  password: string,
  metadata: Record<string, string>
) {
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
  rows: Record<string, unknown>[],
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
      const avatar = generateAvatarUrl(username);

      const user = await getOrCreateUser(email, password, {
        username,
        name: `${first} ${last}`,
      });

      users.push({
        id: user.id,
        username,
        name: `${first} ${last}`,
        email,
        avatar,
      });

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          username,
          name: `${first} ${last}`,
          avatar_url: avatar,
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

    const tweetRows = Array.from({ length: TWEET_COUNT }, (_value, index) => {
      const user = randomFrom(users);
      const content = generateTweetContent();
      const created_at = randomPastDate(45);
      const image_url =
        tweetImageUrls[index % tweetImageUrls.length] || tweetImageUrls[0];

      return {
        id: randomUUID(),
        user_id: user.id,
        content,
        image_url,
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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown seed error occurred";
    console.error("❌ Seed process failed:", message);
    process.exit(1);
  }
}

seed();
