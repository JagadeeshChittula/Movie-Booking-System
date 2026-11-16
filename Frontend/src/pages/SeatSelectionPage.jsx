import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Zap, Sparkles, Eye, Compass, Star } from 'lucide-react';
import { showApi, seatLockApi } from '../api/services';
import SeatMap from '../components/booking/SeatMap';
import Cinema3DViewer from '../components/booking/Cinema3DViewer';
import Loader from '../components/ui/Loader';
import { useToast } from '../context/ToastContext';
import { useSeatLockTimer } from '../hooks/useSeatLockTimer';
import { formatCurrency, formatDate, formatTime } from '../utils/format';
import {
  generateSeatIds,
  getSeatTier,
  getSeatPriceMultiplier,
  parseSeatRow,
  findBestContiguousSeats,
  calculateSeatScore,
} from '../utils/seats';
import { saveCheckout } from '../utils/storage';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [show, setShow] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [lock, setLock] = useState(null);
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [focusSeat, setFocusSeat] = useState(null);

  const rows = show?.screen?.seatLayout?.rows || 8;
  const cols = show?.screen?.seatLayout?.cols || 12;
  const basePrice = show?.ticketPrice || 0;

  // Active seat to preview in sightline dock
  const currentFocusSeat =
    focusSeat ||
    selected[selected.length - 1] ||
    `${String.fromCharCode(65 + Math.floor(rows * 0.6))}${Math.ceil(cols / 2)}`;

  const handleAutoSelectBest = (count) => {
    const unavailable = [...bookedSeats, ...lockedSeats];
    const best = findBestContiguousSeats(count, rows, cols, unavailable);
    if (!best || best.length === 0) {
      toast.error(`Could not find ${count} contiguous available seats in the sweet spot.`);
      return;
    }
    setSelected(best);
    setFocusSeat(best[0]);
    toast.success(`seats.movie: Selected top ${count} sweet spot seats (${best.join(', ')})!`);
  };

  const { formatted, expired } = useSeatLockTimer(lock?.expiresAt);

  const loadSeats = useCallback(() => {
    showApi.getSeats(showId).then(({ data }) => {
      setBookedSeats(data.bookedSeats || []);
      setLockedSeats(data.lockedSeats || []);
    });
  }, [showId]);

  useEffect(() => {
    showApi
      .getOne(showId)
      .then(({ data }) => setShow(data.show))
      .catch(() => toast.error('Show not found'))
      .finally(() => setLoading(false));

    loadSeats();

    // Establish real-time WebSocket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.emit('join_show', showId);

    socket.on('seat_locked', (payload) => {
      if (String(payload.show) === String(showId)) {
        setLockedSeats((prev) => [...new Set([...prev, ...payload.seats])]);
      }
    });

    socket.on('seat_released', (payload) => {
      if (String(payload.show) === String(showId)) {
        setLockedSeats((prev) => prev.filter((s) => !payload.seats.includes(s)));
      }
    });

    socket.on('seat_booked', (payload) => {
      if (String(payload.show) === String(showId)) {
        setBookedSeats((prev) => [...new Set([...prev, ...payload.seats])]);
        setLockedSeats((prev) => prev.filter((s) => !payload.seats.includes(s)));
      }
    });

    // Background sync fallback every 30s
    const interval = setInterval(loadSeats, 30000);

    return () => {
      clearInterval(interval);
      socket.emit('leave_show', showId);
      socket.disconnect();
    };
  }, [showId, toast, loadSeats]);

  const pricing = useMemo(() => {
    const allIds = generateSeatIds(rows, cols);
    const rowKeys = [...new Set(allIds.map(parseSeatRow))];
    let total = 0;
    const tierBreakdown = {
      regular: { name: 'Classic Regular (Front Rows / Near Screen)', count: 0, price: Math.round(basePrice * 1.0), total: 0 },
      executive: { name: 'Executive Prime (Center Sweet Spot)', count: 0, price: Math.round(basePrice * 1.20), total: 0 },
      premium: { name: 'VIP Recliner (Rear Luxury / Balcony)', count: 0, price: Math.round(basePrice * 1.45), total: 0 },
    };

    selected.forEach((seatId) => {
      const rowIndex = rowKeys.indexOf(parseSeatRow(seatId));
      const tier = getSeatTier(rowIndex, rowKeys.length);
      const seatPrice = Math.round(basePrice * getSeatPriceMultiplier(tier));
      tierBreakdown[tier].count += 1;
      tierBreakdown[tier].total += seatPrice;
      total += seatPrice;
    });

    const convenience = Math.round(total * 0.05);
    return { subtotal: total, convenience, total: total + convenience, tierBreakdown };
  }, [selected, rows, cols, basePrice]);

  const toggleSeat = (seatId) => {
    setFocusSeat(seatId);
    setSelected((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  const handleProceed = async () => {
    if (selected.length === 0) {
      toast.error('Select at least one seat');
      return;
    }
    setLocking(true);
    try {
      const { data } = await seatLockApi.lock({ show: showId, seats: selected });
      const lockData = data.lock;
      setLock(lockData);
      saveCheckout({
        showId,
        show,
        seats: selected,
        lockId: lockData._id,
        expiresAt: lockData.expiresAt,
        pricing,
      });
      navigate('/checkout');
    } catch (err) {
      toast.error(err.message);
      loadSeats();
    } finally {
      setLocking(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!show) {
    return (
      <div className="container empty-state">
        <h3>Show not found</h3>
        <Link to="/movies" className="btn btn--primary">Browse movies</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0 3rem' }}>
      <header className="page-header" style={{ paddingTop: 0 }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to={`/movies/${show.movie?._id || show.movie}`}>{show.movie?.title}</Link>
          {' · '}{show.theatre?.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h1>Select Seats</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* 2D / 3D Mode Toggle Switch */}
            <div style={{ display: 'flex', background: 'var(--bg-hover)', borderRadius: '24px', padding: '3px', border: '1px solid var(--border)' }}>
              <button
                type="button"
                className={`chip ${viewMode === '2d' ? 'active' : ''}`}
                onClick={() => setViewMode('2d')}
                style={{ borderRadius: '20px', padding: '0.35rem 0.85rem', fontSize: '0.8rem', border: 'none' }}
              >
                🗺️ 2D Blueprint
              </button>
              <button
                type="button"
                className={`chip ${viewMode === '3d' ? 'active' : ''}`}
                onClick={() => setViewMode('3d')}
                style={{ borderRadius: '20px', padding: '0.35rem 0.85rem', fontSize: '0.8rem', border: 'none', background: viewMode === '3d' ? 'linear-gradient(135deg, #e50914 0%, #b20710 100%)' : 'transparent', color: '#fff' }}
              >
                🕶️ 3D Auditorium & POV
              </button>
            </div>

            <span className="badge badge--success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
              <Zap size={13} /> Live Seat Sync Active
            </span>
          </div>
        </div>
        <p>
          {formatDate(show.showDate)} · {formatTime(show.startTime)} · {show.screen?.name} ({show.screen?.screenType})
        </p>
      </header>

      {/* seats.movie SMART BEST-SEAT FINDER TOOLBAR */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'rgba(20, 22, 36, 0.85)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <Sparkles size={18} color="var(--gold)" />
          <div>
            <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>
              seats.movie Smart Sweet Spot Finder:
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
              Automatically locates the highest-scoring THX cinema viewing angle
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {[
            { count: 1, label: '★ 1 Best Seat' },
            { count: 2, label: '★ 2 Seats (Together)' },
            { count: 3, label: '★ 3 Seats' },
            { count: 4, label: '★ 4 Seats (Family)' },
          ].map((item) => (
            <button
              key={item.count}
              type="button"
              className="chip"
              onClick={() => handleAutoSelectBest(item.count)}
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '18px',
                background: 'var(--bg-hover)',
                fontWeight: 700,
                border: '1px solid var(--border)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Seats Interactive Score Chips (seats.movie feature) */}
      {selected.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1.25rem',
            background: 'rgba(255,255,255,0.03)',
            padding: '0.5rem 0.85rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>
            Selected Seat Scores:
          </span>
          {selected.map((seatId) => {
            const match = seatId.match(/^([A-Z]+)(\d+)$/);
            const rLetter = match ? match[1] : 'E';
            const cNum = match ? parseInt(match[2], 10) : 1;
            const rIdx = Math.max(0, rLetter.charCodeAt(0) - 65);
            const score = calculateSeatScore(rIdx, cNum - 1, rows, cols);
            const isTarget = currentFocusSeat === seatId;

            return (
              <button
                key={seatId}
                type="button"
                onClick={() => setFocusSeat(seatId)}
                title={`Click to inspect POV from Seat ${seatId}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: isTarget ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                  border: isTarget ? '1px solid #ff4d52' : '1px solid var(--border)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: isTarget ? '0 0 12px var(--accent-glow)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Seat {seatId}</span>
                <span
                  style={{
                    background: isTarget ? 'rgba(0,0,0,0.3)' : 'rgba(212, 168, 83, 0.2)',
                    color: isTarget ? '#fff' : 'var(--gold)',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                  }}
                >
                  {score}% Score
                </span>
              </button>
            );
          })}
        </div>
      )}

      {lock && (
        <div className={`lock-timer ${expired ? 'urgent' : ''}`} style={{ maxWidth: 320, marginBottom: '1rem' }}>
          Seats held: {formatted}
        </div>
      )}

      <div className="seat-page">
        {viewMode === '3d' ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            <Cinema3DViewer
              rows={rows}
              cols={cols}
              screenType={show.screen?.screenType || '2D'}
              basePrice={basePrice}
              bookedSeats={bookedSeats}
              lockedSeats={lockedSeats.filter((s) => !selected.includes(s))}
              selected={selected}
              focusSeat={currentFocusSeat}
              onToggle={toggleSeat}
              onAutoSelectBest={handleAutoSelectBest}
              movieTitle={show.movie?.title || 'Movie'}
              moviePoster={show.movie?.posterUrl || ''}
              theatreName={show.theatre?.name || 'Cinema Complex'}
            />
          </div>
        ) : (
          <div style={{ flex: 1, minWidth: 0 }}>
            <SeatMap
              rows={rows}
              cols={cols}
              screenType={show.screen?.screenType || '2D'}
              screenName={show.screen?.name || 'Screen 1'}
              theatreName={show.theatre?.name || 'Cinema'}
              basePrice={basePrice}
              bookedSeats={bookedSeats}
              lockedSeats={lockedSeats.filter((s) => !selected.includes(s))}
              selected={selected}
              onToggle={toggleSeat}
            />

            {/* seats.movie LIVE 3D SIGHTLINE DOCK (Integrated into 2D view) */}
            <div style={{ marginTop: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.65rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={17} color="var(--accent)" />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                    Live 3D Sightline from Seat {currentFocusSeat} (seats.movie POV)
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => setViewMode('3d')}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                >
                  Expand Full 3D Hall Mode →
                </button>
              </div>

              <Cinema3DViewer
                rows={rows}
                cols={cols}
                screenType={show.screen?.screenType || '2D'}
                basePrice={basePrice}
                bookedSeats={bookedSeats}
                lockedSeats={lockedSeats.filter((s) => !selected.includes(s))}
                selected={selected}
                focusSeat={currentFocusSeat}
                onToggle={toggleSeat}
                onAutoSelectBest={handleAutoSelectBest}
                movieTitle={show.movie?.title || 'Movie'}
                moviePoster={show.movie?.posterUrl || ''}
                theatreName={show.theatre?.name || 'Cinema Complex'}
                initialSubMode="seat_pov"
                isDocked={true}
              />
            </div>
          </div>
        )}

        <aside className="checkout-sidebar">
          <h3>Booking Summary</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {selected.length} seat{selected.length !== 1 ? 's' : ''} selected
            {selected.length > 0 && (
              <span style={{ display: 'block', marginTop: 4 }}>{selected.join(', ')}</span>
            )}
          </p>
          <div className="checkout-line">
            <span>Subtotal</span>
            <span>{formatCurrency(pricing.subtotal)}</span>
          </div>
          <div className="checkout-line">
            <span>Convenience fee</span>
            <span>{formatCurrency(pricing.convenience)}</span>
          </div>
          <div className="checkout-line total">
            <span>Total</span>
            <span>{formatCurrency(pricing.total)}</span>
          </div>
          <button
            type="button"
            className="btn btn--primary btn--block btn--lg"
            style={{ marginTop: '1.25rem' }}
            disabled={selected.length === 0 || locking}
            onClick={handleProceed}
          >
            {locking ? 'Locking seats…' : 'Proceed to Pay'}
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.75rem', textAlign: 'center' }}>
            Seats held for 5 minutes in real-time after you continue
          </p>
        </aside>
      </div>

      {/* seats.movie Sticky Floating Bottom Bar (Exact replica from video) */}
      <div
        style={{
          position: 'fixed',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(94%, 600px)',
          background: 'rgba(18, 19, 30, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          borderRadius: '30px',
          padding: '0.65rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100,
          boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fff', letterSpacing: 0.5 }}>
            {selected.length > 0 ? selected.join(', ') : 'No seats selected'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700 }}>
            {selected.length > 0 ? formatCurrency(pricing.total) : 'Pick seats on map'}
          </span>
        </div>

        {/* Floating ^ 3D Pill Toggle */}
        <button
          type="button"
          onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: viewMode === '3d' ? '#ef4444' : 'rgba(255,255,255,0.12)',
            color: '#fff',
            border: 'none',
            padding: '0.45rem 1.15rem',
            borderRadius: '24px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
        >
          <span>^ 3D</span>
        </button>

        <button
          type="button"
          className="btn btn--primary btn--sm"
          disabled={selected.length === 0 || locking}
          onClick={handleProceed}
          style={{
            borderRadius: '24px',
            padding: '0.55rem 1.35rem',
            fontSize: '0.85rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          }}
        >
          {locking ? 'Holding…' : 'Proceed'}
        </button>
      </div>
    </div>
  );
}
