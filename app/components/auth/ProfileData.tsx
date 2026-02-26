"use client";

import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { Calendar, Clock, Heart, Loader2, MapPin, User } from "lucide-react";
import { useState } from "react";

type ProfileInsert =
  Database["public"]["Tables"]["profiles"]["Insert"];

//   id: string
//   full_name: string
//   dob: string
//   birth_time?: string | null
//   birth_place: string
//   faith: 'sikhism' | 'hinduism'
//   display_currency?: 'INR' | 'USD'
//   credits?: number
//   is_admin?: boolean
//   created_at?: string
//   updated_at?: string


export default function ProfileData() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    dob: "",
    birth_time: "",
    birth_place: "",
    faith: "hinduism" as "hinduism" | "sikhism",
    display_currency: "INR" as "INR" | "USD",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {

        const profile: ProfileInsert = {
            id: user!.id,
            full_name: formData.full_name,
            dob: formData.dob,
            birth_time: formData.birth_time || null,
            birth_place: formData.birth_place,
            faith: formData.faith,
            display_currency: formData.display_currency,
            credits: 1,
          };
      const { error: insertError } = await supabase.from("profiles").insert(profile);

      if (insertError) throw insertError;

      await refreshProfile();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const faithGreeting =
    formData.faith === "sikhism"
      ? "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh"
      : "Namaste";
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 dark:bg-linear-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2 dark:text-amber-300">
            {faithGreeting}
          </h1>
          <p className="text-amber-700 dark:text-amber-200">Complete Your Vedic Profile</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:bg-zinc-950 dark:text-gray-100 dark:border-zinc-700"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:bg-zinc-950 dark:text-gray-100 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Birth Time (Optional)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="time"
                    value={formData.birth_time}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_time: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:bg-zinc-950 dark:text-gray-100 dark:border-zinc-700"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Birth Place
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={formData.birth_place}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_place: e.target.value })
                  }
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:bg-zinc-950 dark:text-gray-100 dark:border-zinc-700"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <Heart className="inline w-4 h-4 mr-1" />
                Your Faith
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, faith: "hinduism" })
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.faith === "hinduism"
                      ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-zinc-700 dark:hover:border-zinc-500"
                  }`}
                >
                  <div className="font-medium text-black dark:text-amber-200">Hinduism</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Vedic Mantras & Rituals
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, faith: "sikhism" })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.faith === "sikhism"
                      ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-zinc-700 dark:hover:border-zinc-500"
                  }`}
                >
                  <div className="font-medium text-black dark:text-amber-200">Sikhism</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Gurbani & Seva</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Currency Preference
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, display_currency: "INR" })
                  }
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.display_currency === "INR"
                      ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-zinc-700 dark:hover:border-zinc-500"
                  }`}
                >
                  <div className="font-medium text-black dark:text-amber-200">INR (₹)</div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, display_currency: "USD" })
                  }
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.display_currency === "USD"
                      ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-zinc-700 dark:hover:border-zinc-500"
                  }`}
                >
                  <div className="font-medium text-black dark:text-amber-200">USD ($)</div>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm dark:bg-rose-900/40 dark:text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-zinc-900"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                "Complete Setup"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
