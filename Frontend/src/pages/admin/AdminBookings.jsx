import { useEffect, useState } from 'react';
import { bookingApi } from '../../api/services';
import Loader from '../../components/ui/Loader';
import { formatCurrency } from '../../utils/format';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingApi.getAllAdmin().then(({ data }) => setBookings(data.bookings || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;

  return (
    <>
      <h1 style={{ marginBottom: '1.5rem' }}>All Bookings</h1>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Movie</th>
              <th>Theatre</th>
              <th>Seats</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.user?.name}<br /><small>{b.user?.email}</small></td>
                <td>{b.show?.movie?.title}</td>
                <td>{b.show?.theatre?.name}</td>
                <td>{b.seats?.join(', ')}</td>
                <td>{formatCurrency(b.totalAmount)}</td>
                <td><span className="badge badge--muted">{b.bookingStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
