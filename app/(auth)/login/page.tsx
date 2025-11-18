"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Checkbox from "../../components/Checkbox";
import Button from "../../components/Button";
import TextField from "../../components/TextField";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      // Redirect to home page on success
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });

      if (magicLinkError) {
        setError(magicLinkError.message);
        setIsLoading(false);
        return;
      }

      setMagicLinkSent(true);
      setIsLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
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
          ) : magicLinkSent ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Check your email
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  We&apos;ve sent a magic link to <strong>{email}</strong>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click the link in the email to sign in. The link will expire in 1 hour.
                </p>
              </div>
              <Button
                type="button"
                variant="text"
                color="gray"
                fullWidth
                size="sm"
                onClick={() => {
                  setShowMagicLink(false);
                  setMagicLinkSent(false);
                  setEmail("");
                }}
              >
                Back to password login
              </Button>
            </div>
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@example.com"
              />

              <Button type="submit" fullWidth isLoading={isLoading}>
                Send Magic Link
              </Button>

              <Button
                type="button"
                variant="text"
                color="gray"
                fullWidth
                size="sm"
                onClick={() => {
                  setShowMagicLink(false);
                  setError("");
                }}
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
