import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// 'to: null' entries are still decorative placeholders — no page for
// them yet. 'Shop' is real now that /products exists.
const NAV_LINKS = [
  { label: 'Shop', to: '/products' },
  { label: 'New Arrivals', to: null },
  { label: 'Best Sellers', to: null },
  { label: 'Contact', to: null },
];

export default function Navbar() {
  const { customer, logout } = useAuth();
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
        {NAV_LINKS.map(({ label, to }) =>
          to ? (
            <Link
              key={label}
              to={to}
              className="font-body text-sm text-paper/70 transition-colors hover:text-marigold"
            >
              {label}
            </Link>
          ) : (
            <a
              key={label}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="font-body text-sm text-paper/70 transition-colors hover:text-marigold"
            >
              {label}
            </a>
          ),
        )}
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
