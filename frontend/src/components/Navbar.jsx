import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Wallet, Bell } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-20 relative">
      {/* Brand logo details */}
      <div className="flex items-center space-x-3">
        <div className="bg-sky-500/10 p-2 rounded-lg border border-sky-500/20">
          <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            TollWise
          </span>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold hidden sm:inline-block">
          Automated Tolls
        </span>
      </div>

      {/* Profile and Quick Balance Widgets */}
      <div className="flex items-center space-x-4">
        {/* Balance badge */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.5 flex items-center space-x-2">
          <Wallet className="w-4 h-4 text-sky-400" />
          <div className="text-xs text-left">
            <p className="text-slate-500 text-[10px] leading-none font-semibold uppercase">Wallet</p>
            <p className="font-bold text-slate-200">${user?.walletBalance?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
            <p className="text-[10px] uppercase font-bold text-sky-500 tracking-wider">
              {user?.role}
            </p>
          </div>
          <div className="bg-slate-800 hover:bg-slate-700 transition-colors p-2 rounded-full border border-slate-700 text-slate-300 cursor-pointer">
            <User className="w-4 h-4" />
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
