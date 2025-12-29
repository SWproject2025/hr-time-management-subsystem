// src/services/performance.service.ts

import axios from 'axios';
import type {
  AppraisalTemplate,
  AppraisalCycle,
  AppraisalAssignment,
  AppraisalDispute,
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateCycleDto,
  SubmitAppraisalDto,
  ResolveDisputeDto,
} from '@/types/performance';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
});

export const performanceApi = {
  // ======================
  // Templates
  // ======================
  getTemplates: () => api.get<AppraisalTemplate[]>('/performance/templates'),

  getTemplateById: (id: string) =>
    api.get<AppraisalTemplate>(`/performance/templates/${id}`),

  createTemplate: (payload: CreateTemplateDto) =>
    api.post<AppraisalTemplate>('/performance/templates', payload),

  updateTemplate: (id: string, payload: UpdateTemplateDto) =>
    api.patch<AppraisalTemplate>(`/performance/templates/${id}`, payload),

  // ✅ NEW: Delete Template
  deleteTemplate: (id: string) =>
    api.delete<{ deleted: boolean; id: string }>(`/performance/templates/${id}`),

  // ======================
  // Cycles
  // ======================
  getCycles: () => api.get<AppraisalCycle[]>('/performance/cycles'),

  getCycleById: (id: string) =>
    api.get<AppraisalCycle>(`/performance/cycles/${id}`),

  createCycle: (payload: CreateCycleDto) =>
    api.post<AppraisalCycle>('/performance/cycles', payload),

  activateCycle: (id: string) =>
    api.post(`/performance/cycles/${id}/activate`),

  publishCycle: (id: string) =>
    api.post(`/performance/cycles/${id}/publish`),

  closeCycle: (id: string) => api.post(`/performance/cycles/${id}/close`),

  archiveCycle: (id: string) =>
    api.post(`/performance/cycles/${id}/archive`),

  // ======================
  // Manager
  // ======================
  getManagerAssignments: (managerProfileId: string, cycleId?: string) =>
    api.get<AppraisalAssignment[]>(
      `/performance/manager/${managerProfileId}/assignments`,
      { params: cycleId ? { cycleId } : {} },
    ),

  getManagerAssignmentDetails: (assignmentId: string) =>
    api.get<AppraisalAssignment>(
      `/performance/manager/assignments/${assignmentId}`,
    ),

  submitManagerAppraisal: (assignmentId: string, payload: SubmitAppraisalDto) =>
    api.post(
      `/performance/manager/assignments/${assignmentId}/submit`,
      payload,
    ),

  // ======================
  // HR - Publish appraisal (single assignment)
  // ======================
  publishAssignment: (assignmentId: string) =>
    api.post(`/performance/hr/assignments/${assignmentId}/publish`),

  // ======================
  // Employee
  // ======================
  getEmployeeAppraisals: (employeeProfileId: string, cycleId?: string) =>
    api.get<AppraisalAssignment[]>(
      `/performance/employee/${employeeProfileId}/appraisals`,
      { params: cycleId ? { cycleId } : {} },
    ),

  getEmployeeAppraisal: (assignmentId: string) =>
    api.get(`/performance/employee/appraisals/${assignmentId}`),

  acknowledgeAppraisal: (assignmentId: string) =>
    api.post(`/performance/employee/appraisals/${assignmentId}/acknowledge`),

  /**
   * IMPORTANT:
   * Your backend controller currently expects the body to include:
   * { employeeProfileId, reason, employeeComments? }
   */
  submitDispute: (
    assignmentId: string,
    payload: {
      employeeProfileId: string;
      reason: string;
      employeeComments?: string;
    },
  ) =>
    api.post<AppraisalDispute>(
      `/performance/employee/appraisals/${assignmentId}/dispute`,
      payload,
    ),

  // ======================
  // HR - Resolve dispute
  // ======================
  resolveDispute: (disputeId: string, payload: ResolveDisputeDto) =>
    api.post(`/performance/hr/disputes/${disputeId}/resolve`, payload),
};
