import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  Navigation,
  Sparkles,
  Check,
  X,
  Building,
  Home,
  Clock,
  Globe,
  Search,
  Crosshair,
  Loader2,
} from 'lucide-react';
import { ElsaLogo } from './ElsaLogo';
import { User, UserLocation, Address } from '../types';
import {
  store,
  POPULAR_NAIROBI_LOCATIONS,
  DEFAULT_USER_LOCATION,
} from '../services/store';
import {
  reverseGeocodeCoordinates,
  detectLocationViaIP,
  searchPlaces,
  PlaceSearchResult,
} from '../services/geolocation';

interface TopLaundryBannerProps {
  currentUser: User;
}

export const TopLaundryBanner: React.FC<TopLaundryBannerProps> = ({ currentUser }) => {
  const [currentLocation, setCurrentLocation] = useState<UserLocation>(store.getLocation());
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  // Real-time location search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Custom manual street/apartment entry
  const [customStreet, setCustomStreet] = useState('');
  const [customArea, setCustomArea] = useState('Kilimani');

  // Customer's saved addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(
    store.getAddresses(currentUser.id)
  );

  // Perform exact real-time GPS detection with high accuracy
  const detectUserRealLocation = async (isManualClick = false) => {
    setIsDetectingGps(true);
    setGpsError(null);

    const tryIpFallback = async () => {
      try {
        const ipLocation = await detectLocationViaIP();
        if (ipLocation) {
          store.setLocation(ipLocation);
          return true;
        }
      } catch (err) {
        console.warn('IP location failed:', err);
      }
      return false;
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude, accuracy } = position.coords;
            setGpsAccuracy(accuracy);
            const resolved = await reverseGeocodeCoordinates(latitude, longitude, accuracy);
            store.setLocation(resolved);
            if (isManualClick) setIsLocationModalOpen(false);
          } catch (err) {
            console.warn('Reverse geocode failed:', err);
            await tryIpFallback();
          } finally {
            setIsDetectingGps(false);
          }
        },
        async (error) => {
          console.warn('GPS position error:', error);
          const ipSucceeded = await tryIpFallback();
          setIsDetectingGps(false);
          if (!ipSucceeded) {
            const userSaved = store.getAddresses(currentUser.id);
            const defaultAddr = userSaved.find((a) => a.is_default) || userSaved[0];
            if (defaultAddr) {
              store.setLocation({
                area: defaultAddr.city.split(',')[0].trim() || 'Nairobi',
                street: defaultAddr.street,
                city: defaultAddr.city.includes('Kenya') ? defaultAddr.city : `${defaultAddr.city}, Kenya`,
                lat: defaultAddr.lat,
                lng: defaultAddr.lng,
                source: 'saved',
                updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
            } else {
              store.setLocation({
                ...DEFAULT_USER_LOCATION,
                updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
            }
          }
          if (isManualClick) {
            setGpsError('Exact GPS request timed out or was blocked by browser permissions. You can also search your exact estate or street below.');
          }
        },
        { timeout: 12000, enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      await tryIpFallback();
      setIsDetectingGps(false);
    }
  };

  // Debounced search query handler
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Auto-detect location on initial load
  useEffect(() => {
    detectUserRealLocation(false);
  }, [currentUser.id]);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentLocation(store.getLocation());
      setSavedAddresses(store.getAddresses(currentUser.id));
    });
    return () => unsub();
  }, [currentUser.id]);

  const handleSelectSearchResult = (result: PlaceSearchResult) => {
    const updated: UserLocation = {
      area: result.area,
      street: result.street,
      city: result.city,
      country: result.country,
      lat: result.lat,
      lng: result.lng,
      source: 'manual',
      isOutsideKenya: result.country.toLowerCase() !== 'kenya',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    store.setLocation(updated);
    setSearchQuery('');
    setSearchResults([]);
    setIsLocationModalOpen(false);
  };

  const handleSelectPreset = (loc: (typeof POPULAR_NAIROBI_LOCATIONS)[0]) => {
    const updated: UserLocation = {
      area: loc.area,
      street: loc.street,
      city: loc.city,
      lat: loc.lat,
      lng: loc.lng,
      source: 'preset',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    store.setLocation(updated);
    setIsLocationModalOpen(false);
  };

  const handleSelectSavedAddress = (addr: Address) => {
    const updated: UserLocation = {
      area: addr.city.split(',')[0].trim() || 'Nairobi',
      street: addr.street,
      city: addr.city.includes('Kenya') ? addr.city : `${addr.city}, Kenya`,
      lat: addr.lat,
      lng: addr.lng,
      source: 'saved',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    store.setLocation(updated);
    setIsLocationModalOpen(false);
  };

  const handleDetectGps = () => {
    detectUserRealLocation(true);
  };

  const handleSaveCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStreet.trim()) return;

    const updated: UserLocation = {
      area: customArea || 'Nairobi',
      street: customStreet.trim(),
      city: 'Nairobi, Kenya',
      source: 'manual',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    store.setLocation(updated);
    setCustomStreet('');
    setIsLocationModalOpen(false);
  };

  return (
    <>
      {/* Top Banner Container: Sticky across all user roles */}
      <div
        id="global-top-laundry-banner"
        className="w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md border-b border-blue-800/40 shrink-0 select-none z-20"
      >
        {/* Main Banner Row */}
        <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
          {/* Laundry Name & Branding */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <ElsaLogo size="sm" withGlow />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white truncate">
                  Elsa Laundry Services
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Open
                </span>
              </div>
              <p className="text-[10px] text-blue-200/80 font-medium truncate">
                For a spotless clean • +254 746 438 776
              </p>
            </div>
          </div>

          {/* Compact Location Chip */}
          <button
            id="banner-location-trigger-btn"
            onClick={() => setIsLocationModalOpen(true)}
            title={`Current Location: ${currentLocation.street ? `${currentLocation.street}, ` : ''}${currentLocation.area}, ${currentLocation.city} (Tap to change)`}
            className="flex items-center gap-1.5 py-1 px-2 bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/20 rounded-xl text-left transition-all shrink-0 max-w-[125px] sm:max-w-[155px]"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="text-xs font-bold text-white truncate leading-tight">
              {currentLocation.area || 'Nairobi'}
            </span>
            <ChevronDown className="w-3 h-3 text-cyan-200/70 shrink-0" />
          </button>
        </div>
      </div>

      {/* Location Selector Modal / Bottom Sheet */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 p-0 sm:p-4">
          <div
            id="location-selector-dialog"
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-800"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">Your Exact Pickup Location</h3>
                  <p className="text-[11px] text-blue-200">
                    High precision GPS & address search
                  </p>
                </div>
              </div>
              <button
                id="close-location-modal-btn"
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-full text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Current Active Location Display Card */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-start justify-between gap-3 shadow-inner">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[10px] uppercase tracking-wider">
                    <Crosshair className="w-3 h-3" />
                    <span>Current Active Location</span>
                    {currentLocation.source && (
                      <span className="bg-blue-600/80 text-white text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase">
                        {currentLocation.source}
                      </span>
                    )}
                  </div>
                  <p className="font-extrabold text-sm text-white truncate">
                    {currentLocation.area}
                  </p>
                  <p className="text-xs text-slate-300 truncate">
                    {currentLocation.street ? `${currentLocation.street}, ` : ''}{currentLocation.city}
                  </p>
                  {currentLocation.lat && currentLocation.lng && (
                    <p className="text-[10px] text-cyan-200/70 font-mono">
                      GPS: {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                    </p>
                  )}
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse mt-1 shrink-0" />
              </div>

              {/* Quick Fix for Subhan, Kuwait */}
              <div className="p-3 bg-gradient-to-r from-amber-500/15 via-blue-500/15 to-indigo-500/15 border border-blue-200 rounded-2xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      In Subhan, Kuwait?
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Isps often route to Al Asimah. Tap to set exact Subhan location.
                    </p>
                  </div>
                  <button
                    id="set-subhan-exact-btn"
                    onClick={() => {
                      const subhanLoc: UserLocation = {
                        area: 'Subhan',
                        street: 'Subhan Industrial Area, Block 1',
                        city: 'Subhan, Kuwait',
                        country: 'Kuwait',
                        lat: 29.2392,
                        lng: 47.9856,
                        source: 'manual',
                        isOutsideKenya: true,
                        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      };
                      store.setLocation(subhanLoc);
                      setIsLocationModalOpen(false);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-sm shrink-0"
                  >
                    Set to Subhan
                  </button>
                </div>
              </div>

              {/* Exact Live GPS Detection Button */}
              <div>
                <button
                  id="detect-gps-location-btn"
                  onClick={handleDetectGps}
                  disabled={isDetectingGps}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border-2 border-blue-300 rounded-2xl flex items-center gap-3 text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    {isDetectingGps ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Navigation className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-blue-950">
                        {isDetectingGps ? 'Pinpointing Exact Live GPS...' : '🎯 Pinpoint Exact Live GPS Location'}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-700 font-medium">
                      Queries satellite & WiFi triangulation for your exact street & building
                    </p>
                  </div>
                </button>
                {gpsError && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2">
                    {gpsError}
                  </p>
                )}
              </div>

              {/* Real-time Address / Estate Search Bar */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">
                  Search Exact Address, Estate, or Road
                </span>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Kasarani, Roysambu, South C, Moi Ave..."
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {isSearching && (
                    <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="p-1 bg-slate-50 border border-slate-200 rounded-xl space-y-1 max-h-48 overflow-y-auto shadow-sm">
                    {searchResults.map((res, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSearchResult(res)}
                        className="w-full p-2 hover:bg-blue-50 active:bg-blue-100 rounded-lg text-left transition-colors flex items-start gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-900 block truncate">
                            {res.area}
                          </span>
                          <p className="text-[10px] text-slate-500 truncate">
                            {res.display_name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Saved User Addresses (if available) */}
              {savedAddresses.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                    My Saved Addresses
                  </span>
                  <div className="space-y-1.5">
                    {savedAddresses.map((addr) => {
                      const isSelected =
                        currentLocation.street === addr.street &&
                        currentLocation.area.includes(addr.city.split(',')[0]);
                      return (
                        <button
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Home className="w-4 h-4 text-blue-600 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">
                                {addr.label}
                              </span>
                              <p className="text-[11px] text-slate-500 truncate">
                                {addr.street}, {addr.city}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Popular Nairobi Service Zones Quick Pick */}
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Quick Select Nairobi Zones
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_NAIROBI_LOCATIONS.map((loc) => {
                    const isSelected = currentLocation.area === loc.area;
                    return (
                      <button
                        key={loc.area}
                        onClick={() => handleSelectPreset(loc)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Building
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            isSelected ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs text-slate-900 block truncate">
                            {loc.area}
                          </span>
                          <p className="text-[10px] text-slate-500 truncate leading-tight">
                            {loc.street}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Street / Apartment Input */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Or Type Exact Building / Door No.
                </span>
                <form onSubmit={handleSaveCustomLocation} className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={customArea}
                      onChange={(e) => setCustomArea(e.target.value)}
                      className="col-span-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Kilimani">Kilimani</option>
                      <option value="Westlands">Westlands</option>
                      <option value="Lavington">Lavington</option>
                      <option value="Kileleshwa">Kileleshwa</option>
                      <option value="Karen">Karen</option>
                      <option value="Parklands">Parklands</option>
                      <option value="Upper Hill">Upper Hill</option>
                      <option value="South B/C">South B/C</option>
                      <option value="Roysambu">Roysambu</option>
                      <option value="Kasarani">Kasarani</option>
                      <option value="Embakasi">Embakasi</option>
                      <option value="Lang'ata">Lang&apos;ata</option>
                    </select>
                    <input
                      type="text"
                      value={customStreet}
                      onChange={(e) => setCustomStreet(e.target.value)}
                      placeholder="e.g. House 14, Riverside Drive"
                      className="col-span-2 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!customStreet.trim()}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-colors"
                  >
                    Set As My Current Location
                  </button>
                </form>
              </div>

              {/* Service Info Footnote */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Free Pickup & Delivery</span>
                  <span>
                    Elsa Laundry vans operate across all Nairobi estates from 7:00 AM to 8:00 PM.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

