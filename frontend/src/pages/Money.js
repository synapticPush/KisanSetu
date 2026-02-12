import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../contexts/AppContext';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Modal from '../components/Modal';

const Money = () => {
    const { t } = useLanguage();
    const [moneyRecords, setMoneyRecords] = useState([]);
    const [newRecord, setNewRecord] = useState({
        paid_to: '',
        amount: '',
        payment_date: '',
        payment_method: '',
        notes: ''
    });
    const [editingRecord, setEditingRecord] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMoneyRecords();
    }, []);

    const fetchMoneyRecords = async () => {
        try {
            const response = await api.get('/money-records');
            setMoneyRecords(response.data);
        } catch (error) {
            console.error('Error fetching money records:', error);
            setError(t('error'));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRecord({ ...newRecord, [name]: value });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingRecord({ ...editingRecord, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required fields before sending
            if (!newRecord.paid_to || !newRecord.amount || !newRecord.payment_method) {
                setError('Please fill in all required fields: Paid To, Amount, and Payment Method');
                return;
            }

            // Validate amount
            const amount = parseFloat(newRecord.amount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid amount greater than 0');
                return;
            }

            // Convert amount to number and ensure required fields are properly formatted
            const recordData = {
                paid_to: newRecord.paid_to.trim(),
                amount: amount,
                payment_date: newRecord.payment_date || new Date().toISOString().split('T')[0],
                payment_method: newRecord.payment_method,
                notes: newRecord.notes ? newRecord.notes.trim() : null
            };

            const response = await api.post('/money-records', recordData);
            setMoneyRecords([...moneyRecords, response.data]);
            setNewRecord({ paid_to: '', amount: '', payment_date: '', payment_method: '', notes: '' });
            setShowAddForm(false);
            setSuccess(t('recordAddedSuccessfully'));
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            console.error('Error creating money record:', error);

            // Extract specific error message from backend if available
            let errorMessage = 'Failed to create money record. Please try again.';
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required fields before sending
            if (!editingRecord.paid_to || !editingRecord.amount || !editingRecord.payment_method) {
                setError('Please fill in all required fields: Paid To, Amount, and Payment Method');
                return;
            }

            // Validate amount
            const amount = parseFloat(editingRecord.amount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid amount greater than 0');
                return;
            }

            // Convert amount to number for update
            const updateData = {
                paid_to: editingRecord.paid_to.trim(),
                amount: amount,
                payment_date: editingRecord.payment_date || new Date().toISOString().split('T')[0],
                payment_method: editingRecord.payment_method,
                notes: editingRecord.notes ? editingRecord.notes.trim() : null
            };

            const response = await api.put(`/money-records/${editingRecord.id}`, updateData);
            setMoneyRecords(moneyRecords.map(record => record.id === editingRecord.id ? response.data : record));
            setEditingRecord(null);
            setSuccess(t('recordUpdatedSuccessfully'));
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            console.error('Error updating money record:', error);

            // Extract specific error message from backend if available
            let errorMessage = 'Failed to update money record. Please try again.';
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/money-records/${id}`);
            setMoneyRecords(moneyRecords.filter((record) => record.id !== id));
            setSuccess('Money record deleted successfully');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            console.error('Error deleting money record:', error);
            setError(String(error.message || 'Failed to delete money record. Please try again.'));
        }
    };

    const startEdit = (record) => {
        setEditingRecord({ ...record });
    };

    const cancelEdit = () => {
        setEditingRecord(null);
    };

    const getErrorMessage = (error) => {
        if (typeof error === 'string') return error;
        if (error && error.message) return error.message;
        if (error && error.detail) return error.detail;
        if (error && typeof error === 'object') {
            // Try to extract meaningful information from error object
            if (error.response && error.response.data && error.response.data.detail) {
                return error.response.data.detail;
            }
            if (error.response && error.response.data && error.response.data.message) {
                return error.response.data.message;
            }
            // Last resort: stringify the object but make it more readable
            return JSON.stringify(error, null, 2);
        }
        return 'An unknown error occurred';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getTotalExpenses = () => {
        return moneyRecords.reduce((total, record) => total + parseFloat(record.amount || 0), 0);
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'cash':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                );
            case 'upi':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                );
            case 'bank':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getFilteredMoneyRecords = () => {
        if (!searchTerm) return moneyRecords;

        const lowercasedSearch = searchTerm.toLowerCase();
        return moneyRecords.filter(record =>
            record.paid_to.toLowerCase().includes(lowercasedSearch) ||
            record.amount.toString().includes(lowercasedSearch) ||
            record.payment_method.toLowerCase().includes(lowercasedSearch) ||
            (record.notes && record.notes.toLowerCase().includes(lowercasedSearch)) ||
            new Date(record.payment_date).toLocaleDateString().includes(lowercasedSearch)
        );
    };

    const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const filteredRecords = getFilteredMoneyRecords();

    // PDF-safe currency formatter
    const formatCurrencyPDF = (amount) => {
        return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
    };

    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Money Records", pageWidth / 2, 20, { align: "center" });

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Expense Management Report", pageWidth / 2, 30, { align: "center" });

    // Generated date
    doc.setFontSize(11);
    doc.text(
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        pageWidth / 2,
        38,
        { align: "center" }
    );

    // Divider line
    doc.setDrawColor(200);
    doc.line(20, 45, pageWidth - 20, 45);

    // Summary calculations
    const totalAmount = filteredRecords.reduce(
        (sum, record) => sum + parseFloat(record.amount || 0),
        0
    );

    const cashTotal = filteredRecords
        .filter(r => r.payment_method === "cash")
        .reduce((sum, record) => sum + parseFloat(record.amount || 0), 0);

    const upiTotal = filteredRecords
        .filter(r => r.payment_method === "upi")
        .reduce((sum, record) => sum + parseFloat(record.amount || 0), 0);

    const bankTotal = filteredRecords
        .filter(r => r.payment_method === "bank")
        .reduce((sum, record) => sum + parseFloat(record.amount || 0), 0);

    // Summary section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Summary", 20, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    doc.text(`Total Records: ${filteredRecords.length}`, 25, 70);
    doc.text(`Total Expenses: ${formatCurrencyPDF(totalAmount)}`, 25, 80);
    doc.text(`Cash Payments: ${formatCurrencyPDF(cashTotal)}`, 25, 90);
    doc.text(`UPI Payments: ${formatCurrencyPDF(upiTotal)}`, 25, 100);
    doc.text(`Bank Transfers: ${formatCurrencyPDF(bankTotal)}`, 25, 110);

    // Add records table
    if (filteredRecords.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Money Records Details", 20, 130);

        const tableData = filteredRecords.map(record => [
            record.paid_to,
            formatCurrencyPDF(record.amount),
            record.payment_method.toUpperCase(),
            new Date(record.payment_date).toLocaleDateString("en-IN"),
            record.notes || "-"
        ]);

        autoTable(doc, {
            startY: 140,
            head: [[
                "Paid To", "Amount", "Method", "Date", "Notes"
            ]],
            body: tableData,

            styles: {
                font: "helvetica",
                fontSize: 10,
                cellPadding: 4,
                valign: "middle"
            },

            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontSize: 11,
                halign: "center"
            },

            columnStyles: {
                0: { cellWidth: 60 },          // Paid To
                1: { cellWidth: 40, halign: "right" }, // Amount
                2: { cellWidth: 40, halign: "center" }, // Method
                3: { cellWidth: 40, halign: "center" }, // Date
                4: { cellWidth: "auto" }        // Notes
            },

            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },

            margin: { left: 15, right: 15 }
        });
    }

    doc.save(`money-records-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

    return (
        <div className="min-h-screen bg-earth-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        {/* <div>
                            <p className="text-earth-600 mt-2">{t('moneyRecordsDescription')}</p>
                        </div> */}
                        <button
                            onClick={exportToPDF}
                            className="btn btn-primary flex items-center space-x-2"
                            disabled={getFilteredMoneyRecords().length === 0}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{t('exportPDF')}</span>
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-5 md:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-earth-600">{t('totalExpenses')}</p>
                                <p className="text-2xl font-bold text-earth-900">{formatCurrency(getTotalExpenses())}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-5 md:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-earth-100 rounded-lg p-3">
                                <svg className="w-6 h-6 text-earth-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-earth-600">{t('totalRecords')}</p>
                                <p className="text-2xl font-bold text-earth-900">{moneyRecords.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-5 md:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-earth-600">{t('thisMonth')}</p>
                                <p className="text-2xl font-bold text-earth-900">
                                    {formatCurrency(
                                        moneyRecords
                                            .filter(record => {
                                                const recordDate = new Date(record.payment_date);
                                                const currentDate = new Date();
                                                return recordDate.getMonth() === currentDate.getMonth() &&
                                                    recordDate.getFullYear() === currentDate.getFullYear();
                                            })
                                            .reduce((total, record) => total + parseFloat(record.amount || 0), 0)
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="input pl-10"
                            placeholder={t('searchByPaidToAmountMethodNotesDate')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                                <p className="text-sm text-red-800">{getErrorMessage(error)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Alert */}
                {success && (
                    <div className="rounded-md bg-green-50 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-800">{success}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Record Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary flex items-center"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        {t('addMoneyRecord')}
                    </button>
                </div>

                {/* Add Record Modal */}
                <Modal
                    isOpen={showAddForm}
                    onClose={() => setShowAddForm(false)}
                    title={t('addMoneyRecord')}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="paid_to" className="block text-sm font-medium text-earth-700 mb-2">
                                    {t('paidTo')} *
                                </label>
                                <input
                                    type="text"
                                    id="paid_to"
                                    name="paid_to"
                                    className="input w-full"
                                    placeholder={t('enterRecipientName')}
                                    value={newRecord.paid_to}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-earth-700 mb-2">
                                    {t('amount')} (₹) *
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    className="input w-full"
                                    placeholder={t('enterAmount')}
                                    value={newRecord.amount}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label htmlFor="payment_date" className="block text-sm font-medium text-earth-700 mb-2">
                                    {t('paymentDate')} *
                                </label>
                                <input
                                    type="date"
                                    id="payment_date"
                                    name="payment_date"
                                    className="input w-full"
                                    value={newRecord.payment_date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="payment_method" className="block text-sm font-medium text-earth-700 mb-2">
                                    {t('paymentMethod')} *
                                </label>
                                <select
                                    id="payment_method"
                                    name="payment_method"
                                    className="input w-full"
                                    value={newRecord.payment_method}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">{t('selectPaymentMethod')}</option>
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI</option>
                                    <option value="bank">Bank Transfer</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="notes" className="block text-sm font-medium text-earth-700 mb-2">
                                    {t('notes')}
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={3}
                                    className="input w-full"
                                    placeholder={t('enterAnyAdditionalNotes')}
                                    value={newRecord.notes}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="btn btn-secondary"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary disabled:opacity-50"
                            >
                                {loading ? t('adding') : t('addRecord')}
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Edit Record Modal */}
                <Modal
                    isOpen={!!editingRecord}
                    onClose={cancelEdit}
                    title={t('editRecord')}
                >
                    {editingRecord && (
                        <form onSubmit={handleEditSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('paidTo')}</label>
                                    <input
                                        type="text"
                                        name="paid_to"
                                        className="input w-full"
                                        value={editingRecord.paid_to}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('amount')} (₹)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        className="input w-full"
                                        value={editingRecord.amount}
                                        onChange={handleEditInputChange}
                                        required
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('paymentDate')}</label>
                                    <input
                                        type="date"
                                        name="payment_date"
                                        className="input w-full"
                                        value={editingRecord.payment_date}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('paymentMethod')}</label>
                                    <select
                                        name="payment_method"
                                        className="input w-full"
                                        value={editingRecord.payment_method}
                                        onChange={handleEditInputChange}
                                        required
                                    >
                                        <option value="cash">{t('cash')}</option>
                                        <option value="upi">{t('upi')}</option>
                                        <option value="bank">{t('bankTransfer')}</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('notes')}</label>
                                    <textarea
                                        name="notes"
                                        rows={2}
                                        className="input w-full"
                                        value={editingRecord.notes || ''}
                                        onChange={handleEditInputChange}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-4">
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="btn btn-secondary"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary disabled:opacity-50"
                                >
                                    {loading ? t('updating') : t('updateRecord')}
                                </button>
                            </div>
                        </form>
                    )}
                </Modal>

                {/* Records List */}
                <div className="card">
                    <div className="px-6 py-4 border-b border-earth-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium text-earth-900">{t('moneyRecords')}</h3>
                                <p className="text-sm text-earth-600 mt-1">
                                    {getFilteredMoneyRecords().length} {getFilteredMoneyRecords().length === 1 ? t('record') : t('records')} {t('total')}
                                    {searchTerm && ` (${t('filteredFrom')} ${moneyRecords.length} ${t('total')})`}
                                </p>
                            </div>
                        </div>
                    </div>
                    {getFilteredMoneyRecords().length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-12 h-12 text-earth-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-earth-900 mb-2">{t('noMoneyRecordsYet')}</h3>
                            <p className="text-earth-600 mb-4">{t('startTrackingExpenses')}</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="btn btn-primary"
                            >
                                {t('addYourFirstRecord')}
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-earth-200">
                                <thead className="bg-earth-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                            {t('paidTo')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                            {t('amount')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                            {t('date')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                            {t('method')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                            {t('actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-earth-200">
                                    {getFilteredMoneyRecords().map((record) => (
                                        <React.Fragment key={record.id}>
                                            <tr className="hover:bg-earth-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-earth-900">{record.paid_to}</div>
                                                    {record.notes && (
                                                        <div className="text-sm text-earth-500 truncate max-w-xs">{record.notes}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-earth-900">
                                                        {formatCurrency(record.amount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">
                                                    {new Date(record.payment_date).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 mr-2">
                                                            {getPaymentMethodIcon(record.payment_method)}
                                                        </div>
                                                        <span className="text-sm text-earth-600 capitalize">{record.payment_method}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">
                                                    <button
                                                        onClick={() => startEdit(record)}
                                                        className="text-primary-600 hover:text-primary-900 font-medium mr-3"
                                                    >
                                                        {t('edit')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(record.id)}
                                                        className="text-red-600 hover:text-red-900 font-medium"
                                                    >
                                                        {t('delete')}
                                                    </button>
                                                </td>
                                            </tr>
                                            {/* Edit Form Row */}
                                            {editingRecord && editingRecord.id === record.id && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-4 bg-earth-50">
                                                        <form onSubmit={handleEditSubmit}>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('paidTo')}</label>
                                                                    <input
                                                                        type="text"
                                                                        name="paid_to"
                                                                        className="input"
                                                                        value={editingRecord.paid_to}
                                                                        onChange={handleEditInputChange}
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('amount')} (₹)</label>
                                                                    <input
                                                                        type="number"
                                                                        name="amount"
                                                                        className="input"
                                                                        value={editingRecord.amount}
                                                                        onChange={handleEditInputChange}
                                                                        required
                                                                        step="0.01"
                                                                        min="0"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('paymentDate')}</label>
                                                                    <input
                                                                        type="date"
                                                                        name="payment_date"
                                                                        className="input"
                                                                        value={editingRecord.payment_date}
                                                                        onChange={handleEditInputChange}
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('paymentMethod')}</label>
                                                                    <select
                                                                        name="payment_method"
                                                                        className="input"
                                                                        value={editingRecord.payment_method}
                                                                        onChange={handleEditInputChange}
                                                                        required
                                                                    >
                                                                        <option value="cash">{t('cash')}</option>
                                                                        <option value="upi">{t('upi')}</option>
                                                                        <option value="bank">{t('bankTransfer')}</option>
                                                                    </select>
                                                                </div>
                                                                <div className="md:col-span-2 lg:col-span-3">
                                                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('notes')}</label>
                                                                    <textarea
                                                                        name="notes"
                                                                        rows={2}
                                                                        className="input"
                                                                        value={editingRecord.notes || ''}
                                                                        onChange={handleEditInputChange}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end space-x-3 mt-4">
                                                                <button
                                                                    type="button"
                                                                    onClick={cancelEdit}
                                                                    className="btn btn-secondary"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    disabled={loading}
                                                                    className="btn btn-primary disabled:opacity-50"
                                                                >
                                                                    {loading ? t('updating') : t('updateRecord')}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Money;
