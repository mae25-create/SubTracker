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

export function parseMonthlyAmount(amountStr: string): number {
  if (!amountStr) return 0;
  
  // Extract the first number found in the string (handling commas as thousand separators)
  const match = amountStr.replace(/,/g, '').match(/[\d.]+/);
  if (!match) return 0;
  
  const value = parseFloat(match[0]);
  if (isNaN(value)) return 0;
  
  const lowerStr = amountStr.toLowerCase();
  if (lowerStr.includes('year') || lowerStr.includes('yr') || lowerStr.includes('annual')) {
    return value / 12;
  }
  if (lowerStr.includes('week') || lowerStr.includes('wk')) {
    return value * 4.333;
  }
  if (lowerStr.includes('day')) {
    return value * 30;
  }
  
  // Default to monthly
  return value;
}
