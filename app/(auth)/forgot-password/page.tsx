"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "../../components/Button";
import TextField from "../../components/TextField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement Supabase password reset
    console.log("Password reset requested for:", email);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-blue-500">
            Twibby
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
          {!isSubmitted ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                helperText="Enter your email address and we'll send you a link to reset your password."
              />

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                Send reset link
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm font-medium text-blue-500 hover:text-blue-600"
                >
                  ← Back to login
                </Link>
              </div>
            </form>
          ) : (
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
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                >
                  Resend email
                </Button>
                <Link
                  href="/login"
                  className="block text-sm font-medium text-blue-500 hover:text-blue-600"
                >
                  ← Back to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
