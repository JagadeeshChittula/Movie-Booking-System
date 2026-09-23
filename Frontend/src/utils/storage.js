const CITY_KEY = 'cinevault_city';
const WATCHLIST_KEY = 'cinevault_watchlist';
const CHECKOUT_KEY = 'cinevault_checkout';

export function getCity() {
  return localStorage.getItem(CITY_KEY) || 'Visakhapatnam';
}

export function setCity(city) {
  localStorage.setItem(CITY_KEY, city);
}

export function getWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

export function toggleWatchlist(movieId) {
  const list = getWatchlist();
  const id = String(movieId);
  const next = list.includes(id)
    ? list.filter((x) => x !== id)
    : [...list, id];
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  return next;
}

export function isInWatchlist(movieId) {
  return getWatchlist().includes(String(movieId));
}

export function saveCheckout(data) {
  sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(data));
}

export function getCheckout() {
  try {
    return JSON.parse(sessionStorage.getItem(CHECKOUT_KEY) || 'null');
  } catch {
    return null;
  }
}

export function clearCheckout() {
  sessionStorage.removeItem(CHECKOUT_KEY);
}
