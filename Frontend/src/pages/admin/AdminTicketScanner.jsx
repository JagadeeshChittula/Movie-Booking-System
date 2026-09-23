import { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, XCircle, UtensilsCrossed, Armchair, Clock, MapPin, Film, User, ShieldCheck } from 'lucide-react';
import { bookingApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, formatTime } from '../../utils/format';
import Loader from '../../components/ui/Loader';

export default function AdminTicketScanner() {
  const toast = useToast();
  const [queryId, setQueryId] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const cleanBookingId = (raw) => {
    let clean = raw.trim();
    if (clean.startsWith('CINEVAULT_TICKET:')) {
      clean = clean.replace('CINEVAULT_TICKET:', '');
    }
    return clean;
  };

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    const id = cleanBookingId(queryId);
    if (!id) {
      toast.error('Please enter a Booking ID or scan a ticket QR');
      return;
    }

    setLoading(true);
    setBooking(null);
    try {
      const { data } = await bookingApi.getOne(id);
      setBooking(data.booking);
      toast.success('Ticket found');
    } catch (err) {
      toast.error(err.message || 'Ticket not found with this ID');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!booking?._id) return;
    setCheckingIn(true);
    try {
      const { data } = await bookingApi.checkIn(booking._id);
      setBooking(data.booking);
      toast.success('Customer admitted! Ticket marked as checked in.');
    } catch (err) {
      toast.error(err.message || 'Failed to check in ticket');
      if (err.response?.data?.booking) {
        setBooking(err.response.data.booking);
      }
    } finally {
      setCheckingIn(false);
    }
  };

  const show = booking?.show;
  const movie = show?.movie;

  return (
    <div style={{ maxWidth: 840 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={28} style={{ color: 'var(--accent)' }} />
          Gate Ticket Scanner & Check-in
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Scan customer digital QR codes or enter Booking IDs to verify and admit cinema attendees.
        </p>
      </div>

      {/* Search / Scan Bar */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="input"
              placeholder="Paste Booking ID or scan barcode / QR code…"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              style={{ paddingLeft: '2.75rem', fontSize: '1.05rem', fontFamily: 'monospace' }}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify Ticket'}
          </button>
        </form>
      </div>

      {loading && <Loader />}

      {/* Ticket Details Panel */}
      {booking && (
        <div className="card" style={{ padding: '2rem', border: '2px solid var(--border)' }}>
          {/* Status Alert Banner */}
          {booking.bookingStatus === 'cancelled' ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--error)', padding: '1rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--error)', marginBottom: '1.5rem' }}>
              <XCircle size={24} />
              <div>
                <strong>ENTRY REJECTED: TICKET CANCELLED</strong>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>This booking was cancelled and refunded. Do not admit.</p>
              </div>
            </div>
          ) : booking.isCheckedIn ? (
            <div style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid var(--gold)', padding: '1rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>
              <AlertTriangle size={24} />
              <div>
                <strong>ALREADY ADMITTED / CHECKED IN</strong>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>
                  This ticket was already checked in at {booking.checkedInAt ? new Date(booking.checkedInAt).toLocaleTimeString() : 'Earlier'}. Possible duplicate use!
                </p>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid var(--success)', padding: '1rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success)', marginBottom: '1.5rem' }}>
              <CheckCircle size={24} />
              <div>
                <strong>VALID TICKET — READY FOR ADMISSION</strong>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>Ticket is verified and paid. Click below to grant admission.</p>
              </div>
            </div>
          )}

          {/* Ticket Information Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Show info */}
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                <Film size={18} /> {movie?.title || 'Movie'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} /> {show?.theatre?.name} — {show?.screen?.name} ({show?.screen?.screenType})
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} /> {formatDate(show?.showDate)} · {formatTime(show?.startTime)}
              </p>
              <div style={{ marginTop: '1rem', background: 'var(--bg-hover)', padding: '0.75rem', borderRadius: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>RESERVED SEATS</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Armchair size={20} /> {booking.seats?.join(', ')}
                </span>
              </div>
            </div>

            {/* Customer info */}
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                <User size={18} /> Attendee Details
              </h3>
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{booking.user?.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{booking.user?.email}</p>
              {booking.user?.phone && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Phone: {booking.user.phone}</p>}
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                <strong>Amount Paid:</strong> {formatCurrency(booking.totalAmount)}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Booking ID: <code style={{ fontFamily: 'monospace' }}>{booking._id}</code>
              </p>
            </div>
          </div>

          {/* Snacks concessions voucher */}
          {booking.snacks && booking.snacks.length > 0 && (
            <div style={{ background: 'var(--bg-hover)', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', border: '1px dashed var(--border)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--gold)' }}>
                <UtensilsCrossed size={16} /> Concessions to Deliver to Customer
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                {booking.snacks.map((snack, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>{snack.name}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>Qty: {snack.quantity}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          {booking.bookingStatus === 'confirmed' && !booking.isCheckedIn && (
            <button
              type="button"
              className="btn btn--primary btn--block btn--lg"
              disabled={checkingIn}
              onClick={handleCheckIn}
              style={{ fontSize: '1.1rem', padding: '1rem' }}
            >
              <CheckCircle size={22} />
              {checkingIn ? 'Authorizing…' : 'Admit Customer / Mark Checked-In'}
            </button>
          )}

          {booking.isCheckedIn && (
            <button
              type="button"
              className="btn btn--ghost btn--block"
              disabled
              style={{ opacity: 0.7 }}
            >
              Customer Already Admitted
            </button>
          )}
        </div>
      )}
    </div>
  );
}
