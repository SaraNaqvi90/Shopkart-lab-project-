import { formatPrice } from '../utils/formatters.js';

// Read-only list of what is being bought. It takes a simple, neutral shape
// ("lines") so the SAME component works for the live cart on /checkout and
// for the frozen snapshot on an order's details page.
//   lines: [{ key, name, image, price, quantity }]
export default function OrderSummary({ title = 'Order Summary', lines, total }) {
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="border border-charcoal/10 bg-paper p-5">
      <h2 className="font-display text-lg text-ink">{title}</h2>

      <ul className="mt-4 divide-y divide-charcoal/10">
        {lines.map((line) => (
          <li key={line.key} className="flex items-center gap-3 py-3">
            <img src={line.image} alt={line.name} className="h-12 w-12 shrink-0 object-cover" />
            <div className="flex-1">
              <p className="font-body text-sm text-ink">{line.name}</p>
              <p className="font-body text-xs text-charcoal/60">
                {line.quantity} × {formatPrice(line.price)}
              </p>
            </div>
            <p className="font-body text-sm font-semibold text-charcoal">
              {formatPrice(line.price * line.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between border-t border-charcoal/10 pt-4 font-body text-sm text-charcoal/70">
        <span>Items</span>
        <span>{itemCount}</span>
      </div>
      <div className="mt-1 flex justify-between font-body text-base font-semibold text-ink">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
