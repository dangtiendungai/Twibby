"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Tweet from "../../components/Tweet";
import Button from "../../components/Button";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SearchUser {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  isFollowing?: boolean;
}

interface SearchTweet {
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
}

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "top" | "latest" | "people" | "media"
  >("top");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [tweets, setTweets] = useState<SearchTweet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setUsers([]);
      setTweets([]);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (activeTab === "people") {
          // Search users
          const { data: profiles, error } = await supabase
            .from("profiles")
            .select("id, username, name, bio, avatar_url")
            .or(
              `username.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`
            )
            .limit(20);

          if (error) {
            console.error("Error searching users:", error);
            setUsers([]);
          } else {
            // Check if current user is following each user
            if (currentUser && profiles) {
              const userIds = profiles.map((p) => p.id);
              const { data: followsData } = await supabase
                .from("follows")
                .select("following_id")
                .eq("follower_id", currentUser.id)
                .in("following_id", userIds);

              const followingIds = new Set(
                followsData?.map((f) => f.following_id) || []
              );

              setUsers(
                profiles.map((profile) => ({
                  ...profile,
                  isFollowing: followingIds.has(profile.id),
                }))
              );
            } else {
              setUsers(profiles || []);
            }
          }
        } else {
          // Search tweets
          const { data: tweetData, error } = await supabase
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
            .ilike("content", `%${searchQuery}%`)
            .order(
              activeTab === "latest" ? "created_at" : "created_at",
              { ascending: false }
            )
            .limit(50);

          if (error) {
            console.error("Error searching tweets:", error);
            setTweets([]);
          } else if (tweetData) {
            const tweetIds = tweetData.map((t) => t.id);

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

            setTweets(
              tweetData.map((tweet) => {
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
              })
            );
          }
        }
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Twibby"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <Button
              variant="text"
              color="gray"
              rounded="none"
              onClick={() => setActiveTab("top")}
              className={`flex-1 py-3 px-4 text-center font-semibold ${
                activeTab === "top"
                  ? "text-gray-900 dark:text-gray-100 border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              Top
            </Button>
            <Button
              variant="text"
              color="gray"
              rounded="none"
              onClick={() => setActiveTab("latest")}
              className={`flex-1 py-3 px-4 text-center font-semibold ${
                activeTab === "latest"
                  ? "text-gray-900 dark:text-gray-100 border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              Latest
            </Button>
            <Button
              variant="text"
              color="gray"
              rounded="none"
              onClick={() => setActiveTab("people")}
              className={`flex-1 py-3 px-4 text-center font-semibold ${
                activeTab === "people"
                  ? "text-gray-900 dark:text-gray-100 border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              People
            </Button>
            <Button
              variant="text"
              color="gray"
              rounded="none"
              onClick={() => setActiveTab("media")}
              className={`flex-1 py-3 px-4 text-center font-semibold ${
                activeTab === "media"
                  ? "text-gray-900 dark:text-gray-100 border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              Media
            </Button>
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Searching...
              </p>
            </div>
          ) : activeTab === "people" ? (
            <div>
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/user/${user.username}`}
                        className="flex items-center gap-3 flex-1"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </p>
                          {user.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </Link>
                      <Button
                        variant="fill"
                        color={user.isFollowing ? "gray" : "primary"}
                        rounded="full"
                        size="sm"
                        className={`font-semibold ${
                          !user.isFollowing
                            ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/user/${user.username}`);
                        }}
                      >
                        {user.isFollowing ? "Following" : "Follow"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No users found
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Try searching for people, topics, or keywords
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {tweets.length > 0 ? (
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
              ) : searchQuery ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No tweets found
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Try searching for people, topics, or keywords
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
