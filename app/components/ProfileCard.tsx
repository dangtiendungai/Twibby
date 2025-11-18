"use client";

import { useState } from "react";
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
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export default function ProfileCard({
  username,
  name,
  bio,
  avatar,
  joinedDate,
  followers,
  following,
  isFollowing = false,
  isOwnProfile = false,
  onFollow,
  onUnfollow,
}: ProfileCardProps) {
  const [followingState, setFollowingState] = useState(isFollowing);

  const handleFollowToggle = () => {
    if (followingState) {
      setFollowingState(false);
      onUnfollow?.();
    } else {
      setFollowingState(true);
      onFollow?.();
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
          <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 border-4 border-white dark:border-black"></div>
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
              {followers}
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

