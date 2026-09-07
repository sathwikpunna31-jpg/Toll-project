import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  CheckCircle,
  FileText,
} from 'lucide-react';

function Vehicles() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [vehicles, setVehicles] = useState([]);
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
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [vehicleModel, setVehicleModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState('Active');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVehicleNumber('');
    setOwnerName(user?.role === 'customer' ? user.name : '');
    setVehicleType('Car');
    setVehicleModel('');
    setRegistrationNumber('');
    setVehicleStatus('Active');
    setSelectedId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setSelectedId(vehicle._id);
    setVehicleNumber(vehicle.vehicleNumber);
    setOwnerName(vehicle.ownerName);
    setVehicleType(vehicle.vehicleType);
    setVehicleModel(vehicle.vehicleModel);
    setRegistrationNumber(vehicle.registrationNumber);
    setVehicleStatus(vehicle.status);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Quick regex validation
    const plateRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$|^[A-Z0-9-]{5,15}$/;
    if (!plateRegex.test(vehicleNumber.toUpperCase())) {
      setError('Please provide a standard plate registration format (e.g. AP21BP1234 or clean uppercase letters/numbers).');
      return;
    }

    try {
      if (modalMode === 'add') {
        const { data } = await api.post('/vehicles', {
          vehicleNumber,
          ownerName,
          vehicleType,
          vehicleModel,
          registrationNumber,
        });
        setSuccess('Vehicle registered successfully!');
        setVehicles([data, ...vehicles]);
      } else {
        const { data } = await api.put(`/vehicles/${selectedId}`, {
          ownerName,
          vehicleType,
          vehicleModel,
          status: vehicleStatus,
        });
        setSuccess('Vehicle updated successfully!');
        setVehicles(vehicles.map((v) => (v._id === selectedId ? data : v)));
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/vehicles/${id}`);
      setSuccess('Vehicle deleted successfully.');
      setVehicles(vehicles.filter((v) => v._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete operation failed');
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) =>
    v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Vehicle Registry</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isAdmin ? 'Manage all vehicles registered in the TollWise system' : 'Register and manage your personal vehicles'}
          </p>
        </div>
        <div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl font-medium shadow-lg shadow-sky-500/10 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
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
            placeholder="Search by license plate or owner name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200 placeholder:text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Registry Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Fetching registry records...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No Vehicles Found</h3>
          <p className="text-slate-500 text-sm mt-1">Get started by registering your first vehicle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono font-bold tracking-widest text-sky-400">
                    {vehicle.vehicleNumber}
                  </div>
                  <div
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      vehicle.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {vehicle.status}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-100 mb-1">{vehicle.vehicleModel}</h3>
                <p className="text-xs text-slate-500 mb-4">{vehicle.vehicleType}</p>

                <div className="space-y-2 border-t border-slate-800/60 pt-4 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Owner:</span>
                    <span className="font-semibold text-slate-200">{vehicle.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RC Doc No:</span>
                    <span className="font-mono text-slate-200">{vehicle.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FASTag ID:</span>
                    <span className="font-mono text-indigo-400 font-semibold">{vehicle.fastagId}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800/60">
                <button
                  onClick={() => openEditModal(vehicle)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold flex justify-center items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(vehicle._id)}
                  className="px-3 py-2 bg-slate-950 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-xl transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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
                {modalMode === 'add' ? 'Register New Vehicle' : 'Edit Vehicle Details'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    License Plate Number
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'edit'}
                    placeholder="e.g. AP21BP1234"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200 disabled:opacity-50"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                  >
                    <option value="Bike">Bike</option>
                    <option value="Car">Car</option>
                    <option value="Bus">Bus</option>
                    <option value="Truck">Truck</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tesla Model 3"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Registration Certificate (RC) Number
                </label>
                <input
                  type="text"
                  required
                  disabled={modalMode === 'edit'}
                  placeholder="e.g. RC-9876543210"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200 disabled:opacity-50"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </div>

              {/* Status field - Admin Only */}
              {isAdmin && modalMode === 'edit' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    System Registry Status
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-200"
                    value={vehicleStatus}
                    onChange={(e) => setVehicleStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>
              )}

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
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehicles;
