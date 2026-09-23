import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';
import { movieApi } from '../api/services';
import HeroBanner from '../components/movie/HeroBanner';
import MovieCard from '../components/movie/MovieCard';
import TrailerModal from '../components/movie/TrailerModal';
import Loader from '../components/ui/Loader';
import { getWatchlist } from '../utils/storage';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trailer, setTrailer] = useState(null);

  useEffect(() => {
    movieApi
      .getAll()
      .then(({ data }) => setMovies(data.movies?.filter((m) => m.isActive !== false) || []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;

  const featured = movies[0];
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
        <section className="section">
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={22} color="var(--gold)" />
                Premium Experience
              </h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
                Interactive seat maps · 5-minute real-time seat hold · Instant confirmation
              </p>
            </div>
            <Link to="/movies" className="btn btn--gold">Explore All Movies</Link>
          </div>
        </section>

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

        {movies.length === 0 && (
          <div className="empty-state">
            <h3>No movies yet</h3>
            <p>Ask an admin to add movies, or sign in as admin to populate the catalogue.</p>
            <Link to="/admin/movies" className="btn btn--primary" style={{ marginTop: '1rem' }}>
              Admin: Add Movies
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
