import { useEffect, useState, useMemo } from 'react';
import { Search, X, Eye, EyeOff, Ban } from 'lucide-react';
import { bookingApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/ui/Loader';
import { formatCurrency } from '../../utils/format';

export default function AdminBookings() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  const load = () => {
    bookingApi.getAllAdmin()
      .then(({ data }) => setBookings(data.bookings || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancelBooking = async (b) => {
    if (!window.confirm(`Cancel booking for ${b.user?.name || 'customer'}?`)) return;
    try {
      await bookingApi.cancel(b._id);
      toast.success('Booking cancelled and marked as hidden');
      load();
    } catch (err) {
      toast.error(err.message || 'Could not cancel booking');
    }
  };

  const filteredBookings = useMemo(() => {
    let list = bookings;

    if (visibilityFilter === 'visible') {
      list = list.filter((b) => b.bookingStatus !== 'CANCELLED');
    } else if (visibilityFilter === 'hidden') {
      list = list.filter((b) => b.bookingStatus === 'CANCELLED');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((b) => {
        const userName = b.user?.name?.toLowerCase() || '';
        const userEmail = b.user?.email?.toLowerCase() || '';
        const movieTitle = b.show?.movie?.title?.toLowerCase() || '';
        const theatreName = b.show?.theatre?.name?.toLowerCase() || '';
        const seats = b.seats?.join(', ')?.toLowerCase() || '';
        const status = b.bookingStatus?.toLowerCase() || '';
        return (
          userName.includes(term) ||
          userEmail.includes(term) ||
          movieTitle.includes(term) ||
          theatreName.includes(term) ||
          seats.includes(term) ||
          status.includes(term)
        );
      });
    }

    return list;
  }, [bookings, searchTerm, visibilityFilter]);

  if (loading) return <Loader fullPage />;

  const activeCount = bookings.filter((b) => b.bookingStatus !== 'CANCELLED').length;
  const cancelledCount = bookings.filter((b) => b.bookingStatus === 'CANCELLED').length;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Bookings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Review customer reservations, transactions, and manage visibility (hide cancelled)
          </p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search className="search-icon" size={17} />
          <input
            type="search"
            placeholder="Search by customer, movie, theatre, seats, status…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search bookings"
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
          <div className="admin-filter-group" title="Filter by booking status">
            <button
              type="button"
              className={`admin-filter-btn ${visibilityFilter === 'all' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('all')}
            >
              All ({bookings.length})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${visibilityFilter === 'visible' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('visible')}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${visibilityFilter === 'hidden' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('hidden')}
            >
              Cancelled/Hidden ({cancelledCount})
            </button>
          </div>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredBookings.length}</strong>
          </span>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Movie</th>
              <th>Theatre</th>
              <th>Seats</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  No bookings matching current filters.{' '}
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
              filteredBookings.map((b) => {
                const isCancelled = b.bookingStatus === 'CANCELLED';
                return (
                  <tr key={b._id} className={isCancelled ? 'table-row-hidden' : ''}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.user?.name || 'Customer'}</div>
                      <small style={{ color: 'var(--text-dim)' }}>{b.user?.email}</small>
                    </td>
                    <td>{b.show?.movie?.title}</td>
                    <td>{b.show?.theatre?.name}</td>
                    <td>{b.seats?.join(', ')}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(b.totalAmount)}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.bookingStatus === 'CONFIRMED'
                            ? 'badge--success'
                            : b.bookingStatus === 'CANCELLED'
                            ? 'badge--error'
                            : 'badge--muted'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {!isCancelled && (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => handleCancelBooking(b)}
                            title="Cancel booking"
                            aria-label="Cancel booking"
                            style={{ color: 'var(--error)' }}
                          >
                            <Ban size={15} />
                          </button>
                        )}
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
