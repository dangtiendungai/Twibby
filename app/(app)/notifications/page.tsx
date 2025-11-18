import { Suspense } from "react";
import Link from "next/link";
import Button from "../../components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileMap } from "@/lib/supabase/profile-helpers";

export const dynamic = "force-dynamic";

interface Notification {
  id: string;
  type: "like" | "follow";
  user: {
    username: string;
    name: string;
    avatar?: string | null;
  };
  tweet?: {
    id: string;
    content: string;
  };
  createdAt: string;
  read: boolean;
}

async function getNotifications(): Promise<Notification[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const notifications: Notification[] = [];

    // Get likes on user's tweets
    const { data: userTweets } = await supabase
      .from("tweets")
      .select("id")
      .eq("user_id", user.id);

    if (userTweets && userTweets.length > 0) {
      const tweetIds = userTweets.map((t) => t.id);

      const { data: likes } = await supabase
        .from("likes")
        .select("id, user_id, tweet_id, created_at")
        .in("tweet_id", tweetIds)
        .neq("user_id", user.id) // Exclude own likes
        .order("created_at", { ascending: false })
        .limit(50);

      if (likes) {
        const userIds = [...new Set(likes.map((l) => l.user_id))];
        const profileMap = await fetchProfileMap(supabase, userIds);

        // Get tweet details for likes
        const { data: likedTweets } = await supabase
          .from("tweets")
          .select("id, content")
          .in(
            "id",
            likes.map((l) => l.tweet_id)
          );

        const tweetMap = new Map(likedTweets?.map((t) => [t.id, t]) || []);

        for (const like of likes) {
          const profile = profileMap.get(like.user_id);
          const tweet = tweetMap.get(like.tweet_id);

          if (profile) {
            notifications.push({
              id: `like-${like.id}`,
              type: "like",
              user: {
                username: profile.username || "unknown",
                name: profile.name || "Unknown User",
                avatar: profile.avatar_url || undefined,
              },
              tweet: tweet
                ? {
                    id: tweet.id,
                    content: tweet.content,
                  }
                : undefined,
              createdAt: like.created_at,
              read: false, // We don't have a read status table yet
            });
          }
        }
      }
    }

    // Get follows (people who followed the current user)
    const { data: follows } = await supabase
      .from("follows")
      .select("id, follower_id, created_at")
      .eq("following_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (follows) {
      const followerIds = follows.map((f) => f.follower_id);
      const profileMap = await fetchProfileMap(supabase, followerIds);

      for (const follow of follows) {
        const profile = profileMap.get(follow.follower_id);

        if (profile) {
          notifications.push({
            id: `follow-${follow.id}`,
            type: "follow",
            user: {
              username: profile.username || "unknown",
              name: profile.name || "Unknown User",
              avatar: profile.avatar_url || undefined,
            },
            createdAt: follow.created_at,
            read: false,
          });
        }
      }
    }

    // Sort all notifications by date (newest first)
    notifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return notifications.slice(0, 50); // Limit to 50 most recent
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

const getNotificationIcon = (type: "like" | "follow") => {
  switch (type) {
    case "like":
      return "❤️";
    case "follow":
      return "👤";
    default:
      return "🔔";
  }
};

const getNotificationText = (notification: Notification) => {
  switch (notification.type) {
    case "like":
      return `liked your tweet`;
    case "follow":
      return `started following you`;
    default:
      return "interacted with you";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
};

async function NotificationsList() {
  const notifications = await getNotifications();

  return (
    <>
      {notifications.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No notifications yet
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={
                notification.tweet
                  ? `/tweet/${notification.tweet.id}`
                  : `/user/${notification.user.username}`
              }
              className={`block border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
              }`}
            >
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                  {notification.user.avatar ? (
                    <img
                      src={notification.user.avatar}
                      alt={notification.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold">
                      {notification.user.name
                        ? notification.user.name[0].toUpperCase()
                        : "U"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {notification.user.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      @{notification.user.username}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">·</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {getNotificationText(notification)}
                    </p>
                  </div>
                  {notification.tweet && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {notification.tweet.content}
                    </p>
                  )}
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default function NotificationsPage() {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Notifications
            </h2>
            <Button variant="text" color="primary" size="sm">
              Mark all as read
            </Button>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading notifications...
              </p>
            </div>
          }
        >
          <NotificationsList />
        </Suspense>
      </main>
    </>
  );
}
