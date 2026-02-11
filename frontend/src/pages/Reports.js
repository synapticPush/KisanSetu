import React, { useState } from 'react';
import api from '../services/api';

const Reports = () => {
    const [loading, setLoading] = useState({});
    const [error, setError] = useState('');

    const handleExport = async (entity, format) => {
        setLoading({ [`${entity}-${format}`]: true });
        setError('');

        try {
            const response = await api.get(`/reports/${format}/${entity}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${entity}_report.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Error exporting ${entity} as ${format}:`, error);
            setError(`Failed to export ${entity} as ${format}. Please try again.`);
        } finally {
            setLoading({ [`${entity}-${format}`]: false });
        }
    };

    const reportTypes = [
        {
            id: 'fields',
            name: 'Fields',
            description: 'Export all field information including location, area, and crop details',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            color: 'primary'
        },
        {
            id: 'yields',
            name: 'Yields',
            description: 'Export yield data with quantities, categories, and field information',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            color: 'secondary'
        },
        {
            id: 'labourers',
            name: 'Labourers',
            description: 'Export labour information including groups, skills, and wages',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: 'earth'
        },
        {
            id: 'money',
            name: 'Money Records',
            description: 'Export financial records including expenses, payments, and transactions',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'red'
        }
    ];

    const exportFormats = [
        {
            id: 'csv',
            name: 'CSV',
            description: 'Comma-separated values for spreadsheet applications',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            bgColor: 'bg-green-100 text-green-600'
        },
        {
            id: 'pdf',
            name: 'PDF',
            description: 'Portable Document Format for sharing and printing',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            bgColor: 'bg-red-100 text-red-600'
        }
    ];

    const getReportIconColor = (color) => {
        switch (color) {
            case 'primary':
                return 'bg-primary-100 text-primary-600';
            case 'secondary':
                return 'bg-secondary-100 text-secondary-600';
            case 'earth':
                return 'bg-earth-100 text-earth-600';
            case 'red':
                return 'bg-red-100 text-red-600';
            default:
                return 'bg-earth-100 text-earth-600';
        }
    };

    return (
        <div className="min-h-screen bg-earth-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-earth-900">Reports & Exports</h1>
                    <p className="text-earth-600 mt-2">Generate and download reports for your farm data</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Report Types Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {reportTypes.map((report) => (
                        <div key={report.id} className="card">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className={`flex-shrink-0 rounded-lg p-3 mr-4 ${getReportIconColor(report.color)}`}>
                                        {report.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-earth-900">{report.name}</h3>
                                        <p className="text-sm text-earth-600">{report.description}</p>
                                    </div>
                                </div>

                                <div className="border-t border-earth-200 pt-4">
                                    <p className="text-sm font-medium text-earth-700 mb-3">Export Options:</p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {exportFormats.map((format) => (
                                            <button
                                                key={format.id}
                                                onClick={() => handleExport(report.id, format.id)}
                                                disabled={loading[`${report.id}-${format.id}`]}
                                                className="btn btn-secondary flex items-center justify-center disabled:opacity-50"
                                            >
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md mr-2 ${format.bgColor}`}>
                                                    {format.icon}
                                                </span>
                                                {loading[`${report.id}-${format.id}`] ? (
                                                    <div className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-earth-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Exporting...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <span>Export as {format.name}</span>
                                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Export Section */}
                <div className="card">
                    <div className="px-6 py-4 border-b border-earth-200">
                        <h3 className="text-lg font-medium text-earth-900">Quick Export All Data</h3>
                        <p className="text-sm text-earth-600 mt-1">Download complete reports in multiple formats</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-center p-6 border-2 border-dashed border-earth-300 rounded-lg hover:border-earth-400 transition-colors">
                                <div className="flex justify-center mb-4">
                                    <div className="bg-green-100 rounded-full p-3">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <h4 className="text-lg font-medium text-earth-900 mb-2">Complete CSV Package</h4>
                                <p className="text-sm text-earth-600 mb-4">All data in CSV format for analysis</p>
                                <button
                                    onClick={() => {
                                        // Export all as CSV
                                        ['fields', 'yields', 'labourers', 'money'].forEach(entity => {
                                            handleExport(entity, 'csv');
                                        });
                                    }}
                                    className="btn btn-primary w-full"
                                >
                                    Download All CSV
                                </button>
                            </div>

                            <div className="text-center p-6 border-2 border-dashed border-earth-300 rounded-lg hover:border-earth-400 transition-colors">
                                <div className="flex justify-center mb-4">
                                    <div className="bg-red-100 rounded-full p-3">
                                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <h4 className="text-lg font-medium text-earth-900 mb-2">Complete PDF Package</h4>
                                <p className="text-sm text-earth-600 mb-4">All reports in PDF format for sharing</p>
                                <button
                                    onClick={() => {
                                        // Export all as PDF
                                        ['fields', 'yields', 'labourers', 'money'].forEach(entity => {
                                            handleExport(entity, 'pdf');
                                        });
                                    }}
                                    className="btn btn-primary w-full"
                                >
                                    Download All PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-earth-100 rounded-full">
                        <svg className="w-5 h-5 text-earth-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-earth-700">
                            Reports are generated with your current data. Exported files will be downloaded to your device.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
