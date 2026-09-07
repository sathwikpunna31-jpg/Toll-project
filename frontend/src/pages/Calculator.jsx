import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calculator, MapPin, Car, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';

function CalculatorPage() {
  const [vehicles, setVehicles] = useState([]);
  const [plazas, setPlazas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected details
  const [selectedVehicleNum, setSelectedVehicleNum] = useState('');
  const [selectedPlazaId, setSelectedPlazaId] = useState('');
  const [calculationResult, setCalculationResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

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
      setError('Failed to fetch reference database details for calculations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!selectedVehicleNum || !selectedPlazaId) return;

    setError('');
    setCalculationResult(null);
    setCalculating(true);

    try {
      const { data } = await api.post('/transactions/calculate', {
        vehicleNumber: selectedVehicleNum,
        plazaId: selectedPlazaId,
      });
      setCalculationResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred calculating fare index');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Toll Fee Calculator</h1>
        <p className="text-slate-400 text-sm mt-1">
          Estimate highway gating charges instantly based on vehicle classification types
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
          <p className="text-slate-500 text-sm">Loading registry options...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Calculator Input Form */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-sky-400" />
              Configure Estimation
            </h2>
            <form onSubmit={handleCalculate} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Select Registered Vehicle
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
                    <option value="">-- Choose a Vehicle --</option>
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
                  Select Toll Plaza Location
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
                    <option value="">-- Choose a Toll Plaza --</option>
                    {plazas.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={calculating || !selectedVehicleNum || !selectedPlazaId}
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {calculating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Calculate Toll Fare'
                )}
              </button>
            </form>
          </div>

          {/* Fare Details Display Panel */}
          <div className="bg-slate-900/40 border border-slate-805/80 p-6 rounded-2xl flex flex-col justify-center">
            {calculationResult ? (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                    Calculated Toll Amount
                  </span>
                  <h3 className="text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent mt-1">
                    ${calculationResult.amount.toFixed(2)}
                  </h3>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-2">
                    Estimation Parameters
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500 font-medium">Plate Number:</p>
                      <p className="text-slate-200 font-mono font-bold mt-0.5">
                        {calculationResult.vehicle.vehicleNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Vehicle Category:</p>
                      <p className="text-slate-200 font-bold mt-0.5">
                        {calculationResult.vehicle.vehicleType}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Owner Registered:</p>
                      <p className="text-slate-200 font-bold mt-0.5">
                        {calculationResult.vehicle.ownerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Toll Plaza Route:</p>
                      <p className="text-slate-200 font-bold mt-0.5">
                        {calculationResult.plaza.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-sky-500/5 border border-sky-500/10 p-3 rounded-xl text-center text-xs text-sky-400">
                  Fare calculated matches plaza pricing scheduled configuration rules.
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <HelpCircle className="w-12 h-12 text-slate-650 mx-auto mb-3" />
                <h3 className="text-slate-400 font-bold">Awaiting Inputs</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Select a registered license plate and highway plaza node above to compute fares.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalculatorPage;
