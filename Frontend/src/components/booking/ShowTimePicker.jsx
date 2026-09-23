import { formatTime, formatCurrency } from '../../utils/format';

export default function ShowTimePicker({
  shows,
  selectedDate,
  onDateChange,
  selectedShow,
  onShowSelect,
}) {
  const dates = [...new Set(shows.map((s) => new Date(s.showDate).toDateString()))].sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const filtered = shows.filter(
    (s) => new Date(s.showDate).toDateString() === selectedDate
  );

  const byTheatre = filtered.reduce((acc, show) => {
    const tid = show.theatre?._id || show.theatre;
    if (!acc[tid]) {
      acc[tid] = { theatre: show.theatre, shows: [] };
    }
    acc[tid].shows.push(show);
    return acc;
  }, {});

  return (
    <div className="show-picker">
      <div className="date-tabs">
        {dates.map((d) => {
          const date = new Date(d);
          const isActive = d === selectedDate;
          return (
            <button
              key={d}
              type="button"
              className={`date-tab ${isActive ? 'active' : ''}`}
              onClick={() => onDateChange(d)}
            >
              <div className="date-tab__day">
                {date.toLocaleDateString('en-IN', { weekday: 'short' })}
              </div>
              <div className="date-tab__num">{date.getDate()}</div>
            </button>
          );
        })}
      </div>

      {Object.values(byTheatre).length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No shows on this date. Try another day.</p>
      ) : (
        Object.values(byTheatre).map(({ theatre, shows: theatreShows }) => (
          <div key={theatre?._id || theatre?.name} className="theatre-block">
            <h3>{theatre?.name}</h3>
            <p>{theatre?.address} · {theatre?.city}</p>
            <div className="show-times">
              {theatreShows.map((show) => {
                const soldOut =
                  show.screen?.totalSeats &&
                  show.bookedSeats?.length >= show.screen.totalSeats;
                return (
                  <button
                    key={show._id}
                    type="button"
                    className={`show-time-btn ${selectedShow?._id === show._id ? 'active' : ''}`}
                    onClick={() => onShowSelect(show)}
                    disabled={soldOut}
                  >
                    {formatTime(show.startTime)} · {formatCurrency(show.ticketPrice)}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
