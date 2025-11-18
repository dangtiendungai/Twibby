import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchProfileMap } from "./profile-helpers";

export type TweetWithDetails = {
  id: string;
  content: string;
  author: {
    username: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
  imageUrl: string | null;
  userId: string;
};

export interface FetchTweetsOptions {
  limit?: number;
  orderBy?: "created_at";
  ascending?: boolean;
  searchQuery?: string;
}

/**
 * Fetches tweets with profile and like information
 * Works with both server and client Supabase instances
 */
export async function fetchTweetsWithDetails(
  supabase: SupabaseClient,
  currentUserId: string | null | undefined,
  options: FetchTweetsOptions = {}
): Promise<TweetWithDetails[]> {
  const {
    limit = 50,
    orderBy = "created_at",
    ascending = false,
    searchQuery,
  } = options;

  try {
    // Build the query
    let query = supabase
      .from("tweets")
      .select("id, content, created_at, user_id, image_url")
      .order(orderBy, { ascending })
      .limit(limit);

    // Add search filter if provided
    if (searchQuery) {
      query = query.ilike("content", `%${searchQuery}%`);
    }

    const { data: tweets, error } = await query;

    if (error || !tweets) {
      console.error("Error fetching tweets:", error);
      return [];
    }

    if (tweets.length === 0) {
      return [];
    }

    // Fetch profiles for all tweet authors
    const profileMap = await fetchProfileMap(
      supabase,
      tweets.map((t) => t.user_id)
    );

    // Get like counts and user's likes
    const tweetIds = tweets.map((t) => t.id);

    // Get all likes for these tweets
    const { data: likesData } = await supabase
      .from("likes")
      .select("tweet_id")
      .in("tweet_id", tweetIds);

    // Get current user's likes if logged in
    let userLikes: string[] = [];
    if (currentUserId) {
      const { data: userLikesData } = await supabase
        .from("likes")
        .select("tweet_id")
        .eq("user_id", currentUserId)
        .in("tweet_id", tweetIds);

      userLikes = userLikesData?.map((l) => l.tweet_id) || [];
    }

    // Count likes per tweet
    const likeCounts: Record<string, number> = {};
    likesData?.forEach((like) => {
      likeCounts[like.tweet_id] = (likeCounts[like.tweet_id] || 0) + 1;
    });

    // Format tweets with all details
    return tweets.map((tweet) => {
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
        userId: tweet.user_id,
      };
    });
  } catch (error) {
    console.error("Error fetching tweets with details:", error);
    return [];
  }
}

