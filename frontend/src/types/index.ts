export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'STANDARD' | 'PREMIUM' | 'VIP';
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface PlanStep {
  id: string;
  stepNumber: number;
  action: string;
  tool: string;
  mcp: string;
  inputs: Record<string, any>;
  description: string;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'BLOCKED' | 'FAILED' | 'SKIPPED';
  output?: any;
  error?: string;
  scopeAllowed?: boolean;
}

export interface CapturedPlan {
  id: string;
  taskId: string;
  goal: string;
  llmModel: string;
  steps: PlanStep[];
  planHash: string;
  merkleRoot: string;
  intentToken: string;
  createdAt: string;
  authorizedScope: {
    maxRefundAmount: number;
    allowedTools: string[];
    allowedActions: string[];
    prohibitedActions: string[];
  };
}

export interface ApprovalRequest {
  id: string;
  taskId: string;
  stepId: string;
  tool: string;
  action: string;
  params: Record<string, any>;
  reason: string;
  riskSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requestedAmount?: number;
  authorizedLimit?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  policyHash: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  taskId: string;
  agentId: string;
  action: string;
  tool: string;
  authorizationStatus: 'AUTHORIZED' | 'HOLD_REQUESTED' | 'OUT_OF_SCOPE_BLOCKED' | 'HUMAN_APPROVED' | 'HUMAN_REJECTED';
  intentToken: string;
  requestId: string;
  details: Record<string, any>;
  resultSummary: string;
  cryptographicSignature: string;
}

export interface SystemMetrics {
  activeTasks: number;
  authorizedActions: number;
  blockedActions: number;
  pendingApprovals: number;
  successfulActions: number;
  totalProtectedVolume: number;
  systemStatus: 'OPTIMAL' | 'DEGRADED' | 'SECURITY_HOLD';
  armorIqStatus: 'ONLINE_PROXY' | 'ONLINE_LOCAL_VERIFIER';
}

export interface ToolInfo {
  name: string;
  mcp: string;
  description: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  capabilities: string[];
  authorizedScope: string;
}
