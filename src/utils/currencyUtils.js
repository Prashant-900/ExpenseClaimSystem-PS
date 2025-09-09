// Currency conversion rates (simplified - in production use real-time API)
const exchangeRates = {
  'USD': 83.12,
  'EUR': 89.45,
  'GBP': 104.23,
  'JPY': 0.56,
  'CAD': 61.34,
  'AUD': 54.78,
  'SGD': 61.89,
  'INR': 1.00
};

export const getCurrencySymbol = (currency) => {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'SGD': 'S$',
    'INR': '₹'
  };
  return symbols[currency] || currency;
};

export const convertToINR = (amount, fromCurrency) => {
  if (fromCurrency === 'INR') return amount;
  const rate = exchangeRates[fromCurrency] || 1;
  return amount * rate;
};

export const formatCurrency = (amount, currency = 'INR') => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
};

export const getSupportedCurrencies = () => {
  return Object.keys(exchangeRates).map(code => ({
    code,
    symbol: getCurrencySymbol(code),
    name: code
  }));
};