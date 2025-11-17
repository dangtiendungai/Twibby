"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Home", href: "/", icon: "🏠" },
  { name: "Explore", href: "/explore", icon: "🔍" },
  { name: "Profile", href: "/profile", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen border-r border-gray-200 dark:border-gray-800 px-2 sm:px-4 py-6">
      <div className="flex flex-col h-full">
        <div className="mb-8 px-2">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-500">
            Twibby
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-3 rounded-full transition-colors ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-base sm:text-lg hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 sm:px-6 rounded-full transition-colors text-sm sm:text-base">
            <span className="hidden sm:inline">Post</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

