export const STATUSES = [ 'pending', 'processing', 'shipped', 'completed', 'cancelled', 'returned', ];

export function normalizeStatus(s) {
  const x = String(s || '').toLowerCase();
  if (x === 'complete') return 'completed';
  if (x === 'cancel') return 'cancelled';
  if (x === 'return') return 'returned';
  return x;
}

export function isLocked(current) {
  const c = normalizeStatus(current);
  return c === 'returned' || c === 'cancelled';
}

export function canTransition(current, next) {
  const c = normalizeStatus(current);
  const n = normalizeStatus(next);
  if (!n || n === c) return false;
  if (isLocked(c)) return false;
  if (c === 'completed') return n === 'returned';
  if (n === 'returned') return c === 'completed';
  return true;
}

export function statusBgClass(s) {
  switch (normalizeStatus(s)) {
    case 'pending': return 'bg-yellow-100';
    case 'processing': return 'bg-blue-100';
    case 'shipped': return 'bg-indigo-100';
    case 'completed': return 'bg-green-100';
    case 'cancelled': return 'bg-red-100';
    case 'returned': return 'bg-orange-100';
    default: return 'bg-gray-100';
  }
}
