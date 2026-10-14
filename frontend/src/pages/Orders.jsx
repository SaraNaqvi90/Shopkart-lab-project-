import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import OrderCard from '../components/OrderCard.jsx';
import { getOrders } from '../services/api.js';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    getOrders()
      .then((res) => setOrders(res.data.orders))
      .catch(() => setError("We couldn't load your orders."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-12 sm:px-10">
        <h1 className="font-display text-3xl text-ink">My Orders</h1>

        <div className="mt-8">
          {loading && (
            <p className="font-body text-sm text-charcoal/60">Loading your orders...</p>
          )}

          {!loading && error && (
            <div className="flex flex-col items-start gap-3">
              <p role="alert" className="font-body text-sm text-rust">{error}</p>
              <button
                type="button"
                onClick={load}
                className="rounded-full bg-ink px-5 py-2 font-body text-sm text-paper transition-colors hover:bg-marigold hover:text-ink"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Package size={32} strokeWidth={1.5} className="text-charcoal/30" />
              <p className="font-display text-lg text-ink">No orders yet</p>
              <p className="font-body text-sm text-charcoal/60">
                When you place an order, it will show up here.
              </p>
              <Link
                to="/products"
                className="mt-2 rounded-full bg-marigold px-6 py-2.5 font-body text-sm font-semibold text-ink transition-colors hover:bg-marigold-dark"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
