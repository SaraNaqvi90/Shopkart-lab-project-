import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

// Lab 5 explicitly asks for "Products | Wishlist | Cart (n) | Logout" —
// this replaces the earlier decorative placeholder links (New Arrivals,
// Best Sellers, Contact) that never went anywhere. The ShopKart wordmark
// itself already links to /home, so a separate "Home" link would be
// redundant with it.
const NAV_LINKS = [
  { label: 'Products', to: '/products' },
  { label: 'Wishlist', to: '/wishlist', icon: Heart },
  { label: 'Orders', to: '/orders' },
];

export default function Navbar() {
  const { customer, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="flex items-center justify-between gap-6 border-b border-ink/10 bg-ink px-6 py-4 sm:px-10">
      <Link to="/home" className="font-display text-xl tracking-tight text-paper">
        ShopKart
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map(({ label, to }) => (
          <Link
            key={label}
            to={to}
            className="font-body text-sm text-paper/70 transition-colors hover:text-marigold"
          >
            {label}
          </Link>
        ))}

        {/* Cart count is read from CartContext — never hardcoded, and
            it updates the instant addToCart/updateQuantity/removeFromCart
            resolve anywhere else in the app, with no page refresh. */}
        <Link
          to="/cart"
          className="flex items-center gap-1.5 font-body text-sm text-paper/70 transition-colors hover:text-marigold"
        >
          <ShoppingCart size={15} strokeWidth={1.75} />
          Cart{totalItems > 0 ? ` (${totalItems})` : ''}
        </Link>
      </nav>

      {customer && (
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 font-body text-sm text-paper/70 sm:flex">
            <User size={15} strokeWidth={1.75} />
            {customer.fullName}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-paper/25 px-4 py-1.5 font-body text-sm text-paper transition-colors hover:border-marigold hover:text-marigold"
          >
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
