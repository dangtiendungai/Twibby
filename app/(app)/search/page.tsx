"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Tweet from "../../components/Tweet";
import { Search } from "lucide-react";

// Mock search results
const mockUsers = [
  {
    username: "johndoe",
    name: "John Doe",
    bio: "Software developer",
  },
  {
    username: "janedoe",
    name: "Jane Doe",
    bio: "Designer and artist",
  },
];

const mockTweets = [
  {
    id: "1",
    content: "Just launched my new project! Excited to share it with everyone. 🚀",
    author: {
      username: "johndoe",
      name: "John Doe",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes: 42,
    isLiked: false,
  },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"top" | "latest" | "people" | "media">("top");

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
            <button
              onClick={() => setActiveTab("top")}
              className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${
                activeTab === "top"
                  ? "text-gray-900 dark:text-gray-100 border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              Top
            </button>
            <button
              onClick={() => setActiveTab("latest")}
              className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${
                activeTab === "latest"
                  ? "text-gray-900 dark:text-gray-100 border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setActiveTab("people")}
              className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${
                activeTab === "people"
                  ? "text-gray-900 dark:text-gray-100 border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              People
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${
                activeTab === "media"
                  ? "text-gray-900 dark:text-gray-100 border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              Media
            </button>
          </div>
        </div>

        <div>
          {activeTab === "people" ? (
            <div>
              {mockUsers.map((user) => (
                <div
                  key={user.username}
                  className="border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
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
                    </div>
                    <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity">
                      Follow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {mockTweets.map((tweet) => (
                <Tweet
                  key={tweet.id}
                  id={tweet.id}
                  content={tweet.content}
                  author={tweet.author}
                  createdAt={tweet.createdAt}
                  likes={tweet.likes}
                  isLiked={tweet.isLiked}
                />
              ))}
            </div>
          )}

          {searchQuery === "" && (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Try searching for people, topics, or keywords
              </p>
            </div>
          )}
        </div>
      </main>
      <aside className="hidden lg:block w-[240px] flex-shrink-0 p-4">
        <div className="sticky top-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">
              Trending
            </h3>
            <div className="space-y-4">
              {["#webdev", "#nextjs", "#supabase"].map((tag) => (
                <div key={tag} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {tag}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Trending in Technology
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


