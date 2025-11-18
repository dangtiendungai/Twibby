"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Dialog from "./Dialog";
import TextField from "../ui/TextField";
import Button from "../ui/Button";

interface TwoFactorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEnabled: () => void;
  onDisabled: () => void;
}

export default function TwoFactorDialog({
  isOpen,
  onClose,
  onEnabled,
  onDisabled,
}: TwoFactorDialogProps) {
  const [step, setStep] = useState<"status" | "generate" | "verify" | "enabled">("status");
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/2fa/status");
      const data = await response.json();
      setIsEnabled(data.enabled);
      setStep(data.enabled ? "enabled" : "status");
    } catch (error) {
      console.error("Error checking 2FA status:", error);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/2fa/generate", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate 2FA secret");
        setIsLoading(false);
        return;
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep("verify");
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating 2FA:", error);
      setError("Failed to generate 2FA secret");
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/2fa/enable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid verification code");
        setIsLoading(false);
        return;
      }

      toast.success("Two-factor authentication enabled successfully!");
      setIsEnabled(true);
      setStep("enabled");
      setVerificationCode("");
      setIsLoading(false);
      onEnabled();
      
      // Auto-close dialog after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      setError("Failed to enable 2FA");
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/2fa/disable", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to disable 2FA");
        setIsLoading(false);
        return;
      }

      toast.success("Two-factor authentication disabled");
      setIsEnabled(false);
      setStep("status");
      setQrCode(null);
      setSecret(null);
      setIsLoading(false);
      onDisabled();
      
      // Auto-close dialog after 1 second
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      setError("Failed to disable 2FA");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStep("status");
      setQrCode(null);
      setSecret(null);
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
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {step === "status" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Two-factor authentication adds an extra layer of security to your account.
              You&apos;ll need to enter a code from your authenticator app when signing in.
            </p>
            <Button
              type="button"
              variant="fill"
              color="primary"
              fullWidth
              onClick={handleGenerate}
              isLoading={isLoading}
            >
              Enable Two-Factor Authentication
            </Button>
          </div>
        )}

        {step === "generate" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generating your 2FA secret...
            </p>
          </div>
        )}

        {step === "verify" && qrCode && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Scan this QR code with your authenticator app
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Use apps like Google Authenticator, Authy, or Microsoft Authenticator
              </p>
              <div className="flex justify-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            </div>

            {secret && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Or enter this code manually:
                </p>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                    {secret}
                  </code>
                </div>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <TextField
                id="verification-code"
                label="Enter verification code"
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
                helperText="Enter the 6-digit code from your authenticator app"
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  color="gray"
                  fullWidth
                  onClick={() => {
                    setStep("status");
                    setQrCode(null);
                    setSecret(null);
                    setVerificationCode("");
                    setError("");
                  }}
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
                  Verify & Enable
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === "enabled" && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Two-factor authentication is enabled
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your account is now protected with two-factor authentication. You&apos;ll need to
              enter a code from your authenticator app when signing in.
            </p>
            <Button
              type="button"
              variant="outline"
              color="danger"
              fullWidth
              onClick={handleDisable}
              isLoading={isLoading}
            >
              Disable Two-Factor Authentication
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}


