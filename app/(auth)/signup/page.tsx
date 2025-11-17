"use client";

import { useState } from "react";
import Link from "next/link";
import Checkbox from "../../components/Checkbox";
import Button from "../../components/Button";
import TextField from "../../components/TextField";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setPasswordError("");
    setIsLoading(true);
    // TODO: Implement Supabase auth
    console.log("Signup:", { email, password, username, name });
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (confirmPassword && e.target.value !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    if (e.target.value !== password) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-500 hover:text-blue-600"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
          <form className="space-y-6" onSubmit={handleSignup}>
            <TextField
              id="name"
              name="name"
              type="text"
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />

            <TextField
              id="username"
              name="username"
              type="text"
              label="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              helperText="This will be your unique handle on Twibby"
            />

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
              autoComplete="new-password"
              required
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              helperText="Must be at least 8 characters"
            />

            <TextField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="••••••••"
              error={passwordError}
            />

            <div>
              <Checkbox
                id="terms"
                name="terms"
                required
                label={
                  <>
                    I agree to the{" "}
                    <a href="#" className="text-blue-500 hover:text-blue-600">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-500 hover:text-blue-600">
                      Privacy Policy
                    </a>
                  </>
                }
              />
            </div>

            <Button type="submit" fullWidth isLoading={isLoading}>
              Create account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
