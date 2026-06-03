import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Download, Ticket } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../utils/format';

export default function BookingSuccessPage() {
  const { state } = useLocation();
  const { bookingId, show, seats, total } = state || {};

  if (!bookingId) {
    return (
      <div className="container empty-state">
        <h3>Invalid session</h3>
        <Link to="/" className="btn btn--primary">Go home</Link>
      </div>
    );
  }

  const ticketId = bookingId.slice(-8).toUpperCase();

  return (
    <div className="container success-page">
      <div className="success-icon">
        <CheckCircle size={40} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Booking Confirmed!</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Your tickets are ready. Enjoy the show!
      </p>

      <div className="card" style={{ padding: '1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Booking ID
        </p>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace', marginBottom: '1rem' }}>
          #{ticketId}
        </p>
        {show && (
          <>
            <h3>{show.movie?.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {show.theatre?.name}<br />
              {formatDate(show.showDate)} · {formatTime(show.startTime)}
            </p>
            <p style={{ marginTop: '0.75rem' }}><strong>Seats:</strong> {seats?.join(', ')}</p>
            <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>{formatCurrency(total)}</p>
          </>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Link to={`/bookings/${bookingId}`} className="btn btn--primary btn--lg">
          <Ticket size={18} />
          View Ticket Details
        </Link>
        <Link to="/bookings" className="btn btn--secondary">
          My Bookings
        </Link>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => window.print()}
        >
          <Download size={18} />
          Print / Save
        </button>
      </div>
    </div>
  );
}
