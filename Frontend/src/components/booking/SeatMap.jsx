import { generateSeatIds, getSeatTier } from '../../utils/seats';

export default function SeatMap({
  rows,
  cols,
  bookedSeats = [],
  lockedSeats = [],
  selected = [],
  onToggle,
  maxSeats = 10,
}) {
  const allSeats = generateSeatIds(rows, cols);
  const byRow = {};

  allSeats.forEach((id) => {
    const row = id.match(/^([A-Z]+)/)?.[1] || 'A';
    if (!byRow[row]) byRow[row] = [];
    byRow[row].push(id);
  });

  const rowKeys = Object.keys(byRow);

  const handleSeat = (seatId) => {
    if (bookedSeats.includes(seatId) || lockedSeats.includes(seatId)) return;
    if (!selected.includes(seatId) && selected.length >= maxSeats) return;
    onToggle(seatId);
  };

  return (
    <div className="seat-map-wrap">
      <div className="screen-bar">SCREEN</div>
      {rowKeys.map((rowKey, rowIndex) => (
        <div key={rowKey} className="seat-row">
          <span className="seat-row__label">{rowKey}</span>
          {byRow[rowKey].map((seatId) => {
            const tier = getSeatTier(rowIndex, rowKeys.length);
            const isBooked = bookedSeats.includes(seatId);
            const isLocked = lockedSeats.includes(seatId);
            const isSelected = selected.includes(seatId);
            let className = `seat seat--${tier}`;
            if (isBooked) className += ' seat--booked';
            else if (isLocked) className += ' seat--locked';
            else if (isSelected) className += ' seat--selected';

            return (
              <button
                key={seatId}
                type="button"
                className={className}
                onClick={() => handleSeat(seatId)}
                disabled={isBooked || isLocked}
                title={seatId}
                aria-label={`Seat ${seatId}`}
              />
            );
          })}
          <span className="seat-row__label">{rowKey}</span>
        </div>
      ))}
      <div className="seat-legend">
        <span><i style={{ background: 'var(--premium)', border: '1px solid var(--premium)' }} /> Premium</span>
        <span><i style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid var(--executive)' }} /> Executive</span>
        <span><i style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }} /> Regular</span>
        <span><i style={{ background: 'var(--accent)' }} /> Selected</span>
        <span><i style={{ background: 'var(--text-dim)', opacity: 0.5 }} /> Unavailable</span>
      </div>
    </div>
  );
}
