import { Country, State, City } from 'country-state-city';

// API endpoint for currency conversion (you can use free APIs like exchangerate-api.com, fixer.io, etc)
const CURRENCY_API_BASE = 'https://api.exchangerate-api.com/v4/latest';

// Cache for exchange rates to avoid excessive API calls
let exchangeRateCache = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export const countries = Country.getAllCountries().map(country => ({
  code: country.isoCode,
  name: country.name,
  currency: country.currency
}));


export const getCountryByCode = (code) => {
  return countries.find(country => country.code === code);
};

export const getStatesByCountry = (countryCode) => {
  return State.getStatesOfCountry(countryCode).map(state => ({
    code: state.isoCode,
    name: state.name
  }));
};

export const getCitiesByState = (countryCode, stateCode) => {
  return City.getCitiesOfState(countryCode, stateCode).map(city => city.name);
};

// Get exchange rate for a specific currency from cache or API
export const getExchangeRate = async (fromCurrency, toCurrency = 'INR') => {
  try {
    // Check cache first
    const now = Date.now();
    if (exchangeRateCache[fromCurrency] && (now - cacheTimestamp) < CACHE_DURATION) {
      const rates = exchangeRateCache[fromCurrency];
      return rates[toCurrency] || 1;
    }

    // Fetch from API if cache is stale
    const response = await fetch(`${CURRENCY_API_BASE}/${fromCurrency}`);
    if (!response.ok) {
      console.warn(`Failed to fetch exchange rates for ${fromCurrency}`);
      return 1; // Fallback to 1:1 ratio
    }

    const data = await response.json();
    exchangeRateCache[fromCurrency] = data.rates;
    cacheTimestamp = now;

    return data.rates[toCurrency] || 1;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 1; // Fallback to 1:1 ratio
  }
};

// Convert currency amount with API-based rates (async)
export const convertCurrency = async (amount, fromCurrency, toCurrency = 'INR') => {
  if (fromCurrency === toCurrency) return amount;

  try {
    const rate = await getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  } catch (error) {
    console.error('Currency conversion error:', error);
    return amount;
  }
};

// Format currency with code (no symbol)
export const formatCurrency = (amount, countryCode) => {
  const country = getCountryByCode(countryCode);
  const currency = country?.currency || 'USD';
  return `${amount} ${currency}`;
};

// Get all supported currencies with their codes
export const getSupportedCurrencies = () => {
  const currencies = new Set();
  countries.forEach(country => {
    if (country.currency) {
      currencies.add(country.currency);
    }
  });

  return Array.from(currencies).map(code => ({
    code,
    name: code
  }));
};

// Calculate distance between cities (simplified - in production use proper geolocation)
export const calculateDistance = (fromCity, toCity) => {
  return Math.floor(Math.random() * 1000) + 100;
};