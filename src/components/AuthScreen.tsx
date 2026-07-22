import { useState } from 'react';
import { useAuth } from '../lib/auth';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password);
      if (result.error) {
        setError(result.error);
      } else if (mode === 'signup') {
        setSuccess('Account created! Check your email to verify, or sign in directly.');
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 items-center justify-center shadow-lg shadow-orange-200 mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">KusinaCost</h1>
          <p className="text-sm text-gray-500 mt-1">Track your food costs, maximize your kita</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            <button
              onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                mode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? '...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="text-[10px] text-gray-400 text-center mt-4">
            Your data is securely stored and only accessible to you.
          </p>
        </div>
      </div>
    </div>
  );
}
