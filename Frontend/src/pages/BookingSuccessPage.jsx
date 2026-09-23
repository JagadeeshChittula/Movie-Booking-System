import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Download, Ticket } from 'lucide-react';
import QRCode from 'qrcode';
import { formatCurrency, formatDate, formatTime } from '../utils/format';

export default function BookingSuccessPage() {
  const { state } = useLocation();
  const { bookingId, show, seats, total, snacks, discount } = state || {};
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (bookingId) {
      QRCode.toDataURL(`CINEVAULT_TICKET:${bookingId}`, {
        width: 180,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [bookingId]);

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
    <div className="container success-page" style={{ maxWidth: 640 }}>
      <div className="success-icon">
        <CheckCircle size={40} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Booking Confirmed!</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Your tickets are ready. Present this QR code at the cinema gate for instant entry.
      </p>

      <div className="card" style={{ padding: '1.75rem', textAlign: 'left', marginBottom: '1.5rem', border: '2px solid var(--accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Booking Reference
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', marginBottom: '0.75rem' }}>
              #{ticketId}
            </p>
            {show && (
              <>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{show.movie?.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {show.theatre?.name} · {show.screen?.name} ({show.screen?.screenType})
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {formatDate(show.showDate)} · {formatTime(show.startTime)}
                </p>
                <p style={{ marginTop: '0.75rem', fontSize: '0.95rem' }}>
                  <strong>Seats:</strong> <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{seats?.join(', ')}</span>
                </p>
              </>
            )}
          </div>

          {qrDataUrl && (
            <div style={{ textAlign: 'center', background: '#fff', padding: '0.5rem', borderRadius: 8, alignSelf: 'center' }}>
              <img src={qrDataUrl} alt="Ticket QR Code" style={{ width: 140, height: 140, display: 'block' }} />
              <span style={{ fontSize: '0.65rem', color: '#333', fontWeight: 700, letterSpacing: '0.05em' }}>SCAN AT GATE</span>
            </div>
          )}
        </div>

        {/* Snacks Voucher Breakdown if present */}
        {snacks && snacks.length > 0 && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--gold)' }}>🍿 Concessions & Food Voucher</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
              {snacks.map((s, idx) => (
                <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>{s.name} × {s.quantity}</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(s.price * s.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {discount > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'block' }}>Includes -{formatCurrency(discount)} Promo Discount</span>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Status: Paid & Confirmed</span>
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold)' }}>{formatCurrency(total)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          type="button"
          className="btn btn--primary btn--lg"
          onClick={() => window.print()}
        >
          <Download size={18} />
          Print / Save Boarding Pass (PDF)
        </button>
        <Link to={`/bookings/${bookingId}`} className="btn btn--secondary">
          <Ticket size={18} />
          View Digital E-Ticket
        </Link>
        <Link to="/bookings" className="btn btn--ghost">
          Go to My Bookings
        </Link>
      </div>
    </div>
  );
}
