'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push('/feed');
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else {
        setError('');
        alert('Pendaftaran berhasil! Silakan login.');
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-1">Winatra</h1>
          <p className="text-sm text-gray-400">Platform sosial organisasi</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            {isLogin ? 'Masuk ke akun' : 'Buat akun baru'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors mt-1"
            >
              {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar'}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-gray-500 mt-4">
          {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-blue-600 font-medium hover:underline"
          >
            {isLogin ? 'Daftar sekarang' : 'Masuk'}
          </button>
        </p>
      </div>
    </div>
  );
}