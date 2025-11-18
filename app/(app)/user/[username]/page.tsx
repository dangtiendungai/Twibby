import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProfileCard from "../../../components/ProfileCard";
import Tweet from "../../../components/Tweet";
import Button from "../../../components/Button";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileMap } from "@/lib/supabase/profile-helpers";

async function getUserProfile(username: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    // Get profile by username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username.toLowerCase())
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Get follower/following counts
    const { count: followersCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profile.id);

    const { count: followingCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profile.id);

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUser) {
      const { data: followData } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUser.id)
        .eq("following_id", profile.id)
        .single();

      isFollowing = !!followData;
    }

    return {
      ...profile,
      followers: followersCount || 0,
      following: followingCount || 0,
      isOwnProfile: currentUser?.id === profile.id,
      isFollowing,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

async function getUserTweets(userId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    const { data: tweets, error } = await supabase
      .from("tweets")
      .select(
        `
        id,
        content,
        created_at,
        user_id
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !tweets) {
      return [];
    }

    const profileMap = await fetchProfileMap(
      supabase,
      tweets.map((t) => t.user_id)
    );

    const tweetIds = tweets.map((t) => t.id);

    const { data: likesData } = await supabase
      .from("likes")
      .select("tweet_id")
      .in("tweet_id", tweetIds);

    let userLikes: string[] = [];
    if (currentUser) {
      const { data: userLikesData } = await supabase
        .from("likes")
        .select("tweet_id")
        .eq("user_id", currentUser.id)
        .in("tweet_id", tweetIds);

      userLikes = userLikesData?.map((l) => l.tweet_id) || [];
    }

    const likeCounts: Record<string, number> = {};
    likesData?.forEach((like) => {
      likeCounts[like.tweet_id] = (likeCounts[like.tweet_id] || 0) + 1;
    });

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
      };
    });
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return [];
  }
}

async function UserProfileContent({ username }: { username: string }) {
  const profile = await getUserProfile(username);

  if (!profile) {
    notFound();
  }

  const tweets = await getUserTweets(profile.id);

  return (
    <>
      <ProfileCard
        username={profile.username}
        name={profile.name || ""}
        bio={profile.bio || undefined}
        avatar={profile.avatar_url || undefined}
        joinedDate={profile.created_at}
        followers={profile.followers}
        following={profile.following}
        isOwnProfile={profile.isOwnProfile}
        isFollowing={profile.isFollowing}
        userId={profile.id}
      />
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex">
          <Button
            variant="text"
            color="gray"
            rounded="none"
            className="flex-1 py-4 px-4 text-center font-semibold text-gray-900 dark:text-gray-100 border-b-2 border-blue-500"
          >
            Posts
          </Button>
          <Button
            variant="text"
            color="gray"
            rounded="none"
            className="flex-1 py-4 px-4 text-center font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            Replies
          </Button>
          <Button
            variant="text"
            color="gray"
            rounded="none"
            className="flex-1 py-4 px-4 text-center font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            Media
          </Button>
          <Button
            variant="text"
            color="gray"
            rounded="none"
            className="flex-1 py-4 px-4 text-center font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            Likes
          </Button>
        </div>
      </div>
      <div>
        {tweets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No tweets yet.</p>
          </div>
        ) : (
          tweets.map((tweet) => (
            <Tweet
              key={tweet.id}
              id={tweet.id}
              content={tweet.content}
              author={tweet.author}
              createdAt={tweet.createdAt}
              likes={tweet.likes}
              isLiked={tweet.isLiked}
            />
          ))
        )}
      </div>
    </>
  );
}

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <Suspense
          fallback={
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading profile...
              </p>
            </div>
          }
        >
          <UserProfileContent username={params.username} />
        </Suspense>
      </main>
    </>
  );
}
