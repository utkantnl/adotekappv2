import type { Quotation } from '../types';

export function calculateQuotationTotals(quotation: Quotation) {
  const { pricing, machines } = quotation;

  const subtotal =
    pricing.manualSubtotal ||
    machines.reduce((sum, m) => {
      const lineTotal = m.unitPrice * m.quantity;
      const lineDiscount = (lineTotal * (m.discount || 0)) / 100;
      return sum + (lineTotal - lineDiscount);
    }, 0);

  const discountAmount = (subtotal * pricing.discountRate) / 100;
  const taxableAmount = subtotal - discountAmount;
  const vatAmount = (taxableAmount * pricing.vatRate) / 100;
  const totalAmount = taxableAmount + vatAmount;

  const extraCostsTotal = (pricing.extraCosts || []).reduce(
    (sum, c) => sum + c.amount,
    0
  );

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    vatAmount,
    totalAmount: totalAmount + extraCostsTotal,
    extraCostsTotal,
  };
}

export function formatCurrency(price: number, currency: string) {
  const symbol = currency === 'TRY' ? '₺' : currency === 'EUR' ? '€' : '$';
  return `${symbol} ${new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)}`;
}

export function calculateMargin(cost: number, price: number) {
  if (price === 0) return { percentage: 0, amount: 0 };
  const amount = price - cost;
  const percentage = (amount / price) * 100;
  return { percentage, amount };
}
