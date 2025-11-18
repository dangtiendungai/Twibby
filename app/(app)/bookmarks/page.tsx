import Sidebar from "../../components/Sidebar";
import Tweet from "../../components/Tweet";

// Mock bookmarked tweets
const mockBookmarks = [
  {
    id: "1",
    content: "Just launched my new project! Excited to share it with everyone. 🚀",
    author: {
      username: "johndoe",
      name: "John Doe",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 42,
    isLiked: true,
  },
  {
    id: "2",
    content: "Beautiful sunset today! Sometimes you just need to stop and appreciate the little things in life. 🌅",
    author: {
      username: "janedoe",
      name: "Jane Doe",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: 128,
    isLiked: false,
  },
];

export default function BookmarksPage() {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Bookmarks
          </h2>
        </div>

        <div>
          {mockBookmarks.length > 0 ? (
            mockBookmarks.map((tweet) => (
              <Tweet
                key={tweet.id}
                id={tweet.id}
                content={tweet.content}
                author={tweet.author}
                createdAt={tweet.createdAt}
                likes={tweet.likes}
                isLiked={tweet.isLiked}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                You haven't saved any tweets yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                When you bookmark tweets, they'll show up here
              </p>
            </div>
          )}
        </div>
      </main>
      <aside className="hidden lg:block w-[240px] flex-shrink-0 p-4">
        <div className="sticky top-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">
              Tips
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bookmark tweets to save them for later. Click the bookmark icon on any tweet to save it.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}


