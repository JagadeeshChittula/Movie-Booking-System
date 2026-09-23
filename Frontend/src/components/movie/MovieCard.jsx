import { Link } from 'react-router-dom';
import { Star, Heart, Play } from 'lucide-react';
import { formatDuration } from '../../utils/format';
import { isInWatchlist, toggleWatchlist } from '../../utils/storage';
import { useState } from 'react';

export default function MovieCard({ movie, onTrailer }) {
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
            if (movie.trailerUrl && !e.target.dataset.fallbackTried) {
              e.target.dataset.fallbackTried = 'true';
              const match = movie.trailerUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
              if (match) {
                e.target.src = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
                return;
              }
            }
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
        {movie.trailerUrl && onTrailer && (
          <button
            type="button"
            className="movie-card__play"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTrailer(movie);
            }}
            title="Watch Trailer"
          >
            <Play size={13} fill="currentColor" />
          </button>
        )}
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
