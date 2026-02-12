import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useLanguage } from '../contexts/AppContext';
import logger from '../utils/logger';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const LabourManagement = () => {
    const { t } = useLanguage();
    const [labourGroups, setLabourGroups] = useState([]);
    const [labourers, setLabourers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [attendanceTotals, setAttendanceTotals] = useState({});
    const [groupUniqueDays, setGroupUniqueDays] = useState({});
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedLabourer, setSelectedLabourer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('groups');

    // Form states
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [showLabourerForm, setShowLabourerForm] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showLabourerLogs, setShowLabourerLogs] = useState(false);
    const [showGroupSummary, setShowGroupSummary] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [editingLabourer, setEditingLabourer] = useState(null);
    const [editingPayment, setEditingPayment] = useState(null);
    const [selectedGroupForSummary, setSelectedGroupForSummary] = useState(null);

    const todayDate = new Date().toISOString().split('T')[0];
    const [attendanceDate, setAttendanceDate] = useState(todayDate);
    const [selectedAttendanceGroupId, setSelectedAttendanceGroupId] = useState('');
    const [attendanceByLabourer, setAttendanceByLabourer] = useState({});
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // Work Tracker State
    const [workData, setWorkData] = useState({}); // { groupId: { small: 0, medium: 0, large: 0, overlarge: 0, total: 0, notes: '' } }
    const [workHistory, setWorkHistory] = useState([]);
    const [workFilterDate, setWorkFilterDate] = useState(todayDate);

    // New group form
    const [newGroup, setNewGroup] = useState({ group_name: '' });

    // New labourer form
    const [newLabourer, setNewLabourer] = useState({
        name: '',
        village: '',
        group_id: '',
        daily_wage: '',
        phone: ''
    });

    // New payment form
    const [newPayment, setNewPayment] = useState({
        labourer_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        working_days: '0',
        payment_type: 'daily',
        notes: ''
    });

    useEffect(() => {
        fetchLabourGroups();
        fetchLabourers();
        fetchPayments();
        fetchAttendanceTotals();
    }, []);

    useEffect(() => {
        if (labourers.length > 0) {
            fetchGroupUniqueDays();
        }
    }, [labourers]);

    const fetchLabourGroups = async () => {
        try {
            const response = await api.get('/labour/groups');
            setLabourGroups(response.data);
        } catch (error) {
            logger.error("Error fetching labour groups", error.message);
            setError('Failed to fetch labour groups');
        }
    };

    const fetchLabourers = async () => {
        try {
            const response = await api.get('/labour/labourers');
            setLabourers(response.data);
        } catch (error) {
            logger.error("Error fetching labourers", error.message);
            setError('Failed to fetch labourers');
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await api.get('/labour/payments');
            setPayments(response.data);
        } catch (error) {
            logger.error("Error fetching payments", error.message);
            setError('Failed to fetch payments');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceTotals = async () => {
        try {
            const response = await api.get('/labour/attendance/totals');
            const totalsMap = {};
            (response.data || []).forEach((item) => {
                totalsMap[item.labourer_id] = item.total_days;
            });
            setAttendanceTotals(totalsMap);
        } catch (error) {
            logger.error("Error fetching attendance totals", error.message);
        }
    };

    const fetchGroupUniqueDays = async () => {
        try {
            const response = await api.get('/labour/attendance/history');
            const history = response.data || [];

            // Calculate unique dates per group
            const groupDates = {};
            const labourerGroupMap = {};

            labourers.forEach(l => {
                labourerGroupMap[l.id] = l.group_id;
            });

            history.forEach(record => {
                const groupId = labourerGroupMap[record.labourer_id];
                if (groupId) {
                    if (!groupDates[groupId]) {
                        groupDates[groupId] = new Set();
                    }
                    groupDates[groupId].add(record.attendance_date);
                }
            });

            // Convert Sets to counts
            const uniqueDayCounts = {};
            Object.keys(groupDates).forEach(groupId => {
                uniqueDayCounts[groupId] = groupDates[groupId].size;
            });

            setGroupUniqueDays(uniqueDayCounts);
        } catch (error) {
            logger.error("Error calculating group unique days", error.message);
        }
    };

    const fetchWorkHistory = async () => {
        try {
            const res = await api.get('/labour/group-work', {
                params: {
                    start_date: workFilterDate, // specific date or range? Use specific date for now to match attendance style, or range logic
                    end_date: workFilterDate
                }
            });
            setWorkHistory(res.data);

            // Should we also prepopulate workData if it exists?
            // Yes, let's map the history to the form state
            const currentWork = {};
            (res.data || []).forEach(record => {
                currentWork[record.group_id] = {
                    small: record.small_packets,
                    medium: record.medium_packets,
                    large: record.large_packets,
                    overlarge: record.overlarge_packets,
                    total: record.total_packets,
                    notes: record.notes || ''
                };
            });
            setWorkData(currentWork);
        } catch (error) {
            console.error("Error fetching work history", error);
        }
    };

    const fetchCumulativeWorkHistory = async () => {
        try {
            const res = await api.get('/labour/group-work', {
                params: {
                    end_date: workFilterDate
                }
            });
            
            // Calculate cumulative totals for each group
            const cumulativeTotals = {};
            (res.data || []).forEach(record => {
                if (!cumulativeTotals[record.group_id]) {
                    cumulativeTotals[record.group_id] = {
                        small: 0,
                        medium: 0,
                        large: 0,
                        overlarge: 0,
                        total: 0
                    };
                }
                cumulativeTotals[record.group_id].small += record.small_packets || 0;
                cumulativeTotals[record.group_id].medium += record.medium_packets || 0;
                cumulativeTotals[record.group_id].large += record.large_packets || 0;
                cumulativeTotals[record.group_id].overlarge += record.overlarge_packets || 0;
                cumulativeTotals[record.group_id].total += record.total_packets || 0;
            });
            
            return cumulativeTotals;
        } catch (error) {
            logger.error("Error fetching cumulative work history", error.message);
            return {};
        }
    };

    useEffect(() => {
        if (activeTab === 'work') {
            fetchWorkHistory();
        }
    }, [activeTab, workFilterDate]);

    const handleWorkDataChange = (groupId, field, value) => {
        setWorkData(prev => {
            const groupData = { ...prev[groupId] };
            groupData[field] = value;

            // Auto-calculate total if individual fields change
            if (['small', 'medium', 'large', 'overlarge'].includes(field)) {
                const s = Number(field === 'small' ? value : groupData.small || 0);
                const m = Number(field === 'medium' ? value : groupData.medium || 0);
                const l = Number(field === 'large' ? value : groupData.large || 0);
                const o = Number(field === 'overlarge' ? value : groupData.overlarge || 0);
                groupData.total = s + m + l + o;
            }

            return {
                ...prev,
                [groupId]: groupData
            };
        });
    };

    const handleSaveWork = async () => {
        try {
            const promises = Object.keys(workData).map(groupId => {
                const data = workData[groupId];
                return api.post('/labour/group-work', {
                    group_id: Number(groupId),
                    work_date: workFilterDate,
                    small_packets: Number(data.small || 0),
                    medium_packets: Number(data.medium || 0),
                    large_packets: Number(data.large || 0),
                    overlarge_packets: Number(data.overlarge || 0),
                    total_packets: Number(data.total || 0),
                    notes: data.notes
                });
            });

            await Promise.all(promises);
            await fetchWorkHistory();
            await fetchWorkHistory();
            setSuccess('Work saved successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error("Error saving work", error);
            setError('Failed to save work data');
        }
    };

    const exportWorkToPDF = async () => {
        try {
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            doc.setFont('helvetica');

            // Title
            doc.setFontSize(18);
            doc.text("Group Work Report", 14, 18);

            // Report date and info
            doc.setFontSize(11);
            doc.text(`Report Date: ${new Date(workFilterDate).toLocaleDateString('en-IN')}`, 14, 24);
            doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 30);

            // Fetch cumulative data
            const cumulativeTotals = await fetchCumulativeWorkHistory();

            // Today's work data
            const tableData = labourGroups.map(group => {
                const data = workData[group.id] || { small: 0, medium: 0, large: 0, overlarge: 0, total: 0, notes: '' };
                const cumulative = cumulativeTotals[group.id] || { small: 0, medium: 0, large: 0, overlarge: 0, total: 0 };
                
                return [
                    group.group_name,
                    data.small || 0,
                    data.medium || 0,
                    data.large || 0,
                    data.overlarge || 0,
                    data.total || 0,
                    cumulative.small || 0,
                    cumulative.medium || 0,
                    cumulative.large || 0,
                    cumulative.overlarge || 0,
                    cumulative.total || 0,
                    data.notes || '-'
                ];
            });

            // Create table with current date data and till date totals
            autoTable(doc, {
                head: [[
                    'Group Name',
                    'Small (Today)',
                    'Medium (Today)',
                    'Large (Today)',
                    'Overlarge (Today)',
                    'Total (Today)',
                    'Small (Till Date)',
                    'Medium (Till Date)',
                    'Large (Till Date)',
                    'Overlarge (Till Date)',
                    'Total (Till Date)',
                    'Notes'
                ]],
                body: tableData,
                startY: 36,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    halign: 'center',
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: [30, 64, 175],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { halign: 'left', cellWidth: 22 },
                    11: { halign: 'left', cellWidth: 20 }
                }
            });

            doc.save(`work_report_${workFilterDate}.pdf`);
        } catch (error) {
            logger.error("Error exporting work report to PDF", error.message);
            setError('Failed to export work report');
        }
    };



    useEffect(() => {
        if (activeTab !== 'attendance') return;
        if (selectedAttendanceGroupId) return;
        if (labourGroups.length > 0) {
            setSelectedAttendanceGroupId(String(labourGroups[0].id));
        }
    }, [activeTab, labourGroups, selectedAttendanceGroupId]);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (activeTab !== 'attendance') return;
            if (!selectedAttendanceGroupId) return;

            const groupId = Number(selectedAttendanceGroupId);
            const groupLabourers = labourers.filter((l) => Number(l.group_id) === groupId);

            setAttendanceLoading(true);
            setError(''); // Clear any previous messages
            try {
                const response = await api.get('/labour/attendance', {
                    params: { attendance_date: attendanceDate, group_id: groupId }
                });

                const statusMap = {};
                groupLabourers.forEach((l) => {
                    statusMap[l.id] = 'absent';
                });

                (response.data || []).forEach((rec) => {
                    statusMap[rec.labourer_id] = rec.status;
                });

                setAttendanceByLabourer(statusMap);
            } catch (error) {
                logger.error("Error fetching attendance", error.message);
                setError(t('failedToFetchAttendance'));
            } finally {
                setAttendanceLoading(false);
            }
        };

        fetchAttendance();
    }, [activeTab, selectedAttendanceGroupId, attendanceDate, labourers]);

    const handleSaveAttendance = async () => {
        if (!selectedAttendanceGroupId) return;
        if (attendanceDate !== todayDate) {
            setError(t('attendanceTodayOnly'));
            return;
        }

        const groupId = Number(selectedAttendanceGroupId);
        const groupLabourers = labourers.filter((l) => Number(l.group_id) === groupId);
        const records = groupLabourers.map((l) => ({
            labourer_id: l.id,
            status: attendanceByLabourer[l.id] || 'absent'
        }));

        try {
            await api.post('/labour/attendance/bulk', {
                attendance_date: attendanceDate,
                records
            });
            await fetchAttendanceTotals();
            setError(t('attendanceMarkedSuccessfully'));
            await fetchGroupUniqueDays();
        } catch (error) {
            logger.error("Error saving attendance", error.message);
            setError(t('failedToSaveAttendance'));
        }
    };

    const exportAttendanceToPDF = async () => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        doc.setFont('helvetica');
        doc.setFontSize(18);
        doc.text('Attendance', 14, 18);

        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 24);

        const labourerById = new Map(labourers.map((l) => [l.id, l]));
        const groupById = new Map(labourGroups.map((g) => [Number(g.id), g]));

        let historyRecords = [];
        try {
            const res = await api.get('/labour/attendance/history');
            historyRecords = res.data || [];
        } catch (error) {
            logger.error("Error exporting attendance history", error.message);
            setError(t('failedToFetchAttendance'));
            return;
        }

        if (historyRecords.length === 0) {
            setError(t('noPaymentRecords'));
            return;
        }

        const byDate = {};
        historyRecords.forEach((rec) => {
            const d = rec.attendance_date;
            if (!byDate[d]) byDate[d] = [];
            byDate[d].push(rec);
        });

        const dates = Object.keys(byDate).sort((a, b) => new Date(a) - new Date(b));

        let currentY = 32;

        for (let di = 0; di < dates.length; di++) {
            const d = dates[di];

            if (currentY > 270) {
                doc.addPage();
                currentY = 18;
            }

            doc.setFontSize(14);
            doc.text(`Attendance Date: ${d}`, 14, currentY);
            currentY += 6;

            const byGroup = {};
            byDate[d].forEach((rec) => {
                const labourer = labourerById.get(rec.labourer_id);
                if (!labourer) return;
                const gid = Number(labourer.group_id);
                if (!byGroup[gid]) byGroup[gid] = [];
                byGroup[gid].push({ rec, labourer });
            });

            const groupIds = Object.keys(byGroup).map((x) => Number(x)).sort((a, b) => {
                const ga = groupById.get(a)?.group_name || '';
                const gb = groupById.get(b)?.group_name || '';
                return ga.localeCompare(gb);
            });

            for (let gi = 0; gi < groupIds.length; gi++) {
                const gid = groupIds[gi];
                const group = groupById.get(gid);
                const groupName = group ? group.group_name : String(gid);
                const rows = (byGroup[gid] || [])
                    .slice()
                    .sort((a, b) => String(a.labourer.name || '').localeCompare(String(b.labourer.name || '')));

                if (currentY > 270) {
                    doc.addPage();
                    currentY = 18;
                }

                doc.setFontSize(12);
                doc.text(groupName, 14, currentY);
                currentY += 4;

                const tableBody = rows.map(({ rec, labourer }) => {
                    const status = rec.status || 'absent';
                    const credit = status === 'full' ? 1 : status === 'half' ? 0.5 : 0;

                    // Use English labels for PDF
                    let statusLabel = 'Absent';
                    if (status === 'full') statusLabel = 'Full Day';
                    else if (status === 'half') statusLabel = 'Half Day';

                    return [labourer.name, labourer.village, statusLabel, String(credit)];
                });

                autoTable(doc, {
                    head: [['Name', 'Village', 'Attendance Status', 'Working Days']],
                    body: tableBody,
                    startY: currentY,
                    theme: 'grid',
                    styles: { fontSize: 9, cellPadding: 2 },
                    headStyles: { fillColor: [30, 64, 175], textColor: 255 },
                    margin: { left: 14, right: 14 }
                });

                currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : currentY + 8;
            }

            currentY += 2;
        }

        doc.save(`attendance_all.pdf`);
    };

    const getAttendanceStatusLabel = (status) => {
        if (status === 'full') return t('fullDay');
        if (status === 'half') return t('halfDay');
        return t('absent');
    };

    const formatDays = (days) => {
        if (days == null) return '0';
        if (Number.isInteger(days)) return String(days);
        return Number(days).toFixed(1);
    };

    // Group management
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/labour/groups', newGroup);
            setLabourGroups([...labourGroups, response.data]);
            setNewGroup({ group_name: '' });
            setShowGroupForm(false);
            setSuccess(t('groupCreatedSuccessfully') || 'Group created successfully');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            logger.error("Error creating group", error.message);
            setError('Failed to create group');
        }
    };

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/labour/groups/${editingGroup.id}`, editingGroup);
            setLabourGroups(labourGroups.map(group =>
                group.id === editingGroup.id ? response.data : group
            ));
            setEditingGroup(null);
            setSuccess(t('groupUpdatedSuccessfully') || 'Group updated successfully');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            logger.error("Error updating group", error.message);
            setError('Failed to update group');
        }
    };

    const handleDeleteGroup = async (id) => {
        try {
            await api.delete(`/labour/groups/${id}`);
            setLabourGroups(labourGroups.filter(group => group.id !== id));
            setSuccess(t('labourGroupDeletedSuccessfully') || 'Labour group deleted successfully');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            logger.error("Error deleting group", error.message);
            setError('Failed to delete group');
        }
    };

    // Labourer management
    const handleCreateLabourer = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/labour/labourers', {
                ...newLabourer,
                daily_wage: parseFloat(newLabourer.daily_wage)
            });
            setLabourers([...labourers, response.data]);
            setNewLabourer({
                name: '',
                village: '',
                group_id: '',
                daily_wage: '',
                phone: ''
            });
            setShowLabourerForm(false);
            setSuccess(t('labourerCreatedSuccessfully') || 'Labourer created successfully');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            logger.error("Error creating labourer", error.message);
            setError('Failed to create labourer');
        }
    };

    const handleUpdateLabourer = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/labour/labourers/${editingLabourer.id}`, {
                ...editingLabourer,
                daily_wage: parseFloat(editingLabourer.daily_wage)
            });
            setLabourers(labourers.map(labourer =>
                labourer.id === editingLabourer.id ? response.data : labourer
            ));
            setEditingLabourer(null);
            setSuccess(t('labourerUpdatedSuccessfully') || 'Labourer updated successfully');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            logger.error("Error updating labourer", error.message);
            setError('Failed to update labourer');
        }
    };

    const handleDeleteLabourer = async (id) => {
        try {
            await api.delete(`/labour/labourers/${id}`);
            setLabourers(labourers.filter(labourer => labourer.id !== id));
            setSuccess(t('labourerDeletedSuccessfully') || 'Labourer deleted successfully');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            logger.error("Error deleting labourer", error.message);
            setError('Failed to delete labourer');
        }
    };

    // Payment management
    const handleCreatePayment = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/labour/payments', {
                ...newPayment,
                amount: parseFloat(newPayment.amount),
                working_days: 0 // Will be updated by attendance system in future
            });
            setPayments([...payments, response.data]);
            setNewPayment({
                labourer_id: '',
                amount: '',
                payment_date: new Date().toISOString().split('T')[0],
                working_days: '0',
                payment_type: 'daily',
                notes: ''
            });
            setShowPaymentForm(false);
            setSelectedLabourer(null);
            setSuccess(t('paymentRecordedSuccessfully') || 'Payment recorded successfully');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            logger.error("Error creating payment", error.message);
            setError('Failed to create payment');
        }
    };

    // Calculate totals for labourer
    const getLabourerStats = (labourerId) => {
        const labourerPayments = payments.filter(p => p.labourer_id === labourerId);
        const totalAmount = labourerPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const totalDays = attendanceTotals[labourerId] || 0;
        return { totalAmount, totalDays };
    };

    // Get detailed payment logs for a labourer
    const getLabourerPaymentLogs = (labourerId) => {
        const labourerPayments = payments.filter(p => p.labourer_id === labourerId);
        return labourerPayments.map(payment => ({
            ...payment,
            date: new Date(payment.payment_date).toLocaleDateString('en-IN'),
            amount: parseFloat(payment.amount || 0),
            workingDays: parseInt(payment.working_days || 0),
            note: payment.working_days === 0 ? '-' : `${payment.working_days} days`
        })).sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
    };

    // Calculate group summary statistics
    const getGroupSummary = (groupId) => {
        const groupLabourers = labourers.filter(labourer => labourer.group_id === groupId);
        const groupPayments = payments.filter(p => {
            const labourer = labourers.find(l => l.id === p.labourer_id);
            return labourer && labourer.group_id === groupId;
        });

        return groupLabourers.map(labourer => {
            const labourerPayments = payments.filter(p => p.labourer_id === labourer.id);
            const totalWorkingDays = attendanceTotals[labourer.id] || 0;
            const totalEarnings = totalWorkingDays * parseFloat(labourer.daily_wage || 0);
            const totalPaid = labourerPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
            const balance = totalEarnings - totalPaid;

            return {
                ...labourer,
                totalWorkingDays,
                totalEarnings,
                totalPaid,
                balance
            };
        });
    };

    // Get labourers by group
    const getLabourersByGroup = (groupId) => {
        return labourers.filter(labourer => labourer.group_id === groupId);
    };

    // Export group data as PDF
    const exportGroupToPDF = (group) => {
        const groupSummary = getGroupSummary(group.id);
        const totalWorkingDays = groupUniqueDays[group.id] || 0;
        const totalEarnings = groupSummary.reduce((sum, l) => sum + l.totalEarnings, 0);
        const totalPaid = groupSummary.reduce((sum, l) => sum + l.totalPaid, 0);
        const totalAmountToPay = groupSummary.reduce((sum, l) => sum + Math.max(0, l.balance), 0);
        const totalOverpaid = groupSummary.reduce((sum, l) => sum + Math.max(0, -l.balance), 0);

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        doc.setFont('helvetica');

        // Title (match attendance PDF style)
        doc.setFontSize(18);
        doc.text(`${group.group_name} - Labourers Details`, 14, 18);

        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 24);
        doc.text(`Total Labourers: ${groupSummary.length}`, 14, 30);
        doc.text(`Total Working Days: ${formatDays(totalWorkingDays)}`, 14, 36);
        doc.text(`Total Wages: Rs ${totalEarnings.toFixed(2)}`, 14, 42);
        doc.text(`Total Paid: Rs ${totalPaid.toFixed(2)}`, 14, 48);
        doc.text(`Amount To Pay: Rs ${totalAmountToPay.toFixed(2)}`, 14, 54);
        doc.text(`Overpaid Amount: Rs ${totalOverpaid.toFixed(2)}`, 14, 60);

        const labourersData = groupSummary.map(labourer => {
            const joiningDate = labourer.created_at ? new Date(labourer.created_at).toLocaleDateString('en-IN') : '-';
            const dailyWage = parseFloat(labourer.daily_wage || 0);
            const totalWages = labourer.totalEarnings;
            const totalPaidAmount = labourer.totalPaid;
            const amountToPay = Math.max(0, labourer.balance);
            const overpaidAmount = Math.max(0, -labourer.balance);

            return [
                labourer.name,
                joiningDate,
                formatDays(labourer.totalWorkingDays),
                `Rs ${dailyWage.toFixed(2)}`,
                `Rs ${totalWages.toFixed(2)}`,
                `Rs ${totalPaidAmount.toFixed(2)}`,
                `Rs ${amountToPay.toFixed(2)}`,
                `Rs ${overpaidAmount.toFixed(2)}`
            ];
        });

        // Labourers table
        autoTable(doc, {
            head: [[
                'Name',
                'Joining Date',
                'Total Working Days',
                'Daily Wage',
                'Total Wages',
                'Total Paid',
                'Amount To Pay',
                'Overpaid Amount'
            ]],
            body: labourersData,
            startY: 68,
            theme: "grid",
            tableWidth: "auto",
            margin: { left: 14, right: 14 },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                halign: "center",
                valign: "middle",
                overflow: "linebreak"
            },
            headStyles: {
                fillColor: [30, 64, 175],
                textColor: 255,
                fontStyle: "bold",
                halign: "center",
                valign: "middle",
                fontSize: 10
            },
            columnStyles: {
                0: { cellWidth: 32 }, // Name
                1: { cellWidth: 22 }, // Joining Date
                2: { cellWidth: 18 }, // Working Days
                3: { cellWidth: 20 }, // Daily Wage
                4: { cellWidth: 22 }, // Total Wages
                5: { cellWidth: 22 }, // Paid
                6: { cellWidth: 22 }, // Amount To Pay
                7: { cellWidth: 22 }  // Overpaid
            }
        });

        doc.save(`${group.group_name}_labour_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-earth-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                {/* <div className="mb-8">
                    <h1 className="text-3xl font-bold text-earth-900">{t('labourManagement')}</h1>
                    <p className="text-earth-600 mt-2">{t('manageLabourGroups')}, {t('manageLabourers')}, {t('paymentHistory')}</p>
                </div> */}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        {success}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="mb-6 border-b border-earth-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('groups')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'groups'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300'
                                }`}
                        >
                            {t('labourGroups')}
                        </button>
                        <button
                            onClick={() => setActiveTab('labourers')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'labourers'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300'
                                }`}
                        >
                            {t('labourers')}
                        </button>
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'attendance'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300'
                                }`}
                        >
                            {t('attendance')}
                        </button>
                        <button
                            onClick={() => setActiveTab('work')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'work'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-earth-500 hover:text-earth-700 hover:border-earth-300'
                                }`}
                        >
                            {t('workTracker')}
                        </button>
                    </nav>
                </div>

                {/* Labour Groups Tab */}
                {activeTab === 'groups' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-earth-900">{t('labourGroups')}</h2>
                            <button
                                onClick={() => setShowGroupForm(true)}
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                {t('addGroup')}
                            </button>
                        </div>

                        {/* Group Modal */}
                        <Modal
                            isOpen={showGroupForm || !!editingGroup}
                            onClose={() => {
                                setShowGroupForm(false);
                                setEditingGroup(null);
                            }}
                            title={editingGroup ? t('updateGroup') : t('createGroup')}
                        >
                            <form onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup}>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('groupName')}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editingGroup ? editingGroup.group_name : newGroup.group_name}
                                            onChange={(e) => editingGroup
                                                ? setEditingGroup({ ...editingGroup, group_name: e.target.value })
                                                : setNewGroup({ ...newGroup, group_name: e.target.value })
                                            }
                                            className="input w-full"
                                            placeholder={t('enterGroupName')}
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowGroupForm(false);
                                            setEditingGroup(null);
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        {editingGroup ? t('updateGroup') : t('createGroup')}
                                    </button>
                                </div>
                            </form>
                        </Modal>

                        {/* Groups List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {labourGroups.map(group => {
                                const groupLabourers = getLabourersByGroup(group.id);
                                return (
                                    <div key={group.id} className="card">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-medium text-earth-900">{group.group_name}</h3>
                                                <p className="text-sm text-earth-600">{groupLabourers.length} {t('labourers')}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setEditingGroup(group)}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGroup(group.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {groupLabourers.slice(0, 3).map(labourer => (
                                                <div key={labourer.id} className="text-sm text-earth-600">
                                                    • {labourer.name} ({labourer.village})
                                                </div>
                                            ))}
                                            {groupLabourers.length > 3 && (
                                                <div className="text-sm text-earth-500">
                                                    +{groupLabourers.length - 3} more...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Labourers Tab */}
                {activeTab === 'labourers' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-earth-900">{t('labourers')}</h2>
                            <button
                                onClick={() => setShowLabourerForm(true)}
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                {t('addLabourer')}
                            </button>
                        </div>

                        {/* Labourer Modal */}
                        <Modal
                            isOpen={showLabourerForm || !!editingLabourer}
                            onClose={() => {
                                setShowLabourerForm(false);
                                setEditingLabourer(null);
                            }}
                            title={editingLabourer ? t('updateLabourer') : t('createLabourer')}
                        >
                            <form onSubmit={editingLabourer ? handleUpdateLabourer : handleCreateLabourer}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('name')}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editingLabourer ? editingLabourer.name : newLabourer.name}
                                            onChange={(e) => editingLabourer
                                                ? setEditingLabourer({ ...editingLabourer, name: e.target.value })
                                                : setNewLabourer({ ...newLabourer, name: e.target.value })}
                                            className="input w-full"
                                            placeholder={t('enterName')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('village')}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editingLabourer ? editingLabourer.village : newLabourer.village}
                                            onChange={(e) => editingLabourer
                                                ? setEditingLabourer({ ...editingLabourer, village: e.target.value })
                                                : setNewLabourer({ ...newLabourer, village: e.target.value })}
                                            className="input w-full"
                                            placeholder={t('enterVillage')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('groupName')}
                                        </label>
                                        <select
                                            required
                                            value={editingLabourer ? editingLabourer.group_id : newLabourer.group_id}
                                            onChange={(e) => editingLabourer
                                                ? setEditingLabourer({ ...editingLabourer, group_id: e.target.value })
                                                : setNewLabourer({ ...newLabourer, group_id: e.target.value })}
                                            className="input w-full"
                                        >
                                            <option value="">{t('selectGroup')}</option>
                                            {labourGroups.map(group => (
                                                <option key={group.id} value={group.id}>{group.group_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('dailyWage')}
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={editingLabourer ? editingLabourer.daily_wage : newLabourer.daily_wage}
                                            onChange={(e) => editingLabourer
                                                ? setEditingLabourer({ ...editingLabourer, daily_wage: e.target.value })
                                                : setNewLabourer({ ...newLabourer, daily_wage: e.target.value })}
                                            className="input w-full"
                                            placeholder={t('enterDailyWage')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('phoneNumber')}
                                        </label>
                                        <input
                                            type="tel"
                                            value={editingLabourer ? editingLabourer.phone : newLabourer.phone}
                                            onChange={(e) => editingLabourer
                                                ? setEditingLabourer({ ...editingLabourer, phone: e.target.value })
                                                : setNewLabourer({ ...newLabourer, phone: e.target.value })}
                                            className="input w-full"
                                            placeholder={t('enterPhoneNumber')}
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowLabourerForm(false);
                                            setEditingLabourer(null);
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        {editingLabourer ? t('updateLabourer') : t('createLabourer')}
                                    </button>
                                </div>
                            </form>
                        </Modal>

                        {/* Labourers Organized by Groups */}
                        {labourGroups.length === 0 ? (
                            <div className="card text-center py-8">
                                <p className="text-earth-600">{t('noLabourGroupsFound')}</p>
                                <p className="text-earth-500 mt-2">{t('getStartedByAddingGroup')}</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {labourGroups.map(group => {
                                    const groupLabourers = labourers.filter(labourer => labourer.group_id === group.id);
                                    return (
                                        <div key={group.id} className="space-y-4">
                                            {/* Group Header */}
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-earth-900">
                                                    {group.group_name}
                                                    <span className="ml-2 text-sm font-normal text-earth-600">
                                                        ({groupLabourers.length} {t('labourers')})
                                                    </span>
                                                </h3>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => exportGroupToPDF(group)}
                                                        className="text-red-600 hover:text-red-700"
                                                        title="Export as PDF"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedGroupForSummary(group);
                                                            setShowGroupSummary(true);
                                                        }}
                                                        className="text-purple-600 hover:text-purple-700"
                                                        title="Group Summary"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingGroup(group)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Labourers in this group */}
                                            {groupLabourers.length === 0 ? (
                                                <div className="card bg-gray-50 text-center py-6">
                                                    <p className="text-earth-500">{t('noLabourersInGroup')}</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Mobile: compact list */}
                                                    <div className="sm:hidden bg-white border border-earth-200 rounded-lg divide-y divide-earth-200">
                                                        {groupLabourers.map((labourer) => {
                                                            const stats = getLabourerStats(labourer.id);
                                                            return (
                                                                <div key={labourer.id} className="p-3">
                                                                    <div className="flex flex-col gap-3">
                                                                        <div className="flex justify-between items-start gap-3">
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="font-medium text-earth-900 break-words">{labourer.name}</div>
                                                                                <div className="text-xs text-earth-600 break-words">
                                                                                    {labourer.village} • ₹{parseFloat(labourer.daily_wage || 0).toFixed(2)}/{t('day')}
                                                                                </div>
                                                                                <div className="mt-2 text-xs text-earth-700">
                                                                                    <div className="flex justify-between">
                                                                                        <span className="text-earth-600">{t('totalReceived')}</span>
                                                                                        <span className="font-medium text-green-600">₹{stats.totalAmount.toFixed(2)}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between mt-1">
                                                                                        <span className="text-earth-600">{t('totalWorkingDays')}</span>
                                                                                        <span className="font-medium text-earth-900">{stats.totalDays}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex flex-col gap-2 shrink-0">
                                                                               <div className="flex gap-2">
                                                                                    <button
                                                                                        onClick={() => setEditingLabourer(labourer)}
                                                                                        className="text-blue-600 hover:text-blue-700 p-1"
                                                                                    >
                                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                        </svg>
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDeleteLabourer(labourer.id)}
                                                                                        className="text-red-600 hover:text-red-700 p-1"
                                                                                    >
                                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                        </svg>
                                                                                    </button>
                                                                               </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-3 flex gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedLabourer(labourer);
                                                                                setNewPayment({
                                                                                    labourer_id: labourer.id,
                                                                                    amount: '',
                                                                                    payment_date: new Date().toISOString().split('T')[0],
                                                                                    working_days: '0',
                                                                                    payment_type: 'daily',
                                                                                    notes: ''
                                                                                });
                                                                                setShowPaymentForm(true);
                                                                            }}
                                                                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                                                        >
                                                                            {t('pay')} - {t('today')}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedLabourer(labourer);
                                                                                setShowLabourerLogs(true);
                                                                            }}
                                                                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                                        >
                                                                            {t('paymentLogs')}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Desktop/tablet: existing cards */}
                                                    <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {groupLabourers.map(labourer => {
                                                            const stats = getLabourerStats(labourer.id);
                                                            return (
                                                                <div key={labourer.id} className="card">
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <div>
                                                                            <h4 className="text-lg font-medium text-earth-900">{labourer.name}</h4>
                                                                            <p className="text-sm text-earth-600">{labourer.village}</p>
                                                                            <p className="text-sm text-earth-600">₹{parseFloat(labourer.daily_wage || 0).toFixed(2)}/{t('day')}</p>
                                                                            {labourer.phone && (
                                                                                <p className="text-sm text-earth-600">{labourer.phone}</p>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex space-x-2">
                                                                            <button
                                                                                onClick={() => setEditingLabourer(labourer)}
                                                                                className="text-blue-600 hover:text-blue-700"
                                                                            >
                                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteLabourer(labourer.id)}
                                                                                className="text-red-600 hover:text-red-700"
                                                                            >
                                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Stats */}
                                                                    <div className="mb-4 p-3 bg-earth-50 rounded-lg">
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-earth-600">{t('totalReceived')}:</span>
                                                                            <span className="font-medium text-green-600">₹{stats.totalAmount.toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-sm mt-1">
                                                                            <span className="text-earth-600">{t('totalWorkingDays')}:</span>
                                                                            <span className="font-medium text-earth-900">{stats.totalDays}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Quick Payment Button */}
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedLabourer(labourer);
                                                                                setNewPayment({
                                                                                    labourer_id: labourer.id,
                                                                                    amount: '',
                                                                                    payment_date: new Date().toISOString().split('T')[0],
                                                                                    working_days: '0',
                                                                                    payment_type: 'daily',
                                                                                    notes: ''
                                                                                });
                                                                                setShowPaymentForm(true);
                                                                            }}
                                                                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                                                        >
                                                                            {t('pay')} - {t('today')}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedLabourer(labourer);
                                                                                setShowLabourerLogs(true);
                                                                            }}
                                                                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                                        >
                                                                            {t('paymentLogs')}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Labourer Payment Logs Modal */}
                        {showLabourerLogs && selectedLabourer && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-medium text-earth-900">
                                            {t('paymentLogs')} - {selectedLabourer.name}
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setShowLabourerLogs(false);
                                                setSelectedLabourer(null);
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-600">{t('totalWorkingDays')}</p>
                                            <p className="text-2xl font-bold text-blue-900">
                                                {getLabourerStats(selectedLabourer.id).totalDays}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-green-600">{t('totalPaid')}</p>
                                            <p className="text-2xl font-bold text-green-900">
                                                ₹{getLabourerStats(selectedLabourer.id).totalAmount.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <p className="text-sm text-purple-600">{t('earningsCalculation')}</p>
                                            <p className="text-2xl font-bold text-purple-900">
                                                ₹{(getLabourerStats(selectedLabourer.id).totalDays * parseFloat(selectedLabourer.daily_wage || 0)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment History Table */}
                                    <div className="card overflow-x-auto">
                                        <table className="min-w-full divide-y divide-earth-200">
                                            <thead className="bg-earth-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                                        {t('paymentDate')}
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                                        {t('amount')} {t('paid')}
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                                        {t('dailyWage')}
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                                        {t('notes')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-earth-200">
                                                {getLabourerPaymentLogs(selectedLabourer.id).map((payment, index) => (
                                                    <tr key={payment.id || index}>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-earth-900">
                                                            {payment.date}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                                                            ₹{payment.amount.toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-earth-600">
                                                            ₹{parseFloat(selectedLabourer.daily_wage || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-earth-600">
                                                            {payment.notes || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {getLabourerPaymentLogs(selectedLabourer.id).length === 0 && (
                                            <div className="text-center py-8 text-earth-500">
                                                {t('noPaymentRecords')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Group Summary Modal */}
                        {showGroupSummary && selectedGroupForSummary && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 max-h-[80vh] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-medium text-earth-900">
                                            {t('groupSummary')} - {selectedGroupForSummary.group_name}
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setShowGroupSummary(false);
                                                setSelectedGroupForSummary(null);
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Group Summary Stats */}
                                    {(() => {
                                        const groupSummary = getGroupSummary(selectedGroupForSummary.id);
                                        const totalWorkingDays = groupSummary.reduce((sum, l) => sum + l.totalWorkingDays, 0);
                                        const totalEarnings = groupSummary.reduce((sum, l) => sum + l.totalEarnings, 0);
                                        const totalPaid = groupSummary.reduce((sum, l) => sum + l.totalPaid, 0);
                                        const totalBalance = groupSummary.reduce((sum, l) => sum + l.balance, 0);

                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <p className="text-sm text-blue-600">{t('totalLabourers')}</p>
                                                    <p className="text-2xl font-bold text-blue-900">
                                                        {groupSummary.length}
                                                    </p>
                                                </div>
                                                <div className="bg-green-50 p-4 rounded-lg">
                                                    <p className="text-sm text-green-600">{t('totalWorkingDays')}</p>
                                                    <p className="text-2xl font-bold text-green-900">
                                                        {groupUniqueDays[selectedGroupForSummary.id] || 0}
                                                    </p>
                                                </div>
                                                <div className="bg-purple-50 p-4 rounded-lg">
                                                    <p className="text-sm text-purple-600">{t('totalEarnings')}</p>
                                                    <p className="text-2xl font-bold text-purple-900">
                                                        ₹{totalEarnings.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="bg-yellow-50 p-4 rounded-lg">
                                                    <p className="text-sm text-yellow-600">{t('totalPaid')}</p>
                                                    <p className="text-2xl font-bold text-yellow-900">
                                                        ₹{totalPaid.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Labourers Details Table */}
                                    <div className="card overflow-x-auto">
                                        <table className="min-w-full divide-y divide-earth-200">
                                            <thead className="bg-earth-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                                        {t('name')}
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                                        {t('village')}
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                                        {t('dailyWage')}
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                                        {t('workingDays')}
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                                        {t('totalEarnings')}
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                                        {t('totalPaid')}
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">
                                                        {t('balance')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-earth-200">
                                                {getGroupSummary(selectedGroupForSummary.id).map(labourer => (
                                                    <tr key={labourer.id}>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-earth-900">
                                                            {labourer.name}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-earth-600">
                                                            {labourer.village}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-earth-600">
                                                            ₹{parseFloat(labourer.daily_wage || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-earth-600">
                                                            {labourer.totalWorkingDays}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-600">
                                                            ₹{labourer.totalEarnings.toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                                                            ₹{labourer.totalPaid.toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                            <span className={`${labourer.balance >= 0 ? 'text-green-600' : 'text-red-600'
                                                                }`}>
                                                                ₹{labourer.balance.toFixed(2)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {getGroupSummary(selectedGroupForSummary.id).length === 0 && (
                                            <div className="text-center py-8 text-earth-500">
                                                {t('noLabourersInGroup')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Payment Modal */}
                        <Modal
                            isOpen={showPaymentForm}
                            onClose={() => {
                                setShowPaymentForm(false);
                                setSelectedLabourer(null);
                            }}
                            title={`${t('addPayment')} - ${selectedLabourer?.name}`}
                        >
                            <form onSubmit={handleCreatePayment}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('amount')} (₹)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={newPayment.amount}
                                            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                                            className="input w-full"
                                            placeholder={t('enterAmount')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('paymentDate')}
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={newPayment.payment_date}
                                            onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                                            className="input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-earth-700 mb-2">
                                            {t('notes')}
                                        </label>
                                        <input
                                            type="text"
                                            value={newPayment.notes}
                                            onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                                            className="input w-full"
                                            placeholder={t('enterNotes')}
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPaymentForm(false);
                                            setSelectedLabourer(null);
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        {t('createPayment')}
                                    </button>
                                </div>
                            </form>
                        </Modal>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-earth-900">{t('attendance')}</h2>
                            <button
                                onClick={exportAttendanceToPDF}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                {t('exportAttendancePDF')}
                            </button>
                        </div>

                        <div className="card">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-2">
                                        {t('attendanceDate')}
                                    </label>
                                    <input
                                        type="date"
                                        value={attendanceDate}
                                        max={todayDate}
                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-2">
                                        {t('groupName')}
                                    </label>
                                    <select
                                        value={selectedAttendanceGroupId}
                                        onChange={(e) => setSelectedAttendanceGroupId(e.target.value)}
                                        className="w-full px-3 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">{t('selectGroup')}</option>
                                        {labourGroups.map((g) => (
                                            <option key={g.id} value={String(g.id)}>{g.group_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        disabled={!selectedAttendanceGroupId || attendanceDate !== todayDate}
                                        onClick={handleSaveAttendance}
                                        className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('saveAttendance')}
                                    </button>
                                </div>
                            </div>

                            {attendanceDate !== todayDate && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                                    {t('attendanceTodayOnly')}
                                </div>
                            )}

                            <div className="mt-6">
                                {attendanceLoading ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-earth-200">
                                            <thead className="bg-earth-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('name')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('village')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('attendanceStatus')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-earth-200">
                                                {(() => {
                                                    const groupId = Number(selectedAttendanceGroupId);
                                                    const groupLabourers = labourers.filter((l) => Number(l.group_id) === groupId);
                                                    return groupLabourers.map((l) => (
                                                        <tr key={l.id}>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-earth-900">{l.name}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-earth-600">{l.village}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-earth-600">
                                                                {(() => {
                                                                    const value = attendanceByLabourer[l.id] || 'absent';
                                                                    const disabled = attendanceDate !== todayDate;
                                                                    return (
                                                                        <div className="flex flex-wrap gap-4">
                                                                            <label className="inline-flex items-center gap-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    disabled={disabled}
                                                                                    checked={value === 'full'}
                                                                                    onChange={() => setAttendanceByLabourer((prev) => ({ ...prev, [l.id]: 'full' }))}
                                                                                    className="h-4 w-4 text-primary-600 border-earth-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                />
                                                                                <span className="text-sm">{t('fullDay')}</span>
                                                                            </label>

                                                                            <label className="inline-flex items-center gap-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    disabled={disabled}
                                                                                    checked={value === 'half'}
                                                                                    onChange={() => setAttendanceByLabourer((prev) => ({ ...prev, [l.id]: 'half' }))}
                                                                                    className="h-4 w-4 text-primary-600 border-earth-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                />
                                                                                <span className="text-sm">{t('halfDay')}</span>
                                                                            </label>

                                                                            <label className="inline-flex items-center gap-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    disabled={disabled}
                                                                                    checked={value === 'absent'}
                                                                                    onChange={() => setAttendanceByLabourer((prev) => ({ ...prev, [l.id]: 'absent' }))}
                                                                                    className="h-4 w-4 text-primary-600 border-earth-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                />
                                                                                <span className="text-sm">{t('absent')}</span>
                                                                            </label>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </td>
                                                        </tr>
                                                    ));
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Work Tracker Tab */}
                {activeTab === 'work' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-earth-900">{t('workTracker')}</h2>
                            <button
                                onClick={exportWorkToPDF}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                {t('exportWorkPDF')}
                            </button>
                        </div>

                        <div className="card">
                            <div className="flex flex-wrap items-end gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-earth-700 mb-2">
                                        {t('date')}
                                    </label>
                                    <input
                                        type="date"
                                        value={workFilterDate}
                                        onChange={(e) => setWorkFilterDate(e.target.value)}
                                        className="px-3 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveWork}
                                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    {t('saveWork')}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-earth-200">
                                    <thead className="bg-earth-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('groupName')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('smallPackets')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('mediumPackets')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('largePackets')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('overlargePackets')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-earth-700 uppercase tracking-wider">{t('totalPackets')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-earth-500 uppercase tracking-wider">{t('notes')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-earth-200">
                                        {labourGroups.map(group => {
                                            const data = workData[group.id] || { small: 0, medium: 0, large: 0, overlarge: 0, total: 0, notes: '' };
                                            return (
                                                <tr key={group.id}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-earth-900">
                                                        {group.group_name}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={data.small || ''}
                                                            onChange={(e) => handleWorkDataChange(group.id, 'small', e.target.value)}
                                                            className="w-24 px-2 py-1 border border-earth-300 rounded focus:ring-1 focus:ring-primary-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={data.medium || ''}
                                                            onChange={(e) => handleWorkDataChange(group.id, 'medium', e.target.value)}
                                                            className="w-24 px-2 py-1 border border-earth-300 rounded focus:ring-1 focus:ring-primary-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={data.large || ''}
                                                            onChange={(e) => handleWorkDataChange(group.id, 'large', e.target.value)}
                                                            className="w-24 px-2 py-1 border border-earth-300 rounded focus:ring-1 focus:ring-primary-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={data.overlarge || ''}
                                                            onChange={(e) => handleWorkDataChange(group.id, 'overlarge', e.target.value)}
                                                            className="w-24 px-2 py-1 border border-earth-300 rounded focus:ring-1 focus:ring-primary-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={data.total || ''}
                                                            onChange={(e) => handleWorkDataChange(group.id, 'total', e.target.value)}
                                                            className="w-24 px-2 py-1 border border-earth-300 rounded focus:ring-2 focus:ring-primary-600 bg-earth-50 font-semibold"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="text"
                                                            value={data.notes || ''}
                                                            onChange={(e) => handleWorkDataChange(group.id, 'notes', e.target.value)}
                                                            className="w-full px-2 py-1 border border-earth-300 rounded focus:ring-1 focus:ring-primary-500"
                                                            placeholder={t('addNotes')}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {labourGroups.length === 0 && (
                                    <div className="text-center py-8 text-earth-500">
                                        {t('noLabourGroupsFound')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabourManagement;
