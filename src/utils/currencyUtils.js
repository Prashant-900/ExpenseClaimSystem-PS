// Fallback exchange rates
let exchangeRates = {
  'USD': 83.12,
  'EUR': 89.45,
  'GBP': 104.23,
  'JPY': 0.56,
  'CAD': 61.34,
  'AUD': 54.78,
  'SGD': 61.89,
  'INR': 1.00
};

// Fetch real-time exchange rates
const fetchExchangeRates = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
    const data = await response.json();
    
    // Convert to rates relative to INR
    const newRates = {};
    Object.keys(exchangeRates).forEach(currency => {
      if (currency === 'INR') {
        newRates[currency] = 1.00;
      } else {
        newRates[currency] = 1 / data.rates[currency];
      }
    });
    
    exchangeRates = newRates;
  } catch (error) {
    console.warn('Failed to fetch real-time exchange rates, using fallback rates');
  }
};

// Fetch rates on module load
fetchExchangeRates();

// Refresh rates every 30 minutes
setInterval(fetchExchangeRates, 30 * 60 * 1000);

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