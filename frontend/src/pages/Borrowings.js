import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../contexts/AppContext';

const Borrowings = () => {
    const { t } = useLanguage();
    const [borrowings, setBorrowings] = useState([]);
    const [newBorrowing, setNewBorrowing] = useState({
        borrower_name: '',
        amount: '',
        borrow_date: '',
        expected_return_date: '',
        notes: ''
    });
    const [editingBorrowing, setEditingBorrowing] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchBorrowings();
    }, []);

    const fetchBorrowings = async () => {
        try {
            const response = await api.get('/borrowings');
            setBorrowings(response.data);
        } catch (error) {
            console.error('Error fetching borrowings:', error);
            setError(t('error'));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBorrowing({ ...newBorrowing, [name]: value });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingBorrowing({ ...editingBorrowing, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required fields
            if (!newBorrowing.borrower_name || !newBorrowing.amount || !newBorrowing.borrow_date) {
                setError('Please fill in all required fields: Borrower Name, Amount, and Borrow Date');
                return;
            }

            // Validate amount
            const amount = parseFloat(newBorrowing.amount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid amount greater than 0');
                return;
            }

            const borrowingData = {
                borrower_name: newBorrowing.borrower_name.trim(),
                amount: amount,
                borrow_date: newBorrowing.borrow_date || new Date().toISOString().split('T')[0],
                expected_return_date: newBorrowing.expected_return_date || null,
                notes: newBorrowing.notes ? newBorrowing.notes.trim() : null
            };

            const response = await api.post('/borrowings', borrowingData);
            setBorrowings([...borrowings, response.data]);
            setNewBorrowing({ borrower_name: '', amount: '', borrow_date: '', expected_return_date: '', notes: '' });
            setShowAddForm(false);
        } catch (error) {
            console.error('Error creating borrowing:', error);

            // Extract specific error message from backend if available
            let errorMessage = 'Failed to create borrowing record. Please try again.';
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
            // Validate required fields
            if (!editingBorrowing.borrower_name || !editingBorrowing.amount || !editingBorrowing.borrow_date) {
                setError('Please fill in all required fields: Borrower Name, Amount, and Borrow Date');
                return;
            }

            // Validate amount
            const amount = parseFloat(editingBorrowing.amount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid amount greater than 0');
                return;
            }

            const updateData = {
                borrower_name: editingBorrowing.borrower_name.trim(),
                amount: amount,
                borrow_date: editingBorrowing.borrow_date,
                expected_return_date: editingBorrowing.expected_return_date || null,
                actual_return_date: editingBorrowing.actual_return_date || null,
                status: editingBorrowing.status || 'pending',
                notes: editingBorrowing.notes ? editingBorrowing.notes.trim() : null
            };

            const response = await api.put(`/borrowings/${editingBorrowing.id}`, updateData);
            setBorrowings(borrowings.map(borrowing => borrowing.id === editingBorrowing.id ? response.data : borrowing));
            setEditingBorrowing(null);
        } catch (error) {
            console.error('Error updating borrowing:', error);

            // Extract specific error message from backend if available
            let errorMessage = 'Failed to update borrowing record. Please try again.';
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
            await api.delete(`/borrowings/${id}`);
            setBorrowings(borrowings.filter((borrowing) => borrowing.id !== id));
            setSuccess('Borrowing deleted successfully');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            console.error('Error deleting borrowing:', error);
            let errorMessage = 'Failed to delete borrowing record. Please try again.';
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(errorMessage);
        }
    };

    const handleMarkAsReturned = async (id) => {
        try {
            // First, get the borrowing details to create a money record
            const borrowing = borrowings.find(b => b.id === id);
            if (!borrowing) {
                setError(t('borrowingRecordNotFound'));
                return;
            }

            // Check if already returned
            if (borrowing.status === 'returned') {
                setError(t('alreadyReturned'));
                return;
            }

            // Create a money record for the returned amount
            const moneyRecordData = {
                paid_to: borrowing.borrower_name,
                amount: borrowing.amount,
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: 'cash', // Default payment method
                notes: `Money returned for borrowing dated ${new Date(borrowing.borrow_date).toLocaleDateString('en-IN')}`
            };

            // Create money record first
            await api.post('/money-records', moneyRecordData);

            // Then mark borrowing as returned
            const response = await api.put(`/borrowings/${id}/return`);
            setBorrowings(borrowings.map(borrowing => borrowing.id === id ? response.data : borrowing));

            // Show success message that auto-dismisses
            setSuccess('Borrowing marked as returned and money record created successfully!');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            console.error('Error marking as returned:', error);

            // Extract specific error message from backend if available
            let errorMessage = 'Failed to update borrowing status and create money record. Please try again.';
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(errorMessage);
        }
    };

    const startEdit = (borrowing) => {
        setEditingBorrowing({ ...borrowing });
    };

    const cancelEdit = () => {
        setEditingBorrowing(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'returned': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const totalBorrowed = borrowings.reduce((total, borrowing) => total + borrowing.amount, 0);
    const totalReturned = borrowings.filter(b => b.status === 'returned').reduce((total, borrowing) => total + borrowing.amount, 0);
    const totalPending = totalBorrowed - totalReturned;

    return (
        <div className="min-h-screen bg-earth-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                {/* <div className="mb-8">
                    <p className="text-earth-600 mt-2">{t('borrowingsManagementDescription')}</p>
                </div> */}

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

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <div className="text-center p-4">
                            <p className="text-sm text-earth-600 mb-1">{t('totalBorrowed')}</p>
                            <p className="text-2xl font-bold text-earth-900">{formatCurrency(totalBorrowed)}</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center p-4">
                            <p className="text-sm text-earth-600 mb-1">{t('totalReturned')}</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReturned)}</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center p-4">
                            <p className="text-sm text-earth-600 mb-1">{t('pendingReturns')}</p>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPending)}</p>
                        </div>
                    </div>
                </div>

                {/* Add Borrowing Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Borrowing
                    </button>
                </div>

                {/* Add Borrowing Form */}
                {showAddForm && (
                    <div className="card mb-8">
                        <div className="px-6 py-4 border-b border-earth-200">
                            <h3 className="text-lg font-medium text-earth-900">Add New Borrowing</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="borrower_name" className="block text-sm font-medium text-earth-700 mb-2">
                                        Borrower Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="borrower_name"
                                        name="borrower_name"
                                        className="input"
                                        placeholder="Enter borrower name"
                                        value={newBorrowing.borrower_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-earth-700 mb-2">
                                        Amount *
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        name="amount"
                                        className="input"
                                        placeholder="Enter amount"
                                        value={newBorrowing.amount}
                                        onChange={handleInputChange}
                                        required
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="borrow_date" className="block text-sm font-medium text-earth-700 mb-2">
                                        Borrow Date *
                                    </label>
                                    <input
                                        type="date"
                                        id="borrow_date"
                                        name="borrow_date"
                                        className="input"
                                        value={newBorrowing.borrow_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="expected_return_date" className="block text-sm font-medium text-earth-700 mb-2">
                                        Expected Return Date
                                    </label>
                                    <input
                                        type="date"
                                        id="expected_return_date"
                                        name="expected_return_date"
                                        className="input"
                                        value={newBorrowing.expected_return_date}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="md:col-span-2 lg:col-span-3">
                                    <label htmlFor="notes" className="block text-sm font-medium text-earth-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={3}
                                        className="input"
                                        placeholder="Enter any additional notes"
                                        value={newBorrowing.notes}
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
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary disabled:opacity-50"
                                >
                                    {loading ? 'Adding...' : 'Add Borrowing'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Borrowings List */}
                <div className="space-y-6">
                    {borrowings.length === 0 ? (
                        <div className="card text-center py-12">
                            <svg className="w-12 h-12 text-earth-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-earth-900 mb-2">No borrowing records yet</h3>
                            <p className="text-earth-600 mb-4">Start tracking your borrowings by adding your first record</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="btn btn-primary"
                            >
                                Add Your First Borrowing
                            </button>
                        </div>
                    ) : (
                        borrowings.map((borrowing) => (
                            <div key={borrowing.id} className="card">
                                <div className="px-6 py-4 border-b border-earth-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-medium text-earth-900">{borrowing.borrower_name}</h3>
                                            <p className="text-sm text-earth-600 mt-1">
                                                {formatCurrency(borrowing.amount)} • Borrowed on {new Date(borrowing.borrow_date).toLocaleDateString('en-IN')}
                                            </p>
                                            {borrowing.expected_return_date && (
                                                <p className="text-sm text-earth-600">
                                                    Expected return: {new Date(borrowing.expected_return_date).toLocaleDateString('en-IN')}
                                                </p>
                                            )}
                                            {borrowing.actual_return_date && (
                                                <p className="text-sm text-earth-600">
                                                    Returned on: {new Date(borrowing.actual_return_date).toLocaleDateString('en-IN')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(borrowing.status)}`}>
                                                {borrowing.status.charAt(0).toUpperCase() + borrowing.status.slice(1)}
                                            </span>
                                            <button
                                                onClick={() => startEdit(borrowing)}
                                                className="btn btn-secondary text-sm"
                                            >
                                                Edit
                                            </button>
                                            {borrowing.status !== 'returned' && (
                                                <button
                                                    onClick={() => handleMarkAsReturned(borrowing.id)}
                                                    className="btn btn-primary text-sm"
                                                >
                                                    Mark Returned
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(borrowing.id)}
                                                className="btn btn-secondary text-sm text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Form */}
                                {editingBorrowing && editingBorrowing.id === borrowing.id && (
                                    <div className="p-6 bg-earth-50 border-b border-earth-200">
                                        <h4 className="text-md font-medium text-earth-900 mb-4">Edit Borrowing</h4>
                                        <form onSubmit={handleEditSubmit}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-earth-700 mb-1">Borrower Name</label>
                                                    <input
                                                        type="text"
                                                        name="borrower_name"
                                                        className="input"
                                                        value={editingBorrowing.borrower_name}
                                                        onChange={handleEditInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-earth-700 mb-1">Amount</label>
                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        className="input"
                                                        value={editingBorrowing.amount}
                                                        onChange={handleEditInputChange}
                                                        required
                                                        step="0.01"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-earth-700 mb-1">Status</label>
                                                    <select
                                                        name="status"
                                                        className="input"
                                                        value={editingBorrowing.status}
                                                        onChange={handleEditInputChange}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="returned">Returned</option>
                                                        <option value="overdue">Overdue</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-earth-700 mb-1">Borrow Date</label>
                                                    <input
                                                        type="date"
                                                        name="borrow_date"
                                                        className="input"
                                                        value={editingBorrowing.borrow_date}
                                                        onChange={handleEditInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-earth-700 mb-1">Expected Return Date</label>
                                                    <input
                                                        type="date"
                                                        name="expected_return_date"
                                                        className="input"
                                                        value={editingBorrowing.expected_return_date || ''}
                                                        onChange={handleEditInputChange}
                                                    />
                                                </div>
                                                <div className="md:col-span-2 lg:col-span-3">
                                                    <label className="block text-sm font-medium text-earth-700 mb-1">Notes</label>
                                                    <textarea
                                                        name="notes"
                                                        rows={2}
                                                        className="input"
                                                        value={editingBorrowing.notes || ''}
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
                                                    {loading ? 'Updating...' : 'Update Borrowing'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Notes Section */}
                                {borrowing.notes && (
                                    <div className="px-6 py-4 bg-earth-50">
                                        <p className="text-sm text-earth-600">
                                            <span className="font-medium">Notes:</span> {borrowing.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Borrowings;
