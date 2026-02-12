import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../contexts/AppContext';
import Modal from '../components/Modal';

const Transportation = () => {
    const { t } = useLanguage();
    const [transportations, setTransportations] = useState([]);
    const [fields, setFields] = useState([]);
    const [newTransportation, setNewTransportation] = useState({
        field_id: '',
        lot_number: '',
        transport_date: '',
        small_packets: '',
        medium_packets: '',
        large_packets: '',
        overlarge_packets: '',
        notes: ''
    });
    const [editingTransportation, setEditingTransportation] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchFields();
        fetchTransportations();
    }, []);

    const fetchFields = async () => {
        try {
            const response = await api.get('/fields');
            setFields(response.data);
        } catch (error) {
            console.error('Error fetching fields:', error);
            setError(t('error'));
        }
    };

    const fetchTransportations = async () => {
        try {
            const response = await api.get('/transportations');
            setTransportations(response.data);
        } catch (error) {
            console.error('Error fetching transportations:', error);
            setError(t('error'));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTransportation({ ...newTransportation, [name]: value });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingTransportation({ ...editingTransportation, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const transportationData = {
                field_id: parseInt(newTransportation.field_id),
                lot_number: newTransportation.lot_number,
                transport_date: newTransportation.transport_date || new Date().toISOString().split('T')[0],
                small_packets: parseInt(newTransportation.small_packets) || 0,
                medium_packets: parseInt(newTransportation.medium_packets) || 0,
                large_packets: parseInt(newTransportation.large_packets) || 0,
                overlarge_packets: parseInt(newTransportation.overlarge_packets) || 0,
                notes: newTransportation.notes
            };

            const response = await api.post('/transportations', transportationData);
            setTransportations([response.data, ...transportations]);
            setNewTransportation({
                field_id: '',
                lot_number: '',
                transport_date: '',
                small_packets: '',
                medium_packets: '',
                large_packets: '',
                overlarge_packets: '',
                notes: ''
            });
            setShowAddForm(false);
            setSuccess(t('transportationAddedSuccessfully'));

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error creating transportation:', error);
            setError('Failed to create transportation record. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.put(`/transportations/${editingTransportation.id}`, editingTransportation);
            setTransportations(transportations.map(t =>
                t.id === editingTransportation.id ? response.data : t
            ));
            setEditingTransportation(null);
            setSuccess('Transportation record updated successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error updating transportation:', error);
            setError('Failed to update transportation record. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/transportations/${id}`);
            setTransportations(transportations.filter(t => t.id !== id));
            setSuccess('Transportation record deleted successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error deleting transportation:', error);
            setError('Failed to delete transportation record. Please try again.');
        }
    };

    const startEdit = (transportation) => {
        setEditingTransportation({ ...transportation });
    };

    const cancelEdit = () => {
        setEditingTransportation(null);
    };

    const getFieldName = (fieldId) => {
        const field = fields.find(f => f.id === fieldId);
        return field ? field.field_name : 'Unknown Field';
    };

    const getTotalPackets = (transportation) => {
        return (transportation.small_packets || 0) +
            (transportation.medium_packets || 0) +
            (transportation.large_packets || 0) +
            (transportation.overlarge_packets || 0);
    };

    return (
        <div className="min-h-screen bg-earth-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                {/* <div className="mb-8">
                    <p className="text-earth-600 mt-2">{t('transportationDetails')}</p>
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

                {/* Add Transportation Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('addTransportation')}
                    </button>
                </div>

                {/* Add Transportation Modal */}
                <Modal
                    isOpen={showAddForm}
                    onClose={() => setShowAddForm(false)}
                    title={t('addTransportation')}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="field_id" className="block text-sm font-medium text-earth-700 mb-2">
                                    {t('field')} *
                                </label>
                                <select
                                    id="field_id"
                                    name="field_id"
                                    className="input w-full"
                                    value={newTransportation.field_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">{t('selectField')}</option>
                                    {fields.map(field => (
                                        <option key={field.id} value={field.id}>
                                            {field.field_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="lot_number" className="block text-sm font-medium text-earth-700 mb-2">
                                    {t('lotNumber')} *
                                </label>
                                <input
                                    type="text"
                                    id="lot_number"
                                    name="lot_number"
                                    className="input w-full"
                                    placeholder={t('enterLotNumber')}
                                    value={newTransportation.lot_number}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="transport_date" className="block text-sm font-medium text-earth-700 mb-2">
                                    {t('transportDate')} *
                                </label>
                                <input
                                    type="date"
                                    id="transport_date"
                                    name="transport_date"
                                    className="input w-full"
                                    value={newTransportation.transport_date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="small_packets" className="block text-sm font-medium text-earth-700 mb-2">
                                    {t('small')} ({t('packets')})
                                </label>
                                <input
                                    type="number"
                                    id="small_packets"
                                    name="small_packets"
                                    className="input w-full"
                                    placeholder={t('enterSmallPackets')}
                                    value={newTransportation.small_packets}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                            <div>
                                <label htmlFor="medium_packets" className="block text-sm font-medium text-earth-700 mb-2">
                                    {t('medium')} ({t('packets')})
                                </label>
                                <input
                                    type="number"
                                    id="medium_packets"
                                    name="medium_packets"
                                    className="input w-full"
                                    placeholder={t('enterMediumPackets')}
                                    value={newTransportation.medium_packets}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                            <div>
                                <label htmlFor="large_packets" className="block text-sm font-medium text-earth-700 mb-2">
                                    {t('large')} ({t('packets')})
                                </label>
                                <input
                                    type="number"
                                    id="large_packets"
                                    name="large_packets"
                                    className="input w-full"
                                    placeholder={t('enterLargePackets')}
                                    value={newTransportation.large_packets}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                            <div>
                                <label htmlFor="overlarge_packets" className="block text-sm font-medium text-earth-700 mb-2">
                                    {t('overlarge')} ({t('packets')})
                                </label>
                                <input
                                    type="number"
                                    id="overlarge_packets"
                                    name="overlarge_packets"
                                    className="input w-full"
                                    placeholder={t('enterXlargePackets')}
                                    value={newTransportation.overlarge_packets}
                                    onChange={handleInputChange}
                                    min="0"
                                />
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
                                    placeholder={t('optionalNotes')}
                                    value={newTransportation.notes}
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
                                {loading ? t('adding') : t('addTransportation')}
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Edit Transportation Modal */}
                <Modal
                    isOpen={!!editingTransportation}
                    onClose={cancelEdit}
                    title={t('editTransportation')}
                >
                    {editingTransportation && (
                        <form onSubmit={handleUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('lotNumber')}</label>
                                    <input
                                        type="text"
                                        name="lot_number"
                                        className="input w-full"
                                        value={editingTransportation.lot_number || ''}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('transportDate')}</label>
                                    <input
                                        type="date"
                                        name="transport_date"
                                        className="input w-full"
                                        value={editingTransportation.transport_date || ''}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('small')} ({t('packets')})</label>
                                    <input
                                        type="number"
                                        name="small_packets"
                                        className="input w-full"
                                        value={editingTransportation.small_packets || ''}
                                        onChange={handleEditInputChange}
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('medium')} ({t('packets')})</label>
                                    <input
                                        type="number"
                                        name="medium_packets"
                                        className="input w-full"
                                        value={editingTransportation.medium_packets || ''}
                                        onChange={handleEditInputChange}
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('large')} ({t('packets')})</label>
                                    <input
                                        type="number"
                                        name="large_packets"
                                        className="input w-full"
                                        value={editingTransportation.large_packets || ''}
                                        onChange={handleEditInputChange}
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('overlarge')} ({t('packets')})</label>
                                    <input
                                        type="number"
                                        name="overlarge_packets"
                                        className="input w-full"
                                        value={editingTransportation.overlarge_packets || ''}
                                        onChange={handleEditInputChange}
                                        min="0"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-earth-700 mb-1">{t('notes')}</label>
                                    <textarea
                                        name="notes"
                                        rows={2}
                                        className="input w-full"
                                        value={editingTransportation.notes || ''}
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
                                    {loading ? t('updating') : t('updateTransportation')}
                                </button>
                            </div>
                        </form>
                    )}
                </Modal>

                {/* Transportation List */}
                <div className="card">
                    <div className="px-6 py-4 border-b border-earth-200">
                        <h3 className="text-lg font-medium text-earth-900">{t('transportationRecords')}</h3>
                        <p className="text-sm text-earth-600 mt-1">
                            {transportations.length} {transportations.length === 1 ? t('record') : t('records')} {t('total')}
                        </p>
                    </div>
                    {transportations.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-12 h-12 text-earth-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <h3 className="text-lg font-medium text-earth-900 mb-2">{t('noTransportationRecordsYet')}</h3>
                            <p className="text-earth-600 mb-4">{t('startTrackingTransportations')}</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="btn btn-primary"
                            >
                                {t('addYourFirstTransportation')}
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-earth-200">
                                <thead className="bg-earth-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('date')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('field')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('lotNumber')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('small')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('medium')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('large')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('overlarge')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('total')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-earth-200">
                                    {transportations.map((transportation) => (
                                        <React.Fragment key={transportation.id}>
                                            <tr className="hover:bg-earth-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">
                                                    {new Date(transportation.transport_date).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-900">
                                                    {getFieldName(transportation.field_id)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-900">
                                                    {transportation.lot_number}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-900">
                                                    {transportation.small_packets || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-900">
                                                    {transportation.medium_packets || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-900">
                                                    {transportation.large_packets || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-900">
                                                    {transportation.overlarge_packets || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-earth-900">
                                                    {getTotalPackets(transportation)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-600">
                                                    <button
                                                        onClick={() => startEdit(transportation)}
                                                        className="text-primary-600 hover:text-primary-900 font-medium mr-3"
                                                    >
                                                        {t('edit')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(transportation.id)}
                                                        className="text-red-600 hover:text-red-900 font-medium"
                                                    >
                                                        {t('delete')}
                                                    </button>
                                                </td>
                                            </tr>

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

export default Transportation;
