// Translation key mapping and validation utilities
// This helps prevent translation key mismatches

/**
 * Get the correct translation key for a given feature
 * @param {string} feature - The feature name (e.g., 'labour', 'lotNumbers')
 * @param {string} keyType - The type of key (e.g., 'title', 'description', 'action')
 * @param {string} specificKey - The specific key if needed
 * @returns {string} - The correct translation key
 */
export const getCorrectTranslationKey = (feature, keyType, specificKey = null) => {
  const keyMap = {
    labour: {
      title: 'labourManagement',
      description: 'labourManagementDescription',
      manageGroups: 'manageLabourGroups',
      manageLabourers: 'manageLabourers',
      groups: 'labourGroups',
      groupDetails: 'labourGroupDetails',
      labourerDetails: 'labourerDetails',
      paymentHistory: 'paymentHistory',
      attendanceRecord: 'attendanceRecord',
      // Add more as needed
      ...getSpecificKeys('labour', specificKey)
    },
    lotNumbers: {
      title: 'lotNumbersManagement',
      description: 'lotNumbersManagementDescription',
      // Alternate key for compatibility
      titleAlt: 'lotNumberManagement',
      descriptionAlt: 'lotNumberManagementDescription',
      details: 'lotDetails',
      information: 'lotInformation',
      history: 'lotHistory',
      statistics: 'lotStatistics',
      storage: 'storageDetails',
      // Add more as needed
      ...getSpecificKeys('lotNumbers', specificKey)
    },
    fields: {
      title: 'fieldsManagement',
      description: 'fieldsManagementDescription',
      // Add more as needed
      ...getSpecificKeys('fields', specificKey)
    },
    money: {
      title: 'moneyRecords',
      description: 'moneyRecordsDescription',
      // Add more as needed
      ...getSpecificKeys('money', specificKey)
    },
    borrowings: {
      title: 'borrowingsManagement',
      description: 'borrowingsManagementDescription',
      // Add more as needed
      ...getSpecificKeys('borrowings', specificKey)
    },
    transportation: {
      title: 'transportationManagement',
      description: 'transportationManagementDescription',
      // Add more as needed
      ...getSpecificKeys('transportation', specificKey)
    },
    dashboard: {
      title: 'farmDashboard',
      description: 'dashboardDescription',
      // Add more as needed
      ...getSpecificKeys('dashboard', specificKey)
    }
  };

  if (keyMap[feature] && keyMap[feature][keyType]) {
    return keyMap[feature][keyType];
  }

  // Fallback to specific key if provided
  if (specificKey) {
    return specificKey;
  }

  // Final fallback
  console.warn(`Translation key not found for feature: ${feature}, keyType: ${keyType}`);
  return keyType;
};

/**
 * Get specific keys for a feature
 * @param {string} feature - The feature name
 * @param {string} specificKey - The specific key
 * @returns {object} - Object with the specific key
 */
function getSpecificKeys(feature, specificKey) {
  if (!specificKey) return {};
  
  return {
    [specificKey]: specificKey
  };
}

/**
 * Validate that all required translation keys exist
 * @param {Function} t - Translation function
 * @param {string} feature - The feature to validate
 * @returns {object} - Validation results
 */
export const validateFeatureTranslations = (t, feature) => {
  const requiredKeys = getRequiredKeysForFeature(feature);
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
    feature,
    allPresent: missing.length === 0,
    missing,
    existing,
    total: requiredKeys.length,
    present: existing.length
  };
};

/**
 * Get all required keys for a feature
 * @param {string} feature - The feature name
 * @returns {array} - Array of required translation keys
 */
function getRequiredKeysForFeature(feature) {
  const keyMap = {
    labour: [
      'labourManagement',
      'labourManagementDescription',
      'manageLabourGroups',
      'manageLabourers',
      'labourGroups',
      'labourers',
      'payments',
      'paymentHistory',
      'attendanceRecord',
      'totalPayments',
      'activeGroups',
      'totalLabourers'
    ],
    lotNumbers: [
      'lotNumbersManagement',
      'lotNumbersManagementDescription',
      'lotNumberManagement', // Alternate
      'lotNumberManagementDescription', // Alternate
      'addNewLotNumber',
      'lotNumberName',
      'category',
      'packetCount',
      'storageDate',
      'notes',
      'totalPackets',
      'lotDetails',
      'lotInformation',
      'storageDetails'
    ],
    fields: [
      'fieldsManagement',
      'fieldsManagementDescription',
      'addNewField',
      'fieldName',
      'location',
      'area',
      'plantingDate',
      'expectedHarvestDate'
    ],
    money: [
      'moneyRecords',
      'moneyRecordsDescription',
      'addNewRecord',
      'recordType',
      'amount',
      'description',
      'date',
      'totalIncome',
      'totalExpense',
      'netBalance'
    ],
    borrowings: [
      'borrowingsManagement',
      'borrowingsManagementDescription',
      'addNewBorrowing',
      'lenderName',
      'borrowingAmount',
      'interestRate',
      'borrowingDate',
      'repaymentDate',
      'totalBorrowed',
      'totalRepaid'
    ],
    transportation: [
      'transportationManagement',
      'transportationManagementDescription',
      'addTransportation',
      'transportDate',
      'lotNumber',
      'transportationRecords'
    ],
    dashboard: [
      'farmDashboard',
      'dashboardDescription',
      'totalFields',
      'totalYield',
      'laborCost',
      'expenses'
    ]
  };
  
  return keyMap[feature] || [];
}

/**
 * Get safe translation with fallback
 * @param {Function} t - Translation function
 * @param {string} feature - The feature name
 * @param {string} keyType - The type of key
 * @param {string} fallback - Fallback text
 * @returns {string} - Translated text or fallback
 */
export const getSafeTranslation = (t, feature, keyType, fallback = null) => {
  const correctKey = getCorrectTranslationKey(feature, keyType);
  const translation = t(correctKey);
  
  // If translation returns the key itself, use fallback
  if (translation === correctKey) {
    return fallback || correctKey;
  }
  
  return translation;
};

/**
 * Common translation key patterns that might cause issues
 */
export const PROBLEMATIC_KEYS = {
  // Singular vs Plural issues
  singularVsPlural: [
    'lotNumberManagement', // Should use 'lotNumbersManagement'
    'fieldManagement', // Should use 'fieldsManagement'
    'moneyManagement', // Should use 'moneyRecords'
    'borrowingManagement', // Should use 'borrowingsManagement'
  ],
  
  // Missing description keys
  missingDescriptions: [
    'lotNumberManagementDescription',
    'fieldManagementDescription',
    'moneyManagementDescription',
    'borrowingManagementDescription'
  ],
  
  // Inconsistent naming
  inconsistentNaming: [
    'manageLabourGroups',
    'manageLabourers',
    'labourGroupDetails',
    'labourerDetails'
  ]
};

/**
 * Check if a key is problematic
 * @param {string} key - The key to check
 * @returns {object} - Information about the key
 */
export const checkKeyIssues = (key) => {
  const issues = [];
  
  // Check singular vs plural
  if (PROBLEMATIC_KEYS.singularVsPlural.includes(key)) {
    issues.push({
      type: 'singular_vs_plural',
      message: 'Consider using plural form for consistency',
      suggestion: key.replace('Management', 'Management').replace('Number', 'Numbers')
    });
  }
  
  // Check missing descriptions
  if (PROBLEMATIC_KEYS.missingDescriptions.includes(key)) {
    issues.push({
      type: 'missing_description',
      message: 'Description key might be missing',
      suggestion: key + 'Description'
    });
  }
  
  return {
    key,
    hasIssues: issues.length > 0,
    issues
  };
};

export default {
  getCorrectTranslationKey,
  validateFeatureTranslations,
  getSafeTranslation,
  checkKeyIssues,
  PROBLEMATIC_KEYS
};
