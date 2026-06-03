import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container empty-state" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '4rem', fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>404</h1>
      <h3>Page not found</h3>
      <p>The show you&apos;re looking for isn&apos;t on this screen.</p>
      <Link to="/" className="btn btn--primary" style={{ marginTop: '1rem' }}>Back to Home</Link>
    </div>
  );
}
