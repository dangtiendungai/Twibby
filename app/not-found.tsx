import Link from "next/link";
import Button from "./components/Button";

export default function NotFound() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Page not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline">Explore</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


