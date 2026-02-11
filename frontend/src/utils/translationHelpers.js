// Helper utilities for using translations consistently across the application

/**
 * Get page title and subtitle for a given route
 * @param {string} route - Current route path
 * @param {Function} t - Translation function
 * @returns {object} - Object with title and subtitle
 */
export const getPageTranslations = (route, t) => {
  const routeMap = {
    '/dashboard': {
      title: t('farmDashboard'),
      subtitle: t('dashboardSubtitle')
    },
    '/fields': {
      title: t('fieldsManagement'),
      subtitle: t('fieldsSubtitle')
    },
    '/money': {
      title: t('moneyRecords'),
      subtitle: t('moneySubtitle')
    },
    '/borrowings': {
      title: t('borrowingsManagement'),
      subtitle: t('borrowingsSubtitle')
    },
    '/lot-numbers': {
      title: t('lotNumbersManagement'),
      subtitle: t('lotNumbersSubtitle')
    },
    '/transportation': {
      title: t('transportationManagement'),
      subtitle: t('transportationSubtitle')
    },
    '/labour': {
      title: t('labourManagement'),
      subtitle: t('labourSubtitle')
    },
    '/login': {
      title: t('login'),
      subtitle: t('loginSubtitle')
    },
    '/signup': {
      title: t('signup'),
      subtitle: t('signupSubtitle')
    },
    '/settings': {
      title: t('settings'),
      subtitle: t('settingsSubtitle')
    },
    '/profile': {
      title: t('profile'),
      subtitle: t('profileSubtitle')
    },
    '/reports': {
      title: t('reports'),
      subtitle: t('reportsSubtitle')
    },
    '/analytics': {
      title: t('analytics'),
      subtitle: t('analyticsSubtitle')
    },
    '/notifications': {
      title: t('notifications'),
      subtitle: t('notificationsSubtitle')
    },
    '/help': {
      title: t('help'),
      subtitle: t('helpSubtitle')
    },
    '/about': {
      title: t('about'),
      subtitle: t('aboutSubtitle')
    },
    '/contact': {
      title: t('contact'),
      subtitle: t('contactSubtitle')
    }
  };

  return routeMap[route] || {
    title: t('home'),
    subtitle: t('welcomeSubtitle')
  };
};

/**
 * Get navigation item translations
 * @param {Function} t - Translation function
 * @returns {array} - Array of navigation items with translations
 */
export const getNavigationTranslations = (t) => {
  return [
    {
      title: t('home'),
      subtitle: t('welcomeSubtitle'),
      path: '/dashboard',
      exact: true
    },
    {
      title: t('navDashboard'),
      subtitle: t('dashboardSubtitle'),
      path: '/dashboard'
    },
    {
      title: t('navFields'),
      subtitle: t('fieldsSubtitle'),
      path: '/fields'
    },
    {
      title: t('navMoney'),
      subtitle: t('moneySubtitle'),
      path: '/money'
    },
    {
      title: t('navBorrowings'),
      subtitle: t('borrowingsSubtitle'),
      path: '/borrowings'
    },
    {
      title: t('navLotNumbers'),
      subtitle: t('lotNumbersSubtitle'),
      path: '/lot-numbers'
    },
    {
      title: t('navTransportation'),
      subtitle: t('transportationSubtitle'),
      path: '/transportation'
    },
    {
      title: t('navLabour'),
      subtitle: t('labourSubtitle'),
      path: '/labour'
    }
  ];
};

/**
 * Get common UI element translations
 * @param {Function} t - Translation function
 * @returns {object} - Object with common UI translations
 */
export const getCommonUITranslations = (t) => {
  return {
    // Actions
    save: t('save'),
    cancel: t('cancel'),
    delete: t('delete'),
    edit: t('edit'),
    add: t('add'),
    update: t('update'),
    submit: t('submit'),
    reset: t('reset'),
    clear: t('clear'),
    search: t('search'),
    filter: t('filter'),
    select: t('select'),
    view: t('view'),
    download: t('download'),
    export: t('export'),
    import: t('import'),
    print: t('print'),
    refresh: t('refresh'),
    
    // Navigation
    back: t('back'),
    next: t('next'),
    previous: t('previous'),
    close: t('close'),
    
    // Status
    loading: t('loading'),
    error: t('error'),
    success: t('success'),
    warning: t('warning'),
    info: t('info'),
    
    // Confirmation
    confirm: t('confirm'),
    yes: t('yes'),
    no: t('no'),
    
    // Data fields
    date: t('date'),
    time: t('time'),
    name: t('name'),
    email: t('email'),
    phone: t('phone'),
    address: t('address'),
    status: t('status'),
    active: t('active'),
    inactive: t('inactive'),
    total: t('total'),
    count: t('count'),
    amount: t('amount'),
    quantity: t('quantity'),
    price: t('price'),
    cost: t('cost'),
    revenue: t('revenue'),
    profit: t('profit'),
    loss: t('loss'),
    balance: t('balance'),
    payment: t('payment'),
    notes: t('notes'),
    description: t('description'),
    details: t('details')
  };
};

/**
 * Get status translations
 * @param {Function} t - Translation function
 * @returns {object} - Object with status translations
 */
export const getStatusTranslations = (t) => {
  return {
    // General status
    pending: t('pending'),
    completed: t('completed'),
    cancelled: t('cancelled'),
    rejected: t('rejected'),
    approved: t('approved'),
    processing: t('processing'),
    processed: t('processed'),
    queued: t('queued'),
    scheduled: t('scheduled'),
    ongoing: t('ongoing'),
    finished: t('finished'),
    started: t('started'),
    stopped: t('stopped'),
    paused: t('paused'),
    resumed: t('resumed'),
    failed: t('failed'),
    
    // Connection status
    online: t('online'),
    offline: t('offline'),
    connected: t('connected'),
    disconnected: t('disconnected'),
    syncing: t('syncing'),
    synced: t('synced'),
    
    // User status
    active: t('active'),
    inactive: t('inactive')
  };
};

/**
 * Validate if all required translation keys exist
 * @param {Function} t - Translation function
 * @param {array} requiredKeys - Array of required translation keys
 * @returns {object} - Object with validation results
 */
export const validateTranslations = (t, requiredKeys) => {
  const missing = [];
  const existing = [];
  
  requiredKeys.forEach(key => {
    const translation = t(key);
    if (translation === key) {
      missing.push(key);
    } else {
      existing.push(key);
    }
  });
  
  return {
    allPresent: missing.length === 0,
    missing,
    existing,
    total: requiredKeys.length,
    present: existing.length
  };
};

/**
 * Get translation with fallback
 * @param {Function} t - Translation function
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback text
 * @returns {string} - Translation or fallback
 */
export const getTranslationWithFallback = (t, key, fallback) => {
  const translation = t(key);
  return translation === key ? (fallback || key) : translation;
};

export default {
  getPageTranslations,
  getNavigationTranslations,
  getCommonUITranslations,
  getStatusTranslations,
  validateTranslations,
  getTranslationWithFallback
};
