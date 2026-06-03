import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userApi } from '../api/services';
import Loader from '../components/ui/Loader';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userApi
      .profile()
      .then(({ data }) => setProfile(data.user || data))
      .catch(() => setProfile(user))
      .finally(() => setLoading(false));
  }, [user]);

  const handlePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.changePassword({ oldPassword, newPassword });
      toast.success('Password updated');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullPage />;

  const p = profile || user;

  return (
    <div className="container" style={{ maxWidth: 520, padding: '2rem 0 3rem' }}>
      <header className="page-header" style={{ paddingTop: 0 }}>
        <h1>Profile</h1>
      </header>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Account</p>
        <h2 style={{ marginTop: 4 }}>{p?.name}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{p?.email}</p>
        <span className="badge badge--accent" style={{ marginTop: '0.75rem' }}>
          {p?.role || 'user'}
        </span>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Change password</h3>
        <form className="auth-form" onSubmit={handlePassword}>
          <div className="field">
            <label>Current password</label>
            <input
              type="password"
              className="input"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>New password</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Update Password'}
          </button>
        </form>
      </div>

      <button type="button" className="btn btn--secondary btn--block" style={{ marginTop: '1.5rem' }} onClick={logout}>
        Sign Out
      </button>
    </div>
  );
}
