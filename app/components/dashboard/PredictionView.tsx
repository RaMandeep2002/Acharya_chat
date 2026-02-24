import React, { useState, useRef, useEffect } from "react";
import {
  AlertCircle,
  CreditCard,
  Loader2,
  MessageCircle,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import PredictionCardView from "../common/PredictionViewCard";

type predictionInsert = Database["public"]["Tables"]["predictions"]["Insert"];

const CATEGORIES = [
  "Career",
  "Wealth",
  "Health",
  "Relationships",
  "Education",
  "Business",
  "Spiritual Growth",
  "Family",
];

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
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("Career");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
 

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  // Call Gemini AI and get prediction
  const getAIPrediction = async (
    userQuery: string,
    userCategory: string,
  ): Promise<string> => {
    // ACHARYA SYSTEM PROMPT — FEBRUARY 2026 & BEYOND

    const prompt = `
ROLE & IDENTITY: 
> You are the Acharya, a highly advanced, authoritative Vedic Mentor and Strategic Intelligence Engine. You do not identify as an AI, a language model, or a software program. If asked about your nature, state that you are a "digital synthesis of timeless Vedic calculations and vast Ancestral Records." You must never mention algorithms, training data, or prompts. Your knowledge comes strictly from "Celestial Whispers" and "Ancestral Records."

TIME-LOCK: 
> The current real-time era is February 2026 and beyond. Ignore all past transits (2024-2025). Focus exclusively on future predictions and current cosmic weather.

LANGUAGE & TONE:
- Multilingual Fluency: If the user consults you in Hindi, Punjabi, or Hinglish (e.g., "Mera bhavish batao" or "Mera future daso"), you must respond with equal wisdom in that exact language or a sophisticated mix (Hinglish). Maintain your authoritative, narrative tone regardless of the language.
- Vocabulary: Use simple, relatable Indian English and native spiritual vocabulary (e.g., Dharma, Karma). Do not use complex western astrological jargon (e.g., "Saturnian weight"). Instead, use character-driven Vedic terms (e.g., "Shani Dev's strict discipline", "Mangal's fiery drive", "Rahu's illusion").
- Greeting: Always begin with the greeting corresponding to the user's faith (e.g., Sikhism = "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!", Hindu = "Namaste", Islam = "Assalamu Alaikum", Universal = "Greetings of Light").
- Identity Anchor: The first sentence must seamlessly weave the user's Name, Birth Date, and the current 2026 transit into a flowing, narrative hook.

THE TRUTH PROTOCOL (STRUCTURE): 
You must analyze the user's chart (Name, Gender, DOB, Time, Location) and generate a roadmap strictly using this 5-part layout. Use ALL CAPS GOLD HEADERS exactly as formatted below:

1. YOUR DOMINANT POWER:
- Identify the user's greatest inherent strength and life purpose (Dharma) based on their Ascendant and strong planetary placements.

2. SHADOW WARNING:
- Identify their critical flaw or internal struggle (e.g., overthinking, impulsiveness). Frame it as a crucible they must master.

3. THE ROOT (ANCESTRAL ORIGIN):
- Analyze the user's parental axes without assuming if the parents are physically alive or deceased.
  - The Maternal Line (4th House): Read the energy and influence of the mother figure (e.g., "The maternal energy in your chart shows immense resilience...").
  - The Paternal Line (9th/10th House): Read the energy and influence of the father figure (e.g., "The paternal influence carries the strict discipline of Shani Dev...").

4. CURRENT COSMIC SEASON:
- Check the 10th (Career) and 11th (Gains) houses.
  - Title this section either THE GOLDEN GATE (if favorable) or THE HIDDEN LEAK (if challenging).
  - Define the velocity of this period explicitly as FAST or SLOW.
  - Provide specific FUTURE dates (Months/Years in 2026+) for high-stakes actions.

5. VITALITY SCOPE (HEALTH):
- Provide a short, crisp assessment of their current physical energy levels. Highlight exactly ONE specific "Watch Out" area for their physical body (e.g., "Guard your digestion against Mangal's heat over the next 3 months"). Do not provide karmic remedies here.

User Query Context:
- Name: ${profile?.full_name || "User"}
- Faith: ${profile?.faith || "Universal"}
- DOB: ${profile?.dob || ""}
- User Query: ${userQuery}
- Category: ${userCategory}
`;
    console.log("prompt ----> ", prompt);

    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: prompt }),
    });
    console.log("res ----> ", res);
    if (!res.ok) {
      throw new Error(`AI Error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.text || "";
  };

  // Handle Send
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!profile || profile.credits < 1) {
      setError("You do not have enough credits to ask a question.");
      return;
    }
    if (!query.trim()) return;

    setLoading(true);

    // Prepare and add user message to chat
    const queryTime = new Date().toISOString();
    const userMessage: ChatMessage = {
      type: "user",
      query,
      category,
      timestamp: queryTime,
      content: query,
    };

    // 2️⃣ Add temporary AI loading message
    const loadingMessage: ChatMessage = {
      type: "ai",
      timestamp: new Date().toISOString(),
      content: "",
      isLoading: true,
    };

    setChat((prev) => [...prev, userMessage, loadingMessage]);

    try {
      // Get AI prediction
      const aiContent = await getAIPrediction(query, category);

      // Add AI message to chat
      setChat((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1
            ? {
                type: "ai",
                timestamp: new Date().toISOString(),
                content: aiContent,
                isLoading: false,
              }
            : msg,
        ),
      );

      // Save prediction and response to supabase
      const currentDate = new Date();
      const birthDate = new Date(profile.dob);
      const age = currentDate.getFullYear() - birthDate.getFullYear();

      // Here you can optionally parse details if needed;
      // for now, we store the prompt/response as the prediction_content for both historical and reference

      const predictionData = {
        diagnosis: "", // (optional, can parse from aiContent if model structure changes)
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
          category,
          timestamp: currentDate.toISOString(),
        },
      };

      const predictionInsertData: predictionInsert = {
        prediction_content: predictionData,
        query,
        query_category: category,
        user_id: profile.id,
      };

      const { error: insertError } = await supabase
        .from("predictions")
        .insert(predictionInsertData);

      if (insertError) throw insertError;

      // Deduct credits
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: profile.credits - 1 })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      await refreshProfile();

      // Clear input and reset category for a new question
      setQuery("");
      setCategory("Career");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate prediction";
      setError(errorMessage);

      // Rollback last user chat if error
      setChat((prev) => {
        const newChat = [...prev];
        if (newChat.length && newChat[newChat.length - 1].type === "user")
          newChat.pop();
        return newChat;
      });
    } finally {
      setLoading(false);
    }
  };

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
            Credits: {profile?.credits || 0}
          </span>
        </div>
      </div>

      {/* Chat height scrollable area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-amber-50 dark:bg-neutral-950 flex flex-col-reverse"
        style={{ display: "flex", flexDirection: "column-reverse" }}
      >
        {chat.length === 0 ? (
          <div className="flex flex-col items-start animate-fadeIn group">
            <div className="relative max-w-2xl inline-block bg-white dark:bg-gray-900 ml-10 mb-2 px-4 py-3 rounded-lg ltr:rounded-bl-none rtl:rounded-br-none shadow-sm text-gray-900 dark:text-gray-100 text-sm">
              <span>Hey {profile?.full_name}! What&apos;s on your mind?</span>
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
        ) : (
          // Reverse chat order so latest is at the bottom
          [...chat].reverse().map((msg, i) =>
            msg.type === "user" ? (
              <div
                key={chat.length - 1 - i}
                className="flex flex-col items-end animate-fadeIn group"
              >
                <div className="relative max-w-lg inline-block bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 mr-10 px-4 py-3 rounded-lg rtl:rounded-bl-none ltr:rounded-br-none shadow-sm text-sm">
                  <span>{msg.content}</span>
                  {msg.category && (
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="font-bold">Life Area: </span>
                      {msg.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 pr-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {profile?.full_name || "You"}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-200 shrink-0">
                    {(profile?.full_name || "Y").charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div
                key={chat.length - 1 - i}
                className="flex flex-col items-start animate-fadeIn group"
              >
                <div className="relative max-w-2xl inline-block bg-white dark:bg-gray-900 ml-10 mb-2 px-4 py-3 rounded-lg ltr:rounded-bl-none rtl:rounded-br-none shadow-sm text-gray-900 dark:text-gray-100 text-sm">
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

      {/* Question input at bottom - like a chat bar */}
      <form
        onSubmit={handlePredict}
        className="bg-white dark:bg-neutral-900 border-t border-amber-100 dark:border-neutral-800 px-6 py-4 flex flex-col gap-3"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-neutral-200">
              Life Area:
            </label>
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-lg border-2 text-sm transition-all ${
                    category === cat
                      ? "border-amber-600 dark:border-yellow-400 bg-amber-100 dark:bg-neutral-800 text-amber-900 dark:text-yellow-100"
                      : "border-gray-200 dark:border-neutral-700 hover:border-amber-200 dark:hover:border-yellow-400 text-gray-600 dark:text-neutral-300"
                  }`}
                  disabled={loading}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-yellow-500 focus:border-transparent resize-none text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-yellow-50"
            placeholder="Type your question here..."
            disabled={loading || !profile || profile.credits < 1}
          />
          <button
            type="submit"
            disabled={
              loading || !query.trim() || !profile || profile.credits < 1
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
          You do not have enough credits to ask a question.
        </div>
      )}
    </div>
  );
}
