const ugandanShillingFormatter = new Intl.NumberFormat('en-UG', {
  style: 'currency',
  currency: 'UGX',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) {
    return ugandanShillingFormatter.format(0);
  }

  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;

  return ugandanShillingFormatter.format(safeAmount);
}
