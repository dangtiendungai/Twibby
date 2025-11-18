"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { createClient } from "@/lib/supabase/client";
import Button from "./Button";
import { Upload, X, Loader2 } from "lucide-react";

interface BannerUploaderProps {
  currentBannerUrl?: string | null;
  userId: string;
  onUploadComplete?: (bannerUrl: string) => void;
}

export default function BannerUploader({
  currentBannerUrl,
  userId,
  onUploadComplete,
}: BannerUploaderProps) {
  const [preview, setPreview] = useState<string | null>(
    currentBannerUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentBannerUrl || null);
  }, [currentBannerUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max for banners)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      toast.error("File size must be less than 5MB");
      return;
    }

    setError(null);

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-upload after preview
    setIsUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to upload a banner");
      }

      if (user.id !== userId) {
        throw new Error("You can only update your own banner");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/banner/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error(
            "Storage bucket not configured. Please create an 'avatars' bucket in Supabase Storage."
          );
        }
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ banner_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setPreview(publicUrl);
      onUploadComplete?.(publicUrl);
      toast.success("Banner uploaded successfully!");
    } catch (err: any) {
      console.error("Error uploading banner:", err);
      const errorMessage =
        err.message || "Failed to upload banner. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setPreview(currentBannerUrl || null);
    } finally {
      setIsUploading(false);
    }
  };


  const handleRemove = async () => {
    if (!preview) return;

    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to remove a banner");
      }

      if (user.id !== userId) {
        throw new Error("You can only remove your own banner");
      }

      // Try to delete the file from storage if it's a Supabase URL
      try {
        const url = new URL(preview);
        if (url.hostname.includes("supabase")) {
          // Extract the file path from the URL
          const pathParts = url.pathname.split("/");
          const filePath = pathParts.slice(pathParts.indexOf("avatars") + 1).join("/");
          
          await supabase.storage.from("avatars").remove([filePath]);
        }
      } catch (urlError) {
        console.warn("Could not parse banner URL for deletion:", urlError);
      }

      // Update profile to remove banner URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ banner_url: null })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setPreview(null);
      onUploadComplete?.("");
      toast.success("Banner removed successfully!");
    } catch (err: any) {
      console.error("Error removing banner:", err);
      const errorMessage =
        err.message || "Failed to remove banner. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
        {preview ? (
          <img
            src={preview}
            alt="Banner preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <Upload className="w-12 h-12" />
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

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
          color="gray"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          {preview ? "Change Banner" : "Upload Banner"}
        </Button>
        {preview && (
          <Button
            variant="outline"
            color="danger"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Recommended size: 1500x500px. Max file size: 5MB
      </p>
    </div>
  );
}

