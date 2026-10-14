import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import CartItem from '../components/CartItem.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { cartItems, cartLoading, cartError, totalItems, subtotal, refreshCart } = useCart();

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-12 sm:px-10">
        <h1 className="font-display text-3xl text-ink">My Cart</h1>

        <div className="mt-8">
          {cartLoading && (
            <p className="font-body text-sm text-charcoal/60">Loading your cart...</p>
          )}

          {!cartLoading && cartError && (
            <div className="flex flex-col items-start gap-3">
              <p role="alert" className="font-body text-sm text-rust">{cartError}</p>
              <button
                type="button"
                onClick={refreshCart}
                className="rounded-full bg-ink px-5 py-2 font-body text-sm text-paper transition-colors hover:bg-marigold hover:text-ink"
              >
                Try Again
              </button>
            </div>
          )}

          {!cartLoading && !cartError && cartItems.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <ShoppingCart size={32} strokeWidth={1.5} className="text-charcoal/30" />
              <p className="font-display text-lg text-ink">Your cart is empty</p>
              <p className="font-body text-sm text-charcoal/60">
                Looks like you haven't added anything yet.
              </p>
              <Link
                to="/products"
                className="mt-2 rounded-full bg-marigold px-6 py-2.5 font-body text-sm font-semibold text-ink transition-colors hover:bg-marigold-dark"
              >
                Browse Products
              </Link>
            </div>
          )}

          {!cartLoading && !cartError && cartItems.length > 0 && (
            <>
              <div>
                {cartItems
                  .filter((item) => item.product) // defensive: skip a row whose product was deleted
                  .map((item) => (
                    <CartItem key={item.product._id} item={item} />
                  ))}
              </div>

              {/* Order Summary — subtotal/count are read straight from
                  CartContext's derived values, never stored anywhere. */}
              <div className="mt-8 border-t border-charcoal/10 pt-6">
                <h2 className="font-display text-lg text-ink">Order Summary</h2>
                <div className="mt-3 flex justify-between font-body text-sm text-charcoal/70">
                  <span>Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="mt-1 flex justify-between font-body text-base font-semibold text-ink">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <Link
                  to="/checkout"
                  className="mt-6 block w-full rounded-full bg-marigold py-3 text-center font-body text-sm font-semibold text-ink transition-colors hover:bg-marigold-dark"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
