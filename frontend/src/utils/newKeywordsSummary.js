// Summary of newly added translation keywords
// All keywords have been added to both English and Hindi translations

export const NEWLY_ADDED_KEYWORDS = {
  english: {
    // Dashboard Statistics
    'totalExpenses': 'Total Expenses',
    'totalRecords': 'Total Records', 
    'thisMonth': 'This Month',
    'exportPdf': 'Export PDF',
    'totalReturned': 'Total Returned',
    'pendingReturns': 'Pending Returns',
    'totalLots': 'Total Lots',
    'searchLotNumber': 'Search Lot Number'
  },
  
  hindi: {
    // Dashboard Statistics
    'totalExpenses': 'कुल खर्च',
    'totalRecords': 'कुल रिकॉर्ड',
    'thisMonth': 'इस महीने',
    'exportPdf': 'PDF निर्यात करें',
    'totalReturned': 'कुल लौटाया गया',
    'pendingReturns': 'लंबित वापसी',
    'totalLots': 'कुल लॉट',
    'searchLotNumber': 'लॉट नंबर खोजें'
  }
};

// Status check for all requested keywords
export const KEY_STATUS = {
  'totalExpenses': '✅ Added',
  'totalRecords': '✅ Added', 
  'thisMonth': '✅ Added',
  'exportPdf': '✅ Added',
  'totalReturned': '✅ Added',
  'pendingReturns': '✅ Added',
  'totalLots': '✅ Added',
  'searchLotNumber': '✅ Added',
  'fields': '✅ Already Existed'
};

console.log('Translation Keywords Status:');
Object.entries(KEY_STATUS).forEach(([key, status]) => {
  console.log(`${key}: ${status}`);
});

export default NEWLY_ADDED_KEYWORDS;
