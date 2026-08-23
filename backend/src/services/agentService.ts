import { db } from '../database/schema';
import { Agent } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class AgentService {
  public async getAgentsByWorkspace(workspaceId: string): Promise<Agent[]> {
    const rows = await db.query<any>(`SELECT * FROM agents WHERE workspaceId = ? ORDER BY createdAt ASC`, [workspaceId]);
    return rows.map(r => ({
      ...r,
      allowedActions: JSON.parse(r.allowedActionsJson || '[]'),
      approvalRequired: JSON.parse(r.approvalRequiredJson || '[]'),
      blockedActions: JSON.parse(r.blockedActionsJson || '[]')
    }));
  }

  public async getAgentById(id: string): Promise<Agent | null> {
    const row = await db.get<any>(`SELECT * FROM agents WHERE id = ?`, [id]);
    if (!row) return null;
    return {
      ...row,
      allowedActions: JSON.parse(row.allowedActionsJson || '[]'),
      approvalRequired: JSON.parse(row.approvalRequiredJson || '[]'),
      blockedActions: JSON.parse(row.blockedActionsJson || '[]')
    };
  }

  public async createAgent(params: {
    workspaceId: string;
    name: string;
    description: string;
    purpose: string;
    maxRefundLimit: number;
    allowedActions: string[];
    approvalRequired: string[];
    blockedActions: string[];
  }): Promise<Agent> {
    const id = `agent_${uuidv4().substring(0, 10)}`;
    const now = new Date().toISOString();

    const agent: Agent = {
      id,
      workspaceId: params.workspaceId,
      name: params.name.trim(),
      description: params.description.trim(),
      purpose: params.purpose.trim(),
      status: 'ACTIVE',
      maxRefundLimit: Number(params.maxRefundLimit) || 5000,
      allowedActions: params.allowedActions,
      approvalRequired: params.approvalRequired,
      blockedActions: params.blockedActions,
      createdAt: now,
      updatedAt: now
    };

    await db.run(
      `INSERT INTO agents (id, workspaceId, name, description, purpose, status, maxRefundLimit, allowedActionsJson, approvalRequiredJson, blockedActionsJson, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        agent.id,
        agent.workspaceId,
        agent.name,
        agent.description,
        agent.purpose,
        agent.status,
        agent.maxRefundLimit,
        JSON.stringify(agent.allowedActions),
        JSON.stringify(agent.approvalRequired),
        JSON.stringify(agent.blockedActions),
        agent.createdAt,
        agent.updatedAt
      ]
    );

    return agent;
  }

  public async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    const agent = await this.getAgentById(id);
    if (!agent) throw new Error(`Agent ${id} not found.`);

    const updated: Agent = {
      ...agent,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await db.run(
      `UPDATE agents SET name = ?, description = ?, purpose = ?, status = ?, maxRefundLimit = ?, allowedActionsJson = ?, approvalRequiredJson = ?, blockedActionsJson = ?, updatedAt = ? WHERE id = ?`,
      [
        updated.name,
        updated.description,
        updated.purpose,
        updated.status,
        updated.maxRefundLimit,
        JSON.stringify(updated.allowedActions),
        JSON.stringify(updated.approvalRequired),
        JSON.stringify(updated.blockedActions),
        updated.updatedAt,
        id
      ]
    );

    return updated;
  }

  public async toggleStatus(id: string, status: 'ACTIVE' | 'PAUSED'): Promise<Agent> {
    return this.updateAgent(id, { status });
  }
}

export const agentService = new AgentService();
