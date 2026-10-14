import { Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export default function CartItem({ item }) {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart, isPending } = useCart();

  const busy = isPending(product._id);
  const lineTotal = product.price * quantity;
  const atStockLimit = quantity >= product.stock;

  function handleDecrease() {
    // Spec's own rule: quantity 1 uses the explicit Remove action, not
    // a "-" that would silently delete the row.
    if (quantity <= 1) return;
    updateQuantity(product._id, quantity - 1);
  }

  function handleIncrease() {
    if (atStockLimit) return;
    updateQuantity(product._id, quantity + 1);
  }

  return (
    <div className="flex items-center gap-4 border-b border-charcoal/10 py-5">
      <img
        src={product.image}
        alt={product.name}
        className="h-20 w-20 shrink-0 object-cover"
      />

      <div className="flex-1">
        <p className="font-body text-xs uppercase tracking-wide text-charcoal/50">
          {product.category}
        </p>
        <h3 className="font-display text-base text-ink">{product.name}</h3>
        <p className="font-body text-sm text-charcoal/70">
          ₹{product.price.toLocaleString('en-IN')}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={busy || quantity <= 1}
          aria-label="Decrease quantity"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-charcoal/20 text-charcoal disabled:opacity-40"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center font-body text-sm text-ink">{quantity}</span>
        <button
          type="button"
          onClick={handleIncrease}
          disabled={busy || atStockLimit}
          aria-label="Increase quantity"
          title={atStockLimit ? 'No more stock available' : undefined}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-charcoal/20 text-charcoal disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </div>

      <p className="w-20 text-right font-body text-sm font-semibold text-charcoal">
        ₹{lineTotal.toLocaleString('en-IN')}
      </p>

      <button
        type="button"
        onClick={() => removeFromCart(product._id)}
        disabled={busy}
        className="font-body text-xs text-rust underline underline-offset-2 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
