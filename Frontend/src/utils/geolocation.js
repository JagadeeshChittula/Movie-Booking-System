import { setCity } from './storage';

export const SUPPORTED_CITIES = [
  { name: 'Srikakulam', lat: 18.2949, lon: 83.8938, state: 'Andhra Pradesh' },
  { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, state: 'Andhra Pradesh' },
  { name: 'Vizianagaram', lat: 18.1067, lon: 83.3956, state: 'Andhra Pradesh' },
  { name: 'Vijayawada', lat: 16.5062, lon: 80.6480, state: 'Andhra Pradesh' },
  { name: 'Guntur', lat: 16.3067, lon: 80.4365, state: 'Andhra Pradesh' },
  { name: 'Rajahmundry', lat: 17.0005, lon: 81.8040, state: 'Andhra Pradesh' },
  { name: 'Kakinada', lat: 16.9891, lon: 82.2475, state: 'Andhra Pradesh' },
  { name: 'Tirupati', lat: 13.6288, lon: 79.4192, state: 'Andhra Pradesh' },
  { name: 'Kurnool', lat: 15.8281, lon: 78.0373, state: 'Andhra Pradesh' },
  { name: 'Nellore', lat: 14.4426, lon: 79.9865, state: 'Andhra Pradesh' },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, state: 'Telangana' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, state: 'Maharashtra' },
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, state: 'Delhi' },
];

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the closest supported city from coordinates
 */
export function findClosestCity(lat, lon) {
  let closest = SUPPORTED_CITIES[0];
  let minDistance = Infinity;

  for (const city of SUPPORTED_CITIES) {
    const dist = getDistanceKm(lat, lon, city.lat, city.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  return { ...closest, distanceKm: Math.round(minDistance) };
}

/**
 * Requests device location and updates active city
 */
export function detectDeviceLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const result = findClosestCity(latitude, longitude);

        // Update stored city and trigger citychange
        setCity(result.name);
        window.dispatchEvent(new CustomEvent('citychange', { detail: result.name }));
        sessionStorage.setItem('cv_geo_detected', 'true');

        resolve(result);
      },
      (error) => {
        let msg = 'Could not retrieve your location';
        if (error.code === 1) msg = 'Location permission denied by user';
        else if (error.code === 2) msg = 'Location position unavailable';
        else if (error.code === 3) msg = 'Location request timed out';
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
}
