import Sidebar from "../../components/Sidebar";
import Link from "next/link";

// Mock notification data
const mockNotifications = [
  {
    id: "1",
    type: "like",
    user: {
      username: "janedoe",
      name: "Jane Doe",
    },
    tweet: {
      id: "tweet-1",
      content: "Just launched my new project!",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: "2",
    type: "follow",
    user: {
      username: "devmaster",
      name: "Dev Master",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: "3",
    type: "mention",
    user: {
      username: "codeguru",
      name: "Code Guru",
    },
    tweet: {
      id: "tweet-2",
      content: "Great work @johndoe!",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
  },
  {
    id: "4",
    type: "retweet",
    user: {
      username: "techlover",
      name: "Tech Lover",
    },
    tweet: {
      id: "tweet-3",
      content: "Working on something exciting...",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return "❤️";
    case "follow":
      return "👤";
    case "mention":
      return "💬";
    case "retweet":
      return "🔄";
    default:
      return "🔔";
  }
};

const getNotificationText = (notification: (typeof mockNotifications)[0]) => {
  switch (notification.type) {
    case "like":
      return `liked your tweet`;
    case "follow":
      return `started following you`;
    case "mention":
      return `mentioned you in a tweet`;
    case "retweet":
      return `retweeted your tweet`;
    default:
      return "interacted with you";
  }
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

export default function NotificationsPage() {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Notifications
            </h2>
            <button className="text-sm text-blue-500 hover:text-blue-600">
              Mark all as read
            </button>
          </div>
        </div>

        <div>
          {mockNotifications.map((notification) => (
            <Link
              key={notification.id}
              href={
                notification.tweet
                  ? `/tweet/${notification.tweet.id}`
                  : `/user/${notification.user.username}`
              }
              className={`block border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
              }`}
            >
              <div className="flex gap-3">
                <div className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {notification.user.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      @{notification.user.username}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">·</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {getNotificationText(notification)}
                  </p>
                  {notification.tweet && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {notification.tweet.content}
                    </p>
                  )}
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {mockNotifications.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No notifications yet
            </p>
          </div>
        )}
      </main>
      <aside className="hidden lg:block w-[240px] flex-shrink-0 p-4">
        <div className="sticky top-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">
              Filter
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-900 dark:text-gray-100">
                All
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
                Mentions
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
                Follows
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
                Likes
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
