// Test file to verify translation keys are working correctly
// This can be used to test the translation system

import { getCorrectTranslationKey, validateFeatureTranslations, checkKeyIssues } from './translationKeyValidator';

// Test the problematic keys mentioned by the user
console.log('=== Testing Problematic Keys ===');

// Test Lot Numbers
const lotNumberKey = getCorrectTranslationKey('lotNumbers', 'title');
console.log('Lot Numbers Title Key:', lotNumberKey); // Should be 'lotNumbersManagement'

const lotNumberDescKey = getCorrectTranslationKey('lotNumbers', 'description');
console.log('Lot Numbers Description Key:', lotNumberDescKey); // Should be 'lotNumbersManagementDescription'

// Test Labour Management
const labourGroupsKey = getCorrectTranslationKey('labour', 'manageGroups');
console.log('Labour Groups Key:', labourGroupsKey); // Should be 'manageLabourGroups'

const labourersKey = getCorrectTranslationKey('labour', 'manageLabourers');
console.log('Labourers Key:', labourersKey); // Should be 'manageLabourers'

// Check for issues
console.log('\n=== Checking for Key Issues ===');
const lotNumberIssue = checkKeyIssues('lotNumberManagement');
console.log('lotNumberManagement Issues:', lotNumberIssue);

const labourIssue = checkKeyIssues('manageLabourGroups');
console.log('manageLabourGroups Issues:', labourIssue);

// Expected output:
// Lot Numbers Title Key: lotNumbersManagement
// Lot Numbers Description Key: lotNumbersManagementDescription  
// Labour Groups Key: manageLabourGroups
// Labourers Key: manageLabourers
// lotNumberManagement Issues: { hasIssues: true, issues: [...] }
// manageLabourGroups Issues: { hasIssues: false, issues: [] }

export { lotNumberKey, lotNumberDescKey, labourGroupsKey, labourersKey };
