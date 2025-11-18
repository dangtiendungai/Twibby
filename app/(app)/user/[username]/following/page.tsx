import Sidebar from "../../../../components/Sidebar";
import Link from "next/link";
import Button from "../../../../components/Button";

// Mock data
const mockFollowing = [
  {
    username: "janedoe",
    name: "Jane Doe",
    bio: "Designer and artist",
    isFollowing: true,
  },
  {
    username: "devmaster",
    name: "Dev Master",
    bio: "Full-stack developer",
    isFollowing: true,
  },
  {
    username: "codeguru",
    name: "Code Guru",
    bio: "Teaching code one tweet at a time",
    isFollowing: true,
  },
];

interface FollowingPageProps {
  params: {
    username: string;
  };
}

export default function FollowingPage({ params }: FollowingPageProps) {
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
                Following
              </p>
            </div>
          </div>
        </div>

        <div>
          {mockFollowing.map((user) => (
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
                <Button
                  variant="fill"
                  color="gray"
                  rounded="full"
                  size="sm"
                  className="font-semibold"
                >
                  Following
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
