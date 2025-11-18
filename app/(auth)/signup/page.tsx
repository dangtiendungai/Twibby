"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Checkbox from "../../components/Checkbox";
import Button from "../../components/Button";
import TextField from "../../components/TextField";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    // Validate username
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    // Validate username format (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    setPasswordError("");
    setIsLoading(true);

    try {
      let supabase;
      try {
        supabase = createClient();
      } catch (clientError: unknown) {
        const message =
          clientError instanceof Error
            ? clientError.message
            : "Failed to initialize authentication. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.";
        setError(message);
        setIsLoading(false);
        return;
      }

      // Validate Supabase client is properly initialized
      if (!supabase) {
        setError(
          "Failed to initialize authentication. Please check your configuration."
        );
        setIsLoading(false);
        return;
      }

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: {
              username: username.toLowerCase(),
              name,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
          },
        }
      );

      if (signUpError) {
        // Provide more helpful error messages
        if (signUpError.message.includes("fetch")) {
          setError(
            "Unable to connect to the server. Please check your internet connection and ensure your Supabase credentials are correct in .env.local"
          );
        } else {
          setError(signUpError.message);
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      // Create user profile in the profiles table
      // Note: The profile might already exist if created by a database trigger
      try {
        // First, check if profile already exists (created by trigger)
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", authData.user.id)
          .single();

        if (!existingProfile) {
          // Profile doesn't exist, try to create it
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: authData.user.id,
              username: username.toLowerCase(),
              name,
              email,
            });

          if (profileError) {
            // Check if it's a duplicate key error (profile was created between check and insert)
            if (
              profileError.code === "23505" ||
              profileError.message?.includes("duplicate")
            ) {
              // Profile already exists (likely created by trigger), this is fine
              console.log("Profile already exists, skipping creation");
            } else {
              // Other error - log it but don't fail signup
              console.error("Profile creation error:", {
                message: profileError.message,
                details: profileError.details,
                hint: profileError.hint,
                code: profileError.code,
              });
            }
          }
        } else {
          // Profile already exists (created by trigger), update it with the provided data
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              username: username.toLowerCase(),
              name,
              email,
            })
            .eq("id", authData.user.id);

          if (updateError) {
            console.error("Profile update error:", {
              message: updateError.message,
              details: updateError.details,
              hint: updateError.hint,
              code: updateError.code,
            });
          }
        }
      } catch (profileErr) {
        // Handle case where profiles table might not exist or other errors
        console.error("Profile operation failed:", profileErr);
        // Continue with signup - profile can be created/updated later
      }

      // Redirect to home page
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSignup}>
            <TextField
              id="name"
              name="name"
              type="text"
              label="Full Name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="John Doe"
            />

            <TextField
              id="username"
              name="username"
              type="text"
              label="Username"
              required
              value={username}
              onChange={(e) => {
                setUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                );
                setError("");
              }}
              placeholder="johndoe"
              helperText="This will be your unique handle on Twibby"
              error={error && error.includes("Username") ? error : undefined}
            />

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
