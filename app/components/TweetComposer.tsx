"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "./Button";

interface TweetComposerProps {
  onTweetCreated?: () => void;
}

export default function TweetComposer({ onTweetCreated }: TweetComposerProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const maxLength = 280;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length === 0) return;
    if (content.length > maxLength) return;

    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("You must be logged in to post");
        setIsLoading(false);
        return;
      }

      // Create tweet
      const { error: tweetError } = await supabase
        .from("tweets")
        .insert({
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
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
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
            <span className={content.length > maxLength * 0.9 ? "text-orange-500" : ""}>
              {content.length}
            </span>
            /{maxLength}
          </div>
          <Button
            type="submit"
            variant="fill"
            color="primary"
            rounded="full"
            disabled={content.trim().length === 0 || content.length > maxLength || isLoading}
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

