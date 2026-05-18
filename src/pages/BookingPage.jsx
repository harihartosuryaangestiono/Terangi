import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Video, User } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';

export default function BookingPage() {
  const [formData, setFormData] = useState({ name: '', date: '', time: '', type: 'online' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const isMock = !apiKey || apiKey === 'your_firebase_api_key_here';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isMock) {
      setTimeout(() => {
        setSubmitted(true);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      await addDoc(collection(db, 'bookings'), {
        ...formData,
        userId: currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Gagal menyimpan jadwal. Cek koneksi atau konfigurasi Firebase.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CalendarIcon className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Jadwal Terkonfirmasi!</h2>
        <p className="text-gray-600 mb-8">
          Terima kasih {formData.name}. Jadwal sesi Anda pada {formData.date} jam {formData.time} telah kami simpan.
        </p>
        <Button onClick={() => { setSubmitted(false); setFormData({ ...formData, name: '', date: '', time: '' }); }}>
          Buat Jadwal Baru
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full bg-gray-50 overflow-y-auto p-6 md:rounded-2xl min-h-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Jadwalkan Sesi</h1>
        <p className="text-gray-600">
          Buat janji temu dengan konselor kami untuk sesi konsultasi yang lebih mendalam.
        </p>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Masukkan nama Anda"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Sesi</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all ${formData.type === 'online' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  <input type="radio" name="type" value="online" className="sr-only" checked={formData.type === 'online'} onChange={() => setFormData({...formData, type: 'online'})} />
                  <Video className="w-6 h-6 mb-2" />
                  <span className="font-medium text-sm">Online (Zoom)</span>
                </label>
                <label className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all ${formData.type === 'offline' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  <input type="radio" name="type" value="offline" className="sr-only" checked={formData.type === 'offline'} onChange={() => setFormData({...formData, type: 'offline'})} />
                  <User className="w-6 h-6 mb-2" />
                  <span className="font-medium text-sm text-center">Offline (Tatap Muka)</span>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'Memproses...' : 'Konfirmasi Jadwal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
