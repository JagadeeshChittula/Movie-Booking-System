import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieApi } from '../api/services';
import MovieCard from '../components/movie/MovieCard';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import { getCity } from '../utils/storage';

export default function MoviesPage() {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('all');
  const [language, setLanguage] = useState('all');
  const [sort, setSort] = useState('rating');
  const query = searchParams.get('q')?.toLowerCase() || '';

  useEffect(() => {
    movieApi
      .getAll()
      .then(({ data }) => setMovies(data.movies?.filter((m) => m.isActive !== false) || []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, []);

  const genres = useMemo(() => {
    const set = new Set();
    movies.forEach((m) => m.genre?.forEach((g) => set.add(g)));
    return ['all', ...Array.from(set)];
  }, [movies]);

  const languages = useMemo(() => {
    const set = new Set(movies.map((m) => m.language).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [movies]);

  const filtered = useMemo(() => {
    let list = [...movies];
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
  }, [movies, query, genre, language, sort]);

  if (loading) return <Loader fullPage />;

  return (
    <div className="container">
      <header className="page-header">
        <h1>Movies in {getCity()}</h1>
        <p>{filtered.length} titles available</p>
      </header>

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

      {filtered.length === 0 ? (
        <EmptyState title="No movies found" message="Try different filters or search terms." />
      ) : (
        <div className="movie-grid" style={{ marginBottom: '3rem' }}>
          {filtered.map((m) => (
            <MovieCard key={m._id} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
}
