"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "./Button";
import type { User } from "@supabase/supabase-js";

interface TweetComposerProps {
  onTweetCreated?: () => void;
}

interface Profile {
  avatar_url: string | null;
  name: string | null;
}

export default function TweetComposer({ onTweetCreated }: TweetComposerProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const maxLength = 280;

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (currentUser) {
          setUser(currentUser);

          const { data: profileData } = await supabase
            .from("profiles")
            .select("avatar_url, name")
            .eq("id", currentUser.id)
            .single();

          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    }

    loadUserProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length === 0) return;
    if (content.length > maxLength) return;

    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("You must be logged in to post");
        setIsLoading(false);
        return;
      }

      // Create tweet
      const { error: tweetError } = await supabase.from("tweets").insert({
        user_id: user.id,
        content: content.trim(),
      });

      if (tweetError) {
        console.error("Error creating tweet:", tweetError);
        setError("Failed to post tweet. Please try again.");
        setIsLoading(false);
        return;
      }

      // Success
      setContent("");
      setIsLoading(false);
      onTweetCreated?.();
      router.refresh();
    } catch (err) {
      console.error("Error creating tweet:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || "User avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold">
                {profile?.name
                  ? profile.name[0].toUpperCase()
                  : user?.email?.[0].toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError("");
              }}
              placeholder="What's happening?"
              className="w-full resize-none border-none outline-none bg-transparent text-lg placeholder-gray-500 dark:placeholder-gray-400 min-h-[100px]"
              maxLength={maxLength}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex items-center justify-between pl-16">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span
              className={
                content.length > maxLength * 0.9 ? "text-orange-500" : ""
              }
            >
              {content.length}
            </span>
            /{maxLength}
          </div>
          <Button
            type="submit"
            variant="fill"
            color="primary"
            rounded="full"
            disabled={
              content.trim().length === 0 ||
              content.length > maxLength ||
              isLoading
            }
            isLoading={isLoading}
            className="font-semibold"
          >
            Post
          </Button>
        </div>
      </form>
    </div>
  );
}
