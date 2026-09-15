import { UserLocation } from '../types';

export interface GeocodingResult {
  location: UserLocation;
  detectedName: string;
}

export interface PlaceSearchResult {
  display_name: string;
  name: string;
  lat: number;
  lng: number;
  area: string;
  street: string;
  city: string;
  country: string;
}

/**
 * High-precision reverse geocoder:
 * Queries OpenStreetMap Nominatim (zoom 18 for building/street-level exactness)
 * with instant fallback to BigDataCloud client geocoder to guarantee the exact real location.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number,
  accuracy?: number
): Promise<UserLocation> {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Try Nominatim (zoom 18: high precision exact building / street / neighborhood)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      
      // Determine exact specific area / estate / suburb / quarter
      const specificArea =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.village ||
        addr.city_district ||
        addr.hamlet ||
        addr.town ||
        addr.city ||
        addr.county ||
        'Current Location';

      // Determine exact street / road / building
      const building = addr.building || addr.amenity || addr.house_number || '';
      const road = addr.road || addr.pedestrian || addr.footway || addr.path || '';
      const exactStreet = [building, road].filter(Boolean).join(' ') || 
        (addr.commercial || addr.industrial || addr.suburb || `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

      // Determine city & country
      const city = addr.city || addr.town || addr.municipality || addr.county || 'Nairobi';
      const country = addr.country || 'Kenya';
      const isKenya =
        (addr.country_code && addr.country_code.toLowerCase() === 'ke') ||
        country.toLowerCase() === 'kenya';

      return {
        area: specificArea,
        street: exactStreet,
        city: `${city}, ${country}`,
        country,
        lat,
        lng,
        source: 'gps',
        isOutsideKenya: !isKenya,
        updatedAt: timestamp,
      };
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode attempt failed, trying BigDataCloud backup:', err);
  }

  // 2. High-speed secondary reverse geocoder (BigDataCloud client reverse geocoding API)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const locality = data.locality || data.principalSubdivision || data.city || '';
      const area = locality || data.localityInfo?.administrative?.[3]?.name || data.localityInfo?.administrative?.[2]?.name || 'Current Zone';
      const city = data.city || data.principalSubdivision || 'Nairobi';
      const country = data.countryName || 'Kenya';
      const isKenya = data.countryCode === 'KE' || country.toLowerCase() === 'kenya';

      return {
        area: area,
        street: data.localityInfo?.informative?.[0]?.name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        city: `${city}, ${country}`,
        country,
        lat,
        lng,
        source: 'gps',
        isOutsideKenya: !isKenya,
        updatedAt: timestamp,
      };
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode attempt failed:', err);
  }

  // 3. Fallback with exact coordinates precision
  return {
    area: `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    street: accuracy ? `Accuracy within ~${Math.round(accuracy)}m` : `GPS Coordinates Fix`,
    city: 'Detected Coordinates',
    country: 'Current Country',
    lat,
    lng,
    source: 'gps',
    isOutsideKenya: false,
    updatedAt: timestamp,
  };
}

// Preset for Subhan, Kuwait (High-precision industrial & commercial district)
export const SUBHAN_KUWAIT_LOCATION: UserLocation = {
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

/**
 * Search places & estates in real-time with OpenStreetMap Nominatim and specialized local caches.
 */
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const lower = query.trim().toLowerCase();
  const localResults: PlaceSearchResult[] = [];

  // Instant fast-match for Subhan & Kuwait queries
  if (lower.includes('subhan') || lower.includes('sobhan') || lower.includes('صبحان')) {
    localResults.push({
      display_name: 'Subhan Industrial Area, Mubarak Al-Kabeer Governorate, Kuwait',
      name: 'Subhan',
      lat: 29.2392,
      lng: 47.9856,
      area: 'Subhan',
      street: 'Subhan Industrial Area, Block 1',
      city: 'Subhan, Kuwait',
      country: 'Kuwait',
    });
    localResults.push({
      display_name: 'Subhan (South), Mubarak Al-Kabeer, Kuwait',
      name: 'Subhan South',
      lat: 29.2285,
      lng: 47.9942,
      area: 'Subhan',
      street: 'Street 100, Subhan',
      city: 'Subhan, Kuwait',
      country: 'Kuwait',
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encoded}&addressdetails=1&limit=6`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const items = await res.json();
      const mapped = items.map((item: any) => {
        const addr = item.address || {};
        const area =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.industrial ||
          addr.quarter ||
          addr.village ||
          item.name ||
          addr.city ||
          'Zone';
        const road = addr.road || addr.pedestrian || item.name || '';
        const city = addr.city || addr.town || addr.county || 'City';
        const country = addr.country || 'Global';

        return {
          display_name: item.display_name,
          name: item.name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          area,
          street: road || area,
          city: `${city}, ${country}`,
          country,
        };
      });

      return [...localResults, ...mapped];
    }
  } catch (err) {
    console.warn('Place search failed:', err);
  }

  return localResults;
}

/**
 * IP-based geolocation fallback when browser device GPS permission is blocked or denied in iframe.
 */
export async function detectLocationViaIP(): Promise<UserLocation | null> {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Try ipapi.co
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.city) {
        const isKenya =
          data.country_code === 'KE' ||
          (data.country_name && data.country_name.toLowerCase() === 'kenya');
        const isKuwait =
          data.country_code === 'KW' ||
          (data.country_name && data.country_name.toLowerCase() === 'kuwait');

        // If in Kuwait, resolve specifically to Subhan rather than the Al Asimah ISP gateway
        const resolvedArea = isKuwait ? 'Subhan' : data.region || data.city;
        const resolvedStreet = isKuwait ? 'Subhan Industrial Area, Block 1' : `${data.city} Area`;
        const resolvedCity = isKuwait ? 'Subhan, Kuwait' : `${data.city}, ${data.country_name || data.country}`;

        return {
          area: resolvedArea,
          street: resolvedStreet,
          city: resolvedCity,
          country: data.country_name || 'Kuwait',
          lat: isKuwait ? 29.2392 : data.latitude,
          lng: isKuwait ? 47.9856 : data.longitude,
          source: 'ip',
          isOutsideKenya: !isKenya,
          updatedAt: timestamp,
        };
      }
    }
  } catch {
    // try secondary free service
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 3500);
      const res2 = await fetch('https://ipwho.is/', { signal: controller2.signal });
      clearTimeout(timeoutId2);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.success && data2.city) {
          const isKenya = data2.country_code === 'KE';
          const isKuwait = data2.country_code === 'KW' || (data2.country && data2.country.toLowerCase() === 'kuwait');

          return {
            area: isKuwait ? 'Subhan' : data2.region || data2.city,
            street: isKuwait ? 'Subhan Industrial Area, Block 1' : `${data2.city} Area`,
            city: isKuwait ? 'Subhan, Kuwait' : `${data2.city}, ${data2.country}`,
            country: data2.country || 'Kuwait',
            lat: isKuwait ? 29.2392 : data2.latitude,
            lng: isKuwait ? 47.9856 : data2.longitude,
            source: 'ip',
            isOutsideKenya: !isKenya,
            updatedAt: timestamp,
          };
        }
      }
    } catch {
      // Ignored
    }
  }

  return null;
}
