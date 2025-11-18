import { Suspense } from "react";
import TweetComposer from "../components/tweets/TweetComposer";
import TweetsList from "../components/tweets/TweetsList";
import { createClient } from "@/lib/supabase/server";
import { fetchTweetsWithDetails } from "@/lib/supabase/tweet-helpers";

async function getTweets() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return fetchTweetsWithDetails(supabase, user?.id, {
    limit: 50,
    orderBy: "created_at",
    ascending: false,
  });
}

async function TweetsListContent() {
  const tweets = await getTweets();

  return (
    <TweetsList
      tweets={tweets}
      emptyMessage="No tweets yet. Be the first to post!"
    />
  );
}

export default function Home() {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Home
          </h2>
        </div>
        <TweetComposer />
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
          <TweetsListContent />
        </Suspense>
      </main>
    </>
  );
}
