"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import Button from "./Button";

interface TweetProps {
  id: string;
  content: string;
  author: {
    username: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  onLike?: (id: string) => void;
}

export default function Tweet({
  id,
  content,
  author,
  createdAt,
  likes: initialLikes,
  isLiked: initialIsLiked = false,
  onLike,
}: TweetProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);

  // Sync with props
  useEffect(() => {
    setLiked(initialIsLiked);
    setLikeCount(initialLikes);
  }, [initialIsLiked, initialLikes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiking) return;

    setIsLiking(true);
    const newLiked = !liked;
    
    // Optimistic update
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Revert optimistic update
        setLiked(!newLiked);
        setLikeCount((prev) => (!newLiked ? prev + 1 : prev - 1));
        setIsLiking(false);
        return;
      }

      if (newLiked) {
        // Add like
        const { error } = await supabase
          .from("likes")
          .insert({
            user_id: user.id,
            tweet_id: id,
          });

        if (error) {
          // Revert optimistic update
          setLiked(!newLiked);
          setLikeCount((prev) => (!newLiked ? prev + 1 : prev - 1));
          console.error("Error liking tweet:", error);
        }
      } else {
        // Remove like
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("tweet_id", id);

        if (error) {
          // Revert optimistic update
          setLiked(!newLiked);
          setLikeCount((prev) => (!newLiked ? prev + 1 : prev - 1));
          console.error("Error unliking tweet:", error);
        }
      }

      onLike?.(id);
      router.refresh();
    } catch (err) {
      // Revert optimistic update
      setLiked(!newLiked);
      setLikeCount((prev) => (!newLiked ? prev + 1 : prev - 1));
      console.error("Error toggling like:", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleTweetClick = () => {
    router.push(`/tweet/${id}`);
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

  return (
    <article
      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
      onClick={handleTweetClick}
    >
      <div className="p-4">
        <div className="flex gap-3">
          <Link
            href={`/user/${author.username}`}
            onClick={(e) => e.stopPropagation()}
            className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 block"
          ></Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/user/${author.username}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-gray-900 dark:text-gray-100 hover:underline"
              >
                {author.name}
              </Link>
              <Link
                href={`/user/${author.username}`}
                onClick={(e) => e.stopPropagation()}
                className="text-gray-500 dark:text-gray-400 hover:underline"
              >
                @{author.username}
              </Link>
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {formatDate(createdAt)}
              </span>
            </div>
            <p className="text-gray-900 dark:text-gray-100 mb-3 whitespace-pre-wrap break-words">
              {content}
            </p>
            <div
              className="flex items-center gap-6 text-gray-500 dark:text-gray-400"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="text"
                color={liked ? "danger" : "gray"}
                size="sm"
                onClick={handleLike}
                className="gap-2 hover:text-red-500"
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                <span className="text-sm">{likeCount}</span>
              </Button>
              <Button
                variant="text"
                color="gray"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="gap-2 hover:text-blue-500"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">0</span>
              </Button>
              <Button
                variant="text"
                color="gray"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="gap-2 hover:text-blue-500"
              >
                <Repeat2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
