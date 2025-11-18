import Sidebar from "../../../../components/Sidebar";
import Link from "next/link";

// Mock data
const mockFollowers = [
  {
    username: "techlover",
    name: "Tech Lover",
    bio: "Passionate about technology",
    isFollowing: false,
  },
  {
    username: "webdev",
    name: "Web Dev",
    bio: "Building the web",
    isFollowing: true,
  },
  {
    username: "designer",
    name: "Designer Pro",
    bio: "Creating beautiful interfaces",
    isFollowing: false,
  },
];

interface FollowersPageProps {
  params: {
    username: string;
  };
}

export default function FollowersPage({ params }: FollowersPageProps) {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <div className="flex items-center gap-4">
            <Link
              href={`/user/${params.username}`}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              ← Back
            </Link>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {params.username}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Followers
              </p>
            </div>
          </div>
        </div>

        <div>
          {mockFollowers.map((user) => (
            <div
              key={user.username}
              className="border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/user/${user.username}`}
                  className="flex items-center gap-3 flex-1"
                >
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
                </Link>
                <button
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    user.isFollowing
                      ? "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                      : "bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
                  }`}
                >
                  {user.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
