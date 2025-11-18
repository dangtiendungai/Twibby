"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createClient } from "@/lib/supabase/client";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import Checkbox from "../../components/ui/Checkbox";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import AvatarUploader from "../../components/profile/AvatarUploader";
import BannerUploader from "../../components/profile/BannerUploader";
import ChangePasswordDialog from "../../components/dialogs/ChangePasswordDialog";
import TwoFactorDialog from "../../components/dialogs/TwoFactorDialog";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          router.push("/login");
          return;
        }

        setUser(currentUser);

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        setProfile(profileData);

        // Check 2FA status
        const statusResponse = await fetch("/api/2fa/status");
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setIs2FAEnabled(statusData.enabled || false);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleAvatarUpload = (avatarUrl: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: avatarUrl });
    }
    router.refresh();
  };

  const handleBannerUpload = (bannerUrl: string) => {
    if (profile) {
      setProfile({ ...profile, banner_url: bannerUrl || null });
    }
    router.refresh();
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const formData = new FormData(e.currentTarget);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.get("name") as string,
          bio: formData.get("bio") as string,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile. Please try again.");
        return;
      }

      setProfile({
        ...profile,
        name: formData.get("name") as string,
        bio: formData.get("bio") as string,
      });

      router.refresh();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Sign out the user
      const supabase = createClient();
      await supabase.auth.signOut();

      // Show success message
      toast.success("Account deleted successfully");

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account. Please try again.");
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </main>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Account Settings */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Account
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <TextField
                id="email"
                label="Email"
                type="email"
                defaultValue={user.email || ""}
                helperText="Your email address (cannot be changed here)"
                disabled
              />
              <TextField
                id="username"
                label="Username"
                type="text"
                defaultValue={profile.username || ""}
                helperText="Your unique username (cannot be changed here)"
                disabled
              />
            </div>
          </section>

          {/* Profile Settings */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Profile
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Banner Image
                </label>
                <BannerUploader
                  currentBannerUrl={profile.banner_url}
                  userId={user.id}
                  onUploadComplete={handleBannerUpload}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Picture
                </label>
                <AvatarUploader
                  currentAvatarUrl={profile.avatar_url}
                  userId={user.id}
                  onUploadComplete={handleAvatarUpload}
                  size="md"
                />
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <TextField
                  id="name"
                  name="name"
                  label="Display Name"
                  type="text"
                  defaultValue={profile.name || ""}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                    rows={4}
                    placeholder="Tell us about yourself"
                    defaultValue={profile.bio || ""}
                    maxLength={160}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {(profile.bio?.length || 0)}/160 characters
                  </p>
                </div>
                <Button type="submit" isLoading={isSaving}>
                  Update profile
                </Button>
              </form>
            </div>
          </section>

          {/* Privacy Settings */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Privacy
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <div>
                <Checkbox
                  id="private-account"
                  label="Make my account private"
                />
                <p className="mt-1 ml-8 text-xs text-gray-500 dark:text-gray-400">
                  Only approved followers can see your tweets
                </p>
              </div>
              <Checkbox id="show-email" label="Show email on profile" />
              <Checkbox
                id="allow-tags"
                label="Allow anyone to tag me in photos"
              />
              <Button variant="outline">Save privacy settings</Button>
            </div>
          </section>

          {/* Notification Settings */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Notifications
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <Checkbox
                id="email-notifications"
                label="Email notifications"
                defaultChecked
              />
              <Checkbox
                id="push-notifications"
                label="Push notifications"
                defaultChecked
              />
              <Checkbox
                id="new-follower"
                label="New follower notifications"
                defaultChecked
              />
              <Checkbox
                id="mentions"
                label="Mentions and replies"
                defaultChecked
              />
              <Button variant="outline">Save notification settings</Button>
            </div>
          </section>

          {/* Security */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Security
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsChangePasswordDialogOpen(true)}
              >
                Change password
              </Button>
              <div>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setIs2FADialogOpen(true)}
                >
                  {is2FAEnabled
                    ? "Manage two-factor authentication"
                    : "Enable two-factor authentication"}
                </Button>
                {is2FAEnabled && (
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                    ✓ Two-factor authentication is enabled
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Danger Zone
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-900 p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Delete your account and all of your data. This action cannot
                  be undone.
                </p>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Delete account
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message={
          <>
            <p className="mb-2">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All your tweets, followers, and data will be permanently deleted.
            </p>
          </>
        }
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      <ChangePasswordDialog
        isOpen={isChangePasswordDialogOpen}
        onClose={() => setIsChangePasswordDialogOpen(false)}
      />

      <TwoFactorDialog
        isOpen={is2FADialogOpen}
        onClose={() => setIs2FADialogOpen(false)}
        onEnabled={() => setIs2FAEnabled(true)}
        onDisabled={() => setIs2FAEnabled(false)}
      />
    </>
  );
}
