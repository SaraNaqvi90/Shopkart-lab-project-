import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { getProducts } from '../services/api.js';

export default function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
