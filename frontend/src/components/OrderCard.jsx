import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { formatDate, formatPrice, shortOrderId } from '../utils/formatters.js';

export default function OrderCard({ order }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col gap-3 border border-charcoal/10 bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-body text-xs uppercase tracking-wide text-charcoal/50">
          Order #{shortOrderId(order._id)}
        </p>
        <p className="mt-1 font-body text-sm text-charcoal/70">
          {formatDate(order.createdAt)} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
        <div className="mt-2">
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <p className="font-display text-lg text-ink">{formatPrice(order.totalAmount)}</p>
        <Link
          to={`/orders/${order._id}`}
          className="rounded-full bg-ink px-4 py-2 font-body text-sm text-paper transition-colors hover:bg-marigold hover:text-ink"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
