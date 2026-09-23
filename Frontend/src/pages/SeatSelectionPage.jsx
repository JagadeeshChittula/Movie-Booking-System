import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Zap } from 'lucide-react';
import { showApi, seatLockApi } from '../api/services';
import SeatMap from '../components/booking/SeatMap';
import Loader from '../components/ui/Loader';
import { useToast } from '../context/ToastContext';
import { useSeatLockTimer } from '../hooks/useSeatLockTimer';
import { formatCurrency, formatDate, formatTime } from '../utils/format';
import { generateSeatIds, getSeatTier, getSeatPriceMultiplier, parseSeatRow } from '../utils/seats';
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

  const rows = show?.screen?.seatLayout?.rows || 8;
  const cols = show?.screen?.seatLayout?.cols || 12;
  const basePrice = show?.ticketPrice || 0;

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
    selected.forEach((seatId) => {
      const rowIndex = rowKeys.indexOf(parseSeatRow(seatId));
      const tier = getSeatTier(rowIndex, rowKeys.length);
      total += basePrice * getSeatPriceMultiplier(tier);
    });
    const convenience = Math.round(total * 0.05);
    return { subtotal: total, convenience, total: total + convenience };
  }, [selected, rows, cols, basePrice]);

  const toggleSeat = (seatId) => {
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h1>Select Seats</h1>
          <span className="badge badge--success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
            <Zap size={13} /> Live Seat Sync Active
          </span>
        </div>
        <p>
          {formatDate(show.showDate)} · {formatTime(show.startTime)} · {show.screen?.name} ({show.screen?.screenType})
        </p>
      </header>

      {lock && (
        <div className={`lock-timer ${expired ? 'urgent' : ''}`} style={{ maxWidth: 320, marginBottom: '1rem' }}>
          Seats held: {formatted}
        </div>
      )}

      <div className="seat-page">
        <SeatMap
          rows={rows}
          cols={cols}
          bookedSeats={bookedSeats}
          lockedSeats={lockedSeats.filter((s) => !selected.includes(s))}
          selected={selected}
          onToggle={toggleSeat}
        />

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
    </div>
  );
}
