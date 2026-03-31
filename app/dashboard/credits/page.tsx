"use client";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { CreditCard, Sparkles, Zap, Crown, Loader2, Check, Coins, Star, TrendingUp, Shield, Clock, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Package {
  id: string;
  name: string;
  credits: number;
  price_inr: number;
  price_usd: number;
  sort_order: number;
  popular?: boolean;
  savings?: number;
}

export default function CreditsView() {
  const { profile, refreshProfile } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedPackage, setPurchasedPackage] = useState<Package | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      
      // Add metadata to packages
      const enhancedPackages = (data || []).map((pkg, index) => ({
        ...pkg,
        popular: index === 1,
        savings: index === 2 ? 20 : index === 3 ? 30 : undefined,
      }));
      
      setPackages(enhancedPackages);
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: Package) => {
    if (!profile?.id) {
      console.error("Cannot purchase: missing profile id");
      return;
    }

    setProcessing(pkg.id);
    
    // Simulate payment processing
    // In production, integrate with Razorpay (INR) or Stripe (USD)
    setTimeout(async () => {
      try {
        // Update credits in database
        const { error } = await supabase
          .from("profiles")
          .update({
            credits: (profile?.credits || 0) + pkg.credits,
          })
          .eq("id", profile.id);

        if (error) throw error;
        
        await refreshProfile();
        setPurchasedPackage(pkg);
        setShowSuccess(true);
      } catch (error) {
        console.error("Purchase error:", error);
      } finally {
        setProcessing(null);
      }
    }, 1500);
  };

  const getIcon = (index: number) => {
    const icons = [Sparkles, Zap, CreditCard, Crown];
    return icons[index % icons.length];
  };

  const currencySymbol = profile?.display_currency === "USD" ? "$" : "₹";
  const getPrice = (pkg: Package) => {
    return profile?.display_currency === "USD" ? pkg.price_usd : pkg.price_inr;
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

  return (
    <div className="flex-1 flex flex-col h-full bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      <style jsx global>{`
        .credits-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .credits-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .credits-scroll::-webkit-scrollbar-thumb {
          background: #fcd34d;
          border-radius: 20px;
        }
        .dark .credits-scroll::-webkit-scrollbar-thumb {
          background: #b45309;
        }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-amber-600 via-amber-500 to-orange-500 dark:from-amber-800 dark:via-amber-700 dark:to-orange-800 px-6 md:px-8 py-6 shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div className="h-8 w-px bg-white/30" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Cosmic Credits
                  </h1>
                  <p className="text-amber-100 text-sm mt-0.5">
                    Unlock unlimited celestial wisdom
                  </p>
                </div>
              </div>
            </div>
            
            {/* Credit Balance Card */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
              <p className="text-amber-100 text-xs uppercase tracking-wider mb-1">Your Balance</p>
              <p className="text-3xl md:text-4xl font-bold text-white">
                {profile?.credits || 0}
              </p>
              <p className="text-amber-100 text-xs mt-1">Available Credits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto credits-scroll p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Packages Grid */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-amber-500" />
                Choose Your Path
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Select a package that resonates with your spiritual journey
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg, index) => {
                const Icon = getIcon(index);
                const isPopular = pkg.popular;
                const price = getPrice(pkg);
                const pricePerCredit = (price / pkg.credits).toFixed(2);
                
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className={`relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-300 ${
                      isPopular
                        ? "shadow-2xl shadow-amber-500/20 ring-2 ring-amber-500 dark:ring-amber-600"
                        : "shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                          MOST POPULAR
                        </div>
                      </div>
                    )}

                    {/* Savings Badge */}
                    {pkg.savings && (
                      <div className="absolute top-4 left-4">
                        <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                          Save {pkg.savings}%
                        </div>
                      </div>
                    )}

                    <div className="p-6 text-center">
                      {/* Icon */}
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                        isPopular 
                          ? "bg-linear-to-br from-amber-500 to-orange-500" 
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}>
                        <Icon className={`w-8 h-8 ${
                          isPopular ? "text-white" : "text-amber-600 dark:text-amber-500"
                        }`} />
                      </div>

                      {/* Package Name */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {pkg.name}
                      </h3>

                      {/* Credits */}
                      <div className="mb-3">
                        <span className="text-4xl font-bold text-amber-600 dark:text-amber-500">
                          {pkg.credits}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400"> credits</span>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {currencySymbol}{price}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {currencySymbol}{pricePerCredit} per prediction
                        </p>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-6 text-left">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>{pkg.credits} full predictions</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>5-part Acharya protocol</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Never expire</span>
                        </div>
                        {pkg.savings && (
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <TrendingUp className="w-4 h-4" />
                            <span>{pkg.savings}% savings</span>
                          </div>
                        )}
                      </div>

                      {/* Buy Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePurchase(pkg)}
                        disabled={processing === pkg.id}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                          isPopular
                            ? "bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25"
                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {processing === pkg.id ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          "Purchase Now"
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* How Credits Work */}
          <div className="bg-linear-to-r from-amber-600 via-amber-500 to-orange-500 dark:from-amber-900 dark:via-amber-800 dark:to-orange-900 rounded-2xl p-6 md:p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-6 h-6" />
              <h3 className="text-xl md:text-2xl font-bold">How Credits Work</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold mb-1">One Credit = One Prediction</p>
                  <p className="text-amber-100 text-sm">
                    Each prediction follows the complete 5-part Acharya protocol for comprehensive guidance
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold mb-1">Never Expire</p>
                  <p className="text-amber-100 text-sm">
                    Credits remain in your account forever. Use them anytime you need cosmic guidance
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold mb-1">Better Value</p>
                  <p className="text-amber-100 text-sm">
                    Larger packages offer better value per prediction for frequent seekers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Support */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Secure payment processing</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Instant credit delivery</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CreditCard className="w-4 h-4" />
              <span>Multiple payment methods</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4"
            >
              <Check className="w-10 h-10 text-green-600 dark:text-green-500" />
            </motion.div>
            <DialogTitle className="font-bold text-2xl text-gray-900 dark:text-white">
              Purchase Successful! 🎉
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 text-center pt-2">
              {purchasedPackage && (
                <>
                  <span className="font-bold text-amber-600 dark:text-amber-500 text-xl">
                    {purchasedPackage.credits}
                  </span>{" "}
                  credits have been added to your account.
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      ✨ The stars are aligned. Ask your first question now! ✨
                    </p>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowSuccess(false)}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowSuccess(false);
                // Navigate to chat
                window.location.href = "/dashboard";
              }}
              className="flex-1 px-4 py-2 bg-linear-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium hover:from-amber-700 hover:to-orange-700 transition-colors"
            >
              Start Chatting
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}