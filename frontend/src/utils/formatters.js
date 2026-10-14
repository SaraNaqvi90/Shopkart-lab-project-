// "5 Oct 2026"
export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// 7497 -> "₹7,497"
export function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// A long Mongo id is unreadable; show the last 8 characters, like a receipt number.
export function shortOrderId(id) {
  return id.slice(-8).toUpperCase();
}
