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
  if (rowIndex < Math.ceil(totalRows * 0.25)) return 'premium';
  if (rowIndex < Math.ceil(totalRows * 0.5)) return 'executive';
  return 'regular';
}

export function getSeatPriceMultiplier(tier) {
  if (tier === 'premium') return 1.4;
  if (tier === 'executive') return 1.15;
  return 1;
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
