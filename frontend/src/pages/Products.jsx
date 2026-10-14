import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { getProducts, getWishlist } from '../services/api.js';

export default function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Set of product ids already in the user's wishlist — fetched ONCE,
  // separately from the product list. This is deliberately plain local
  // state, not a context: Lab 4 said state management isn't required
  // for wishlist, unlike cart (Lab 5), which genuinely needs it because
  // cart data has to stay in sync across the navbar AND this page AND
  // the cart page simultaneously. Wishlist "saved" status only needs to
  // be known right here, once, when each card first renders.
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  useEffect(() => {
    getWishlist()
      .then((res) => setWishlistedIds(new Set(res.data.wishlist.map((p) => p._id))))
      .catch(() => {
        // Non-fatal: worst case, a saved product's heart just starts
        // unfilled until clicked, instead of blocking the whole page.
      });
  }, []);

  // Debounced: waits 300ms after the last keystroke/change before firing
  // the request, so typing "phone" doesn't send 5 separate API calls.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError('');

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;

      getProducts(params)
        .then((res) => setProducts(res.data.products))
        .catch(() => setError('Something went wrong while loading products.'))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, category]);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
        <h1 className="font-display text-3xl text-ink">Products</h1>

        <div className="mt-6">
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
          />
        </div>

        <div className="mt-10">
          {loading && (
            <p className="font-body text-sm text-charcoal/60">Loading products...</p>
          )}

          {!loading && error && (
            <p role="alert" className="font-body text-sm text-rust">
              {error}
            </p>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="font-body text-sm text-charcoal/60">No products found.</p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  wishlisted={wishlistedIds.has(product._id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
