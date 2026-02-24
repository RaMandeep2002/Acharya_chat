import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Calendar, DollarSign, Heart, Loader2, MapPin, Settings, User } from "lucide-react";
import { useState } from "react";

export default function SettingsView(){
    const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    birth_place: profile?.birth_place || '',
    faith: profile?.faith || 'hinduism',
    display_currency: profile?.display_currency || 'INR',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          birth_place: formData.birth_place,
          faith: formData.faith as 'hinduism' | 'sikhism',
          display_currency: formData.display_currency as 'INR' | 'USD',
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile!.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess('Settings updated successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
    return(
        <div className="bg-white rounded-xl shadow-sm">
      <div className="border-b border-gray-200 px-8 py-6">
        <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Settings className="w-7 h-7" />
          Account Settings
        </h2>
        <p className="text-gray-600 mt-1">Manage your profile and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-1" />
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date of Birth
            </label>
            <input
              type="text"
              value={new Date(profile?.dob || '').toLocaleDateString()}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Birth date cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Birth Place
            </label>
            <input
              type="text"
              value={formData.birth_place}
              onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Heart className="inline w-4 h-4 mr-1" />
            Faith Preference
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, faith: 'hinduism' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.faith === 'hinduism'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">Hinduism</div>
              <div className="text-sm text-gray-600">Vedic Mantras & Rituals</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, faith: 'sikhism' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.faith === 'sikhism'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">Sikhism</div>
              <div className="text-sm text-gray-600">Gurbani & Seva</div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline w-4 h-4 mr-1" />
            Currency Preference
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, display_currency: 'INR' })}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.display_currency === 'INR'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">INR (₹)</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, display_currency: 'USD' })}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.display_currency === 'USD'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">USD ($)</div>
            </button>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
    )
}