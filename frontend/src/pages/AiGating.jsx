import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Upload,
  Cpu,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  MapPin,
  RefreshCw,
  Coins,
} from 'lucide-react';

function AiGating() {
  const { user } = useAuth();
  
  // Plazas dropdown lists
  const [plazas, setPlazas] = useState([]);
  const [selectedPlazaId, setSelectedPlazaId] = useState('');
  
  // File Upload states
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Processing and outcomes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiResult, setAiResult] = useState(null);

  // Gating & Payment simulation
  const [paymentMethod, setPaymentMethod] = useState('FASTag Balance');
  const [paying, setPaying] = useState(false);
  const [gateState, setGateState] = useState('closed'); // 'closed', 'opening', 'opened'

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPlazas();
  }, []);

  const fetchPlazas = async () => {
    try {
      const { data } = await api.get('/plazas');
      setPlazas(data);
      if (data.length > 0) {
        setSelectedPlazaId(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load plaza reference points:', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setAiResult(null);
      setError('');
      setSuccess('');
      setGateState('closed');
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleAnalyzeImage = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file to analyze.');
      return;
    }
    if (!selectedPlazaId) {
      setError('Please select a toll plaza.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setAiResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/detections/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAiResult(data);
      
      if (data.detection.status === 'Blocked') {
        setError(`Access Denied: ${data.detection.reason}`);
      } else {
        setSuccess(`Plate Recognized: ${data.detection.detectedPlate}. Awaiting clearance...`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete image OCR analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!aiResult || !aiResult.vehicleDetails) return;
    
    setPaying(true);
    setError('');
    
    try {
      const { data } = await api.post('/transactions/pay', {
        vehicleNumber: aiResult.vehicleDetails.vehicleNumber,
        plazaId: selectedPlazaId,
        paymentMethod,
      });

      // Clear successful state
      setSuccess(data.message);
      
      // Trigger CSS animation sequences
      setGateState('opening');
      setTimeout(() => {
        setGateState('opened');
      }, 2500);

      // Force context state reload for wallet balance changes
      try {
        await api.get('/auth/profile');
      } catch (err) {}
    } catch (err) {
      setError(err.response?.data?.message || 'Payment simulation failed.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Cpu className="text-sky-500 w-8 h-8" />
          AI Smart Gating Portal
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Perform real-time Automatic Number Plate Recognition (ANPR) and verify registration credentials
        </p>
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
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main interactive grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Image Upload & Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-200 mb-4">Plate Camera Capture Feed</h3>
            
            <form onSubmit={handleAnalyzeImage} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-1.5">
                    Arrive at Toll Plaza
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <select
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-250 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      value={selectedPlazaId}
                      onChange={(e) => setSelectedPlazaId(e.target.value)}
                    >
                      <option value="">-- Select Plaza --</option>
                      {plazas.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Container box */}
              <div
                onClick={triggerUploadClick}
                className="border-2 border-dashed border-slate-850 hover:border-sky-500/40 bg-slate-950/40 hover:bg-slate-950/70 p-8 rounded-2xl text-center cursor-pointer transition-all relative overflow-hidden flex flex-col items-center justify-center min-h-[250px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative max-w-full max-h-[300px]">
                    <img
                      src={previewUrl}
                      alt="Car Preview"
                      className="rounded-lg object-contain max-h-[300px]"
                    />
                    
                    {/* Bounding box display layer */}
                    {aiResult && aiResult.bbox && (
                      <div
                        className="absolute border-2 border-red-500 bg-red-500/10 animate-pulse flex items-start"
                        style={{
                          left: `${(aiResult.bbox[0] / 640) * 100}%`, // Mock bounding box ratio mapping
                          top: `${(aiResult.bbox[1] / 480) * 100}%`,
                          width: `${((aiResult.bbox[2] - aiResult.bbox[0]) / 640) * 100}%`,
                          height: `${((aiResult.bbox[3] - aiResult.bbox[1]) / 480) * 100}%`,
                        }}
                      >
                        <span className="bg-red-500 text-white font-mono text-[9px] px-1 py-0.5 rounded-br uppercase leading-none font-bold">
                          PLATE ({aiResult.detection.confidence.toFixed(0)}%)
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-slate-600 mx-auto" />
                    <div>
                      <p className="text-slate-300 font-semibold text-sm">Select Vehicle Image</p>
                      <p className="text-slate-500 text-xs mt-1">Supports JPG, PNG, JPEG up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setAiResult(null);
                    setError('');
                    setSuccess('');
                    setGateState('closed');
                  }}
                  className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-slate-350 font-semibold rounded-xl text-sm border border-slate-800 transition-colors"
                >
                  Clear Feed
                </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Analyze Plate OCR'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: AI Results & Virtual Barrier Gate */}
        <div className="space-y-6">
          
          {/* AI inference result analytics */}
          {aiResult && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                OCR Inference Result
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Extracted Plate</p>
                  <p className="text-2xl font-black text-slate-200 tracking-wider font-mono mt-1">
                    {aiResult.detection.detectedPlate}
                  </p>
                  <p className="text-xs text-slate-450 mt-1.5 flex justify-center items-center gap-1">
                    Accuracy Score: <strong className="text-slate-300">{aiResult.detection.confidence.toFixed(1)}%</strong>
                  </p>
                </div>

                {aiResult.vehicleDetails ? (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Vehicle Credentials
                    </h4>
                    <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-850 text-xs space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Model:</span>
                        <span className="text-slate-200 font-semibold">{aiResult.vehicleDetails.vehicleModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Category:</span>
                        <span className="text-slate-200 font-semibold">{aiResult.vehicleDetails.vehicleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Owner Name:</span>
                        <span className="text-slate-200 font-semibold">{aiResult.vehicleDetails.ownerName}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-850/65 pt-2.5 mt-2.5">
                        <span className="text-slate-500">Linked Wallet:</span>
                        <span className="text-emerald-400 font-bold">${aiResult.vehicleDetails.walletBalance?.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Show dynamic billing options if gate is clear to close */}
                    {aiResult.detection.status !== 'Blocked' && gateState === 'closed' && (
                      <div className="space-y-3 pt-3 border-t border-slate-800/80">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Billing Instrument
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {['FASTag Balance', 'Wallet'].map((m) => (
                            <button
                              key={m}
                              onClick={() => setPaymentMethod(m)}
                              className={`py-2 px-3 border rounded-xl text-xs font-medium transition-all ${
                                paymentMethod === m
                                  ? 'border-sky-500/40 bg-sky-500/5 text-sky-400 font-bold'
                                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-300'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={handleProcessPayment}
                          disabled={paying}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/10 transition-all flex justify-center items-center gap-1.5"
                        >
                          {paying ? (
                            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              Authorize & Deduct
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center text-xs text-rose-400">
                    License plate detected does not map to any registered user vehicles. Barrier blocked.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Boom Barrier Gating Animation Visualizer */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
            <h3 className="text-lg font-bold text-slate-200 mb-6">Virtual Gate Barrier</h3>
            
            <div className="relative h-44 w-full bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex items-center justify-center">
              
              {/* Toll Lane background illustration lines */}
              <div className="absolute inset-x-0 bottom-0 h-4 bg-slate-800" />
              <div className="absolute left-1/3 bottom-0 top-0 w-0.5 bg-slate-900 border-dashed border-r border-slate-800" />
              <div className="absolute right-1/3 bottom-0 top-0 w-0.5 bg-slate-900 border-dashed border-r border-slate-800" />

              {/* Physical Gate Post */}
              <div className="absolute left-8 bottom-4 w-6 h-20 bg-slate-700 rounded-t-md z-10 border-r border-slate-600">
                {/* Status Indicator Light */}
                <div className={`w-3.5 h-3.5 rounded-full mx-auto mt-2 border ${
                  gateState === 'opened'
                    ? 'bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : gateState === 'opening'
                    ? 'bg-amber-500 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-rose-500 border-rose-400 shadow-md shadow-rose-500/20'
                }`} />
              </div>

              {/* Rotating Boom Barrier Gate Arm */}
              <div
                className="absolute left-[38px] bottom-[72px] h-3 w-48 bg-gradient-to-r from-red-500 via-white to-red-500 origin-left border-y border-slate-800 transition-transform duration-[2000ms] ease-in-out z-20"
                style={{
                  transform:
                    gateState === 'opened'
                      ? 'rotate(-90deg)'
                      : gateState === 'opening'
                      ? 'rotate(-45deg)'
                      : 'rotate(0deg)',
                }}
              />

              {/* Status Label Banner */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Status:{' '}
                <span className={gateState === 'opened' ? 'text-emerald-400' : gateState === 'opening' ? 'text-amber-400' : 'text-rose-400'}>
                  {gateState}
                </span>
              </div>
            </div>
            
            {gateState === 'opened' && (
              <p className="text-emerald-400 text-xs font-semibold mt-4 animate-pulse">
                Barrier open. Safe travels!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiGating;
