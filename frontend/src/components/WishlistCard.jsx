import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function WishlistCard({ product, onRemoved }) {
  const inStock = product.stock > 0;
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');

  async function handleRemove() {
    setRemoving(true);
    setError('');
    const result = await onRemoved(product._id);
    if (!result?.ok) {
      setError(result?.message ?? 'Unable to remove product.');
      setRemoving(false);
    }
    // On success, the parent removes this card from the list entirely —
    // no need to reset `removing` here, this component is about to unmount.
  }

  return (
    <div className="flex flex-col border border-charcoal/10 bg-paper">
      <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
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

        {error && <p role="alert" className="font-body text-xs text-rust">{error}</p>}

        <div className="mt-3 flex flex-col gap-2">
          <Link
            to={`/products/${product._id}`}
            className="inline-block rounded-full bg-ink px-4 py-2 text-center font-body text-sm text-paper transition-colors hover:bg-marigold hover:text-ink"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="rounded-full border border-rust px-4 py-2 font-body text-sm text-rust transition-colors hover:bg-rust hover:text-paper disabled:opacity-50"
          >
            {removing ? 'Removing...' : 'Remove ♥'}
          </button>
        </div>
      </div>
    </div>
  );
}
