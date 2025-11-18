import { Suspense } from "react";
import { notFound } from "next/navigation";
import Tweet from "../../../components/Tweet";
import TweetComposer from "../../../components/TweetComposer";
import { createClient } from "@/lib/supabase/server";

interface TweetPageProps {
  params: Promise<{
    id: string;
  }>;
}

type TweetWithProfile = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url: string | null;
  profiles: {
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  } | null;
};

async function getTweet(tweetId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    const { data: tweet, error } = await supabase
      .from("tweets")
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        image_url,
        profiles (
          username,
          name,
          avatar_url
        )
      `
      )
      .eq("id", tweetId)
      .single<TweetWithProfile>();

    if (error || !tweet) {
      return null;
    }

    const { count: likesCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("tweet_id", tweetId);

    let isLiked = false;
    if (currentUser) {
      const { data: userLike } = await supabase
        .from("likes")
        .select("id")
        .eq("tweet_id", tweetId)
        .eq("user_id", currentUser.id)
        .maybeSingle();
      isLiked = Boolean(userLike);
    }

    return {
      id: tweet.id,
      content: tweet.content,
      createdAt: tweet.created_at,
      likes: likesCount || 0,
      isLiked,
      imageUrl: tweet.image_url,
      author: {
        username: tweet.profiles?.username || "unknown",
        name: tweet.profiles?.name || "Unknown User",
        avatar: tweet.profiles?.avatar_url || undefined,
      },
    };
  } catch (error) {
    console.error("Error fetching tweet:", error);
    return null;
  }
}

async function TweetContent({ tweetId }: { tweetId: string }) {
  const tweet = await getTweet(tweetId);

  if (!tweet) {
    notFound();
  }

  return (
    <>
      <Tweet
        id={tweet.id}
        content={tweet.content}
        author={tweet.author}
        createdAt={tweet.createdAt}
        likes={tweet.likes}
        isLiked={tweet.isLiked}
        imageUrl={tweet.imageUrl}
      />
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <TweetComposer />
      </div>
    </>
  );
}

export default async function TweetPage({ params }: TweetPageProps) {
  const { id } = await params;

  return (
    <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Tweet
        </h2>
      </div>
      <Suspense
        fallback={
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading tweet...
            </p>
          </div>
        }
      >
        <TweetContent tweetId={id} />
      </Suspense>
    </main>
  );
}
