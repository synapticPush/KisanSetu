
// Utility to track daily user activities (Add/Delete) for reporting
// Stores logs in localStorage for the current day

const STORAGE_KEY = 'daily_activity_log';

export const trackActivity = (config, response, status) => {
    // Only track successful mutations (2xx)
    if (status < 200 || status >= 300) return;

    const method = config.method ? config.method.toUpperCase() : '';
    // User requested "what added , what deleted" and updates as well
    if (!['POST', 'DELETE', 'PUT', 'PATCH'].includes(method)) return;

    const url = config.url || '';
    
    // Determine Feature
    let feature = 'System';
    if (url.includes('/borrowings')) feature = 'Borrowings';
    else if (url.includes('/fields')) feature = 'Fields';
    else if (url.includes('/money-records')) feature = 'Money Records';
    else if (url.includes('/lot-numbers')) feature = 'Lot Numbers';
    else if (url.includes('/transportation')) feature = 'Transportation';
    else if (url.includes('/labour')) feature = 'Labour Management';
    else if (url.includes('/group-work')) feature = 'Labour Work Tracker';
    else if (url.includes('/attendance')) feature = 'Labour Attendance';
    else if (url.includes('/users') || url.includes('/auth')) return; // Ignore auth/user ops

    let action = '';
    let details = '';

    if (method === 'POST') {
        action = 'Added';
        // Try to parse payload to get a meaningful name
        try {
            const data = parseData(config.data);
            if (data) {
                if (feature === 'Borrowings') details = `Borrower: ${data.borrower_name}, Amount: ${data.amount}`;
                else if (feature === 'Fields') details = `Name: ${data.name}, Location: ${data.location}`;
                else if (feature === 'Money Records') details = `${data.type} - Amount: ${data.amount}`;
                else if (feature === 'Lot Numbers') details = `Lot: ${data.lot_number}, Packets: ${data.packet_count}`;
                else if (feature === 'Labour Management') details = `Name: ${data.name || data.group_name || 'Labour Item'}`;
                else if (feature === 'Labour Work Tracker') details = `Group ID: ${data.group_id}, Total: ${data.total_packets}`;
                else if (feature === 'Labour Attendance') {
                    // Logic to extract attendance
                    details = `Attendance marked for labourers. Date: ${data.attendance_date || 'Today'}`;
                }
                else if (feature === 'Transportation') details = `Lot ID: ${data.lot_number_id || 'N/A'}`;
                else details = 'New Item';
            }
        } catch (e) {
            details = 'New Item';
        }
    } else if (method === 'PUT' || method === 'PATCH') {
        action = 'Updated';
        try {
            const data = parseData(config.data);
            // Extract ID from URL for context
            const id = url.split('/').pop();
            
            if (feature === 'Labour Attendance') {
                 // Attendance updates are often bulk POSTs, but if PUT is used:
                 details = `Attendance updated.`;
            } else if (data) {
                // Generic update detail
                const name = data.name || data.borrower_name || data.lot_number || data.group_name;
                details = name ? `${name} (ID: ${id})` : `Item ID: ${id}`;
                
                // Add specific update details if possible
                if (feature === 'Borrowings' && data.status) details += ` - Status: ${data.status}`;
            } else {
                details = `Item ID: ${id}`;
            }
        } catch (e) {
            details = 'Updated Item';
        }
    } else if (method === 'DELETE') {

        action = 'Deleted';
        // For DELETE, we usually only have the ID in the URL.
        // If the backend returns the deleted object, we can use it.
        // Otherwise try to extract ID.
        if (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
             const data = response.data;
             if (data.borrower_name) details = `Borrower: ${data.borrower_name}`;
             else if (data.name) details = `Name: ${data.name}`;
             else if (data.lot_number) details = `Lot: ${data.lot_number}`;
             else details = `ID: ${url.split('/').pop()}`;
        } else {
             // Extract ID from URL (assuming /resource/ID format)
             const id = url.split('/').pop();
             details = `Item ID: ${id}`;
        }
    }

    const logEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString(),
        feature,
        action,
        details: details || 'N/A'
    };

    saveLog(logEntry);
};

const parseData = (data) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
};

const saveLog = (entry) => {
    try {
        const existingLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        // Filter for today's logs only to keep storage clean
        const today = new Date().toISOString().split('T')[0];
        const todaysLogs = existingLogs.filter(log => log.timestamp.startsWith(today));
        
        todaysLogs.push(entry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todaysLogs));
    } catch (e) {
        console.error('Failed to save activity log', e);
    }
}

export const getDailyReportData = () => {
    try {
        console.log('getDailyReportData: Starting to retrieve data...');
        
        if (typeof localStorage === 'undefined') {
            console.error('localStorage is not available');
            return [];
        }
        
        const rawData = localStorage.getItem(STORAGE_KEY);
        console.log('getDailyReportData: Raw localStorage data:', rawData);
        
        const logs = JSON.parse(rawData || '[]');
        console.log('getDailyReportData: Parsed logs:', logs);
        
        const today = new Date().toISOString().split('T')[0];
        console.log('getDailyReportData: Today\'s date:', today);
        
        const todaysLogs = logs.filter(log => log.timestamp && log.timestamp.startsWith(today));
        console.log('getDailyReportData: Today\'s filtered logs:', todaysLogs);
        
        // Return latest first
        return todaysLogs.reverse();
    } catch (e) {
        console.error('getDailyReportData: Error occurred:', e);
        console.error('Error details:', e.message, e.stack);
        return [];
    }
}
