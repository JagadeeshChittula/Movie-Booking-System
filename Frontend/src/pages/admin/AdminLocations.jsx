import { useEffect, useState, useMemo } from 'react';
import {
  MapPin,
  Building2,
  Monitor,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Search,
  X,
  Check,
  Film,
} from 'lucide-react';
import { theatreApi, screenApi, showApi, movieApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatTime, formatDate } from '../../utils/format';

const emptyTheatre = { name: '', city: '', address: '', description: '', facilities: '' };
const emptyScreen = { name: '', theatre: '', screenType: '2D', rows: 10, cols: 12 };
const emptyShow = { movie: '', theatre: '', screen: '', showTime: '', basePrice: 200 };

export default function AdminLocations() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);

  const [selectedCity, setSelectedCity] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [activeTab, setActiveTab] = useState('theatres'); // 'theatres' | 'screens' | 'shows'

  // Modals state
  const [renameModal, setRenameModal] = useState(false);
  const [newCityName, setNewCityName] = useState('');

  const [theatreModal, setTheatreModal] = useState(false);
  const [editingTheatreId, setEditingTheatreId] = useState(null);
  const [theatreForm, setTheatreForm] = useState(emptyTheatre);

  const [screenModal, setScreenModal] = useState(false);
  const [editingScreenId, setEditingScreenId] = useState(null);
  const [screenForm, setScreenForm] = useState(emptyScreen);

  const [showModal, setShowModal] = useState(false);
  const [editingShowId, setEditingShowId] = useState(null);
  const [showForm, setShowForm] = useState(emptyShow);

  const loadData = async () => {
    try {
      const [tRes, scRes, shRes, mRes] = await Promise.all([
        theatreApi.getAll({ all: true }),
        screenApi.getAll(),
        showApi.getAll({ all: true }),
        movieApi.getAll({ all: true }),
      ]);
      setTheatres(tRes.data.theatres || []);
      setScreens(scRes.data.screens || []);
      setShows(shRes.data.shows || []);
      setMovies(mRes.data.movies || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load locations data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute all unique locations/cities with statistics
  const locationsStats = useMemo(() => {
    const map = new Map();

    theatres.forEach((t) => {
      const city = t.city?.trim() || 'Unspecified';
      if (!map.has(city)) {
        map.set(city, {
          city,
          theatres: [],
          theatreIds: new Set(),
          screenCount: 0,
          showCount: 0,
        });
      }
      const data = map.get(city);
      data.theatres.push(t);
      data.theatreIds.add(String(t._id));
    });

    // Count screens per city
    screens.forEach((s) => {
      const tId = String(s.theatre?._id || s.theatre || '');
      for (const loc of map.values()) {
        if (loc.theatreIds.has(tId)) {
          loc.screenCount++;
          break;
        }
      }
    });

    // Count shows per city
    shows.forEach((sh) => {
      const tId = String(sh.theatre?._id || sh.theatre || '');
      for (const loc of map.values()) {
        if (loc.theatreIds.has(tId)) {
          loc.showCount++;
          break;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.city.localeCompare(b.city)
    );
  }, [theatres, screens, shows]);

  // Set default selected city once loaded
  useEffect(() => {
    if (locationsStats.length > 0 && !selectedCity) {
      setSelectedCity(locationsStats[0].city);
    }
  }, [locationsStats, selectedCity]);

  // Filtered locations list by search input
  const filteredLocations = useMemo(() => {
    if (!searchLocation.trim()) return locationsStats;
    const q = searchLocation.toLowerCase().trim();
    return locationsStats.filter((loc) => loc.city.toLowerCase().includes(q));
  }, [locationsStats, searchLocation]);

  // Current selected location data
  const currentLocData = useMemo(() => {
    return (
      locationsStats.find(
        (l) => l.city.toLowerCase() === selectedCity.toLowerCase()
      ) ||
      locationsStats[0] || {
        city: selectedCity,
        theatres: [],
        theatreIds: new Set(),
        screenCount: 0,
        showCount: 0,
      }
    );
  }, [locationsStats, selectedCity]);

  // Theatres in selected location
  const cityTheatres = useMemo(() => {
    return theatres.filter(
      (t) => (t.city || '').toLowerCase() === selectedCity.toLowerCase()
    );
  }, [theatres, selectedCity]);

  const cityTheatreIds = useMemo(() => {
    return new Set(cityTheatres.map((t) => String(t._id)));
  }, [cityTheatres]);

  // Screens in selected location
  const cityScreens = useMemo(() => {
    return screens.filter((s) =>
      cityTheatreIds.has(String(s.theatre?._id || s.theatre))
    );
  }, [screens, cityTheatreIds]);

  const cityScreenIds = useMemo(() => {
    return new Set(cityScreens.map((s) => String(s._id)));
  }, [cityScreens]);

  // Shows running in selected location
  const cityShows = useMemo(() => {
    return shows.filter(
      (sh) =>
        cityTheatreIds.has(String(sh.theatre?._id || sh.theatre)) ||
        cityScreenIds.has(String(sh.screen?._id || sh.screen))
    );
  }, [shows, cityTheatreIds, cityScreenIds]);

  // ================= ACTION HANDLERS =================

  // 1. Rename Location across all theatres
  const handleRenameLocation = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    try {
      await theatreApi.renameLocation({
        oldCity: selectedCity,
        newCity: newCityName.trim(),
      });
      toast.success(
        `Location renamed to "${newCityName.trim()}" across all theatres!`
      );
      setSelectedCity(newCityName.trim());
      setRenameModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to rename location');
    }
  };

  // 2. Theatres actions
  const openAddTheatre = () => {
    setEditingTheatreId(null);
    setTheatreForm({ ...emptyTheatre, city: selectedCity });
    setTheatreModal(true);
  };

  const openEditTheatre = (t) => {
    setEditingTheatreId(t._id);
    setTheatreForm({
      name: t.name || '',
      city: t.city || selectedCity,
      address: t.address || '',
      description: t.description || '',
      facilities: Array.isArray(t.facilities)
        ? t.facilities.join(', ')
        : t.facilities || '',
    });
    setTheatreModal(true);
  };

  const handleSaveTheatre = async (e) => {
    e.preventDefault();
    const payload = {
      ...theatreForm,
      facilities: theatreForm.facilities
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
    };
    try {
      if (editingTheatreId) {
        await theatreApi.update(editingTheatreId, payload);
        toast.success('Theatre updated');
      } else {
        await theatreApi.add(payload);
        toast.success('Theatre added to ' + payload.city);
      }
      setTheatreModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleToggleHideTheatre = async (t) => {
    const nextStatus = t.isActive === false;
    try {
      await theatreApi.update(t._id, { isActive: nextStatus });
      toast.success(
        nextStatus
          ? `"${t.name}" is now visible`
          : `"${t.name}" is now hidden`
      );
      loadData();
    } catch (err) {
      toast.error(err.message || 'Visibility toggle failed');
    }
  };

  const handleDeleteTheatre = async (id, name) => {
    if (!window.confirm(`Delete theatre "${name}"?`)) return;
    try {
      await theatreApi.remove(id);
      toast.success(`Deleted ${name}`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // 3. Screen actions
  const openAddScreen = () => {
    setEditingScreenId(null);
    setScreenForm({
      ...emptyScreen,
      theatre: cityTheatres[0]?._id || '',
    });
    setScreenModal(true);
  };

  const openEditScreen = (s) => {
    setEditingScreenId(s._id);
    setScreenForm({
      name: s.name || '',
      theatre: s.theatre?._id || s.theatre || '',
      screenType: s.screenType || '2D',
      rows: s.rows || 10,
      cols: s.cols || 12,
    });
    setScreenModal(true);
  };

  const handleSaveScreen = async (e) => {
    e.preventDefault();
    try {
      if (editingScreenId) {
        await screenApi.update(editingScreenId, screenForm);
        toast.success('Screen updated');
      } else {
        await screenApi.add(screenForm);
        toast.success('Screen added');
      }
      setScreenModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDeleteScreen = async (id, name) => {
    if (!window.confirm(`Delete screen "${name}"?`)) return;
    try {
      await screenApi.remove(id);
      toast.success(`Deleted ${name}`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // 4. Show actions
  const openAddShow = () => {
    setEditingShowId(null);
    setShowForm({
      ...emptyShow,
      theatre: cityTheatres[0]?._id || '',
      screen: cityScreens[0]?._id || '',
      movie: movies[0]?._id || '',
    });
    setShowModal(true);
  };

  const openEditShow = (sh) => {
    setEditingShowId(sh._id);
    setShowForm({
      movie: sh.movie?._id || sh.movie || '',
      theatre: sh.theatre?._id || sh.theatre || '',
      screen: sh.screen?._id || sh.screen || '',
      showTime: sh.showTime ? new Date(sh.showTime).toISOString().slice(0, 16) : '',
      basePrice: sh.basePrice || 200,
    });
    setShowModal(true);
  };

  const handleSaveShow = async (e) => {
    e.preventDefault();
    try {
      if (editingShowId) {
        await showApi.update(editingShowId, showForm);
        toast.success('Show updated');
      } else {
        await showApi.add(showForm);
        toast.success('Show scheduled');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Delete this show?')) return;
    try {
      await showApi.remove(id);
      toast.success('Show deleted');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <MapPin style={{ color: 'var(--accent)' }} size={26} /> Location Manager
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Browse, manage, and edit cinema properties, screens, and shows by city / location
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setNewCityName(selectedCity);
              setRenameModal(true);
            }}
            disabled={!selectedCity}
          >
            <Pencil size={16} /> Edit Location Name
          </button>
          <button type="button" className="btn btn--primary" onClick={openAddTheatre}>
            <Plus size={16} /> Add Theatre in {selectedCity || 'City'}
          </button>
        </div>
      </div>

      {/* Location Search & Grid Selection */}
      <div
        className="glass"
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
              All Active Locations ({locationsStats.length})
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              • Click any city to inspect and edit its venues
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input
              type="search"
              placeholder="Filter cities (e.g. Hyderabad, Vizag)..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                outline: 'none',
                fontSize: '0.85rem',
                width: 220,
              }}
            />
            {searchLocation && (
              <button
                type="button"
                onClick={() => setSearchLocation('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Location Chips / Cards */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.65rem',
            maxHeight: 180,
            overflowY: 'auto',
            paddingRight: 4,
          }}
        >
          {filteredLocations.map((loc) => {
            const isSelected = loc.city.toLowerCase() === selectedCity.toLowerCase();
            return (
              <button
                key={loc.city}
                type="button"
                onClick={() => setSelectedCity(loc.city)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.6rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(229, 9, 20, 0.25), rgba(229, 9, 20, 0.1))'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected
                    ? '1.5px solid var(--accent)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#fff' : 'var(--text)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 600 : 500,
                  boxShadow: isSelected ? '0 4px 15px rgba(229, 9, 20, 0.25)' : 'none',
                }}
              >
                <MapPin
                  size={14}
                  style={{
                    color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                />
                <span>{loc.city}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 999,
                    background: isSelected
                      ? 'var(--accent)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    marginLeft: 2,
                  }}
                >
                  {loc.theatres.length} {loc.theatres.length === 1 ? 'theatre' : 'theatres'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Location Details Panel */}
      {selectedCity && (
        <div>
          {/* Location Summary Header */}
          <div
            className="glass"
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.25rem',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.4))',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {selectedCity}
                </span>
                <span className="badge badge--accent">Active Location</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                Currently showing all cinema complexes, auditoriums, and screenings registered under <strong>{selectedCity}</strong>
              </p>
            </div>

            {/* Quick Location Stats */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {cityTheatres.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Theatres
                </div>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold)' }}>
                  {cityScreens.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Screens
                </div>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>
                  {cityShows.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Active Shows
                </div>
              </div>
            </div>
          </div>

          {/* Subtabs for Location: Theatres | Screens | Shows */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '0.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn btn--sm ${activeTab === 'theatres' ? 'btn--primary' : 'btn--ghost'}`}
                onClick={() => setActiveTab('theatres')}
              >
                <Building2 size={15} /> Theatres ({cityTheatres.length})
              </button>
              <button
                type="button"
                className={`btn btn--sm ${activeTab === 'screens' ? 'btn--primary' : 'btn--ghost'}`}
                onClick={() => setActiveTab('screens')}
              >
                <Monitor size={15} /> Screens ({cityScreens.length})
              </button>
              <button
                type="button"
                className={`btn btn--sm ${activeTab === 'shows' ? 'btn--primary' : 'btn--ghost'}`}
                onClick={() => setActiveTab('shows')}
              >
                <Calendar size={15} /> Shows ({cityShows.length})
              </button>
            </div>

            <div>
              {activeTab === 'theatres' && (
                <button type="button" className="btn btn--secondary btn--sm" onClick={openAddTheatre}>
                  <Plus size={14} /> Add Theatre in {selectedCity}
                </button>
              )}
              {activeTab === 'screens' && (
                <button type="button" className="btn btn--secondary btn--sm" onClick={openAddScreen}>
                  <Plus size={14} /> Add Screen in {selectedCity}
                </button>
              )}
              {activeTab === 'shows' && (
                <button type="button" className="btn btn--secondary btn--sm" onClick={openAddShow}>
                  <Plus size={14} /> Schedule Show in {selectedCity}
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: THEATRES TABLE */}
          {activeTab === 'theatres' && (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Theatre Name</th>
                    <th>Address</th>
                    <th>Facilities</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cityTheatres.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                        No theatres registered in {selectedCity}. Click "Add Theatre" above to create one.
                      </td>
                    </tr>
                  ) : (
                    cityTheatres.map((t) => {
                      const isHidden = t.isActive === false;
                      return (
                        <tr key={t._id} className={isHidden ? 'table-row-hidden' : ''}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{t.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
                              City: {t.city}
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {t.address}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                            {Array.isArray(t.facilities) && t.facilities.length > 0
                              ? t.facilities.slice(0, 3).join(', ')
                              : t.facilities || '—'}
                          </td>
                          <td>
                            {isHidden ? (
                              <span className="badge badge--error" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <EyeOff size={11} /> Hidden
                              </span>
                            ) : (
                              <span className="badge badge--success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Eye size={11} /> Visible
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={() => handleToggleHideTheatre(t)}
                                title={isHidden ? 'Make visible' : 'Hide from users'}
                                style={{ color: isHidden ? 'var(--gold)' : 'var(--text-muted)' }}
                              >
                                {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                              </button>
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={() => openEditTheatre(t)}
                                title={`Edit ${t.name}`}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={() => handleDeleteTheatre(t._id, t.name)}
                                title={`Delete ${t.name}`}
                                style={{ color: 'var(--error)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: SCREENS TABLE */}
          {activeTab === 'screens' && (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Screen Name</th>
                    <th>Theatre</th>
                    <th>Type</th>
                    <th>Layout & Seats</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cityScreens.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                        No screens created yet in {selectedCity}. Click "Add Screen" to add one.
                      </td>
                    </tr>
                  ) : (
                    cityScreens.map((s) => (
                      <tr key={s._id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {s.theatre?.name || '—'}
                        </td>
                        <td>
                          <span className="badge badge--gold">{s.screenType || '2D'}</span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {s.rows} rows × {s.cols} cols ({s.rows * s.cols} seats)
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => openEditScreen(s)}
                              title={`Edit ${s.name}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => handleDeleteScreen(s._id, s.name)}
                              title={`Delete ${s.name}`}
                              style={{ color: 'var(--error)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: SHOWS TABLE */}
          {activeTab === 'shows' && (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Theatre & Screen</th>
                    <th>Show Time</th>
                    <th>Base Price</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cityShows.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                        No active shows scheduled in {selectedCity}. Click "Schedule Show" to add a screening.
                      </td>
                    </tr>
                  ) : (
                    cityShows.map((sh) => (
                      <tr key={sh._id}>
                        <td>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Film size={14} style={{ color: 'var(--accent)' }} />
                            {sh.movie?.title || 'Unknown Title'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
                            {sh.movie?.language} • {sh.movie?.genre?.slice(0, 2).join(', ')}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          <div>{sh.theatre?.name || '—'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {sh.screen?.name || 'Screen'} ({sh.screen?.screenType || '2D'})
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          <div>{formatDate(sh.showTime)}</div>
                          <div style={{ color: 'var(--gold)', fontWeight: 600 }}>
                            {formatTime(sh.showTime)}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--accent)' }}>
                          {formatCurrency(sh.basePrice || 200)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => openEditShow(sh)}
                              title="Edit show"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => handleDeleteShow(sh._id)}
                              title="Delete show"
                              style={{ color: 'var(--error)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: RENAME LOCATION (CITY) */}
      <Modal open={renameModal} onClose={() => setRenameModal(false)}>
        <form onSubmit={handleRenameLocation} style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={20} style={{ color: 'var(--accent)' }} /> Rename Location
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Renaming <strong>"{selectedCity}"</strong> will automatically update the city field across all{' '}
            <strong>{cityTheatres.length}</strong> theatres located here.
          </p>

          <div className="field">
            <label>New Location / City Name</label>
            <input
              className="input"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              placeholder="e.g. Visakhapatnam, Hyderabad, Vijayawada"
              required
              autoFocus
            />
          </div>

          <div className="admin-form__actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn--primary">
              <Check size={16} /> Save New Name
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => setRenameModal(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD / EDIT THEATRE */}
      <Modal open={theatreModal} onClose={() => setTheatreModal(false)}>
        <form onSubmit={handleSaveTheatre} style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.25rem' }}>
            {editingTheatreId ? 'Edit' : 'Add'} Theatre
          </h2>
          <div className="admin-form" style={{ maxWidth: '100%' }}>
            <div className="field">
              <label>Theatre Name</label>
              <input
                className="input"
                value={theatreForm.name}
                onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                placeholder="e.g. PVR INOX, Cinepolis"
                required
              />
            </div>

            <div className="field">
              <label>City / Location</label>
              <input
                className="input"
                value={theatreForm.city}
                onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                placeholder="City name"
                required
              />
            </div>

            <div className="field">
              <label>Address</label>
              <input
                className="input"
                value={theatreForm.address}
                onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                placeholder="Street address, Mall name, Area"
                required
              />
            </div>

            <div className="field">
              <label>Facilities (comma separated)</label>
              <input
                className="input"
                value={theatreForm.facilities}
                onChange={(e) => setTheatreForm({ ...theatreForm, facilities: e.target.value })}
                placeholder="Dolby Atmos, 4K RGB Laser, Recliner Seats"
              />
            </div>

            <div className="admin-form__actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn--primary">
                {editingTheatreId ? 'Save Changes' : 'Add Theatre'}
              </button>
              <button type="button" className="btn btn--secondary" onClick={() => setTheatreModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: ADD / EDIT SCREEN */}
      <Modal open={screenModal} onClose={() => setScreenModal(false)}>
        <form onSubmit={handleSaveScreen} style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.25rem' }}>
            {editingScreenId ? 'Edit' : 'Add'} Screen
          </h2>
          <div className="admin-form" style={{ maxWidth: '100%' }}>
            <div className="field">
              <label>Theatre in {selectedCity}</label>
              <select
                className="input"
                value={screenForm.theatre}
                onChange={(e) => setScreenForm({ ...screenForm, theatre: e.target.value })}
                required
              >
                <option value="">Select a theatre</option>
                {cityTheatres.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Screen Name</label>
              <input
                className="input"
                value={screenForm.name}
                onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                placeholder="e.g. Screen 1 - Dolby Atmos"
                required
              />
            </div>

            <div className="field">
              <label>Screen Type</label>
              <select
                className="input"
                value={screenForm.screenType}
                onChange={(e) => setScreenForm({ ...screenForm, screenType: e.target.value })}
              >
                <option value="2D">2D Digital</option>
                <option value="3D">3D Digital</option>
                <option value="IMAX">IMAX 3D</option>
                <option value="4DX">4DX Motion</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="field">
                <label>Rows (A-Z)</label>
                <input
                  type="number"
                  min="3"
                  max="26"
                  className="input"
                  value={screenForm.rows}
                  onChange={(e) => setScreenForm({ ...screenForm, rows: parseInt(e.target.value, 10) || 10 })}
                  required
                />
              </div>

              <div className="field">
                <label>Columns (Seats/row)</label>
                <input
                  type="number"
                  min="4"
                  max="30"
                  className="input"
                  value={screenForm.cols}
                  onChange={(e) => setScreenForm({ ...screenForm, cols: parseInt(e.target.value, 10) || 12 })}
                  required
                />
              </div>
            </div>

            <div className="admin-form__actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn--primary">
                {editingScreenId ? 'Save Changes' : 'Add Screen'}
              </button>
              <button type="button" className="btn btn--secondary" onClick={() => setScreenModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: ADD / EDIT SHOW */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSaveShow} style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.25rem' }}>
            {editingShowId ? 'Edit' : 'Schedule'} Show
          </h2>
          <div className="admin-form" style={{ maxWidth: '100%' }}>
            <div className="field">
              <label>Movie</label>
              <select
                className="input"
                value={showForm.movie}
                onChange={(e) => setShowForm({ ...showForm, movie: e.target.value })}
                required
              >
                <option value="">Select a movie</option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title} ({m.language})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Theatre in {selectedCity}</label>
              <select
                className="input"
                value={showForm.theatre}
                onChange={(e) => {
                  const tId = e.target.value;
                  const matchingScreen = screens.find((s) => String(s.theatre?._id || s.theatre) === tId);
                  setShowForm({
                    ...showForm,
                    theatre: tId,
                    screen: matchingScreen ? matchingScreen._id : '',
                  });
                }}
                required
              >
                <option value="">Select a theatre</option>
                {cityTheatres.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Screen</label>
              <select
                className="input"
                value={showForm.screen}
                onChange={(e) => setShowForm({ ...showForm, screen: e.target.value })}
                required
              >
                <option value="">Select screen</option>
                {screens
                  .filter((s) => String(s.theatre?._id || s.theatre) === String(showForm.theatre))
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.screenType})
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="field">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={showForm.showTime}
                  onChange={(e) => setShowForm({ ...showForm, showTime: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Base Ticket Price (₹)</label>
                <input
                  type="number"
                  min="50"
                  max="2000"
                  className="input"
                  value={showForm.basePrice}
                  onChange={(e) => setShowForm({ ...showForm, basePrice: parseInt(e.target.value, 10) || 200 })}
                  required
                />
              </div>
            </div>

            <div className="admin-form__actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn--primary">
                {editingShowId ? 'Save Changes' : 'Schedule Show'}
              </button>
              <button type="button" className="btn btn--secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
