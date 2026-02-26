import { useEffect, useState } from "react";
import { History, Loader2, Clock, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/app/context/AuthContext";
import ReactMarkdown from "react-markdown";

// Define the shape of the prediction_content
interface PredictionContent {
  hook: string;
  remedy: string;
  metadata: {
    age: number;
    dob: string;
    faith: string;
    category: string;
    userName: string;
    timestamp: string;
  };
  protocol: string;
  velocity: string;
  aiContent: string;
  diagnosis: string;
  goldenWindow: string;
}

interface Prediction {
  id: string;
  query: string;
  query_category: string;
  prediction_content: PredictionContent;
  created_at: string;
}

export function HistoryView() {
  const { profile } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] =
    useState<Prediction | null>(null);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const loadHistory = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const formattedPredictions: Prediction[] = (data || []).map((item) => ({
        id: item.id,
        query: item.query,
        query_category: item.query_category,
        created_at: item.created_at ?? "",
        prediction_content:
          item.prediction_content as unknown as PredictionContent,
      }));
      console.log("formattedPredictions -----------> ", formattedPredictions);
      setPredictions(formattedPredictions);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (selectedPrediction) {
    return (
      <div className="space-y-4 p-2">
        <button
          onClick={() => setSelectedPrediction(null)}
          className="text-amber-600 dark:text-yellow-400 hover:text-amber-700 dark:hover:text-yellow-200 font-medium"
        >
          ← Back to History
        </button>
        <SimpleAIPredictionDisplay
          predictionContent={selectedPrediction.prediction_content}
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-4">
      <div className="border-b border-gray-200 dark:border-neutral-800 px-8 py-6">
        <h2 className="text-2xl font-bold text-amber-900 dark:text-yellow-100 flex items-center gap-2">
          <History className="w-7 h-7" />
          Prediction History
        </h2>
        <p className="text-gray-600 dark:text-neutral-300 mt-1">
          {predictions.length} prediction{predictions.length !== 1 ? "s" : ""}{" "}
          consulted
        </p>
      </div>

      {predictions.length === 0 ? (
        <div className="px-8 py-12 text-center">
          <History className="w-16 h-16 text-gray-300 dark:text-neutral-700 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-neutral-300">
            No predictions yet. Ask your first question!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-neutral-800">
          {predictions.map((prediction) => (
            <button
              key={prediction.id}
              onClick={() => setSelectedPrediction(prediction)}
              className="w-full px-8 py-6 hover:bg-amber-50 dark:hover:bg-neutral-800 transition-colors text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-amber-600 dark:text-yellow-400 shrink-0" />
                    <span className="text-sm font-medium text-amber-600 dark:text-yellow-400">
                      {prediction.query_category}
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-yellow-100 font-medium mb-2 line-clamp-2">
                    {prediction.query}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400">
                    <Clock className="w-4 h-4" />
                    {new Date(prediction.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </div>
                </div>
                <div className="text-amber-600 dark:text-yellow-400 text-sm font-medium shrink-0">
                  View →
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple display to show the AI content as the main message
function SimpleAIPredictionDisplay({
  predictionContent,
}: {
  predictionContent: PredictionContent;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-linear-to-r from-amber-600 to-orange-600 dark:bg-linear-to-r dark:from-yellow-800 dark:to-yellow-700 px-8 py-6 text-white dark:text-yellow-50">
        <h2 className="text-3xl font-bold mb-2">Your Message</h2>
      </div>
      <div className="p-8">
        <div className="prose prose-amber max-w-none text-gray-700 dark:text-neutral-300 whitespace-pre-line text-md">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => (
                <h1
                  className="text-4xl font-black tracking-tight mb-8 mt-4 text-amber-900 dark:text-yellow-100 border-b-4 border-amber-400 dark:border-yellow-800 pb-3 bg-amber-50/40 dark:bg-yellow-900/30 rounded-t-xl shadow-inner drop-shadow-sm"
                  {...props}
                />
              ),
              h2: ({ ...props }) => (
                <h2
                  className="text-2xl font-bold mt-10 mb-6 text-amber-700 dark:text-yellow-300 border-b-2 border-amber-200 dark:border-yellow-700 pb-2 bg-amber-100/50 dark:bg-yellow-950/10 rounded-t shadow"
                  {...props}
                />
              ),
              h3: ({ ...props }) => (
                <h3
                  className="text-lg font-semibold text-amber-700 dark:text-yellow-300 pl-2 border-l-4 border-amber-400 dark:border-yellow-700 bg-amber-50/30 dark:bg-yellow-900/10"
                  {...props}
                />
              ),
              p: ({ ...props }) => (
                <p
                  className="text-md sm:text-lg text-gray-800 dark:text-neutral-200 leading-relaxed"
                  {...props}
                />
              ),
              ul: ({ ...props }) => (
                <ul
                  className="list-disc list-inside ml-2  pl-2 marker:text-amber-600 dark:marker:text-yellow-300"
                  {...props}
                />
              ),
              ol: ({ ...props }) => (
                <ol
                  className="list-decimal list-inside ml-6 pl-2 space-y-1 marker:text-amber-600 dark:marker:text-yellow-300"
                  {...props}
                />
              ),
              li: ({ ...props }) => <li className="mb-1 pl-1" {...props} />,
              strong: ({ ...props }) => (
                <strong
                  className="font-extrabold text-amber-800 dark:text-yellow-200"
                  {...props}
                />
              ),
              em: ({ ...props }) => (
                <em
                  className="italic font-medium text-amber-700 dark:text-yellow-300 underline decoration-amber-400 dark:decoration-yellow-300"
                  {...props}
                />
              ),
              blockquote: ({ ...props }) => (
                <blockquote
                  className="border-l-8 border-amber-400 dark:border-yellow-500 pl-7 italic text-amber-900 dark:text-yellow-100 bg-amber-50 dark:bg-neutral-900 py-3 my-6 rounded-md shadow-md"
                  {...props}
                />
              ),
            }}
          >
            {predictionContent.aiContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
