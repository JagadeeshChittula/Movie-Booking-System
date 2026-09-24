import { useEffect, useState, useMemo } from 'react';
import { Search, X, User, Eye, EyeOff } from 'lucide-react';
import { userApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/ui/Loader';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  const load = () => {
    userApi.getAll()
      .then(({ data }) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleBlock = async (u) => {
    const isCurrentlyBlocked = Boolean(u.isBlocked);
    try {
      if (isCurrentlyBlocked) {
        await userApi.unblock(u._id);
        toast.success(`Account for "${u.name}" unhidden & active`);
      } else {
        await userApi.block(u._id);
        toast.success(`Account for "${u.name}" hidden & blocked`);
      }
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const filteredUsers = useMemo(() => {
    let list = users;

    if (visibilityFilter === 'visible') {
      list = list.filter((u) => !u.isBlocked);
    } else if (visibilityFilter === 'hidden') {
      list = list.filter((u) => u.isBlocked);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((u) => {
        const nameMatch = u.name?.toLowerCase().includes(term);
        const emailMatch = u.email?.toLowerCase().includes(term);
        const roleMatch = u.role?.toLowerCase().includes(term);
        const statusMatch = (u.isBlocked ? 'blocked hidden' : 'active visible').includes(term);
        return nameMatch || emailMatch || roleMatch || statusMatch;
      });
    }

    return list;
  }, [users, searchTerm, visibilityFilter]);

  if (loading) return <Loader fullPage />;

  const visibleCount = users.filter((u) => !u.isBlocked).length;
  const hiddenCount = users.filter((u) => u.isBlocked).length;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Users</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage registered accounts, roles, access permissions, and visibility (hide/block)
          </p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search className="search-icon" size={17} />
          <input
            type="search"
            placeholder="Search by name, email, role (e.g. admin, user)…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search users"
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
          <div className="admin-filter-group" title="Filter by user status">
            <button
              type="button"
              className={`admin-filter-btn ${visibilityFilter === 'all' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('all')}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${visibilityFilter === 'visible' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('visible')}
            >
              Active ({visibleCount})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${visibilityFilter === 'hidden' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('hidden')}
            >
              Blocked/Hidden ({hiddenCount})
            </button>
          </div>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredUsers.length}</strong>
          </span>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  No users matching current filters.{' '}
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
              filteredUsers.map((u) => {
                const isBlocked = Boolean(u.isBlocked);
                return (
                  <tr key={u._id} className={isBlocked ? 'table-row-hidden' : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--bg-hover)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <User size={16} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge--accent' : 'badge--muted'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {isBlocked ? (
                        <span className="badge badge--error" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <EyeOff size={11} /> Blocked / Hidden
                        </span>
                      ) : (
                        <span className="badge badge--success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Eye size={11} /> Active / Visible
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => handleToggleBlock(u)}
                          title={isBlocked ? 'Unhide & unblock user' : 'Hide & block user'}
                          aria-label={isBlocked ? 'Unhide user' : 'Hide user'}
                          style={{ color: isBlocked ? 'var(--gold)' : 'var(--text-muted)' }}
                        >
                          {isBlocked ? <Eye size={15} /> : <EyeOff size={15} />}
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
    </>
  );
}
