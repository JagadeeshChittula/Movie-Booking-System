import { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, Search, X, Eye, EyeOff } from 'lucide-react';
import { showApi, movieApi, theatreApi, screenApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import { formatDate, formatTime, formatCurrency } from '../../utils/format';

export default function AdminShows() {
  const toast = useToast();
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [form, setForm] = useState({
    movie: '',
    theatre: '',
    screen: '',
    showDate: '',
    startTime: '18:00',
    endTime: '21:00',
    ticketPrice: 250,
  });

  const load = () => {
    Promise.all([showApi.getAll({ all: true }), movieApi.getAll(), theatreApi.getAll()])
      .then(([s, m, t]) => {
        setShows(s.data.shows || []);
        setMovies(m.data.movies || []);
        setTheatres(t.data.theatres || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (form.theatre) {
      screenApi.getByTheatre(form.theatre).then(({ data }) => {
        setScreens(data.screens || []);
        if (data.screens?.[0]) setForm((f) => ({ ...f, screen: data.screens[0]._id }));
      });
    }
  }, [form.theatre]);

  const handleToggleHide = async (s) => {
    const isCurrentlyHidden = s.isActive === false;
    const nextStatus = isCurrentlyHidden ? true : false;
    try {
      await showApi.update(s._id, { isActive: nextStatus });
      toast.success(nextStatus ? 'Show is now visible and bookable' : 'Show is now hidden from booking');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update visibility');
    }
  };

  const filteredShows = useMemo(() => {
    let list = shows;

    if (visibilityFilter === 'visible') {
      list = list.filter((s) => s.isActive !== false);
    } else if (visibilityFilter === 'hidden') {
      list = list.filter((s) => s.isActive === false);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((s) => {
        const movieTitle = s.movie?.title?.toLowerCase() || '';
        const theatreName = s.theatre?.name?.toLowerCase() || '';
        const theatreCity = s.theatre?.city?.toLowerCase() || '';
        const screenName = s.screen?.name?.toLowerCase() || '';
        const showTime = s.startTime?.toLowerCase() || '';
        return (
          movieTitle.includes(term) ||
          theatreName.includes(term) ||
          theatreCity.includes(term) ||
          screenName.includes(term) ||
          showTime.includes(term)
        );
      });
    }

    return list;
  }, [shows, searchTerm, visibilityFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await showApi.add({ ...form, ticketPrice: Number(form.ticketPrice) });
      toast.success('Show scheduled');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete show?')) return;
    try {
      await showApi.remove(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader fullPage />;

  const visibleCount = shows.filter((s) => s.isActive !== false).length;
  const hiddenCount = shows.filter((s) => s.isActive === false).length;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Shows</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Schedule and manage screening times, ticket pricing, and public visibility
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setModal(true)}>
          <Plus size={18} /> Schedule Show
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search className="search-icon" size={17} />
          <input
            type="search"
            placeholder="Search by movie, theatre, city, screen, or time…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search shows"
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Hide/Show Filter Tabs */}
          <div className="admin-filter-group" title="Filter by visibility">
            <button
              type="button"
              className={`admin-filter-btn ${visibilityFilter === 'all' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('all')}
            >
              All ({shows.length})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${visibilityFilter === 'visible' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('visible')}
            >
              Visible ({visibleCount})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${visibilityFilter === 'hidden' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('hidden')}
            >
              Hidden ({hiddenCount})
            </button>
          </div>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredShows.length}</strong>
          </span>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Movie</th>
              <th>Theatre</th>
              <th>Date</th>
              <th>Time</th>
              <th>Price</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredShows.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  No shows matching current filters.{' '}
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => { setSearchTerm(''); setVisibilityFilter('all'); }}
                    style={{ textDecoration: 'underline' }}
                  >
                    Reset filters
                  </button>
                </td>
              </tr>
            ) : (
              filteredShows.map((s) => {
                const isHidden = s.isActive === false;
                return (
                  <tr key={s._id} className={isHidden ? 'table-row-hidden' : ''}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.movie?.title}</div>
                      {s.screen?.name && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {s.screen.name} ({s.screen.screenType || '2D'})
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{s.theatre?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.theatre?.city}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(s.showDate)}</td>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{formatTime(s.startTime)}</td>
                    <td>{formatCurrency(s.ticketPrice)}</td>
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
                        {/* Hide / Unhide Toggle Action */}
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => handleToggleHide(s)}
                          title={isHidden ? 'Unhide show (Make bookable)' : 'Hide show (Hide from booking)'}
                          aria-label={isHidden ? 'Unhide show' : 'Hide show'}
                          style={{ color: isHidden ? 'var(--gold)' : 'var(--text-muted)' }}
                        >
                          {isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => handleDelete(s._id)}
                          title="Delete show"
                          aria-label="Delete show"
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
      <Modal open={modal} onClose={() => setModal(false)} wide>
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Schedule Show</h2>
          <div className="admin-form" style={{ maxWidth: '100%' }}>
            <div className="field">
              <label>Movie</label>
              <select className="input" value={form.movie} onChange={(e) => setForm({ ...form, movie: e.target.value })} required>
                <option value="">Select</option>
                {movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Theatre</label>
              <select className="input" value={form.theatre} onChange={(e) => setForm({ ...form, theatre: e.target.value })} required>
                <option value="">Select</option>
                {theatres.map((t) => <option key={t._id} value={t._id}>{t.name} — {t.city}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Screen</label>
              <select className="input" value={form.screen} onChange={(e) => setForm({ ...form, screen: e.target.value })} required>
                {screens.map((sc) => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Date</label><input type="date" className="input" value={form.showDate} onChange={(e) => setForm({ ...form, showDate: e.target.value })} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="field"><label>Start</label><input type="time" className="input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
              <div className="field"><label>End</label><input type="time" className="input" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
              <div className="field"><label>Price ₹</label><input type="number" className="input" value={form.ticketPrice} onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })} /></div>
            </div>
            <button type="submit" className="btn btn--primary">Save</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
