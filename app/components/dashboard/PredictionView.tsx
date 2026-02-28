import React, { useState, useRef, useEffect, useCallback } from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import PredictionCardView from "../common/PredictionViewCard";
import { ACHARYA_MASTER_PROMPT } from "@/lib/acharyaPrompt";

type PredictionInsert = Database["public"]["Tables"]["predictions"]["Insert"];

interface ChatMessage {
  type: "user" | "ai";
  query?: string;
  category?: string;
  timestamp: string;
  content: string;
  isLoading?: boolean;
}

export function PredictionView() {
  const { profile, refreshProfile } = useAuth();
  const [query, setQuery] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const generateInitialHookCallCount = useRef<number>(0);

  // Clear all states
  const clearAll = useCallback(() => {
    setQuery("");
    setCategory("");
    setLoading(false);
    setError("");
    setChat([]);
    setHasInitialized(false);
    setCategories([]);
  }, []);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  // Helper to fetch AI-generated questions based on chat so far
  const fetchAIGeneratedQuestions = useCallback(
    async (latestChat: ChatMessage[]) => {
      if (!profile) return [];
      const chatHistory = latestChat
        .map((msg) =>
          msg.type === "user"
            ? `User: ${msg.content}`
            : `Acharya: ${msg.content ?? ""}`,
        )
        .join("\n");

      const categoriesPrompt = `
          Using the short chat provided, suggest 6-8 personalized, interesting follow-up questions that can help the user explore further. Keep each question concise, between 10 and 20 words. Output only a JSON array of questions.
          User Details:
          - Name: ${profile.full_name || "User"}
          - Faith: ${profile.faith || "Universal"}
          - DOB: ${profile.dob || ""}
          Recent Chat:
          ${chatHistory}
      `;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: categoriesPrompt }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      let arr: string[] = [];
      try {
        arr = JSON.parse(data.text);
        if (!Array.isArray(arr)) throw new Error("Not array");
        // Remove any trailing semicolon from each question string
        return arr
          .map((q) => String(q).replace(/;$/, "")) // remove semicolon at the end if present
          .filter(Boolean);
      } catch (e) {
        const errorMessage =
        e instanceof Error ? e.message : "Failed to generate prediction";
      setError(errorMessage);
        // fallback: try to split by newlines
        if (typeof data.text === "string") {
          return data.text
            .split("\n")
            .map((q: string) => q.replace(/^[-*]\s*/, "").trim())
            .filter((q: string) => q.length > 10);
        }
        return [];
      }
    },
    [profile],
  );

  // Get the AI prediction
  const getAIPrediction = async (userQuery: string): Promise<string> => {
    if (!profile) throw new Error("No profile loaded");
    const prompt = `
User Query Context:
- Name: ${profile.full_name || "User"}
- Faith: ${profile.faith || "Universal"}
- DOB: ${profile.dob || ""}
- User Query: ${userQuery}
    `;
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      throw new Error(`AI Error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.text || "";
  };

  // Handle form submit, manages user sending a new question
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!profile || profile.credits < 1) {
      setError(
        "You do not have enough credits to ask a question. Please purchase more credits to continue.",
      );
      return;
    }
    const questionToAsk = query.trim() || category.trim();
    if (!questionToAsk) return;

    setLoading(true);

    const userMessage: ChatMessage = {
      type: "user",
      query: questionToAsk,
      category: category,
      timestamp: new Date().toISOString(),
      content: questionToAsk,
    };

    setChat((prev) => [
      ...prev,
      userMessage,
      {
        type: "ai",
        timestamp: new Date().toISOString(),
        content: "",
        isLoading: true,
      },
    ]);
    setCategory("");
    setQuery("");

    try {
      const aiContent = await getAIPrediction(questionToAsk);

      setChat((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? {
                ...msg,
                content: aiContent,
                isLoading: false,
                timestamp: new Date().toISOString(),
              }
            : msg,
        ),
      );

      // Save prediction to supabase
      const currentDate = new Date();
      let age = 0;
      if (profile.dob) {
        const birthDate = new Date(profile.dob);
        age = currentDate.getFullYear() - birthDate.getFullYear();
        const beforeBirthday =
          currentDate.getMonth() < birthDate.getMonth() ||
          (currentDate.getMonth() === birthDate.getMonth() &&
            currentDate.getDate() < birthDate.getDate());
        if (beforeBirthday) age--;
      }

      const predictionData = {
        diagnosis: "",
        velocity: "",
        goldenWindow: "",
        protocol: "",
        remedy: "",
        hook: "",
        aiContent,
        metadata: {
          userName: profile.full_name,
          age,
          dob: profile.dob,
          faith: profile.faith,
          question: questionToAsk,
          timestamp: currentDate.toISOString(),
        },
      };

      const predictionInsertData: PredictionInsert = {
        prediction_content: predictionData,
        query: questionToAsk,
        query_category: "",
        user_id: profile.id,
      };

      const { error: insertError } = await supabase
        .from("predictions")
        .insert([predictionInsertData]);

      if (insertError) throw insertError;

      // Deduct credits
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: profile.credits - 1 })
        .eq("id", profile.id);

      if (updateError) throw updateError;
      await refreshProfile();

      // After successful prediction, fetch new follow-up questions based on updated chat!
      const aiMessage: ChatMessage = {
        type: "ai",
        timestamp: new Date().toISOString(),
        content: aiContent,
      };
      const updatedChat: ChatMessage[] = [...chat, userMessage, aiMessage];
      let aiQuestions = await fetchAIGeneratedQuestions(updatedChat);

      // Remove any trailing semicolon from each question
      if (Array.isArray(aiQuestions)) {
        aiQuestions = aiQuestions.map((q: string) => q.replace(/;$/, ""));
      }

      setCategories(aiQuestions || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate prediction";
      setError(errorMessage);

      // Remove last user+loading if error
      setChat((prev) => {
        const newChat = [...prev];
        while (
          newChat.length &&
          (newChat[newChat.length - 1].type === "user" ||
            newChat[newChat.length - 1].isLoading)
        ) {
          newChat.pop();
        }
        return newChat;
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial greeting and question suggestion
  const generateInitialHook = useCallback(async () => {
    generateInitialHookCallCount.current += 1;
    if (generateInitialHookCallCount.current >= 3) {
      clearAll();
      generateInitialHookCallCount.current = 0;
    }
    if (!profile || hasInitialized) return;

    try {
      const prompt = `
User Query Context:
- Name: ${profile.full_name || "User"}
- Faith: ${profile.faith || "Universal"}
- DOB: ${profile.dob || ""}
      `;

      const combinedPrompt = `${ACHARYA_MASTER_PROMPT}\n\n${prompt}`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: combinedPrompt }),
      });

      const data = await res.json();
      if (!data.text) return;

      const initialChat: ChatMessage[] = [
        {
          type: "ai",
          timestamp: new Date().toISOString(),
          content: data.text,
        },
      ];

      setChat(initialChat);
      setHasInitialized(true);

      // Generate AI follow-up questions after the greeting
      const aiQuestions = await fetchAIGeneratedQuestions(initialChat);
      setCategories(aiQuestions || []);
    } catch (err) {
      console.error("Hook generation failed", err);
    }
  }, [profile, hasInitialized, clearAll, fetchAIGeneratedQuestions]);

  // On mount/reset, call initial greeting/questions
  useEffect(() => {
    if (profile && chat.length === 0 && !hasInitialized) {
      if (typeof window !== "undefined") {
    const w = window as typeof window & {
      __ACHARYA_INITIAL_HOOK_CALLED__?: boolean;
    };
    if (w.__ACHARYA_INITIAL_HOOK_CALLED__) {
      return;
    }
    w.__ACHARYA_INITIAL_HOOK_CALLED__ = true;
  }
      generateInitialHook();
      setCategories([]);
    }
  }, [profile, chat.length, hasInitialized, generateInitialHook]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 shadow-sm bg-linear-to-r from-amber-50 via-yellow-100 to-orange-50 dark:from-yellow-900 dark:via-yellow-950 dark:to-yellow-900">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-100 dark:bg-yellow-600/30 w-10 h-10 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-amber-900 dark:text-yellow-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m8.66-12.34l-.7.7m-13.92 0l-.7-.7M21 12h-1M4 12H3m15.36 6.36l-.7-.7m-10.92 0l-.7.7M17 17c-2.5 2.5-6.5 2.5-9 0s-2.5-6.5 0-9 6.5-2.5 9 0 2.5 6.5 0 9z"
              />
            </svg>
          </span>
          <div>
            <div className="font-bold text-lg leading-tight text-amber-800 dark:text-yellow-100">
              Acharya
            </div>
            <div className="text-xs font-medium text-amber-600 dark:text-yellow-200">
              Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 border border-amber-400 dark:border-yellow-600 px-2 py-1 rounded-full bg-amber-50 dark:bg-yellow-950 text-xs font-semibold text-amber-700 dark:text-yellow-200 shadow">
            <svg
              className="w-4 h-4 text-amber-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6l4 2"
              />
            </svg>
            Credits: {profile?.credits ?? 0}
          </span>
        </div>
      </div>
      {/* Chat area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-amber-50 dark:bg-neutral-950 flex flex-col-reverse"
        style={{ display: "flex", flexDirection: "column-reverse" }}
      >
        {chat.length === 0 && !hasInitialized ? (
          <div className="flex flex-col items-start animate-fadeIn group">
            <div className="relative max-w-2xl inline-block bg-white dark:bg-gray-900 mb-2 px-4 py-3 rounded-lg ltr:rounded-bl-none rtl:rounded-br-none shadow-sm text-gray-900 dark:text-gray-100 text-sm">
              <span>
                Hey {profile?.full_name || "there"}! What&apos;s on your mind?
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 pl-1">
              <span className="w-6 h-6 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-white shrink-0">
                A
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Acharya
              </span>
            </div>
          </div>
        ) : (
          [...chat].reverse().map((msg, i) =>
            msg.type === "user" ? (
              <div
                key={chat.length - 1 - i}
                className="flex flex-col items-end animate-fadeIn group mb-4"
              >
                <div className="relative max-w-lg inline-block bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2 px-4 py-3 rounded-lg rtl:rounded-bl-none ltr:rounded-br-none shadow-sm text-sm">
                  <span>{msg.content}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 pr-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {profile?.full_name || "You"}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-200 shrink-0">
                    {(profile?.full_name || "Y")[0].toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div
                key={chat.length - 1 - i}
                className="flex flex-col items-start animate-fadeIn group"
              >
                <div className="relative max-w-xl inline-block bg-white dark:bg-gray-900 mb-2 px-4 py-3 rounded-lg ltr:rounded-bl-none rtl:rounded-br-none shadow-sm text-gray-900 dark:text-gray-100 text-sm md:text-base">
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  ) : (
                    <PredictionCardView content={msg.content} />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 pl-1">
                  <span className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-base font-medium text-white shrink-0">
                    A
                  </span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Acharya
                  </span>
                </div>
              </div>
            ),
          )
        )}
      </div>
      {/* Input area */}
      <form
        onSubmit={handlePredict}
        className="bg-white dark:bg-neutral-900 border-t border-amber-100 dark:border-neutral-800 px-6 py-4 pb-6 flex flex-col gap-3"
        autoComplete="off"
      >
        <div>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-neutral-200">
              <span>
                {categories.length > 0
                  ? "Try a follow-up question or type your own:"
                  : "Type your question below:"}
              </span>
            </label>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((catQ) => (
                  <button
                    key={catQ}
                    type="button"
                    onClick={() => {
                      setCategory(catQ);
                      setQuery("");
                    }}
                    className={`px-3 py-1 rounded-lg border-2 text-sm transition-all ${
                      category === catQ
                        ? "border-amber-600 dark:border-yellow-400 bg-amber-100 dark:bg-neutral-800 text-amber-900 dark:text-yellow-100"
                        : "border-gray-200 dark:border-neutral-700 hover:border-amber-200 dark:hover:border-yellow-400 text-gray-600 dark:text-neutral-300"
                    }`}
                    disabled={loading}
                  >
                    {catQ}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCategory("");
                }}
                required={categories.length === 0}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-yellow-500 focus:border-transparent resize-none text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-yellow-50"
                placeholder={
                  categories.length
                    ? "Type a new question or pick a follow-up..."
                    : "What's your question?"
                }
                disabled={loading || !profile || profile.credits < 1}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={
                  loading ||
                  (!query.trim() && !(category && category.trim())) ||
                  !profile ||
                  profile.credits < 1
                }
                className="bg-amber-600 dark:bg-yellow-700 text-white dark:text-black rounded-lg px-5 py-2 font-medium hover:bg-amber-700 dark:hover:bg-yellow-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 px-4 py-2 rounded-lg text-xs flex items-start gap-2 mt-1">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}
      </form>
      {!loading && profile && profile.credits < 1 && (
        <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 px-4 py-2 rounded-lg text-xs flex items-center gap-2 justify-center mt-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          You do not have enough credits to ask a question. Please purchase more
          credits to continue.
        </div>
      )}
    </div>
  );
}
