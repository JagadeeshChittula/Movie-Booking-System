import { useState, useMemo } from 'react';
import {
  UtensilsCrossed,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  Plus,
  Minus,
  ShoppingBag,
  Coins,
  MapPin,
  Film,
  Armchair,
  Check,
  AlertCircle,
  Truck,
  Zap,
} from 'lucide-react';
import { bookingApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/format';

const MENU_ITEMS = [
  {
    id: 'c-combo-1',
    category: 'combos',
    name: 'Blockbuster Intermission Combo',
    desc: '1 Large Golden Butter Popcorn + 2 Large Fountain Cokes + 1 Loaded Cheesy Nachos. Save 20%!',
    price: 490,
    badge: 'Best Value',
    image: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-combo-2',
    category: 'combos',
    name: 'Solo Movie Meal',
    desc: '1 Medium Caramel Popcorn + 1 Cold Beverage + 1 Hot Samosa.',
    price: 320,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1572177191856-3cde618dee1f?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-pop-1',
    category: 'popcorn',
    name: 'Jumbo Golden Butter Popcorn',
    desc: 'Freshly popped warm American corn tossed in rich movie-theatre butter.',
    price: 250,
    badge: 'Cinema Classic',
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-pop-2',
    category: 'popcorn',
    name: 'Caramel & Cheddar Cheese Duo',
    desc: 'Artisanal sweet caramel popcorn blended with sharp cheddar cheese kernels.',
    price: 290,
    badge: 'Gourmet',
    image: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-bites-1',
    category: 'bites',
    name: 'Loaded Supreme Cheesy Nachos',
    desc: 'Crisp salted corn tortilla crisps served with warm melted jalapeno cheese sauce & salsa dip.',
    price: 220,
    badge: 'Fan Favorite',
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-bites-2',
    category: 'bites',
    name: 'Crispy Peri-Peri Chicken Burger',
    desc: 'Crunchy golden chicken patty with fiery peri-peri mayo, fresh lettuce and toasted brioche.',
    price: 260,
    badge: 'Chef Special',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-bites-3',
    category: 'bites',
    name: 'Cinema Samosa Duo with Chutney',
    desc: 'Two crispy spiced potato and green pea stuffed samosas with mint-coriander dip.',
    price: 130,
    badge: 'Hot Snack',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-drink-1',
    category: 'drinks',
    name: 'Chilled Coca-Cola Fountain (650ml)',
    desc: 'Ice-cold refreshing fizzy soda poured directly from the fountain.',
    price: 120,
    badge: 'Chilled',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-drink-2',
    category: 'drinks',
    name: 'Iced Mocha Frappe with Whipped Cream',
    desc: 'Rich roasted espresso blended with velvety Belgian chocolate and crushed ice.',
    price: 190,
    badge: 'Signature',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80',
  },
];

export default function SnacksPage() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [deliveryMode, setDeliveryMode] = useState('seat'); // 'seat' | 'counter'
  const [ticketInput, setTicketInput] = useState('');
  const [verifiedBooking, setVerifiedBooking] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const [counterSeatManual, setCounterSeatManual] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [useCoins, setUseCoins] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Handle ticket verification to get exact theatre, audi screen & seat
  const handleVerifyTicket = async (e) => {
    if (e) e.preventDefault();
    const clean = ticketInput.trim().replace(/^#/, '');
    if (!clean) {
      toast.error('Please enter your Ticket Code or Booking Reference');
      return;
    }

    setVerifying(true);
    try {
      const { data } = await bookingApi.lookupTicket(clean);
      setVerifiedBooking(data.booking);
      toast.success(`Ticket Verified! Delivering to Seat ${data.booking.seats?.join(', ')}`);
    } catch (err) {
      toast.error(err.message || 'Could not verify ticket code. Please check and retry.');
      setVerifiedBooking(null);
    } finally {
      setVerifying(false);
    }
  };

  const updateQuantity = (item, delta) => {
    setCart((prev) => {
      const current = prev[item.id]?.quantity || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return {
        ...prev,
        [item.id]: {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: next,
          image: item.image,
        },
      };
    });
  };

  const cartList = Object.values(cart);
  const cartSubtotal = cartList.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const availableCoins = user?.cineCoins ?? 150;
  const coinDiscount = useCoins ? Math.min(availableCoins, Math.floor(cartSubtotal * 0.4)) : 0;
  const cartTotal = Math.max(0, cartSubtotal - coinDiscount);

  const filteredItems = useMemo(() => {
    if (category === 'all') return MENU_ITEMS;
    return MENU_ITEMS.filter((i) => i.category === category);
  }, [category]);

  const handlePlaceOrder = async () => {
    if (cartList.length === 0) {
      toast.error('Please add snacks to your cart');
      return;
    }

    if (deliveryMode === 'seat' && !verifiedBooking) {
      toast.error('Please enter and verify your Ticket Code first so we know which seat to deliver to!');
      return;
    }

    setOrdering(true);
    try {
      const payload = {
        ticketCode: verifiedBooking ? verifiedBooking._id : ticketInput.trim(),
        seatNumber: verifiedBooking ? verifiedBooking.seats?.join(', ') : counterSeatManual || 'Counter Pickup',
        items: cartList.map((c) => ({
          id: c.id,
          name: c.name,
          quantity: c.quantity,
          price: c.price,
        })),
        totalAmount: cartTotal,
        coinsUsed: coinDiscount,
        customerName: user?.name || 'Guest',
      };

      const { data } = await bookingApi.orderSnacks(payload);
      setConfirmedOrder({
        orderId: data.orderId,
        seat: data.deliveredToSeat || (verifiedBooking ? verifiedBooking.seats?.join(', ') : 'Concession Counter'),
        theatre: data.theatreName || (verifiedBooking?.show?.theatre?.name || 'Cinema'),
        screen: data.screenName || (verifiedBooking?.show?.screen?.name || 'Auditorium'),
        movie: data.movieTitle || (verifiedBooking?.show?.movie?.title || 'Current Screening'),
        items: cartList,
        totalPaid: cartTotal,
        coinsSaved: coinDiscount,
      });
      setCart({});
      toast.success('Snack order confirmed! Delivering to your seat.');
    } catch (err) {
      toast.error(err.message || 'Could not place snack order');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem', maxWidth: 1200 }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(229, 9, 20, 0.15)',
            color: 'var(--accent)',
            padding: '0.4rem 1rem',
            borderRadius: '24px',
            fontSize: '0.85rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            marginBottom: '0.75rem',
          }}
        >
          <UtensilsCrossed size={16} />
          Cinema Concessions & Seat Delivery
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', margin: 0 }}>
          Order Snacks Directly to Your Seat
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 640, margin: '0.5rem auto 0' }}>
          Skip the long intermission counter queues! Enter your ticket number and we'll hand-deliver fresh hot snacks
          straight to your auditorium chair.
        </p>
      </div>

      {/* CONFIRMED ORDER SUCCESS MODAL / BANNER */}
      {confirmedOrder && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(16, 24, 39, 0.95) 100%)',
            border: '2px solid #22c55e',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            marginBottom: '2.5rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#22c55e', fontWeight: 800, fontSize: '1.25rem' }}>
                <CheckCircle size={26} />
                <span>Snack Order Placed Successfully!</span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
                Order Ref: <strong style={{ fontFamily: 'monospace', color: 'var(--gold)', fontSize: '1.05rem' }}>#{confirmedOrder.orderId}</strong>
              </p>
            </div>

            <div
              style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.5)',
                padding: '0.6rem 1.25rem',
                borderRadius: '12px',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#86efac', fontWeight: 700 }}>
                Delivery Destination
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>
                Seat {confirmedOrder.seat}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {confirmedOrder.theatre} · {confirmedOrder.screen}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Movie Screening</span>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 2 }}>{confirmedOrder.movie}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Items Ordered</span>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 2 }}>
                {confirmedOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Amount</span>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--gold)', marginTop: 2 }}>
                {formatCurrency(confirmedOrder.totalPaid)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Delivery Timing</span>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#38bdf8', marginTop: 2 }}>
                Hand-delivered at Intermission
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setConfirmedOrder(null)}
            style={{ marginTop: '1.25rem' }}
          >
            Order More Snacks
          </button>
        </div>
      )}

      {/* STEP 1: SEAT IDENTIFIER BAR */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          background: 'rgba(22, 22, 32, 0.85)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Armchair size={20} color="var(--accent)" />
              1. Where Should We Deliver Your Snacks?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>
              Enter the ticket reference code printed on your booking to locate your exact seat automatically.
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-hover)', padding: '3px', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <button
              type="button"
              className={`chip ${deliveryMode === 'seat' ? 'active' : ''}`}
              onClick={() => setDeliveryMode('seat')}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', border: 'none', borderRadius: '20px' }}
            >
              🚀 Seat In-Theatre Delivery
            </button>
            <button
              type="button"
              className={`chip ${deliveryMode === 'counter' ? 'active' : ''}`}
              onClick={() => setDeliveryMode('counter')}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', border: 'none', borderRadius: '20px' }}
            >
              🏪 Counter Pickup
            </button>
          </div>
        </div>

        {deliveryMode === 'seat' ? (
          <div>
            <form onSubmit={handleVerifyTicket} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  className="input"
                  placeholder="Enter Ticket Code (e.g. #8A37FF9F or CV-XXXXX)…"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  style={{ paddingLeft: '2.75rem', fontFamily: 'monospace', fontSize: '1rem' }}
                />
              </div>
              <button type="submit" className="btn btn--primary" disabled={verifying}>
                {verifying ? 'Locating Seat…' : 'Sync Ticket & Seat'}
              </button>
            </form>

            {/* Verified Seat Card */}
            {verifiedBooking && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'rgba(34, 197, 94, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#22c55e',
                    }}
                  >
                    <Check size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#22c55e' }}>
                      Target Seat: {verifiedBooking.seats?.join(', ')}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {verifiedBooking.show?.movie?.title} · {verifiedBooking.show?.theatre?.name} ({verifiedBooking.show?.screen?.name})
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: 'rgba(255,255,255,0.08)',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                    }}
                  >
                    REF #{verifiedBooking._id.slice(-8).toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
                    ✓ Delivery Locked to this Seat
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input"
              placeholder="Enter your Seat / Row (Optional, e.g. Row F Seat 12)"
              value={counterSeatManual}
              onChange={(e) => setCounterSeatManual(e.target.value)}
              style={{ flex: 1, minWidth: 260 }}
            />
          </div>
        )}
      </div>

      {/* STEP 2: CONCESSIONS MENU & CART */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Food Menu */}
        <div>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { id: 'all', label: '🍿 All Concessions' },
              { id: 'combos', label: '🔥 Value Combos' },
              { id: 'popcorn', label: '🧈 Gourmet Popcorn' },
              { id: 'bites', label: '🍔 Hot Fast Bites' },
              { id: 'drinks', label: '🥤 Chilled Beverages' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`chip ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
                style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', padding: '0.45rem 1rem' }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Food Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {filteredItems.map((item) => {
              const qty = cart[item.id]?.quantity || 0;
              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: qty > 0 ? '1px solid var(--accent)' : '1px solid var(--border)',
                    boxShadow: qty > 0 ? '0 8px 24px var(--accent-glow)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    {item.badge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          background: 'rgba(0,0,0,0.75)',
                          color: 'var(--gold)',
                          backdropFilter: 'blur(6px)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '16px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          border: '1px solid var(--gold)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 800 }}>{item.name}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
                        {item.desc}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--gold)' }}>
                        {formatCurrency(item.price)}
                      </span>

                      {qty === 0 ? (
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => updateQuantity(item, 1)}
                          style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                        >
                          <Plus size={14} style={{ marginRight: 4 }} />
                          Add
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-hover)', borderRadius: '20px', padding: '2px 8px' }}>
                          <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={() => updateQuantity(item, -1)}
                            style={{ padding: 4 }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', minWidth: 16, textAlign: 'center' }}>
                            {qty}
                          </span>
                          <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={() => updateQuantity(item, 1)}
                            style={{ padding: 4 }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Checkout Sidebar */}
        <aside
          className="checkout-sidebar"
          style={{
            position: 'sticky',
            top: 84,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
          }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1rem' }}>
            <ShoppingBag size={20} color="var(--accent)" />
            Snack Cart ({cartList.length})
          </h3>

          {/* Delivery target preview */}
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              background: verifiedBooking ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: verifiedBooking ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border)',
              marginBottom: '1rem',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>
              Delivering to
            </div>
            <div style={{ fontWeight: 800, color: verifiedBooking ? '#22c55e' : 'var(--text)', marginTop: 2 }}>
              {verifiedBooking ? `Seat ${verifiedBooking.seats?.join(', ')}` : 'Concessions Counter'}
            </div>
            {verifiedBooking && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {verifiedBooking.show?.theatre?.name}
              </div>
            )}
          </div>

          {/* Cart items list */}
          {cartList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Your cart is empty. Pick your favorite popcorn & drinks!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 240, overflowY: 'auto', marginBottom: '1rem' }}>
              {cartList.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <small style={{ color: 'var(--text-dim)' }}>
                      {item.quantity} × {formatCurrency(item.price)}
                    </small>
                  </div>
                  <strong style={{ color: 'var(--gold)' }}>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
          )}

          {/* CineCoins loyalty redemption */}
          {cartList.length > 0 && isAuthenticated && availableCoins > 0 && (
            <div
              style={{
                background: 'rgba(212, 168, 83, 0.08)',
                border: '1px solid rgba(212, 168, 83, 0.3)',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem' }}>
                <input
                  type="checkbox"
                  checked={useCoins}
                  onChange={(e) => setUseCoins(e.target.checked)}
                  style={{ accentColor: 'var(--gold)' }}
                />
                <span>
                  Redeem <strong>{Math.min(availableCoins, Math.floor(cartSubtotal * 0.4))} CineCoins</strong> (Save {formatCurrency(Math.min(availableCoins, Math.floor(cartSubtotal * 0.4)))})
                </span>
              </label>
            </div>
          )}

          {/* Pricing calculations */}
          <div className="checkout-line" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
            <span>Subtotal</span>
            <span>{formatCurrency(cartSubtotal)}</span>
          </div>

          {coinDiscount > 0 && (
            <div className="checkout-line" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: '#22c55e', fontSize: '0.85rem' }}>
              <span>CineCoins Discount</span>
              <span>- {formatCurrency(coinDiscount)}</span>
            </div>
          )}

          <div
            className="checkout-line total"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border)',
              fontWeight: 800,
              fontSize: '1.2rem',
              margin: '0.75rem 0 1.25rem',
            }}
          >
            <span>Total</span>
            <span style={{ color: 'var(--gold)' }}>{formatCurrency(cartTotal)}</span>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--block btn--lg"
            disabled={cartList.length === 0 || ordering}
            onClick={handlePlaceOrder}
          >
            {ordering ? 'Placing Order…' : 'Order Snacks Now'}
          </button>

          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '0.75rem' }}>
            Freshly prepared and brought by cinema staff during intermission.
          </p>
        </aside>
      </div>
    </div>
  );
}
