import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Calendar, MapPin, AlertCircle, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export function MainLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Beranda' },
    { to: '/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/booking', icon: Calendar, label: 'Jadwal' },
    { to: '/locations', icon: MapPin, label: 'Lokasi' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-16 flex flex-col">
      {/* Top Navbar for Desktop */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 items-center px-6 shadow-sm">
        <div className="flex-1">
          <NavLink to="/" className="text-2xl font-bold text-primary-500 flex items-center gap-2">
            <span className="bg-primary-500 text-white rounded-lg w-8 h-8 flex items-center justify-center text-xl">
              T
            </span>
            Terangi
          </NavLink>
        </div>
        <nav className="flex gap-6 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 font-medium transition-colors',
                  isActive ? 'text-primary-500' : 'text-gray-500 hover:text-gray-900'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/emergency"
            className="flex items-center gap-2 font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            <AlertCircle className="w-5 h-5" />
            Darurat
          </NavLink>
          {currentUser && currentUser.uid !== 'mock-user-id' ? (
            <button onClick={handleLogout} className="ml-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-500">
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          ) : (
             <NavLink to="/login" className="ml-4 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-200">
               Masuk
             </NavLink>
          )}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto md:p-6 bg-white md:rounded-2xl md:my-6 md:shadow-sm overflow-hidden flex flex-col min-h-[calc(100vh-4rem)] relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100 relative z-10 bg-white">
          <div className="font-bold text-primary-500 flex items-center gap-2">
            <span className="bg-primary-500 text-white rounded-lg w-6 h-6 flex items-center justify-center text-sm">T</span>
            Terangi
          </div>
          {currentUser && currentUser.uid !== 'mock-user-id' ? (
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-1">
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <NavLink to="/login" className="text-sm font-medium text-primary-600">Masuk</NavLink>
          )}
        </div>
        
        <Outlet />
      </main>

      {/* Bottom Navbar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-50 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'
              )
            }
          >
            <item.icon className={cn("w-6 h-6")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        <NavLink
            to="/emergency"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              )
            }
          >
            <div className="bg-red-50 text-red-500 p-2 rounded-full -mt-6 shadow-sm border-2 border-white">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium text-red-500">Darurat</span>
          </NavLink>
      </nav>
    </div>
  );
}
