

import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/jagodanaparivar.png';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/admin/overview';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password';
      setError(errorMessage);
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="brand-card bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-slate-100">
        <div className="brand-gradient p-8 text-white text-center">
          <img src={logo} alt="Jagodana Parivar" className="brand-logo h-24 w-24 mx-auto mb-4 rounded-full bg-white p-1 shadow-xl" />
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75 mb-2">Jagodana Parivar</p>
          <h2 className="text-2xl font-bold tracking-wide">Admin Portal</h2>
          <p className="text-white/70 text-sm mt-2">Secure administration access</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 uppercase text-xs tracking-wide">Email</label>
              <input
                type="email"
                required
                disabled={isLoading}
                className="block w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                placeholder="Enter Email Address"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 uppercase text-xs tracking-wide">Password</label>
              <input
                type="password"
                required
                disabled={isLoading}
                className="block w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter Password"
              />
            </div>

            {error && <p className="text-red-600 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Access Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
