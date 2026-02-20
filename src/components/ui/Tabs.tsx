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
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
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
      scrollContainerRef.current.scrollTo({
        left:
          scrollContainerRef.current.scrollLeft +
          (direction === "left" ? -200 : 200),
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={clsx("w-full", className)}>
      {/* Tab bar */}
      <div className="flex items-center gap-1">
        {/* Left scroll */}
        <button
          onClick={() => scroll("left")}
          disabled={!showLeftArrow}
          aria-label="Scroll left"
          className="p-1.5 rounded transition-opacity"
          style={{
            color: showLeftArrow ? "var(--ink-secondary)" : "var(--ink-disabled)",
            opacity: showLeftArrow ? 1 : 0.3,
          }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable tabs */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex-1 overflow-x-auto scrollbar-hide"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
          <div className="flex min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-5 py-2.5 text-xs font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1.5"
                  style={{
                    color: isActive
                      ? "var(--ink-primary)"
                      : "var(--ink-tertiary)",
                    borderBottom: isActive
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                    marginBottom: "-1px",
                    background: "transparent",
                    letterSpacing: "0.03em",
                  }}
                >
                  {tab.icon && (
                    <span
                      style={{
                        color: isActive
                          ? "var(--accent-text)"
                          : "var(--ink-disabled)",
                      }}
                    >
                      {/* Clone icon at small size */}
                      <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">
                        {tab.icon}
                      </span>
                    </span>
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right scroll */}
        <button
          onClick={() => scroll("right")}
          disabled={!showRightArrow}
          aria-label="Scroll right"
          className="p-1.5 rounded transition-opacity"
          style={{
            color: showRightArrow
              ? "var(--ink-secondary)"
              : "var(--ink-disabled)",
            opacity: showRightArrow ? 1 : 0.3,
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4">{activeContent}</div>
    </div>
  );
}
