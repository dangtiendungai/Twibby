"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "./Button";

interface ProfileCardProps {
  username: string;
  name: string;
  bio?: string;
  avatar?: string;
  joinedDate: string;
  followers: number;
  following: number;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
  userId?: string; // User ID of the profile being viewed
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export default function ProfileCard({
  username,
  name,
  bio,
  avatar,
  joinedDate,
  followers: initialFollowers,
  following,
  isFollowing: initialIsFollowing = false,
  isOwnProfile = false,
  userId,
  onFollow,
  onUnfollow,
}: ProfileCardProps) {
  const router = useRouter();
  const [followingState, setFollowingState] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowers);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setFollowingState(initialIsFollowing);
    setFollowersCount(initialFollowers);
  }, [initialIsFollowing, initialFollowers]);

  const handleFollowToggle = async () => {
    if (isOwnProfile || !userId || isToggling) return;

    setIsToggling(true);
    const newFollowingState = !followingState;

    // Optimistic update
    setFollowingState(newFollowingState);
    setFollowersCount((prev) => (newFollowingState ? prev + 1 : prev - 1));

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Revert optimistic update
        setFollowingState(!newFollowingState);
        setFollowersCount((prev) => (!newFollowingState ? prev + 1 : prev - 1));
        setIsToggling(false);
        return;
      }

      if (newFollowingState) {
        // Follow
        const { error } = await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: userId,
        });

        if (error) {
          // Revert optimistic update
          setFollowingState(!newFollowingState);
          setFollowersCount((prev) =>
            !newFollowingState ? prev + 1 : prev - 1
          );
          console.error("Error following user:", error);
        } else {
          onFollow?.();
        }
      } else {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);

        if (error) {
          // Revert optimistic update
          setFollowingState(!newFollowingState);
          setFollowersCount((prev) =>
            !newFollowingState ? prev + 1 : prev - 1
          );
          console.error("Error unfollowing user:", error);
        } else {
          onUnfollow?.();
        }
      }

      router.refresh();
    } catch (err) {
      // Revert optimistic update
      setFollowingState(!newFollowingState);
      setFollowersCount((prev) => (!newFollowingState ? prev + 1 : prev - 1));
      console.error("Error toggling follow:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      <div className="px-4 pb-4">
        <div className="relative -mt-16 mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 border-4 border-white dark:border-black overflow-hidden flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold">
                {name ? name[0].toUpperCase() : "U"}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">@{username}</p>
          </div>
          {!isOwnProfile && (
            <Button
              variant="fill"
              color={followingState ? "gray" : "primary"}
              rounded="full"
              onClick={handleFollowToggle}
              disabled={isToggling}
              className="font-semibold"
            >
              {followingState ? "Following" : "Follow"}
            </Button>
          )}
          {isOwnProfile && (
            <Button
              variant="outline"
              color="gray"
              rounded="full"
              className="font-semibold"
              onClick={() => router.push("/settings")}
            >
              Edit Profile
            </Button>
          )}
        </div>
        {bio && (
          <p className="text-gray-900 dark:text-gray-100 mb-4 whitespace-pre-wrap">
            {bio}
          </p>
        )}
        <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {following}
            </span>{" "}
            Following
          </span>
          <span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {followersCount}
            </span>{" "}
            Followers
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Joined {formatDate(joinedDate)}
        </p>
      </div>
    </div>
  );
}
