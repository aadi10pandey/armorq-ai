import axios from 'axios';
import { SystemMetrics, ApprovalRequest, AuditEvent, ToolInfo, Agent, TaskRecord, User, Workspace } from '../types';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sentinel_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Authentication
  register: async (params: { name: string; email: string; password: string; organization: string; role?: string }) => {
    const res = await apiClient.post('/auth/register', params);
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  getMe: async (): Promise<{ user: User; workspace: Workspace; agents: Agent[] }> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Agent Management
  getAgents: async (): Promise<Agent[]> => {
    const res = await apiClient.get('/agents');
    return res.data.agents || [];
  },

  createAgent: async (params: {
    name: string;
    description: string;
    purpose: string;
    maxRefundLimit: number;
    allowedActions?: string[];
    approvalRequired?: string[];
    blockedActions?: string[];
  }): Promise<Agent> => {
    const res = await apiClient.post('/agents', params);
    return res.data.agent;
  },

  updateAgent: async (id: string, updates: Partial<Agent>): Promise<Agent> => {
    const res = await apiClient.put(`/agents/${id}`, updates);
    return res.data.agent;
  },

  toggleAgentStatus: async (id: string, status: 'ACTIVE' | 'PAUSED'): Promise<Agent> => {
    const res = await apiClient.put(`/agents/${id}/status`, { status });
    return res.data.agent;
  },

  // Natural Language Instruction Input
  runInstruction: async (intent: string, agentId?: string) => {
    const res = await apiClient.post('/agent/run', { intent, agentId });
    return res.data;
  },

  // Tasks History
  getTasks: async (): Promise<TaskRecord[]> => {
    const res = await apiClient.get('/tasks');
    return res.data.tasks || [];
  },

  getTaskById: async (id: string) => {
    const res = await apiClient.get(`/tasks/${id}`);
    return res.data;
  },

  // Guided Demos
  runSafeDemo: async () => {
    const res = await apiClient.post('/demo/run-safe');
    return res.data;
  },

  runOutOfScopeDemo: async () => {
    const res = await apiClient.post('/demo/run-out-of-scope');
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

  // Tools & Telemetry
  getTools: async (): Promise<ToolInfo[]> => {
    const res = await apiClient.get('/tools');
    return res.data.tools || [];
  },

  getMetrics: async (): Promise<SystemMetrics> => {
    const res = await apiClient.get('/metrics');
    return res.data.metrics;
  },
};
