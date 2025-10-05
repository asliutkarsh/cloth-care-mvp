// Currency formatting utility for the ClothCare app

// Currency symbols and formatting options
const CURRENCY_CONFIG = {
  INR: { symbol: '₹', position: 'before', locale: 'en-IN' },
  USD: { symbol: '$', position: 'before', locale: 'en-US' },
  EUR: { symbol: '€', position: 'before', locale: 'en-EU' },
  GBP: { symbol: '£', position: 'before', locale: 'en-GB' },
  JPY: { symbol: '¥', position: 'before', locale: 'ja-JP' },
  CAD: { symbol: 'C$', position: 'before', locale: 'en-CA' },
  AUD: { symbol: 'A$', position: 'before', locale: 'en-AU' },
  CHF: { symbol: 'CHF', position: 'before', locale: 'de-CH' },
  CNY: { symbol: '¥', position: 'before', locale: 'zh-CN' },
  SEK: { symbol: 'kr', position: 'after', locale: 'sv-SE' },
};

/**
 * Formats a price amount with the specified currency
 * @param {number} amount - The price amount to format
 * @param {string} currency - The currency code (INR, USD, EUR, etc.)
 * @param {boolean} showSymbol - Whether to show the currency symbol (default: true)
 * @param {number} decimals - Number of decimal places (default: 2, except for JPY which is 0)
 * @returns {string} Formatted price string
 */
export function formatPrice(amount, currency = 'INR', showSymbol = true, decimals = null) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'N/A';
  }

  const config = CURRENCY_CONFIG[currency];
  if (!config) {
    console.warn(`Unknown currency: ${currency}. Falling back to INR.`);
    return formatPrice(amount, 'INR', showSymbol, decimals);
  }

  // Default decimal places based on currency
  const defaultDecimals = currency === 'JPY' ? 0 : 2;
  const finalDecimals = decimals !== null ? decimals : defaultDecimals;

  // Format the number
  const formattedAmount = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: finalDecimals,
    maximumFractionDigits: finalDecimals,
  }).format(amount);

  // Add currency symbol
  if (showSymbol) {
    if (config.position === 'before') {
      return `${config.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${config.symbol}`;
    }
  }

  return formattedAmount;
}

/**
 * Formats a price range (e.g., "₹1,500 - ₹3,000")
 * @param {number} minAmount - Minimum price
 * @param {number} maxAmount - Maximum price
 * @param {string} currency - Currency code
 * @param {boolean} showSymbol - Whether to show currency symbols
 * @returns {string} Formatted price range
 */
export function formatPriceRange(minAmount, maxAmount, currency = 'INR', showSymbol = true) {
  const formattedMin = formatPrice(minAmount, currency, showSymbol);
  const formattedMax = formatPrice(maxAmount, currency, showSymbol);

  return `${formattedMin} - ${formattedMax}`;
}

/**
 * Gets the currency symbol for a given currency code
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currency = 'INR') {
  const config = CURRENCY_CONFIG[currency];
  return config ? config.symbol : '₹';
}

/**
 * Gets all available currency options
 * @returns {Array} Array of currency options with value, label, and symbol
 */
export function getCurrencyOptions() {
  return Object.entries(CURRENCY_CONFIG).map(([code, config]) => ({
    value: code,
    label: `${code} (${config.symbol})`,
    symbol: config.symbol,
  }));
}

/**
 * Checks if a currency code is supported
 * @param {string} currency - Currency code to check
 * @returns {boolean} True if supported, false otherwise
 */
export function isCurrencySupported(currency) {
  return currency in CURRENCY_CONFIG;
}
