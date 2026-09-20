import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getProductById } from '../services/api.js';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, [id]);

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
              <p className="font-body text-xs uppercase tracking-wide text-charcoal/50">
                {product.category}
              </p>
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

              {/* UI only for now — cart functionality lands in Lab 04 */}
              <button
                type="button"
                className="mt-8 w-full rounded-full bg-marigold py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-marigold-dark sm:w-auto sm:px-8"
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
