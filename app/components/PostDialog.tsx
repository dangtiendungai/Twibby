"use client";

import { useRouter } from "next/navigation";
import Dialog from "./Dialog";
import TweetComposer from "./TweetComposer";

interface PostDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostDialog({ isOpen, onClose }: PostDialogProps) {
  const router = useRouter();

  const handleTweetCreated = () => {
    router.refresh();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Tweet"
      size="lg"
      showCloseButton={true}
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
      <TweetComposer onTweetCreated={handleTweetCreated} />
    </Dialog>
  );
}

