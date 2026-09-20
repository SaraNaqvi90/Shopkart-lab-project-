import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { loginCustomer } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const initialForm = { email: '', password: '' };

export default function Login() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginCustomer(form);
      login(res.data.customer);
      navigate('/home', { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid credentials.');
      } else {
        setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell eyebrow="Welcome back" tagline="Log in to pick up right where you left off.">
      <h1 className="font-display text-3xl text-charcoal">Log in</h1>
      <p className="mt-2 font-body text-sm text-charcoal/60">
        New to ShopKart?{' '}
        <Link to="/register" className="text-marigold-dark underline underline-offset-2">
          Create an account
        </Link>
      </p>

      {location.state?.justRegistered && (
        <p className="mt-4 font-body text-sm text-sage">
          Account created. Log in to continue.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <label className="block">
          <span className="font-body text-sm font-medium text-charcoal">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1.5 w-full border-0 border-b-2 border-charcoal/15 bg-transparent px-0 py-2 font-body text-charcoal outline-none transition-colors focus:border-marigold"
          />
        </label>

        <label className="block">
          <span className="font-body text-sm font-medium text-charcoal">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            className="mt-1.5 w-full border-0 border-b-2 border-charcoal/15 bg-transparent px-0 py-2 font-body text-charcoal outline-none transition-colors focus:border-marigold"
          />
        </label>

        {error && (
          <p role="alert" className="font-body text-sm text-rust">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-marigold py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-marigold-dark disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  );
}
