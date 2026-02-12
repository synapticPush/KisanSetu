import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useLanguage } from '../contexts/AppContext';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const LotNumbers = () => {
    const { t } = useLanguage();
    const [lotNumbers, setLotNumbers] = useState([]);
    const [newLot, setNewLot] = useState({
        lot_number: '',
        field_name: '',
        small_packets: '',
        medium_packets: '',
        large_packets: '',
        xlarge_packets: '',
        storage_date: '',
        notes: ''
    });
    const [editingLot, setEditingLot] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLotNumbers();
    }, []);

    const fetchLotNumbers = async () => {
        try {
            const response = await api.get('/lot-numbers');
            setLotNumbers(response.data);
        } catch (error) {
            console.error('Error fetching lot numbers:', error);
            setError(t('error'));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLot({ ...newLot, [name]: value });
    };

    const handleEditInputChange = (e) => {
        const { name, value, type } = e.target;

        // Handle number inputs properly
        if (type === 'number') {
            setEditingLot({ ...editingLot, [name]: value === '' ? '' : value });
        } else {
            setEditingLot({ ...editingLot, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!newLot.lot_number || !newLot.field_name) {
                setError(t('pleaseFillAllRequiredFields'));
                return;
            }

            const smallPackets = parseInt(newLot.small_packets) || 0;
            const mediumPackets = parseInt(newLot.medium_packets) || 0;
            const largePackets = parseInt(newLot.large_packets) || 0;
            const xlargePackets = parseInt(newLot.xlarge_packets) || 0;

            const totalPackets = smallPackets + mediumPackets + largePackets + xlargePackets;
            if (totalPackets <= 0) {
                setError(t('pleaseEnterValidPacketCount'));
                return;
            }

            const lotData = {
                lot_number: newLot.lot_number.trim(),
                field_name: newLot.field_name.trim(),
                small_packets: smallPackets,
                medium_packets: mediumPackets,
                large_packets: largePackets,
                xlarge_packets: xlargePackets,
                storage_date: newLot.storage_date || new Date().toISOString().split('T')[0],
                notes: newLot.notes ? newLot.notes.trim() : null
            };

            const response = await api.post('/lot-numbers', lotData);
            setLotNumbers([...lotNumbers, response.data]);
            setNewLot({
                lot_number: '',
                field_name: '',
                small_packets: '',
                medium_packets: '',
                large_packets: '',
                xlarge_packets: '',
                storage_date: '',
                notes: ''
            });
            setShowAddForm(false);
        } catch (error) {
            let errorMessage = t('failedToCreateLotNumber');
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = error.response.data.detail;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const smallPackets = parseInt(editingLot.small_packets) || 0;
            const mediumPackets = parseInt(editingLot.medium_packets) || 0;
            const largePackets = parseInt(editingLot.large_packets) || 0;
            const xlargePackets = parseInt(editingLot.xlarge_packets) || 0;

            const totalPackets = smallPackets + mediumPackets + largePackets + xlargePackets;
            if (totalPackets <= 0) {
                setError(t('pleaseEnterValidPacketCount'));
                return;
            }

            const lotData = {
                lot_number: editingLot.lot_number.trim(),
                field_name: editingLot.field_name.trim(),
                small_packets: smallPackets,
                medium_packets: mediumPackets,
                large_packets: largePackets,
                xlarge_packets: xlargePackets,
                storage_date: editingLot.storage_date,
                notes: editingLot.notes ? editingLot.notes.trim() : null
            };

            const response = await api.put(`/lot-numbers/${editingLot.id}`, lotData);
            setLotNumbers(lotNumbers.map(lot => lot.id === editingLot.id ? response.data : lot));
            setEditingLot(null);
        } catch (error) {
            let errorMessage = t('failedToUpdateLotNumber');
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = error.response.data.detail;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/lot-numbers/${id}`);
            setLotNumbers(lotNumbers.filter(lot => lot.id !== id));
            setSuccess('Lot number deleted successfully');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            console.error('Error deleting lot number:', error);
            setError(t('failedToDeleteLotNumber'));
        }
    };

    const getTotalPackets = () => {
        return lotNumbers.reduce((total, lot) => total + lot.packet_count, 0);
    };

    const getTotalLots = () => {
        return lotNumbers.length;
    };

    const getFilteredLotNumbers = () => {
        let filtered = lotNumbers;

        if (filter !== 'all') {
            filtered = filtered.filter(lot => lot.field_name === filter);
        }

        if (searchTerm) {
            filtered = filtered.filter(lot =>
                lot.lot_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lot.field_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const getFields = () => {
        const fields = [...new Set(lotNumbers.map(lot => lot.field_name))];
        return fields;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    const exportToPDF = () => {
        const doc = new jsPDF();

        // Set font to helvetica for better character spacing
        doc.setFont("helvetica");

        // Add title
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text('Lot Number Management', 105, 20, { align: 'center' });

        // Add subtitle
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text('Track potato packets transported from fields to cold storage with lot number allocation.', 105, 30, { align: 'center' });

        // Add generation date
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

        doc.setFontSize(14);
        doc.text('Summary', 20, 60);

        doc.setFontSize(11);
        doc.text(`Total Lots: ${getTotalLots()}`, 30, 70);
        doc.text(`Total Fields: ${getFields().length}`, 30, 80);

        const totalSmall = filteredLotNumbers.reduce((sum, lot) => sum + (lot.small_packets || 0), 0);
        const totalMedium = filteredLotNumbers.reduce((sum, lot) => sum + (lot.medium_packets || 0), 0);
        const totalLarge = filteredLotNumbers.reduce((sum, lot) => sum + (lot.large_packets || 0), 0);
        const totalXLarge = filteredLotNumbers.reduce((sum, lot) => sum + (lot.xlarge_packets || 0), 0);
        const grandTotal = totalSmall + totalMedium + totalLarge + totalXLarge;

        doc.text(`Total Small Packets: ${totalSmall}`, 30, 90);
        doc.text(`Total Medium Packets: ${totalMedium}`, 30, 100);
        doc.text(`Total Large Packets: ${totalLarge}`, 30, 110);
        doc.text(`Total Extra Large Packets: ${totalXLarge}`, 30, 120);
        doc.setFontSize(12);
        doc.text(`Grand Total Packets: ${grandTotal}`, 30, 130);

        if (filteredLotNumbers.length > 0) {
            doc.setFontSize(14);
            doc.text('Lot Details', 20, 150);

            const tableData = filteredLotNumbers.map(lot => [
                lot.lot_number,
                lot.field_name,
                lot.small_packets || 0,
                lot.medium_packets || 0,
                lot.large_packets || 0,
                lot.xlarge_packets || 0,
                (lot.small_packets || 0) + (lot.medium_packets || 0) + (lot.large_packets || 0) + (lot.xlarge_packets || 0),
                formatDate(lot.storage_date),
                lot.notes || '-'
            ]);

            autoTable(doc, {
                startY: 160,
                head: [[
                    'Lot Number', 'Field Name', 'Small', 'Medium', 'Large',
                    'X-Large', 'Total', 'Storage Date', 'Notes'
                ]],
                body: tableData
            });

        }

        doc.save(`lot-numbers-report-${new Date().toISOString().split('T')[0]}.pdf`);
    };


    const filteredLotNumbers = getFilteredLotNumbers();

    return (
        <div className="min-h-screen bg-earth-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Actions */}
<div className="flex justify-between items-center mb-6">
    {/* <h2 className="text-xl font-semibold text-earth-900">
        {t('lotManagement')}
    </h2> */}
    <button
        onClick={exportToPDF}
        className="btn btn-secondary"
    >
        {t('exportPDF')}
    </button>
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
                <div className="grid grid-cols-1 gap-6 mb-8">
                    <div className="card">
                        <div className="text-center p-4">
                            <p className="text-sm text-earth-600 mb-1">{t('totalLots')}</p>
                            <p className="text-2xl font-bold text-earth-900">{getTotalLots()}</p>
                        </div>
                    </div>

                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder={t('searchLotNumbers')}
                                className="input w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="sm:w-48">
                            <select
                                className="input w-full"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">{t('allFields')}</option>
                                {getFields().map(field => (
                                    <option key={field} value={field}>{field}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Add Lot Number Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary"
                    >
                        {showAddForm ? t('hideForm') : t('addLotNumber')}
                    </button>
                </div>

                {/* Add Lot Number Form */}
                {
                    showAddForm && (
                        <div className="card mb-8">
                            <h3 className="text-lg font-medium text-earth-900 mb-4">{t('addNewLotNumber')}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="lot_number" className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('lotNumber')} *
                                        </label>
                                        <input
                                            type="text"
                                            id="lot_number"
                                            name="lot_number"
                                            className="input"
                                            placeholder={t('enterLotNumber')}
                                            value={newLot.lot_number}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="field_name" className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('fieldName')} *
                                        </label>
                                        <input
                                            type="text"
                                            id="field_name"
                                            name="field_name"
                                            className="input"
                                            placeholder={t('enterFieldName')}
                                            value={newLot.field_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="storage_date" className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('storageDate')}
                                        </label>
                                        <input
                                            type="date"
                                            id="storage_date"
                                            name="storage_date"
                                            className="input"
                                            value={newLot.storage_date}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('smallPackets')}
                                        </label>
                                        <input
                                            type="number"
                                            name="small_packets"
                                            className="input"
                                            placeholder={t('enterSmallPackets')}
                                            value={newLot.small_packets}
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('mediumPackets')}
                                        </label>
                                        <input
                                            type="number"
                                            name="medium_packets"
                                            className="input"
                                            placeholder={t('enterMediumPackets')}
                                            value={newLot.medium_packets}
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('largePackets')}
                                        </label>
                                        <input
                                            type="number"
                                            name="large_packets"
                                            className="input"
                                            placeholder={t('enterLargePackets')}
                                            value={newLot.large_packets}
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('xlargePackets')}
                                        </label>
                                        <input
                                            type="number"
                                            name="xlarge_packets"
                                            className="input"
                                            placeholder={t('enterXlargePackets')}
                                            value={newLot.xlarge_packets}
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('notes')}
                                        </label>
                                        <input
                                            type="text"
                                            id="notes"
                                            name="notes"
                                            className="input"
                                            placeholder={t('enterNotes')}
                                            value={newLot.notes}
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
                                        {loading ? t('adding') : t('addLotNumber')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )
                }

                {/* Lot Numbers List */}
                <div className="space-y-4">
                    {filteredLotNumbers.length === 0 ? (
                        <div className="card text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noLotNumbersFound')}</h3>
                            <p className="mt-1 text-sm text-gray-500">{t('getStartedByAddingLotNumber')}</p>
                        </div>
                    ) : (
                        filteredLotNumbers.map(lot => (
                            <div key={lot.id} className="card">
                                {editingLot && editingLot.id === lot.id ? (
                                    <form onSubmit={handleEdit}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-earth-700 mb-2">{t('lotNumber')}</label>
                                                <input
                                                    type="text"
                                                    name="lot_number"
                                                    className="input"
                                                    value={editingLot.lot_number}
                                                    onChange={handleEditInputChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-earth-700 mb-2">{t('fieldName')}</label>
                                                <input
                                                    type="text"
                                                    name="field_name"
                                                    className="input"
                                                    value={editingLot.field_name}
                                                    onChange={handleEditInputChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-earth-700 mb-2">
                                                    {t('smallPackets')}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="small_packets"
                                                    className="input"
                                                    placeholder={t('enterSmallPackets')}
                                                    value={editingLot.small_packets}
                                                    onChange={handleEditInputChange}
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-earth-700 mb-2">
                                                    {t('mediumPackets')}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="medium_packets"
                                                    className="input"
                                                    placeholder={t('enterMediumPackets')}
                                                    value={editingLot.medium_packets}
                                                    onChange={handleEditInputChange}
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-earth-700 mb-2">
                                                    {t('largePackets')}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="large_packets"
                                                    className="input"
                                                    placeholder={t('enterLargePackets')}
                                                    value={editingLot.large_packets}
                                                    onChange={handleEditInputChange}
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-earth-700 mb-2">
                                                    {t('xlargePackets')}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="xlarge_packets"
                                                    className="input"
                                                    placeholder={t('enterXlargePackets')}
                                                    value={editingLot.xlarge_packets}
                                                    onChange={handleEditInputChange}
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-earth-700 mb-2">{t('storageDate')}</label>
                                                <input
                                                    type="date"
                                                    name="storage_date"
                                                    className="input"
                                                    value={editingLot.storage_date}
                                                    onChange={handleEditInputChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-earth-700 mb-2">{t('notes')}</label>
                                                <input
                                                    type="text"
                                                    name="notes"
                                                    className="input"
                                                    value={editingLot.notes || ''}
                                                    onChange={handleEditInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setEditingLot(null)}
                                                className="btn btn-secondary"
                                            >
                                                {t('cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="btn btn-primary disabled:opacity-50"
                                            >
                                                {loading ? t('saving') : t('save')}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0">
                                        <div className="flex-1 w-full">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                                <div className="w-full sm:w-auto">
                                                    <h3 className="text-lg font-medium text-earth-900 break-words">{lot.lot_number}</h3>
                                                    <p className="text-sm text-earth-600 break-words">{lot.field_name}</p>
                                                    <p className="text-xs text-earth-500 mt-1 break-words">
                                                        S: {lot.small_packets || 0} | M: {lot.medium_packets || 0} | L: {lot.large_packets || 0} | XL: {lot.xlarge_packets || 0}
                                                    </p>
                                                </div>
                                                <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                                                    <p className="text-lg font-semibold text-primary-600">{lot.total_packets || 0} {t('packets')}</p>
                                                    <p className="text-sm text-earth-500">{t('storedOn')}: {formatDate(lot.storage_date)}</p>
                                                </div>
                                            </div>
                                            {lot.notes && (
                                                <p className="mt-2 text-sm text-gray-600 break-words">{t('notes')}: {lot.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 self-end sm:self-center ml-0 sm:ml-4">
                                            <button
                                                onClick={() => setEditingLot(lot)}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                {t('edit')}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lot.id)}
                                                className="btn btn-danger btn-sm"
                                            >
                                                {t('delete')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div >
        </div >
    );
};

export default LotNumbers;
