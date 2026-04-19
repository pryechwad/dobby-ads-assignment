import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Layers, ArrowRight, Check, Shield, Users, BarChart2 } from 'lucide-react';
import { useToast } from '../components/Toast';

const PERKS = [
  { icon: Shield, label: 'Secure & private', sub: 'Your data is isolated per account', color: 'text-emerald-500 bg-emerald-50' },
  { icon: Users, label: 'Team-ready', sub: 'Built for creative teams of all sizes', color: 'text-blue-500 bg-blue-50' },
  { icon: BarChart2, label: 'Organized', sub: 'Nested folders with size tracking', color: 'text-violet-500 bg-violet-50' },
];

const strengthLabel = (len) => {
  if (len === 0) return null;
  if (len < 6) return { label: 'Too short', color: 'text-red-500' };
  if (len < 10) return { label: 'Good', color: 'text-amber-500' };
  return { label: 'Strong', color: 'text-emerald-500' };
};

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = strengthLabel(form.password.length);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      toast(err.message || 'Signup failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-4 py-8">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[420px] mx-auto flex flex-col items-center gap-5">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Layers size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Dobby Ads</span>
        </div>

        {/* Hero */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white leading-snug">
            Start for free.{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Scale forever.
            </span>
          </h1>
          <p className="text-white/50 text-sm mt-2">
            Join thousands of creative teams who trust Dobby Ads.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full bg-white rounded-2xl p-6 shadow-xl">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create your account</h2>
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Full name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                placeholder="John Doe" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Work email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                placeholder="you@company.com" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-1 flex-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        form.password.length >= 10 ? 'bg-emerald-500' :
                        form.password.length >= 6 && i < 2 ? 'bg-amber-400' :
                        i === 0 ? 'bg-red-400' : 'bg-gray-200'
                      }`} />
                    ))}
                  </div>
                  {strength && <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-indigo-200 active:scale-[0.98]">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
              ) : (
                <>Create free account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            By creating an account, you agree to our{' '}
            <span className="text-gray-500 underline cursor-pointer">Terms</span> and{' '}
            <span className="text-gray-500 underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>

        {/* Perks */}
        <div className="flex flex-col gap-2 w-full">
          {PERKS.map(({ icon: Icon, label, sub, color }) => (
            <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={15} />
              </div>
              <div>
                <p className="text-white/90 text-sm font-semibold">{label}</p>
                <p className="text-white/40 text-xs">{sub}</p>
              </div>
              <div className="ml-auto w-5 h-5 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <Check size={11} className="text-white/60" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
