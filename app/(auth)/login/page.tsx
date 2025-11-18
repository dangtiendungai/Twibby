"use client";

import { useState } from "react";
import Link from "next/link";
import Checkbox from "../../components/Checkbox";
import Button from "../../components/Button";
import TextField from "../../components/TextField";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement Supabase auth
    console.log("Email login:", email, password);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement Supabase magic link
    console.log("Magic link sent to:", email);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-blue-500">
            Twibby
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-500 hover:text-blue-600"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
          {!showMagicLink ? (
            <form className="space-y-6" onSubmit={handleEmailLogin}>
              <TextField
                id="email"
                name="email"
                type="email"
                label="Email address"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <TextField
                id="password"
                name="password"
                type="password"
                label="Password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <div className="flex items-center justify-between">
                <Checkbox
                  id="remember-me"
                  name="remember-me"
                  label="Remember me"
                />

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-blue-500 hover:text-blue-600"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" fullWidth isLoading={isLoading}>
                Sign in
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                    Or
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setShowMagicLink(true)}
              >
                Sign in with Magic Link
              </Button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleMagicLink}>
              <TextField
                id="magic-email"
                name="email"
                type="email"
                label="Email address"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <Button type="submit" fullWidth isLoading={isLoading}>
                Send Magic Link
              </Button>

              <Button
                type="button"
                variant="ghost"
                fullWidth
                size="sm"
                onClick={() => setShowMagicLink(false)}
              >
                Back to password login
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
