import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getCity, setCity } from '../../utils/storage';

const CITIES = [
  'Visakhapatnam',
  'Vizianagaram',
  'Srikakulam',
  'Vijayawada',
  'Guntur',
  'Hyderabad',
  'Tirupati',
  'Rajahmundry',
  'Kakinada',
  'Nellore',
  'Kurnool',
  'Bengaluru',
  'Chennai',
  'Mumbai',
  'Delhi',
];

export default function Navbar({ onSearch }) {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [city, setCityState] = useState(getCity);
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
    else navigate(`/movies?q=${encodeURIComponent(query)}`);
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

        <form className="navbar__search" onSubmit={handleSearch}>
          <Search />
          <input
            type="search"
            placeholder="Search movies, genres…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <nav className="navbar__links">
          <NavLink to="/" className="navbar__link" end>Home</NavLink>
          <NavLink to="/movies" className="navbar__link">Movies</NavLink>
          {isAuthenticated && (
            <NavLink to="/bookings" className="navbar__link">My Tickets</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className="navbar__link">Admin</NavLink>
          )}
        </nav>

        <div className="navbar__actions">
          <select className="select" value={city} onChange={handleCity} aria-label="City">
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button type="button" className="btn btn--ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
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
        <NavLink to="/movies" className="navbar__link" onClick={() => setMobileOpen(false)}>Movies</NavLink>
        {isAuthenticated && (
          <NavLink to="/bookings" className="navbar__link" onClick={() => setMobileOpen(false)}>My Tickets</NavLink>
        )}
        {isAdmin && (
          <NavLink to="/admin" className="navbar__link" onClick={() => setMobileOpen(false)}>
            <LayoutDashboard size={16} /> Admin
          </NavLink>
        )}
        <form onSubmit={handleSearch}>
          <input className="input" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </form>
      </div>
    </header>
  );
}
