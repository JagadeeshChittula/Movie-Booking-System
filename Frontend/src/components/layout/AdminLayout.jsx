import { NavLink, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Building2,
  Monitor,
  Calendar,
  Ticket,
  Users,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';

const links = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/scanner', icon: QrCode, label: 'Gate Scanner' },
  { to: '/admin/movies', icon: Film, label: 'Movies' },
  { to: '/admin/theatres', icon: Building2, label: 'Theatres' },
  { to: '/admin/screens', icon: Monitor, label: 'Screens' },
  { to: '/admin/shows', icon: Calendar, label: 'Shows' },
  { to: '/admin/bookings', icon: Ticket, label: 'Bookings' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

export default function AdminLayout() {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', padding: '0 1rem', marginBottom: '1rem' }}>
            ADMIN PANEL
          </p>
          {links.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </aside>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
