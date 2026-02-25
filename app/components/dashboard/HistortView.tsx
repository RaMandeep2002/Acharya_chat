import { useEffect, useState } from 'react';

import { History, Loader2, Clock, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';

interface Prediction {
  id: string;
  query: string;
  query_category: string;
  prediction_content: any;
  created_at: string;
}

export function HistoryView() {
  const { profile } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    loadHistory();
  }, [profile]);

  const loadHistory = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictions(
        (data || []).map((item) => ({
          ...item,
          created_at: item.created_at ?? "", // ensure created_at is always a string
        })) as Prediction[]
      );
    } catch (error) {
      console.error('Error loading history:', error);
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
      <div className="space-y-4">
        <button
          onClick={() => setSelectedPrediction(null)}
          className="text-amber-600 dark:text-yellow-400 hover:text-amber-700 dark:hover:text-yellow-200 font-medium"
        >
          ← Back to History
        </button>
        <PredictionDisplay prediction={selectedPrediction.prediction_content} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm">
      <div className="border-b border-gray-200 dark:border-neutral-800 px-8 py-6">
        <h2 className="text-2xl font-bold text-amber-900 dark:text-yellow-100 flex items-center gap-2">
          <History className="w-7 h-7" />
          Prediction History
        </h2>
        <p className="text-gray-600 dark:text-neutral-300 mt-1">
          {predictions.length} prediction{predictions.length !== 1 ? 's' : ''} consulted
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
                    {new Date(prediction.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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

function PredictionDisplay({ prediction }: { prediction: any }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-linear-to-r from-amber-600 to-orange-600 dark:bg-gradient-to-r dark:from-yellow-800 dark:to-yellow-700 px-8 py-6 text-white dark:text-yellow-50">
        <h2 className="text-3xl font-bold mb-2">Your Vedic Roadmap</h2>
        <p className="text-amber-100 dark:text-yellow-200">
          {/* {prediction.metadata.userName}, {prediction.metadata.age} years */}
        </p>
      </div>

      <div className="p-8 space-y-8">
        <section>
          <h3 className="text-2xl font-bold text-amber-900 dark:text-yellow-100 mb-4">
            1. THE DIAGNOSIS
          </h3>
          <div className="prose prose-amber max-w-none text-gray-700 dark:text-neutral-300">
            {prediction.diagnosis}
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-amber-900 dark:text-yellow-100 mb-4">
            2. VELOCITY CHECK
          </h3>
          <div className="prose prose-amber max-w-none text-gray-700 dark:text-neutral-300 whitespace-pre-line">
            {prediction.velocity}
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-amber-900 dark:text-yellow-100 mb-4">
            3. THE GOLDEN WINDOW
          </h3>
          <div className="prose prose-amber max-w-none text-gray-700 dark:text-neutral-300 whitespace-pre-line">
            {prediction.goldenWindow}
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-amber-900 dark:text-yellow-100 mb-4">
            4. THE PROTOCOL
          </h3>
          <div className="prose prose-amber max-w-none text-gray-700 dark:text-neutral-300 whitespace-pre-line">
            {prediction.protocol}
          </div>
        </section>

        <section className="bg-amber-50 dark:bg-neutral-800 -mx-8 -mb-8 px-8 py-6">
          <h3 className="text-2xl font-bold text-amber-900 dark:text-yellow-100 mb-4">
            5. KARMIC REMEDY
          </h3>
          <div className="prose prose-amber max-w-none text-gray-700 dark:text-neutral-300 mb-6 whitespace-pre-line">
            {prediction.remedy}
          </div>
          <div className="bg-linear-to-r from-amber-600 to-orange-600 dark:bg-gradient-to-r dark:from-yellow-800 dark:to-yellow-700 text-white dark:text-yellow-50 p-6 rounded-lg">
            <p className="font-bold mb-2">THE VAULT IS LOCKED:</p>
            <p>{prediction.hook}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
