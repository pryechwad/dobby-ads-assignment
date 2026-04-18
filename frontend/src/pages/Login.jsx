import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Layers, ArrowRight, Folder, Image, Zap } from 'lucide-react';
import { useToast } from '../components/Toast';

const FEATURES = [
  { icon: Folder, label: 'Nested folders', color: 'bg-amber-100 text-amber-600' },
  { icon: Image, label: 'Image uploads', color: 'bg-blue-100 text-blue-600' },
  { icon: Zap, label: 'Lightning fast', color: 'bg-violet-100 text-violet-600' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      toast(err.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">

      {/* ── Branding ── */}
      <div className="
        lg:w-[52%] lg:min-h-screen
        bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]
        relative overflow-hidden flex flex-col
        px-6 pt-10 pb-8 lg:p-14
      ">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Layers size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Dobby Ads</span>
        </div>

        {/* Mobile: compact hero */}
        <div className="relative mt-6 lg:hidden">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1 mb-3">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/70 text-xs font-medium">Your creative workspace</span>
          </div>
          <h2 className="text-2xl font-bold text-white leading-snug mb-2">
            Manage your{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              ad assets
            </span>{' '}
            beautifully.
          </h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {FEATURES.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${color}`}>
                  <Icon size={11} />
                </div>
                <span className="text-white/70 text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: full hero */}
        <div className="relative mt-auto mb-10 hidden lg:block">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/10 rounded-full px-3 py-1.5 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/80 text-xs font-medium">Your creative workspace</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-[1.15] mb-5">
            Manage your<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">ad assets</span>
            <br />beautifully.
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Organize folders, upload images, and collaborate — all in one place built for creative teams.
          </p>
        </div>

        <div className="relative flex-wrap gap-2 hidden lg:flex">
          {FEATURES.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 bg-white/8 backdrop-blur border border-white/10 rounded-xl px-3 py-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${color}`}><Icon size={12} /></div>
              <span className="text-white/70 text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="relative mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 hidden lg:block">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-white/50 text-xs mt-0.5">Assets managed</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-white/50 text-xs mt-0.5">Creative teams</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-white/50 text-xs mt-0.5">Uptime</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-2xl font-bold text-white">∞</p>
              <p className="text-white/50 text-xs mt-0.5">Nested folders</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 lg:p-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in to your account</h2>
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Create one free</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-indigo-200 active:scale-[0.98]">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
              ) : (
                <>Continue <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in, you agree to our{' '}
            <span className="text-gray-500 underline cursor-pointer">Terms</span> and{' '}
            <span className="text-gray-500 underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
