import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, X, Star } from 'lucide-react';
import { movieApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';

const empty = {
  title: '',
  description: '',
  duration: 120,
  language: 'Hindi',
  genre: '',
  releaseDate: '',
  posterUrl: '',
  trailerUrl: '',
  rating: 8,
};

export default function AdminMovies() {
  const toast = useToast();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const load = () => {
    movieApi.getAll().then(({ data }) => setMovies(data.movies || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filteredMovies = useMemo(() => {
    if (!searchTerm.trim()) return movies;
    const term = searchTerm.toLowerCase().trim();
    return movies.filter((m) => {
      const titleMatch = m.title?.toLowerCase().includes(term);
      const langMatch = m.language?.toLowerCase().includes(term);
      const genreMatch = Array.isArray(m.genre)
        ? m.genre.some((g) => g.toLowerCase().includes(term))
        : m.genre?.toLowerCase().includes(term);
      const ratingMatch = String(m.rating || '').includes(term);
      return titleMatch || langMatch || genreMatch || ratingMatch;
    });
  }, [movies, searchTerm]);

  const openAdd = () => {
    setEditId(null);
    setForm(empty);
    setModal(true);
  };

  const openEdit = (m) => {
    setEditId(m._id);
    setForm({
      ...m,
      genre: Array.isArray(m.genre) ? m.genre.join(', ') : m.genre,
      releaseDate: m.releaseDate?.slice(0, 10),
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      duration: Number(form.duration),
      rating: Number(form.rating),
      genre: form.genre.split(',').map((g) => g.trim()).filter(Boolean),
    };
    try {
      if (editId) {
        await movieApi.update(editId, payload);
        toast.success('Movie updated');
      } else {
        await movieApi.add(payload);
        toast.success('Movie added');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this movie?')) return;
    try {
      await movieApi.remove(id);
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
          <h1 style={{ fontSize: '1.75rem' }}>Movies</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage catalog titles, edit metadata, and manage show allocations
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openAdd}>
          <Plus size={18} /> Add Movie
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search className="search-icon" size={17} />
          <input
            type="search"
            placeholder="Search by title, language, genre (e.g. Fauzi, Telugu, Action)…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search movies"
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
          Showing <strong>{filteredMovies.length}</strong> of {movies.length} movies
        </span>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Movie</th>
              <th>Language</th>
              <th>Rating</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovies.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  No movies matching <strong>"{searchTerm}"</strong>.{' '}
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
              filteredMovies.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {m.posterUrl ? (
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          style={{
                            width: 36,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            flexShrink: 0,
                          }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : null}
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
                          {Array.isArray(m.genre) ? m.genre.slice(0, 3).join(', ') : m.genre}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge--muted">{m.language}</span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--gold)' }}>
                      <Star size={13} fill="var(--gold)" color="var(--gold)" /> {m.rating}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => openEdit(m)}
                        title={`Edit ${m.title}`}
                        aria-label={`Edit ${m.title}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => handleDelete(m._id)}
                        title={`Delete ${m.title}`}
                        aria-label={`Delete ${m.title}`}
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

      <Modal open={modal} onClose={() => setModal(false)} wide>
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>{editId ? 'Edit' : 'Add'} Movie</h2>
          <div className="admin-form" style={{ maxWidth: '100%' }}>
            {['title', 'description', 'posterUrl', 'trailerUrl', 'language'].map((key) => (
              <div key={key} className="field">
                <label>{key}</label>
                <input
                  className="input"
                  value={form[key] || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={['title', 'description', 'posterUrl', 'language'].includes(key)}
                />
              </div>
            ))}
            <div className="field">
              <label>genre (comma separated)</label>
              <input className="input" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="field">
                <label>duration (min)</label>
                <input type="number" className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div className="field">
                <label>rating</label>
                <input type="number" step="0.1" className="input" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              </div>
              <div className="field">
                <label>releaseDate</label>
                <input type="date" className="input" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} required />
              </div>
            </div>
            <div className="admin-form__actions">
              <button type="submit" className="btn btn--primary">Save</button>
              <button type="button" className="btn btn--secondary" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
