import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Wallet,
  Car,
  Coins,
  History,
  ShieldCheck,
  TrendingUp,
  Cpu,
  AlertOctagon,
  UserCheck,
} from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const showAI = import.meta.env.VITE_PROJECT_STAGE === '2';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalPayments: 0,
    recentTransactions: [],
    totalRevenue: 0,
    vehiclesCount: 0,
    transactionsCount: 0,
    usersCount: 0,
    chartData: [],
    // AI specific counters
    aiDetectionsCount: 0,
    ocrAccuracy: 92.4, // Starter accuracy percentage
    blacklistedCount: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [transRes, vehicleRes, plazasRes, detectionRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/vehicles'),
        api.get('/plazas'),
        showAI ? api.get('/detections') : Promise.resolve({ data: [] }),
      ]);

      const transactions = transRes.data;
      const vehicles = vehicleRes.data;
      const detections = detectionRes.data;

      // Filter blacklisted vehicles
      const blacklistedVehicles = vehicles.filter((v) => v.status === 'Blacklisted');

      if (isAdmin) {
        const successTrans = transactions.filter((t) => t.status === 'Success');
        const revenue = successTrans.reduce((acc, t) => acc + t.amount, 0);

        // Group revenue by date
        const dateMap = {};
        successTrans.forEach((t) => {
          const dateStr = new Date(t.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          });
          dateMap[dateStr] = (dateMap[dateStr] || 0) + t.amount;
        });

        const chartData = Object.keys(dateMap).map((date) => ({
          date,
          revenue: dateMap[date],
        })).reverse().slice(-7);

        const finalChartData = chartData.length > 0 ? chartData : [
          { date: 'Mon', revenue: 120 },
          { date: 'Tue', revenue: 300 },
          { date: 'Wed', revenue: 180 },
          { date: 'Thu', revenue: 450 },
          { date: 'Fri', revenue: 320 },
          { date: 'Sat', revenue: 600 },
          { date: 'Sun', revenue: 750 },
        ];

        setStats({
          totalRevenue: revenue,
          vehiclesCount: vehicles.length,
          transactionsCount: transactions.length,
          usersCount: 12,
          recentTransactions: transactions.slice(0, 5),
          chartData: finalChartData,
          aiDetectionsCount: detections.length,
          ocrAccuracy: detections.length > 0
            ? Number((detections.reduce((acc, d) => acc + d.confidence, 0) / detections.length).toFixed(1))
            : 94.2,
          blacklistedCount: blacklistedVehicles.length,
        });
      } else {
        const mySuccessTrans = transactions.filter((t) => t.status === 'Success');
        const totalPaid = mySuccessTrans.reduce((acc, t) => acc + t.amount, 0);

        setStats({
          totalTrips: mySuccessTrans.length,
          totalPayments: totalPaid,
          recentTransactions: transactions.slice(0, 5),
          aiDetectionsCount: detections.filter((d) => d.vehicle && vehicles.some((v) => v._id === d.vehicle._id)).length,
          ocrAccuracy: 94.2,
          blacklistedCount: blacklistedVehicles.length,
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-slate-900 border border-slate-805/85 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Dashboard Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Hello, {user?.name}. You are connected to the TollWise gating network portal.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Aggregating summaries...</p>
        </div>
      ) : isAdmin ? (
        // ============================================
        // ADMIN DASHBOARD
        // ============================================
        <div className="space-y-8 animate-fade-in">
          {/* Admin cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-805/85 rounded-xl p-5">
              <span className="text-xs uppercase font-bold text-slate-500">Total System Revenue</span>
              <h3 className="text-3xl font-extrabold text-slate-200 mt-1">${stats.totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-805/85 rounded-xl p-5">
              <span className="text-xs uppercase font-bold text-slate-500">Active Fleet Records</span>
              <h3 className="text-3xl font-extrabold text-sky-400 mt-1">{stats.vehiclesCount}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-805/85 rounded-xl p-5">
              <span className="text-xs uppercase font-bold text-slate-500">Throughput Transactions</span>
              <h3 className="text-3xl font-extrabold text-indigo-400 mt-1">{stats.transactionsCount}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-805/85 rounded-xl p-5">
              <span className="text-xs uppercase font-bold text-slate-500">Registered Users</span>
              <h3 className="text-3xl font-extrabold text-slate-200 mt-1">{stats.usersCount}</h3>
            </div>
          </div>

          {/* AI Metrics block conditionally rendered */}
          {showAI && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-sky-500" />
                AI Pipeline Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-805/85 p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-xs font-bold uppercase">AI Camera Scans</span>
                    <h3 className="text-2xl font-black text-slate-200 mt-1">{stats.aiDetectionsCount}</h3>
                  </div>
                  <Cpu className="w-8 h-8 text-sky-500/20" />
                </div>
                <div className="bg-slate-900 border border-slate-805/85 p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-xs font-bold uppercase">OCR Read Accuracy</span>
                    <h3 className="text-2xl font-black text-sky-400 mt-1">{stats.ocrAccuracy}%</h3>
                  </div>
                  <TrendingUp className="w-8 h-8 text-sky-400/20" />
                </div>
                <div className="bg-slate-900 border border-slate-805/85 p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-xs font-bold uppercase">Blacklisted Plates</span>
                    <h3 className="text-2xl font-black text-rose-500 mt-1">{stats.blacklistedCount}</h3>
                  </div>
                  <AlertOctagon className="w-8 h-8 text-rose-500/20" />
                </div>
              </div>
            </div>
          )}

          {/* Revenue Chart Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              Daily Revenue Trend
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      color: '#f8fafc',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        // ============================================
        // CUSTOMER DASHBOARD
        // ============================================
        <div className="space-y-8 animate-fade-in">
          {/* Customer cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl">
              <span className="text-slate-500 uppercase text-xs font-bold">Toll Passes Cleared</span>
              <h3 className="text-3xl font-extrabold text-slate-200 mt-1">{stats.totalTrips} Trips</h3>
            </div>
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl">
              <span className="text-slate-500 uppercase text-xs font-bold">Total Payments Cleared</span>
              <h3 className="text-3xl font-extrabold text-slate-200 mt-1">${stats.totalPayments.toFixed(2)}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl">
              <span className="text-slate-500 uppercase text-xs font-bold">Digital Account Wallet</span>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">${user?.walletBalance?.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Shared Recent Transactions Panel */}
      {!loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Recent Gating Passes
          </h3>
          {stats.recentTransactions.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">
              No recent crossings logged in the system ledger.
            </p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {stats.recentTransactions.map((t) => (
                <div key={t._id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-mono text-slate-350 font-bold">{t.vehicleNumber}</p>
                    <p className="text-slate-500 mt-0.5">{t.tollPlazaName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-200">${t.amount.toFixed(2)}</p>
                    <p className={t.status === 'Success' ? 'text-emerald-400 mt-0.5 font-semibold' : 'text-rose-400 mt-0.5 font-semibold'}>
                      {t.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
