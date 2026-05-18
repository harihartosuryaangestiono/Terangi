import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { Card, CardContent } from '../components/Card';

const defaultCenter = { lat: -6.200000, lng: 106.816666 }; // Jakarta Default

export default function LocationsPage() {
  const [center, setCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Nearby State
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  // Get User Geolocation on mount
  useEffect(() => {
    if (navigator.geolocation && isLoaded) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(loc);
          setUserLocation(loc);
        },
        () => {
          console.warn("Geolocation permission denied or unavailable.");
        }
      );
    }
  }, [isLoaded]);

  // Fetch Nearby Facilities using Overpass API whenever center changes
  useEffect(() => {
    let isCancelled = false;
    
    const fetchNearby = async () => {
      setIsLoadingNearby(true);
      try {
        const radius = 5000;
        const query = `
          [out:json][timeout:10];
          (
            node["amenity"~"hospital|clinic"](around:${radius},${center.lat},${center.lng});
            way["amenity"~"hospital|clinic"](around:${radius},${center.lat},${center.lng});
          );
          out center 15;
        `;
        
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        });
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Terlalu banyak permintaan (Rate Limit). Menampilkan data simulasi sementara.");
          }
          throw new Error("Network response was not ok");
        }
        
        const data = await response.json();
        if (isCancelled) return;
        
        const facilities = data.elements.map(el => {
          const lat = el.lat || el.center.lat;
          const lon = el.lon || el.center.lon;
          let name = el.tags?.name || '';
          
          if (!name) name = el.tags?.amenity === 'hospital' ? 'Rumah Sakit' : 'Klinik';
          
          let address = [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ');
          if (!address) address = 'Alamat detail tidak tersedia (Data OSM)';

          return { id: el.id, name, address, position: { lat, lng: lon }, distance: 'Radius ~5km' };
        }).filter(f => f.name);

        setNearbyFacilities(facilities);
      } catch (error) {
        if (!isCancelled) {
          console.warn("Overpass API:", error.message);
          // Fallback to mock data to prevent empty UI on 429
          setNearbyFacilities([
            { id: 'mock1', name: 'Klinik Kesehatan Terdekat (Simulasi)', address: 'Data asli tertunda karena server sibuk', position: { lat: center.lat + 0.01, lng: center.lng + 0.01 }, distance: 'Dekat sini' },
            { id: 'mock2', name: 'Rumah Sakit Umum (Simulasi)', address: 'Coba ulangi beberapa saat lagi', position: { lat: center.lat - 0.01, lng: center.lng - 0.01 }, distance: 'Sekitar Anda' }
          ]);
        }
      } finally {
        if (!isCancelled) setIsLoadingNearby(false);
      }
    };

    // Debounce: wait 1.5 seconds after center stops changing to fetch
    const timer = setTimeout(() => {
      fetchNearby();
    }, 1500);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [center]);

  // Debounced Search using Nominatim API
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          // Batasi pencarian di Indonesia (countrycodes=id)
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=id`);
          const data = await res.json();
          setSearchResults(data);
          setShowDropdown(true);
        } catch (error) {
          console.error("Nominatim API error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPlace = (place) => {
    const newLoc = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    setCenter(newLoc);
    setSearchQuery(place.display_name.split(',')[0]); // Ambil nama depannya saja
    setShowDropdown(false);
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-gray-50 md:rounded-2xl overflow-hidden relative min-h-0">
      {/* Map */}
      <div className="flex-1 bg-blue-50 relative">
        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY && import.meta.env.VITE_GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here' && isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            center={center}
            zoom={13}
            options={{ disableDefaultUI: true }}
          >
            {userLocation && (
              <Marker 
                position={userLocation} 
                icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
                title="Lokasi Anda" 
                zIndex={999}
              />
            )}
            {nearbyFacilities.map(loc => (
              <Marker 
                key={loc.id} 
                position={loc.position} 
                title={loc.name} 
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center flex-col text-blue-400 bg-blue-100/50">
            <MapPin className="w-16 h-16 mb-2 opacity-50 text-blue-500" />
            <p className="font-medium text-center px-4 text-blue-600">
              Google Maps API Placeholder<br/>
              <span className="text-xs font-normal opacity-80">
                Tambahkan VITE_GOOGLE_MAPS_API_KEY di .env.local
              </span>
            </p>
          </div>
        )}

        {/* Floating Search */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2">
          <div className="bg-white rounded-xl shadow-lg flex-1 relative border border-gray-100">
            <div className="flex items-center px-4 py-3">
              {isSearching ? (
                <Loader2 className="w-5 h-5 text-primary-500 mr-3 shrink-0 animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              )}
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(searchResults.length > 0) setShowDropdown(true); }}
                placeholder="Cari daerah (contoh: Kemang, Bandung)..." 
                className="w-full bg-transparent border-none outline-none text-gray-800"
              />
            </div>

            {/* Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
                {searchResults.map((res) => (
                  <div 
                    key={res.place_id} 
                    className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-start gap-3 text-sm text-gray-700"
                    onClick={() => handleSelectPlace(res)}
                  >
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{res.display_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {userLocation && (
             <button 
               onClick={() => {
                 setCenter(userLocation);
                 setSearchQuery('');
               }} 
               className="h-12 w-12 bg-white rounded-xl shadow-lg text-primary-500 flex items-center justify-center hover:bg-gray-50 border border-gray-100 shrink-0"
               title="Kembali ke lokasi saya"
             >
               <Navigation className="w-5 h-5" />
             </button>
          )}
        </div>
      </div>

      {/* Bottom Sheet / List */}
      <div className="bg-white border-t border-gray-200 rounded-t-3xl -mt-6 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col max-h-[50%] min-h-[30%]">
        <div className="p-4 border-b border-gray-100 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        </div>
        <div className="overflow-y-auto p-4 space-y-3 flex-1 relative">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-900">Fasilitas di Sekitar</h2>
            {isLoadingNearby && <span className="text-xs text-primary-500 font-medium animate-pulse">Memuat...</span>}
          </div>
          
          {isLoadingNearby && nearbyFacilities.length === 0 ? (
            <div className="text-center p-8 text-gray-400 flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary-400" />
              Mencari rumah sakit dan klinik terdekat...
            </div>
          ) : nearbyFacilities.length > 0 ? (
            nearbyFacilities.map((loc) => (
              <Card 
                key={loc.id} 
                className="border-gray-100 shadow-sm bg-white hover:bg-gray-50 cursor-pointer transition-colors" 
                onClick={() => setCenter(loc.position)}
              >
                <CardContent className="p-4 flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{loc.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{loc.address}</p>
                    <p className="text-xs font-medium text-primary-600 mt-1">{loc.distance}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
             <div className="text-center p-8 text-gray-500">
               Tidak ada fasilitas layanan kesehatan (OSM) yang ditemukan dalam radius 5km. Coba geser peta atau cari kota lain.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
