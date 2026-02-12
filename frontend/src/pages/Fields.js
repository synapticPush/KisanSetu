import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../contexts/AppContext';

const Fields = () => {
    const { t } = useLanguage();
    const [fields, setFields] = useState([]);
    const [yields, setYields] = useState({});
    const [newField, setNewField] = useState({
        field_name: '',
        location: '',
        area: '',
        year: ''
    });
    const [editingField, setEditingField] = useState(null);
    const [newYield, setNewYield] = useState({
        date: '',
        large: '',
        medium: '',
        small: '',
        overlarge: '',
        notes: ''
    });
    const [editingYield, setEditingYield] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showYieldForm, setShowYieldForm] = useState(null);

    useEffect(() => {
        fetchFields();
    }, []);

    const fetchFields = async () => {
        try {
            const response = await api.get('/fields');
            setFields(response.data);
            // Fetch yields for each field
            response.data.forEach(field => {
                fetchFieldYields(field.id);
            });
        } catch (error) {
            console.error('Error fetching fields:', error);
            setError(t('error'));
        }
    };

    const fetchFieldYields = async (fieldId) => {
        try {
            const response = await api.get(`/fields/${fieldId}/yields`);
            setYields(prev => ({ ...prev, [fieldId]: response.data }));
        } catch (error) {
            console.error('Error fetching yields:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewField({ ...newField, [name]: value });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingField({ ...editingField, [name]: value });
    };

    const handleYieldInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;

    if (isEdit) {
        setEditingYield(prev => ({
            ...prev,
            [name]: value
        }));
    } else {
        setNewYield(prev => ({
            ...prev,
            [name]: value
        }));
    }
};


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/fields', { ...newField, season: 'Winter' });
            setFields([...fields, response.data]);
            setNewField({ field_name: '', location: '', area: '', year: '' });
            setShowAddForm(false);
        } catch (error) {
            console.error('Error creating field:', error);
            setError('Failed to create field. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.put(`/fields/${editingField.id}`, { ...editingField, season: 'Winter' });
            setFields(fields.map(field => field.id === editingField.id ? response.data : field));
            setEditingField(null);
        } catch (error) {
            console.error('Error updating field:', error);
            setError('Failed to update field. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleYieldSubmit = async (e, fieldId) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Create a single yield record with all potato types
            const yieldData = {
                date: newYield.date,
                large: parseFloat(newYield.large) || 0,
                medium: parseFloat(newYield.medium) || 0,
                small: parseFloat(newYield.small) || 0,
                overlarge: parseFloat(newYield.overlarge) || 0,
                notes: newYield.notes
            };

            const response = await api.post(`/fields/${fieldId}/yields`, yieldData);

            // Check if the backend returned an existing record (updated) or created a new one
            // by comparing the response data with existing yields
            const fieldYields = yields[fieldId] || [];
            const existingRecord = fieldYields.find(y => y.date === newYield.date);

            if (existingRecord && response.data.id === existingRecord.id) {
                // Backend updated existing record - update it in the state
                setYields(prev => ({
                    ...prev,
                    [fieldId]: prev[fieldId].map(y =>
                        y.id === response.data.id ? response.data : y
                    )
                }));
                setSuccess('Yield record updated successfully! Values have been summed with existing record.');
            } else {
                // Backend created new record - add it to the state
                setYields(prev => ({
                    ...prev,
                    [fieldId]: [...(prev[fieldId] || []), response.data]
                }));
                setSuccess('Yield record added successfully!');
            }

            setNewYield({ date: '', large: '', medium: '', small: '', overlarge: '', notes: '' });
            setShowYieldForm(null);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error creating yield:', error);
            setError('Failed to create yield record. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/fields/${id}`);
            setFields(fields.filter((field) => field.id !== id));
            setYields(prev => {
                const newYields = { ...prev };
                delete newYields[id];
                return newYields;
            });
            setSuccess('Field deleted successfully');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            console.error('Error deleting field:', error);
            setError('Failed to delete field. Please try again.');
        }
    };

    const handleYieldDelete = async (fieldId, yieldId) => {
        try {
            await api.delete(`/fields/${fieldId}/yields/${yieldId}`);
            setYields(prev => ({
                ...prev,
                [fieldId]: prev[fieldId].filter(y => y.id !== yieldId)
            }));
            setSuccess('Yield record deleted successfully');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            console.error('Error deleting yield:', error);
            setError('Failed to delete yield record. Please try again.');
        }
    };

    const startEdit = (field) => {
        setEditingField({ ...field });
    };

    const cancelEdit = () => {
        setEditingField(null);
    };

    const startEditYield = (fieldId, yieldRecord) => {
        setEditingYield({ ...yieldRecord });
    };

    const cancelEditYield = () => {
        setEditingYield(null);
    };

    const handleYieldUpdate = async (e, fieldId, yieldId) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.put(`/fields/${fieldId}/yields/${yieldId}`, editingYield);
            setYields(prev => ({
                ...prev,
                [fieldId]: prev[fieldId].map(y => y.id === yieldId ? response.data : y)
            }));
            setEditingYield(null);
        } catch (error) {
            console.error('Error updating yield:', error);
            setError('Failed to update yield record. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getTotalYield = (fieldId) => {
        const fieldYields = yields[fieldId] || [];
        return fieldYields.reduce((total, yieldRecord) => {
            return total + (yieldRecord.large || 0) + (yieldRecord.medium || 0) + (yieldRecord.small || 0) + (yieldRecord.overlarge || 0);
        }, 0);
    };

    return (
        <div className="min-h-screen bg-earth-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header
                <div className="mb-8">
                    <p className="text-earth-600 mt-2">{t('fieldsManagementDescription')}</p>
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

                {/* Add Field Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('addNewField')}
                    </button>
                </div>

                {/* Add Field Form */}
                {showAddForm && (
                    <div className="card mb-8">
                        <div className="px-6 py-4 border-b border-earth-200">
                            <h3 className="text-lg font-medium text-earth-900">{t('addNewField')}</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div>
                                    <label htmlFor="field_name" className="block text-sm font-medium text-earth-700 mb-2">
                                        {t('fieldName')} *
                                    </label>
                                    <input
                                        type="text"
                                        id="field_name"
                                        name="field_name"
                                        className="input"
                                        placeholder={t('fieldName')}
                                        value={newField.field_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-earth-700 mb-2">
                                        {t('location')}
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        className="input"
                                        placeholder={t('location')}
                                        value={newField.location}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="area" className="block text-sm font-medium text-earth-700 mb-2">
                                        {t('size')} *
                                    </label>
                                    <input
                                        type="number"
                                        id="area"
                                        name="area"
                                        className="input"
                                        placeholder={t('enterAreaInAcres')}
                                        value={newField.area}
                                        onChange={handleInputChange}
                                        required
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="year" className="block text-sm font-medium text-earth-700 mb-2">
                                        {t('year')} *
                                    </label>
                                    <input
                                        type="number"
                                        id="year"
                                        name="year"
                                        className="input"
                                        placeholder={t('enterYear')}
                                        value={newField.year}
                                        onChange={handleInputChange}
                                        required
                                        min="2020"
                                        max="2030"
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
                                    {loading ? t('adding') : t('addField')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Fields List */}
                <div className="space-y-6">
                    {fields.length === 0 ? (
                        <div className="card text-center py-12">
                            <svg className="w-12 h-12 text-earth-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <h3 className="text-lg font-medium text-earth-900 mb-2">{t('noFieldsYet')}</h3>
                            <p className="text-earth-600 mb-4">{t('getStartedByAddingFirstField')}</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="btn btn-primary"
                            >
                                {t('addYourFirstField')}
                            </button>
                        </div>
                    ) : (
                        fields.map((field) => (
                            <div key={field.id} className="card">
                                <div className="px-6 py-4 border-b border-earth-200">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                                        <div className="w-full sm:w-auto">
                                            <h3 className="text-lg font-medium text-earth-900 break-words">{field.field_name}</h3>
                                            <p className="text-sm text-earth-600 mt-1 break-words">
                                                {field.area} acres • {field.location || 'No location'} • {field.year}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2 self-end sm:self-center">
                                            <button
                                                onClick={() => startEdit(field)}
                                                className="btn btn-secondary text-sm"
                                            >
                                                {t('edit')}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(field.id)}
                                                className="btn btn-secondary text-sm text-red-600 hover:text-red-900"
                                            >
                                                {t('delete')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Form */}
                                {editingField && editingField.id === field.id && (
                                    <div className="p-6 bg-earth-50 border-b border-earth-200">
                                        <h4 className="text-md font-medium text-earth-900 mb-4">{t('editField')}</h4>
                                        <form onSubmit={handleEditSubmit}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('fieldName')}</label>
                                                    <input
                                                        type="text"
                                                        name="field_name"
                                                        className="input"
                                                        value={editingField.field_name}
                                                        onChange={handleEditInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('location')}</label>
                                                    <input
                                                        type="text"
                                                        name="location"
                                                        className="input"
                                                        value={editingField.location || ''}
                                                        onChange={handleEditInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('size')} ({t('acres')})</label>
                                                    <input
                                                        type="number"
                                                        name="area"
                                                        className="input"
                                                        value={editingField.area}
                                                        onChange={handleEditInputChange}
                                                        required
                                                        step="0.1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('year')}</label>
                                                    <input
                                                        type="number"
                                                        name="year"
                                                        className="input"
                                                        value={editingField.year}
                                                        onChange={handleEditInputChange}
                                                        required
                                                        min="2020"
                                                        max="2030"
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
                                                    {loading ? t('updating') : t('updateField')}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Field Details */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="text-center p-4 bg-earth-50 rounded-lg">
                                            <p className="text-sm text-earth-600">{t('area')}</p>
                                            <p className="text-lg font-semibold text-earth-900">{field.area} {t('acres')}</p>
                                        </div>
                                        <div className="text-center p-4 bg-earth-50 rounded-lg">
                                            <p className="text-sm text-earth-600">{t('totalYield')}</p>
                                            <p className="text-lg font-semibold text-earth-900">{getTotalYield(field.id)} {t('packets')}</p>
                                        </div>
                                    </div>

                                    {/* Yield Management */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-md font-medium text-earth-900">{t('yieldRecords')}</h4>
                                            <button
                                                onClick={() => setShowYieldForm(showYieldForm === field.id ? null : field.id)}
                                                className="btn btn-primary text-sm"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                {t('addYield')}
                                            </button>
                                        </div>

                                        {/* Add Yield Form */}
                                        {showYieldForm === field.id && (
                                            <div className="p-4 bg-earth-50 rounded-lg mb-4">
                                                <form onSubmit={(e) => handleYieldSubmit(e, field.id)}>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">

                                                        <div>
                                                            <label className="block text-sm font-medium text-earth-700 mb-1">{t('date')}</label>
                                                            <input
                                                                type="date"
                                                                name="date"
                                                                className="input"
                                                                value={newYield.date}
                                                                onChange={handleYieldInputChange}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-earth-700 mb-1">{t('large')} ({t('packets')})</label>
                                                            <input
                                                                type="number"
                                                                name="large"
                                                                className="input"
                                                                placeholder={t('enterLargePotatoes')}
                                                                value={newYield.large}
                                                                onChange={handleYieldInputChange}
                                                                step="0.1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-earth-700 mb-1">{t('medium')} ({t('packets')})</label>
                                                            <input
                                                                type="number"
                                                                name="medium"
                                                                className="input"
                                                                placeholder={t('enterMediumPotatoes')}
                                                                value={newYield.medium}
                                                                onChange={handleYieldInputChange}
                                                                step="0.1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-earth-700 mb-1">{t('small')} ({t('packets')})</label>
                                                            <input
                                                                type="number"
                                                                name="small"
                                                                className="input"
                                                                placeholder={t('enterSmallPotatoes')}
                                                                value={newYield.small}
                                                                onChange={handleYieldInputChange}
                                                                step="0.1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-earth-700 mb-1">{t('overlarge')} ({t('packets')})</label>
                                                            <input
                                                                type="number"
                                                                name="overlarge"
                                                                className="input"
                                                                placeholder={t('enterOverlargePotatoes')}
                                                                value={newYield.overlarge}
                                                                onChange={handleYieldInputChange}
                                                                step="0.1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-earth-700 mb-1">{t('notes')}</label>
                                                            <input
                                                                type="text"
                                                                name="notes"
                                                                className="input"
                                                                placeholder={t('optionalNotes')}
                                                                value={newYield.notes}
                                                                onChange={handleYieldInputChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowYieldForm(null)}
                                                            className="btn btn-secondary"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="btn btn-primary disabled:opacity-50"
                                                        >
                                                            {loading ? t('adding') : t('addYield')}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* Yield List */}
                                        {yields[field.id] && yields[field.id].length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-earth-200">
                                                    <thead className="bg-earth-50">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('date')}</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('large')}</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('medium')}</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('small')}</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('overlarge')}</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('total')}</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('notes')}</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('actions')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-earth-200">
                                                        {yields[field.id].map((yieldRecord) => (
                                                            <React.Fragment key={yieldRecord.id}>
                                                                <tr className="hover:bg-earth-50">
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-earth-600">
                                                                        {new Date(yieldRecord.date).toLocaleDateString('en-IN')}
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-earth-900">
                                                                        {yieldRecord.large || 0}
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-earth-900">
                                                                        {yieldRecord.medium || 0}
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-earth-900">
                                                                        {yieldRecord.small || 0}
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-earth-900">
                                                                        {yieldRecord.overlarge || 0}
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-earth-900">
                                                                        {(yieldRecord.large || 0) + (yieldRecord.medium || 0) + (yieldRecord.small || 0) + (yieldRecord.overlarge || 0)}
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-earth-600">
                                                                        {yieldRecord.notes || '-'}
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-earth-600">
                                                                        <button
                                                                            onClick={() => startEditYield(field.id, yieldRecord)}
                                                                            className="text-primary-600 hover:text-primary-900 font-medium"
                                                                        >
                                                                            {t('edit')}
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                                {/* Edit Form Row */}
                                                                {editingYield && editingYield.id === yieldRecord.id && (
                                                                    <tr>
                                                                        <td colSpan="8" className="px-4 py-4 bg-earth-50">
                                                                            <form onSubmit={(e) => handleYieldUpdate(e, field.id, yieldRecord.id)}>
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                                    <div>
                                                                                        <label className="block text-sm font-medium text-earth-700 mb-1">{t('date')}</label>
                                                                                        <input
                                                                                            type="date"
                                                                                            name="date"
                                                                                            className="input"
                                                                                            value={editingYield.date}
                                                                                            onChange={(e) => handleYieldInputChange(e, true)}
                                                                                            required
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <label className="block text-sm font-medium text-earth-700 mb-1">{t('large')} ({t('packets')})</label>
                                                                                        <input
                                                                                            type="number"
                                                                                            name="large"
                                                                                            className="input"
                                                                                            value={editingYield.large || ''}
                                                                                            onChange={(e) => handleYieldInputChange(e, true)}
                                                                                            step="0.1"
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <label className="block text-sm font-medium text-earth-700 mb-1">{t('medium')} ({t('packets')})</label>
                                                                                        <input
                                                                                            type="number"
                                                                                            name="medium"
                                                                                            className="input"
                                                                                            value={editingYield.medium || ''}
                                                                                            onChange={(e) => handleYieldInputChange(e, true)}
                                                                                            step="0.1"
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <label className="block text-sm font-medium text-earth-700 mb-1">{t('small')} ({t('packets')})</label>
                                                                                        <input
                                                                                            type="number"
                                                                                            name="small"
                                                                                            className="input"
                                                                                            value={editingYield.small || ''}
                                                                                            onChange={(e) => handleYieldInputChange(e, true)}
                                                                                            step="0.1"
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <label className="block text-sm font-medium text-earth-700 mb-1">{t('overlarge')} ({t('packets')})</label>
                                                                                        <input
                                                                                            type="number"
                                                                                            name="overlarge"
                                                                                            className="input"
                                                                                            value={editingYield.overlarge || ''}
                                                                                            onChange={(e) => handleYieldInputChange(e, true)}
                                                                                            step="0.1"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="md:col-span-2 lg:col-span-3">
                                                                                        <label className="block text-sm font-medium text-earth-700 mb-1">{t('notes')}</label>
                                                                                        <textarea
                                                                                            name="notes"
                                                                                            rows={2}
                                                                                            className="input"
                                                                                            value={editingYield.notes || ''}
                                                                                            onChange={(e) => handleYieldInputChange(e, true)}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex justify-end space-x-3 mt-4">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={cancelEditYield}
                                                                                        className="btn btn-secondary"
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                    <button
                                                                                        type="submit"
                                                                                        disabled={loading}
                                                                                        className="btn btn-primary disabled:opacity-50"
                                                                                    >
                                                                                        {loading ? t('updating') : t('updateYield')}
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
                                        ) : (
                                            <div className="text-center py-8 text-earth-500">
                                                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                <p>{t('noYieldRecordsYet')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Fields;
