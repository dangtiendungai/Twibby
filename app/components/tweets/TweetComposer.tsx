"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createClient } from "@/lib/supabase/client";
import Button from "../ui/Button";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

interface TweetComposerProps {
  onTweetCreated?: () => void;
}

interface Profile {
  avatar_url: string | null;
  name: string | null;
}

export default function TweetComposer({ onTweetCreated }: TweetComposerProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxLength = 1500;
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (currentUser) {
          setUser(currentUser);

          const { data: profileData } = await supabase
            .from("profiles")
            .select("avatar_url, name")
            .eq("id", currentUser.id)
            .single();

          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setAuthChecked(true);
      }
    }

    loadUserProfile();
  }, []);

  if (!authChecked) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-800 p-6 text-center space-y-4">
        <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
          Sign in to join the conversation
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Browse tweets freely. Log in or create an account to post, like, or
          bookmark.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-full border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedImage(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-upload image (get user first if not available)
    const supabase = createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      toast.error("You must be logged in to upload images");
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    await uploadImage(file, currentUser.id);
  };

  const uploadImage = async (file: File, userId: string) => {
    setIsUploadingImage(true);
    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/tweets/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage (using 'avatars' bucket or create a 'tweets' bucket)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error(
            "Storage bucket not configured. Please ensure the storage bucket exists."
          );
        }
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      setUploadedImageUrl(publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      console.error("Error uploading image:", err);
      const errorMessage =
        err.message || "Failed to upload image. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setSelectedImage(null);
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length === 0 && !uploadedImageUrl) return;
    if (content.length > maxLength) return;

    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        const errorMsg = "You must be logged in to post";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      // Create tweet with image URL if available
      const { error: tweetError } = await supabase.from("tweets").insert({
        user_id: user.id,
        content: content.trim(),
        image_url: uploadedImageUrl,
      });

      if (tweetError) {
        console.error("Error creating tweet:", tweetError);
        const errorMsg = "Failed to post tweet. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      // Success - reset form
      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
      setUploadedImageUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsLoading(false);
      onTweetCreated?.();
      router.refresh();
      toast.success("Tweet posted successfully!");
    } catch (err) {
      console.error("Error creating tweet:", err);
      const errorMsg = "An unexpected error occurred";
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || "User avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold">
                {profile?.name
                  ? profile.name[0].toUpperCase()
                  : user?.email?.[0].toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError("");
              }}
              placeholder="What's happening?"
              className="w-full resize-none border-none outline-none bg-transparent text-lg placeholder-gray-500 dark:placeholder-gray-400 min-h-[100px]"
              maxLength={maxLength}
              disabled={isLoading || isUploadingImage}
            />
          </div>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative pl-16">
            <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-md">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto max-h-96 object-contain"
              />
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              {!isUploadingImage && (
                <Button
                  type="button"
                  variant="icon"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white"
                  rounded="full"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pl-16">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isLoading || isUploadingImage}
            />
            <Button
              type="button"
              variant="icon"
              color="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isUploadingImage}
              aria-label="Attach image"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span
                className={
                  content.length > maxLength * 0.9 ? "text-orange-500" : ""
                }
              >
                {content.length}
              </span>
              /{maxLength}
            </div>
          </div>
          <Button
            type="submit"
            variant="fill"
            color="primary"
            rounded="full"
            disabled={
              (content.trim().length === 0 && !uploadedImageUrl) ||
              content.length > maxLength ||
              isLoading ||
              isUploadingImage
            }
            isLoading={isLoading || isUploadingImage}
            className="font-semibold"
          >
            Post
          </Button>
        </div>
      </form>
    </div>
  );
}
