import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Armchair, XCircle } from 'lucide-react';
import { bookingApi } from '../api/services';
import Loader from '../components/ui/Loader';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate, formatTime } from '../utils/format';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    bookingApi
      .getOne(id)
      .then(({ data }) => setBooking(data.booking))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      await bookingApi.cancel(id);
      toast.success('Booking cancelled');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!booking) {
    return (
      <div className="container empty-state">
        <h3>Booking not found</h3>
        <Link to="/bookings" className="btn btn--primary">Back</Link>
      </div>
    );
  }

  const show = booking.show;
  const movie = show?.movie;

  return (
    <div className="container" style={{ maxWidth: 640, padding: '2rem 0 3rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>E-Ticket</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: 2 }}>
            #{booking._id.slice(-8).toUpperCase()}
          </p>
          <span className={`badge badge--${booking.bookingStatus === 'confirmed' ? 'success' : 'muted'}`}>
            {booking.bookingStatus}
          </span>
        </div>

        {movie?.posterUrl && (
          <img
            src={movie.posterUrl}
            alt=""
            style={{ width: 120, borderRadius: 12, margin: '0 auto 1rem', display: 'block' }}
          />
        )}

        <h1 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>
          {movie?.title}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', color: 'var(--text-muted)' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} /> {show?.theatre?.name}, {show?.theatre?.city}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} /> {formatDate(show?.showDate)}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} /> {formatTime(show?.startTime)}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Armchair size={18} /> {booking.seats?.join(', ')}
          </p>
        </div>

        <div style={{ borderTop: '1px dashed var(--border)', margin: '1.5rem 0', paddingTop: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(booking.totalAmount)}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Payment: {booking.paymentStatus}</p>
        </div>

        {booking.bookingStatus !== 'cancelled' && (
          <button
            type="button"
            className="btn btn--secondary btn--block"
            disabled={cancelling}
            onClick={handleCancel}
            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
          >
            <XCircle size={18} />
            {cancelling ? 'Cancelling…' : 'Cancel Booking'}
          </button>
        )}
      </div>

      <Link to="/bookings" className="btn btn--ghost btn--block" style={{ marginTop: '1rem' }}>
        ← All bookings
      </Link>
    </div>
  );
}
