import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, currentUser } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  React.useEffect(() => {
    if (currentUser && currentUser.uid !== 'mock-user-id') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (currentUser && currentUser.uid !== 'mock-user-id') {
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Gagal untuk masuk/mendaftar. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 text-white mb-4 shadow-lg text-3xl font-bold">
            T
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Terangi</h1>
          <p className="text-gray-500 mt-2">Masuk untuk mengakses layanan penuh</p>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>{isLogin ? 'Masuk' : 'Daftar'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Masukkan email dan password Anda' : 'Buat akun baru untuk mulai menggunakan Terangi'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start gap-2 mb-4 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Memproses...' : (isLogin ? <><LogIn className="w-4 h-4 mr-2" /> Masuk</> : <><UserPlus className="w-4 h-4 mr-2" /> Daftar</>)}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary-600 text-sm font-medium hover:underline"
              >
                {isLogin ? 'Belum punya akun? Daftar sekarang' : 'Sudah punya akun? Masuk di sini'}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={() => navigate('/')}
                className="text-gray-400 text-sm hover:text-gray-600"
              >
                Lanjutkan sebagai tamu
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
