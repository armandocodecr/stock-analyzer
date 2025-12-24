"use client";

import { useState, ReactNode } from "react";
import { clsx } from "clsx";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={clsx("w-full", className)}>
      {/* Tab Headers */}
      <div className="border-b border-gray-700 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-6 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 border-b-2 flex justify-center items-center gap-2",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400 bg-gray-800/50"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-800/30"
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">{activeContent}</div>
    </div>
  );
}
