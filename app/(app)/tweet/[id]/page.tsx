import Sidebar from "../../../components/Sidebar";
import Tweet from "../../../components/Tweet";
import TweetComposer from "../../../components/TweetComposer";

// Mock data - will be replaced with Supabase data later
const mockTweet = {
  id: "1",
  content: "Just launched my new project! Excited to share it with everyone. 🚀",
  author: {
    username: "johndoe",
    name: "John Doe",
  },
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  likes: 42,
  isLiked: false,
};

const mockReplies = [
  {
    id: "reply-1",
    content: "Congratulations! This looks amazing! 🎉",
    author: {
      username: "janedoe",
      name: "Jane Doe",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes: 12,
    isLiked: false,
  },
  {
    id: "reply-2",
    content: "Can't wait to try it out!",
    author: {
      username: "devmaster",
      name: "Dev Master",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    likes: 5,
    isLiked: true,
  },
];

interface TweetPageProps {
  params: {
    id: string;
  };
}

export default function TweetPage({ params }: TweetPageProps) {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Tweet
          </h2>
        </div>

        <div>
          <Tweet
            id={mockTweet.id}
            content={mockTweet.content}
            author={mockTweet.author}
            createdAt={mockTweet.createdAt}
            likes={mockTweet.likes}
            isLiked={mockTweet.isLiked}
          />

          <div className="border-b border-gray-200 dark:border-gray-800 p-4">
            <TweetComposer />
          </div>

          <div>
            {mockReplies.map((reply) => (
              <div key={reply.id} className="pl-4 border-l-2 border-gray-200 dark:border-gray-800 ml-4">
                <Tweet
                  id={reply.id}
                  content={reply.content}
                  author={reply.author}
                  createdAt={reply.createdAt}
                  likes={reply.likes}
                  isLiked={reply.isLiked}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
      <aside className="hidden lg:block w-[240px] flex-shrink-0 p-4">
        <div className="sticky top-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">
              Related Tweets
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              More tweets from @{mockTweet.author.username}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}


