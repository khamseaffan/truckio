/** Format currency in INR */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** Format date as DD MMM YYYY */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Format time as HH:MM AM/PM */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Truncate address for display */
export function truncateAddress(address: string, maxLength = 40): string {
  if (address.length <= maxLength) return address;
  return address.substring(0, maxLength) + '...';
}
