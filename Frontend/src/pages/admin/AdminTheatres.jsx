import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, X, MapPin } from 'lucide-react';
import { theatreApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';

const empty = { name: '', city: '', address: '', description: '', facilities: '' };

export default function AdminTheatres() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [searchTerm, setSearchTerm] = useState('');

  const load = () => theatreApi.getAll().then(({ data }) => setItems(data.theatres || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filteredTheatres = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase().trim();
    return items.filter((t) => {
      const nameMatch = t.name?.toLowerCase().includes(term);
      const cityMatch = t.city?.toLowerCase().includes(term);
      const addrMatch = t.address?.toLowerCase().includes(term);
      const facMatch = Array.isArray(t.facilities)
        ? t.facilities.some((f) => f.toLowerCase().includes(term))
        : t.facilities?.toLowerCase().includes(term);
      return nameMatch || cityMatch || addrMatch || facMatch;
    });
  }, [items, searchTerm]);

  const openAdd = () => {
    setEditId(null);
    setForm(empty);
    setModal(true);
  };

  const openEdit = (t) => {
    setEditId(t._id);
    setForm({
      name: t.name || '',
      city: t.city || '',
      address: t.address || '',
      description: t.description || '',
      facilities: Array.isArray(t.facilities) ? t.facilities.join(', ') : (t.facilities || ''),
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      facilities: form.facilities.split(',').map((f) => f.trim()).filter(Boolean),
    };
    try {
      if (editId) {
        await theatreApi.update(editId, payload);
        toast.success('Theatre updated');
      } else {
        await theatreApi.add(payload);
        toast.success('Theatre added');
      }
      setModal(false);
      setForm(empty);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete theatre?')) return;
    try {
      await theatreApi.remove(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Theatres</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage cinema properties, locations, and amenities
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openAdd}>
          <Plus size={18} /> Add Theatre
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search className="search-icon" size={17} />
          <input
            type="search"
            placeholder="Search by theatre name, city, address (e.g. INOX, Vizag, Srikakulam)…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search theatres"
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
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredTheatres.length}</strong> of {items.length} theatres
        </span>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Theatre</th>
              <th>City</th>
              <th>Address</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTheatres.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  No theatres matching <strong>"{searchTerm}"</strong>.{' '}
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => setSearchTerm('')}
                    style={{ textDecoration: 'underline' }}
                  >
                    Reset search
                  </button>
                </td>
              </tr>
            ) : (
              filteredTheatres.map((t) => (
                <tr key={t._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    {t.facilities && t.facilities.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
                        {Array.isArray(t.facilities) ? t.facilities.slice(0, 3).join(' • ') : t.facilities}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge--accent">{t.city}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {t.address}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => openEdit(t)}
                        title={`Edit ${t.name}`}
                        aria-label={`Edit ${t.name}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => handleDelete(t._id)}
                        title={`Delete ${t.name}`}
                        aria-label={`Delete ${t.name}`}
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

      <Modal open={modal} onClose={() => setModal(false)}>
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.25rem' }}>{editId ? 'Edit' : 'Add'} Theatre</h2>
          <div className="admin-form" style={{ maxWidth: '100%' }}>
            {Object.keys(empty).map((key) => (
              <div key={key} className="field">
                <label style={{ textTransform: 'capitalize' }}>
                  {key === 'facilities' ? 'Facilities (comma separated)' : key}
                </label>
                <input
                  className="input"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={key === 'facilities' ? 'Dolby Atmos, 4K RGB Laser, Recliner Seats' : ''}
                  required={key !== 'description' && key !== 'facilities'}
                />
              </div>
            ))}
            <div className="admin-form__actions" style={{ marginTop: '0.75rem' }}>
              <button type="submit" className="btn btn--primary">
                {editId ? 'Save Changes' : 'Add Theatre'}
              </button>
              <button type="button" className="btn btn--secondary" onClick={() => setModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
