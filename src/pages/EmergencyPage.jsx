import React from 'react';
import { PhoneCall, AlertTriangle, Shield, HeartPulse } from 'lucide-react';
import { Card, CardContent } from '../components/Card';

export default function EmergencyPage() {
  const emergencies = [
    {
      title: 'Polisi',
      number: '110',
      icon: Shield,
      color: 'bg-blue-100 text-blue-600 border-blue-200'
    },
    {
      title: 'Ambulans / Medis',
      number: '118',
      icon: HeartPulse,
      color: 'bg-green-100 text-green-600 border-green-200'
    },
    {
      title: 'Layanan Sahabat Perempuan dan Anak (SAPA)',
      number: '129',
      icon: AlertTriangle,
      color: 'bg-purple-100 text-purple-600 border-purple-200'
    },
    {
      title: 'Kementerian Sosial (Command Center)',
      number: '171',
      icon: PhoneCall,
      color: 'bg-orange-100 text-orange-600 border-orange-200'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-red-50/30 overflow-y-auto p-6 md:rounded-2xl">
      <div className="text-center mb-8 mt-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 mb-4 shadow-sm">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kontak Darurat</h1>
        <p className="text-gray-600">
          Segera hubungi layanan di bawah ini jika Anda berada dalam situasi darurat.
        </p>
      </div>

      <div className="space-y-4">
        {emergencies.map((item, idx) => (
          <a key={idx} href={`tel:${item.number}`} className="block">
            <Card className={`border-2 hover:shadow-md transition-shadow ${item.color.replace('bg-', 'hover:bg-').replace('text-', '')}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full bg-white shadow-sm`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="text-2xl font-black mt-1 tracking-wider">{item.number}</p>
                  </div>
                </div>
                <PhoneCall className="w-6 h-6 opacity-50" />
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
      
      <p className="text-xs text-center text-gray-400 mt-8">
        Ketuk nomor untuk langsung melakukan panggilan.
      </p>
    </div>
  );
}
