"use client";
import { useEffect, useState } from "react";
import { History, Clock, Tag, Search, Calendar, ChevronRight, Inbox, Sparkles, Star, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/app/context/AuthContext";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

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

export default function HistoryView() {
  const { profile } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPredictions(predictions);
    } else {
      const filtered = predictions.filter(
        (pred) =>
          pred.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pred.query_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pred.prediction_content?.aiContent?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPredictions(filtered);
    }
  }, [searchQuery, predictions]);

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
      setPredictions(formattedPredictions);
      setFilteredPredictions(formattedPredictions);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-4 border-amber-200 dark:border-amber-800/50 animate-ping" />
          <div className="relative w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (selectedPrediction) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex-1 flex flex-col h-full overflow-hidden"
      >
        {/* Back Button */}
        <div className="px-4 md:px-6 pt-4 pb-2">
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPrediction(null)}
            className="group flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to History
          </motion.button>
        </div>
        
        {/* Prediction Detail */}
        <div className="flex-1 overflow-hidden pb-4 px-4 md:px-6">
          <SimpleAIPredictionDisplay
            predictionContent={selectedPrediction.prediction_content}
            query={selectedPrediction.query}
            category={selectedPrediction.query_category}
            date={selectedPrediction.created_at}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      <style jsx global>{`
        .history-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .history-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .history-scroll::-webkit-scrollbar-thumb {
          background: #fcd34d;
          border-radius: 20px;
        }
        .dark .history-scroll::-webkit-scrollbar-thumb {
          background: #b45309;
        }
        .history-scroll::-webkit-scrollbar-thumb:hover {
          background: #f59e0b;
        }
      `}</style>

      {/* Header Section */}
      <div className="relative overflow-hidden bg-linear-to-r from-amber-600 via-amber-500 to-orange-500 dark:from-amber-800 dark:via-amber-700 dark:to-orange-800 px-4 md:px-8 py-6 shrink-0">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <History className="w-6 h-6 text-white" />
            </div>
            <div className="h-8 w-px bg-white/30" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Cosmic History
              </h1>
              <p className="text-amber-100 text-sm mt-0.5">
                {predictions.length} {predictions.length === 1 ? "prediction" : "predictions"} received
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 md:px-8 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by question, category, or insight..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto history-scroll p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {filteredPredictions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {searchQuery ? (
                    <Search className="w-10 h-10 text-gray-400" />
                  ) : (
                    <Inbox className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {searchQuery ? "No matching predictions" : "No predictions yet"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery 
                    ? "Try a different search term" 
                    : "Ask the cosmos a question to see your history here"}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredPredictions.map((prediction, index) => (
                  <motion.button
                    key={prediction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedPrediction(prediction)}
                    className="group w-full text-left bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Meta Info */}
                        <div className="flex items-center flex-wrap gap-3 mb-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-xs font-medium text-amber-700 dark:text-amber-300">
                            <Tag className="w-3 h-3" />
                            {prediction.query_category}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(prediction.created_at), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {format(new Date(prediction.created_at), "h:mm a")}
                          </div>
                        </div>

                        {/* Question */}
                        <h3 className="text-gray-900 dark:text-white font-semibold text-base md:text-lg mb-2 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {prediction.query}
                        </h3>

                        {/* Preview */}
                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                          {prediction.prediction_content?.aiContent
                            ?.replace(/[#*]/g, "")
                            .substring(0, 120)}
                          {prediction.prediction_content?.aiContent?.length > 120 ? "..." : ""}
                        </p>
                      </div>

                      {/* Icon */}
                      <div className="shrink-0">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300">
                          <ChevronRight className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Enhanced Simple display to show the AI content as the main message
function SimpleAIPredictionDisplay({
  predictionContent,
  query,
  category,
  date,
}: {
  predictionContent: PredictionContent;
  query?: string;
  category?: string;
  date?: string;
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden relative"
    >
      <style jsx global>{`
        .prediction-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .prediction-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .prediction-scroll::-webkit-scrollbar-thumb {
          background: #fcd34d;
          border-radius: 20px;
        }
        .dark .prediction-scroll::-webkit-scrollbar-thumb {
          background: #b45309;
        }
      `}</style>

      {/* Premium Header */}
      <div className="relative bg-linear-to-r from-amber-600 via-amber-500 to-orange-500 dark:from-amber-800 dark:via-amber-700 dark:to-orange-800 px-6 md:px-8 py-6 text-white shrink-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          {/* Question Badge */}
          {query && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-medium">Your Question</span>
              </div>
              <p className="text-lg md:text-xl font-semibold mt-3 leading-relaxed">
                {query}
              </p>
            </div>
          )}
          
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-white/20">
            {category && (
              <div className="flex items-center gap-1.5 text-sm text-amber-100">
                <Tag className="w-3.5 h-3.5" />
                {category}
              </div>
            )}
            {date && (
              <div className="flex items-center gap-1.5 text-sm text-amber-100">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(date), "MMMM d, yyyy 'at' h:mm a")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto prediction-scroll p-6 md:p-10 bg-linear-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="prose prose-amber max-w-none dark:prose-invert">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children, ...props }) => (
                <h1
                  className="text-3xl md:text-4xl font-bold mb-6 mt-8 first:mt-0 text-amber-800 dark:text-amber-400 border-l-4 border-amber-500 pl-4"
                  {...props}
                >
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2
                  className="text-2xl font-bold mt-8 mb-4 text-amber-700 dark:text-amber-400"
                  {...props}
                >
                  <span className="border-b-2 border-amber-400 pb-1">{children}</span>
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3
                  className="text-xl font-semibold mt-6 mb-3 text-amber-600 dark:text-amber-400"
                  {...props}
                >
                  ✦ {children}
                </h3>
              ),
              p: ({ children, ...props }) => (
                <p
                  className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
                  {...props}
                >
                  {children}
                </p>
              ),
              ul: ({ children, ...props }) => (
                <ul className="space-y-2 my-4" {...props}>
                  {children}
                </ul>
              ),
              li: ({ children, ...props }) => (
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-amber-500 mt-1">✦</span>
                  <span>{children}</span>
                </li>
              ),
              strong: ({ children, ...props }) => (
                <strong
                  className="font-bold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1 rounded"
                  {...props}
                >
                  {children}
                </strong>
              ),
              em: ({ children, ...props }) => (
                <em
                  className="italic text-amber-700 dark:text-amber-400 not-italic font-medium"
                  {...props}
                >
                  {children}
                </em>
              ),
              blockquote: ({ children, ...props }) => (
                <blockquote
                  className="border-l-4 border-amber-400 pl-4 py-2 my-6 italic text-gray-600 dark:text-gray-400 bg-amber-50/50 dark:bg-amber-950/20 rounded-r-lg"
                  {...props}
                >
                  {children}
                </blockquote>
              ),
              hr: () => (
                <div className="my-8 flex items-center justify-center gap-2">
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-amber-300 to-transparent" />
                  <Star className="w-4 h-4 text-amber-400" />
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-amber-300 to-transparent" />
                </div>
              ),
            }}
          >
            {predictionContent.aiContent}
          </Markdown>
        </div>
      </div>

      {/* Footer with Sacred Symbol */}
      <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-950/50">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>🕉</span>
          <span>•</span>
          <span>☸</span>
          <span>•</span>
          <span>✴</span>
          <span className="mx-2">Sacred Wisdom</span>
          <span>✴</span>
          <span>•</span>
          <span>☸</span>
          <span>•</span>
          <span>🕉</span>
        </div>
      </div>
    </motion.div>
  );
}