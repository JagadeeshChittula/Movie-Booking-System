import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
  const [form, setForm] = useState({
    theatre: '',
    name: 'Screen 1',
    screenType: '2D',
    totalSeats: 96,
    rows: 8,
    cols: 12,
  });

  const load = () => {
    Promise.all([screenApi.getAll(), theatreApi.getAll()])
      .then(([s, t]) => {
        setScreens(s.data.screens || []);
        setTheatres(t.data.theatres || []);
        if (t.data.theatres?.[0]) setForm((f) => ({ ...f, theatre: t.data.theatres[0]._id }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

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

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1>Screens</h1>
        <button type="button" className="btn btn--primary" onClick={() => setModal(true)}><Plus size={18} /> Add</button>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Type</th><th>Seats</th><th>Layout</th><th /></tr></thead>
          <tbody>
            {screens.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.screenType}</td>
                <td>{s.totalSeats}</td>
                <td>{s.seatLayout?.rows}×{s.seatLayout?.cols}</td>
                <td>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleDelete(s._id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
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
