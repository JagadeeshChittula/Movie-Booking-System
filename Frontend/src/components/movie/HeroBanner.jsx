import { Link } from 'react-router-dom';
import { Play, Ticket } from 'lucide-react';
import { formatDuration } from '../../utils/format';

export default function HeroBanner({ movie, onTrailer }) {
  if (!movie) return null;

  return (
    <section className="hero">
      <div
        className="hero__bg"
        style={{
          backgroundImage: `url(${movie.posterUrl})`,
        }}
      />
      <div className="hero__overlay" />
      <div className="container hero__content">
        <span className="badge badge--gold">Now Showing</span>
        <h1 className="hero__title">{movie.title}</h1>
        <div className="hero__meta">
          <span>{movie.language}</span>
          <span>{formatDuration(movie.duration)}</span>
          {movie.genre?.slice(0, 2).map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
        <p className="hero__desc">
          {movie.description?.slice(0, 160)}
          {movie.description?.length > 160 ? '…' : ''}
        </p>
        <div className="hero__actions">
          <Link to={`/movies/${movie._id}`} className="btn btn--primary btn--lg">
            <Ticket size={18} />
            Book Tickets
          </Link>
          {movie.trailerUrl && (
            <button type="button" className="btn btn--secondary btn--lg" onClick={onTrailer}>
              <Play size={18} />
              Watch Trailer
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
