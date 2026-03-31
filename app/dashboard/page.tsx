"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { ACHARYA_MASTER_PROMPT } from "@/lib/acharyaPrompt";
import { useRouter } from "next/navigation";
import { ChatInput } from "@/components/Chat/ChatInput";
import { ChatMessage as ChatMessageComponent } from "@/components/Chat/ChatMessage";

type PredictionInsert = Database["public"]["Tables"]["predictions"]["Insert"];

interface ChatMessage {
  type: "user" | "ai";
  query?: string;
  category?: string;
  timestamp: string;
  content: string;
  isLoading?: boolean;
}


export default function DashboardPage() {
  const { profile, refreshProfile } = useAuth();
  const [query, setQuery] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const generateInitialHookCallCount = useRef<number>(0);
  const router = useRouter();

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
          Using the short chat provided, suggest 2-4 personalized, interesting follow-up questions that can help the user explore further. Keep each question concise, between 5 and 10 words. Output only a JSON array of questions.
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
        let text = data.text;
        if (typeof text === "string") {
          text = text.trim();
          if (text.startsWith("```json")) {
            text = text.replace(/^```json/, "");
          }
          if (text.startsWith("```")) {
            text = text.replace(/^```/, "");
          }
          if (text.endsWith("```")) {
            text = text.replace(/```$/, "");
          }
          text = text.trim();
        }
        arr = JSON.parse(text);
        if (!Array.isArray(arr)) throw new Error("Not array");
        return arr
          .map((q) => String(q).replace(/;$/, "")) 
          .filter(Boolean);
      } catch (e) {
        console.error(e)
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

    if (!profile) {
      setError("Please log in to continue.");
      return;
    }

    // NEW Profile completeness check (The "Logic" and "Profile" step)
    if (!profile.dob || !profile.faith || !profile.birth_place) {
      const questionToAsk = query.trim() || category.trim();
      if (questionToAsk) {
        sessionStorage.setItem("pending_prediction_query", questionToAsk);
      }
      setIsAnalyzing(true);
      setTimeout(() => {
        router.push("/dashboard/Settings?intent=complete_profile");
      }, 2000); // 2 second "Logic" analysis delay
      return;
    }

    if (profile.credits < 1) {
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

      const aiMessage: ChatMessage = {
        type: "ai",
        timestamp: new Date().toISOString(),
        content: aiContent,
      };
      const updatedChat: ChatMessage[] = [...chat, userMessage, aiMessage];
      let aiQuestions = await fetchAIGeneratedQuestions(updatedChat);

      if (Array.isArray(aiQuestions)) {
        aiQuestions = aiQuestions.map((q: string) => q.replace(/;$/, ""));
      }

      setCategories(aiQuestions || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate prediction";
      setError(errorMessage);

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

  // Initial greeting WITHOUT automated first prediction (no credit deduction initially)
  const generateInitialHook = useCallback(async () => {
    generateInitialHookCallCount.current += 1;
    
    if (generateInitialHookCallCount.current >= 3) {
      clearAll();
      generateInitialHookCallCount.current = 0;
    }
    
    if (!profile || hasInitialized) return;

    setLoading(true);
    try {
      const prompt = `
Context for Initial Sacred Greeting:
- Name: ${profile.full_name || "User"}
- Faith: ${profile.faith || "Universal"}
- DOB: ${profile.dob || ""}

Please provide an initial greeting and a brief welcome message for this user. Avoid doing a full prediction yet.
      `;

      const combinedPrompt = `${ACHARYA_MASTER_PROMPT}\n\n${prompt}`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: combinedPrompt }),
      });

      const data = await res.json();
      const aiContent = data.text;
      
      if (!aiContent) throw new Error("No content generated");

      const initialChat: ChatMessage[] = [
        {
          type: "ai",
          timestamp: new Date().toISOString(),
          content: aiContent,
        },
      ];

      setChat(initialChat);
      setHasInitialized(true);

      const aiQuestions = await fetchAIGeneratedQuestions(initialChat);
      setCategories(aiQuestions || []);

    } catch (err) {
      console.error("Initial greeting failed", err);
      setChat([
        {
          type: "ai",
          timestamp: new Date().toISOString(),
          content: `Namaste ${profile.full_name || "seeker"}. How can I guide you today?`,
        },
      ]);
      setHasInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [profile, hasInitialized, clearAll, fetchAIGeneratedQuestions]);

  useEffect(() => {
    if (profile && chat.length === 0 && !hasInitialized) {
      const pendingQuery = sessionStorage.getItem("pending_prediction_query");
      if (pendingQuery && profile.dob && profile.faith && profile.birth_place) {
        sessionStorage.removeItem("pending_prediction_query");
        setQuery(pendingQuery);
      }

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
    <div className="flex flex-col justify-center items-center h-screen max-h-screen shadow-sm overflow-hidden relative">
  
  {/* Decorative Cosmic Background Elements */}
  {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400/5 dark:bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/5 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-300/3 dark:bg-amber-400/3 rounded-full blur-3xl" />
  </div> */}
  
  {/* Chat Messages Container */}
  <div
    ref={chatContainerRef}
    className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 w-full max-w-5xl scrollbar-hide relative z-10"
    style={{
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    }}
  >
    <style jsx global>{`
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      @keyframes fadeSlideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .message-enter {
        animation: fadeSlideUp 0.3s ease-out forwards;
      }
    `}</style>
    
    <div className="flex flex-col-reverse space-y-4 space-y-reverse">
      {chat.length === 0 && !hasInitialized ? (
        <div className="message-enter">
          <ChatMessageComponent
            type="ai"
            content="Welcome! I am ready to offer you celestial guidance based on your profile."
            timestamp={new Date().toISOString()}
            profile={profile}
          />
        </div>
      ) : (
        [...chat].reverse().map((msg, i) => (
          <div key={chat.length - 1 - i} className="message-enter">
            <ChatMessageComponent
              {...msg}
              profile={profile}
            />
          </div>
        ))
      )}
    </div>
  </div>

  {/* Chat Input */}
  <div className="relative z-10 w-full">
    <ChatInput
      query={query}
      setQuery={setQuery}
      category={category}
      setCategory={setCategory}
      categories={categories}
      loading={loading}
      profile={profile}
      handlePredict={handlePredict}
    />
  </div>

  {/* Error Message */}
  {error && (
    <div className="w-full max-w-5xl px-4 md:px-6 mb-4 relative z-10 animate-slideDown">
      <div className="bg-red-50/95 dark:bg-red-950/95 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex items-start gap-3 shadow-lg">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
        <div className="flex-1">{error}</div>
        <button 
          onClick={() => setError("")}
          className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )}

  {/* Credits Warning */}
  {!loading && profile && profile.credits < 1 && (
    <div className="w-full max-w-5xl px-4 md:px-6 mb-4 relative z-10 animate-slideDown">
      <div className="bg-linear-to-r from-amber-50 to-yellow-50 dark:from-amber-950/90 dark:to-yellow-950/90 backdrop-blur-sm border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-4 py-3 rounded-xl text-sm flex flex-col sm:flex-row items-center gap-3 justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-center sm:text-left">
            You do not have enough credits to ask a question.
          </span>
        </div>
        <button
          onClick={() => router.push("/dashboard/credits")}
          className="px-4 py-1.5 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
        >
          Purchase Credits ✨
        </button>
      </div>
    </div>
  )}

  {/* Analysis Overlay - Enhanced */}
  {isAnalyzing && (
    <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-fadeIn">
      {/* Animated Cosmic Ring */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer Rings */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-200 dark:border-amber-800/50 animate-ping opacity-75" />
        <div className="absolute inset-0 rounded-full border-4 border-amber-300 dark:border-amber-700 animate-pulse" />
        
        {/* Spinning linear Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 dark:border-t-amber-400 border-r-amber-500 dark:border-r-amber-400 animate-spin" />
        
        {/* Inner Glow */}
        <div className="absolute inset-2 rounded-full bg-linear-to-br from-amber-400/20 to-purple-500/20 dark:from-amber-500/20 dark:to-purple-600/20 animate-pulse" />
        
        {/* Central Symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-amber-600 dark:text-amber-400 animate-pulse" />
        </div>
      </div>
      
      {/* Text Content */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent animate-pulse">
          Channeling Cosmic Wisdom
        </h2>
        <p className="text-gray-600 dark:text-neutral-300 text-base md:text-lg">
          Analyzing your celestial path...
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-xs text-gray-400 dark:text-neutral-500 mt-4">
          Preparing sacred charts for precise guidance
        </p>
      </div>
      
      {/* Optional: Cancel Button */}
      <button
        onClick={() => {/* Handle cancel */}}
        className="mt-8 text-sm text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
      >
        Cancel
      </button>
    </div>
  )}
</div>
  );
}
