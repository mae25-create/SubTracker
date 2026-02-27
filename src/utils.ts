export function getDaysUntilExpiry(dateString: string): number | null {
  if (!dateString) return null;
  const expiry = new Date(dateString);
  if (isNaN(expiry.getTime())) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
