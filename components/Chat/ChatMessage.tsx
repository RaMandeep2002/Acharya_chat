import React from "react";
import PredictionCardView from "@/app/common/PredictionViewCard";

interface UserProfile {
  credits: number;
  full_name: string;
  // [key: string]: any;
}

export interface ChatMessageProps {
  type: "user" | "ai";
  content: string;
  timestamp: string;
  isLoading?: boolean;
  profile: UserProfile | null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  content,
  isLoading,
  profile,
}) => {
  if (type === "user") {
    return (
      <div className="flex gap-3 justify-end mb-4" style={{ animation: "fadeIn 0.3s" }}>
        {/* Right avatar for user */}
        <div className="flex flex-col items-end">
          <div
            className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-primary text-primary-foreground mystic-border"
          >
            <span>{content}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 pr-1">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {profile?.full_name || "You"}
            </span>
            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-base font-bold text-primary dark:text-primary-foreground shrink-0">
              {(profile?.full_name || "Y")[0].toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 ${true ? "justify-start" : "justify-end"} mb-4`}
      style={{ animation: "fadeIn 0.3s" }}
    >
      {/* Left avatar for AI */}
      {true && (
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1 mystic-border">
          {/* Use your preferred AI icon here, e.g., a Sparkles or Bot icon */}
          <span className="font-bold text-primary text-base">A</span>
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          true
            ? "bg-card mystic-border text-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        ) : (
          <PredictionCardView content={content} />
        )}
      </div>

      {/* Right avatar for user, omitted since this is AI side */}
    </div>
  );
};
