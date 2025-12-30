"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [tabs]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={clsx("w-full", className)}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => scroll("left")}
          disabled={!showLeftArrow}
          className={clsx(
            "p-2 rounded-lg transition-all",
            showLeftArrow
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              : "bg-gray-800/30 text-gray-600 cursor-not-allowed"
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex-1 border-b border-gray-700 overflow-x-auto pb-2 scrollbar-hide"
        >
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

        <button
          onClick={() => scroll("right")}
          disabled={!showRightArrow}
          className={clsx(
            "p-2 rounded-lg transition-all",
            showRightArrow
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              : "bg-gray-800/30 text-gray-600 cursor-not-allowed"
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-6">{activeContent}</div>
    </div>
  );
}
