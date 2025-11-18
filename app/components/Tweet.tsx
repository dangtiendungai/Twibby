"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";

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
  likes,
  isLiked = false,
  onLike,
}: TweetProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    onLike?.(id);
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
    <article className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
      <Link href={`/tweet/${id}`} className="block p-4">
        <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
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
          <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLike();
              }}
              className={`flex items-center gap-2 hover:text-red-500 transition-colors ${
                liked ? "text-red-500" : ""
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              <span className="text-sm">{likeCount}</span>
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex items-center gap-2 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">0</span>
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex items-center gap-2 hover:text-blue-500 transition-colors"
            >
              <Repeat2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      </Link>
    </article>
  );
}

