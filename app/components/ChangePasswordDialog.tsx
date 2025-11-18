"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { createClient } from "@/lib/supabase/client";
import Dialog from "./Dialog";
import TextField from "./TextField";
import Button from "./Button";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordDialog({
  isOpen,
  onClose,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCurrentPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentPassword(e.target.value);
    setError("");
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setError("");
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
    if (e.target.value !== newPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPasswordError("");

    // Validate inputs
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        setError("Unable to verify your account. Please try again.");
        setIsLoading(false);
        return;
      }

      // Verify current password by attempting to sign in
      // This ensures the user knows their current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setError("Current password is incorrect");
        setIsLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message || "Failed to update password");
        setIsLoading(false);
        return;
      }

      // Success
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      console.error("Error changing password:", err);
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setPasswordError("");
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Password"
      size="md"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <TextField
          id="current-password"
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={handleCurrentPasswordChange}
          disabled={isLoading}
          required
          fullWidth
        />

        <TextField
          id="new-password"
          label="New Password"
          type="password"
          value={newPassword}
          onChange={handleNewPasswordChange}
          disabled={isLoading}
          required
          fullWidth
          helperText="Must be at least 8 characters"
        />

        <TextField
          id="confirm-password"
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          disabled={isLoading}
          error={passwordError}
          required
          fullWidth
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            color="gray"
            fullWidth
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="fill"
            color="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Update Password
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
