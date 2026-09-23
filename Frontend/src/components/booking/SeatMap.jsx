import { useMemo } from 'react';
import { Sparkles, Eye, ShieldAlert, Award, Crown, Check } from 'lucide-react';
import { generateSeatIds, getSeatTier, getSeatPriceMultiplier } from '../../utils/seats';
import { formatCurrency } from '../../utils/format';

export default function SeatMap({
  rows = 8,
  cols = 12,
  screenType = '2D',
  screenName = 'Main Screen',
  theatreName = 'Cinema Hall',
  basePrice = 150,
  bookedSeats = [],
  lockedSeats = [],
  selected = [],
  onToggle,
  maxSeats = 10,
}) {
  const allSeats = useMemo(() => generateSeatIds(rows, cols), [rows, cols]);

  // Group seats by row letter
  const byRow = useMemo(() => {
    const map = {};
    allSeats.forEach((id) => {
      const row = id.match(/^([A-Z]+)/)?.[1] || 'A';
      if (!map[row]) map[row] = [];
      map[row].push(id);
    });
    return map;
  }, [allSeats]);

  const rowKeys = useMemo(() => Object.keys(byRow), [byRow]);

  // Group row keys into tiers
  const tierGroups = useMemo(() => {
    const groups = [
      {
        id: 'premium',
        name: 'VIP Recliner',
        icon: Crown,
        rows: [],
        multiplier: 1.4,
        color: 'var(--gold)',
      },
      {
        id: 'executive',
        name: 'Executive Prime',
        icon: Award,
        rows: [],
        multiplier: 1.15,
        color: 'var(--executive)',
      },
      {
        id: 'regular',
        name: 'Classic Regular',
        icon: Sparkles,
        rows: [],
        multiplier: 1.0,
        color: 'var(--regular)',
      },
    ];

    rowKeys.forEach((rowKey, rowIndex) => {
      const tier = getSeatTier(rowIndex, rowKeys.length);
      if (tier === 'premium') groups[0].rows.push(rowKey);
      else if (tier === 'executive') groups[1].rows.push(rowKey);
      else groups[2].rows.push(rowKey);
    });

    return groups.filter((g) => g.rows.length > 0);
  }, [rowKeys]);

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId) || lockedSeats.includes(seatId)) return;
    if (!selected.includes(seatId) && selected.length >= maxSeats) return;
    onToggle(seatId);
  };

  // Determine aisle split index (e.g. split in the middle)
  const aisleIndex = Math.floor(cols / 2);

  // Screen styling based on screenType
  const isImax = screenType?.toUpperCase().includes('IMAX');
  const is3D = screenType?.toUpperCase().includes('3D');

  const screenBadgeColor = isImax
    ? '#00e5ff'
    : is3D
    ? '#c084fc'
    : 'var(--gold)';

  const screenTitle = isImax
    ? 'IMAX® 4K LASER · 1.43:1 DUAL PROJECTION'
    : is3D
    ? 'RealD 3D CURVED SCREEN · DOLBY ATMOS 64-CH'
    : '4K DOLBY ATMOS · 70MM CURVED GIANT SCREEN';

  // Responsive screen curvature width (scales with column count)
  const screenWidthPercent = Math.min(94, Math.max(72, cols * 7));

  return (
    <div className="seat-map-wrap">
      {/* ================= CINEMA SCREEN VISUALIZATION ================= */}
      <div
        className="cinema-screen-container"
        style={{
          width: `${screenWidthPercent}%`,
          margin: '0 auto 2.5rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Projector Light Beam */}
        <div
          className="projector-beam"
          style={{
            height: '70px',
            background: `radial-gradient(ellipse at 50% 0%, ${
              isImax
                ? 'rgba(0, 229, 255, 0.22)'
                : is3D
                ? 'rgba(192, 132, 252, 0.22)'
                : 'rgba(212, 168, 83, 0.22)'
            } 0%, rgba(255,255,255,0.03) 60%, transparent 85%)`,
            marginBottom: '-12px',
            filter: 'blur(2px)',
          }}
        />

        {/* 3D Curved Screen Arc SVG */}
        <svg
          viewBox="0 0 600 60"
          className="curved-screen-svg"
          style={{
            width: '100%',
            height: '42px',
            filter: `drop-shadow(0 0 16px ${screenBadgeColor})`,
            display: 'block',
          }}
        >
          <defs>
            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="25%" stopColor={screenBadgeColor} />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="75%" stopColor={screenBadgeColor} />
              <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
            </linearGradient>
          </defs>
          <path
            d="M 15 48 Q 300 8 585 48"
            fill="none"
            stroke="url(#screenGrad)"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>

        {/* Screen Label & Specs */}
        <div style={{ marginTop: '0.5rem' }}>
          <span
            className="screen-type-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${screenBadgeColor}`,
              color: screenBadgeColor,
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={13} />
            {screenTitle}
          </span>
          <p
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
              letterSpacing: '0.12em',
              marginTop: '0.35rem',
              textTransform: 'uppercase',
            }}
          >
            ▼ All Eyes This Way · Screen ▼
          </p>
        </div>
      </div>

      {/* ================= SEATING TIERS & ROWS ================= */}
      <div className="seating-area" style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
        {tierGroups.map((group) => {
          const TierIcon = group.icon;
          const tierPrice = Math.round(basePrice * group.multiplier);

          return (
            <div key={group.id} className="seat-tier-section" style={{ marginBottom: '1.75rem' }}>
              {/* Tier Header Banner */}
              <div
                className="tier-header-banner"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderLeft: `3px solid ${group.color}`,
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TierIcon size={15} color={group.color} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: group.color }}>
                    {group.name}
                  </span>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                  {formatCurrency(tierPrice)}
                </span>
              </div>

              {/* Rows inside this Tier */}
              {group.rows.map((rowKey) => {
                const rowSeats = byRow[rowKey] || [];
                const leftWing = rowSeats.slice(0, aisleIndex);
                const rightWing = rowSeats.slice(aisleIndex);

                return (
                  <div key={rowKey} className="seat-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
                    {/* Left Row Label */}
                    <span className="seat-row__label" style={{ fontWeight: 700, minWidth: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      {rowKey}
                    </span>

                    {/* Left Wing */}
                    <div className="seat-wing" style={{ display: 'flex', gap: '0.35rem' }}>
                      {leftWing.map((seatId) => renderSeat(seatId, group.id))}
                    </div>

                    {/* Aisle Walkway */}
                    <div
                      className="seat-aisle-gap"
                      style={{
                        width: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.1)',
                        fontSize: '0.65rem',
                        userSelect: 'none',
                      }}
                    >
                      ·
                    </div>

                    {/* Right Wing */}
                    <div className="seat-wing" style={{ display: 'flex', gap: '0.35rem' }}>
                      {rightWing.map((seatId) => renderSeat(seatId, group.id))}
                    </div>

                    {/* Right Row Label */}
                    <span className="seat-row__label" style={{ fontWeight: 700, minWidth: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      {rowKey}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ================= LEGEND ================= */}
      <div className="seat-legend" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
        <span>
          <i style={{ background: 'rgba(212, 168, 83, 0.3)', border: '1px solid var(--gold)' }} /> VIP Recliner
        </span>
        <span>
          <i style={{ background: 'rgba(59, 130, 246, 0.25)', border: '1px solid var(--executive)' }} /> Executive Prime
        </span>
        <span>
          <i style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }} /> Classic Regular
        </span>
        <span>
          <i style={{ background: 'var(--accent)', border: '1px solid var(--accent)' }} /> Selected
        </span>
        <span>
          <i style={{ background: 'rgba(245, 158, 11, 0.35)', border: '1px solid var(--warning)' }} /> Holding
        </span>
        <span>
          <i style={{ background: 'var(--text-dim)', opacity: 0.35 }} /> Sold Out
        </span>
      </div>
    </div>
  );

  function renderSeat(seatId, tierId) {
    const isBooked = bookedSeats.includes(seatId);
    const isLocked = lockedSeats.includes(seatId);
    const isSelected = selected.includes(seatId);

    let className = `seat seat--${tierId}`;
    if (isBooked) className += ' seat--booked';
    else if (isLocked) className += ' seat--locked';
    else if (isSelected) className += ' seat--selected';

    return (
      <button
        key={seatId}
        type="button"
        className={className}
        onClick={() => handleSeatClick(seatId)}
        disabled={isBooked || isLocked}
        title={`Seat ${seatId} (${isBooked ? 'Sold' : isLocked ? 'Locked' : 'Available'})`}
        aria-label={`Seat ${seatId}`}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isSelected ? (
          <Check size={11} strokeWidth={3.5} />
        ) : (
          <span style={{ fontSize: '0.52rem', opacity: 0.85 }}>{seatId.replace(/^[A-Z]+/, '')}</span>
        )}
      </button>
    );
  }
}
