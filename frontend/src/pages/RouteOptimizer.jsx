import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { QRCodeSVG } from 'qrcode.react';
import {
  Navigation,
  Fuel,
  Clock,
  Sparkles,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  AlertCircle,
  Search,
  Zap,
  Printer,
  X,
  QrCode,
  MapPin
} from 'lucide-react';

// Custom Map Markers
const createIcon = (color) =>
  new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const originIcon = createIcon('#38bdf8'); // Sky blue
const destIcon = createIcon('#ef4444');   // Red
const plazaIcon = createIcon('#f59e0b');  // Amber

// Highway Pre-configured Corridors & Sample Routes
const CORRIDORS = {
  'hyd-blr': {
    name: 'Hyderabad ➔ Bangalore (NH 44 Express Corridor)',
    origin: { name: 'Hyderabad Outer Ring Road', coords: [17.385, 78.4867] },
    destination: { name: 'Bangalore Devanahalli Highway', coords: [13.242, 77.712] },
    plazas: [
      { name: 'Raichur Toll Plaza', coords: [16.205, 77.355], fare: 115 },
      { name: 'Kurnool Expressway Plaza', coords: [15.828, 78.037], fare: 140 },
      { name: 'Anantapur Highway Node', coords: [14.681, 77.601], fare: 125 },
      { name: 'Bagepalli Toll Gate', coords: [13.784, 77.794], fare: 130 },
      { name: 'Devanahalli Airport Expressway', coords: [13.315, 77.721], fare: 110 },
    ],
    routes: {
      express: {
        title: 'Highway Express Corridor',
        time: '8h 15m',
        distance: 570,
        baseToll: 620,
        plazasCount: 5,
        badge: 'Fastest Highway Route',
        color: '#38bdf8',
        path: [
          [17.385, 78.4867],
          [16.205, 77.355],
          [15.828, 78.037],
          [14.681, 77.601],
          [13.784, 77.794],
          [13.315, 77.721],
          [13.242, 77.712],
        ],
      },
      economy: {
        title: 'Smart Economy Bypass',
        time: '8h 40m',
        distance: 595,
        baseToll: 265,
        plazasCount: 2,
        badge: '🔥 Saves $355 in Toll Fees',
        color: '#10b981',
        path: [
          [17.385, 78.4867],
          [16.205, 77.355],
          [15.500, 77.800],
          [14.400, 77.400],
          [13.784, 77.794],
          [13.242, 77.712],
        ],
      },
      scenic: {
        title: 'Zero-Toll State Highway',
        time: '10h 30m',
        distance: 640,
        baseToll: 0,
        plazasCount: 0,
        badge: '100% Toll-Free',
        color: '#94a3b8',
        path: [
          [17.385, 78.4867],
          [16.700, 77.900],
          [15.200, 77.200],
          [14.100, 76.900],
          [13.242, 77.712],
        ],
      },
    },
  },
  'del-agr': {
    name: 'Delhi ➔ Agra (Yamuna Expressway)',
    origin: { name: 'Greater Noida Toll Gate, Delhi NCR', coords: [28.474, 77.504] },
    destination: { name: 'Kuberpur Interchange, Agra', coords: [27.205, 78.093] },
    plazas: [
      { name: 'Jewar Toll Plaza', coords: [28.125, 77.550], fare: 155 },
      { name: 'Mathura Toll Gate', coords: [27.700, 77.720], fare: 165 },
      { name: 'Agra Toll Terminal', coords: [27.240, 78.050], fare: 125 },
    ],
    routes: {
      express: {
        title: 'Yamuna 6-Lane Access-Controlled',
        time: '2h 15m',
        distance: 195,
        baseToll: 445,
        plazasCount: 3,
        badge: 'High-Speed Express',
        color: '#38bdf8',
        path: [
          [28.474, 77.504],
          [28.125, 77.550],
          [27.700, 77.720],
          [27.240, 78.050],
          [27.205, 78.093],
        ],
      },
      economy: {
        title: 'Old NH 19 Mathura Bypass',
        time: '3h 10m',
        distance: 215,
        baseToll: 175,
        plazasCount: 1,
        badge: '🔥 Saves $270 Tolls',
        color: '#10b981',
        path: [
          [28.474, 77.504],
          [28.000, 77.400],
          [27.600, 77.600],
          [27.205, 78.093],
        ],
      },
      scenic: {
        title: 'Palwal Rural Highway',
        time: '3h 50m',
        distance: 230,
        baseToll: 0,
        plazasCount: 0,
        badge: 'Toll-Free Route',
        color: '#94a3b8',
        path: [
          [28.474, 77.504],
          [27.850, 77.300],
          [27.400, 77.500],
          [27.205, 78.093],
        ],
      },
    },
  },
  'mum-pune': {
    name: 'Mumbai ➔ Pune (Yashwantrao Chavan Expressway)',
    origin: { name: 'Kalamboli Toll Terminal, Mumbai', coords: [19.033, 73.029] },
    destination: { name: 'Somatane Plaza, Pune', coords: [18.718, 73.666] },
    plazas: [
      { name: 'Khalapur Main Toll Gate', coords: [18.831, 73.284], fare: 320 },
      { name: 'Talegaon Expressway Node', coords: [18.745, 73.651], fare: 215 },
    ],
    routes: {
      express: {
        title: 'Speed Expressway',
        time: '2h 10m',
        distance: 94,
        baseToll: 535,
        plazasCount: 2,
        badge: 'Dedicated 6-Lane Expressway',
        color: '#38bdf8',
        path: [
          [19.033, 73.029],
          [18.831, 73.284],
          [18.745, 73.651],
          [18.718, 73.666],
        ],
      },
      economy: {
        title: 'Old NH 48 Heritage Bypass',
        time: '3h 05m',
        distance: 108,
        baseToll: 0,
        plazasCount: 0,
        badge: '🔥 Saves $535 Toll Expense',
        color: '#10b981',
        path: [
          [19.033, 73.029],
          [18.910, 73.180],
          [18.750, 73.400],
          [18.718, 73.666],
        ],
      },
      scenic: {
        title: 'Khopoli Foothills Route',
        time: '3h 30m',
        distance: 118,
        baseToll: 0,
        plazasCount: 0,
        badge: 'No Highway Tolls',
        color: '#94a3b8',
        path: [
          [19.033, 73.029],
          [18.780, 73.340],
          [18.718, 73.666],
        ],
      },
    },
  },
  'hyd-del': {
    name: 'Hyderabad ➔ Delhi (North-South National Corridor NH 44)',
    origin: { name: 'Medchal Toll Terminal, Hyderabad', coords: [17.625, 78.481] },
    destination: { name: 'Badarpur Border Terminal, New Delhi', coords: [28.498, 77.300] },
    plazas: [
      { name: 'Kamareddy Toll Gate', coords: [18.318, 78.336], fare: 110 },
      { name: 'Adilabad Highway Node', coords: [19.670, 78.530], fare: 135 },
      { name: 'Nagpur Ring Expressway', coords: [21.145, 79.088], fare: 160 },
      { name: 'Gwalior South Plaza', coords: [26.218, 78.182], fare: 145 },
      { name: 'Agra-Delhi Yamuna Connector', coords: [27.800, 77.600], fare: 180 },
    ],
    routes: {
      express: {
        title: 'NH 44 North-South Superhighway',
        time: '24h 30m',
        distance: 1580,
        baseToll: 1240,
        plazasCount: 5,
        badge: 'National Trunk Corridor',
        color: '#38bdf8',
        path: [
          [17.625, 78.481],
          [18.318, 78.336],
          [19.670, 78.530],
          [21.145, 79.088],
          [23.181, 79.986],
          [26.218, 78.182],
          [27.800, 77.600],
          [28.498, 77.300],
        ],
      },
      economy: {
        title: 'Central State Bypass Optimizer',
        time: '26h 15m',
        distance: 1620,
        baseToll: 640,
        plazasCount: 2,
        badge: '🔥 Saves $600 Tolls',
        color: '#10b981',
        path: [
          [17.625, 78.481],
          [18.318, 78.336],
          [20.500, 78.800],
          [22.800, 78.500],
          [25.500, 78.200],
          [28.498, 77.300],
        ],
      },
      scenic: {
        title: 'Regional State Highway Route',
        time: '31h 00m',
        distance: 1690,
        baseToll: 0,
        plazasCount: 0,
        badge: 'Zero Highway Tolls',
        color: '#94a3b8',
        path: [
          [17.625, 78.481],
          [19.000, 77.800],
          [21.500, 77.500],
          [24.000, 77.200],
          [26.500, 77.000],
          [28.498, 77.300],
        ],
      },
    },
  },
};

function RouteOptimizer() {
  const [selectedCorridorKey, setSelectedCorridorKey] = useState('hyd-blr');
  const [selectedRouteType, setSelectedRouteType] = useState('economy');
  const [vehicleClass, setVehicleClass] = useState('Car');
  
  // Upgrade 1: Custom Origin & Destination Input States
  const [customOrigin, setCustomOrigin] = useState('Hyderabad');
  const [customDestination, setCustomDestination] = useState('Bangalore');
  
  // Upgrade 2: Dynamic Fuel Selector (Petrol vs Diesel vs EV)
  const [fuelType, setFuelType] = useState('petrol'); // 'petrol', 'diesel', 'ev'
  
  // Upgrade 3: Digital Pre-Pass Modal with QR Code
  const [showPrePassModal, setShowPrePassModal] = useState(false);
  const [prePassBooked, setPrePassBooked] = useState(false);

  const corridor = CORRIDORS[selectedCorridorKey] || CORRIDORS['hyd-blr'];
  const activeRoute = corridor.routes[selectedRouteType];

  // Fuel price and efficiency formulas
  // EV: 20% Green Toll Subsidy Discount
  const evTollDiscountRate = fuelType === 'ev' ? 0.20 : 0.0;
  
  const calculateEffectiveToll = (rawToll) => {
    return Math.round(rawToll * (1 - evTollDiscountRate));
  };

  const calculateFuelCost = (distanceKm) => {
    if (fuelType === 'ev') {
      // EV: ~₹2.2 per km electricity consumption
      return Math.round(distanceKm * 2.2);
    } else if (fuelType === 'diesel') {
      // Diesel: ~19 km/l @ ₹90/l = ~₹4.73/km
      return Math.round(distanceKm * 4.73);
    } else {
      // Petrol: ~16 km/l @ ₹102/l = ~₹6.37/km
      return Math.round(distanceKm * 6.37);
    }
  };

  const effectiveTollCost = calculateEffectiveToll(activeRoute.baseToll);
  const effectiveExpressToll = calculateEffectiveToll(corridor.routes.express.baseToll);
  const effectiveFuelCost = calculateFuelCost(activeRoute.distance);
  const effectiveExpressFuel = calculateFuelCost(corridor.routes.express.distance);

  const tollSaved = effectiveExpressToll - effectiveTollCost;
  const extraFuel = effectiveFuelCost - effectiveExpressFuel;
  const netSavings = tollSaved - extraFuel;

  // Handle Custom Search trigger
  const handleCustomSearch = (e) => {
    e.preventDefault();
    const origin = customOrigin.toLowerCase();
    const dest = customDestination.toLowerCase();

    if ((origin.includes('hyd') && dest.includes('del')) || (origin.includes('del') && dest.includes('hyd'))) {
      setSelectedCorridorKey('hyd-del');
    } else if (origin.includes('mum') || dest.includes('pune') || origin.includes('pune') || dest.includes('mum')) {
      setSelectedCorridorKey('mum-pune');
    } else if (origin.includes('agr') || dest.includes('agr') || (origin.includes('del') && dest.includes('agr'))) {
      setSelectedCorridorKey('del-agr');
    } else {
      setSelectedCorridorKey('hyd-blr');
    }
    setPrePassBooked(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <Navigation className="w-6 h-6 text-sky-400" />
            Highway Route & Toll Expense Optimizer
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Pre-trip GIS corridor navigation, fuel-vs-toll economic analysis, and digital pre-pass ticketing.
          </p>
        </div>

        {/* Vehicle & Fuel Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={vehicleClass}
            onChange={(e) => setVehicleClass(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-sky-500 font-medium"
          >
            <option value="Car">Car / SUV</option>
            <option value="Bike">Two-Wheeler</option>
            <option value="Bus">Bus</option>
            <option value="Truck">Commercial Truck</option>
          </select>

          {/* Dynamic Fuel Type Selector */}
          <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-xl">
            {[
              { id: 'petrol', label: 'Petrol', icon: Fuel },
              { id: 'diesel', label: 'Diesel', icon: Fuel },
              { id: 'ev', label: 'EV (Green -20%)', icon: Zap },
            ].map((f) => {
              const Icon = f.icon;
              const isActive = fuelType === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFuelType(f.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? f.id === 'ev'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upgrade 1: Custom Origin & Destination Input Bar */}
      <form
        onSubmit={handleCustomSearch}
        className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col md:flex-row items-center gap-3 shadow-lg"
      >
        <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 w-full">
          <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span className="text-[10px] uppercase font-bold text-slate-500">From:</span>
          <input
            type="text"
            value={customOrigin}
            onChange={(e) => setCustomOrigin(e.target.value)}
            placeholder="Starting City (e.g. Hyderabad, Delhi, Mumbai)"
            className="bg-transparent text-xs text-slate-200 w-full focus:outline-none placeholder:text-slate-600 font-medium"
          />
        </div>

        <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 w-full">
          <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-[10px] uppercase font-bold text-slate-500">To:</span>
          <input
            type="text"
            value={customDestination}
            onChange={(e) => setCustomDestination(e.target.value)}
            placeholder="Destination (e.g. Bangalore, Agra, Pune)"
            className="bg-transparent text-xs text-slate-200 w-full focus:outline-none placeholder:text-slate-600 font-medium"
          />
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/10 flex-shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Find Highway Routes</span>
        </button>
      </form>

      {/* Main Grid: Interactive Map + Route Option Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive Leaflet Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[520px]">
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Route Mapping: <strong className="text-slate-200">{corridor.name}</strong>
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span> Origin
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Toll Plazas ({corridor.plazas.length})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span> Destination
              </span>
            </div>
          </div>

          {/* Leaflet Map Rendering Container */}
          <div className="flex-1 w-full relative z-0">
            <MapContainer
              key={selectedCorridorKey}
              center={corridor.plazas[Math.floor(corridor.plazas.length / 2)].coords}
              zoom={selectedCorridorKey === 'hyd-del' ? 5 : selectedCorridorKey === 'hyd-blr' ? 7 : 9}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%', background: '#0b1329' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Origin Pin */}
              <Marker position={corridor.origin.coords} icon={originIcon}>
                <Popup>
                  <strong>Start:</strong> {corridor.origin.name}
                </Popup>
              </Marker>

              {/* Destination Pin */}
              <Marker position={corridor.destination.coords} icon={destIcon}>
                <Popup>
                  <strong>Destination:</strong> {corridor.destination.name}
                </Popup>
              </Marker>

              {/* Toll Plazas along corridor */}
              {corridor.plazas.map((p, idx) => (
                <Marker key={idx} position={p.coords} icon={plazaIcon}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-slate-600">Standard Fare: ${p.fare}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Active Route Polyline */}
              <Polyline
                positions={activeRoute.path}
                color={activeRoute.color}
                weight={4.5}
                opacity={0.85}
              />
            </MapContainer>
          </div>
        </div>

        {/* Right Column: Route Choices & Economic Trade-off Cards */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500">
                Select Optimized Route
              </p>
              {fuelType === 'ev' && (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Zap className="w-3 h-3" /> 20% EV Green Subsidy
                </span>
              )}
            </div>

            {/* Route Cards */}
            {Object.entries(corridor.routes).map(([type, r]) => {
              const isSelected = selectedRouteType === type;
              const routeToll = calculateEffectiveToll(r.baseToll);

              return (
                <div
                  key={type}
                  onClick={() => {
                    setSelectedRouteType(type);
                    setPrePassBooked(false);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-850 border-sky-500/80 shadow-lg shadow-sky-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200">{r.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        type === 'economy'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : type === 'express'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {r.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 mt-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Travel Time</span>
                      <strong className="text-slate-200 font-semibold">{r.time}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Tolls Crossed</span>
                      <strong className="text-slate-200 font-semibold">{r.plazasCount} Gates</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Total Toll</span>
                      <strong className="text-amber-400 font-bold">${routeToll}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Economic Trade-off Analyzer Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Fuel vs. Toll Economic Analysis
            </div>

            <div className="text-[11px] space-y-1.5 bg-slate-950/70 p-3 rounded-lg border border-slate-850">
              <div className="flex justify-between text-slate-400">
                <span>Toll Amount Saved:</span>
                <span className="text-emerald-400 font-bold">
                  {tollSaved > 0 ? `+$${tollSaved}` : '$0'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Fuel/Energy Cost:</span>
                <span className="text-slate-300 font-semibold">
                  ${effectiveFuelCost}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-slate-200">
                <span>Estimated Net Trip Benefit:</span>
                <span className={netSavings >= 0 ? 'text-emerald-400' : 'text-slate-400'}>
                  {netSavings > 0 ? `+$${netSavings} Net Savings` : 'Fastest Time'}
                </span>
              </div>
            </div>

            {/* One-Click Pre-Pass Booking Button */}
            <button
              onClick={() => {
                setPrePassBooked(true);
                setShowPrePassModal(true);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg"
            >
              <QrCode className="w-4 h-4" />
              <span>
                {prePassBooked
                  ? 'View Digital Corridor Pre-Pass'
                  : `Authorize Digital Corridor Pre-Pass ($${effectiveTollCost})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Corridor Toll Nodes Sequence Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Corridor Toll Nodes & FastLane Status
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Verified automated gates along {corridor.name} with real-time throughput rates.
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-400 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg">
            Active Vehicle Class: <strong className="text-sky-400">{vehicleClass}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Node #</th>
                <th className="py-3 px-4">Toll Plaza Name</th>
                <th className="py-3 px-4">GPS Coordinates</th>
                <th className="py-3 px-4">Effective Fare</th>
                <th className="py-3 px-4">Route Status</th>
                <th className="py-3 px-4">FastLane Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {corridor.plazas.map((p, index) => {
                const isBypassed = selectedRouteType === 'economy' && index % 2 === 1;
                const isTollFree = selectedRouteType === 'scenic';
                const activeOnRoute = !isTollFree && !isBypassed;
                const nodeFare = calculateEffectiveToll(p.fare);

                return (
                  <tr key={index} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 font-bold">
                      #{index + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {p.coords[0].toFixed(3)}°N, {p.coords[1].toFixed(3)}°E
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400">
                      ${nodeFare}
                    </td>
                    <td className="py-3 px-4">
                      {activeOnRoute ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          Active Crossing
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Bypassed (Saved)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ANPR Enabled
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade 3: Digital Highway Pre-Pass Modal with QR Code */}
      {showPrePassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative animate-fade-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 border-b border-slate-800 p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 block">
                  Official Travel Document
                </span>
                <h3 className="text-base font-black text-slate-100 mt-0.5">
                  Digital Highway Trip Pre-Pass
                </h3>
              </div>
              <button
                onClick={() => setShowPrePassModal(false)}
                className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Ticket Top Meta */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Trip Authorization ID:</span>
                  <span className="font-mono font-bold text-sky-400">#TW-PASS-982341</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Highway Corridor:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                    {corridor.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Vehicle Category:</span>
                  <span className="font-semibold text-slate-200">
                    {vehicleClass} ({fuelType.toUpperCase()})
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-850 pt-2.5">
                  <span className="text-slate-500">Total Prepaid Toll:</span>
                  <span className="font-black text-emerald-400 text-sm">
                    ${effectiveTollCost}.00
                  </span>
                </div>
              </div>

              {/* QR Code Graphic Container */}
              <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl space-y-2 shadow-inner">
                <QRCodeSVG
                  value={`TOLLWISE-PASS:ID=982341;CORRIDOR=${selectedCorridorKey};FARE=${effectiveTollCost};VEHICLE=${vehicleClass};VALID=24H`}
                  size={150}
                  level="H"
                  includeMargin={false}
                />
                <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider pt-1">
                  Scan at Plaza Booth for Offline Clearance
                </span>
              </div>

              {/* Validity notice */}
              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-[11px] text-sky-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>
                  Valid for 24 Hours. All <strong>{activeRoute.plazasCount} active toll gates</strong> will automatically open via ANPR or QR fallback scan.
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
                >
                  <Printer className="w-4 h-4" />
                  Print Pass
                </button>
                <button
                  onClick={() => setShowPrePassModal(false)}
                  className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-sky-500/20"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteOptimizer;
