"use client";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import {
  Calendar,
  DollarSign,
  Heart,
  Loader2,
  MapPin,
  Settings,
  User,
  Moon,
  Sun,
  Bell,
  BellOff,
  Save,
  Trash2,
  // Lock,
  // Eye,
  // EyeOff,
  Shield,

} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function SettingsView() {
  const { profile, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");

  const [loading, setLoading] = useState(false);
  // const [showPassword, setShowPassword] = useState(false);
  // const [passwordData, setPasswordData] = useState({
  //   newPassword: "",
  //   confirmPassword: "",
  // });

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    dob: profile?.dob || "",
    birth_place: profile?.birth_place || "",
    faith: profile?.faith || "hinduism",
    display_currency: profile?.display_currency || "INR",
    // email: profile?.email || "",
  });

  const [preferences, setPreferences] = useState({
    darkMode: true,
    notifications: true,
    emailUpdates: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        dob: profile.dob || "",
        birth_place: profile.birth_place || "",
        faith: profile.faith || "hinduism",
        display_currency: profile.display_currency || "INR",
        // email: profile.email || "",
      });
    }

    // Load preferences from localStorage
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      setPreferences((prev) => ({ ...prev, darkMode: savedDarkMode === "true" }));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          dob: formData.dob,
          birth_place: formData.birth_place,
          faith: formData.faith as "hinduism" | "sikhism",
          display_currency: formData.display_currency as "INR" | "USD",
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile!.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success("Settings updated successfully! 🌟");
      
      if (intent === "complete_profile") {
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update settings";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // const handlePasswordChange = async () => {
  //   if (passwordData.newPassword !== passwordData.confirmPassword) {
  //     toast.error("Passwords do not match");
  //     return;
  //   }
  //   if (passwordData.newPassword.length < 6) {
  //     toast.error("Password must be at least 6 characters");
  //     return;
  //   }

  //   try {
  //     const { error } = await supabase.auth.updateUser({
  //       password: passwordData.newPassword,
  //     });
  //     if (error) throw error;
  //     toast.success("Password updated successfully! 🔒");
  //     setPasswordData({ newPassword: "", confirmPassword: "" });
  //   } catch (error) {
  //     toast.error("Failed to update password");
  //   }
  // };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "⚠️ Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      // Delete user data from profiles table
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profile!.id);

      if (error) throw error;

      // Sign out user
      await supabase.auth.signOut();
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete account");
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !preferences.darkMode;
    setPreferences((prev) => ({ ...prev, darkMode: newDarkMode }));
    localStorage.setItem("darkMode", String(newDarkMode));
    document.documentElement.classList.toggle("dark", newDarkMode);
    toast.success(`${newDarkMode ? "Dark" : "Light"} mode activated 🌙`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      <style jsx global>{`
        .settings-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .settings-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .settings-scroll::-webkit-scrollbar-thumb {
          background: #fcd34d;
          border-radius: 20px;
        }
        .dark .settings-scroll::-webkit-scrollbar-thumb {
          background: #b45309;
        }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-amber-600 via-amber-500 to-orange-500 dark:from-amber-800 dark:via-amber-700 dark:to-orange-800 px-6 md:px-8 py-6 shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div className="h-8 w-px bg-white/30" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Sacred Settings
              </h1>
              <p className="text-amber-100 text-sm mt-0.5">
                {intent === "complete_profile" 
                  ? "Complete your profile for personalized cosmic guidance" 
                  : "Manage your spiritual journey preferences"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto settings-scroll p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-linear-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  Personal Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Your spiritual identity and birth details
                </p>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>


                {/* DOB and Birth Place */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      disabled={!!profile?.dob}
                      className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                        profile?.dob 
                          ? "bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed" 
                          : "focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      }`}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {profile?.dob ? "Birth date is permanent" : "Used for astrological calculations"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Birth Place
                    </label>
                    <input
                      type="text"
                      value={formData.birth_place}
                      onChange={(e) =>
                        setFormData({ ...formData, birth_place: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Spiritual Preferences */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-linear-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  Spiritual Path
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose your spiritual tradition for personalized guidance
                </p>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Faith Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Faith Tradition
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, faith: "hinduism" })}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.faith === "hinduism"
                          ? "border-amber-500 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/30 shadow-md"
                          : "border-gray-200 hover:border-amber-300 dark:border-gray-700 dark:hover:border-amber-700"
                      }`}
                    >
                      <div className="text-2xl mb-2">🕉️</div>
                      <div className="font-semibold text-gray-900 dark:text-white">Hinduism</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Vedic wisdom & rituals
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, faith: "sikhism" })}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.faith === "sikhism"
                          ? "border-amber-500 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/30 shadow-md"
                          : "border-gray-200 hover:border-amber-300 dark:border-gray-700 dark:hover:border-amber-700"
                      }`}
                    >
                      <div className="text-2xl mb-2">☬</div>
                      <div className="font-semibold text-gray-900 dark:text-white">Sikhism</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Gurbani & seva
                      </div>
                    </button>
                  </div>
                </div>

                {/* Currency Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Currency
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, display_currency: "INR" })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.display_currency === "INR"
                          ? "border-amber-500 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/30"
                          : "border-gray-200 hover:border-amber-300 dark:border-gray-700"
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">INR (₹)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, display_currency: "USD" })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.display_currency === "USD"
                          ? "border-amber-500 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/30"
                          : "border-gray-200 hover:border-amber-300 dark:border-gray-700"
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">USD ($)</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security */}
       
            {/* Preferences */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-linear-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  App Preferences
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Customize your experience
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {preferences.darkMode ? (
                      <Moon className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Sun className="w-5 h-5 text-amber-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cosmic dark theme</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.darkMode ? "bg-amber-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.darkMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {preferences.notifications ? (
                      <Bell className="w-5 h-5 text-amber-600" />
                    ) : (
                      <BellOff className="w-5 h-5 text-amber-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive cosmic updates</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.notifications ? "bg-amber-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.notifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 py-3 rounded-xl font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-6 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 border border-red-200 dark:border-red-800"
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}