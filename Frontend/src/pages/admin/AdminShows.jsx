import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
    Promise.all([showApi.getAll(), movieApi.getAll(), theatreApi.getAll()])
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

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1>Shows</h1>
        <button type="button" className="btn btn--primary" onClick={() => setModal(true)}><Plus size={18} /> Schedule</button>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Movie</th><th>Theatre</th><th>Date</th><th>Time</th><th>Price</th><th /></tr></thead>
          <tbody>
            {shows.map((s) => (
              <tr key={s._id}>
                <td>{s.movie?.title}</td>
                <td>{s.theatre?.name}</td>
                <td>{formatDate(s.showDate)}</td>
                <td>{formatTime(s.startTime)}</td>
                <td>{formatCurrency(s.ticketPrice)}</td>
                <td>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleDelete(s._id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
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
