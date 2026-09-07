import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert, KeyRound } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check credentials.');
    }
  };

  const loadDemoUser = (role) => {
    if (role === 'admin') {
      setEmail('admin@tollwise.com');
      setPassword('admin123');
    } else {
      setEmail('customer@tollwise.com');
      setPassword('customer123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Welcome to TollWise
          </h2>
          <p className="text-sm text-slate-400 mt-2">Sign in to manage tolls & digital balance</p>
        </div>

        {localError && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg flex items-start space-x-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-200 transition-all placeholder:text-slate-600"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-200 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:from-sky-600 active:to-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials quick loggers */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1.5 justify-center">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            Quick Demo Auto-fill:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => loadDemoUser('customer')}
              className="py-1.5 px-3 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg text-xs hover:text-sky-400 hover:border-sky-500/30 transition-all"
            >
              Demo Customer
            </button>
            <button
              onClick={() => loadDemoUser('admin')}
              className="py-1.5 px-3 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg text-xs hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          New to TollWise?{' '}
          <Link to="/register" className="text-sky-400 hover:underline font-medium">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
