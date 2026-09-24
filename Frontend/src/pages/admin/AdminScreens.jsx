import { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, Search, X, Eye, EyeOff } from 'lucide-react';
import { screenApi, theatreApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';

export default function AdminScreens() {
  const toast = useToast();
  const [screens, setScreens] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [form, setForm] = useState({
    theatre: '',
    name: 'Screen 1',
    screenType: '2D',
    totalSeats: 96,
    rows: 8,
    cols: 12,
  });

  const load = () => {
    Promise.all([screenApi.getAll({ all: true }), theatreApi.getAll()])
      .then(([s, t]) => {
        setScreens(s.data.screens || []);
        setTheatres(t.data.theatres || []);
        if (t.data.theatres?.[0]) setForm((f) => ({ ...f, theatre: t.data.theatres[0]._id }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggleHide = async (s) => {
    const isCurrentlyHidden = s.isActive === false;
    const nextStatus = isCurrentlyHidden ? true : false;
    try {
      await screenApi.update(s._id, { isActive: nextStatus });
      toast.success(nextStatus ? 'Screen is now visible' : 'Screen is now hidden');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update visibility');
    }
  };

  const filteredScreens = useMemo(() => {
    let list = screens;

    if (visibilityFilter === 'visible') {
      list = list.filter((s) => s.isActive !== false);
    } else if (visibilityFilter === 'hidden') {
      list = list.filter((s) => s.isActive === false);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((s) => {
        const screenName = s.name?.toLowerCase() || '';
        const theatreName = s.theatre?.name?.toLowerCase() || '';
        const theatreCity = s.theatre?.city?.toLowerCase() || '';
        const screenType = s.screenType?.toLowerCase() || '';
        return (
          screenName.includes(term) ||
          theatreName.includes(term) ||
          theatreCity.includes(term) ||
          screenType.includes(term)
        );
      });
    }

    return list;
  }, [screens, searchTerm, visibilityFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await screenApi.add({
        theatre: form.theatre,
        name: form.name,
        screenType: form.screenType,
        totalSeats: Number(form.rows) * Number(form.cols),
        seatLayout: { rows: Number(form.rows), cols: Number(form.cols) },
      });
      toast.success('Screen added');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete screen?')) return;
    try {
      await screenApi.remove(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader fullPage />;

  const visibleCount = screens.filter((s) => s.isActive !== false).length;
  const hiddenCount = screens.filter((s) => s.isActive === false).length;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Screens</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage theatre auditoriums, layouts, and public visibility
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setModal(true)}>
          <Plus size={18} /> Add Screen
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search className="search-icon" size={17} />
          <input
            type="search"
            placeholder="Search by screen name, theatre, city, or type…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search screens"
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
              All ({screens.length})
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
            Showing <strong>{filteredScreens.length}</strong>
          </span>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Screen</th>
              <th>Theatre</th>
              <th>Type</th>
              <th>Seats</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredScreens.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  No screens matching current filters.{' '}
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
              filteredScreens.map((s) => {
                const isHidden = s.isActive === false;
                return (
                  <tr key={s._id} className={isHidden ? 'table-row-hidden' : ''}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {s.seatLayout?.rows}×{s.seatLayout?.cols} layout
                      </div>
                    </td>
                    <td>
                      <div>{s.theatre?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.theatre?.city}</div>
                    </td>
                    <td>
                      <span className="badge badge--muted">{s.screenType || '2D'}</span>
                    </td>
                    <td>{s.totalSeats} seats</td>
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
                          title={isHidden ? 'Unhide screen (Make visible)' : 'Hide screen (Hide from public)'}
                          aria-label={isHidden ? 'Unhide screen' : 'Hide screen'}
                          style={{ color: isHidden ? 'var(--gold)' : 'var(--text-muted)' }}
                        >
                          {isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => handleDelete(s._id)}
                          title="Delete screen"
                          aria-label="Delete screen"
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
      <Modal open={modal} onClose={() => setModal(false)}>
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Add Screen</h2>
          <div className="field">
            <label>Theatre</label>
            <select className="input" value={form.theatre} onChange={(e) => setForm({ ...form, theatre: e.target.value })} required>
              {theatres.map((t) => <option key={t._id} value={t._id}>{t.name} — {t.city}</option>)}
            </select>
          </div>
          <div className="field"><label>Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field">
            <label>Type</label>
            <select className="input" value={form.screenType} onChange={(e) => setForm({ ...form, screenType: e.target.value })}>
              <option>2D</option><option>3D</option><option>IMAX</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field"><label>Rows</label><input type="number" className="input" value={form.rows} onChange={(e) => setForm({ ...form, rows: e.target.value })} /></div>
            <div className="field"><label>Cols</label><input type="number" className="input" value={form.cols} onChange={(e) => setForm({ ...form, cols: e.target.value })} /></div>
          </div>
          <button type="submit" className="btn btn--primary" style={{ marginTop: '1rem' }}>Save</button>
        </form>
      </Modal>
    </>
  );
}
