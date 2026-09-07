import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  CheckCircle,
  Coins,
} from 'lucide-react';

function Plazas() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [plazas, setPlazas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedId, setSelectedId] = useState(null);

  // Form Fields
  const [plazaName, setPlazaName] = useState('');
  const [location, setLocation] = useState('');
  
  // Rate values for different vehicle types
  const [bikeRate, setBikeRate] = useState(20);
  const [carRate, setCarRate] = useState(80);
  const [busRate, setBusRate] = useState(150);
  const [truckRate, setTruckRate] = useState(240);

  useEffect(() => {
    fetchPlazas();
  }, []);

  const fetchPlazas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/plazas');
      setPlazas(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch toll plazas');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPlazaName('');
    setLocation('');
    setBikeRate(20);
    setCarRate(80);
    setBusRate(150);
    setTruckRate(240);
    setSelectedId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (plaza) => {
    setSelectedId(plaza._id);
    setPlazaName(plaza.name);
    setLocation(plaza.location);
    setBikeRate(plaza.rates?.Bike || 0);
    setCarRate(plaza.rates?.Car || 0);
    setBusRate(plaza.rates?.Bus || 0);
    setTruckRate(plaza.rates?.Truck || 0);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const plazaPayload = {
      name: plazaName,
      location,
      rates: {
        Bike: Number(bikeRate),
        Car: Number(carRate),
        Bus: Number(busRate),
        Truck: Number(truckRate),
        Emergency: 0, // Always forced to 0
      },
    };

    try {
      if (modalMode === 'add') {
        const { data } = await api.post('/plazas', plazaPayload);
        setSuccess('Toll Plaza registered successfully!');
        setPlazas([...plazas, data]);
      } else {
        const { data } = await api.put(`/plazas/${selectedId}`, plazaPayload);
        setSuccess('Toll Plaza updated successfully!');
        setPlazas(plazas.map((p) => (p._id === selectedId ? data : p)));
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this toll plaza? This action is permanent.')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/plazas/${id}`);
      setSuccess('Toll plaza removed.');
      setPlazas(plazas.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete operation failed');
    }
  };

  // Filter plazas
  const filteredPlazas = plazas.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Toll Plazas</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isAdmin ? 'Manage plazas, adjust toll pricing, and monitor gating points' : 'View active toll plazas and highway pricing lists'}
          </p>
        </div>
        {isAdmin && (
          <div>
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl font-medium shadow-lg shadow-sky-500/10 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Toll Plaza</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search by plaza name or highway route location..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200 placeholder:text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Plaza Pricing Table / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Fetching active gating plazas...</p>
        </div>
      ) : filteredPlazas.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No Plazas Found</h3>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin ? 'Configure the network by registering the first Toll Plaza.' : 'Currently no active toll plazas listed in the registry.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPlazas.map((plaza) => (
            <div
              key={plaza._id}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">{plaza.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {plaza.location}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(plaza)}
                        className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-sky-400 rounded-lg transition-colors"
                        title="Edit Plaza & Rates"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plaza._id)}
                        className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete Plaza"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Rates display grids */}
                <div className="mt-6 border-t border-slate-800/60 pt-4">
                  <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-sky-400" />
                    Toll Fare Pricing Index
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-center">
                      <p className="text-[10px] uppercase font-semibold text-slate-500">Bike</p>
                      <p className="text-lg font-extrabold text-slate-200 mt-1">${plaza.rates?.Bike || 0}</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-center">
                      <p className="text-[10px] uppercase font-semibold text-slate-500">Car</p>
                      <p className="text-lg font-extrabold text-slate-200 mt-1">${plaza.rates?.Car || 0}</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-center">
                      <p className="text-[10px] uppercase font-semibold text-slate-500">Bus</p>
                      <p className="text-lg font-extrabold text-slate-200 mt-1">${plaza.rates?.Bus || 0}</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-center">
                      <p className="text-[10px] uppercase font-semibold text-slate-500">Truck</p>
                      <p className="text-lg font-extrabold text-slate-200 mt-1">${plaza.rates?.Truck || 0}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2 text-center uppercase tracking-wide">
                    Emergency Vehicles are exempted from toll gating charges
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/20">
              <h2 className="text-xl font-bold text-white">
                {modalMode === 'add' ? 'Add Toll Plaza & Pricing' : 'Modify Plaza & Rates'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Plaza Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore Elevated Expressway Plaza"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
                    value={plazaName}
                    onChange={(e) => setPlazaName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Highway Route / City Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NH-44, Bangalore"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Rates editing segment */}
              <div className="border-t border-slate-800 pt-4 mt-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-300 mb-3">
                  Fare Configuration ($)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Bike Rate ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
                      value={bikeRate}
                      onChange={(e) => setBikeRate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Car Rate ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
                      value={carRate}
                      onChange={(e) => setCarRate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Bus Rate ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
                      value={busRate}
                      onChange={(e) => setBusRate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Truck Rate ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
                      value={truckRate}
                      onChange={(e) => setTruckRate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  Save Plaza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Plazas;
