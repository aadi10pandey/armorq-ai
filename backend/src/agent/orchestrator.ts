import { v4 as uuidv4 } from 'uuid';
import { PlanStep, CapturedPlan } from '../models/types';
import { armorIqClient } from '../armoriq/client';
import { registeredTools } from '../tools';
import { auditService } from '../services/auditService';
import { approvalService } from '../services/approvalService';
import { intentParser } from './intentParser';
import { db } from '../database/schema';

export type EventCallback = (eventType: string, data: any) => void;

export class AgentOrchestrator {
  private activeTaskListeners: Map<string, Set<EventCallback>> = new Map();
  private globalListeners: Set<EventCallback> = new Set();

  public subscribeGlobal(callback: EventCallback): () => void {
    this.globalListeners.add(callback);
    return () => this.globalListeners.delete(callback);
  }

  public subscribeTask(taskId: string, callback: EventCallback): () => void {
    if (!this.activeTaskListeners.has(taskId)) {
      this.activeTaskListeners.set(taskId, new Set());
    }
    this.activeTaskListeners.get(taskId)!.add(callback);
    return () => {
      this.activeTaskListeners.get(taskId)?.delete(callback);
    };
  }

  public emitEvent(eventType: string, data: any, taskId?: string): void {
    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      taskId,
      data
    };

    this.globalListeners.forEach(cb => {
      try {
        cb(eventType, payload);
      } catch (err) {
        console.error('Error in global listener callback', err);
      }
    });

    if (taskId && this.activeTaskListeners.has(taskId)) {
      this.activeTaskListeners.get(taskId)!.forEach(cb => {
        try {
          cb(eventType, payload);
        } catch (err) {
          console.error(`Error in task listener callback for ${taskId}`, err);
        }
      });
    }
  }

  /**
   * Run the complete input-driven autonomous lifecycle with real ArmorIQ enforcement
   */
  public async executeWorkflow(params: {
    workspaceId?: string;
    agentId?: string;
    intent: string;
    scenario?: 'SAFE_PRIYA' | 'RISKY_RAHUL' | 'CUSTOM';
    authorizedLimit?: number;
    customParams?: any;
  }): Promise<{ taskId: string; plan: CapturedPlan; status: string; pendingApprovalId?: string; interpretedGoal: string }> {
    const taskId = `task_${uuidv4().substring(0, 8)}`;
    const workspaceId = params.workspaceId || 'ws_demo_enterprise_01';
    const agentId = params.agentId || 'agent-refund-ops-01';

    // 1. Fetch Agent's configured limit if not explicitly passed
    let limit = params.authorizedLimit;
    if (!limit) {
      const agentRow = await db.get<any>(`SELECT maxRefundLimit FROM agents WHERE id = ?`, [agentId]);
      limit = agentRow?.maxRefundLimit || 5000;
    }

    // 2. Parse User Input Dynamically
    let steps: PlanStep[];
    let interpretedGoal: string;

    if (params.scenario === 'SAFE_PRIYA') {
      const parsed = await intentParser.parseAndBuildPlan('Refund order ORD-8821 for Priya Sharma', limit);
      steps = parsed.steps;
      interpretedGoal = parsed.interpretedGoal;
    } else if (params.scenario === 'RISKY_RAHUL') {
      const parsed = await intentParser.parseAndBuildPlan('Refund order ORD-9934 for Rahul Verma (₹15,000)', limit);
      steps = parsed.steps;
      interpretedGoal = parsed.interpretedGoal;
    } else {
      const parsed = await intentParser.parseAndBuildPlan(params.intent, limit);
      steps = parsed.steps;
      interpretedGoal = parsed.interpretedGoal;
    }

    // 3. Save Task in Database
    await db.run(
      `INSERT INTO tasks (id, workspaceId, agentId, intent, interpretedGoal, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [taskId, workspaceId, agentId, params.intent, interpretedGoal, 'PLANNING', new Date().toISOString()]
    );

    this.emitEvent('TASK_CREATED', {
      taskId,
      workspaceId,
      agentId,
      intent: params.intent,
      interpretedGoal
    }, taskId);

    // 4. Capture Plan in ArmorIQ (Mints cryptographic Intent Token & Merkle Root)
    const capturedPlan = await armorIqClient.capturePlan(
      taskId,
      'gemini-2.5-flash',
      interpretedGoal,
      steps,
      limit
    );

    await db.run(
      `INSERT INTO captured_plans (id, taskId, goal, llmModel, stepsJson, planHash, merkleRoot, intentToken, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        capturedPlan.id,
        taskId,
        capturedPlan.goal,
        capturedPlan.llmModel,
        JSON.stringify(capturedPlan.steps),
        capturedPlan.planHash,
        capturedPlan.merkleRoot,
        capturedPlan.intentToken,
        capturedPlan.createdAt
      ]
    );

    this.emitEvent('PLAN_CAPTURED', { plan: capturedPlan }, taskId);

    // 5. Execute Step by Step through ArmorIQ Proxy
    await db.run(`UPDATE tasks SET status = 'EXECUTING' WHERE id = ?`, [taskId]);

    let pendingApprovalId: string | undefined;

    for (let i = 0; i < capturedPlan.steps.length; i++) {
      const step = capturedPlan.steps[i];
      step.status = 'EXECUTING';
      this.emitEvent('STEP_START', { stepIndex: i, step }, taskId);

      // Natural delay for smooth live UI updates
      await new Promise(r => setTimeout(r, 600));

      const toolDef = registeredTools[step.tool];
      if (!toolDef) {
        step.status = 'FAILED';
        step.error = `Tool ${step.tool} not available`;
        this.emitEvent('STEP_FAILED', { stepIndex: i, step }, taskId);
        break;
      }

      // Invoke tool through ArmorIQ Verification Boundary
      const { verification, output } = await armorIqClient.invoke(
        step.mcp,
        step.action,
        capturedPlan.intentToken,
        step.inputs,
        (action, inputs) => toolDef.handler(action, inputs)
      );

      if (verification.allowed) {
        step.status = 'COMPLETED';
        step.output = output;
        step.scopeAllowed = true;

        await auditService.logEvent({
          taskId,
          agentId,
          action: step.action,
          tool: step.tool,
          authorizationStatus: 'AUTHORIZED',
          intentToken: capturedPlan.intentToken,
          details: { inputs: step.inputs, output },
          resultSummary: `Action '${step.action.replace(/_/g, ' ')}' authorized and completed autonomously.`
        });

        this.emitEvent('STEP_COMPLETED', { stepIndex: i, step, output, verification }, taskId);
      } else {
        // OUT-OF-SCOPE ACTION INTERCEPTED!
        step.status = 'BLOCKED';
        step.scopeAllowed = false;
        step.error = verification.reason;

        // Create formal Approval Request in Hold state
        const approvalReq = await approvalService.createApprovalRequest({
          taskId,
          step,
          reason: verification.reason,
          requestedAmount: step.inputs.amount,
          authorizedLimit: limit,
          riskSeverity: verification.policyViolation?.severity || 'HIGH',
          intentToken: capturedPlan.intentToken
        });

        pendingApprovalId = approvalReq.id;

        await db.run(`UPDATE tasks SET status = 'AWAITING_APPROVAL' WHERE id = ?`, [taskId]);

        this.emitEvent('SCOPE_VIOLATION_BLOCKED', {
          stepIndex: i,
          step,
          verification,
          approvalRequest: approvalReq
        }, taskId);

        // Halts loop: STOPS BEFORE executing dangerous tool!
        return {
          taskId,
          plan: capturedPlan,
          status: 'AWAITING_APPROVAL',
          pendingApprovalId,
          interpretedGoal
        };
      }
    }

    await db.run(`UPDATE tasks SET status = 'COMPLETED', completedAt = ? WHERE id = ?`, [new Date().toISOString(), taskId]);
    this.emitEvent('TASK_COMPLETED', { taskId, plan: capturedPlan }, taskId);

    return {
      taskId,
      plan: capturedPlan,
      status: 'COMPLETED',
      interpretedGoal
    };
  }

  /**
   * Resumes workflow after Human Approval is granted
   */
  public async resumeAfterApproval(taskId: string, approvalId: string): Promise<void> {
    const task = await db.get(`SELECT * FROM tasks WHERE id = ?`, [taskId]);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const planRow = await db.get(`SELECT * FROM captured_plans WHERE taskId = ?`, [taskId]);
    if (!planRow) throw new Error(`Plan for task ${taskId} not found`);

    const plan: CapturedPlan = {
      ...planRow,
      steps: JSON.parse(planRow.stepsJson)
    };

    this.emitEvent('WORKFLOW_RESUMED', { taskId, approvalId }, taskId);

    const blockedStepIndex = plan.steps.findIndex(s => s.action === 'process_refund');
    if (blockedStepIndex !== -1) {
      const step = plan.steps[blockedStepIndex];
      step.status = 'COMPLETED';
      step.scopeAllowed = true;

      // Execute Step in payment sandbox with human authorization flag
      const toolDef = registeredTools[step.tool];
      const refundResult = await toolDef.handler(step.action, {
        ...step.inputs,
        authorizedBy: 'HUMAN_APPROVAL',
        approvalId
      });
      step.output = refundResult;

      this.emitEvent('STEP_COMPLETED', {
        stepIndex: blockedStepIndex,
        step,
        output: refundResult,
        resumedViaApproval: true
      }, taskId);

      // Execute subsequent steps (e.g. Notification)
      for (let i = blockedStepIndex + 1; i < plan.steps.length; i++) {
        const nextStep = plan.steps[i];
        nextStep.status = 'EXECUTING';
        this.emitEvent('STEP_START', { stepIndex: i, step: nextStep }, taskId);

        await new Promise(r => setTimeout(r, 500));

        const nextTool = registeredTools[nextStep.tool];
        const nextOutput = await nextTool.handler(nextStep.action, {
          ...nextStep.inputs,
          gatewayRef: refundResult.gatewayReference
        });

        nextStep.status = 'COMPLETED';
        nextStep.output = nextOutput;

        await auditService.logEvent({
          taskId,
          agentId: task.agentId || 'agent-refund-ops-01',
          action: nextStep.action,
          tool: nextStep.tool,
          authorizationStatus: 'AUTHORIZED',
          intentToken: plan.intentToken,
          details: { inputs: nextStep.inputs, output: nextOutput },
          resultSummary: `Action '${nextStep.action.replace(/_/g, ' ')}' completed following human approval.`
        });

        this.emitEvent('STEP_COMPLETED', { stepIndex: i, step: nextStep, output: nextOutput }, taskId);
      }
    }

    await db.run(`UPDATE tasks SET status = 'COMPLETED', completedAt = ? WHERE id = ?`, [new Date().toISOString(), taskId]);
    this.emitEvent('TASK_COMPLETED', { taskId, plan }, taskId);
  }
}

export const agentOrchestrator = new AgentOrchestrator();
