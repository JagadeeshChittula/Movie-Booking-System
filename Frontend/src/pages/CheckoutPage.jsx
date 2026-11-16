import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, Shield, Plus, Minus, Tag, Check, UtensilsCrossed, Clock, Coins, Sparkles } from 'lucide-react';
import { bookingApi, paymentApi, seatLockApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSeatLockTimer } from '../hooks/useSeatLockTimer';
import { formatCurrency, formatDate, formatTime } from '../utils/format';
import { getCheckout, saveCheckout, clearCheckout } from '../utils/storage';
import { SNACKS, SNACK_CATEGORIES } from '../data/snacks';

const METHODS = [
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'wallet', label: 'Digital Wallet', icon: Wallet },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [checkout, setCheckout] = useState(() => getCheckout());
  const [expiresAt, setExpiresAt] = useState(() => checkout?.expiresAt);
  const [extending, setExtending] = useState(false);
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  // F&B Concessions state
  const [selectedSnacks, setSelectedSnacks] = useState({});
  const [snackFilter, setSnackFilter] = useState('All');

  // Coupon / Promo code state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // CineCoins Loyalty State
  const [useCoins, setUseCoins] = useState(false);
  const userCoins = user?.cineCoins ?? 150;

  const { formatted, expired } = useSeatLockTimer(expiresAt);

  const handleExtendTime = async (mins = 5, showToast = true) => {
    if (!checkout?.showId) return;
    setExtending(true);
    try {
      const { data } = await seatLockApi.extend({
        lockId: checkout.lockId,
        show: checkout.showId,
        minutes: mins,
      });
      const updatedTime = data.expiresAt || new Date(Date.now() + mins * 60 * 1000).toISOString();
      setExpiresAt(updatedTime);
      const updatedCheckout = { ...checkout, expiresAt: updatedTime };
      setCheckout(updatedCheckout);
      saveCheckout(updatedCheckout);
      if (showToast) {
        toast.success(`Payment hold refreshed: 5 minutes remaining!`);
      }
    } catch {
      const fallbackTime = new Date(Date.now() + mins * 60 * 1000).toISOString();
      setExpiresAt(fallbackTime);
      const updatedCheckout = { ...checkout, expiresAt: fallbackTime };
      setCheckout(updatedCheckout);
      saveCheckout(updatedCheckout);
      if (showToast) {
        toast.info(`Payment hold extended to 5 minutes`);
      }
    } finally {
      setExtending(false);
    }
  };

  const goToPayment = () => {
    setStep(3);
    handleExtendTime(5, true);
  };

  if (!checkout?.show) {
    return (
      <div className="container empty-state">
        <h3>No active checkout</h3>
        <Link to="/movies" className="btn btn--primary">Browse movies</Link>
      </div>
    );
  }

  const { show, seats, pricing } = checkout;

  // Calculate Snacks Total
  const snackTotal = Object.entries(selectedSnacks).reduce((sum, [snackId, qty]) => {
    const item = SNACKS.find((s) => s.id === snackId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  // Movie ticket holder concession perk: 20% OFF all snacks!
  const snackDiscount = snackTotal > 0 ? Math.round(snackTotal * 0.20) : 0;
  const effectiveSnackTotal = Math.max(0, snackTotal - snackDiscount);

  // Calculate Coupon Discounts
  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'flat') {
      couponDiscountAmount = appliedCoupon.value;
    } else if (appliedCoupon.type === 'percent') {
      couponDiscountAmount = Math.round((pricing.total + effectiveSnackTotal) * (appliedCoupon.value / 100));
      if (appliedCoupon.max) couponDiscountAmount = Math.min(couponDiscountAmount, appliedCoupon.max);
    }
  }

  // CineCoins Loyalty Redemption (1 coin = ₹1, up to 40% of subtotal)
  const maxCoinsRedeemable = Math.min(userCoins, Math.floor(pricing.total * 0.40));
  const coinsDiscount = useCoins ? maxCoinsRedeemable : 0;

  // Overall Discount
  const totalDiscount = couponDiscountAmount + snackDiscount + coinsDiscount;

  // Grand Total Calculation
  const finalTotal = Math.max(0, pricing.total + snackTotal - totalDiscount);

  // Coins earned on this booking (10% of final total, min 15 coins)
  const coinsEarned = Math.max(15, Math.floor(finalTotal * 0.10));

  const handleSnackQty = (id, delta) => {
    setSelectedSnacks((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'CINE50') {
      setAppliedCoupon({ code, type: 'flat', value: 50, description: '₹50 Flat Discount Applied' });
      toast.success('Promo code CINE50 applied! ₹50 OFF');
    } else if (code === 'VAULT20') {
      setAppliedCoupon({ code, type: 'percent', value: 20, max: 120, description: '20% OFF (Up to ₹120)' });
      toast.success('Promo code VAULT20 applied! 20% OFF');
    } else {
      toast.error('Invalid coupon code. Try CINE50 or VAULT20');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    toast.info('Coupon removed');
  };

  const handlePay = async () => {
    if (expired) {
      toast.error('Seat lock expired. Please select seats again.');
      navigate(`/book/${checkout.showId}`);
      return;
    }
    setProcessing(true);
    try {
      const snacksPayload = Object.entries(selectedSnacks).map(([snackId, qty]) => {
        const item = SNACKS.find((s) => s.id === snackId);
        return {
          id: snackId,
          name: item?.name || 'Snack Item',
          quantity: qty,
          price: item?.price || 0,
        };
      });

      const { data: bookingRes } = await bookingApi.create({
        show: checkout.showId,
        seats,
        totalAmount: finalTotal,
        snacks: snacksPayload,
        snackTotal,
        discount: totalDiscount,
        couponCode: appliedCoupon?.code || '',
        coinsUsed: coinsDiscount,
      });
      const booking = bookingRes.booking;

      const { data: payRes } = await paymentApi.create({
        bookingId: booking._id,
        amount: finalTotal,
        paymentMethod: method,
      });

      // If Razorpay order was created, open Razorpay popup
      if (payRes.razorpayOrder && payRes.razorpayKeyId && window.Razorpay) {
        const options = {
          key: payRes.razorpayKeyId,
          amount: payRes.razorpayOrder.amount,
          currency: payRes.razorpayOrder.currency,
          name: 'CineVault Tickets',
          description: `${show.movie?.title} — ${seats?.length} Seat(s)`,
          order_id: payRes.razorpayOrder.id,
          handler: async (response) => {
            try {
              await paymentApi.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId: payRes.payment._id,
              });
              await bookingApi.confirm(booking._id);
              clearCheckout();
              navigate('/booking-success', {
                state: {
                  bookingId: booking._id,
                  show,
                  seats,
                  total: finalTotal,
                  snacks: snacksPayload,
                  discount: totalDiscount || 0,
                },
              });
            } catch (err) {
              toast.error('Payment verification failed: ' + err.message);
              setProcessing(false);
            }
          },
          prefill: {},
          theme: { color: '#e50914' },
          modal: {
            ondismiss: () => {
              setProcessing(false);
              toast.info('Payment window closed');
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      // Fallback: demo / simulation mode
      if (payRes?.payment?._id) {
        await paymentApi.success(payRes.payment._id);
      }

      await bookingApi.confirm(booking._id);

      clearCheckout();
      navigate('/booking-success', {
        state: {
          bookingId: booking._id,
          show,
          seats,
          total: finalTotal,
          snacks: snacksPayload,
          discount: totalDiscount || 0,
        },
      });
    } catch (err) {
      toast.error(err.message);
      setProcessing(false);
    }
  };

  const filteredSnacks = snackFilter === 'All'
    ? SNACKS
    : SNACKS.filter((s) => s.category === snackFilter);

  return (
    <div className="container" style={{ maxWidth: 760, padding: '2rem 0 3rem' }}>
      <header className="page-header" style={{ paddingTop: 0 }}>
        <h1>Checkout</h1>
      </header>

      <div className={`lock-timer ${expired ? 'urgent' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} />
          <span>Complete payment in <strong>{formatted}</strong></span>
        </div>
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={() => handleExtendTime(5, true)}
          disabled={extending || expired}
          title="Add 5 more minutes to your payment session"
          style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Clock size={14} />
          {extending ? 'Extending...' : '+5 Mins'}
        </button>
      </div>

      <div className="checkout-steps">
        <div className={`checkout-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>1. Seats</div>
        <div className={`checkout-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>2. Snacks</div>
        <div className={`checkout-step ${step >= 3 ? 'active' : ''}`}>3. Payment</div>
      </div>

      {/* Summary Banner */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.25rem' }}>{show.movie?.title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {show.theatre?.name} · {formatDate(show.showDate)} · {formatTime(show.startTime)}
          </p>
          <p style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>
            <strong>Seats ({seats?.length}):</strong> {seats?.join(', ')}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Grand Total</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)' }}>
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      {/* STEP 1: REVIEW SEATS */}
      {step === 1 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Ticket Cost Breakdown</h3>
          {pricing?.tierBreakdown ? (
            Object.values(pricing.tierBreakdown)
              .filter((tier) => tier.count > 0)
              .map((tier) => (
                <div key={tier.name} className="checkout-line">
                  <span>
                    {tier.name} ({tier.count} × {formatCurrency(tier.price)})
                  </span>
                  <span>{formatCurrency(tier.total)}</span>
                </div>
              ))
          ) : (
            <div className="checkout-line">
              <span>Seat Tickets ({seats?.length})</span>
              <span>{formatCurrency(pricing.subtotal)}</span>
            </div>
          )}
          <div className="checkout-line">
            <span>Convenience fee (incl. GST)</span>
            <span>{formatCurrency(pricing.convenience)}</span>
          </div>
          <div className="checkout-line total" style={{ marginTop: '1rem', paddingTop: '1rem' }}>
            <span>Tickets Subtotal</span>
            <span>{formatCurrency(pricing.total)}</span>
          </div>
          <button
            type="button"
            className="btn btn--primary btn--block btn--lg"
            style={{ marginTop: '1.5rem' }}
            onClick={() => setStep(2)}
          >
            Add Snacks & Beverages →
          </button>
        </div>
      )}

      {/* STEP 2: CONCESSIONS / F&B */}
      {step === 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UtensilsCrossed size={20} /> Cinema Concessions & Snacks
            </h3>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={goToPayment}
            >
              Skip to Payment →
            </button>
          </div>

          <div className="filters-bar" style={{ marginBottom: '1.25rem' }}>
            {SNACK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`chip ${snackFilter === cat ? 'active' : ''}`}
                onClick={() => setSnackFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Exclusive Snack Discount Perk Banner */}
          <div style={{ background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.15) 0%, rgba(229, 9, 20, 0.1) 100%)', border: '1px solid rgba(212, 168, 83, 0.35)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <Sparkles size={18} color="var(--gold)" />
            <div style={{ fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--gold)' }}>Cinema Ticket Perk:</strong> Flat <strong>20% OFF</strong> applied automatically to all combos, snacks, and beverages!
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {filteredSnacks.map((item) => {
              const qty = selectedSnacks[item.id] || 0;
              return (
                <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '2rem', minWidth: 44, textAlign: 'center' }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>{item.description}</div>
                    <div style={{ fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>{formatCurrency(item.price)}</div>
                  </div>
                  <div>
                    {qty === 0 ? (
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => handleSnackQty(item.id, 1)}
                      >
                        <Plus size={14} /> Add
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-hover)', borderRadius: 8, padding: '0.2rem 0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          style={{ padding: '0.2rem' }}
                          onClick={() => handleSnackQty(item.id, -1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          style={{ padding: '0.2rem' }}
                          onClick={() => handleSnackQty(item.id, 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" className="btn btn--primary" style={{ flex: 1 }} onClick={goToPayment}>
              {Object.keys(selectedSnacks).length > 0
                ? `Continue with ${Object.keys(selectedSnacks).length} Snacks (${formatCurrency(snackTotal)}) →`
                : 'Skip Snacks & Continue to Payment →'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PAYMENT & COUPONS */}
      {step === 3 && (
        <>
          {/* 5-Minute Payment Guarantee Card */}
          <div className="glass" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', border: '1px solid rgba(229, 9, 20, 0.35)', background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.08) 0%, rgba(20, 20, 28, 0.6) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(229, 9, 20, 0.2)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                  Payment Reserved: {formatted} Remaining
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Your seats are held for 5 minutes during payment. Need extra time?
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => handleExtendTime(5, true)}
              disabled={extending || expired}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
            >
              <Clock size={14} />
              {extending ? 'Refreshing...' : '+5 Minutes'}
            </button>
          </div>
          {/* Coupon Code Section (100% Optional) */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, fontSize: '0.95rem' }}>
                <Tag size={16} /> Promo Code / Discount
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>(Optional)</span>
              </h4>
              {appliedCoupon && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={handleRemoveCoupon} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                  Remove
                </button>
              )}
            </div>
            {appliedCoupon ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '0.75rem 1rem', borderRadius: 8 }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Check size={16} /> {appliedCoupon.code}
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{appliedCoupon.description}</p>
                </div>
              </div>
            ) : (
              <div>
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter promo code (Optional — leave blank if none)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button type="submit" className="btn btn--secondary" disabled={!couponInput.trim()}>
                    Apply
                  </button>
                </form>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.45rem' }}>
                  Optional discounts: <strong>CINE50</strong> (₹50 OFF) or <strong>VAULT20</strong> (20% OFF). Not required — you can pay full price directly.
                </p>
              </div>
            )}
          </div>

          {/* CineCoins Loyalty Redemption Section (100% Optional) */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.08) 0%, rgba(20, 20, 30, 0.6) 100%)', border: '1px solid rgba(212, 168, 83, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ background: 'rgba(212, 168, 83, 0.2)', padding: '0.45rem', borderRadius: '50%', color: 'var(--gold)' }}>
                  <Coins size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Redeem CineCoins
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>(Optional)</span>
                    <span className="badge badge--gold" style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}>
                      {userCoins} Available
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Optional: Check the box only if you want an instant coin discount.
                  </div>
                </div>
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'var(--bg-hover)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <input
                  type="checkbox"
                  checked={useCoins}
                  onChange={(e) => setUseCoins(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--gold)' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: useCoins ? 'var(--gold)' : 'var(--text)' }}>
                  {useCoins ? `Applied -₹${maxCoinsRedeemable}` : `Use ${maxCoinsRedeemable} Coins`}
                </span>
              </label>
            </div>
          </div>

          {/* Final Calculation Box */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Order Total Breakdown</h4>
            <div className="checkout-line">
              <span>Movie Tickets</span>
              <span>{formatCurrency(pricing.subtotal)}</span>
            </div>
            <div className="checkout-line">
              <span>Convenience & Tech Fee</span>
              <span>{formatCurrency(pricing.convenience)}</span>
            </div>
            {snackTotal > 0 && (
              <>
                <div className="checkout-line">
                  <span>Food & Beverage ({Object.values(selectedSnacks).reduce((a, b) => a + b, 0)} items)</span>
                  <span>{formatCurrency(snackTotal)}</span>
                </div>
                {snackDiscount > 0 && (
                  <div className="checkout-line" style={{ color: 'var(--success)' }}>
                    <span>Ticket Holder Concession Perk (20% OFF)</span>
                    <span>-{formatCurrency(snackDiscount)}</span>
                  </div>
                )}
              </>
            )}
            {couponDiscountAmount > 0 && (
              <div className="checkout-line" style={{ color: 'var(--success)' }}>
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span>-{formatCurrency(couponDiscountAmount)}</span>
              </div>
            )}
            {coinsDiscount > 0 && (
              <div className="checkout-line" style={{ color: 'var(--gold)' }}>
                <span>CineCoins Redeemed ({coinsDiscount} coins)</span>
                <span>-{formatCurrency(coinsDiscount)}</span>
              </div>
            )}
            <div className="checkout-line total" style={{ marginTop: '0.75rem', paddingTop: '0.75rem' }}>
              <span>Amount to Pay</span>
              <span style={{ color: 'var(--gold)', fontSize: '1.25rem' }}>{formatCurrency(finalTotal)}</span>
            </div>

            {/* CineCoins Cashback Alert */}
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(212, 168, 83, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--gold)' }}>
              <Coins size={15} />
              <span>You will earn <strong>+{coinsEarned} CineCoins</strong> (₹{coinsEarned} value) on this booking!</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <h3 style={{ marginBottom: '0.75rem' }}>Select Payment Method</h3>
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
            {typeof window !== 'undefined' && window.Razorpay
              ? '🔒 Secure payment powered by Razorpay (Test Mode — no real charges)'
              : 'Demo mode enabled: payment simulation completes securely without external charges.'}
          </p>

          <button
            type="button"
            className="btn btn--gold btn--block btn--lg"
            disabled={processing || expired}
            onClick={handlePay}
          >
            {processing ? 'Processing Payment…' : `Pay ${formatCurrency(finalTotal)}`}
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--block"
            style={{ marginTop: '0.5rem' }}
            onClick={() => setStep(2)}
          >
            Back to Snacks
          </button>
        </>
      )}
    </div>
  );
}

