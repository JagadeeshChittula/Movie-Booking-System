const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateSeatIds(rows = 8, cols = 12) {
  const seats = [];
  for (let r = 0; r < rows; r++) {
    const row = ROW_LABELS[r] || `R${r + 1}`;
    for (let c = 1; c <= cols; c++) {
      seats.push(`${row}${c}`);
    }
  }
  return seats;
}

export function getSeatTier(rowIndex, totalRows) {
  // Front rows (closest to screen at top) = Budget Classic Regular
  if (rowIndex < Math.ceil(totalRows * 0.35)) return 'regular';
  // Middle rows (center sweet spot) = Executive Prime
  if (rowIndex < Math.ceil(totalRows * 0.75)) return 'executive';
  // Rear rows (furthest from screen, elevated balcony/recliners) = VIP Recliner
  return 'premium';
}

export function getSeatPriceMultiplier(tier) {
  if (tier === 'premium') return 1.45; // Rear VIP Recliner (Highest price)
  if (tier === 'executive') return 1.20; // Middle Executive Prime
  return 1.0; // Front Rows (Near screen, lowest price)
}

export function parseSeatRow(seatId) {
  const match = seatId.match(/^([A-Z]+)/);
  return match ? match[1] : '';
}

export function groupSeatsByRow(seatIds) {
  return seatIds.reduce((acc, id) => {
    const row = parseSeatRow(id);
    if (!acc[row]) acc[row] = [];
    acc[row].push(id);
    return acc;
  }, {});
}

/**
 * seats.movie 100% Cinema Sightline Scoring Engine
 * Evaluates screen coverage (FOV), neck angle tilt, center line lateral offset, and acoustics.
 */
export function calculateSeatScore(rowIndex, colIndex, totalRows, totalCols) {
  const distanceM = 4.0 + rowIndex * 1.15;
  const centerCol = (totalCols - 1) / 2;
  const colOffset = Math.abs(colIndex - centerCol);
  const maxColOffset = Math.max(1, totalCols / 2);

  // 1. Centering Score (0 - 100)
  const centeringScore = Math.max(20, Math.round(100 - (colOffset / maxColOffset) * 55));

  // 2. Neck Comfort Score (0 - 100)
  const viewerEyeHeightM = 1.2 + rowIndex * 0.32;
  const screenCenterM = 4.5;
  const heightDiff = screenCenterM - viewerEyeHeightM;
  const verticalTilt = Math.atan(Math.max(0, heightDiff) / distanceM) * (180 / Math.PI);
  let neckScore = 100;
  if (verticalTilt > 26) {
    neckScore = Math.max(30, Math.round(100 - (verticalTilt - 26) * 6.5));
  } else if (verticalTilt > 15) {
    neckScore = Math.round(100 - (verticalTilt - 15) * 2.2);
  }

  // 3. Screen Coverage / FOV Score (THX 36° - 48°)
  const fov = 2 * Math.atan(6.75 / distanceM) * (180 / Math.PI);
  let fovScore = 95;
  if (fov >= 35 && fov <= 50) fovScore = 100;
  else if (fov > 50) fovScore = Math.max(40, Math.round(100 - (fov - 50) * 3));
  else fovScore = Math.max(60, Math.round(100 - (35 - fov) * 2.5));

  // 4. Acoustic Sweet Spot Score
  const audioScore = Math.max(
    40,
    Math.round(100 - Math.abs(rowIndex - Math.floor(totalRows * 0.6)) * 8 - colOffset * 4)
  );

  return Math.min(
    100,
    Math.max(
      35,
      Math.round(
        centeringScore * 0.32 +
        neckScore * 0.28 +
        fovScore * 0.25 +
        audioScore * 0.15
      )
    )
  );
}

/**
 * seats.movie Best-Seat Group Finder
 * Finds the highest-scoring contiguous block of available seats in the optimum cinema sweet spot.
 */
export function findBestContiguousSeats(count, totalRows, totalCols, unavailableSeats = []) {
  let bestBlock = null;
  let bestAvgScore = -1;

  const idealRow = Math.floor(totalRows * 0.6);
  const rowOrder = [];
  for (let r = 0; r < totalRows; r++) {
    rowOrder.push(r);
  }
  // Sort rows radiating outward from the central sweet spot row
  rowOrder.sort((a, b) => Math.abs(a - idealRow) - Math.abs(b - idealRow));

  for (const r of rowOrder) {
    const rowLetter = ROW_LABELS[r] || `R${r + 1}`;
    for (let c = 1; c <= totalCols - count + 1; c++) {
      const block = [];
      let allAvailable = true;
      let totalScore = 0;

      for (let i = 0; i < count; i++) {
        const colNum = c + i;
        const seatId = `${rowLetter}${colNum}`;
        if (unavailableSeats.includes(seatId)) {
          allAvailable = false;
          break;
        }
        block.push(seatId);
        totalScore += calculateSeatScore(r, colNum - 1, totalRows, totalCols);
      }

      if (allAvailable && block.length === count) {
        const avg = totalScore / count;
        if (avg > bestAvgScore) {
          bestAvgScore = avg;
          bestBlock = block;
        }
      }
    }
    if (bestBlock && bestAvgScore >= 92) break;
  }

  return bestBlock;
}
