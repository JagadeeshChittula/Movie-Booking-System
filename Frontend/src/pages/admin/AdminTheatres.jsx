import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
  const [form, setForm] = useState(empty);

  const load = () => theatreApi.getAll().then(({ data }) => setItems(data.theatres || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await theatreApi.add({
        ...form,
        facilities: form.facilities.split(',').map((f) => f.trim()).filter(Boolean),
      });
      toast.success('Theatre added');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1>Theatres</h1>
        <button type="button" className="btn btn--primary" onClick={() => setModal(true)}><Plus size={18} /> Add</button>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>City</th><th>Address</th><th /></tr></thead>
          <tbody>
            {items.map((t) => (
              <tr key={t._id}>
                <td>{t.name}</td>
                <td>{t.city}</td>
                <td>{t.address}</td>
                <td>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleDelete(t._id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal} onClose={() => setModal(false)}>
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Add Theatre</h2>
          {Object.keys(empty).map((key) => (
            <div key={key} className="field" style={{ marginBottom: '0.75rem' }}>
              <label>{key}</label>
              <input className="input" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={key !== 'description' && key !== 'facilities'} />
            </div>
          ))}
          <button type="submit" className="btn btn--primary">Save</button>
        </form>
      </Modal>
    </>
  );
}
