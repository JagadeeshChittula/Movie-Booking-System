import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Star, Calendar, Globe, Clock, Ticket, Heart, MessageSquare, Send, Check } from 'lucide-react';
import { movieApi, showApi } from '../api/services';
import ShowTimePicker from '../components/booking/ShowTimePicker';
import TrailerModal from '../components/movie/TrailerModal';
import Loader from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, formatDuration } from '../utils/format';
import { getCity, setCity } from '../utils/storage';

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShow, setSelectedShow] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState(getCity);
  const [allShowsForMovie, setAllShowsForMovie] = useState([]);

  // Watchlist state
  const [isWatchlisted, setIsWatchlisted] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem('cv_watchlist') || '[]');
      return list.includes(id);
    } catch {
      return false;
    }
  });

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [userRatingVal, setUserRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const toggleWatchlist = () => {
    try {
      const list = JSON.parse(localStorage.getItem('cv_watchlist') || '[]');
      let next;
      if (list.includes(id)) {
        next = list.filter((item) => item !== id);
        setIsWatchlisted(false);
        toast.info('Removed from Watchlist');
      } else {
        next = [...list, id];
        setIsWatchlisted(true);
        toast.success('Added to Watchlist ❤️');
      }
      localStorage.setItem('cv_watchlist', JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please sign in to write a review');
      navigate('/login', { state: { from: `/movies/${id}` } });
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const { data } = await movieApi.addReview(id, {
        rating: userRatingVal,
        comment: reviewComment,
      });
      setReviews(data.reviews || []);
      setMovie((prev) => ({
        ...prev,
        userRating: data.userRating,
        userRatingCount: data.userRatingCount,
      }));
      setReviewComment('');
      toast.success('Review posted! Thank you for rating.');
    } catch (err) {
      toast.error(err.message || 'Failed to post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const handleCitySync = (e) => setCurrentCity(e.detail);
    window.addEventListener('citychange', handleCitySync);
    return () => window.removeEventListener('citychange', handleCitySync);
  }, []);

  useEffect(() => {
    Promise.all([movieApi.getOne(id), showApi.getAll()])
      .then(([movieRes, showsRes]) => {
        setMovie(movieRes.data.movie);
        setReviews(movieRes.data.movie?.reviews || []);
        const all = showsRes.data.shows || [];
        const forMovie = all.filter(
          (s) => (s.movie?._id || s.movie) === id && s.isActive !== false
        );
        setAllShowsForMovie(forMovie);
      })
      .catch(() => toast?.error?.('Failed to load movie'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  const shows = useMemo(() => allShowsForMovie.filter(
      (s) => s.theatre?.city?.toLowerCase().trim() === currentCity.toLowerCase().trim()
    ), [allShowsForMovie, currentCity]);

  const availableDates = useMemo(() => [...new Set(shows.map((s) => new Date(s.showDate).toDateString()))].sort(
      (a, b) => new Date(a) - new Date(b)
    ), [shows]);
  const activeSelectedDate = availableDates.includes(selectedDate)
    ? selectedDate
    : availableDates[0] || '';

  // Cities where shows exist
  const otherCities = [...new Set(allShowsForMovie.map((s) => s.theatre?.city).filter(Boolean))].filter(
    (c) => c.toLowerCase() !== currentCity.toLowerCase()
  );

  const handleSwitchCity = (newCity) => {
    setCity(newCity);
    setCurrentCity(newCity);
    setSelectedShow(null);
    window.dispatchEvent(new CustomEvent('citychange', { detail: newCity }));
  };

  const handleProceed = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to book tickets');
      navigate('/login', { state: { from: `/movies/${id}` } });
      return;
    }
    if (!selectedShow || !shows.some((show) => show._id === selectedShow._id)) {
      toast.error('Select a show time');
      return;
    }
    navigate(`/book/${selectedShow._id}`);
  };

  if (loading) return <Loader fullPage />;
  if (!movie) {
    return (
      <div className="container empty-state">
        <h3>Movie not found</h3>
        <Link to="/movies" className="btn btn--primary">Back to movies</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div className="movie-detail__hero" style={{ marginTop: '2rem' }}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="movie-detail__poster"
          onError={(e) => {
            if (movie.trailerUrl && !e.target.dataset.fallbackTried) {
              e.target.dataset.fallbackTried = 'true';
              const match = movie.trailerUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
              if (match) {
                e.target.src = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
                return;
              }
            }
            e.target.src = 'https://placehold.co/400x600/16161f/9b9bb0?text=Movie';
          }}
        />
        <div>
          <span className="badge badge--accent">Now Showing</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', marginTop: '0.75rem' }}>
            {movie.title}
          </h1>
          <div className="movie-detail__genres">
            {movie.genre?.map((g) => (
              <span key={g} className="badge badge--muted">{g}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {movie.rating > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gold)' }} title="Critic Rating">
                <Star size={16} fill="currentColor" /> {movie.rating} (Critic)
              </span>
            )}
            {movie.userRating > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#38bdf8' }} title="User Community Rating">
                <Star size={16} fill="currentColor" /> {movie.userRating}/5 ({movie.userRatingCount} user reviews)
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={16} /> {formatDuration(movie.duration)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={16} /> {movie.language}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={16} /> {formatDate(movie.releaseDate)}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 640 }}>{movie.description}</p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            {movie.trailerUrl && (
              <button type="button" className="btn btn--secondary" onClick={() => setTrailerOpen(true)}>
                Watch Trailer
              </button>
            )}

            <button
              type="button"
              className="btn btn--ghost"
              onClick={toggleWatchlist}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: isWatchlisted ? '#e50914' : 'inherit',
                border: '1px solid var(--border)',
              }}
            >
              <Heart size={16} fill={isWatchlisted ? '#e50914' : 'none'} color={isWatchlisted ? '#e50914' : 'currentColor'} />
              {isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
          </div>
        </div>
      </div>

      <section className="section">
        <h2 className="section__title" style={{ marginBottom: '1rem' }}>
          Select Showtime — {currentCity}
        </h2>
        {shows.length === 0 ? (
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: otherCities.length > 0 ? '1rem' : 0 }}>
              No active shows scheduled for <strong>{movie.title}</strong> in <strong>{currentCity}</strong> right now.
            </p>
            {otherCities.length > 0 && (
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                  Shows currently available in these cities:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {otherCities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="btn btn--sm btn--secondary"
                      onClick={() => handleSwitchCity(c)}
                    >
                      Switch to {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <ShowTimePicker
              shows={shows}
              selectedDate={activeSelectedDate}
              onDateChange={(date) => {
                setSelectedDate(date);
                setSelectedShow(null);
              }}
              selectedShow={selectedShow}
              onShowSelect={setSelectedShow}
            />
            <button
              type="button"
              className="btn btn--primary btn--lg"
              style={{ marginTop: '1.5rem' }}
              onClick={handleProceed}
            >
              <Ticket size={18} />
              Select Seats
            </button>
          </>
        )}
      </section>

      {/* ================= COMMUNITY REVIEWS & RATINGS ================= */}
      <section className="section" style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="section__title" style={{ marginBottom: '0.25rem' }}>
              Audience Reviews & Ratings
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {reviews.length > 0
                ? `${reviews.length} community review${reviews.length > 1 ? 's' : ''} · Average ${movie.userRating || 5}/5 Stars`
                : 'Be the first to share your review!'}
            </p>
          </div>
        </div>

        {/* Write a Review Box */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', background: 'rgba(20, 20, 30, 0.6)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <MessageSquare size={17} color="var(--accent)" />
            Rate & Review this Movie
          </h4>

          <form onSubmit={handleReviewSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your Rating:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRatingVal(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 2,
                      color: star <= userRatingVal ? 'var(--gold)' : 'var(--text-dim)',
                    }}
                  >
                    <Star size={20} fill={star <= userRatingVal ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold)', marginLeft: '0.5rem' }}>
                {userRatingVal} / 5 Stars
              </span>
            </div>

            <textarea
              className="input"
              rows={3}
              placeholder={isAuthenticated ? "Write your genuine thoughts, performance review, or cinema experience…" : "Sign in to share your review…"}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              disabled={submittingReview}
              style={{ width: '100%', marginBottom: '0.75rem', resize: 'vertical' }}
            />

            <button
              type="submit"
              className="btn btn--primary"
              disabled={submittingReview || !reviewComment.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Send size={15} />
              {submittingReview ? 'Posting…' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {reviews.map((r, idx) => (
              <div key={idx} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.userName}</div>
                  <div style={{ display: 'flex', gap: 2, color: 'var(--gold)' }}>
                    {Array.from({ length: r.rating }, (_, i) => (
                      <Star key={i} size={13} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  "{r.comment}"
                </p>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                  {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <TrailerModal open={trailerOpen} onClose={() => setTrailerOpen(false)} url={movie.trailerUrl} />
    </div>
  );
}
