"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "../../../../components/ui/Button";

export const dynamic = "force-dynamic";

interface FollowingUser {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  isFollowing: boolean;
}

export default function FollowingPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<{
    id: string;
    name: string | null;
    username: string;
  } | null>(null);
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const normalizedUsername = username.toLowerCase();

        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, name")
          .eq("username", normalizedUsername)
          .maybeSingle();

        if (profileError || !profileData) {
          router.push("/");
          return;
        }

        setProfile(profileData);

        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        // Get users that this user is following
        const { data: follows, error: followsError } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", profileData.id);

        if (followsError || !follows) {
          console.error("Error fetching following:", followsError);
          setIsLoading(false);
          return;
        }

        if (follows.length === 0) {
          setIsLoading(false);
          return;
        }

        const followingIds = follows.map((f) => f.following_id);

        // Get profiles of users being followed
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, name, bio, avatar_url")
          .in("id", followingIds);

        if (profilesError || !profiles) {
          console.error("Error fetching profiles:", profilesError);
          setIsLoading(false);
          return;
        }

        // Check which ones the current user is following
        let currentUserFollowingIds: string[] = [];
        if (currentUser) {
          const { data: currentUserFollows } = await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", currentUser.id)
            .in("following_id", followingIds);

          currentUserFollowingIds =
            currentUserFollows?.map((f) => f.following_id) || [];
        }

        const followingUsers: FollowingUser[] = profiles.map((profile) => ({
          id: profile.id,
          username: profile.username,
          name: profile.name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          isFollowing: currentUserFollowingIds.includes(profile.id),
        }));

        setFollowing(followingUsers);
      } catch (error) {
        console.error("Error loading following:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [username, router]);

  const handleFollowToggle = async (
    targetUserId: string,
    currentlyFollowing: boolean
  ) => {
    if (togglingIds.has(targetUserId)) return;

    setTogglingIds((prev) => new Set(prev).add(targetUserId));

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (currentlyFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);

        if (error) throw error;

        setFollowing((prev) =>
          prev.map((u) =>
            u.id === targetUserId ? { ...u, isFollowing: false } : u
          )
        );
      } else {
        // Follow
        const { error } = await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

        if (error) throw error;

        setFollowing((prev) =>
          prev.map((u) =>
            u.id === targetUserId ? { ...u, isFollowing: true } : u
          )
        );
      }

      router.refresh();
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
          <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
            <div className="flex items-center gap-4">
              <Button
                variant="icon"
                color="gray"
                onClick={() => router.push(`/user/${username}`)}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {username}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Following
                </p>
              </div>
            </div>
          </div>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading following...
            </p>
          </div>
        </main>
      </>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="icon"
              color="gray"
              onClick={() => router.push(`/user/${username}`)}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {profile.name || profile.username}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Following
              </p>
            </div>
          </div>
        </div>

        {following.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              This user isn&apos;t following anyone yet
            </p>
          </div>
        ) : (
          <div>
            {following.map((user) => (
              <div
                key={user.id}
                className="border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/user/${user.username}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={`${user.name || user.username} avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold">
                          {(user.name || user.username)[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {user.name || user.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </p>
                      {user.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
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
                    className="font-semibold"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFollowToggle(user.id, user.isFollowing);
                    }}
                    disabled={togglingIds.has(user.id)}
                  >
                    {user.isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
