import { Truck, ShieldCheck, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const COLLECTIONS = [
  {
    title: 'Spring Fashion',
    image: '/spring.avif',
  },
  {
    title: 'Everyday Accessories',
    image: '/everyday.avif',
  },
  {
    title: 'Home Essentials',
    image: '/home.avif',
  },
];
const TRUST_BADGES = [
  { icon: Truck, label: 'Free shipping', detail: 'On every order, no minimum' },
  { icon: ShieldCheck, label: 'Secure checkout', detail: 'Your data stays encrypted' },
  { icon: Headphones, label: '24/7 support', detail: 'Real people, real fast' },
];

export default function Home() {
  const { customer } = useAuth();
  const firstName = customer?.fullName?.split(' ')[0] ?? '';

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      {/* Hero */}
      <section className="grid gap-10 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="max-w-lg">
          <p className="font-body text-sm uppercase tracking-[0.08em] text-marigold-dark">
            Welcome back{firstName ? `, ${firstName}` : ''}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
            Discover your style
          </h1>
          <p className="mt-5 font-body text-base leading-relaxed text-charcoal/70">
            Shop the latest arrivals and everyday staples, picked for the way you actually
            shop &mdash; fast checkout, easy returns, no surprises.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-block rounded-full bg-marigold px-7 py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-marigold-dark"
          >
            Shop now
          </Link>
        </div>

        <img
          src="https://picsum.photos/seed/shopkart-hero/900/700"
          alt=""
          className="h-64 w-full object-cover sm:h-80 lg:h-[420px]"
        />
      </section>

      {/* Trust badges */}
      <section className="border-y border-charcoal/10 bg-paper-dim">
        <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-charcoal/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {TRUST_BADGES.map(({ icon: Icon, label, detail }) => (
            <div key={label} className="flex items-center gap-3 px-8 py-6">
              <Icon size={22} strokeWidth={1.5} className="shrink-0 text-marigold-dark" />
              <div>
                <p className="font-body text-sm font-semibold text-ink">{label}</p>
                <p className="font-body text-xs text-charcoal/55">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured collections */}
      <section id="collections" className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <h2 className="text-center font-display text-2xl text-ink sm:text-3xl">
          Featured Collections
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {COLLECTIONS.map((item) => (
            <figure key={item.title}>
              <img
                src={item.image}
                alt=""
                className="h-64 w-full object-cover"
              />
              <figcaption className="mt-3 text-center font-body text-sm text-charcoal/80">
                {item.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Account details — data straight from GET /customers/me */}
      <section className="border-t border-charcoal/10 px-6 py-14 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-xl text-charcoal">Your account</h2>
          <dl className="mt-6 divide-y divide-charcoal/10 border-y border-charcoal/10">
            <Detail label="Full name" value={customer?.fullName} />
            <Detail label="Email" value={customer?.email} />
            <Detail label="Phone number" value={customer?.phone} />
          </dl>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <dt className="font-body text-sm text-charcoal/50">{label}</dt>
      <dd className="font-body text-sm font-medium text-charcoal">{value}</dd>
    </div>
  );
}
