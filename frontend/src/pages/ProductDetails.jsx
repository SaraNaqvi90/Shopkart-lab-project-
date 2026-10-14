import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { getProductById, getWishlist, addToWishlist, removeFromWishlist } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [saved, setSaved] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [wishlistError, setWishlistError] = useState('');
  const [cartError, setCartError] = useState('');

  const { addToCart, isPending, isInCart } = useCart();

  useEffect(() => {
    setLoading(true);
    setError('');
    setProduct(null);

    getProductById(id)
      .then((res) => setProduct(res.data.product))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Product not found.');
        } else if (err.response?.status === 400) {
          setError('That product link looks invalid.');
        } else {
          setError('Something went wrong while loading this product.');
        }
      })
      .finally(() => setLoading(false));

    // Same "check once on load" approach as Products.jsx — this page's
    // wishlist heart shouldn't start unfilled for a product that's
    // already saved just because we didn't bother checking.
    getWishlist()
      .then((res) => setSaved(res.data.wishlist.some((p) => p._id === id)))
      .catch(() => {});
  }, [id]);

  async function handleWishlistClick() {
    setWishlistBusy(true);
    setWishlistError('');
    try {
      if (saved) {
        await removeFromWishlist(id);
        setSaved(false);
      } else {
        await addToWishlist(id);
        setSaved(true);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setSaved(true);
      } else {
        setWishlistError('Unable to save product.');
      }
    } finally {
      setWishlistBusy(false);
    }
  }

  async function handleAddToCart() {
    setCartError('');
    const result = await addToCart(id);
    if (!result.ok) setCartError(result.message);
  }

  const cartBusy = isPending(id);
  const alreadyInCart = isInCart(id);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
        <Link
          to="/products"
          className="font-body text-sm text-marigold-dark underline underline-offset-2"
        >
          ← Back to products
        </Link>

        {loading && (
          <p className="mt-8 font-body text-sm text-charcoal/60">Loading product...</p>
        )}

        {!loading && error && (
          <p role="alert" className="mt-8 font-body text-sm text-rust">
            {error}
          </p>
        )}

        {!loading && !error && product && (
          <div className="mt-8 grid gap-10 sm:grid-cols-2">
            <img
              src={product.image}
              alt={product.name}
              className="h-80 w-full object-cover sm:h-full"
            />

            <div>
              <div className="flex items-start justify-between gap-4">
                <p className="font-body text-xs uppercase tracking-wide text-charcoal/50">
                  {product.category}
                </p>
                <button
                  type="button"
                  onClick={handleWishlistClick}
                  disabled={wishlistBusy}
                  aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-pressed={saved}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-charcoal/15 text-ink transition-colors hover:text-rust disabled:opacity-60"
                >
                  <Heart size={16} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-rust' : ''} />
                </button>
              </div>

              <h1 className="mt-2 font-display text-3xl text-ink">{product.name}</h1>
              <p className="mt-4 font-body text-2xl font-semibold text-charcoal">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
              <p className="mt-4 font-body text-sm leading-relaxed text-charcoal/70">
                {product.description}
              </p>
              <p
                className={`mt-4 font-body text-sm ${
                  product.stock > 0 ? 'text-sage' : 'text-rust'
                }`}
              >
                {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
              </p>

              {wishlistError && (
                <p role="alert" className="mt-2 font-body text-xs text-rust">{wishlistError}</p>
              )}
              {cartError && (
                <p role="alert" className="mt-2 font-body text-xs text-rust">{cartError}</p>
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={cartBusy || product.stock === 0}
                className="mt-8 w-full rounded-full bg-marigold py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-marigold-dark disabled:opacity-50 sm:w-auto sm:px-8"
              >
                {cartBusy ? 'Adding...' : alreadyInCart ? 'Add Another' : 'Add to Cart'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
