import axios from 'axios';
import { SystemMetrics, ApprovalRequest, AuditEvent, ToolInfo } from '../types';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Demo Triggers
  runSafeDemo: async () => {
    const res = await apiClient.post('/demo/run-safe');
    return res.data;
  },

  runOutOfScopeDemo: async () => {
    const res = await apiClient.post('/demo/run-out-of-scope');
    return res.data;
  },

  runCustomIntent: async (params: { intent: string; amount: number; email?: string; orderId?: string }) => {
    const res = await apiClient.post('/agent/run', params);
    return res.data;
  },

  resetDemo: async () => {
    const res = await apiClient.post('/demo/reset');
    return res.data;
  },

  // Approvals
  getPendingApprovals: async (): Promise<ApprovalRequest[]> => {
    const res = await apiClient.get('/approvals/pending');
    return res.data.approvals || [];
  },

  approveRequest: async (id: string, reviewedBy?: string, notes?: string) => {
    const res = await apiClient.post(`/approvals/${id}/approve`, { reviewedBy, notes });
    return res.data;
  },

  rejectRequest: async (id: string, reviewedBy?: string, notes?: string) => {
    const res = await apiClient.post(`/approvals/${id}/reject`, { reviewedBy, notes });
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (limit: number = 100): Promise<AuditEvent[]> => {
    const res = await apiClient.get('/audit', { params: { limit } });
    return res.data.logs || [];
  },

  // Telemetry & Tools
  getTools: async (): Promise<ToolInfo[]> => {
    const res = await apiClient.get('/tools');
    return res.data.tools || [];
  },

  getMetrics: async (): Promise<SystemMetrics> => {
    const res = await apiClient.get('/metrics');
    return res.data.metrics;
  },
};
