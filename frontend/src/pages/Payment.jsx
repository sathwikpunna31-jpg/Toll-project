import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Car,
  MapPin,
  Coins,
  History,
  FileSpreadsheet,
} from 'lucide-react';

function Payment() {
  const { user } = useAuth();
  
  const [vehicles, setVehicles] = useState([]);
  const [plazas, setPlazas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  // Form Fields
  const [selectedVehicleNum, setSelectedVehicleNum] = useState('');
  const [selectedPlazaId, setSelectedPlazaId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('FASTag Balance');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [vehicleRes, plazaRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/plazas'),
      ]);
      setVehicles(vehicleRes.data);
      setPlazas(plazaRes.data);
    } catch (err) {
      setError('Failed to fetch gating options database registries.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    if (!selectedVehicleNum || !selectedPlazaId || !paymentMethod) return;

    setError('');
    setReceipt(null);
    setProcessing(true);

    try {
      const { data } = await api.post('/transactions/pay', {
        vehicleNumber: selectedVehicleNum,
        plazaId: selectedPlazaId,
        paymentMethod,
      });
      setReceipt(data.transaction);
      // Wait, let's refresh the Auth state to display the updated balance in the Navbar!
      // Since context runs on cookie authentication, let's fetch profile to refresh wallet.
      // Yes, we will just read profile status.
      try {
        await api.get('/auth/profile');
      } catch (err) {
        // fail silently
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing simulation failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Gating Simulator</h1>
        <p className="text-slate-400 text-sm mt-1">
          Simulate a vehicle clearing a toll booth, charging the digital account, and opening the barrier.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading options...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Simulator Inputs */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              Toll Gating Simulator
            </h2>
            <form onSubmit={handleSimulatePayment} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Select Vehicle to Pass
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Car className="w-5 h-5" />
                  </span>
                  <select
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
                    value={selectedVehicleNum}
                    onChange={(e) => setSelectedVehicleNum(e.target.value)}
                  >
                    <option value="">-- Select Active Vehicle --</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v.vehicleNumber}>
                        {v.vehicleNumber} - {v.vehicleModel} ({v.vehicleType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Arrive at Plaza
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <select
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
                    value={selectedPlazaId}
                    onChange={(e) => setSelectedPlazaId(e.target.value)}
                  >
                    <option value="">-- Select plaza Node --</option>
                    {plazas.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Select Billing Instrument
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['FASTag Balance', 'Wallet', 'UPI', 'Card'].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer text-xs font-medium transition-all ${
                        paymentMethod === method
                          ? 'border-indigo-500/50 bg-indigo-500/5 text-indigo-400 font-bold'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-350'
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="hidden"
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={processing || !selectedVehicleNum || !selectedPlazaId}
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Clear Toll Booth Gate'
                )}
              </button>
            </form>
          </div>

          {/* Simulated Gate Receipt Panel */}
          <div className="bg-slate-900/40 border border-slate-805/80 p-6 rounded-2xl flex flex-col justify-center min-h-[350px]">
            {receipt ? (
              <div className="space-y-6 animate-fade-in text-center">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">GATE OPENED</h3>
                  <p className="text-slate-400 text-xs mt-1">Transaction logged. Toll cleared successfully.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left font-mono text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction ID:</span>
                    <span className="text-slate-200">{receipt._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plate Code:</span>
                    <span className="text-slate-200">{receipt.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plaza Node:</span>
                    <span className="text-slate-200">{receipt.tollPlazaName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Charged Instrument:</span>
                    <span className="text-indigo-400 font-semibold">{receipt.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2 mt-2 font-bold text-slate-100">
                    <span className="text-slate-400">Charged Amount:</span>
                    <span className="text-emerald-400">${receipt.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <Coins className="w-12 h-12 text-slate-650 mx-auto mb-3 animate-pulse" />
                <h3 className="text-slate-400 font-bold">Barrier Closed</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Configure simulation options and proceed to clear gate barrier.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;
