import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Star, Calendar, Globe, Clock, Ticket } from 'lucide-react';
import { movieApi, showApi } from '../api/services';
import ShowTimePicker from '../components/booking/ShowTimePicker';
import TrailerModal from '../components/movie/TrailerModal';
import Loader from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, formatDuration } from '../utils/format';
import { getCity } from '../utils/storage';

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShow, setSelectedShow] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState(getCity);
  const [allShowsForMovie, setAllShowsForMovie] = useState([]);

  useEffect(() => {
    const handleCitySync = (e) => setCurrentCity(e.detail);
    window.addEventListener('citychange', handleCitySync);
    return () => window.removeEventListener('citychange', handleCitySync);
  }, []);

  useEffect(() => {
    Promise.all([movieApi.getOne(id), showApi.getAll()])
      .then(([movieRes, showsRes]) => {
        setMovie(movieRes.data.movie);
        const all = showsRes.data.shows || [];
        const forMovie = all.filter(
          (s) => (s.movie?._id || s.movie) === id && s.isActive !== false
        );
        setAllShowsForMovie(forMovie);
      })
      .catch(() => toast?.error?.('Failed to load movie'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  // Filter shows for active currentCity
  useEffect(() => {
    const inCity = allShowsForMovie.filter(
      (s) => s.theatre?.city?.toLowerCase().trim() === currentCity.toLowerCase().trim()
    );
    setShows(inCity);
    const dates = [...new Set(inCity.map((s) => new Date(s.showDate).toDateString()))].sort(
      (a, b) => new Date(a) - new Date(b)
    );
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    } else {
      setSelectedDate('');
    }
    setSelectedShow(null);
  }, [allShowsForMovie, currentCity]);

  // Cities where shows exist
  const otherCities = [...new Set(allShowsForMovie.map((s) => s.theatre?.city).filter(Boolean))].filter(
    (c) => c.toLowerCase() !== currentCity.toLowerCase()
  );

  const handleSwitchCity = (newCity) => {
    setCity(newCity);
    setCurrentCity(newCity);
    window.dispatchEvent(new CustomEvent('citychange', { detail: newCity }));
  };

  const handleProceed = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to book tickets');
      navigate('/login', { state: { from: `/movies/${id}` } });
      return;
    }
    if (!selectedShow) {
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
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gold)' }}>
                <Star size={16} fill="currentColor" /> {movie.rating}
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
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
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

      <TrailerModal open={trailerOpen} onClose={() => setTrailerOpen(false)} url={movie.trailerUrl} />
    </div>
  );
}
