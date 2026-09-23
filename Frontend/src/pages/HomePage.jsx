import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Clock, MapPin, Building2, ChevronRight, Film } from 'lucide-react';
import { movieApi, showApi, theatreApi } from '../api/services';
import HeroBanner from '../components/movie/HeroBanner';
import MovieCard from '../components/movie/MovieCard';
import TrailerModal from '../components/movie/TrailerModal';
import Loader from '../components/ui/Loader';
import { getCity, getWatchlist } from '../utils/storage';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCity, setCurrentCity] = useState(getCity);
  const [trailer, setTrailer] = useState(null);

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

  // Filter shows and theatres in current city
  const cityShows = useMemo(() => {
    return shows.filter(
      (s) => s.theatre?.city?.toLowerCase().trim() === currentCity.toLowerCase().trim()
    );
  }, [shows, currentCity]);

  const cityTheatres = useMemo(() => {
    return theatres.filter(
      (t) => t.city?.toLowerCase().trim() === currentCity.toLowerCase().trim()
    );
  }, [theatres, currentCity]);

  // Movies running in current city
  const moviesInCity = useMemo(() => {
    const inCitySet = new Set(
      cityShows.map((s) => String(s.movie?._id || s.movie)).filter(Boolean)
    );
    const inCityList = movies.filter((m) => inCitySet.has(String(m._id)));
    return inCityList.length > 0 ? inCityList : movies.slice(0, 8);
  }, [movies, cityShows]);

  if (loading) return <Loader fullPage />;

  const featured = moviesInCity[0] || movies[0];
  const trending = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
  const newest = [...movies]
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
    .slice(0, 8);
  const watchlistIds = getWatchlist();
  const watchlist = movies.filter((m) => watchlistIds.includes(String(m._id)));

  return (
    <>
      <HeroBanner movie={featured} onTrailer={() => setTrailer(featured)} />
      <TrailerModal open={!!trailer} onClose={() => setTrailer(null)} url={trailer?.trailerUrl} />

      <div className="container">
        {/* City Scope Highlight Banner */}
        <section className="section" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div
            className="glass"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <MapPin size={20} color="var(--accent)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Selected Location: {currentCity}
                </span>
              </div>
              <h2 style={{ fontSize: '1.4rem' }}>
                {cityTheatres.length} Theatres & {cityShows.length} Shows in {currentCity}
              </h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
                Book tickets instantly with 5-minute hold and interactive seat maps.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/movies?tab=theatres" className="btn btn--secondary">
                <Building2 size={16} /> View All {currentCity} Theatres
              </Link>
              <Link to="/movies" className="btn btn--gold">
                <Film size={16} /> Explore Movies
              </Link>
            </div>
          </div>
        </section>

        {/* Section 1: Now Showing in Current City */}
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">
              <Sparkles size={22} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--gold)' }} />
              Now Showing in {currentCity}
            </h2>
            <Link to="/movies" className="section__link">View all ({moviesInCity.length}) →</Link>
          </div>
          <div className="movie-grid">
            {moviesInCity.slice(0, 8).map((m) => (
              <MovieCard key={m._id} movie={m} onTrailer={() => setTrailer(m)} />
            ))}
          </div>
        </section>

        {/* Section 2: Top Theatres in Current City */}
        {cityTheatres.length > 0 && (
          <section className="section">
            <div className="section__header">
              <h2 className="section__title">
                <Building2 size={22} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent)' }} />
                Popular Cinemas in {currentCity}
              </h2>
              <Link to="/movies?tab=theatres" className="section__link">All {cityTheatres.length} Theatres →</Link>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
              }}
            >
              {cityTheatres.slice(0, 6).map((theatre) => (
                <Link
                  key={theatre._id}
                  to="/movies?tab=theatres"
                  className="glass card-hover"
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius)',
                    display: 'block',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{theatre.name}</h3>
                    <ChevronRight size={18} color="var(--text-dim)" />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                    {theatre.address}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: '0.75rem' }}>
                    {theatre.facilities?.slice(0, 3).map((f) => (
                      <span key={f} className="badge badge--muted" style={{ fontSize: '0.7rem' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Watchlist */}
        {watchlist.length > 0 && (
          <section className="section">
            <div className="section__header">
              <h2 className="section__title">Your Watchlist</h2>
            </div>
            <div className="movie-grid">
              {watchlist.map((m) => (
                <MovieCard key={m._id} movie={m} onTrailer={() => setTrailer(m)} />
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Trending Now */}
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">
              <TrendingUp size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Trending Now
            </h2>
            <Link to="/movies" className="section__link">View all →</Link>
          </div>
          <div className="movie-grid">
            {trending.map((m) => (
              <MovieCard key={m._id} movie={m} onTrailer={() => setTrailer(m)} />
            ))}
          </div>
        </section>

        {/* Section 5: New Releases */}
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">
              <Clock size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              New Releases
            </h2>
          </div>
          <div className="movie-grid">
            {newest.map((m) => (
              <MovieCard key={m._id} movie={m} onTrailer={() => setTrailer(m)} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
