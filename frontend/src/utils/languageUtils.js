// Utility functions for language management

/**
 * Get the direction based on language (RTL/LTR)
 * @param {string} language - Current language ('en' or 'hi')
 * @returns {string} - 'rtl' for Hindi, 'ltr' for English
 */
export const getTextDirection = (language) => {
  return language === 'hi' ? 'rtl' : 'ltr';
};

/**
 * Get the appropriate font family based on language
 * @param {string} language - Current language ('en' or 'hi')
 * @returns {string} - CSS font family string
 */
export const getFontFamily = (language) => {
  return language === 'hi' 
    ? "'Hindi', 'Devanagari', 'Noto Sans Devanagari', sans-serif"
    : "'Inter', 'Segoe UI', 'Roboto', sans-serif";
};

/**
 * Format date based on language
 * @param {Date} date - Date object
 * @param {string} language - Current language ('en' or 'hi')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, language) => {
  if (!date) return '';
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  try {
    return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-US', options).format(date);
  } catch (error) {
    return date.toLocaleDateString();
  }
};

/**
 * Format number based on language
 * @param {number} number - Number to format
 * @param {string} language - Current language ('en' or 'hi')
 * @returns {string} - Formatted number string
 */
export const formatNumber = (number, language) => {
  if (typeof number !== 'number') return '';
  
  try {
    return new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-US').format(number);
  } catch (error) {
    return number.toString();
  }
};

/**
 * Format currency based on language
 * @param {number} amount - Amount to format
 * @param {string} language - Current language ('en' or 'hi')
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, language, currency = 'INR') => {
  if (typeof amount !== 'number') return '';
  
  try {
    return new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Get CSS classes for language-specific styling
 * @param {string} language - Current language ('en' or 'hi')
 * @returns {object} - Object with CSS classes
 */
export const getLanguageClasses = (language) => {
  return {
    direction: getTextDirection(language),
    fontFamily: getFontFamily(language),
    textAlign: language === 'hi' ? 'right' : 'left',
    // Add more language-specific classes as needed
  };
};

/**
 * Debounce function to prevent rapid language switching
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Check if a translation key exists
 * @param {string} key - Translation key to check
 * @param {string} language - Current language ('en' or 'hi')
 * @returns {boolean} - True if key exists
 */
export const hasTranslation = (key, language) => {
  // This would need access to the translations object
  // For now, return true as a placeholder
  return true;
};

/**
 * Get a fallback translation if the key doesn't exist
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback text
 * @returns {string} - Translation or fallback
 */
export const getTranslationWithFallback = (key, fallback) => {
  // This would need access to the translation function
  // For now, return the fallback
  return fallback || key;
};
