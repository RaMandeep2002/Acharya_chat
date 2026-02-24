import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { CreditCard, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Package {
  id: string;
  name: string;
  credits: number;
  price_inr: number;
  price_usd: number;
  sort_order: number;
}

export default function CreditsView() {
  const { profile } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);

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
      setPackages(data || []);
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (index: number) => {
    const icons = [Sparkles, Zap, CreditCard, Crown];
    return icons[index] || Sparkles;
  };

  const currencySymbol = profile?.display_currency === "USD" ? "$" : "₹";
  const getPrice = (pkg: Package) => {
    return profile?.display_currency === "USD" ? pkg.price_usd : pkg.price_inr;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 m-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-amber-900 dark:text-yellow-100">Your Credits</h2>
            <p className="text-gray-600 dark:text-neutral-300 mt-1">
              Purchase prediction credits to unlock cosmic wisdom
            </p>
          </div>
          <div className="bg-amber-100 dark:bg-neutral-800 px-6 py-4 rounded-xl">
            <p className="text-sm text-amber-700 dark:text-yellow-200 mb-1">Available Credits</p>
            <p className="text-4xl font-bold text-amber-900 dark:text-yellow-100">
              {profile?.credits || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((pkg, index) => {
          const Icon = getIcon(index);
          const isPopular = index === 1;
          return (
            <div
              key={pkg.id}
              className={`bg-white dark:bg-neutral-900 rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-105 ${
                isPopular ? "ring-2 ring-amber-600 dark:ring-yellow-500" : ""
              }`}
            >
              {isPopular && (
                <div className="bg-amber-600 dark:bg-yellow-700 text-white dark:text-neutral-900 text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <Icon
                  className={`w-12 h-12 mb-4 ${isPopular ? "text-amber-600 dark:text-yellow-500" : "text-gray-400 dark:text-neutral-400"}`}
                />
                <h3 className="text-xl font-bold text-gray-900 dark:text-yellow-100 mb-2">
                  {pkg.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-amber-900 dark:text-yellow-100">
                    {currencySymbol}
                    {getPrice(pkg)}
                  </span>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-neutral-300">
                    <span className="font-bold text-2xl text-amber-600 dark:text-yellow-400">
                      {pkg.credits}
                    </span>{" "}
                    Credits
                  </p>
                  <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                    {currencySymbol}
                    {(getPrice(pkg) / pkg.credits).toFixed(2)} per prediction
                  </p>
                </div>
                <button className="w-full bg-amber-600 dark:bg-yellow-700 text-white dark:text-neutral-900 py-3 rounded-lg font-medium hover:bg-amber-700 dark:hover:bg-yellow-800 transition-colors">
                  Purchase Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-linear-to-r from-amber-600 to-orange-600 dark:bg-gradient-to-r dark:from-yellow-800 dark:to-yellow-700 rounded-xl shadow-sm p-8 text-white dark:text-yellow-50">
        <h3 className="text-2xl font-bold mb-4">How Credits Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold mb-2">1</div>
            <p className="text-amber-100 dark:text-yellow-200">
              One credit equals one complete prediction following the 5-part
              Acharya protocol
            </p>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">2</div>
            <p className="text-amber-100 dark:text-yellow-200">
              Credits never expire and can be used anytime you need cosmic
              guidance
            </p>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">3</div>
            <p className="text-amber-100 dark:text-yellow-200">
              Larger packages offer better value per prediction for frequent
              seekers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
