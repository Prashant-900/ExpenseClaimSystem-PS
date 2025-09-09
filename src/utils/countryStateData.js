import { Country, State, City } from 'country-state-city';

const currencyData = {
  'US': { currency: 'USD', symbol: '$', toINR: 83.12 },
  'IN': { currency: 'INR', symbol: '₹', toINR: 1 },
  'GB': { currency: 'GBP', symbol: '£', toINR: 105.45 },
  'CA': { currency: 'CAD', symbol: 'C$', toINR: 61.23 },
  'AU': { currency: 'AUD', symbol: 'A$', toINR: 53.78 },
  'DE': { currency: 'EUR', symbol: '€', toINR: 89.67 },
  'SG': { currency: 'SGD', symbol: 'S$', toINR: 61.89 },
  'FR': { currency: 'EUR', symbol: '€', toINR: 89.67 },
  'JP': { currency: 'JPY', symbol: '¥', toINR: 0.56 },
  'CN': { currency: 'CNY', symbol: '¥', toINR: 11.45 }
};

export const countries = Country.getAllCountries().map(country => ({
  code: country.isoCode,
  name: country.name,
  ...currencyData[country.isoCode] || { currency: 'USD', symbol: '$', toINR: 83.12 }
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

export const convertCurrency = (amount, fromCountry, toCountry = 'IN') => {
  const from = getCountryByCode(fromCountry);
  const to = getCountryByCode(toCountry);
  if (!from || !to) return amount;
  
  // Convert to INR first, then to target currency
  const inINR = amount * from.toINR;
  return inINR / to.toINR;
};

export const formatCurrency = (amount, countryCode) => {
  const country = getCountryByCode(countryCode);
  if (!country) return `${amount}`;
  return `${country.symbol}${amount.toFixed(2)}`;
};

export const calculateDistance = (fromCity, toCity) => {
  return Math.floor(Math.random() * 1000) + 100;
};