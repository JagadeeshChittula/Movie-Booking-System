import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/services';
import Loader from '../../components/ui/Loader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .stats()
      .then(({ data }) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers },
    { label: 'Movies', value: stats?.totalMovies },
    { label: 'Theatres', value: stats?.totalTheatres },
    { label: 'Bookings', value: stats?.totalBookings },
    { label: 'Confirmed', value: stats?.confirmedBookings },
    { label: 'Cancelled', value: stats?.cancelledBookings },
    { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}` },
  ];

  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.35rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Overview of your cinema platform</p>
      <div className="stats-grid">
        {cards.map(({ label, value }) => (
          <div key={label} className="stat-card">
            <div className="stat-card__value">{value ?? 0}</div>
            <div className="stat-card__label">{label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
