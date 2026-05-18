import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Calendar, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Konsultasi Chat',
      description: 'Bicara langsung dengan pekerja sosial atau konselor.',
      icon: MessageCircle,
      color: 'bg-blue-100 text-blue-600',
      path: '/chat'
    },
    {
      title: 'Jadwalkan Sesi',
      description: 'Buat janji temu online atau tatap muka.',
      icon: Calendar,
      color: 'bg-green-100 text-green-600',
      path: '/booking'
    },
    {
      title: 'Lokasi Layanan',
      description: 'Temukan fasilitas sosial terdekat.',
      icon: MapPin,
      color: 'bg-purple-100 text-purple-600',
      path: '/locations'
    }
  ];

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto min-h-0">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-8 text-white rounded-b-3xl md:rounded-t-2xl shadow-md">
        <h1 className="text-3xl font-bold mb-2">Butuh Bantuan?</h1>
        <p className="text-primary-50 mb-6">
          Terangi siap membantu Anda melewati masa sulit. Kami ada di sini untuk mendengarkan.
        </p>
        <Button 
          variant="secondary" 
          className="w-full sm:w-auto font-semibold shadow-lg text-primary-600 hover:text-primary-700 hover:bg-white"
          onClick={() => navigate('/emergency')}
        >
          <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
          Bantuan Darurat Sekarang
        </Button>
      </div>

      {/* Main Features */}
      <div className="p-6 flex-1 bg-gray-50 md:bg-white md:rounded-b-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Layanan Kami</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feat, idx) => (
            <Card key={idx} className="cursor-pointer hover:shadow-md transition-shadow border-gray-100" onClick={() => navigate(feat.path)}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${feat.color}`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{feat.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{feat.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-5 bg-orange-50 rounded-2xl border border-orange-100">
          <h3 className="font-bold text-orange-800 mb-2">Mengapa Terangi?</h3>
          <p className="text-sm text-orange-700 leading-relaxed">
            Terangi membawa cahaya informasi ke dalam permasalahan sosial, membantu Anda menemukan solusi, dukungan, dan harapan dengan cara yang aman dan rahasia.
          </p>
        </div>
      </div>
    </div>
  );
}
