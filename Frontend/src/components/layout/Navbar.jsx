import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, Sun, Moon, Menu, X, User, LogOut, LayoutDashboard, Navigation, Coins, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { getCity, setCity } from '../../utils/storage';
import { detectDeviceLocation } from '../../utils/geolocation';
import { movieApi } from '../../api/services';

const CITIES = [
  'Ahmedabad',
  'Bangalore',
  'Bhopal',
  'Bhubaneswar',
  'Chandigarh',
  'Chennai',
  'Coimbatore',
  'Delhi',
  'Goa',
  'Guntur',
  'Gurgaon',
  'Guwahati',
  'Hyderabad',
  'Indore',
  'Jaipur',
  'Kakinada',
  'Kochi',
  'Kolkata',
  'Kurnool',
  'Lucknow',
  'Mumbai',
  'Nagpur',
  'Nellore',
  'Noida',
  'Patna',
  'Pune',
  'Rajahmundry',
  'Srikakulam',
  'Surat',
  'Thiruvananthapuram',
  'Tirupati',
  'Vijayawada',
  'Visakhapatnam',
  'Vizianagaram',
];

export default function Navbar({ onSearch }) {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [city, setCityState] = useState(getCity);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [locating, setLocating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live autocomplete search query
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      movieApi.getAll({ all: false }).then(({ data }) => {
        const list = (data.movies || []).filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.language?.toLowerCase().includes(q) ||
            m.genre?.some((g) => g.toLowerCase().includes(q))
        );
        setSearchResults(list.slice(0, 6));
        setShowDropdown(list.length > 0);
      }).catch(() => {});
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleCitySync = (e) => setCityState(e.detail);
    window.addEventListener('citychange', handleCitySync);
    return () => window.removeEventListener('citychange', handleCitySync);
  }, []);

  // Prompt device location on first visit
  useEffect(() => {
    const alreadyPrompted = sessionStorage.getItem('cv_geo_prompted');
    if (!alreadyPrompted && navigator.geolocation) {
      sessionStorage.setItem('cv_geo_prompted', 'true');
      detectDeviceLocation()
        .then((res) => {
          setCityState(res.name);
          toast.success(`📍 Location detected: ${res.name} (${res.distanceKm} km away)`);
        })
        .catch(() => {
          // silently keep default city if denied on auto-prompt
        });
    }
  }, [toast]);

  const handleLocateMe = async () => {
    setLocating(true);
    try {
      const res = await detectDeviceLocation();
      setCityState(res.name);
      toast.success(`📍 Found your location: ${res.name} (${res.distanceKm} km away)`);
    } catch (err) {
      toast.error(err.message || 'Could not detect device location');
    } finally {
      setLocating(false);
    }
  };

  const handleQueryChange = (val) => {
    setQuery(val);
    if (onSearch) {
      onSearch(val);
      return;
    }

    // Only sync URL live if already on /movies page
    if (location.pathname === '/movies') {
      const next = new URLSearchParams(location.search);
      if (val.trim()) {
        next.set('q', val);
      } else {
        next.delete('q');
      }
      navigate({ pathname: '/movies', search: next.toString() ? `?${next.toString()}` : '' }, { replace: true });
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    if (onSearch) {
      onSearch('');
      return;
    }
    if (location.pathname === '/movies') {
      const next = new URLSearchParams(location.search);
      next.delete('q');
      navigate({ pathname: '/movies', search: next.toString() ? `?${next.toString()}` : '' }, { replace: true });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (onSearch) {
      onSearch(query);
    } else {
      if (query.trim()) {
        navigate(`/movies?q=${encodeURIComponent(query.trim())}`);
      } else if (location.pathname === '/movies') {
        navigate('/movies');
      }
    }
    setMobileOpen(false);
  };

  const handleCity = (e) => {
    const c = e.target.value;
    setCity(c);
    setCityState(c);
    window.dispatchEvent(new CustomEvent('citychange', { detail: c }));
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
          Cine<span>Vault</span>
        </Link>

        <div ref={searchContainerRef} style={{ position: 'relative', flex: 1, maxWidth: 440 }}>
          <form className="navbar__search" onSubmit={handleSearch} style={{ width: '100%' }}>
            <Search className="navbar__search-icon" />
            <input
              type="search"
              placeholder="Search movies, genres, language…"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => { if (searchResults.length > 0 && location.pathname !== '/movies') setShowDropdown(true); }}
            />
            {query && (
              <button
                type="button"
                className="navbar__search-clear"
                onClick={handleClear}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Live Autocomplete Results Dropdown (Shown on non-movies pages) */}
          {showDropdown && searchResults.length > 0 && location.pathname !== '/movies' && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                minWidth: 'min(100vw - 2rem, 420px)',
                background: 'rgba(16, 17, 26, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.7), 0 0 1px rgba(255,255,255,0.2)',
                zIndex: 1000,
                overflow: 'hidden',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div style={{ padding: '0.5rem 0.85rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                Matching Movies ({searchResults.length})
              </div>
              {searchResults.map((m) => (
                <Link
                  key={m._id}
                  to={`/movies/${m._id}`}
                  onClick={() => { setShowDropdown(false); setQuery(''); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.7rem 0.95rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: 'inherit',
                    textDecoration: 'none',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    style={{ width: 38, height: 54, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                    onError={(e) => { e.target.src = 'https://placehold.co/38x54/16161f/9b9bb0?text='; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: 3 }}>
                      <span style={{ color: 'var(--accent)' }}>{m.language}</span>
                      <span>·</span>
                      <span>{Array.isArray(m.genre) ? m.genre.slice(0, 2).join(', ') : m.genre}</span>
                      <span>·</span>
                      <span>{m.duration}m</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gold)', fontSize: '0.82rem', fontWeight: 700 }}>
                    <Star size={13} fill="currentColor" />
                    <span>{m.rating || 8.0}</span>
                  </div>
                </Link>
              ))}

              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  navigate(`/movies?q=${encodeURIComponent(query.trim())}`);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(229, 9, 20, 0.12)',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(229, 9, 20, 0.22)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(229, 9, 20, 0.12)')}
              >
                View all results for "{query}" →
              </button>
            </div>
          )}
        </div>

        <nav className="navbar__links">
          <NavLink to="/" className="navbar__link" end>Home</NavLink>
          <NavLink to="/movies" className="navbar__link" end>Movies</NavLink>
          <NavLink to="/snacks" className="navbar__link">🍿 Food & Snacks</NavLink>
          <NavLink to="/movies?tab=theatres" className="navbar__link">Theatres</NavLink>
          {isAuthenticated && (
            <NavLink to="/bookings" className="navbar__link">My Tickets</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className="navbar__link">Admin</NavLink>
          )}
        </nav>

        <div className="navbar__actions">
          <div className="location-picker" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <select className="select" value={city} onChange={handleCity} aria-label="City" style={{ paddingLeft: '0.65rem' }}>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              type="button"
              className={`btn btn--ghost ${locating ? 'rotating' : ''}`}
              onClick={handleLocateMe}
              title="Auto-detect current location via GPS"
              aria-label="Detect current location"
              style={{ padding: '0.45rem', minWidth: 'auto', color: locating ? 'var(--accent)' : 'inherit' }}
            >
              <Navigation size={17} style={{ transform: locating ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s' }} />
            </button>
          </div>

          <button type="button" className="btn btn--ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="badge badge--gold"
                title="Your CineCoins Balance (1 coin = ₹1)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  borderRadius: '20px',
                }}
              >
                <Coins size={14} />
                <span>{user?.cineCoins ?? 150}</span>
              </Link>

              <Link to="/profile" className="btn btn--ghost">
                <User size={18} />
                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </Link>
              <button type="button" className="btn btn--ghost" onClick={logout} aria-label="Logout">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">Sign in</Link>
              <Link to="/register" className="btn btn--primary btn--sm">Join</Link>
            </>
          )}

          <button
            type="button"
            className="btn btn--ghost navbar__menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={`mobile-nav container ${mobileOpen ? 'open' : ''}`}>
        <NavLink to="/" className="navbar__link" onClick={() => setMobileOpen(false)}>Home</NavLink>
        <NavLink to="/movies" className="navbar__link" end onClick={() => setMobileOpen(false)}>Movies</NavLink>
        <NavLink to="/snacks" className="navbar__link" onClick={() => setMobileOpen(false)}>🍿 Food & Snacks</NavLink>
        <NavLink to="/movies?tab=theatres" className="navbar__link" onClick={() => setMobileOpen(false)}>Theatres</NavLink>
        {isAuthenticated && (
          <NavLink to="/bookings" className="navbar__link" onClick={() => setMobileOpen(false)}>My Tickets</NavLink>
        )}
        {isAdmin && (
          <NavLink to="/admin" className="navbar__link" onClick={() => setMobileOpen(false)}>
            <LayoutDashboard size={16} /> Admin
          </NavLink>
        )}
        <form onSubmit={handleSearch} style={{ position: 'relative', marginTop: '0.5rem' }}>
          <input
            className="input"
            placeholder="Search movies, genres…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            style={{ width: '100%', paddingRight: query ? '2.5rem' : '1rem' }}
          />
          {query && (
            <button
              type="button"
              className="navbar__search-clear"
              onClick={handleClear}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </form>
      </div>
    </header>
  );
}
