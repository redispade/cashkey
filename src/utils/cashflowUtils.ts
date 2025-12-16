
/**
 * Formats a number as a currency string
 */
export const formatCurrency = (amount: number) => {
  const formattedAmount = new Intl.NumberFormat('sq-AL', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `Lek ${formattedAmount}`;
};
