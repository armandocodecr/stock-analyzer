"use client";

export default function LoadingSpinner({
  size = "medium",
}: {
  size?: "small" | "medium" | "large";
}) {
  const dim = { small: "w-4 h-4", medium: "w-6 h-6", large: "w-10 h-10" };
  const border = { small: "border", medium: "border-2", large: "border-2" };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${dim[size]} ${border[size]} rounded-full animate-spin`}
        style={{
          borderColor: "var(--border-strong)",
          borderTopColor: "var(--accent)",
        }}
      />
    </div>
  );
}
