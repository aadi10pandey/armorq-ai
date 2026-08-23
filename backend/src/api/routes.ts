import { Router, Request, Response } from 'express';
import { agentOrchestrator } from '../agent/orchestrator';
import { approvalService } from '../services/approvalService';
import { auditService } from '../services/auditService';
import { registeredTools } from '../tools';
import { db } from '../database/schema';
import { SystemMetrics } from '../models/types';

export const apiRouter = Router();

/**
 * Server-Sent Events (SSE) stream for live real-time UI telemetry
 */
apiRouter.get('/events/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial connection handshake
  res.write(`data: ${JSON.stringify({ event: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  const unsubscribe = agentOrchestrator.subscribeGlobal((eventType, payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });

  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ event: 'HEARTBEAT', timestamp: new Date().toISOString() })}\n\n`);
  }, 15000);

  req.on('close', () => {
    unsubscribe();
    clearInterval(heartbeat);
  });
});

/**
 * Trigger Safe Autonomous Workflow
 * Intent: "Process eligible customer refunds up to ₹5,000 for Priya Sharma"
 */
apiRouter.post('/demo/run-safe', async (req: Request, res: Response) => {
  try {
    const result = await agentOrchestrator.executeWorkflow({
      intent: 'Process eligible customer refunds up to ₹5,000 (Priya Sharma - ORD-8821)',
      scenario: 'SAFE_PRIYA',
      authorizedLimit: 5000
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Trigger Out-of-Scope High-Risk Scenario
 * Intent: "Process customer refund for Rahul Verma (₹15,000 > ₹5,000 limit)"
 */
apiRouter.post('/demo/run-out-of-scope', async (req: Request, res: Response) => {
  try {
    const result = await agentOrchestrator.executeWorkflow({
      intent: 'Process customer refund for Rahul Verma - ORD-9934 (Amount: ₹15,000)',
      scenario: 'RISKY_RAHUL',
      authorizedLimit: 5000
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Run Custom User Intent
 */
apiRouter.post('/agent/run', async (req: Request, res: Response) => {
  try {
    const { intent, amount, email, orderId } = req.body;
    const result = await agentOrchestrator.executeWorkflow({
      intent: intent || 'Process customer refund',
      scenario: 'CUSTOM',
      authorizedLimit: 5000,
      customParams: { amount: Number(amount) || 3000, email, orderId }
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Approvals API
 */
apiRouter.get('/approvals/pending', async (_req: Request, res: Response) => {
  try {
    const pending = await approvalService.getPendingApprovals();
    res.json({ success: true, approvals: pending });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/approvals/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const approval = await approvalService.getApprovalById(id);
    if (!approval) {
      return res.status(404).json({ success: false, error: 'Approval not found' });
    }
    res.json({ success: true, approval });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/approvals/:id/approve', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { reviewedBy, notes } = req.body;
    const { approval, executionResult } = await approvalService.approveRequest(
      id,
      reviewedBy || 'Security Operator (Human-in-the-Loop)',
      notes
    );

    // Resume agent orchestrator to complete the rest of the workflow
    await agentOrchestrator.resumeAfterApproval(approval.taskId, approval.id);

    res.json({ success: true, approval, executionResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/approvals/:id/reject', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { reviewedBy, notes } = req.body;
    const approval = await approvalService.rejectRequest(
      id,
      reviewedBy || 'Security Operator (Human-in-the-Loop)',
      notes
    );
    res.json({ success: true, approval });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Audit Trail API
 */
apiRouter.get('/audit', async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const logs = await auditService.getAuditLogs(limit);
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/audit/task/:taskId', async (req: Request, res: Response) => {
  try {
    const taskId = String(req.params.taskId);
    const logs = await auditService.getLogsByTask(taskId);
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Tools Center API
 */
apiRouter.get('/tools', async (_req: Request, res: Response) => {
  try {
    const tools = Object.values(registeredTools).map(t => ({
      name: t.name,
      mcp: t.mcp,
      description: t.description,
      status: t.status,
      capabilities: t.capabilities,
      authorizedScope: t.authorizedScope
    }));
    res.json({ success: true, tools });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Metrics & System Health
 */
apiRouter.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const activeTasksRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM tasks WHERE status IN ('EXECUTING', 'AWAITING_APPROVAL')`);
    const authorizedRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM audit_logs WHERE authorizationStatus IN ('AUTHORIZED', 'HUMAN_APPROVED')`);
    const blockedRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM audit_logs WHERE authorizationStatus IN ('OUT_OF_SCOPE_BLOCKED', 'HOLD_REQUESTED')`);
    const pendingRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM approval_requests WHERE status = 'PENDING'`);
    const volumeRow = await db.get<{ sum: number }>(`SELECT SUM(amount) as sum FROM payment_transactions WHERE status = 'COMPLETED'`);

    const metrics: SystemMetrics = {
      activeTasks: activeTasksRow?.count || 0,
      authorizedActions: authorizedRow?.count || 0,
      blockedActions: blockedRow?.count || 0,
      pendingApprovals: pendingRow?.count || 0,
      successfulActions: authorizedRow?.count || 0,
      totalProtectedVolume: volumeRow?.sum || 0,
      systemStatus: (pendingRow?.count || 0) > 0 ? 'SECURITY_HOLD' : 'OPTIMAL',
      armorIqStatus: process.env.ARMORIQ_API_KEY ? 'ONLINE_PROXY' : 'ONLINE_LOCAL_VERIFIER'
    };

    res.json({ success: true, metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Reset Demo State
 */
apiRouter.post('/demo/reset', async (_req: Request, res: Response) => {
  try {
    await db.seed();
    await db.run(`DELETE FROM tasks`);
    await db.run(`DELETE FROM captured_plans`);
    await db.run(`DELETE FROM approval_requests`);
    await db.run(`DELETE FROM audit_logs`);
    res.json({ success: true, message: 'Sentinel AI demo environment successfully reset to fresh state.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
