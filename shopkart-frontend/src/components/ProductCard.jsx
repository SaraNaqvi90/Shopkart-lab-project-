import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const inStock = product.stock > 0;

  return (
    <div className="flex flex-col border border-charcoal/10 bg-paper">
      <img
        src={product.image}
        alt={product.name}
        className="h-48 w-full object-cover"
      />
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
        <Link
          to={`/products/${product._id}`}
          className="mt-3 inline-block rounded-full bg-ink px-4 py-2 text-center font-body text-sm text-paper transition-colors hover:bg-marigold hover:text-ink"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
