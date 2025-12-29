'use client';
import React, { useEffect, useMemo, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService, { formatEmployeeName } from '@/services/timeManagementService';
import ShiftTypeCard from '@/components/time-management/shifts/ShiftTypeCard';
import ShiftTypeForm from '@/components/time-management/shifts/ShiftTypeForm';
import ShiftAssignmentModal from '@/components/time-management/shifts/ShiftAssignmentModal';
import ShiftExpiryAlert from '@/components/time-management/shifts/ShiftExpiryAlert';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { hasAnyRole } from '@/lib/roles';

type Tab = 'types' | 'assignments' | 'expiry' | 'history';

export default function ShiftsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canManageShifts = hasAnyRole(user?.roles || [], ['HR', 'ADMIN', 'TIME_MANAGER']);
  const canBulkAssign = hasAnyRole(user?.roles || [], ['HR', 'ADMIN']);
  const canAssign = hasAnyRole(user?.roles || [], ['MANAGER','HR','ADMIN','TIME_MANAGER']);
  const [tab, setTab] = useState<Tab>('types');

  // Shift types
  const [shiftTypes, setShiftTypes] = useState<any[]>([]);
  const [shiftTypesLoading, setShiftTypesLoading] = useState(false);
  const [filterKind, setFilterKind] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [editingShift, setEditingShift] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Assignments
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Bulk assignment states
  const [bulkAssignBy, setBulkAssignBy] = useState<'department' | 'position'>('department');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedShiftType, setSelectedShiftType] = useState('');
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkEndDate, setBulkEndDate] = useState('');
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkAssignLoading, setBulkAssignLoading] = useState(false);

  // Departments and positions data
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  // Individual assignment search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterPosition, setFilterPosition] = useState('');

  // Expiry management states
  const [expiringAssignments, setExpiringAssignments] = useState<any[]>([]);
  const [expiryFilter, setExpiryFilter] = useState<'7' | '14' | '30'>('7');
  const [selectedExpiringAssignments, setSelectedExpiringAssignments] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'extend' | 'renew' | 'reassign'>('extend');
  const [bulkExtendDays, setBulkExtendDays] = useState('30');
  const [notificationLogs, setNotificationLogs] = useState<any[]>([]);

  // Extend modal state
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [extendingAssignment, setExtendingAssignment] = useState<any>(null);
  const [newEndDate, setNewEndDate] = useState('');

  // history (simple)
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadShiftTypes();
    loadAssignments();
    loadHistory();
    loadDepartmentsAndPositions();
  }, []);

  async function loadDepartmentsAndPositions() {
    try {
      const [depts, pos] = await Promise.all([
        timeManagementService.getDepartments(),
        timeManagementService.getPositions()
      ]);
      setDepartments(depts || []);
      setPositions(pos || []);
    } catch (err: any) {
      console.error('Error loading departments and positions:', err);
      // Don't show toast for this as it's not critical for the main functionality
    }
  }

  // Load expiring assignments when tab changes to expiry or filter changes
  useEffect(() => {
    if (tab === 'expiry') {
      loadExpiringAssignments();
      loadNotificationLogs();
    }
  }, [tab, expiryFilter]);

  async function loadShiftTypes() {
    setShiftTypesLoading(true);
    try {
      const types = await timeManagementService.getAllShiftTypes();
      setShiftTypes(types || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to fetch shift types', variant: 'destructive' });
    } finally {
      setShiftTypesLoading(false);
    }
  }

  async function loadAssignments() {
    setAssignLoading(true);
    try {
      const data = await timeManagementService.getAllShiftAssignments({ page, perPage });
      setAssignments(data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to fetch assignments', variant: 'destructive' });
    } finally {
      setAssignLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const data = await timeManagementService.getAllShiftAssignments({}); // reuse for demo
      setHistory((data || []).slice(0, 50));
    } catch {
      // ignore
    }
  }

  // Bulk assignment functions
  async function previewBulkAssignment() {
    if (!selectedShiftType || !bulkStartDate || !bulkEndDate) {
      toast({ title: 'Missing Information', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (bulkAssignBy === 'department' && !selectedDepartment) {
      toast({ title: 'Missing Information', description: 'Please select a department', variant: 'destructive' });
      return;
    }

    if (bulkAssignBy === 'position' && !selectedPosition) {
      toast({ title: 'Missing Information', description: 'Please select a position', variant: 'destructive' });
      return;
    }

    try {
      const previewData = {
        shiftId: selectedShiftType,
        startDate: bulkStartDate,
        endDate: bulkEndDate,
        ...(bulkAssignBy === 'department'
          ? { departmentId: selectedDepartment }
          : { positionId: selectedPosition }
        )
      };

      const result = await timeManagementService.previewBulkAssignment(previewData);
      setBulkPreview(result.employees || []);
    } catch (error: any) {
      toast({ title: 'Preview Failed', description: error.message || 'Failed to load preview', variant: 'destructive' });
    }
  }

  async function executeBulkAssignment() {
    if (!selectedShiftType || !bulkStartDate || !bulkEndDate) {
      toast({ title: 'Missing Information', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (bulkAssignBy === 'department' && !selectedDepartment) {
      toast({ title: 'Missing Information', description: 'Please select a department for bulk assignment', variant: 'destructive' });
      return;
    }

    if (bulkAssignBy === 'position' && !selectedPosition) {
      toast({ title: 'Missing Information', description: 'Please select a position for bulk assignment', variant: 'destructive' });
      return;
    }

    setBulkAssignLoading(true);
    try {
      const assignmentData = {
        shiftId: selectedShiftType,
        startDate: bulkStartDate,
        endDate: bulkEndDate,
        ...(bulkAssignBy === 'department'
          ? { departmentId: selectedDepartment }
          : { positionId: selectedPosition }
        )
      };

      console.log('Frontend: Sending bulk assignment data:', assignmentData);
      await timeManagementService.bulkAssignShifts([assignmentData]);
      toast({ title: 'Bulk Assignment Successful', description: 'Shift assignments have been created' });

      // Reset form
      setSelectedDepartment('');
      setSelectedPosition('');
      setSelectedShiftType('');
      setBulkStartDate('');
      setBulkEndDate('');
      setBulkPreview([]);

      // Reload assignments
      loadAssignments();
    } catch (error: any) {
      toast({ title: 'Bulk Assignment Failed', description: error.message || 'Failed to create assignments', variant: 'destructive' });
    } finally {
      setBulkAssignLoading(false);
    }
  }

  // Extend modal functions
  function openExtendModal(assignment: any) {
    setExtendingAssignment(assignment);

    // Calculate default extension date (add 30 days to current end date)
    let defaultNewDate = '';
    if (assignment.endDate) {
      const currentEndDate = new Date(assignment.endDate);
      currentEndDate.setDate(currentEndDate.getDate() + 30); // Default 30-day extension
      defaultNewDate = currentEndDate.toISOString().split('T')[0];
    }

    setNewEndDate(defaultNewDate);
    setExtendModalOpen(true);
  }

  function closeExtendModal() {
    setExtendModalOpen(false);
    setExtendingAssignment(null);
    setNewEndDate('');
  }

  async function handleExtendSubmit() {
    if (!extendingAssignment || !newEndDate) return;

    await extendAssignment(extendingAssignment._id, newEndDate);
    closeExtendModal();
  }

  // Quick extend function that uses the modal's default date
  async function quickExtendAssignment(assignment: any) {
    if (!assignment || !assignment.endDate) return;

    // Calculate extension date (add 30 days to current end date)
    const currentEndDate = new Date(assignment.endDate);
    currentEndDate.setDate(currentEndDate.getDate() + 30);

    const newEndDateStr = currentEndDate.toISOString().split('T')[0];

    await extendAssignment(assignment._id, newEndDateStr);
  }

  // Expiry management functions
  async function loadExpiringAssignments() {
    try {
      const allAssignments = await timeManagementService.getAllShiftAssignments({});
      const days = parseInt(expiryFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + days);

      const expiring = allAssignments.filter((assignment: any) => {
        if (!assignment.endDate) return false;
        const endDate = new Date(assignment.endDate);
        return endDate <= cutoffDate && endDate >= new Date();
      });

      setExpiringAssignments(expiring);
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to load expiring assignments', variant: 'destructive' });
    }
  }

  async function extendAssignment(assignmentId: string, newEndDate: string) {
    try {
      const assignment = expiringAssignments.find(a => a._id === assignmentId);
      if (!assignment) return;

      await timeManagementService.updateShiftAssignment(assignmentId, {
        endDate: newEndDate
      });

      toast({ title: 'Success', description: 'Assignment extended successfully' });

      // Skip notification logging for extend operations to avoid data structure issues
      // The extend functionality works fine without notifications
      console.log('Assignment extended successfully to:', new Date(newEndDate).toLocaleDateString());

      // Reload data
      loadExpiringAssignments();
      loadAssignments();
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to extend assignment', variant: 'destructive' });
    }
  }

  async function renewAssignment(assignmentId: string) {
    try {
      const assignment = expiringAssignments.find(a => a._id === assignmentId);
      if (!assignment) {
        console.error('Assignment not found for renewal:', assignmentId);
        return;
      }

      // Create a new assignment with same details but new dates
      const newStartDate = new Date();
      const newEndDate = new Date();
      newEndDate.setFullYear(newEndDate.getFullYear() + 1); // 1 year renewal

      // Extract IDs safely
      const employeeId = assignment.employeeId?._id?.toString() || assignment.employeeId?.toString();
      let shiftId = assignment.shiftId?._id?.toString() || assignment.shiftId?.toString();

      // If shiftId is still an object, try to get its _id
      if (!shiftId && typeof assignment.shiftId === 'object' && assignment.shiftId) {
        shiftId = assignment.shiftId._id?.toString() || assignment.shiftId.id?.toString();
      }

      const departmentId = assignment.departmentId?._id?.toString() || assignment.departmentId?.toString();
      const positionId = assignment.positionId?._id?.toString() || assignment.positionId?.toString();

      console.log('Renewing assignment with data:', {
        assignmentId,
        employeeId,
        shiftId,
        departmentId,
        positionId,
        startDate: newStartDate.toISOString().split('T')[0],
        endDate: newEndDate.toISOString().split('T')[0],
        rawAssignment: assignment
      });

      if (!shiftId) {
        console.error('No shiftId found for assignment:', assignment);
        toast({ title: 'Error', description: 'Cannot renew assignment: missing shift information', variant: 'destructive' });
        return;
      }

      await timeManagementService.createShiftAssignment({
        employeeId,
        shiftId,
        departmentId,
        positionId,
        startDate: newStartDate.toISOString().split('T')[0],
        endDate: newEndDate.toISOString().split('T')[0]
      });

      toast({ title: 'Success', description: 'Assignment renewed successfully' });

      // Log notification with the assignment we already have (don't fail if notification fails)
      try {
        await logExpiryActionWithAssignment(assignment, 'RENEWED', 'Renewed for 1 year');
      } catch (notificationError) {
        console.warn('Notification logging failed, but assignment was renewed successfully:', notificationError);
      }

      // Reload data
      loadExpiringAssignments();
      loadAssignments();
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to renew assignment', variant: 'destructive' });
    }
  }

  async function bulkExpiryAction() {
    if (selectedExpiringAssignments.length === 0) {
      toast({ title: 'No Selection', description: 'Please select assignments to process', variant: 'destructive' });
      return;
    }

    try {
      const promises = selectedExpiringAssignments.map(assignmentId => {
        switch (bulkActionType) {
          case 'extend':
            // For bulk extend, calculate new date by adding days to current end date
            const extendAssignmentData = expiringAssignments.find(a => a._id === assignmentId);
            if (extendAssignmentData && extendAssignmentData.endDate) {
              const currentEndDate = new Date(extendAssignmentData.endDate);
              currentEndDate.setDate(currentEndDate.getDate() + parseInt(bulkExtendDays));
              return extendAssignment(assignmentId, currentEndDate.toISOString().split('T')[0]);
            }
            return Promise.resolve();
          case 'renew':
            // Only renew assignments that have shiftId
            const renewAssignmentData = expiringAssignments.find(a => a._id === assignmentId);
            if (renewAssignmentData && renewAssignmentData.shiftId) {
              return renewAssignment(assignmentId);
            } else {
              console.log('Skipping renewal for assignment without shiftId:', assignmentId);
              return Promise.resolve();
            }
          case 'reassign':
            // For now, just extend - reassign would need more complex logic
            return extendAssignment(assignmentId, 30);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);

      toast({
        title: 'Bulk Action Complete',
        description: `Processed ${selectedExpiringAssignments.length} assignments`
      });

      setSelectedExpiringAssignments([]);
      loadExpiringAssignments();
      loadAssignments();
    } catch (error: any) {
      toast({ title: 'Bulk Action Failed', description: error.message || 'Some operations failed', variant: 'destructive' });
    }
  }

  async function logExpiryActionWithAssignment(assignment: any, action: string, details: string) {
    try {
      console.log('logExpiryActionWithAssignment called with:', { assignment, action, details });

      // Only create notification if there's an individual employee (not department/position assignment)
      if (!assignment || !assignment.employeeId) {
        console.log('Skipping notification - no assignment or no employeeId:', assignment?._id);
        return;
      }

      const employeeName = formatEmployeeName(assignment.employeeId);

      // Extract employee ID safely
      let employeeId: string;
      if (typeof assignment.employeeId === 'string') {
        employeeId = assignment.employeeId;
      } else if (assignment.employeeId?._id) {
        employeeId = assignment.employeeId._id.toString();
      } else if (assignment.employeeId?.id) {
        employeeId = assignment.employeeId.id.toString();
      } else {
        console.warn('Could not extract employee ID from assignment:', assignment);
        console.warn('assignment.employeeId type:', typeof assignment.employeeId);
        console.warn('assignment.employeeId keys:', assignment.employeeId ? Object.keys(assignment.employeeId) : 'null/undefined');
        console.warn('Full assignment object:', JSON.stringify(assignment, null, 2));
        return; // Skip notification if we can't get the ID
      }

      console.log('Creating notification log with:', {
        employeeId,
        assignmentId: assignment._id,
        action,
        employeeName,
        assignment: assignment.employeeId
      });

      await timeManagementService.createNotificationLog({
        to: employeeId,
        type: 'SHIFT_EXPIRY',
        title: `Shift ${action.toLowerCase()}`,
        message: `${employeeName}: ${details}`,
        body: `Shift assignment ${action.toLowerCase()}: ${details}`
      });

      // Reload notification logs
      loadNotificationLogs();
    } catch (error) {
      console.error('Failed to log notification:', error);
      console.error('Error details:', error?.response?.data || error?.message);
      // Don't re-throw the error - notifications are optional
    }
  }

  async function logExpiryAction(assignmentId: string, action: string, details: string) {
    try {
      const assignment = expiringAssignments.find(a => a._id === assignmentId);
      if (!assignment) {
        console.warn('Assignment not found for logging:', assignmentId);
        return;
      }

      await logExpiryActionWithAssignment(assignment, action, details);
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  async function loadNotificationLogs() {
    try {
      const logs = await timeManagementService.getNotificationLogs({
        type: 'SHIFT_EXPIRY',
        limit: 50
      });
      setNotificationLogs(logs || []);
    } catch (error) {
      console.error('Failed to load notification logs:', error);
    }
  }

  const filteredShiftTypes = useMemo(() => {
    return shiftTypes.filter((s:any) => {
      if (filterKind !== 'all' && String(s.kind || s.type || '').toUpperCase() !== filterKind.toUpperCase()) return false;
      if (search && !String(s.name || '').toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [shiftTypes, filterKind, search]);

  async function handleCreateShift(data: any) {
    if (!canManageShifts) {
      toast({ title: 'Access denied', description: 'You are not allowed to create shift types', variant: 'destructive' });
      return;
    }
    try {
      await timeManagementService.createShiftType(data);
      toast({ title: 'Created', description: 'Shift type created' });
      setShowCreate(false);
      loadShiftTypes();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to create shift type', variant: 'destructive' });
    }
  }

  async function handleUpdateShift(id: string, data: any) {
    if (!canManageShifts) {
      toast({ title: 'Access denied', description: 'You are not allowed to update shift types', variant: 'destructive' });
      return;
    }
    try {
      await timeManagementService.updateShiftType(id, data);
      toast({ title: 'Updated', description: 'Shift type updated' });
      setEditingShift(null);
      loadShiftTypes();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to update', variant: 'destructive' });
    }
  }

  async function handleDeleteShift(id: string) {
    if (!canManageShifts) {
      toast({ title: 'Access denied', description: 'You are not allowed to delete shift types', variant: 'destructive' });
      return;
    }
    if (!confirm('Delete this shift type?')) return;
    try {
      await timeManagementService.deleteShiftType(id);
      toast({ title: 'Deleted', description: 'Shift type removed' });
      loadShiftTypes();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete', variant: 'destructive' });
    }
  }

  // Assignments actions
  function openAssignModal() {
    setShowAssignModal(true);
  }

  function openBulkModal() {
    setShowBulkModal(true);
  }

  async function handleBulkAssign(assignmentsPayload: any[]) {
    if (!canBulkAssign) {
      toast({ title: 'Access denied', description: 'You are not allowed to bulk assign', variant: 'destructive' });
      return;
    }
    try {
      await timeManagementService.bulkAssignShifts(assignmentsPayload);
      toast({ title: 'Bulk assign', description: 'Assignments created' });
      setShowBulkModal(false);
      loadAssignments();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Bulk assign failed', variant: 'destructive' });
    }
  }

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6 bg-gray-50 min-h-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Shifts & Assignments</h1>
            <p className="text-sm text-gray-500">Manage shift types and employee assignments</p>
          </div>
          <div className="flex items-center gap-3">
            {canManageShifts && <button className="btn" onClick={()=>{ setShowCreate(true); setEditingShift(null); }}>Create New Shift</button>}
            {canBulkAssign && <button className="btn" onClick={openBulkModal}>Bulk Assign</button>}
            {canAssign && <button className="btn" onClick={openAssignModal}>Assign to Employee</button>}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <nav className="flex gap-2">
            <button className={`px-3 py-2 rounded ${tab==='types'?'bg-white shadow':'bg-transparent'}`} onClick={()=>setTab('types')}>Shift Types</button>
            <button className={`px-3 py-2 rounded ${tab==='assignments'?'bg-white shadow':'bg-transparent'}`} onClick={()=>setTab('assignments')}>Active Assignments</button>
            <button className={`px-3 py-2 rounded ${tab==='expiry'?'bg-white shadow':'bg-transparent'}`} onClick={()=>setTab('expiry')}>Expiring Soon</button>
            <button className={`px-3 py-2 rounded ${tab==='history'?'bg-white shadow':'bg-transparent'}`} onClick={()=>setTab('history')}>Assignment History</button>
          </nav>
        </div>

        {/* Tab content */}
        {tab === 'types' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input placeholder="Search shift types" value={search} onChange={(e)=>setSearch(e.target.value)} className="input" />
                <select value={filterKind} onChange={(e)=>setFilterKind(e.target.value)} className="input">
                  <option value="all">All kinds</option>
                  <option value="NORMAL">Normal</option>
                  <option value="SPLIT">Split</option>
                  <option value="OVERNIGHT">Overnight</option>
                  <option value="ROTATIONAL">Rotational</option>
                </select>
              </div>
              {canManageShifts && (
                <button className="btn bg-blue-600 text-white" onClick={()=>{ setShowCreate(true); setEditingShift(null); }}>
                  + Create Shift Type
                </button>
              )}
            </div>

            {shiftTypesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shift Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shift Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Break Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredShiftTypes.map((shift: any) => {
                      // Calculate total working hours
                      const calculateTotalHours = (start: string, end: string, breakMinutes: number = 0) => {
                        try {
                          const [startHour, startMin] = start.split(':').map(Number);
                          const [endHour, endMin] = end.split(':').map(Number);

                          let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                          if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight shifts

                          const netMinutes = totalMinutes - breakMinutes;
                          const hours = Math.floor(netMinutes / 60);
                          const minutes = netMinutes % 60;
                          return `${hours}h ${minutes}m`;
                        } catch {
                          return 'N/A';
                        }
                      };

                      const totalHours = calculateTotalHours(
                        shift.startTime,
                        shift.endTime,
                        shift.breakMinutes || 0
                      );

                      return (
                        <tr key={shift._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{shift.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              shift.kind === 'NORMAL' ? 'bg-green-100 text-green-800' :
                              shift.kind === 'SPLIT' ? 'bg-blue-100 text-blue-800' :
                              shift.kind === 'OVERNIGHT' ? 'bg-purple-100 text-purple-800' :
                              shift.kind === 'ROTATIONAL' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {shift.kind || shift.type || 'NORMAL'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {shift.startTime || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {shift.endTime || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {shift.breakMinutes ? `${shift.breakMinutes} min` : '0 min'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {totalHours}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {canManageShifts && (
                                <>
                                  <button
                                    onClick={() => { setEditingShift(shift); setShowCreate(true); }}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteShift(shift._id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                              <Link
                                href={`/time-management/shifts/${shift._id}/assignments`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Assignments
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredShiftTypes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No shift types found. {canManageShifts && (
                      <button
                        className="text-blue-600 hover:text-blue-900 ml-2"
                        onClick={() => { setShowCreate(true); setEditingShift(null); }}
                      >
                        Create your first shift type
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Create/Edit Modal */}
            {showCreate && (
              <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{editingShift ? 'Edit Shift Type' : 'Create Shift Type'}</h3>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={()=>{ setShowCreate(false); setEditingShift(null); }}
                    >
                      ✕
                    </button>
                  </div>
                  <ShiftTypeForm
                    initial={editingShift ? {
                      name: editingShift.name,
                      kind: editingShift.kind || editingShift.type
                    } : undefined}
                    onSaved={async ()=>{
                      await loadShiftTypes();
                      setShowCreate(false);
                      setEditingShift(null);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'assignments' && (
          <div className="space-y-8">
            {/* Bulk Assignment Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Bulk Shift Assignment</h3>

              {/* Assignment Type Selector */}
              <div className="mb-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setBulkAssignBy('department')}
                    className={`px-4 py-2 rounded-md font-medium ${
                      bulkAssignBy === 'department'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Assign by Department
                  </button>
                  <button
                    onClick={() => setBulkAssignBy('position')}
                    className={`px-4 py-2 rounded-md font-medium ${
                      bulkAssignBy === 'position'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Assign by Position
                  </button>
                </div>
              </div>

              {/* Bulk Assignment Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {bulkAssignBy === 'department' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept: any) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position *
                    </label>
                    <select
                      value={selectedPosition}
                      onChange={(e) => setSelectedPosition(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Position</option>
                      {positions.map((pos: any) => (
                        <option key={pos._id} value={pos._id}>
                          {pos.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift Type *
                  </label>
                  <select
                    value={selectedShiftType}
                    onChange={(e) => setSelectedShiftType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Shift Type</option>
                    {shiftTypes.map((shift: any) => (
                      <option key={shift._id} value={shift._id}>
                        {shift.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={bulkStartDate}
                    onChange={(e) => setBulkStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={bulkEndDate}
                    onChange={(e) => setBulkEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mb-4">
                <button
                  onClick={previewBulkAssignment}
                  disabled={!selectedShiftType || !bulkStartDate || !bulkEndDate || (!selectedDepartment && !selectedPosition)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                >
                  Preview Assignment
                </button>
                <button
                  onClick={executeBulkAssignment}
                  disabled={bulkAssignLoading || bulkPreview.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {bulkAssignLoading ? 'Assigning...' : 'Assign Shift'}
                </button>
              </div>

              {/* Preview Section */}
              {bulkPreview.length > 0 && (
                <div className="border border-gray-200 rounded-md p-4">
                  <h4 className="font-medium mb-2">Preview: Employees to be assigned</h4>
                  <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                    <div className="space-y-1">
                      {bulkPreview.map((employee, index) => (
                        <div key={index} className="text-sm">
                          {formatEmployeeName(employee.employeeId)} - {employee.departmentId} - {employee.positionId}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {bulkPreview.length} employees will be assigned to this shift.
                  </div>
                </div>
              )}
            </div>

            {/* Individual Assignment Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Individual Shift Assignments</h3>

              {/* Search and Filter */}
              <div className="mb-4 flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  <option value="engineering">Engineering</option>
                  <option value="hr">Human Resources</option>
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                </select>
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Positions</option>
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="manager">Manager</option>
                  <option value="analyst">Analyst</option>
                </select>
              </div>

              {/* Assignments Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Shift
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shift Start Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shift End Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments
                      .filter((assignment: any) => {
                        const employeeName = formatEmployeeName(assignment.employeeId).toLowerCase();
                        const matchesSearch = !searchTerm || employeeName.includes(searchTerm.toLowerCase());
                        const matchesDepartment = !filterDepartment || assignment.departmentId === filterDepartment;
                        const matchesPosition = !filterPosition || assignment.positionId === filterPosition;
                        return matchesSearch && matchesDepartment && matchesPosition;
                      })
                      .map((assignment: any) => (
                        <tr key={assignment._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatEmployeeName(assignment.employeeId)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assignment.employeeId?._id || assignment.employeeId || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assignment.departmentId || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assignment.positionId || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assignment.shiftId?.name || assignment.shiftId || 'No Shift'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                            assignment.endDate && (new Date(assignment.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 7
                              ? 'text-red-600 font-medium'
                              : 'text-gray-900'
                          }`}>
                            {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'Ongoing'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => { setShowAssignModal(true); }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Change Shift
                              </button>
                              {assignment.endDate && (
                                <button
                                  onClick={() => { /* Extend shift logic */ }}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Extend Shift
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  if (!confirm('Remove assignment?')) return;
                                  try {
                                    await timeManagementService.deleteShiftAssignment(assignment._id);
                                    toast({ title: 'Removed', description: 'Assignment removed' });
                                    loadAssignments();
                                  } catch (err: any) {
                                    toast({ title: 'Error', description: err?.message || 'Failed', variant: 'destructive' });
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {assignments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No shift assignments found.
                  </div>
                )}
              </div>

              {/* Pagination */}
              {assignments.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {assignments.length} assignments
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => { setPage(p => Math.max(1, p - 1)); loadAssignments(); }}
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">Page {page}</span>
                    <button
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      onClick={() => { setPage(p => p + 1); loadAssignments(); }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'expiry' && (
          <div className="space-y-6">
            {/* Filter Controls */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Expiring Shift Assignments</h3>

              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium">Show assignments expiring in:</label>
                <select
                  value={expiryFilter}
                  onChange={(e) => setExpiryFilter(e.target.value as '7' | '14' | '30')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Next 7 days</option>
                  <option value="14">Next 14 days</option>
                  <option value="30">Next 30 days</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedExpiringAssignments.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Bulk Actions ({selectedExpiringAssignments.length} selected)</h4>

                <div className="flex items-center gap-4">
                  <select
                    value={bulkActionType}
                    onChange={(e) => setBulkActionType(e.target.value as 'extend' | 'renew' | 'reassign')}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="extend">Extend Assignments</option>
                    <option value="renew">Renew Assignments</option>
                    <option value="reassign">Reassign Shifts</option>
                  </select>

                  {bulkActionType === 'extend' && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Extend by:</label>
                      <input
                        type="number"
                        value={bulkExtendDays}
                        onChange={(e) => setBulkExtendDays(e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                        min="1"
                        max="365"
                      />
                      <span className="text-sm">days</span>
                    </div>
                  )}

                  <button
                    onClick={bulkExpiryAction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Apply to Selected
                  </button>

                  <button
                    onClick={() => setSelectedExpiringAssignments([])}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {/* Expiring Assignments Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedExpiringAssignments.length === expiringAssignments.length && expiringAssignments.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExpiringAssignments(expiringAssignments.map(a => a._id));
                          } else {
                            setSelectedExpiringAssignments([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Shift
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Until Expiry
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expiringAssignments.map((assignment: any) => {
                    const daysUntilExpiry = Math.ceil(
                      (new Date(assignment.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );

                    const getExpiryColor = (days: number) => {
                      if (days <= 3) return 'text-red-600 font-semibold';
                      if (days <= 7) return 'text-orange-600 font-medium';
                      return 'text-yellow-600';
                    };

                    return (
                      <tr key={assignment._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedExpiringAssignments.includes(assignment._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExpiringAssignments([...selectedExpiringAssignments, assignment._id]);
                              } else {
                                setSelectedExpiringAssignments(
                                  selectedExpiringAssignments.filter(id => id !== assignment._id)
                                );
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatEmployeeName(assignment.employeeId)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignment.departmentId || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignment.shiftId?.name || assignment.shiftId || 'No Shift'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(assignment.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`text-sm ${getExpiryColor(daysUntilExpiry)}`}>
                            {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry} days`}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openExtendModal(assignment)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Extend
                            </button>
                            {assignment.shiftId && (
                              <button
                                onClick={() => renewAssignment(assignment._id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Renew
                              </button>
                            )}
                            <button
                              onClick={() => { /* Reassign logic */ }}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Reassign
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {expiringAssignments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No assignments expiring in the next {expiryFilter} days.
                </div>
              )}
            </div>

            {/* Notification Logs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Expiry Notification Logs</h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notificationLogs.map((log: any) => (
                  <div key={log._id} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{log.title}</div>
                        <div className="text-sm text-gray-600">{log.body}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Sent to: {log.to?.firstName} {log.to?.lastName || log.to}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}

                {notificationLogs.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No expiry notifications logged yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-medium mb-3">Assignment History</h3>
              <ul className="space-y-2">
                {history.map(h => (
                  <li key={h._id} className="text-sm">
                    {formatEmployeeName(h.employeeId)} — {h.shiftId?.name || h.shiftId} — {h.startDate} to {h.endDate || 'present'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Assign modals */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Assign Shift to Employee</h3>
                <button className="text-sm" onClick={()=>setShowAssignModal(false)}>Close</button>
              </div>
              <ShiftAssignmentModal onAssigned={()=>{ setShowAssignModal(false); loadAssignments(); }} onClose={()=>setShowAssignModal(false)} />
            </div>
          </div>
        )}

        {showBulkModal && (
          <BulkAssignModal onClose={()=>setShowBulkModal(false)} shiftTypes={shiftTypes} onConfirm={handleBulkAssign} />
        )}

        {extendModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Extend Assignment</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={closeExtendModal}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                  <div className="text-sm text-gray-600">
                    {extendingAssignment ? formatEmployeeName(extendingAssignment.employeeId) : ''}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current End Date
                  </label>
                  <div className="text-sm text-gray-600">
                    {extendingAssignment?.endDate ? new Date(extendingAssignment.endDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New End Date *
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={extendingAssignment?.endDate ? new Date(extendingAssignment.endDate).toISOString().split('T')[0] : undefined}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={closeExtendModal}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 border border-black"
                  onClick={handleExtendSubmit}
                  disabled={!newEndDate}
                >
                  Extend
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

function BulkAssignModal({ onClose, shiftTypes, onConfirm }: any) {
  const [employeeIdsText, setEmployeeIdsText] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [shiftId, setShiftId] = useState(shiftTypes?.[0]?._id || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const previewCount = useMemo(() => {
    const ids = employeeIdsText.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean);
    return ids.length;
  }, [employeeIdsText]);

  async function handleConfirm() {
    const employeeIds = employeeIdsText.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean);
    const assignments = employeeIds.map((eid:string)=>({
      employeeId: eid,
      shiftId,
      startDate,
      endDate,
    }));
    await onConfirm(assignments);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Bulk Assign Shifts</h3>
          <button className="text-sm" onClick={onClose}>Close</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Employee IDs (comma or newline separated)</label>
            <textarea className="w-full border p-2 rounded" rows={6} value={employeeIdsText} onChange={(e)=>setEmployeeIdsText(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Or filter by</label>
            <input placeholder="Department ID" className="input mb-2" value={department} onChange={(e)=>setDepartment(e.target.value)} />
            <input placeholder="Position ID" className="input mb-2" value={position} onChange={(e)=>setPosition(e.target.value)} />
            <label className="text-sm">Shift</label>
            <select className="input" value={shiftId} onChange={(e)=>setShiftId(e.target.value)}>
              {shiftTypes.map((s:any)=><option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <label className="text-sm mt-2">Start Date</label>
            <input type="date" className="input" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
            <label className="text-sm mt-2">Expiry Date</label>
            <input type="date" className="input" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm">Preview assignments: <strong>{previewCount}</strong></div>
          <div className="flex gap-2">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn" onClick={handleConfirm} disabled={previewCount===0}>Confirm ({previewCount})</button>
          </div>
        </div>
      </div>
    </div>
  );
}


