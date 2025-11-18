import Tweet from "./Tweet";
import type { TweetWithDetails } from "@/lib/supabase/tweet-helpers";

interface TweetsListProps {
  tweets: TweetWithDetails[];
  emptyMessage?: string;
}

export default function TweetsList({
  tweets,
  emptyMessage = "No tweets yet.",
}: TweetsListProps) {
  if (tweets.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
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
          imageUrl={tweet.imageUrl}
          userId={tweet.userId}
        />
      ))}
    </div>
  );
}

