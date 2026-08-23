import { db } from '../database/schema';
import { AuditEvent } from '../models/types';
import { ArmorIQCrypto } from '../armoriq/crypto';
import { v4 as uuidv4 } from 'uuid';

export class AuditService {
  public async logEvent(params: {
    taskId: string;
    agentId: string;
    action: string;
    tool: string;
    authorizationStatus: 'AUTHORIZED' | 'HOLD_REQUESTED' | 'OUT_OF_SCOPE_BLOCKED' | 'HUMAN_APPROVED' | 'HUMAN_REJECTED';
    intentToken: string;
    details: Record<string, any>;
    resultSummary: string;
  }): Promise<AuditEvent> {
    const id = `audit_${uuidv4().substring(0, 10)}`;
    const timestamp = new Date().toISOString();
    const requestId = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const sealPayload = {
      id,
      timestamp,
      taskId: params.taskId,
      action: params.action,
      tool: params.tool,
      authorizationStatus: params.authorizationStatus,
      intentToken: params.intentToken,
      details: params.details
    };
    const cryptographicSignature = ArmorIQCrypto.generateAuditSeal(sealPayload);

    const event: AuditEvent = {
      id,
      timestamp,
      taskId: params.taskId,
      agentId: params.agentId,
      action: params.action,
      tool: params.tool,
      authorizationStatus: params.authorizationStatus,
      intentToken: params.intentToken,
      requestId,
      details: params.details,
      resultSummary: params.resultSummary,
      cryptographicSignature
    };

    await db.run(
      `INSERT INTO audit_logs (id, timestamp, taskId, agentId, action, tool, authorizationStatus, intentToken, requestId, detailsJson, resultSummary, cryptographicSignature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.id,
        event.timestamp,
        event.taskId,
        event.agentId,
        event.action,
        event.tool,
        event.authorizationStatus,
        event.intentToken,
        event.requestId,
        JSON.stringify(event.details),
        event.resultSummary,
        event.cryptographicSignature
      ]
    );

    return event;
  }

  public async getAuditLogs(limit: number = 100): Promise<AuditEvent[]> {
    const rows = await db.query<any>(`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?`, [limit]);
    return rows.map(r => ({
      ...r,
      details: JSON.parse(r.detailsJson || '{}')
    }));
  }

  public async getLogsByTask(taskId: string): Promise<AuditEvent[]> {
    const rows = await db.query<any>(`SELECT * FROM audit_logs WHERE taskId = ? ORDER BY timestamp ASC`, [taskId]);
    return rows.map(r => ({
      ...r,
      details: JSON.parse(r.detailsJson || '{}')
    }));
  }
}

export const auditService = new AuditService();
