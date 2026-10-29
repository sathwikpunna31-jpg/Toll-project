import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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

// Leaflet map controller to automatically pan & zoom to fit the route bounds
function MapController({ bounds, center }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds[0] && bounds[1]) {
      try {
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 10 });
      } catch (err) {
        if (center) map.setView(center, 6);
      }
    } else if (center) {
      map.setView(center, 6);
    }
  }, [bounds, center, map]);
  return null;
}

// Database of 80+ Major Indian Cities with GPS coordinates for Dynamic Highway Geocoding
const INDIAN_CITIES = {
  'hyderabad': { name: 'Hyderabad, Telangana', coords: [17.3850, 78.4867] },
  'udaipur': { name: 'Udaipur, Rajasthan', coords: [24.5854, 73.7125] },
  'bangalore': { name: 'Bangalore, Karnataka', coords: [12.9716, 77.5946] },
  'bengaluru': { name: 'Bangalore, Karnataka', coords: [12.9716, 77.5946] },
  'delhi': { name: 'New Delhi, NCR', coords: [28.6139, 77.2090] },
  'new delhi': { name: 'New Delhi, NCR', coords: [28.6139, 77.2090] },
  'mumbai': { name: 'Mumbai, Maharashtra', coords: [19.0760, 72.8777] },
  'pune': { name: 'Pune, Maharashtra', coords: [18.5204, 73.8567] },
  'chennai': { name: 'Chennai, Tamil Nadu', coords: [13.0827, 80.2707] },
  'kolkata': { name: 'Kolkata, West Bengal', coords: [22.5726, 88.3639] },
  'jaipur': { name: 'Jaipur, Rajasthan', coords: [26.9124, 75.7873] },
  'ahmedabad': { name: 'Ahmedabad, Gujarat', coords: [23.0225, 72.5714] },
  'surat': { name: 'Surat, Gujarat', coords: [21.1702, 72.8311] },
  'vadodara': { name: 'Vadodara, Gujarat', coords: [22.3072, 73.1812] },
  'agra': { name: 'Agra, Uttar Pradesh', coords: [27.1767, 78.0081] },
  'lucknow': { name: 'Lucknow, Uttar Pradesh', coords: [26.8467, 80.9462] },
  'kanpur': { name: 'Kanpur, Uttar Pradesh', coords: [26.4499, 80.3319] },
  'varanasi': { name: 'Varanasi, Uttar Pradesh', coords: [25.3176, 82.9739] },
  'chandigarh': { name: 'Chandigarh, Punjab/Haryana', coords: [30.7333, 76.7794] },
  'bhopal': { name: 'Bhopal, Madhya Pradesh', coords: [23.2599, 77.4126] },
  'indore': { name: 'Indore, Madhya Pradesh', coords: [22.7196, 75.8577] },
  'nagpur': { name: 'Nagpur, Maharashtra', coords: [21.1458, 79.0882] },
  'visakhapatnam': { name: 'Visakhapatnam, Andhra Pradesh', coords: [17.6868, 83.2185] },
  'vizag': { name: 'Visakhapatnam, Andhra Pradesh', coords: [17.6868, 83.2185] },
  'vijayawada': { name: 'Vijayawada, Andhra Pradesh', coords: [16.5062, 80.6480] },
  'kochi': { name: 'Kochi, Kerala', coords: [9.9312, 76.2673] },
  'cochin': { name: 'Kochi, Kerala', coords: [9.9312, 76.2673] },
  'thiruvananthapuram': { name: 'Thiruvananthapuram, Kerala', coords: [8.5241, 76.9366] },
  'trivandrum': { name: 'Thiruvananthapuram, Kerala', coords: [8.5241, 76.9366] },
  'coimbatore': { name: 'Coimbatore, Tamil Nadu', coords: [11.0168, 76.9558] },
  'madurai': { name: 'Madurai, Tamil Nadu', coords: [9.9252, 78.1198] },
  'goa': { name: 'Panaji, Goa', coords: [15.4909, 73.8278] },
  'panaji': { name: 'Panaji, Goa', coords: [15.4909, 73.8278] },
  'patna': { name: 'Patna, Bihar', coords: [25.5941, 85.1376] },
  'bhubaneswar': { name: 'Bhubaneswar, Odisha', coords: [20.2961, 85.8245] },
  'ranchi': { name: 'Ranchi, Jharkhand', coords: [23.3441, 85.3096] },
  'raipur': { name: 'Raipur, Chhattisgarh', coords: [21.2514, 81.6296] },
  'amritsar': { name: 'Amritsar, Punjab', coords: [31.6340, 74.8723] },
  'ludhiana': { name: 'Ludhiana, Punjab', coords: [30.9010, 75.8573] },
  'jodhpur': { name: 'Jodhpur, Rajasthan', coords: [26.2389, 73.0243] },
  'kota': { name: 'Kota, Rajasthan', coords: [25.2138, 75.8648] },
  'bikaner': { name: 'Bikaner, Rajasthan', coords: [28.0229, 73.3119] },
  'ajmer': { name: 'Ajmer, Rajasthan', coords: [26.4499, 74.6399] },
  'gwalior': { name: 'Gwalior, Madhya Pradesh', coords: [26.2183, 78.1828] },
  'jabalpur': { name: 'Jabalpur, Madhya Pradesh', coords: [23.1815, 79.9864] },
  'ujjain': { name: 'Ujjain, Madhya Pradesh', coords: [23.1765, 75.7885] },
  'mysore': { name: 'Mysore, Karnataka', coords: [12.2958, 76.6394] },
  'mangalore': { name: 'Mangalore, Karnataka', coords: [12.9141, 74.8560] },
  'hubli': { name: 'Hubli, Karnataka', coords: [15.3647, 75.1240] },
  'belgaum': { name: 'Belgaum, Karnataka', coords: [15.8497, 74.4977] },
  'kurnool': { name: 'Kurnool, Andhra Pradesh', coords: [15.8281, 78.0373] },
  'anantapur': { name: 'Anantapur, Andhra Pradesh', coords: [14.6819, 77.6006] },
  'tirupati': { name: 'Tirupati, Andhra Pradesh', coords: [13.6288, 79.4192] },
  'guntur': { name: 'Guntur, Andhra Pradesh', coords: [16.3067, 80.4365] },
  'nellore': { name: 'Nellore, Andhra Pradesh', coords: [14.4426, 79.9865] },
  'warangal': { name: 'Warangal, Telangana', coords: [17.9689, 79.5941] },
  'nizamabad': { name: 'Nizamabad, Telangana', coords: [18.6725, 78.0941] },
  'karimnagar': { name: 'Karimnagar, Telangana', coords: [18.4386, 79.1288] },
  'nashik': { name: 'Nashik, Maharashtra', coords: [19.9975, 73.7898] },
  'aurangabad': { name: 'Chhatrapati Sambhajinagar, Maharashtra', coords: [19.8762, 75.3433] },
  'solapur': { name: 'Solapur, Maharashtra', coords: [17.6599, 75.9064] },
  'kolhapur': { name: 'Kolhapur, Maharashtra', coords: [16.7050, 74.2433] },
  'noida': { name: 'Noida, Uttar Pradesh', coords: [28.5355, 77.3910] },
  'gurgaon': { name: 'Gurugram, Haryana', coords: [28.4595, 77.0266] },
  'gurugram': { name: 'Gurugram, Haryana', coords: [28.4595, 77.0266] },
  'faridabad': { name: 'Faridabad, Haryana', coords: [28.4089, 77.3178] },
  'ghaziabad': { name: 'Ghaziabad, Uttar Pradesh', coords: [28.6692, 77.4538] },
  'meerut': { name: 'Meerut, Uttar Pradesh', coords: [28.9845, 77.7064] },
  'prayagraj': { name: 'Prayagraj, Uttar Pradesh', coords: [25.4358, 81.8463] },
  'allahabad': { name: 'Prayagraj, Uttar Pradesh', coords: [25.4358, 81.8463] },
  'dehradun': { name: 'Dehradun, Uttarakhand', coords: [30.3165, 78.0322] },
  'haridwar': { name: 'Haridwar, Uttarakhand', coords: [29.9457, 78.1642] },
  'shimla': { name: 'Shimla, Himachal Pradesh', coords: [31.1048, 77.1734] },
  'srinagar': { name: 'Srinagar, Jammu & Kashmir', coords: [34.0837, 74.7973] },
  'jammu': { name: 'Jammu, Jammu & Kashmir', coords: [32.7266, 74.8570] },
  'guwahati': { name: 'Guwahati, Assam', coords: [26.1445, 91.7362] },
  'siliguri': { name: 'Siliguri, West Bengal', coords: [26.7271, 88.3953] },
  'salem': { name: 'Salem, Tamil Nadu', coords: [11.6643, 78.1460] },
  'trichy': { name: 'Tiruchirappalli, Tamil Nadu', coords: [10.7905, 78.7047] }
};

// Helper: Fuzzy City Coordinate Finder
function findCityCoordinate(query, defaultCoords = [17.385, 78.4867]) {
  if (!query) return { name: 'Unknown Location', coords: defaultCoords };
  const q = query.toLowerCase().trim();
  for (const [key, city] of Object.entries(INDIAN_CITIES)) {
    if (q.includes(key) || key.includes(q)) {
      return city;
    }
  }
  const formattedName = query.charAt(0).toUpperCase() + query.slice(1);
  return { name: formattedName, coords: defaultCoords };
}

// Helper: Real Highway Distance Calculation (Haversine * 1.25 Circuity Factor)
function haversineDistance(c1, c2) {
  const R = 6371;
  const dLat = ((c2[0] - c1[0]) * Math.PI) / 180;
  const dLng = ((c2[1] - c1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((c1[0] * Math.PI) / 180) *
      Math.cos((c2[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.25);
}

// Dynamic Route & Plaza Generator for Any City Combination
function generateDynamicCorridor(orig, dest) {
  const distance = Math.max(90, haversineDistance(orig.coords, dest.coords));
  const expressHours = Math.floor(distance / 72);
  const expressMins = Math.round(((distance % 72) * 60) / 72);
  const timeStr = `${expressHours}h ${expressMins}m`;

  const expressBaseToll = Math.round(distance * 1.15);
  const economyBaseToll = Math.round(distance * 0.45);
  const tollSaved = expressBaseToll - economyBaseToll;

  // Generate 5 intermediate toll plazas with highway curve trajectory
  const tFractions = [0.18, 0.36, 0.52, 0.70, 0.86];
  const plazas = tFractions.map((t, idx) => {
    const curveOffset = Math.sin(t * Math.PI) * 0.25;
    const lat = +(orig.coords[0] + (dest.coords[0] - orig.coords[0]) * t + curveOffset * 0.4).toFixed(4);
    const lng = +(orig.coords[1] + (dest.coords[1] - orig.coords[1]) * t + curveOffset).toFixed(4);
    const fare = Math.round(expressBaseToll / 5 + (idx % 2 === 0 ? 15 : -15));
    return {
      name: `NH Toll Plaza #${idx + 1} (${orig.name.split(',')[0]} ➔ ${dest.name.split(',')[0]})`,
      coords: [lat, lng],
      fare: Math.max(70, fare),
    };
  });

  const expressPath = [
    orig.coords,
    ...plazas.map(p => p.coords),
    dest.coords,
  ];

  const economyPath = [
    orig.coords,
    plazas[0].coords,
    [+(plazas[1].coords[0] + 0.3).toFixed(4), +(plazas[1].coords[1] + 0.3).toFixed(4)],
    plazas[2].coords,
    [+(plazas[3].coords[0] + 0.3).toFixed(4), +(plazas[3].coords[1] + 0.3).toFixed(4)],
    dest.coords,
  ];

  const scenicPath = [
    orig.coords,
    [+(orig.coords[0] + (dest.coords[0] - orig.coords[0]) * 0.3 - 0.45).toFixed(4), +(orig.coords[1] + (dest.coords[1] - orig.coords[1]) * 0.3 - 0.45).toFixed(4)],
    [+(orig.coords[0] + (dest.coords[0] - orig.coords[0]) * 0.7 - 0.45).toFixed(4), +(orig.coords[1] + (dest.coords[1] - orig.coords[1]) * 0.7 - 0.45).toFixed(4)],
    dest.coords,
  ];

  const economyDistance = Math.round(distance * 1.06);
  const scenicDistance = Math.round(distance * 1.15);

  const econHours = Math.floor(economyDistance / 65);
  const econMins = Math.round(((economyDistance % 65) * 60) / 65);

  const scenicHours = Math.floor(scenicDistance / 55);
  const scenicMins = Math.round(((scenicDistance % 55) * 60) / 55);

  return {
    name: `${orig.name.split(',')[0]} ➔ ${dest.name.split(',')[0]} (National Highway Corridor)`,
    origin: { name: `${orig.name} Highway Entry`, coords: orig.coords },
    destination: { name: `${dest.name} Highway Terminal`, coords: dest.coords },
    plazas,
    routes: {
      express: {
        title: 'Highway Express Corridor',
        time: timeStr,
        distance,
        baseToll: expressBaseToll,
        plazasCount: plazas.length,
        badge: 'Fastest Highway Route',
        color: '#38bdf8',
        path: expressPath,
      },
      economy: {
        title: 'Smart Economy Bypass',
        time: `${econHours}h ${econMins}m`,
        distance: economyDistance,
        baseToll: economyBaseToll,
        plazasCount: 2,
        badge: `🔥 Saves ₹${tollSaved} in Toll Fees`,
        color: '#10b981',
        path: economyPath,
      },
      scenic: {
        title: 'Zero-Toll State Highway',
        time: `${scenicHours}h ${scenicMins}m`,
        distance: scenicDistance,
        baseToll: 0,
        plazasCount: 0,
        badge: '100% Toll-Free',
        color: '#94a3b8',
        path: scenicPath,
      },
    },
  };
}

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
        badge: '🔥 Saves ₹355 in Toll Fees',
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
        title: 'NH-19 Mathura Highway Bypass',
        time: '3h 10m',
        distance: 215,
        baseToll: 175,
        plazasCount: 1,
        badge: '🔥 Saves ₹270 Tolls',
        color: '#10b981',
        path: [
          [28.474, 77.504],
          [28.000, 77.400],
          [27.500, 77.500],
          [27.205, 78.093],
        ],
      },
      scenic: {
        title: 'Palwal Rural Corridor',
        time: '4h 00m',
        distance: 230,
        baseToll: 0,
        plazasCount: 0,
        badge: 'Zero Tolls',
        color: '#94a3b8',
        path: [
          [28.474, 77.504],
          [27.900, 77.200],
          [27.400, 77.300],
          [27.205, 78.093],
        ],
      },
    },
  },
  'mum-pune': {
    name: 'Mumbai ➔ Pune (Yashwantrao Chavan Expressway)',
    origin: { name: 'Kalamboli Interchange, Navi Mumbai', coords: [19.033, 73.029] },
    destination: { name: 'Kiwale Toll Terminal, Pune', coords: [18.718, 73.666] },
    plazas: [
      { name: 'Khalapur Toll Plaza', coords: [18.810, 73.280], fare: 320 },
      { name: 'Talegaon Expressway Toll', coords: [18.725, 73.610], fare: 215 },
    ],
    routes: {
      express: {
        title: 'Mumbai-Pune 6-Lane Expressway',
        time: '1h 45m',
        distance: 94,
        baseToll: 535,
        plazasCount: 2,
        badge: 'Western Express Corridor',
        color: '#38bdf8',
        path: [
          [19.033, 73.029],
          [18.810, 73.280],
          [18.725, 73.610],
          [18.718, 73.666],
        ],
      },
      economy: {
        title: 'Old Mumbai-Pune Highway (NH 48)',
        time: '2h 45m',
        distance: 108,
        baseToll: 0,
        plazasCount: 0,
        badge: '🔥 Saves ₹535 Toll Expense',
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
        badge: '🔥 Saves ₹600 Tolls',
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
  const [customCorridor, setCustomCorridor] = useState(null);
  const [selectedRouteType, setSelectedRouteType] = useState('economy');
  const [vehicleClass, setVehicleClass] = useState('Car');
  
  // Custom Origin & Destination Input States
  const [customOrigin, setCustomOrigin] = useState('Hyderabad');
  const [customDestination, setCustomDestination] = useState('Bangalore');
  
  // Dynamic Fuel Selector (Petrol vs Diesel vs EV)
  const [fuelType, setFuelType] = useState('petrol'); // 'petrol', 'diesel', 'ev'
  
  // Digital Pre-Pass Modal with QR Code
  const [showPrePassModal, setShowPrePassModal] = useState(false);
  const [prePassBooked, setPrePassBooked] = useState(false);

  // Active Corridor Resolution (Custom or Preset)
  const corridor = customCorridor || CORRIDORS[selectedCorridorKey] || CORRIDORS['hyd-blr'];
  const activeRoute = corridor.routes[selectedRouteType] || corridor.routes.express;

  // Compute map bounding box for smooth auto-centering and zoom
  const allPathPoints = activeRoute.path || [];
  const lats = allPathPoints.map((p) => p[0]);
  const lngs = allPathPoints.map((p) => p[1]);
  const corridorBounds =
    lats.length > 0 && lngs.length > 0
      ? [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ]
      : null;

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

  // Handle Custom Search trigger for ANY Indian City Combination
  const handleCustomSearch = (e) => {
    e.preventDefault();
    const origQuery = customOrigin.toLowerCase().trim();
    const destQuery = customDestination.toLowerCase().trim();

    // 1. Check if user selected one of the 4 pre-configured corridors
    if ((origQuery.includes('hyd') && destQuery.includes('del')) || (origQuery.includes('del') && destQuery.includes('hyd'))) {
      setSelectedCorridorKey('hyd-del');
      setCustomCorridor(null);
    } else if (origQuery.includes('mum') && destQuery.includes('pune') || origQuery.includes('pune') && destQuery.includes('mum')) {
      setSelectedCorridorKey('mum-pune');
      setCustomCorridor(null);
    } else if (origQuery.includes('del') && destQuery.includes('agr') || origQuery.includes('agr') && destQuery.includes('del')) {
      setSelectedCorridorKey('del-agr');
      setCustomCorridor(null);
    } else if (origQuery.includes('hyd') && (destQuery.includes('blr') || destQuery.includes('bangalore'))) {
      setSelectedCorridorKey('hyd-blr');
      setCustomCorridor(null);
    } else {
      // 2. DYNAMICALLY GENERATE HIGHWAY ROUTE & TOLLS FOR ANY CITIES (e.g. Hyderabad -> Udaipur, Chennai -> Goa)
      const origCity = findCityCoordinate(customOrigin, [17.385, 78.4867]);
      const destCity = findCityCoordinate(customDestination, [24.5854, 73.7125]);
      
      const dynamicRoute = generateDynamicCorridor(origCity, destCity);
      setCustomCorridor(dynamicRoute);
      setSelectedCorridorKey('custom');
    }

    setPrePassBooked(false);
  };

  // Quick switch between popular corridors
  const handleQuickCorridor = (key, origText, destText) => {
    setSelectedCorridorKey(key);
    setCustomCorridor(null);
    setCustomOrigin(origText);
    setCustomDestination(destText);
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
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setFuelType('petrol')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                fuelType === 'petrol'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Fuel className="w-3.5 h-3.5" /> Petrol
            </button>
            <button
              onClick={() => setFuelType('diesel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                fuelType === 'diesel'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Fuel className="w-3.5 h-3.5" /> Diesel
            </button>
            <button
              onClick={() => setFuelType('ev')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                fuelType === 'ev'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> EV (Green -20%)
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Search Bar: Search ANY City in India */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <form onSubmit={handleCustomSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 font-bold text-xs flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> FROM:
            </span>
            <input
              type="text"
              value={customOrigin}
              onChange={(e) => setCustomOrigin(e.target.value)}
              placeholder="e.g. Hyderabad, Mumbai, Delhi, Udaipur..."
              className="w-full pl-20 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-semibold focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="md:col-span-5 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-400 font-bold text-xs flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> TO:
            </span>
            <input
              type="text"
              value={customDestination}
              onChange={(e) => setCustomDestination(e.target.value)}
              placeholder="e.g. Udaipur, Bangalore, Jaipur, Goa, Pune..."
              className="w-full pl-16 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-semibold focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" /> Find Highway Routes
            </button>
          </div>
        </form>

        {/* Quick Route Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-850/80 text-[11px]">
          <span className="text-slate-500 font-semibold">Popular Highway Corridors:</span>
          <button
            type="button"
            onClick={() => {
              setCustomOrigin('Hyderabad');
              setCustomDestination('Udaipur');
              const orig = findCityCoordinate('Hyderabad');
              const dest = findCityCoordinate('Udaipur');
              setCustomCorridor(generateDynamicCorridor(orig, dest));
              setSelectedCorridorKey('custom');
            }}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
              customDestination === 'Udaipur'
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Hyderabad ➔ Udaipur
          </button>
          <button
            type="button"
            onClick={() => handleQuickCorridor('hyd-blr', 'Hyderabad', 'Bangalore')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
              selectedCorridorKey === 'hyd-blr' && !customCorridor
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Hyderabad ➔ Bangalore
          </button>
          <button
            type="button"
            onClick={() => handleQuickCorridor('hyd-del', 'Hyderabad', 'New Delhi')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
              selectedCorridorKey === 'hyd-del' && !customCorridor
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Hyderabad ➔ Delhi (NH 44)
          </button>
          <button
            type="button"
            onClick={() => handleQuickCorridor('del-agr', 'New Delhi', 'Agra')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
              selectedCorridorKey === 'del-agr' && !customCorridor
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Delhi ➔ Agra
          </button>
          <button
            type="button"
            onClick={() => handleQuickCorridor('mum-pune', 'Mumbai', 'Pune')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
              selectedCorridorKey === 'mum-pune' && !customCorridor
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            Mumbai ➔ Pune
          </button>
        </div>
      </div>

      {/* Main Grid: Live Interactive Leaflet Map + Route Economics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): OpenStreetMap Leaflet GIS Visualizer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
          
          {/* Map Top Bar */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-400">Live Route Mapping:</span>
              <span className="font-bold text-slate-100">{corridor.name}</span>
            </div>

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
              key={corridor.name}
              center={corridor.origin.coords}
              zoom={6}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%', background: '#0b1329' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Dynamic Auto-Fit Bounds & Centering Controller */}
              <MapController bounds={corridorBounds} center={corridor.origin.coords} />

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
                      <p className="text-slate-600">Standard Fare: ₹{p.fare}</p>
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
                      <strong className="text-amber-400 font-bold">₹{routeToll}</strong>
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
                  {tollSaved > 0 ? `+₹${tollSaved}` : '₹0'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Fuel/Energy Cost:</span>
                <span className="text-slate-300 font-semibold">
                  ₹{effectiveFuelCost}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-slate-200">
                <span>Estimated Net Trip Benefit:</span>
                <span className={netSavings >= 0 ? 'text-emerald-400' : 'text-slate-400'}>
                  {netSavings > 0 ? `+₹${netSavings} Net Savings` : 'Fastest Time'}
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
                  : `Authorize Digital Corridor Pre-Pass (₹${effectiveTollCost})`}
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
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {activeOnRoute ? `₹${nodeFare}` : '₹0 (Bypassed)'}
                    </td>
                    <td className="py-3 px-4">
                      {activeOnRoute ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          Active Plaza
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          State Road Bypass
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        RFID RFID-FastTrack Ready
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Pre-Pass Modal with Scannable QR Code */}
      {showPrePassModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Digital Corridor Pre-Pass</h3>
                  <p className="text-xs text-slate-400">Authorized FastLane QR clearance pass</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrePassModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Corridor</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">{corridor.name}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  CONFIRMED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-850 py-3">
                <div>
                  <span className="text-[10px] text-slate-500">Route Type</span>
                  <p className="font-semibold text-slate-300">{activeRoute.title}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Total Toll Paid</span>
                  <p className="font-bold text-amber-400 font-mono">₹{effectiveTollCost}.00</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Vehicle Category</span>
                  <p className="font-semibold text-slate-300">{vehicleClass}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Fuel Technology</span>
                  <p className="font-semibold text-slate-300 capitalize">{fuelType} Engine</p>
                </div>
              </div>

              {/* QR Code Presentation */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl">
                <QRCodeSVG
                  value={`TOLLWISE-PASS:CORRIDOR=${encodeURIComponent(corridor.name)};FARE=${effectiveTollCost};VEHICLE=${vehicleClass};VALID=24H`}
                  size={140}
                  level="H"
                />
                <p className="text-[9px] font-mono text-slate-700 font-bold mt-2">
                  PASS-ID: TW-{Math.floor(100000 + Math.random() * 900000)} • SCAN AT FASTLANE
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5" /> Print E-Pass
              </button>
              <button
                onClick={() => setShowPrePassModal(false)}
                className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-sky-500/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteOptimizer;
