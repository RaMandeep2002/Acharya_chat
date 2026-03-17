import { useEffect, useState, useCallback } from 'react';
import { Shield, TrendingUp, Users, Sparkles, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

// Define the shape of the statistics displayed in the dashboard
interface Stats {
  totalUsers: number;
  totalRevenue: number;
  totalPredictions: number;
  todayRevenue: number;
  todayPredictions: number;
  todayNewUsers: number;
}

// Define the type for recent user objects
type RecentUser = 
  Database["public"]["Tables"]["profiles"]["Row"];
  

export function AdminView() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalPredictions: 0,
    todayRevenue: 0,
    todayPredictions: 0,
    todayNewUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch today's date in YYYY-MM-DD format for filtering
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Fetch all user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
        console.log("profiles ====>", profiles);

      if (profilesError) throw profilesError;

      // 2. Fetch all predictions
      const { data: predictions, error: predictionsError } = await supabase
        .from('predictions')
        .select('id, created_at');

      if (predictionsError) throw predictionsError;

      // 3. Fetch all completed transactions (for revenue)
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, created_at, status')
        .eq('status', 'completed');

      if (transactionsError) throw transactionsError;

      // Calculate statistics:
      // Calculate the total number of users. If profiles is null or undefined, default to 0.
      const totalUsers = Array.isArray(profiles) ? profiles.length : 0;
      console.log("Total users ====>", totalUsers);
      const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const todayRevenue = transactions
        ? transactions.filter(t => t.created_at && t.created_at.startsWith(todayStr))
          .reduce((sum, t) => sum + Number(t.amount), 0)
        : 0;
      const todayPredictions = predictions
        ? predictions.filter(p => p.created_at && p.created_at.startsWith(todayStr)).length
        : 0;
      const todayNewUsers = profiles
        ? profiles.filter(p => p.created_at && p.created_at.startsWith(todayStr)).length
        : 0;

        console.log("todayNewUsers ----> ", todayNewUsers)

      setStats({
        totalUsers: profiles?.length || 0,
        totalRevenue,
        totalPredictions: predictions?.length || 0,
        todayRevenue,
        todayPredictions,
        todayNewUsers,
      });
      
      // 4. Use all profiles as the user list (not just recent ones)
      setRecentUsers((profiles as RecentUser[]) ?? []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" aria-label="Loading..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2 mb-6">
          <Shield className="w-7 h-7" />
          Admin Command Center
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
            <Users className="w-10 h-10 text-blue-600 mb-3" />
            <p className="text-sm text-blue-700 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
            <p className="text-xs text-blue-600 mt-2">+{stats.todayNewUsers} today</p>
          </div>

          <div className="bg-linear-to-br from-green-50 to-green-100 p-6 rounded-xl">
            <DollarSign className="w-10 h-10 text-green-600 mb-3" />
            <p className="text-sm text-green-700 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-900">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-2">₹{stats.todayRevenue.toLocaleString()} today</p>
          </div>

          <div className="bg-linear-to-br from-amber-50 to-amber-100 p-6 rounded-xl">
            <Sparkles className="w-10 h-10 text-amber-600 mb-3" />
            <p className="text-sm text-amber-700 mb-1">Total Predictions</p>
            <p className="text-3xl font-bold text-amber-900">{stats.totalPredictions}</p>
            <p className="text-xs text-amber-600 mt-2">+{stats.todayPredictions} today</p>
          </div>
        </div>

        <div className="bg-linear-to-r from-amber-600 to-orange-600 p-6 rounded-xl text-white">
          <TrendingUp className="w-8 h-8 mb-2" />
          <p className="text-sm text-amber-100 mb-1">Net Profit</p>
          <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-amber-100 mt-2">Revenue - API costs tracked separately</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200 px-8 py-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Users</h3>
          <p className="text-sm text-gray-600 mt-1">Latest user registrations</p>
        </div>
        <div className="divide-y divide-gray-200">
          {recentUsers.length === 0 ? (
            <div className="px-8 py-12 text-center text-gray-500">No users yet</div>
          ) : (
            recentUsers.map((user, index) => (
              <div key={index} className="px-8 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{user.full_name || <span className="italic text-gray-400">No name</span>}</p>
                  <p className="text-sm text-gray-500">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Credits</p>
                  <p className="font-bold text-amber-600">{user.credits ?? 0}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
