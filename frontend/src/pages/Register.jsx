import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { registerCustomer } from '../services/api.js';

const initialForm = { fullName: '', email: '', password: '', phone: '' };

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!form.email.trim()) {
    errors.email = 'Enter your email.';
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.password) {
    errors.password = 'Create a password.';
  } else if (form.password.length < 6) {
    errors.password = 'Password must contain at least 6 characters.';
  }
  if (!form.phone.trim()) errors.phone = 'Enter your phone number.';
  return errors;
}

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await registerCustomer(form);
      navigate('/login', { state: { justRegistered: true } });
    } catch (err) {
      setServerError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell eyebrow="New here" tagline="Create an account to start filling your kart.">
      <h1 className="font-display text-3xl text-charcoal">Create your account</h1>
      <p className="mt-2 font-body text-sm text-charcoal/60">
        Already shopping with us?{' '}
        <Link to="/login" className="text-marigold-dark underline underline-offset-2">
          Log in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <Field
          label="Full name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          error={errors.fullName}
          autoComplete="name"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />
        <Field
          label="Phone number"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
          autoComplete="tel"
        />

        {serverError && (
          <p role="alert" className="font-body text-sm text-rust">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-marigold py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-marigold-dark disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}

function Field({ label, name, error, ...inputProps }) {
  return (
    <label className="block">
      <span className="font-body text-sm font-medium text-charcoal">{label}</span>
      <input
        id={name}
        name={name}
        {...inputProps}
        className="mt-1.5 w-full border-0 border-b-2 border-charcoal/15 bg-transparent px-0 py-2 font-body text-charcoal outline-none transition-colors focus:border-marigold"
      />
      {error && (
        <span className="mt-1 block font-body text-xs text-rust">{error}</span>
      )}
    </label>
  );
}
