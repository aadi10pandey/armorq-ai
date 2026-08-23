import { db } from '../database/schema';
import { ApprovalRequest, PlanStep } from '../models/types';
import { ArmorIQCrypto } from '../armoriq/crypto';
import { auditService } from './auditService';
import { registeredTools } from '../tools';
import { v4 as uuidv4 } from 'uuid';

export class ApprovalService {
  public async createApprovalRequest(params: {
    taskId: string;
    step: PlanStep;
    reason: string;
    requestedAmount?: number;
    authorizedLimit?: number;
    riskSeverity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    intentToken: string;
  }): Promise<ApprovalRequest> {
    const id = `appr_${uuidv4().substring(0, 10)}`;
    const policyHash = ArmorIQCrypto.sha256({
      taskId: params.taskId,
      stepId: params.step.id,
      action: params.step.action,
      inputs: params.step.inputs,
      intentToken: params.intentToken
    });

    const request: ApprovalRequest = {
      id,
      taskId: params.taskId,
      stepId: params.step.id,
      tool: params.step.tool,
      action: params.step.action,
      params: params.step.inputs,
      reason: params.reason,
      riskSeverity: params.riskSeverity || 'HIGH',
      requestedAmount: params.requestedAmount,
      authorizedLimit: params.authorizedLimit || 5000,
      status: 'PENDING',
      policyHash,
      createdAt: new Date().toISOString()
    };

    await db.run(
      `INSERT INTO approval_requests (id, taskId, stepId, tool, action, paramsJson, reason, riskSeverity, requestedAmount, authorizedLimit, status, policyHash, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        request.id,
        request.taskId,
        request.stepId,
        request.tool,
        request.action,
        JSON.stringify(request.params),
        request.reason,
        request.riskSeverity,
        request.requestedAmount || null,
        request.authorizedLimit || null,
        request.status,
        request.policyHash,
        request.createdAt
      ]
    );

    // Audit the Hold event
    await auditService.logEvent({
      taskId: params.taskId,
      agentId: 'agent-refund-ops-01',
      action: params.step.action,
      tool: params.step.tool,
      authorizationStatus: 'HOLD_REQUESTED',
      intentToken: params.intentToken,
      details: {
        approvalId: id,
        requestedAmount: params.requestedAmount,
        authorizedLimit: params.authorizedLimit,
        riskSeverity: request.riskSeverity,
        reason: params.reason
      },
      resultSummary: `Action placed in HOLD. Approval Request #${id} generated.`
    });

    return request;
  }

  public async getPendingApprovals(): Promise<ApprovalRequest[]> {
    const rows = await db.query<any>(`SELECT * FROM approval_requests WHERE status = 'PENDING' ORDER BY createdAt DESC`);
    return rows.map(r => ({
      ...r,
      params: JSON.parse(r.paramsJson || '{}')
    }));
  }

  public async getApprovalById(id: string): Promise<ApprovalRequest | null> {
    const row = await db.get<any>(`SELECT * FROM approval_requests WHERE id = ?`, [id]);
    if (!row) return null;
    return {
      ...row,
      params: JSON.parse(row.paramsJson || '{}')
    };
  }

  public async approveRequest(
    id: string,
    reviewedBy: string = 'Security Operator (Human-in-the-Loop)',
    notes?: string
  ): Promise<{ approval: ApprovalRequest; executionResult: any }> {
    const request = await this.getApprovalById(id);
    if (!request) {
      throw new Error(`Approval request ${id} not found.`);
    }
    if (request.status !== 'PENDING') {
      throw new Error(`Approval request ${id} is already ${request.status}.`);
    }

    const resolvedAt = new Date().toISOString();
    await db.run(
      `UPDATE approval_requests SET status = 'APPROVED', reviewedBy = ?, reviewerNotes = ?, resolvedAt = ? WHERE id = ?`,
      [reviewedBy, notes || 'Authorized by Senior Operations Lead', resolvedAt, id]
    );

    request.status = 'APPROVED';
    request.reviewedBy = reviewedBy;
    request.reviewerNotes = notes;
    request.resolvedAt = resolvedAt;

    // NOW execute the underlying tool with human authorization
    const toolDef = registeredTools[request.tool];
    if (!toolDef) {
      throw new Error(`Tool ${request.tool} not registered`);
    }

    const executionInputs = {
      ...request.params,
      authorizedBy: 'HUMAN_APPROVAL' as const,
      approvalId: id
    };

    const executionResult = await toolDef.handler(request.action, executionInputs);

    // Audit the Human Approved execution
    await auditService.logEvent({
      taskId: request.taskId,
      agentId: 'agent-refund-ops-01',
      action: request.action,
      tool: request.tool,
      authorizationStatus: 'HUMAN_APPROVED',
      intentToken: `approved_${id}`,
      details: {
        approvalId: id,
        reviewedBy,
        executionResult
      },
      resultSummary: `Approved by human operator. Action executed successfully in sandbox.`
    });

    return { approval: request, executionResult };
  }

  public async rejectRequest(
    id: string,
    reviewedBy: string = 'Security Operator (Human-in-the-Loop)',
    notes?: string
  ): Promise<ApprovalRequest> {
    const request = await this.getApprovalById(id);
    if (!request) {
      throw new Error(`Approval request ${id} not found.`);
    }

    const resolvedAt = new Date().toISOString();
    await db.run(
      `UPDATE approval_requests SET status = 'REJECTED', reviewedBy = ?, reviewerNotes = ?, resolvedAt = ? WHERE id = ?`,
      [reviewedBy, notes || 'Rejected due to risk boundary constraint', resolvedAt, id]
    );

    request.status = 'REJECTED';
    request.reviewedBy = reviewedBy;
    request.reviewerNotes = notes;
    request.resolvedAt = resolvedAt;

    await auditService.logEvent({
      taskId: request.taskId,
      agentId: 'agent-refund-ops-01',
      action: request.action,
      tool: request.tool,
      authorizationStatus: 'HUMAN_REJECTED',
      intentToken: `rejected_${id}`,
      details: {
        approvalId: id,
        reviewedBy,
        notes
      },
      resultSummary: `Action REJECTED by human operator. Execution halted permanently.`
    });

    return request;
  }
}

export const approvalService = new ApprovalService();
