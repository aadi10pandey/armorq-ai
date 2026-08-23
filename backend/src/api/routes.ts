import { Router, Request, Response, NextFunction } from 'express';
import { agentOrchestrator } from '../agent/orchestrator';
import { approvalService } from '../services/approvalService';
import { auditService } from '../services/auditService';
import { authService } from '../services/authService';
import { agentService } from '../services/agentService';
import { registeredTools } from '../tools';
import { db } from '../database/schema';
import { SystemMetrics } from '../models/types';

export const apiRouter = Router();

// Extend Request interface with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    workspaceId: string;
    role: string;
  };
}

// Authentication Middleware
const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Optional fallback to default workspace for demo endpoints
    return next();
  }

  const token = authHeader.split(' ')[1];
  const payload = authService.verifyToken(token);
  if (payload) {
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      workspaceId: payload.workspaceId,
      role: payload.role
    };
  }
  next();
};

/**
 * Server-Sent Events (SSE) stream for live telemetry
 */
apiRouter.get('/events/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

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
 * AUTHENTICATION API
 */
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, organization, role } = req.body;
    if (!name || !email || !password || !organization) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const result = await authService.register({
      name,
      email,
      password,
      organization,
      role: role || 'Administrator'
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required.' });
    }

    const result = await authService.login(email, password);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

apiRouter.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      // Fallback demo user
      const demoUser = await authService.getUserById('user_demo_aditya_01');
      const agents = await agentService.getAgentsByWorkspace('ws_demo_enterprise_01');
      return res.json({ success: true, user: demoUser?.user, workspace: demoUser?.workspace, agents });
    }

    const userData = await authService.getUserById(req.user.id);
    const agents = await agentService.getAgentsByWorkspace(req.user.workspaceId);
    res.json({ success: true, user: userData?.user, workspace: userData?.workspace, agents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * AGENT MANAGEMENT API
 */
apiRouter.get('/agents', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId || 'ws_demo_enterprise_01';
    const agents = await agentService.getAgentsByWorkspace(workspaceId);
    res.json({ success: true, agents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/agents', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId || 'ws_demo_enterprise_01';
    const { name, description, purpose, maxRefundLimit, allowedActions, approvalRequired, blockedActions } = req.body;
    
    if (!name || !purpose) {
      return res.status(400).json({ success: false, error: 'Agent name and purpose are required.' });
    }

    const agent = await agentService.createAgent({
      workspaceId,
      name,
      description: description || purpose,
      purpose,
      maxRefundLimit: Number(maxRefundLimit) || 5000,
      allowedActions: allowedActions || ['find_customer', 'get_order_by_number', 'validate_refund_eligibility', 'process_refund'],
      approvalRequired: approvalRequired || ['process_refund_exceeding_limit'],
      blockedActions: blockedActions || ['delete_customer']
    });

    res.json({ success: true, agent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.put('/agents/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const agent = await agentService.updateAgent(id, req.body);
    res.json({ success: true, agent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.put('/agents/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const agent = await agentService.toggleStatus(id, status);
    res.json({ success: true, agent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PRIMARY USER INPUT & INSTRUCTION API
 */
apiRouter.post('/agent/run', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { intent, agentId } = req.body;
    if (!intent || !intent.trim()) {
      return res.status(400).json({ success: false, error: 'Instruction text is required.' });
    }

    const workspaceId = req.user?.workspaceId || 'ws_demo_enterprise_01';
    const activeAgentId = agentId || 'agent-refund-ops-01';

    const result = await agentOrchestrator.executeWorkflow({
      workspaceId,
      agentId: activeAgentId,
      intent: intent.trim()
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * TASKS HISTORY API
 */
apiRouter.get('/tasks', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId || 'ws_demo_enterprise_01';
    const tasks = await db.query<any>(`SELECT * FROM tasks WHERE workspaceId = ? ORDER BY createdAt DESC LIMIT 50`, [workspaceId]);
    res.json({ success: true, tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const task = await db.get(`SELECT * FROM tasks WHERE id = ?`, [id]);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    const planRow = await db.get(`SELECT * FROM captured_plans WHERE taskId = ?`, [id]);
    let plan = null;
    if (planRow) {
      plan = {
        ...planRow,
        steps: JSON.parse(planRow.stepsJson || '[]')
      };
    }

    res.json({ success: true, task, plan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GUIDED DEMO SHORTCUTS
 */
apiRouter.post('/demo/run-safe', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId || 'ws_demo_enterprise_01';
    const result = await agentOrchestrator.executeWorkflow({
      workspaceId,
      agentId: 'agent-refund-ops-01',
      intent: 'Process eligible customer refund for Order ORD-8821 (Priya Sharma - ₹4,200)',
      scenario: 'SAFE_PRIYA',
      authorizedLimit: 5000
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/demo/run-out-of-scope', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId || 'ws_demo_enterprise_01';
    const result = await agentOrchestrator.executeWorkflow({
      workspaceId,
      agentId: 'agent-refund-ops-01',
      intent: 'Process customer refund for Order ORD-9934 (Rahul Verma - ₹15,000)',
      scenario: 'RISKY_RAHUL',
      authorizedLimit: 5000
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * APPROVALS API
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
      reviewedBy || 'Lead Operations Supervisor',
      notes
    );

    // Resume agent orchestrator
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
      reviewedBy || 'Lead Operations Supervisor',
      notes
    );
    res.json({ success: true, approval });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * AUDIT TRAIL API
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

/**
 * TOOLS API
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
 * METRICS API
 */
apiRouter.get('/metrics', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId || 'ws_demo_enterprise_01';
    const agentsCount = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM agents WHERE workspaceId = ?`, [workspaceId]);
    const activeTasksRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM tasks WHERE status IN ('EXECUTING', 'AWAITING_APPROVAL')`);
    const authorizedRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM audit_logs WHERE authorizationStatus IN ('AUTHORIZED', 'HUMAN_APPROVED')`);
    const blockedRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM audit_logs WHERE authorizationStatus IN ('OUT_OF_SCOPE_BLOCKED', 'HOLD_REQUESTED')`);
    const pendingRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM approval_requests WHERE status = 'PENDING'`);
    const volumeRow = await db.get<{ sum: number }>(`SELECT SUM(amount) as sum FROM payment_transactions WHERE status = 'COMPLETED'`);

    const metrics: SystemMetrics = {
      activeAgents: agentsCount?.count || 1,
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
 * RESET DEMO STATE
 */
apiRouter.post('/demo/reset', async (_req: Request, res: Response) => {
  try {
    await db.seed();
    await db.run(`DELETE FROM tasks`);
    await db.run(`DELETE FROM captured_plans`);
    await db.run(`DELETE FROM approval_requests`);
    await db.run(`DELETE FROM audit_logs`);
    res.json({ success: true, message: 'Demo environment reset successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
