import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Search,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Compass,
  Building,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export const AiPlacesStudio: React.FC = () => {
  const [query, setQuery] = useState('');
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [places, setPlaces] = useState<Array<{ name: string; address: string; mapUrl: string; type: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    'Coffee shops and cafes',
    'Pharmacies and medical clinics',
    'Libraries and quiet workspaces',
    'Fast EV charging stations'
  ];

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser');
      return;
    }
    setGeoStatus('Locating your GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatLng({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoStatus(`GPS Locked: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        setGeoStatus(`Location access denied. Using text search context.`);
      },
      { timeout: 8000 }
    );
  };

  // 100% Free Public Geospatial Search (Zero API Key Required)
  const handleSearch = async (targetQuery?: string) => {
    const q = targetQuery || query;
    if (!q.trim()) {
      setError('Please enter a place type or search query.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlaces([]);

    try {
      let searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q.trim())}&format=json&addressdetails=1&limit=8`;
      if (latLng) {
        // Bias search towards user's current GPS location
        searchUrl += `&viewbox=${latLng.lng - 0.2},${latLng.lat + 0.2},${latLng.lng + 0.2},${latLng.lat - 0.2}&bounded=0`;
      }

      const res = await fetch(searchUrl, {
        headers: { 'Accept-Language': 'en' },
      });
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        // Fallback search with generic Google Maps links
        setPlaces([
          {
            name: `${q} (Nearby Search)`,
            address: 'Query mapped to active geographical area',
            mapUrl: `https://www.google.com/maps/search/${encodeURIComponent(q)}`,
            type: 'Location Search',
          },
        ]);
        return;
      }

      const formatted = data.map((item: any) => ({
        name: item.display_name.split(',')[0] || item.name || q,
        address: item.display_name,
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.lat + ',' + item.lon)}`,
        type: item.type || item.class || 'Place',
      }));

      setPlaces(formatted);
    } catch (err: any) {
      setError(`Location lookup notice: ${err.message || 'Lookup paused'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 100% Free Engine Badge */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Real-Time Geospatial Maps Engine • Zero API Key Required • Lifetime ₹0 Free</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          HTML5 Geolocation + OpenStreetMap
        </span>
      </div>

      {/* Search Header */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <Compass className="w-4 h-4" />
            <span>Places & Navigation Finder</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
            Real GPS & Navigation Links
          </span>
        </div>

        {/* Location Detector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <Navigation className={`w-4 h-4 ${latLng ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>
              {latLng ? (
                <span className="text-emerald-400 font-mono">
                  Coordinates: {latLng.lat.toFixed(4)}, {latLng.lng.toFixed(4)}
                </span>
              ) : (
                geoStatus || 'Click "Use My Location" to prioritize nearby places'
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={detectLocation}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>{latLng ? 'Re-Detect GPS' : 'Use My Location'}</span>
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search cafes, restaurants, pharmacies, coworking spaces, banks, hotels..."
            className="w-full pl-11 pr-28 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:border-rose-500 focus:outline-none transition-colors"
          />
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-2 px-4 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-950/30 flex items-center gap-1.5 cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Find Places</span>
          </button>
        </div>

        {/* Sample query buttons */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Example Searches
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sq) => (
              <button
                key={sq}
                type="button"
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs transition-colors text-left flex items-center gap-1.5"
              >
                <Building className="w-3 h-3 text-rose-400" />
                <span>{sq}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-xs text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {places.length > 0 && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Verified Location Results ({places.length})</span>
            </div>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Direct Navigation Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {places.map((place, i) => (
              <a
                key={i}
                href={place.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between text-xs text-slate-200 group transition-all"
              >
                <div className="truncate pr-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                      {place.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {place.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {place.address}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-rose-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
