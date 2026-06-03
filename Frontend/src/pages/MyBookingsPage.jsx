import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../api/services';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDate, formatTime } from '../utils/format';

const statusClass = {
  confirmed: 'badge--success',
  pending: 'badge--gold',
  cancelled: 'badge--muted',
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    bookingApi
      .mine()
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.bookingStatus === filter;
  });

  if (loading) return <Loader fullPage />;

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <header className="page-header">
        <h1>My Tickets</h1>
        <p>All your movie bookings in one place</p>
      </header>

      <div className="filters-bar">
        {['all', 'confirmed', 'pending', 'cancelled'].map((f) => (
          <button
            key={f}
            type="button"
            className={`chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          message="Book your first movie experience today."
          action={<Link to="/movies" className="btn btn--primary">Browse Movies</Link>}
        />
      ) : (
        <div className="booking-list">
          {filtered.map((b) => {
            const show = b.show;
            const movie = show?.movie;
            return (
              <Link key={b._id} to={`/bookings/${b._id}`} className="card booking-item">
                <img
                  src={movie?.posterUrl}
                  alt=""
                  className="booking-item__poster"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/64x96/16161f/9b9bb0?text=';
                  }}
                />
                <div>
                  <h3 style={{ marginBottom: 4 }}>{movie?.title || 'Movie'}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {show?.theatre?.name} · {formatDate(show?.showDate)} · {formatTime(show?.startTime)}
                  </p>
                  <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
                    Seats: {b.seats?.join(', ')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${statusClass[b.bookingStatus] || 'badge--muted'}`}>
                    {b.bookingStatus}
                  </span>
                  <p style={{ fontWeight: 700, marginTop: '0.5rem' }}>{formatCurrency(b.totalAmount)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
