import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, Shield } from 'lucide-react';
import { bookingApi, paymentApi } from '../api/services';
import { useToast } from '../context/ToastContext';
import { useSeatLockTimer } from '../hooks/useSeatLockTimer';
import { formatCurrency, formatDate, formatTime } from '../utils/format';
import { getCheckout, clearCheckout } from '../utils/storage';

const METHODS = [
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const checkout = getCheckout();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const { formatted, expired } = useSeatLockTimer(checkout?.expiresAt);

  if (!checkout?.show) {
    return (
      <div className="container empty-state">
        <h3>No active checkout</h3>
        <Link to="/movies" className="btn btn--primary">Browse movies</Link>
      </div>
    );
  }

  const { show, seats, pricing } = checkout;

  const handlePay = async () => {
    if (expired) {
      toast.error('Seat lock expired. Please select seats again.');
      navigate(`/book/${checkout.showId}`);
      return;
    }
    setProcessing(true);
    try {
      const { data: bookingRes } = await bookingApi.create({
        show: checkout.showId,
        seats,
        totalAmount: pricing.total,
      });
      const booking = bookingRes.booking;

      const { data: payRes } = await paymentApi.create({
        bookingId: booking._id,
        amount: pricing.total,
        paymentMethod: method,
      });

      await bookingApi.confirm(booking._id);

      clearCheckout();
      navigate('/booking-success', {
        state: { bookingId: booking._id, show, seats, total: pricing.total },
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 720, padding: '2rem 0 3rem' }}>
      <header className="page-header" style={{ paddingTop: 0 }}>
        <h1>Checkout</h1>
      </header>

      <div className={`lock-timer ${expired ? 'urgent' : ''}`}>
        <Shield size={18} />
        Complete payment in {formatted}
      </div>

      <div className="checkout-steps">
        <div className={`checkout-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>Review</div>
        <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>Payment</div>
        <div className="checkout-step">Confirm</div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>{show.movie?.title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {show.theatre?.name} · {formatDate(show.showDate)} · {formatTime(show.startTime)}
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          <strong>Seats:</strong> {seats?.join(', ')}
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
          {formatCurrency(pricing.total)}
        </p>
      </div>

      {step === 1 && (
        <button type="button" className="btn btn--primary btn--block btn--lg" onClick={() => setStep(2)}>
          Continue to Payment
        </button>
      )}

      {step === 2 && (
        <>
          <h3 style={{ marginBottom: '0.75rem' }}>Payment method</h3>
          <div className="payment-methods">
            {METHODS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`payment-method ${method === id ? 'active' : ''}`}
                onClick={() => setMethod(id)}
              >
                <Icon size={24} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                {label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            Demo mode: payment is simulated. No real charge.
          </p>
          <button
            type="button"
            className="btn btn--gold btn--block btn--lg"
            disabled={processing || expired}
            onClick={handlePay}
          >
            {processing ? 'Processing…' : `Pay ${formatCurrency(pricing.total)}`}
          </button>
          <button type="button" className="btn btn--ghost btn--block" style={{ marginTop: '0.5rem' }} onClick={() => setStep(1)}>
            Back
          </button>
        </>
      )}
    </div>
  );
}
