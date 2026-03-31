import React from "react";
import { Loader2, Sparkles, CreditCard, AlertCircle } from "lucide-react";

interface UserProfile {
  credits: number;
  // [key: string]: any;
}

interface ChatInputProps {
  query: string;
  setQuery: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  categories: string[];
  loading: boolean;
  profile: UserProfile | null;
  handlePredict: (e: React.FormEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  query,
  setQuery,
  category,
  setCategory,
  categories,
  loading,
  profile,
  handlePredict,
}) => {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth <= 768;

  const isOutOfCredits = !profile || profile.credits < 1;
  const canSubmit =
    !loading &&
    ((query && query.trim()) || (category && category.trim())) &&
    profile &&
    profile.credits > 0;

  return (
    <div className="border-t border-white/10 bg-linear-to-r from-gray-900/95 via-gray-900/98 to-gray-900/95 backdrop-blur-xl p-4 md:p-5 shadow-lg flex flex-col items-center justify-center">
      {categories.length > 0 && (
        <div className="mb-4 flex flex-col items-center justify-center w-full">
          <div className="flex items-center gap-2 mb-2 px-1 justify-center">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Cosmic Suggestions
            </span>
          </div>
          <div className="relative w-full flex justify-center">
            {/* linear fade on mobile for scroll indication */}
            {isMobile && categories.length > 3 && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-gray-900 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-gray-900 to-transparent z-10 pointer-events-none" />
              </>
            )}
            <div
              className={[
                "gap-2 flex justify-center items-center",
                isMobile
                  ? "flex-nowrap overflow-x-auto scrollbar-hide pb-2"
                  : "flex-wrap",
              ].join(" ")}
              style={
                isMobile
                  ? { 
                      WebkitOverflowScrolling: "touch",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none"
                    }
                  : undefined
              }
            >
              {categories.map((catQ) => (
                <button
                  key={catQ}
                  type="button"
                  onClick={() => {
                    setCategory(catQ);
                    setQuery("");
                  }}
                  className={[
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    "border shadow-sm backdrop-blur-sm whitespace-nowrap",
                    "shrink-0",
                    category === catQ
                      ? "bg-linear-to-r from-amber-500 to-amber-600 border-amber-400 text-white shadow-lg shadow-amber-500/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-400/50 text-gray-300 hover:text-amber-300",
                    loading || isOutOfCredits
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer hover:scale-105 active:scale-95",
                  ].join(" ")}
                  // style={{ width: 180 }}
                  disabled={loading || isOutOfCredits}
                >
                  <span className="flex items-center gap-1.5 w-full justify-center">
                    <span className="text-amber-400 text-xs">✨</span>
                    <span className="truncate block max-w-full">
                      {catQ}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main prompt line */}
      <div className="max-w-3xl mx-auto w-full flex flex-col">
        <div className="relative flex flex-col sm:flex-row gap-3 items-stretch w-full">
          {/* Input Container with enhanced styling */}
          <div className="flex-1 relative group w-full max-w-xl flex flex-col">
            <div className="absolute -inset-0.5 rounded-xl opacity-0 group-focus-within:opacity-100 transition duration-300 blur-sm" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCategory("");
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  canSubmit
                ) {
                  e.preventDefault();
                  handlePredict(e);
                }
              }}
              placeholder={
                isOutOfCredits
                  ? "✨ You're out of cosmic energy..."
                  : categories.length
                    ? "Ask the cosmos a question or pick a celestial path..."
                    : "Ask the cosmos a question..."
              }
              disabled={loading || isOutOfCredits}
              className={[
                "relative w-full bg-gray-800/50 border rounded-xl",
                "px-4 py-3 md:px-5 md:py-3.5",
                "text-gray-100 placeholder:text-gray-500 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
                "border-gray-700 focus:border-amber-500",
                "backdrop-blur-sm shadow-inner",
              ].join(" ")}
              autoComplete="off"
              maxLength={500}
              style={{ textAlign: "center" }}
            />
            {/* Character count */}
            {query && query.length > 0 && (
              <div className="absolute right-3 bottom-2 text-xs text-gray-500">
                {query.length}/500
              </div>
            )}
          </div>

          {/* Submit Button with responsive sizing */}
          <button
            type="button"
            onClick={(e) => {
              if (canSubmit) {
                handlePredict(e);
              }
            }}
            disabled={!canSubmit}
            className={[
              "rounded-xl flex items-center justify-center gap-2",
              "transition-all duration-200 transform",
              "focus:ring-2 focus:ring-amber-500/60 focus:outline-none",
              "px-4 py-3 md:px-6 md:py-3.5",
              "w-full sm:w-auto",
              loading
                ? "bg-linear-to-r from-amber-600/50 to-amber-700/50 cursor-wait"
                : "bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-amber-500/25",
              !canSubmit
                ? "opacity-50 cursor-not-allowed hover:scale-100"
                : "hover:scale-105 active:scale-95",
            ].join(" ")}
            aria-label="Submit message"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium hidden sm:inline">
                  Channeling...
                </span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  Seek Guidance
                </span>
              </>
            )}
          </button>
        </div>

        {/* Credit Indicator & Helper Text */}
        {profile && (
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-3 px-1 w-full">
            <div className="flex items-center gap-2 text-xs">
              {isOutOfCredits ? (
                <div className="flex items-center gap-1.5 text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>No cosmic energy remaining</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-400/70">
                  <CreditCard className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {profile.credits} {profile.credits === 1 ? "credit" : "credits"} remaining
                  </span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] font-mono border border-gray-700">
                ↵
              </kbd>
              <span>Enter to send</span>
            </div>
          </div>
        )}

        {/* Context Message */}
        {!isOutOfCredits && categories.length > 0 && !query && !category && (
          <div className="mt-3 px-1 flex w-full">
            <p className="text-xs text-amber-400/60 flex items-center gap-1">
              <Sparkles className="h-3 w-3 shrink-0" />
              <span>Choose a cosmic suggestion or type your own question</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};