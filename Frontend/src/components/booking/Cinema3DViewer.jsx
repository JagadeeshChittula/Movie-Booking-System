import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Eye,
  Box,
  Film,
  RotateCcw,
  Plus,
  Minus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { getSeatTier } from '../../utils/seats';

/**
 * Cinema3DViewer — Authentic seats.movie Cinema Experience
 * Features:
 * - First-Person 3D Seat POV with drag-to-look-around camera, tiered rows in front, and armrests
 * - Realistic 3D Auditorium Hall with curved stadium risers, cinema armchairs, cup holders, and aisles
 * - "Face the screen" auto-recenter button
 * - Circular SVG score meter (87/100)
 * - Three stat cards: TO SCREEN, FILLS VIEW, OFF-CENTRE
 * - "How is this worked out?" expandable accordion
 * - Top Seat/Hall view switcher & selected seat pills
 */
export default function Cinema3DViewer({
  rows = 10,
  cols = 14,
  screenType = '2D',
  basePrice = 250,
  bookedSeats = [],
  lockedSeats = [],
  selected = [],
  focusSeat = null,
  onToggle,
  movieTitle = 'Movie',
  moviePoster = '',
  theatreName = 'Cinema Complex',
  initialSubMode = 'seat_pov',
  isDocked = false,
  showFaceScreenBtn = true,
}) {
  const [viewSubMode, setViewSubMode] = useState(initialSubMode); // 'seat_pov' | 'hall'
  const [inspectedSeat, setInspectedSeat] = useState(null);
  const [yaw, setYaw] = useState(0); // horizontal pan (-65° to 65°)
  const [pitch, setPitch] = useState(0); // vertical tilt (-20° to 25°)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Hall overview orbital rotation & zoom
  const [hallPitch, setHallPitch] = useState(38);
  const [hallYaw, setHallYaw] = useState(0);
  const [hallZoom, setHallZoom] = useState(1);

  const rowLabels = useMemo(() => {
    const list = [];
    for (let r = 0; r < rows; r++) {
      list.push(String.fromCharCode(65 + r));
    }
    return list;
  }, [rows]);

  // Active seat: inspected seat, focusSeat, first selected, or center sweet-spot
  const activeSeatId =
    inspectedSeat ||
    focusSeat ||
    selected[0] ||
    `${rowLabels[Math.floor(rows * 0.6)]}${Math.ceil(cols / 2)}`;

  // Sync inspected seat if focusSeat changes
  useEffect(() => {
    if (focusSeat) setInspectedSeat(focusSeat);
  }, [focusSeat]);

  // Reset yaw and pitch when switching active seats
  useEffect(() => {
    setYaw(0);
    setPitch(0);
  }, [activeSeatId]);

  // ================= SIGHTLINE & METRICS (seats.movie) =================
  const metrics = useMemo(() => {
    const match = activeSeatId.match(/^([A-Z]+)(\d+)$/);
    const rowLetter = match ? match[1] : 'E';
    const seatNum = match ? parseInt(match[2], 10) : Math.ceil(cols / 2);
    const rowIndex = Math.max(0, rowLabels.indexOf(rowLetter)); // 0 = Row A (front)
    const colIndex = seatNum - 1;

    // Physical distance: Row A is ~4.0m from screen, each row adds ~1.15m
    const distanceM = Math.round(4.0 + rowIndex * 1.15);

    // Center offset
    const centerCol = (cols - 1) / 2;
    const colOffset = colIndex - centerCol;
    const lateralDistanceM = Math.abs(colOffset) * 0.65;

    // Fills View / Horizontal FOV occupied by screen (~14m wide)
    const screenWidthM = screenType.includes('IMAX') ? 18.0 : 14.0;
    const fillsView = Math.round(
      2 * Math.atan((screenWidthM / 2) / Math.max(3, distanceM)) * (180 / Math.PI)
    );

    // Off-centre angle in degrees
    const offCentreDeg = Math.round(
      Math.atan(lateralDistanceM / Math.max(3, distanceM)) * (180 / Math.PI)
    );

    // Vertical neck incline
    const viewerEyeHeightM = 1.2 + rowIndex * 0.32;
    const screenCenterM = screenType.includes('IMAX') ? 5.8 : 4.4;
    const heightDiff = screenCenterM - viewerEyeHeightM;
    const neckTiltDeg = Math.round(
      Math.atan(Math.max(0, heightDiff) / Math.max(3, distanceM)) * (180 / Math.PI)
    );

    // Tier
    const tier = getSeatTier(rowIndex, rows);
    const multiplier = tier === 'premium' ? 1.45 : tier === 'executive' ? 1.2 : 1.0;
    const price = Math.round(basePrice * multiplier);
    const tierName =
      tier === 'premium' ? 'BALCONY / RECLINER' : tier === 'executive' ? 'EXECUTIVE' : 'REGULAR';

    // seats.movie 0-100 Score
    const centeringScore = Math.max(25, 100 - offCentreDeg * 3.8);
    let neckScore = 100;
    if (neckTiltDeg > 24) neckScore = Math.max(30, 100 - (neckTiltDeg - 24) * 6);
    else if (neckTiltDeg > 14) neckScore = 100 - (neckTiltDeg - 14) * 2.5;

    let fovScore = 95;
    if (fillsView >= 36 && fillsView <= 52) fovScore = 100;
    else if (fillsView > 52) fovScore = Math.max(40, 100 - (fillsView - 52) * 3);
    else fovScore = Math.max(60, 100 - (36 - fillsView) * 2.5);

    const score = Math.min(
      99,
      Math.max(
        42,
        Math.round(centeringScore * 0.35 + neckScore * 0.35 + fovScore * 0.30)
      )
    );

    let verdict = 'Great view';
    let subtitle = 'Comfortable view with balanced sound';
    let circleColor = '#22c55e'; // green

    if (score >= 92) {
      verdict = 'Optimum sweet spot';
      subtitle = 'Flawless viewing angle and acoustic balance';
      circleColor = '#22c55e';
    } else if (score >= 82) {
      verdict = 'Great view';
      subtitle = 'Comfortable view with good sightlines';
      circleColor = '#22c55e';
    } else if (score >= 70) {
      verdict = 'Good view';
      subtitle = 'Solid viewing angle, slight side offset';
      circleColor = '#eab308';
    } else if (rowIndex < 2) {
      verdict = 'Close to screen';
      subtitle = 'Screen towers over view, requires upward neck tilt';
      circleColor = '#f97316';
    } else {
      verdict = 'Side angle view';
      subtitle = 'Off-axis angle to screen, easy aisle access';
      circleColor = '#eab308';
    }

    return {
      seatId: activeSeatId,
      rowIndex,
      colIndex,
      rowLetter,
      seatNum,
      distanceM,
      fillsView,
      offCentreDeg,
      neckTiltDeg,
      tier,
      tierName,
      price,
      score,
      verdict,
      subtitle,
      circleColor,
    };
  }, [activeSeatId, rows, cols, rowLabels, screenType, basePrice]);

  // Mouse / Touch drag controls
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setDragStart({ x: e.clientX, y: e.clientY });

      if (viewSubMode === 'seat_pov') {
        setYaw((prev) => Math.max(-65, Math.min(65, prev - dx * 0.35)));
        setPitch((prev) => Math.max(-20, Math.min(25, prev - dy * 0.25)));
      } else {
        setHallYaw((prev) => Math.max(-45, Math.min(45, prev + dx * 0.4)));
        setHallPitch((prev) => Math.max(15, Math.min(60, prev - dy * 0.3)));
      }
    },
    [isDragging, dragStart, viewSubMode]
  );

  const handleMouseUp = () => setIsDragging(false);

  // Touch support for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });

    if (viewSubMode === 'seat_pov') {
      setYaw((prev) => Math.max(-65, Math.min(65, prev - dx * 0.45)));
      setPitch((prev) => Math.max(-20, Math.min(25, prev - dy * 0.3)));
    } else {
      setHallYaw((prev) => Math.max(-45, Math.min(45, prev + dx * 0.45)));
      setHallPitch((prev) => Math.max(15, Math.min(60, prev - dy * 0.35)));
    }
  };

  // Recenter button
  const handleFaceScreen = () => {
    setYaw(0);
    setPitch(0);
  };

  const handleResetHall = () => {
    setHallPitch(38);
    setHallYaw(0);
    setHallZoom(1);
  };

  // Determine if viewer is currently turned away from screen
  const isTurnedAway = Math.abs(yaw) > 12 || Math.abs(pitch) > 8;

  // Selected seat pills for top-right switcher
  const seatPills = useMemo(() => {
    if (selected.length > 0) return selected;
    return [metrics.seatId];
  }, [selected, metrics.seatId]);

  // Physical screen perspective scaling based on row distance
  const screenScale = Math.max(0.68, Math.min(1.45, 1.4 - metrics.rowIndex * 0.08));
  const lateralScreenAngle = ((metrics.colIndex - (cols - 1) / 2) / (cols / 2)) * 16;
  const posterSrc =
    moviePoster ||
    'https://m.media-amazon.com/images/M/MV5BNTBmZGE5Y2UtYzcxNi00NjlmLWIwNjctYWM2MmU4YmFmODk5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg';

  // Number of tiered rows to render IN FRONT of the viewer
  const frontRowsCount = Math.min(metrics.rowIndex, 4);

  return (
    <div
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#090a10',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)',
        userSelect: 'none',
      }}
    >
      {/* ================= 3D VIEWPORT CANVAS ================= */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{
          position: 'relative',
          width: '100%',
          height: isDocked ? '380px' : 'min(580px, 68vh)',
          background: 'radial-gradient(ellipse at 50% 60%, #17090c 0%, #080305 75%, #020102 100%)',
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Top Controls: Switcher (Seat/Hall) + Seat Pills */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            right: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 35,
            pointerEvents: 'none',
          }}
        >
          {/* View Switcher: Seat vs Hall */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(20, 22, 32, 0.88)',
              padding: '3px',
              borderRadius: '24px',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              pointerEvents: 'auto',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewSubMode('seat_pov')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                border: 'none',
                background: viewSubMode === 'seat_pov' ? '#ffffff' : 'transparent',
                color: viewSubMode === 'seat_pov' ? '#0f172a' : '#cbd5e1',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <Eye size={15} />
              👁️ Seat POV
            </button>
            <button
              type="button"
              onClick={() => setViewSubMode('hall')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                border: 'none',
                background: viewSubMode === 'hall' ? '#ffffff' : 'transparent',
                color: viewSubMode === 'hall' ? '#0f172a' : '#cbd5e1',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <Box size={15} />
              🧊 3D Hall
            </button>
          </div>

          {/* Selected Seat Quick Switcher Pills (seats.movie top-right) */}
          <div style={{ display: 'flex', gap: '0.4rem', pointerEvents: 'auto', flexWrap: 'wrap' }}>
            {seatPills.map((sId) => {
              const isActive = sId === metrics.seatId;
              return (
                <button
                  key={sId}
                  type="button"
                  onClick={() => setInspectedSeat(sId)}
                  style={{
                    padding: '0.4rem 0.95rem',
                    borderRadius: '20px',
                    border: isActive ? '1px solid #ff4d52' : '1px solid rgba(255,255,255,0.15)',
                    background: isActive ? '#ef4444' : 'rgba(20, 22, 34, 0.85)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 16px rgba(239, 68, 68, 0.6)' : 'none',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.18s ease',
                  }}
                >
                  Seat {sId}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------- MODE 1: FIRST-PERSON SEAT POV ---------------- */}
        {viewSubMode === 'seat_pov' ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              perspective: 1000,
              perspectiveOrigin: '50% 50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* The 3D Camera Container that pans on drag */}
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                inset: 0,
                transformStyle: 'preserve-3d',
                transform: `rotateY(${-yaw}deg) rotateX(${pitch}deg)`,
                transition: isDragging ? 'none' : 'transform 0.25s ease-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Left Acoustic Wall with Glowing Green EXIT Sign */}
              <div
                style={{
                  position: 'absolute',
                  left: '-48%',
                  top: '-30%',
                  bottom: '-30%',
                  width: '52%',
                  background: 'linear-gradient(90deg, #18080a 0%, #1f0c0f 50%, #0e0507 100%)',
                  transform: 'rotateY(75deg) translateZ(120px)',
                  boxShadow: 'inset 0 0 50px rgba(0,0,0,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Vertical Acoustic Wood Slats */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(0,0,0,0.55) 18px, rgba(0,0,0,0.55) 24px)',
                    opacity: 0.85,
                  }}
                />

                {/* Glowing Green EXIT Sign */}
                <div
                  style={{
                    background: '#042f2e',
                    border: '1px solid #14b8a6',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    boxShadow: '0 0 20px rgba(20, 184, 166, 0.75)',
                    transform: 'translateZ(10px)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      color: '#2dd4bf',
                      letterSpacing: 2,
                    }}
                  >
                    EXIT
                  </span>
                </div>
              </div>

              {/* Right Acoustic Wall */}
              <div
                style={{
                  position: 'absolute',
                  right: '-48%',
                  top: '-30%',
                  bottom: '-30%',
                  width: '52%',
                  background: 'linear-gradient(270deg, #18080a 0%, #1f0c0f 50%, #0e0507 100%)',
                  transform: 'rotateY(-75deg) translateZ(120px)',
                  boxShadow: 'inset 0 0 50px rgba(0,0,0,0.85)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(0,0,0,0.55) 18px, rgba(0,0,0,0.55) 24px)',
                    opacity: 0.85,
                  }}
                />
              </div>

              {/* Cinema Giant Curved Screen */}
              <div
                style={{
                  width: 'min(92%, 620px)',
                  aspectRatio: '16 / 8.2',
                  background: '#0a0305',
                  borderRadius: '8px 8px 24px 24px',
                  boxShadow:
                    '0 0 80px rgba(229, 9, 20, 0.38), 0 0 40px rgba(255, 255, 255, 0.18)',
                  transform: `scale(${screenScale}) rotateY(${-lateralScreenAngle}deg) translateZ(40px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '2px solid rgba(255,255,255,0.75)',
                }}
              >
                {/* Left Half: Movie Poster */}
                <div
                  style={{
                    width: '42%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={posterSrc}
                    alt={movieTitle}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(90deg, transparent 70%, rgba(10, 3, 5, 0.95) 100%)',
                    }}
                  />
                </div>

                {/* Right Half: Theatrical Title & Ambient Glow */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background:
                      'radial-gradient(ellipse at 50% 50%, rgba(220, 38, 38, 0.45) 0%, rgba(10, 3, 5, 0.96) 80%)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 900,
                      letterSpacing: 3,
                      color: 'rgba(255,255,255,0.75)',
                      textTransform: 'uppercase',
                    }}
                  >
                    NOW SHOWING · {theatreName}
                  </span>
                  <h3
                    style={{
                      color: '#ffffff',
                      fontSize: 'clamp(1.1rem, 2.5vw, 1.55rem)',
                      fontWeight: 900,
                      margin: '0.4rem 0',
                      letterSpacing: -0.5,
                      textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                    }}
                  >
                    {movieTitle}
                  </h3>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'rgba(255,255,255,0.12)',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#f87171',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                    }}
                  >
                    <span>{screenType}</span>
                    <span>·</span>
                    <span>DOLBY ATMOS 7.1</span>
                  </div>
                </div>

                {/* Bottom Screen Stage Lighting Glow Runner */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background:
                      'linear-gradient(90deg, #3b82f6 0%, #ef4444 50%, #3b82f6 100%)',
                    boxShadow: '0 0 15px #ef4444',
                  }}
                />
              </div>

              {/* Realistic Tiered Cinema Chairs in Front of Viewer (Sloping Downwards) */}
              {frontRowsCount > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -25,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    pointerEvents: 'none',
                    zIndex: 20,
                  }}
                >
                  {/* Immediate front row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '14px',
                      transform: 'translateZ(140px)',
                    }}
                  >
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '68px',
                          height: '92px',
                          background: 'linear-gradient(180deg, #6b141c 0%, #3d080e 60%, #1a0305 100%)',
                          borderRadius: '12px 12px 4px 4px',
                          boxShadow:
                            '0 8px 20px rgba(0,0,0,0.95), inset 0 2px 4px rgba(255,255,255,0.15)',
                          borderTop: '2px solid rgba(255, 120, 120, 0.3)',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        {/* Headrest top cushion */}
                        <div
                          style={{
                            width: '56px',
                            height: '26px',
                            background: 'linear-gradient(180deg, #831b25 0%, #500c13 100%)',
                            borderRadius: '9px 9px 4px 4px',
                            marginTop: 4,
                            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)',
                          }}
                        />
                        {/* Molded Armrest separator with cup holder */}
                        <div
                          style={{
                            position: 'absolute',
                            right: -7,
                            bottom: 0,
                            width: '8px',
                            height: '46px',
                            background: '#150406',
                            borderRadius: '3px',
                            boxShadow: 'inset 0 0 3px rgba(0,0,0,0.8)',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Armrests on Viewer's Current Seat (Left & Right with Cup Holder) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -10,
                  left: '6%',
                  width: '32px',
                  height: '80px',
                  background: 'linear-gradient(180deg, #220608 0%, #0d0203 100%)',
                  borderRadius: '8px 8px 0 0',
                  borderTop: '3px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 0 25px rgba(0,0,0,0.9)',
                  transform: 'translateZ(220px)',
                  zIndex: 25,
                }}
              >
                {/* Cup holder ring */}
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 4,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#050102',
                    border: '2px solid #333',
                  }}
                />
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: -10,
                  right: '6%',
                  width: '32px',
                  height: '80px',
                  background: 'linear-gradient(180deg, #220608 0%, #0d0203 100%)',
                  borderRadius: '8px 8px 0 0',
                  borderTop: '3px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 0 25px rgba(0,0,0,0.9)',
                  transform: 'translateZ(220px)',
                  zIndex: 25,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 4,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#050102',
                    border: '2px solid #333',
                  }}
                />
              </div>
            </div>

            {/* "Face the screen" floating pill button (seats.movie feature) */}
            {isTurnedAway && showFaceScreenBtn && (
              <button
                type="button"
                onClick={handleFaceScreen}
                style={{
                  position: 'absolute',
                  bottom: 38,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#ffffff',
                  color: '#0f172a',
                  padding: '0.6rem 1.35rem',
                  borderRadius: '24px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  border: 'none',
                  boxShadow: '0 10px 28px rgba(0,0,0,0.65)',
                  cursor: 'pointer',
                  zIndex: 35,
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                <Film size={15} />
                Face the screen
              </button>
            )}

            {/* Bottom helper text */}
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                fontSize: '0.76rem',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                textAlign: 'center',
                zIndex: 25,
                textShadow: '0 1px 4px rgba(0,0,0,0.85)',
              }}
            >
              First-Person POV from Seat {metrics.seatId} · Drag to look around
            </div>
          </div>
        ) : (
          /* ---------------- MODE 2: 3D AUDITORIUM HALL (REALISTIC STADIUM CURVATURE) ---------------- */
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              perspective: 1200,
              perspectiveOrigin: '50% 20%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* 3D Auditorium Rotatable Rig */}
            <div
              style={{
                width: '95%',
                height: '92%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: `rotateX(${hallPitch}deg) rotateY(${hallYaw}deg) scale(${hallZoom})`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Grand Curved Cinema Screen at Front Stage */}
              <div
                style={{
                  width: 'min(82%, 520px)',
                  height: 64,
                  background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 70%, #94a3b8 100%)',
                  borderRadius: '6px 6px 30px 30px',
                  boxShadow:
                    '0 0 50px rgba(255,255,255,0.45), 0 18px 40px rgba(229,9,20,0.4)',
                  transform: 'translateZ(30px) rotateX(-8deg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  textAlign: 'center',
                  padding: '0.4rem',
                  border: '2px solid rgba(255,255,255,0.9)',
                  marginBottom: '26px',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: 2, color: '#ef4444' }}>
                  ▲ CURVED CINEMA SCREEN (FRONT) ▲
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                  {movieTitle}
                </div>
              </div>

              {/* Realistic Curved Stadium Risers Seating Terrace */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '7px',
                  transformStyle: 'preserve-3d',
                  paddingBottom: '24px',
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                {rowLabels.map((rowLetter, rIdx) => {
                  const tier = getSeatTier(rIdx, rows);
                  const tierColor =
                    tier === 'premium' ? '#d4a853' : tier === 'executive' ? '#a855f7' : '#94a3b8';
                  
                  // Tiered Stadium Elevation: Higher rows are stepped up and back
                  const elevationZ = rIdx * 14;
                  const elevationY = rIdx * 7;

                  return (
                    <div
                      key={rowLetter}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        transform: `translateZ(${elevationZ}px) translateY(${elevationY}px)`,
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Left Row Indicator */}
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: tierColor,
                          minWidth: 16,
                          textAlign: 'center',
                        }}
                      >
                        {rowLetter}
                      </span>

                      {/* Seats in this Row with Arc Curvature */}
                      {Array.from({ length: cols }, (_, cIdx) => {
                        const seatId = `${rowLetter}${cIdx + 1}`;
                        const isBooked = bookedSeats.includes(seatId);
                        const isLocked = lockedSeats.includes(seatId);
                        const isSelected = selected.includes(seatId);
                        const isTarget = activeSeatId === seatId;
                        
                        // Center aisle split
                        const centerCol = (cols - 1) / 2;
                        const isCenterAisle = cIdx === Math.floor(cols / 2) - 1;
                        
                        // Radial amphitheatre arc curve: angle towards screen center
                        const colOffset = cIdx - centerCol;
                        const arcAngle = (colOffset / (cols / 2)) * 12; // -12 deg on left to +12 deg on right

                        // 3D Cinema Armchair Styling
                        let chairColor = '#500e14';
                        let headrestColor = '#6b141c';
                        let border = '1px solid rgba(255, 100, 100, 0.3)';

                        if (isBooked) {
                          chairColor = '#1f202b';
                          headrestColor = '#2b2d3c';
                          border = '1px solid #37394c';
                        } else if (isLocked) {
                          chairColor = '#7f1d1d';
                          headrestColor = '#991b1b';
                          border = '1px solid #ef4444';
                        } else if (isSelected) {
                          chairColor = '#dc2626';
                          headrestColor = '#ef4444';
                          border = '2px solid #ffffff';
                        } else if (tier === 'premium') {
                          chairColor = '#581c87';
                          headrestColor = '#6b21a8';
                          border = '1px solid #c084fc';
                        } else if (tier === 'executive') {
                          chairColor = '#701a24';
                          headrestColor = '#881337';
                          border = '1px solid rgba(251, 113, 133, 0.4)';
                        }

                        return (
                          <div
                            key={seatId}
                            style={{
                              display: 'inline-flex',
                              marginRight: isCenterAisle ? '22px' : '0',
                              transform: `rotateY(${arcAngle}deg)`,
                              transformStyle: 'preserve-3d',
                            }}
                          >
                            <button
                              type="button"
                              disabled={isBooked || isLocked}
                              title={`Seat ${seatId} (${tier.toUpperCase()}) — Click to Select / Inspect POV`}
                              onClick={() => {
                                setInspectedSeat(seatId);
                                if (!isBooked && !isLocked && onToggle) onToggle(seatId);
                              }}
                              style={{
                                width: 'clamp(20px, 2.4vw, 27px)',
                                height: '26px',
                                borderRadius: '5px 5px 2px 2px',
                                background: chairColor,
                                border,
                                cursor: isBooked || isLocked ? 'not-allowed' : 'pointer',
                                color: isSelected ? '#ffffff' : isBooked ? '#555' : 'rgba(255,255,255,0.9)',
                                fontSize: '0.58rem',
                                fontWeight: 800,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transform: isTarget ? 'scale(1.28) translateZ(14px)' : 'scale(1)',
                                boxShadow: isTarget
                                  ? '0 0 18px rgba(239, 68, 68, 1), 0 0 6px #fff'
                                  : isSelected
                                  ? '0 0 14px rgba(239, 68, 68, 0.8)'
                                  : '0 2px 6px rgba(0,0,0,0.6)',
                                transition: 'all 0.16s ease',
                                outline: 'none',
                                padding: '2px 0',
                                position: 'relative',
                              }}
                            >
                              {/* Armchair Headrest Pill */}
                              <div
                                style={{
                                  width: '75%',
                                  height: '7px',
                                  borderRadius: '3px',
                                  background: headrestColor,
                                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.25)',
                                }}
                              />

                              {/* Seat Number */}
                              <span style={{ lineHeight: 1, marginTop: 1 }}>{cIdx + 1}</span>

                              {/* Floating Marker on Selected / Inspected Seat */}
                              {isTarget && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: -24,
                                    background: '#ef4444',
                                    color: '#fff',
                                    padding: '1px 5px',
                                    borderRadius: '6px',
                                    fontSize: '0.55rem',
                                    fontWeight: 900,
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
                                    pointerEvents: 'none',
                                    animation: 'bounce 1s infinite alternate',
                                  }}
                                >
                                  ★ {seatId}
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}

                      {/* Right Row Indicator */}
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: tierColor,
                          minWidth: 16,
                          textAlign: 'center',
                        }}
                      >
                        {rowLetter}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hall Bottom Floating Controls: Zoom & Reset */}
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                left: 14,
                display: 'flex',
                gap: '0.45rem',
                zIndex: 35,
              }}
            >
              <button
                type="button"
                onClick={handleResetHall}
                className="btn btn--secondary btn--sm"
                title="Reset Camera Angle"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', gap: 4 }}
              >
                <RotateCcw size={13} /> Reset View
              </button>
              <button
                type="button"
                onClick={() => setHallZoom((z) => Math.min(1.4, z + 0.1))}
                className="btn btn--secondary btn--sm"
                title="Zoom In"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                onClick={() => setHallZoom((z) => Math.max(0.75, z - 0.1))}
                className="btn btn--secondary btn--sm"
                title="Zoom Out"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                <Minus size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewSubMode('seat_pov')}
                className="btn btn--primary btn--sm"
                title="Sit in active seat"
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem', gap: 4 }}
              >
                <Eye size={13} /> Sit in {metrics.seatId}
              </button>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 14,
                right: 14,
                fontSize: '0.74rem',
                color: 'rgba(255,255,255,0.65)',
                fontWeight: 600,
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              }}
            >
              Drag to orbit the 3D theatre · Click any seat to inspect
            </div>
          </div>
        )}
      </div>

      {/* ================= SEATS.MOVIE METRICS CARD (EXACT REPLICA) ================= */}
      <div style={{ padding: '1.5rem', background: '#ffffff', color: '#111827' }}>
        {/* Top Row: Circular Score Meter + Seat Name + Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Circular Progress Gauge (seats.movie exact look) */}
            <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
              <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Track */}
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  stroke="#e5e7eb"
                  strokeWidth="4.5"
                  fill="transparent"
                />
                {/* Colored Progress Ring */}
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  stroke={metrics.circleColor}
                  strokeWidth="4.5"
                  strokeDasharray="144.5"
                  strokeDashoffset={144.5 - (144.5 * metrics.score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#111827' }}>
                  {metrics.score}
                </span>
                <span style={{ fontSize: '0.55rem', color: '#6b7280', fontWeight: 600 }}>
                  /100
                </span>
              </div>
            </div>

            {/* Seat Title & Tier */}
            <div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                YOUR SEAT
              </div>
              <div
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: '#111827',
                  letterSpacing: -0.5,
                }}
              >
                {metrics.seatId}
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#6b7280',
                  letterSpacing: 0.5,
                  marginTop: 2,
                }}
              >
                {metrics.tierName} · {formatCurrency(metrics.price)}
              </div>
            </div>
          </div>

          {/* Verdict and Subtitle */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '1.3rem',
                fontWeight: 900,
                color: metrics.circleColor,
                letterSpacing: -0.3,
              }}
            >
              {metrics.verdict}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 2 }}>
              {metrics.subtitle}
            </div>
          </div>
        </div>

        {/* 3 Metric Stat Cards: TO SCREEN, FILLS VIEW, OFF-CENTRE */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
            marginTop: '1.25rem',
          }}
        >
          {/* Stat 1: TO SCREEN */}
          <div
            style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
            }}
          >
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#6b7280',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              TO SCREEN
            </div>
            <div
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                color: '#111827',
                marginTop: '0.2rem',
              }}
            >
              ≈{metrics.distanceM} m
            </div>
          </div>

          {/* Stat 2: FILLS VIEW */}
          <div
            style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
            }}
          >
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#6b7280',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              FILLS VIEW
            </div>
            <div
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                color: '#111827',
                marginTop: '0.2rem',
              }}
            >
              {metrics.fillsView}°
            </div>
          </div>

          {/* Stat 3: OFF-CENTRE */}
          <div
            style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
            }}
          >
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#6b7280',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              OFF-CENTRE
            </div>
            <div
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                color: '#111827',
                marginTop: '0.2rem',
              }}
            >
              {metrics.offCentreDeg}°
            </div>
          </div>
        </div>

        {/* Expandable "How is this worked out?" Accordion */}
        <div
          style={{
            marginTop: '1.25rem',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '0.85rem',
          }}
        >
          <button
            type="button"
            onClick={() => setShowHowItWorks((v) => !v)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'transparent',
              border: 'none',
              color: '#374151',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '0.35rem 0',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Info size={16} color="#6b7280" />
              How is this worked out?
            </span>
            {showHowItWorks ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showHowItWorks && (
            <div
              style={{
                marginTop: '0.75rem',
                fontSize: '0.82rem',
                lineHeight: 1.6,
                color: '#4b5563',
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            >
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>seats.movie & THX Cinema Standards:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Field of view (fills view):</strong> THX recommends a 36° to 54°
                  horizontal coverage for the most immersive experience without peripheral strain.
                </li>
                <li>
                  <strong>Off-centre angle:</strong> Minimizes keystoning and speaker delay from
                  surround channels. 0° to 10° is the acoustic prime zone.
                </li>
                <li>
                  <strong>Neck comfort:</strong> SMPTE recommends a vertical viewing angle of
                  under 15° to avoid neck fatigue during feature films.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
