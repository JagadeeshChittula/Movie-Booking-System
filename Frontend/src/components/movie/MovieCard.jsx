import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { formatDuration } from '../../utils/format';
import { isInWatchlist, toggleWatchlist } from '../../utils/storage';
import { useState } from 'react';

export default function MovieCard({ movie }) {
  const [watchlisted, setWatchlisted] = useState(isInWatchlist(movie._id));

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie._id);
    setWatchlisted(isInWatchlist(movie._id));
  };

  return (
    <Link to={`/movies/${movie._id}`} className="card movie-card">
      <div className="movie-card__poster-wrap">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="movie-card__poster"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x600/16161f/9b9bb0?text=${encodeURIComponent(movie.title?.slice(0, 12) || 'Movie')}`;
          }}
        />
        <button
          type="button"
          className={`movie-card__wish ${watchlisted ? 'active' : ''}`}
          onClick={handleWish}
          aria-label="Add to watchlist"
        >
          <Heart size={16} fill={watchlisted ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="movie-card__body">
        <h3 className="movie-card__title">{movie.title}</h3>
        <p className="movie-card__meta">
          {movie.language} · {formatDuration(movie.duration)}
        </p>
        {movie.rating > 0 && (
          <div className="movie-card__rating">
            <Star size={14} fill="currentColor" />
            {movie.rating.toFixed(1)}
          </div>
        )}
      </div>
    </Link>
  );
}
