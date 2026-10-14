import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import WishlistCard from '../components/WishlistCard.jsx';
import { getWishlist, removeFromWishlist } from '../services/api.js';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    getWishlist()
      .then((res) => setItems(res.data.wishlist))
      .catch(() => setError("We couldn't load your wishlist."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRemove(productId) {
    try {
      await removeFromWishlist(productId);
      // Drop it from the list locally instead of re-fetching the whole
      // wishlist — one less round trip, and the UI updates instantly.
      setItems((prev) => prev.filter((p) => p._id !== productId));
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message ?? 'Unable to remove product.' };
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
        <h1 className="font-display text-3xl text-ink">My Wishlist</h1>
        {!loading && !error && (
          <p className="mt-1 font-body text-sm text-charcoal/60">
            {items.length} {items.length === 1 ? 'product' : 'products'} saved
          </p>
        )}

        <div className="mt-10">
          {loading && (
            <p className="font-body text-sm text-charcoal/60">Loading your wishlist...</p>
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

          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Heart size={32} strokeWidth={1.5} className="text-charcoal/30" />
              <p className="font-display text-lg text-ink">Your wishlist is empty</p>
              <p className="font-body text-sm text-charcoal/60">
                Save products you love and find them here later.
              </p>
              <Link
                to="/products"
                className="mt-2 rounded-full bg-marigold px-6 py-2.5 font-body text-sm font-semibold text-ink transition-colors hover:bg-marigold-dark"
              >
                Browse Products
              </Link>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <WishlistCard key={product._id} product={product} onRemoved={handleRemove} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
