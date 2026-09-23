import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Film,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  Ticket,
  ChevronRight,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { movieApi, showApi, theatreApi } from '../api/services';
import MovieCard from '../components/movie/MovieCard';
import TrailerModal from '../components/movie/TrailerModal';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import { getCity, setCity } from '../utils/storage';
import { formatTime } from '../utils/format';

export default function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCity, setCurrentCity] = useState(getCity);
  const [trailer, setTrailer] = useState(null);
  const [genre, setGenre] = useState('all');
  const [language, setLanguage] = useState('all');
  const [sort, setSort] = useState('rating');
  const [showAllCatalog, setShowAllCatalog] = useState(false);
  const [theatreDate, setTheatreDate] = useState('all');

  const activeTab = searchParams.get('tab') === 'theatres' ? 'theatres' : 'movies';
  const query = searchParams.get('q')?.toLowerCase() || '';

  useEffect(() => {
    const handleCityChange = (e) => setCurrentCity(e.detail);
    window.addEventListener('citychange', handleCityChange);
    return () => window.removeEventListener('citychange', handleCityChange);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([movieApi.getAll(), showApi.getAll(), theatreApi.getAll()])
      .then(([movieRes, showRes, theatreRes]) => {
        setMovies(movieRes.data.movies?.filter((m) => m.isActive !== false) || []);
        setShows(showRes.data.shows?.filter((s) => s.isActive !== false) || []);
        setTheatres(theatreRes.data.theatres?.filter((t) => t.isActive !== false) || []);
      })
      .catch(() => {
        setMovies([]);
        setShows([]);
        setTheatres([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTabChange = (tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'theatres') next.set('tab', 'theatres');
    else next.delete('tab');
    setSearchParams(next);
  };

  // City-filtered theatres
  const cityTheatres = useMemo(() => {
    return theatres.filter(
      (t) => t.city?.toLowerCase().trim() === currentCity.toLowerCase().trim()
    );
  }, [theatres, currentCity]);

  // Shows playing in the current city
  const cityShows = useMemo(() => {
    return shows.filter(
      (s) =>
        s.theatre?.city?.toLowerCase().trim() === currentCity.toLowerCase().trim()
    );
  }, [shows, currentCity]);

  // Unique available show dates for city shows
  const theatreDateOptions = useMemo(() => {
    const map = new Map();
    cityShows.forEach((s) => {
      if (!s.showDate) return;
      const d = new Date(s.showDate);
      const key = d.toDateString();
      if (!map.has(key)) {
        map.set(key, d);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([dateStr, dateObj]) => ({ dateStr, dateObj }));
  }, [cityShows]);

  // Shows filtered by selected theatre date
  const filteredCityShowsForTheatres = useMemo(() => {
    if (theatreDate === 'all') return cityShows;
    return cityShows.filter(
      (s) => s.showDate && new Date(s.showDate).toDateString() === theatreDate
    );
  }, [cityShows, theatreDate]);

  // Movie IDs that have active shows in the current city
  const movieIdsInCity = useMemo(() => {
    const set = new Set();
    cityShows.forEach((s) => {
      const mid = s.movie?._id || s.movie;
      if (mid) set.add(String(mid));
    });
    return set;
  }, [cityShows]);

  // Group shows by theatre for the Theatres view
  const theatreShowMap = useMemo(() => {
    const map = {};
    filteredCityShowsForTheatres.forEach((s) => {
      const tid = String(s.theatre?._id || s.theatre);
      if (!map[tid]) map[tid] = [];
      map[tid].push(s);
    });
    return map;
  }, [filteredCityShowsForTheatres]);

  // Filtered movies according to city & filter controls
  const filteredMovies = useMemo(() => {
    let list = [...movies];

    // Filter by current city unless user toggled showAllCatalog
    if (!showAllCatalog && movieIdsInCity.size > 0) {
      list = list.filter((m) => movieIdsInCity.has(String(m._id)));
    }

    if (query) {
      list = list.filter(
        (m) =>
          m.title?.toLowerCase().includes(query) ||
          m.genre?.some((g) => g.toLowerCase().includes(query))
      );
    }

    if (genre !== 'all') list = list.filter((m) => m.genre?.includes(genre));
    if (language !== 'all') list = list.filter((m) => m.language === language);
    if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === 'newest') list.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));

    return list;
  }, [movies, movieIdsInCity, showAllCatalog, query, genre, language, sort]);

  const genres = useMemo(() => {
    const set = new Set();
    movies.forEach((m) => m.genre?.forEach((g) => set.add(g)));
    return ['all', ...Array.from(set)];
  }, [movies]);

  const languages = useMemo(() => {
    const set = new Set(movies.map((m) => m.language).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [movies]);

  if (loading) return <Loader fullPage />;

  return (
    <div className="container">
      {/* Header & City Switcher */}
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <MapPin size={20} color="var(--accent)" />
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent)' }}>
              Location: {currentCity}
            </span>
          </div>
          <h1>
            {activeTab === 'movies' ? `Movies in ${currentCity}` : `Theatres in ${currentCity}`}
          </h1>
          <p>
            {activeTab === 'movies'
              ? `${filteredMovies.length} movies currently ${showAllCatalog ? 'in total catalog' : `running in ${currentCity}`}`
              : `${cityTheatres.length} cinemas and multiplexes available in ${currentCity}`}
          </p>
        </div>

        {/* Tab Switcher: Movies vs Theatres */}
        <div className="segmented-control" style={{ display: 'inline-flex', background: 'var(--bg-elevated)', padding: 4, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <button
            type="button"
            className={`btn btn--sm ${activeTab === 'movies' ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => handleTabChange('movies')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Film size={16} />
            Movies ({movieIdsInCity.size > 0 ? movieIdsInCity.size : movies.length})
          </button>
          <button
            type="button"
            className={`btn btn--sm ${activeTab === 'theatres' ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => handleTabChange('theatres')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Building2 size={16} />
            Theatres ({cityTheatres.length})
          </button>
        </div>
      </header>

      {/* ===================== TAB 1: MOVIES VIEW ===================== */}
      {activeTab === 'movies' && (
        <>
          {/* Location Scope Banner */}
          <div
            className="glass"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius)',
              marginBottom: '1.25rem',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <Sparkles size={18} color="var(--gold)" />
              <span>
                {movieIdsInCity.size > 0
                  ? `Showing movies actively screening across ${cityTheatres.length} theatres in ${currentCity}`
                  : `No active shows in ${currentCity} right now. Showing full catalog.`}
              </span>
            </div>

            {movieIdsInCity.size > 0 && (
              <button
                type="button"
                className={`btn btn--sm ${showAllCatalog ? 'btn--secondary' : 'btn--ghost'}`}
                onClick={() => setShowAllCatalog(!showAllCatalog)}
                style={{ fontSize: '0.8rem' }}
              >
                {showAllCatalog ? `Filter to ${currentCity} Only` : 'Show All Catalog Titles'}
              </button>
            )}
          </div>

          {/* Filters Bar */}
          <div className="filters-bar">
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
              <option value="title">A–Z</option>
            </select>
            <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {languages.map((l) => (
                <option key={l} value={l}>{l === 'all' ? 'All Languages' : l}</option>
              ))}
            </select>
          </div>

          <div className="filters-bar" style={{ marginTop: '-0.5rem' }}>
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                className={`chip ${genre === g ? 'active' : ''}`}
                onClick={() => setGenre(g)}
              >
                {g === 'all' ? 'All Genres' : g}
              </button>
            ))}
          </div>

          {filteredMovies.length === 0 ? (
            <EmptyState
              title={`No movies found for ${currentCity}`}
              message="Try switching cities from the header or select 'Show All Catalog Titles'."
            />
          ) : (
            <div className="movie-grid" style={{ marginBottom: '3rem' }}>
              {filteredMovies.map((m) => (
                <MovieCard key={m._id} movie={m} onTrailer={() => setTrailer(m)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ===================== TAB 2: THEATRES VIEW ===================== */}
      {activeTab === 'theatres' && (
        <div style={{ marginBottom: '3rem' }}>
          {/* Date Selector Tabs for Theatres */}
          {theatreDateOptions.length > 0 && (
            <div
              className="glass"
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                overflowX: 'auto',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                <Clock size={16} color="var(--accent)" />
                <span>Show Date:</span>
              </div>
              <button
                type="button"
                className={`btn btn--sm ${theatreDate === 'all' ? 'btn--primary' : 'btn--ghost'}`}
                onClick={() => setTheatreDate('all')}
                style={{ borderRadius: 'var(--radius)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              >
                All Upcoming Dates
              </button>
              {theatreDateOptions.map(({ dateStr, dateObj }) => {
                const isSelected = theatreDate === dateStr;
                const isToday = new Date().toDateString() === dateStr;
                const weekday = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
                const dayNum = dateObj.getDate();
                const month = dateObj.toLocaleDateString('en-IN', { month: 'short' });

                return (
                  <button
                    key={dateStr}
                    type="button"
                    className={`btn btn--sm ${isSelected ? 'btn--primary' : 'btn--secondary'}`}
                    onClick={() => setTheatreDate(dateStr)}
                    style={{
                      borderRadius: 'var(--radius)',
                      fontSize: '0.82rem',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{isToday ? 'Today' : weekday}, {dayNum} {month}</span>
                  </button>
                );
              })}
            </div>
          )}

          {cityTheatres.length === 0 ? (
            <EmptyState
              title={`No theatres registered in ${currentCity}`}
              message="Choose another city from the location dropdown in the navigation bar."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {cityTheatres.map((theatre) => {
                const theatreShows = theatreShowMap[String(theatre._id)] || [];

                // Group shows by movie for this theatre
                const movieGroup = {};
                theatreShows.forEach((s) => {
                  const m = s.movie;
                  if (!m) return;
                  const mid = String(m._id || m);
                  if (!movieGroup[mid]) movieGroup[mid] = { movie: m, shows: [] };
                  movieGroup[mid].shows.push(s);
                });

                const moviesRunning = Object.values(movieGroup);

                return (
                  <div
                    key={theatre._id}
                    className="theatre-card glass"
                    style={{
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font)' }}>{theatre.name}</h3>
                          <span className="badge badge--accent">{currentCity}</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={14} /> {theatre.address}
                        </p>
                      </div>

                      {theatre.facilities?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {theatre.facilities.map((fac) => (
                            <span key={fac} className="badge badge--muted" style={{ fontSize: '0.72rem' }}>
                              {fac}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Movies & Shows in this theatre */}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      {moviesRunning.length === 0 ? (
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                          {theatreDate === 'all'
                            ? 'No active shows scheduled at this theatre.'
                            : `No active shows scheduled for ${theatreDate} at this theatre.`}
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {moviesRunning.map(({ movie, shows: mShows }) => {
                            const sortedShows = [...mShows].sort((a, b) => {
                              const dComp = new Date(a.showDate) - new Date(b.showDate);
                              if (dComp !== 0) return dComp;
                              return (a.startTime || '').localeCompare(b.startTime || '');
                            });

                            return (
                              <div
                                key={movie._id || movie}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'minmax(180px, 260px) 1fr',
                                  gap: '1rem',
                                  alignItems: 'center',
                                  padding: '0.75rem',
                                  background: 'rgba(255,255,255,0.02)',
                                  borderRadius: 'var(--radius)',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 4 }}
                                    onError={(e) => {
                                      e.target.src = 'https://placehold.co/100x150/16161f/9b9bb0?text=Film';
                                    }}
                                  />
                                  <div>
                                    <Link
                                      to={`/movies/${movie._id || movie}`}
                                      style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}
                                      className="hover-underline"
                                    >
                                      {movie.title}
                                    </Link>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                      {movie.language} · {movie.genre?.slice(0, 2).join(', ')}
                                    </div>
                                  </div>
                                </div>

                                {/* Clickable Showtimes */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                  {sortedShows.map((s) => (
                                    <button
                                      key={s._id}
                                      type="button"
                                      className="btn btn--sm show-time-pill"
                                      onClick={() => navigate(`/book/${s._id}`)}
                                      title={`Book seats for ${formatTime(s.startTime)} (${s.screen?.name || 'Screen'}) on ${new Date(s.showDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}`}
                                      style={{
                                        border: '1px solid var(--border-strong)',
                                        borderRadius: 'var(--radius)',
                                        padding: '0.45rem 0.85rem',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '2px',
                                      }}
                                    >
                                      <span>{formatTime(s.startTime)}</span>
                                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                                        {s.screen?.name ? `${s.screen.name} · ` : ''}{s.screen?.screenType || '2D'} · ₹{s.ticketPrice}
                                      </span>
                                      {theatreDate === 'all' && (
                                        <span style={{ fontSize: '0.62rem', color: 'var(--accent)', fontWeight: 600, marginTop: '1px' }}>
                                          {new Date(s.showDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <TrailerModal open={!!trailer} onClose={() => setTrailer(null)} url={trailer?.trailerUrl} />
    </div>
  );
}
