import React, { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
// import PredictionCardView from "../common/PredictionViewCard";

type PredictionInsert = Database["public"]["Tables"]["predictions"]["Insert"];

const SELF_TEST_QUESTIONS = [
  "Do you often feel tired during the day?",
  "How many hours do you sleep on average per night?",
  "How regularly do you exercise in a week?",
  "Do you feel stressed frequently?",
  "Are you satisfied with your current eating habits?",
  "How would you rate your current level of happiness?",
];

// For simplicity, this component follows a linear, simple self-test flow (score-based, no AI, no credits).
export function Selftest() {
  const { profile } = useAuth();
  const [step, setStep] = useState(0); // current question index
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // This can be more advanced, like showing results, but for demo simplicity:
  const handleAnswer = async (answer: string) => {
    setAnswers((prev) => [...prev, answer]);
    if (step < SELF_TEST_QUESTIONS.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      // Optionally save to supabase, or show a summary
      setLoading(true);
      try {
        let summary = `Self-assessment answers:\n`;
        SELF_TEST_QUESTIONS.forEach((q, i) => {
          summary += `${i + 1}. ${q}\n   - Answer: ${answers[i] || ""}${i === step ? " (last)" : ""}\n`;
        });

        const predictionData = {
          diagnosis: "",
          velocity: "",
          goldenWindow: "",
          protocol: "",
          remedy: "",
          hook: "",
          aiContent: summary,
          metadata: {
            userName: profile?.full_name,
            dob: profile?.dob,
            faith: profile?.faith,
            answers: [...answers, answer],
          },
        };

        if (profile) {
          const predictionInsertData: PredictionInsert = {
            prediction_content: predictionData,
            query: "Self Test",
            query_category: "self_test",
            user_id: profile.id,
          };

          await supabase.from("predictions").insert([predictionInsertData]);
        }
      } catch (err: unknown) {
        const errorMessage =
        err instanceof Error ? err.message : "Failed to generate prediction";
      setError(errorMessage);
        // setError(err.message || "Error saving your self-test.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers([]);
    setError("");
  };

  // Result: show all answers
  if (step >= SELF_TEST_QUESTIONS.length) {
    return (
      <div className="flex flex-col h-screen max-h-screen bg-white dark:bg-neutral-900 shadow-sm overflow-hidden justify-center items-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 p-6 rounded-xl shadow space-y-4 mt-12 mb-8">
          <h2 className="text-xl font-bold text-amber-800 dark:text-yellow-100">
            Self-Assessment Complete
          </h2>
          <div>
            <ul className="space-y-2 text-gray-800 dark:text-gray-100 text-base">
              {SELF_TEST_QUESTIONS.map((q, i) => (
                <li key={i}>
                  <div className="font-medium">{q}</div>
                  <div className="ml-2">
                    <span className="italic">{answers[i] || "No answer"}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {loading ? (
            <button
              type="button"
              disabled
              className="mt-4 bg-amber-600 dark:bg-yellow-700 text-white dark:text-black rounded-lg px-5 py-2 font-medium flex items-center justify-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRestart}
              className="mt-4 bg-amber-600 dark:bg-yellow-700 text-white dark:text-black rounded-lg px-5 py-2 font-medium hover:bg-amber-700 dark:hover:bg-yellow-800 transition-colors"
            >
              Restart Self Test
            </button>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 px-4 py-2 rounded-lg text-xs flex items-center gap-2 mt-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main per-question rendering
  return (
    <div className="flex flex-col h-screen max-h-screen bg-white dark:bg-neutral-900 shadow-sm overflow-hidden justify-center items-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 p-6 rounded-xl shadow space-y-6 mt-12 mb-8">
        <div className="flex items-center gap-4">
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
              Self Test
            </div>
            <div className="text-xs font-medium text-amber-600 dark:text-yellow-200">
              {profile?.full_name && <span>For {profile.full_name}</span>}
            </div>
          </div>
        </div>
        <div className="mt-2 mb-4">
          <div className="text-base text-gray-700 dark:text-neutral-200 font-semibold">
            Question {step + 1} of {SELF_TEST_QUESTIONS.length}
          </div>
          <div className="my-2 text-lg font-medium text-gray-800 dark:text-yellow-100">
            {SELF_TEST_QUESTIONS[step]}
          </div>
        </div>
        <form
          autoComplete="off"
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const answer = (fd.get("answer") as string).trim();
            if (!answer) return;
            handleAnswer(answer);
            e.currentTarget.reset();
          }}
        >
          <input
            name="answer"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-yellow-500 focus:border-transparent text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-yellow-50"
            placeholder="Your answer…"
            autoFocus
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-amber-600 dark:bg-yellow-700 text-white dark:text-black rounded-lg px-5 py-2 font-medium hover:bg-amber-700 dark:hover:bg-yellow-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-base"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Next"
            )}
          </button>
        </form>
        {error && (
          <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 px-4 py-2 rounded-lg text-xs flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
