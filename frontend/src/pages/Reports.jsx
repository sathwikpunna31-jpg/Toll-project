import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Calendar,
  Download,
  AlertTriangle,
  Table,
  CheckCircle,
} from 'lucide-react';

function Reports() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected date ranges for report boundaries
  const [reportType, setReportType] = useState('Daily'); // 'Daily' or 'Monthly'

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/transactions');
        setTransactions(data);
      } catch (err) {
        setError('Failed to fetch reporting data.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Filter transactions based on date selection
  const getFilteredData = () => {
    const now = new Date();
    return transactions.filter((t) => {
      const transDate = new Date(t.createdAt);
      if (reportType === 'Daily') {
        // Transactions from the last 24h
        return now.getTime() - transDate.getTime() <= 24 * 60 * 60 * 1000;
      } else {
        // Transactions from the last 30d
        return now.getTime() - transDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
      }
    });
  };

  const reportData = getFilteredData();

  // Export report data to CSV
  const handleExportCSV = () => {
    if (reportData.length === 0) return;

    // Build headers
    const headers = [
      'Transaction ID',
      'Timestamp',
      'Vehicle Number',
      'Toll Plaza',
      'Method',
      'Amount',
      'Status',
    ];

    // Build rows
    const rows = reportData.map((t) => [
      t._id,
      new Date(t.createdAt).toLocaleString(),
      t.vehicleNumber,
      t.tollPlazaName,
      t.paymentMethod,
      t.amount,
      t.status,
    ]);

    // Build content
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    // Create download element
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `TollWise_${reportType}_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute aggregated stats
  const totalSuccessCount = reportData.filter((t) => t.status === 'Success').length;
  const totalFailedCount = reportData.filter((t) => t.status === 'Failed').length;
  const totalRevenue = reportData
    .filter((t) => t.status === 'Success')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">System Reports</h1>
          <p className="text-slate-400 text-sm mt-1">
            Analyze traffic throughput and generate export sheets for audit.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={reportData.length === 0}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-sky-500/10 transition-all text-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Interval select switch */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex gap-3">
        <button
          onClick={() => setReportType('Daily')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            reportType === 'Daily'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/35'
              : 'text-slate-450 hover:bg-slate-800/50'
          }`}
        >
          Last 24 Hours
        </button>
        <button
          onClick={() => setReportType('Monthly')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            reportType === 'Monthly'
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/35'
              : 'text-slate-450 hover:bg-slate-800/50'
          }`}
        >
          Last 30 Days
        </button>
      </div>

      {/* Aggregated Stats Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Aggregating summaries...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-805/85 rounded-xl p-5">
              <span className="text-xs uppercase font-bold text-slate-500">
                {isAdmin ? 'Total Revenue generated' : 'Total payments cleared'}
              </span>
              <h3 className="text-3xl font-extrabold text-slate-200 mt-1">
                ${totalRevenue.toFixed(2)}
              </h3>
            </div>
            <div className="bg-slate-900 border border-slate-805/85 rounded-xl p-5">
              <span className="text-xs uppercase font-bold text-slate-500">Successful Gates</span>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{totalSuccessCount}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-805/85 rounded-xl p-5">
              <span className="text-xs uppercase font-bold text-slate-500">Failed Gates</span>
              <h3 className="text-3xl font-extrabold text-rose-400 mt-1">{totalFailedCount}</h3>
            </div>
          </div>

          {/* Quick preview grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Table className="w-5 h-5 text-sky-400" />
              Summary Data Preview
            </h3>
            {reportData.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">
                No transaction records available within this report's timeframe.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider pb-2">
                      <th className="py-2">Plate</th>
                      <th className="py-2">Plaza</th>
                      <th className="py-2">Method</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {reportData.slice(0, 10).map((t) => (
                      <tr key={t._id} className="hover:bg-slate-800/10">
                        <td className="py-2.5 font-mono text-sky-400">{t.vehicleNumber}</td>
                        <td className="py-2.5">{t.tollPlazaName}</td>
                        <td className="py-2.5">{t.paymentMethod}</td>
                        <td className="py-2.5">
                          <span
                            className={t.status === 'Success' ? 'text-emerald-400' : 'text-rose-400'}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-extrabold">${t.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.length > 10 && (
                  <p className="text-[10px] text-slate-500 mt-4 text-center">
                    Showing first 10 rows. Export CSV to view all {reportData.length} records.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
