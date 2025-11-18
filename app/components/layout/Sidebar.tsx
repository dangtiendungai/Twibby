"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  Search,
  User as UserIcon,
  Plus,
  Bell,
  Bookmark,
  Settings,
  Hash,
  LogOut,
} from "lucide-react";
import Button from "../ui/Button";
import PostDialog from "../dialogs/PostDialog";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore", href: "/explore", icon: Hash },
  { name: "Search", href: "/search", icon: Search },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { name: "Profile", href: "/profile", icon: UserIcon },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user);
      })
      .catch((error) => {
        console.error("Error fetching initial user:", error);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
        return;
      }

      // Clear user state immediately
      setUser(null);

      // Redirect to login page
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside className="sticky top-0 h-screen w-[240px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800 px-2 sm:px-4 py-6">
      <div className="flex flex-col h-full">
        <div className="mb-8 px-2">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-blue-500"
          >
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
                <item.icon className="w-6 h-6" />
                <span className="text-base sm:text-lg hidden sm:inline">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2 space-y-2">
          {user && (
            <Button
              variant="fill"
              color="primary"
              rounded="full"
              fullWidth
              className="font-semibold"
              onClick={() => setIsPostDialogOpen(true)}
            >
              <span className="hidden sm:inline">Post</span>
              <Plus className="w-5 h-5 sm:hidden" />
            </Button>
          )}
          {user ? (
            <Button
              variant="outline"
              color="gray"
              rounded="full"
              fullWidth
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Log out</span>
              <span className="sm:hidden">Log out</span>
            </Button>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Sign In</span>
              <span className="sm:hidden">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      <PostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
      />
    </aside>
  );
}
