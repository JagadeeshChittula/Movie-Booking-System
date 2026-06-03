import { useEffect, useState } from 'react';
import client from '../../api/client';
import Loader from '../../components/ui/Loader';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/auth/all-users').then(({ data }) => setUsers(data.users || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;

  return (
    <>
      <h1 style={{ marginBottom: '1.5rem' }}>Users</h1>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge badge--accent">{u.role}</span></td>
                <td>{u.isBlocked ? 'Blocked' : 'Active'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
