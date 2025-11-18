"use client";

import { ReactNode } from "react";
import Dialog from "./Dialog";
import Button from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger";
  isLoading?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
  size = "sm",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const confirmButtonVariant = "primary";
  const confirmButtonClass =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
      : "";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      showCloseButton={showCloseButton}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEscape={closeOnEscape}
    >
      <div className="space-y-6">
        {/* Message */}
        <div className="text-gray-700 dark:text-gray-300">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            isLoading={isLoading}
            className={confirmButtonClass}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
