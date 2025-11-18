import { Suspense } from "react";
import { redirect } from "next/navigation";
import Tweet from "../../components/Tweet";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileMap } from "@/lib/supabase/profile-helpers";

type BookmarkTweet = {
  id: string;
  content: string;
  author: { username: string; name: string; avatar: string | undefined };
  createdAt: string;
  likes: number;
  isLiked: boolean;
  imageUrl: string | null;
};

async function getBookmarks() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    // Get bookmark entries
    const { data: bookmarks, error } = await supabase
      .from("bookmarks")
      .select(
        `
        tweet_id,
        created_at
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !bookmarks || bookmarks.length === 0) {
      return [];
    }

    const tweetIds = bookmarks.map((b) => b.tweet_id);

    const { data: tweets, error: tweetsError } = await supabase
      .from("tweets")
      .select("id, content, created_at, user_id, image_url")
      .in("id", tweetIds);

    if (tweetsError || !tweets || tweets.length === 0) {
      return [];
    }

    const tweetMap = new Map(tweets.map((tweet) => [tweet.id, tweet]));

    const profileMap = await fetchProfileMap(
      supabase,
      tweets.map((t) => t.user_id)
    );

    const { data: likesData } = await supabase
      .from("likes")
      .select("tweet_id")
      .in("tweet_id", tweetIds);

    const { data: userLikesData } = await supabase
      .from("likes")
      .select("tweet_id")
      .eq("user_id", user.id)
      .in("tweet_id", tweetIds);

    const userLikes = userLikesData?.map((l) => l.tweet_id) || [];

    const likeCounts: Record<string, number> = {};
    likesData?.forEach((like) => {
      likeCounts[like.tweet_id] = (likeCounts[like.tweet_id] || 0) + 1;
    });

    const bookmarkTweets = bookmarks
      .map((bookmark) => {
        const tweet = tweetMap.get(bookmark.tweet_id);
        if (!tweet) return null;

        const profile = profileMap.get(tweet.user_id);
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
          imageUrl: tweet.image_url,
        };
      })
      .filter((tweet): tweet is BookmarkTweet => Boolean(tweet));

    return bookmarkTweets;
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
}

async function BookmarksList() {
  const bookmarks = await getBookmarks();

  if (bookmarks.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          You haven&apos;t saved any tweets yet
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          When you bookmark tweets, they&apos;ll show up here
        </p>
      </div>
    );
  }

  return (
    <div>
      {bookmarks.map((tweet) => (
        <Tweet
          key={tweet.id}
          id={tweet.id}
          content={tweet.content}
          author={tweet.author}
          createdAt={tweet.createdAt}
          likes={tweet.likes}
          isLiked={tweet.isLiked}
          imageUrl={tweet.imageUrl}
        />
      ))}
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Bookmarks
          </h2>
        </div>
        <Suspense
          fallback={
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading bookmarks...
              </p>
            </div>
          }
        >
          <BookmarksList />
        </Suspense>
      </main>
    </>
  );
}
