import ProfileCard from "../../components/ProfileCard";
import Tweet from "../../components/Tweet";

// Mock data - will be replaced with Supabase data later
const mockProfile = {
  username: "johndoe",
  name: "John Doe",
  bio: "Software developer, coffee enthusiast, and occasional writer. Building cool things one line of code at a time.",
  joinedDate: "2024-01-15",
  followers: 1234,
  following: 567,
  isOwnProfile: false,
};

const mockTweets = [
  {
    id: "1",
    content:
      "Just launched my new project! Excited to share it with everyone. 🚀",
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
    content:
      "Beautiful sunset today! Sometimes you just need to stop and appreciate the little things in life. 🌅",
    author: {
      username: "johndoe",
      name: "John Doe",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 128,
    isLiked: true,
  },
];

export default function ProfilePage() {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <ProfileCard
          username={mockProfile.username}
          name={mockProfile.name}
          bio={mockProfile.bio}
          joinedDate={mockProfile.joinedDate}
          followers={mockProfile.followers}
          following={mockProfile.following}
          isOwnProfile={mockProfile.isOwnProfile}
        />
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex">
            <button className="flex-1 py-4 px-4 text-center font-semibold text-gray-900 dark:text-gray-100 border-b-2 border-blue-500">
              Posts
            </button>
            <button className="flex-1 py-4 px-4 text-center font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              Replies
            </button>
            <button className="flex-1 py-4 px-4 text-center font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              Media
            </button>
            <button className="flex-1 py-4 px-4 text-center font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              Likes
            </button>
          </div>
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
    </>
  );
}
