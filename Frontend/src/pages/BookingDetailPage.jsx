import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Armchair, XCircle, Download, CheckCircle, UtensilsCrossed } from 'lucide-react';
import QRCode from 'qrcode';
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
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    bookingApi
      .getOne(id)
      .then(({ data }) => {
        setBooking(data.booking);
        QRCode.toDataURL(`CINEVAULT_TICKET:${data.booking?._id}`, {
          width: 180,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        })
          .then((url) => setQrUrl(url))
          .catch(() => {});
      })
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
    <div className="container" style={{ maxWidth: 680, padding: '2rem 0 3rem' }}>
      <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Digital E-Ticket</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1 }}>
              #{booking._id.slice(-8).toUpperCase()}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className={`badge badge--${booking.bookingStatus === 'confirmed' ? 'success' : 'muted'}`}>
                {booking.bookingStatus}
              </span>
              {booking.isCheckedIn ? (
                <span className="badge badge--gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={12} /> Admitted
                </span>
              ) : (
                <span className="badge badge--accent">
                  Ready for Gate Entry
                </span>
              )}
            </div>
          </div>

          {qrUrl && (
            <div style={{ textAlign: 'center', background: '#fff', padding: '0.4rem', borderRadius: 8 }}>
              <img src={qrUrl} alt="Gate QR" style={{ width: 120, height: 120, display: 'block' }} />
              <span style={{ fontSize: '0.6rem', color: '#111', fontWeight: 700 }}>GATE SCANNER</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          {movie?.posterUrl && (
            <img
              src={movie.posterUrl}
              alt=""
              style={{ width: 90, height: 130, objectFit: 'cover', borderRadius: 8, display: 'block' }}
              onError={(e) => {
                if (movie.trailerUrl && !e.target.dataset.fallbackTried) {
                  e.target.dataset.fallbackTried = 'true';
                  const match = movie.trailerUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                  if (match) {
                    e.target.src = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
                    return;
                  }
                }
                e.target.src = 'https://placehold.co/400x600/16161f/9b9bb0?text=Movie';
              }}
            />
          )}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.35rem' }}>
              {movie?.title || 'Movie'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {movie?.language} · {movie?.genre?.join(', ')}
            </p>
            <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>
              {show?.theatre?.name} — {show?.screen?.name} ({show?.screen?.screenType})
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} /> {show?.theatre?.city}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} /> {formatDate(show?.showDate)}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} /> {formatTime(show?.startTime)}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Armchair size={18} /> Seats: <strong style={{ color: 'var(--accent)' }}>{booking.seats?.join(', ')}</strong>
          </p>
        </div>

        {/* F&B Concessions Section */}
        {booking.snacks && booking.snacks.length > 0 && (
          <div style={{ background: 'var(--bg-hover)', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <UtensilsCrossed size={16} /> Pre-Booked Concessions
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
              {booking.snacks.map((s, idx) => (
                <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>{s.name} × {s.quantity}</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(s.price * s.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Payment: {booking.paymentStatus.toUpperCase()}</p>
            {booking.couponCode && (
              <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Promo applied: {booking.couponCode}</p>
            )}
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)' }}>{formatCurrency(booking.totalAmount)}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--primary"
            style={{ flex: 1 }}
            onClick={() => window.print()}
          >
            <Download size={18} /> Print E-Ticket
          </button>

          {booking.bookingStatus !== 'cancelled' && (
            <button
              type="button"
              className="btn btn--secondary"
              disabled={cancelling}
              onClick={handleCancel}
              style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
            >
              <XCircle size={18} />
              {cancelling ? 'Cancelling…' : 'Cancel Ticket'}
            </button>
          )}
        </div>
      </div>

      <Link to="/bookings" className="btn btn--ghost btn--block" style={{ marginTop: '1rem' }}>
        ← Back to all bookings
      </Link>
    </div>
  );
}
