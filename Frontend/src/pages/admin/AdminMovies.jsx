import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

  const load = () => {
    movieApi.getAll().then(({ data }) => setMovies(data.movies || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Movies</h1>
        <button type="button" className="btn btn--primary" onClick={openAdd}>
          <Plus size={18} /> Add Movie
        </button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Language</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((m) => (
              <tr key={m._id}>
                <td>{m.title}</td>
                <td>{m.language}</td>
                <td>{m.rating}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(m)}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleDelete(m._id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
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
