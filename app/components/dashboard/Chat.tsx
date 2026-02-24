// "use client";
import { useState } from "react";
import PredictionCardView from "../common/PredictionViewCard";
import { Loader2 } from "lucide-react";

export default function Chat() {

  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    setLoading(true);
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: input }),
    });
    if (!res.ok) {
      console.error(`Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    // Set response as HTML string (assume Gemini returns markdown-like or html content)
    setResponse(data.text);
    setLoading(false);
  };
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" aria-label="Loading..." />
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center gap-3 w-full max-w-xl mx-auto mt-8">
        <input
          className="flex-1 p-3 rounded-xl border border-amber-300 bg-white shadow-inner outline-none focus:ring-2 focus:ring-amber-500 text-lg transition"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your future, career, health..."
        />
        <button
          onClick={sendPrompt}
          className="ml-2 px-7 py-3 rounded-xl bg-linear-to-r from-amber-400 via-orange-300 to-amber-500 text-white font-semibold shadow-lg hover:shadow-xl hover:bg-amber-600 transition-all text-lg"
        >
          Ask
        </button>
      </div>
      {/* Use dangerouslySetInnerHTML to render HTML formatting */}
      <div className="mt-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" aria-label="Loading..." />
          </div>
        ) : response ? (
          <PredictionCardView content={response} />
        ) : null}
      </div>
    </div>
  );
}
