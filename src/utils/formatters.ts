export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num || 0);
};

export const formatPercent = (percent: number, decimals: number = 1): string => {
  return `${(percent || 0).toFixed(decimals)}%`;
};

export const formatDateIndo = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const getDaysUntilExpiry = (expiryDateStr?: string): number | null => {
  if (!expiryDateStr) return null;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = expiryDateStr.split('-');
    const exp = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};
