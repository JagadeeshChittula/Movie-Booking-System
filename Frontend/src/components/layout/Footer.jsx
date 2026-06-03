import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link to="/" className="navbar__logo">
            Cine<span style={{ color: 'var(--accent)' }}>Vault</span>
          </Link>
          <p>Premium movie experiences. Book seats, skip queues, enjoy the show.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/movies">All Movies</Link>
          <Link to="/bookings">My Tickets</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Register</Link>
          <Link to="/profile">Profile</Link>
        </div>
        <div>
          <h4>Support</h4>
          <a href="mailto:support@cinevault.app">Contact Us</a>
          <Link to="/movies">Help Center</Link>
        </div>
      </div>
      <div className="container footer__bottom">
        © {new Date().getFullYear()} CineVault. Built for movie ticket booking.
      </div>
    </footer>
  );
}
