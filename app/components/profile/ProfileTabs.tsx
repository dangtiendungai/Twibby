"use client";

import { useState } from "react";
import Button from "../ui/Button";

type TabType = "posts" | "replies" | "media" | "likes";

interface ProfileTabsProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export default function ProfileTabs({
  activeTab = "posts",
  onTabChange,
}: ProfileTabsProps) {
  const [currentTab, setCurrentTab] = useState<TabType>(activeTab);

  const handleTabClick = (tab: TabType) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "posts", label: "Posts" },
    { id: "replies", label: "Replies" },
    { id: "media", label: "Media" },
    { id: "likes", label: "Likes" },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant="text"
              color="gray"
              rounded="none"
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 py-4 px-4 text-center font-semibold ${
                isActive
                  ? "text-gray-900 dark:text-gray-100 border-b-2 border-blue-500"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

