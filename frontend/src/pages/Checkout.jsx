import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import CheckoutForm from '../components/CheckoutForm.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { createPaymentOrder, verifyPayment } from '../services/api.js';
import { loadRazorpay } from '../utils/loadRazorpay.js';
import { validateShipping } from '../utils/validateShipping.js';
import { formatPrice } from '../utils/formatters.js';

export default function Checkout() {
  const { customer } = useAuth();
  const { cartItems, cartLoading, cartError, subtotal, refreshCart, clearCartState } = useCart();
  const navigate = useNavigate();

  // The shipping form lives HERE, as local state. Nothing else in the app
  // needs it, so it does not belong in a global context.
  const [form, setForm] = useState({
    fullName: customer?.fullName ?? '',
    phone: customer?.phone ?? '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  // The guard below sends people with an EMPTY cart back to /cart. But right
  // after a successful payment the cart is empty too, and that is expected.
  // This flag tells the guard to stand down, so the code stays correct no
  // matter how React happens to order the "cart cleared" and "navigate away"
  // updates.
  const orderCompleted = useRef(false);

  // Empty-cart guard. We wait until the cart has FINISHED loading, because
  // "still loading" and "really empty" look identical (both have no items).
  useEffect(() => {
    if (!cartLoading && !cartError && cartItems.length === 0 && !orderCompleted.current) {
      navigate('/cart', { replace: true });
    }
  }, [cartLoading, cartError, cartItems.length, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined })); // clear that field's error as they type
  }

  async function handlePay(e) {
    e.preventDefault();
    if (paying) return;

    // 1) Validate in the browser first. If it fails we never call the backend.
    const validationErrors = validateShipping(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setPaying(true);
    setPayError('');

    try {
      // 2) Ask OUR server to validate everything and create the payment order.
      //    We send ONLY the address: no items, no prices, no total.
      const { data } = await createPaymentOrder({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        addressLine1: form.addressLine1.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      });

      // 3) Load Razorpay's popup script.
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        setPayError('Unable to load the payment gateway. Check your connection and try again.');
        setPaying(false);
        return;
      }

      // 4) Open the popup. Razorpay reports the outcome through callbacks.
      const razorpay = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'ShopKart',
        description: 'ShopKart Order',
        order_id: data.razorpayOrderId,
        prefill: { name: form.fullName.trim(), contact: form.phone.trim() },
        theme: { color: '#e8a33d' },

        // Outcome A: the customer paid inside the popup.
        // This is a CLAIM, not proof. Our server must verify it.
        handler: async (response) => {
          try {
            const verified = await verifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            orderCompleted.current = true; // tell the empty-cart guard this is expected
            clearCartState(); // navbar count and cart page update immediately
            navigate(`/orders/${verified.data.order._id}`, {
              replace: true,
              state: { justPlaced: true },
            });
          } catch {
            // The money may already have been taken, so do NOT say "payment failed".
            setPayError(
              'We could not confirm your payment. Please do not pay again. Check My Orders, or contact support.'
            );
            setPaying(false);
          }
        },

        // Outcome C: the customer closed the popup without paying.
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      });

      // Outcome B: the payment failed (declined card, wrong OTP, ...).
      razorpay.on('payment.failed', (response) => {
        setPayError(
          `Payment failed: ${response.error?.description ?? 'please try again'}. Your cart has not been cleared.`
        );
        setPaying(false);
      });

      razorpay.open();
    } catch (err) {
      // createPaymentOrder was rejected: empty cart, no stock, bad address, server error...
      setPayError(err.response?.data?.message ?? 'Something went wrong. Your cart is unchanged.');
      setPaying(false);
    }
  }

  // ---- What to show ----

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <p className="px-6 py-12 font-body text-sm text-charcoal/60 sm:px-10">
          Loading your cart...
        </p>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="flex flex-col items-start gap-3 px-6 py-12 sm:px-10">
          <p role="alert" className="font-body text-sm text-rust">{cartError}</p>
          <button
            type="button"
            onClick={refreshCart}
            className="rounded-full bg-ink px-5 py-2 font-body text-sm text-paper transition-colors hover:bg-marigold hover:text-ink"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty cart: the effect above is already redirecting, so render nothing.
  if (cartItems.length === 0) return null;

  const lines = cartItems
    .filter((item) => item.product)
    .map((item) => ({
      key: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      quantity: item.quantity,
    }));

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
        <Link to="/cart" className="font-body text-sm text-marigold-dark underline underline-offset-2">
          ← Back to cart
        </Link>
        <h1 className="mt-4 font-display text-3xl text-ink">Checkout</h1>

        <form onSubmit={handlePay} noValidate className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="font-display text-lg text-ink">Shipping details</h2>
            <div className="mt-5">
              <CheckoutForm form={form} errors={errors} onChange={handleChange} disabled={paying} />
            </div>
          </div>

          <div>
            <OrderSummary lines={lines} total={subtotal} />

            {payError && (
              <p role="alert" className="mt-4 font-body text-sm text-rust">
                {payError}
              </p>
            )}

            <button
              type="submit"
              disabled={paying}
              className="mt-5 w-full rounded-full bg-marigold py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-marigold-dark disabled:opacity-60"
            >
              {paying ? 'Processing...' : `Place Order · ${formatPrice(subtotal)}`}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
