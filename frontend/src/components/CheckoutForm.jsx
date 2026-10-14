const FIELDS = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name' },
  { name: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', inputMode: 'numeric' },
  { name: 'addressLine1', label: 'Address', autoComplete: 'address-line1' },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'state', label: 'State', autoComplete: 'address-level1' },
  { name: 'pincode', label: 'Pincode', autoComplete: 'postal-code', inputMode: 'numeric' },
];

// A "controlled" form: it owns NO state. The values and errors come in as
// props from Checkout.jsx, and every keystroke is reported back through
// onChange. That keeps all the checkout state in one place.
export default function CheckoutForm({ form, errors, onChange, disabled }) {
  return (
    <div className="space-y-5">
      {FIELDS.map(({ name, label, type = 'text', autoComplete, inputMode }) => (
        <label key={name} className="block">
          <span className="font-body text-sm font-medium text-charcoal">{label}</span>
          <input
            name={name}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            value={form[name]}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={errors[name] ? 'true' : 'false'}
            className="mt-1.5 w-full border-0 border-b-2 border-charcoal/15 bg-transparent px-0 py-2 font-body text-charcoal outline-none transition-colors focus:border-marigold disabled:opacity-60"
          />
          {errors[name] && (
            <span role="alert" className="mt-1 block font-body text-xs text-rust">
              {errors[name]}
            </span>
          )}
        </label>
      ))}
    </div>
  );
}
