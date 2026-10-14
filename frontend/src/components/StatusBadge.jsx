const STYLES = {
  PENDING_PAYMENT: 'bg-charcoal/10 text-charcoal',
  PLACED: 'bg-marigold/25 text-ink',
  CONFIRMED: 'bg-sage/20 text-ink',
  SHIPPED: 'bg-ink/10 text-ink',
  DELIVERED: 'bg-sage text-paper',
};

const LABELS = {
  PENDING_PAYMENT: 'Pending payment',
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 font-body text-xs font-semibold ${
        STYLES[status] ?? 'bg-charcoal/10 text-charcoal'
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
