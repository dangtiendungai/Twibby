"use client";

import { useState } from "react";

export default function TweetComposer() {
  const [content, setContent] = useState("");
  const maxLength = 280;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length === 0) return;
    // TODO: Handle tweet submission
    console.log("Posting tweet:", content);
    setContent("");
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full resize-none border-none outline-none bg-transparent text-lg placeholder-gray-500 dark:placeholder-gray-400 min-h-[100px]"
              maxLength={maxLength}
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
          <button
            type="submit"
            disabled={content.trim().length === 0 || content.length > maxLength}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-full transition-colors"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}

