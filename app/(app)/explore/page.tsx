import Tweet from "../../components/Tweet";

// Mock data - will be replaced with Supabase data later
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
  {
    id: "2",
    content: "Beautiful sunset today! Sometimes you just need to stop and appreciate the little things in life. 🌅",
    author: {
      username: "janedoe",
      name: "Jane Doe",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 128,
    isLiked: true,
  },
  {
    id: "3",
    content: "Working on something exciting. Can't wait to reveal it! Stay tuned. 💫",
    author: {
      username: "devmaster",
      name: "Dev Master",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: 67,
    isLiked: false,
  },
  {
    id: "4",
    content: "The best way to learn is by building. Start small, iterate, and keep shipping! 💪",
    author: {
      username: "codeguru",
      name: "Code Guru",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    likes: 203,
    isLiked: false,
  },
];

export default function ExplorePage() {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Explore
          </h2>
        </div>
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
      </main>
      <aside className="hidden lg:block w-80 flex-shrink-0 p-4">
        <div className="sticky top-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">
              Trending
            </h3>
            <div className="space-y-4">
              {["#webdev", "#nextjs", "#supabase", "#react"].map((tag) => (
                <div
                  key={tag}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                >
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

