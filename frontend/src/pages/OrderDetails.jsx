import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { getOrderById } from '../services/api.js';
import { formatDate, shortOrderId } from '../utils/formatters.js';

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();

  // Set by Checkout.jsx through navigate(..., { state }) right after payment.
  // It is gone after a refresh, or when you open this page from My Orders,
  // which is exactly what we want: the banner is only for "just placed".
  const justPlaced = location.state?.justPlaced === true;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setOrder(null);

    getOrderById(id)
      .then((res) => setOrder(res.data.order))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Order not found.');
        } else if (err.response?.status === 400) {
          setError('That order link looks invalid.');
        } else {
          setError('Something went wrong while loading this order.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-12 sm:px-10">
        <Link to="/orders" className="font-body text-sm text-marigold-dark underline underline-offset-2">
          ← My orders
        </Link>

        {loading && (
          <p className="mt-8 font-body text-sm text-charcoal/60">Loading order...</p>
        )}

        {!loading && error && (
          <p role="alert" className="mt-8 font-body text-sm text-rust">{error}</p>
        )}

        {!loading && !error && order && (
          <>
            {justPlaced && (
              <div className="mt-6 flex items-start gap-3 border border-sage/40 bg-sage/10 p-4">
                <CheckCircle size={20} className="mt-0.5 shrink-0 text-sage" />
                <div>
                  <p className="font-display text-lg text-ink">Order placed successfully</p>
                  <p className="font-body text-sm text-charcoal/70">
                    Thank you! Your payment was confirmed.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl text-ink">
                  Order #{shortOrderId(order._id)}
                </h1>
                <p className="mt-1 font-body text-sm text-charcoal/60">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="mt-8">
              {/* Prices come from the order's own SNAPSHOT, never from the live product. */}
              <OrderSummary
                title="Items"
                lines={order.items.map((item) => ({
                  key: item.product,
                  name: item.name,
                  image: item.image,
                  price: item.price,
                  quantity: item.quantity,
                }))}
                total={order.totalAmount}
              />
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <h2 className="font-display text-lg text-ink">Shipping address</h2>
                <address className="mt-2 font-body text-sm not-italic leading-relaxed text-charcoal/70">
                  {order.shippingAddress.fullName}
                  <br />
                  {order.shippingAddress.addressLine1}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  <br />
                  Phone: {order.shippingAddress.phone}
                </address>
              </div>

              <div>
                <h2 className="font-display text-lg text-ink">Payment</h2>
                <p className="mt-2 font-body text-sm text-charcoal/70">
                  Status: {order.paymentStatus === 'PAID' ? 'Paid' : order.paymentStatus}
                </p>
                {order.razorpayPaymentId && (
                  <p className="mt-1 break-all font-body text-xs text-charcoal/50">
                    Payment ID: {order.razorpayPaymentId}
                  </p>
                )}
              </div>
            </div>

            <Link
              to="/products"
              className="mt-10 inline-block rounded-full bg-marigold px-6 py-2.5 font-body text-sm font-semibold text-ink transition-colors hover:bg-marigold-dark"
            >
              Continue Shopping
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
