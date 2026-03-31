import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
// import { FcGoogle } from "react-icons/fc";

export default function Authform() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();
  // const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // 🚫 HARD STOP duplicate calls

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setOauthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        setError(error.message);
      }
    } catch (err: unknown) {
      const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    setError(errorMessage);
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 dark:bg-linear-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-300 mb-2">Acharya</h1>
          <p className="text-amber-700 dark:text-amber-200">Your Vedic Intelligence Engine</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-zinc-800">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                isLogin
                  ? "bg-amber-600 text-white dark:bg-amber-500 dark:text-zinc-900"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                !isLogin
                  ? "bg-amber-600 text-white dark:bg-amber-500 dark:text-zinc-900"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={oauthLoading}
            className="w-full flex items-center justify-center gap-3 py-3 mb-4 border border-gray-200 dark:border-zinc-700 rounded-lg font-medium transition-colors hover:bg-gray-50 bg-white text-gray-700 focus:outline-none disabled:opacity-60 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-gray-200"
            aria-label="Sign in with Google"
          >
            {oauthLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              // <span className="inline-flex items-center justify-center w-6 h-6">
                <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                <g>
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.55 1.22 8.71 3.25l6.46-6.45C34.37 2.53 29.7 0 24 0 14.82 0 6.81 5.91 2.99 14.44l7.52 5.84C12.5 14.08 17.78 9.5 24 9.
                  5z"/>
                  <path fill="#34A853" d="M46.16 24.5c0-1.63-.15-3.18-.43-4.67H24v9.17h12.44c-.54 2.86-2.12 5.28-4.52 6.91l7.34 5.7C43.85 37.2 46.16 31.45 46.16 24.5z"/>
                  <path fill="#FBBC05" d="M10.51 28.2A14.43 14.43 0 0 1 8.73 24c0-1.47.25-2.89.69-4.2L1.9 14.01a24.035 24.035 0 0 0 0 19.98l8.61-5.79z"/>
                  <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.15 15.91-5.86l-7.34-5.7c-2.1 1.43-4.8 2.26-8.57 2.26-6.17 0-11.39-4.13-13.28-9.67l-8.52 6.06C6.8 42.06 14.68 48 
                  24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </g>
              </svg>
              // </span>
            )}
            {oauthLoading ? "Processing..." : "Continue with Google"}
          </button>

          <div className="relative mb-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-zinc-900 px-2 text-gray-400 dark:text-gray-400">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-zinc-950 dark:text-gray-100"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                   className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-zinc-950 dark:text-gray-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-rose-900/40 text-red-600 dark:text-rose-300 px-4 py-3 rounded-lg text-sm">
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
                  Processing...
                </>
              ) : (
                <>{isLogin ? "Sign In" : "Create Account"}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
