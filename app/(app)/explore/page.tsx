import { Suspense } from "react";
import Tweet from "../../components/Tweet";
import { createClient } from "@/lib/supabase/server";

async function getExploreTweets() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch all tweets (explore shows everything)
    const { data: tweets, error } = await supabase
      .from("tweets")
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles!tweets_user_id_fkey (
          id,
          username,
          name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !tweets) {
      return [];
    }

    const tweetIds = tweets.map((t) => t.id);

    const { data: likesData } = await supabase
      .from("likes")
      .select("tweet_id")
      .in("tweet_id", tweetIds);

    let userLikes: string[] = [];
    if (user) {
      const { data: userLikesData } = await supabase
        .from("likes")
        .select("tweet_id")
        .eq("user_id", user.id)
        .in("tweet_id", tweetIds);

      userLikes = userLikesData?.map((l) => l.tweet_id) || [];
    }

    const likeCounts: Record<string, number> = {};
    likesData?.forEach((like) => {
      likeCounts[like.tweet_id] = (likeCounts[like.tweet_id] || 0) + 1;
    });

    return tweets.map((tweet) => {
      const profile = tweet.profiles as any;
      return {
        id: tweet.id,
        content: tweet.content,
        author: {
          username: profile?.username || "unknown",
          name: profile?.name || "Unknown User",
          avatar: profile?.avatar_url || undefined,
        },
        createdAt: tweet.created_at,
        likes: likeCounts[tweet.id] || 0,
        isLiked: userLikes.includes(tweet.id),
      };
    });
  } catch (error) {
    console.error("Error fetching explore tweets:", error);
    return [];
  }
}

async function ExploreTweetsList() {
  const tweets = await getExploreTweets();

  if (tweets.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No tweets to explore yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      {tweets.map((tweet) => (
        <Tweet
          key={tweet.id}
          id={tweet.id}
          content={tweet.content}
          author={tweet.author}
          createdAt={tweet.createdAt}
          likes={tweet.likes}
          isLiked={tweet.isLiked}
        />
      ))}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Explore
          </h2>
        </div>
        <Suspense
          fallback={
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading tweets...
              </p>
            </div>
          }
        >
          <ExploreTweetsList />
        </Suspense>
      </main>
    </>
  );
}
