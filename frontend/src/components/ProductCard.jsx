import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { addToWishlist, removeFromWishlist } from '../services/api.js';

// wishlisted: whether THIS product is already saved, as known by the
// parent (Products.jsx fetches the id list once on page load — see the
// note in that file for why this is a plain prop and not a context).
export default function ProductCard({ product, wishlisted = false }) {
  const inStock = product.stock > 0;
  const { addToCart, isPending, isInCart } = useCart();

  // Wishlist state is LOCAL to this card, on purpose — Lab 4 explicitly
  // does not require global state for the wishlist, unlike the cart.
  const [saved, setSaved] = useState(wishlisted);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [wishlistError, setWishlistError] = useState('');

  const [cartError, setCartError] = useState('');

  async function handleWishlistClick() {
    setWishlistBusy(true);
    setWishlistError('');
    try {
      if (saved) {
        await removeFromWishlist(product._id);
        setSaved(false);
      } else {
        await addToWishlist(product._id);
        setSaved(true);
      }
    } catch (err) {
      // A 409 here means another tab/click already saved it — treat
      // that as success rather than an error, since the end state
      // (saved) is exactly what the user wanted anyway.
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
    const result = await addToCart(product._id);
    if (!result.ok) {
      setCartError(result.message);
    }
  }

  const cartBusy = isPending(product._id);
  const alreadyInCart = isInCart(product._id);

  return (
    <div className="flex flex-col border border-charcoal/10 bg-paper">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="h-48 w-full object-cover"
        />
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={wishlistBusy}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={saved}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-paper/90 text-ink transition-colors hover:text-rust disabled:opacity-60"
        >
          <Heart size={16} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-rust' : ''} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="font-body text-xs uppercase tracking-wide text-charcoal/50">
          {product.category}
        </p>
        <h3 className="font-display text-lg text-ink">{product.name}</h3>
        <p className="font-body text-base font-semibold text-charcoal">
          ₹{product.price.toLocaleString('en-IN')}
        </p>
        <p className={`font-body text-xs ${inStock ? 'text-sage' : 'text-rust'}`}>
          {inStock ? `${product.stock} units left` : 'Out of stock'}
        </p>

        {wishlistError && (
          <p role="alert" className="font-body text-xs text-rust">{wishlistError}</p>
        )}
        {cartError && (
          <p role="alert" className="font-body text-xs text-rust">{cartError}</p>
        )}

        <div className="mt-3 flex flex-col gap-2">
          <Link
            to={`/products/${product._id}`}
            className="inline-block rounded-full bg-ink px-4 py-2 text-center font-body text-sm text-paper transition-colors hover:bg-marigold hover:text-ink"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={cartBusy || !inStock}
            className="rounded-full border border-ink px-4 py-2 font-body text-sm text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
          >
            {cartBusy ? 'Adding...' : alreadyInCart ? 'Add Another' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
