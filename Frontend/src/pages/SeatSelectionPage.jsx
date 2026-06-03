import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { showApi, seatLockApi } from '../api/services';
import SeatMap from '../components/booking/SeatMap';
import Loader from '../components/ui/Loader';
import { useToast } from '../context/ToastContext';
import { useSeatLockTimer } from '../hooks/useSeatLockTimer';
import { formatCurrency, formatDate, formatTime } from '../utils/format';
import { generateSeatIds, getSeatTier, getSeatPriceMultiplier, parseSeatRow } from '../utils/seats';
import { saveCheckout } from '../utils/storage';

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

  const loadSeats = () => {
    showApi.getSeats(showId).then(({ data }) => {
      setBookedSeats(data.bookedSeats || []);
      setLockedSeats(data.lockedSeats || []);
    });
  };

  useEffect(() => {
    showApi
      .getOne(showId)
      .then(({ data }) => setShow(data.show))
      .catch(() => toast.error('Show not found'))
      .finally(() => setLoading(false));
    loadSeats();
    const interval = setInterval(loadSeats, 15000);
    return () => clearInterval(interval);
  }, [showId, toast]);

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
        <h1>Select Seats</h1>
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
            Seats reserved for 60 seconds after you continue
          </p>
        </aside>
      </div>
    </div>
  );
}
