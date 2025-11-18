"use client";

import { useState } from "react";
import Dialog from "./Dialog";
import TextField from "../ui/TextField";
import Button from "../ui/Button";

interface TwoFactorVerifyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
}

export default function TwoFactorVerifyDialog({
  isOpen,
  onClose,
  onVerify,
}: TwoFactorVerifyDialogProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      await onVerify(verificationCode);
      setVerificationCode("");
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setVerificationCode("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Two-Factor Authentication"
      size="md"
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter the 6-digit code from your authenticator app to complete sign in.
        </p>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            id="verification-code"
            label="Verification code"
            type="text"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setVerificationCode(value);
              setError("");
            }}
            placeholder="000000"
            maxLength={6}
            disabled={isLoading}
            required
            fullWidth
            autoFocus
          />

          <div className="flex gap-3">
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
              Verify
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

