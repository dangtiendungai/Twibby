"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "./Button";
import { Upload, X, Loader2 } from "lucide-react";

interface AvatarUploaderProps {
  currentAvatarUrl?: string | null;
  userId: string;
  onUploadComplete?: (avatarUrl: string) => void;
  size?: "sm" | "md" | "lg";
}

export default function AvatarUploader({
  currentAvatarUrl,
  userId,
  onUploadComplete,
  size = "lg",
}: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(
    currentAvatarUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB");
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to upload an avatar");
      }

      // Verify the userId matches the authenticated user
      if (user.id !== userId) {
        throw new Error("You can only update your own avatar");
      }

      // Generate unique filename
      // Path format: {userId}/{timestamp}.{ext}
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage (bucket name is 'avatars', path is just the fileName)
      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        // If bucket doesn't exist, try to create it or use a fallback
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error(
            "Storage bucket not configured. Please create an 'avatars' bucket in Supabase Storage."
          );
        }
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update profile with new avatar URL
      // Use user.id instead of userId to ensure RLS policy matches
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setPreview(publicUrl);
      onUploadComplete?.(publicUrl);
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setError(err.message || "Failed to upload avatar. Please try again.");
      // Revert preview on error
      setPreview(currentAvatarUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentAvatarUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to remove an avatar");
      }

      // Verify the userId matches the authenticated user
      if (user.id !== userId) {
        throw new Error("You can only remove your own avatar");
      }

      // Extract file path from URL if it's a storage URL
      try {
        const url = new URL(currentAvatarUrl);
        const pathParts = url.pathname.split("/");
        const avatarsIndex = pathParts.indexOf("avatars");
        
        if (avatarsIndex !== -1 && avatarsIndex < pathParts.length - 1) {
          // Get the path after 'avatars' (e.g., 'avatars/userId/file.jpg' -> 'userId/file.jpg')
          const filePath = pathParts.slice(avatarsIndex + 1).join("/");
          
          // Delete from storage
          await supabase.storage.from("avatars").remove([filePath]);
        }
      } catch (urlError) {
        // If URL parsing fails, continue with profile update
        console.warn("Could not parse avatar URL for deletion:", urlError);
      }

      // Update profile to remove avatar
      // Use user.id instead of userId to ensure RLS policy matches
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setPreview(null);
      onUploadComplete?.("");
    } catch (err: any) {
      console.error("Error removing avatar:", err);
      setError(err.message || "Failed to remove avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div
          className={`${sizeClasses[size]} rounded-full bg-gray-300 dark:bg-gray-700 border-4 border-white dark:border-black overflow-hidden flex-shrink-0 relative`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold">
              ?
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {preview && preview !== currentAvatarUrl
                ? "Change photo"
                : "Upload photo"}
            </Button>
            {preview && (
              <Button
                variant="outline"
                size="sm"
                color="danger"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          {preview && preview !== currentAvatarUrl && !isUploading && (
            <Button
              variant="fill"
              color="primary"
              size="sm"
              onClick={handleUpload}
            >
              Save changes
            </Button>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            JPG, PNG or GIF. Max size 2MB
          </p>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
