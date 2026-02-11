import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '../contexts/AppContext';
import { debounce, getLanguageClasses, formatDate, formatNumber, formatCurrency } from '../utils/languageUtils';

/**
 * Custom hook for optimized language management
 * Provides memoized translations and language-specific utilities
 */
export const useOptimizedLanguage = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  // Debounced toggle function to prevent rapid switching
  const debouncedToggle = useCallback(
    debounce(() => {
      setIsChanging(true);
      toggleLanguage();
      // Reset changing state after animation completes
      setTimeout(() => setIsChanging(false), 300);
    }, 200),
    [toggleLanguage]
  );

  // Memoized language classes for performance
  const languageClasses = useMemo(() => {
    return getLanguageClasses(language);
  }, [language]);

  // Memoized translation function with error handling
  const safeTranslate = useCallback((key, fallback = null) => {
    try {
      const translation = t(key);
      // Return fallback if translation is the same as key (missing translation)
      if (translation === key && fallback) {
        return fallback;
      }
      return translation;
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return fallback || key;
    }
  }, [t]);

  // Memoized formatting functions
  const formatDateLocalized = useCallback((date) => {
    return formatDate(date, language);
  }, [language]);

  const formatNumberLocalized = useCallback((number) => {
    return formatNumber(number, language);
  }, [language]);

  const formatCurrencyLocalized = useCallback((amount, currency = 'INR') => {
    return formatCurrency(amount, language, currency);
  }, [language]);

  // Memoized language info
  const languageInfo = useMemo(() => ({
    current: language,
    isEnglish: language === 'en',
    isHindi: language === 'hi',
    isRTL: language === 'hi',
    direction: languageClasses.direction,
    fontFamily: languageClasses.fontFamily,
    textAlign: languageClasses.textAlign,
    flag: language === 'hi' ? '🇮🇳' : '🇺🇸',
    name: language === 'hi' ? 'हिंदी' : 'English',
    nativeName: language === 'hi' ? 'हिंदी' : 'English'
  }), [language, languageClasses]);

  return {
    // Core language functions
    language,
    toggleLanguage: debouncedToggle,
    t: safeTranslate,
    
    // State
    isChanging,
    
    // Language info
    languageInfo,
    languageClasses,
    
    // Formatting utilities
    formatDate: formatDateLocalized,
    formatNumber: formatNumberLocalized,
    formatCurrency: formatCurrencyLocalized,
    
    // Convenience methods
    isEnglish: languageInfo.isEnglish,
    isHindi: languageInfo.isHindi,
    isRTL: languageInfo.isRTL
  };
};

/**
 * Hook for managing language-specific animations
 */
export const useLanguageAnimation = () => {
  const { language, languageInfo } = useOptimizedLanguage();
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  }, []);

  return {
    isAnimating,
    triggerAnimation,
    animationClasses: {
      'language-transition': true,
      'language-animating': isAnimating,
      'language-rtl': languageInfo.isRTL,
      'language-ltr': !languageInfo.isRTL
    }
  };
};

/**
 * Hook for persistent language preferences
 */
export const usePersistentLanguage = () => {
  const { language, toggleLanguage } = useOptimizedLanguage();

  // Save language preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('userLanguagePreference', language);
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  }, [language]);

  // Load language preference from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('userLanguagePreference');
      if (savedLanguage && savedLanguage !== language) {
        // Language was changed in another tab, update current tab
        toggleLanguage();
      }
    } catch (error) {
      console.warn('Failed to load language preference:', error);
    }
  }, []);

  return { language, toggleLanguage };
};

export default useOptimizedLanguage;
