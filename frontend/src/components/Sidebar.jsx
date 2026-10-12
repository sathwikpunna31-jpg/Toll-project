import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  MapPin,
  Calculator,
  CreditCard,
  History,
  FileText,
  User as UserIcon,
  Cpu,
  Navigation,
} from 'lucide-react';

function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const showAI = import.meta.env.VITE_PROJECT_STAGE === '2';
  const isReviewOne = import.meta.env.VITE_REVIEW_PHASE === '1_1';

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'customer'],
    },
    {
      name: 'My Vehicles',
      path: '/vehicles',
      icon: Car,
      roles: ['customer', 'admin'],
      badge: isReviewOne ? 'Review 1' : null,
    },
    {
      name: 'Toll Plazas',
      path: '/plazas',
      icon: MapPin,
      roles: ['admin'], // Admin CRUD, customer view
      badge: isReviewOne ? 'Review 1' : null,
    },
    {
      name: 'Toll Calculator',
      path: '/calculator',
      icon: Calculator,
      roles: ['admin', 'customer'],
      badge: isReviewOne ? 'Review 2' : null,
    },
    {
      name: 'Simulate Toll Gating',
      path: '/payment',
      icon: CreditCard,
      roles: ['customer', 'admin'],
      badge: isReviewOne ? 'Review 2' : null,
    },
    ...(showAI
      ? [
          {
            name: 'AI Smart Gating',
            path: '/ai-gating',
            icon: Cpu,
            roles: ['admin', 'customer'],
            badge: isReviewOne ? 'Phase 2' : null,
          },
          {
            name: 'Route & Toll Optimizer',
            path: '/route-optimizer',
            icon: Navigation,
            roles: ['admin', 'customer'],
            badge: isReviewOne ? 'Phase 2' : null,
          },
        ]
      : []),
    {
      name: 'Transactions',
      path: '/transactions',
      icon: History,
      roles: ['admin', 'customer'],
      badge: isReviewOne ? 'Review 2' : null,
    },
    {
      name: 'Reports & Export',
      path: '/reports',
      icon: FileText,
      roles: ['admin', 'customer'],
      badge: isReviewOne ? 'Review 2' : null,
    },
    {
      name: 'My Profile',
      path: '/profile',
      icon: UserIcon,
      roles: ['admin', 'customer'],
    },
  ];

  const filteredMenu = menuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-[calc(100vh-4rem)]">
      <div className="py-6 px-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-3 mb-4">
          Core Navigation
        </p>

        {filteredMenu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-400 border-l-2 border-sky-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  item.badge === 'Review 1' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Role tag details footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <div className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
          <span>System: {isAdmin ? 'Administrator Portal' : 'User Access Node'}</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
