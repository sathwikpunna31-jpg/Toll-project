import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  History,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

function Transactions() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } catch (err) {
      setError('Failed to fetch transaction logs.');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tollPlazaName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Transaction Logs</h1>
        <p className="text-slate-400 text-sm mt-1">
          {isAdmin ? 'Complete system-wide transaction history' : 'Your personal toll pass history ledger'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search by license plate or plaza name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Filter className="w-4 h-4" />
            </span>
            <select
              className="pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success Only</option>
              <option value="Failed">Failed Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Fetching ledger logs...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-808/80 rounded-2xl">
          <History className="w-12 h-12 text-slate-650 mx-auto mb-3" />
          <h3 className="text-slate-350 font-bold">No Records Found</h3>
          <p className="text-slate-500 text-xs mt-1">Try resetting filters or clear a test booth gate.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Transaction ID / Date</th>
                  <th className="px-6 py-4">Vehicle Details</th>
                  <th className="px-6 py-4">Plaza Location</th>
                  <th className="px-6 py-4">Billing Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm text-slate-300">
                {filteredTransactions.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono text-slate-200 text-xs font-semibold">{t._id}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {new Date(t.createdAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-sky-400">
                      {t.vehicleNumber}
                    </td>
                    <td className="px-6 py-4">{t.tollPlazaName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[10px] uppercase font-semibold text-slate-400 rounded-md">
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          t.status === 'Success'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {t.status === 'Success' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{t.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-100">
                      ${t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
