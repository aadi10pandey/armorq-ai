import { v4 as uuidv4 } from 'uuid';
import { PlanStep, CapturedPlan } from '../models/types';
import { armorIqClient } from '../armoriq/client';
import { registeredTools } from '../tools';
import { auditService } from '../services/auditService';
import { approvalService } from '../services/approvalService';
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
   * Generates plan steps based on intent and target customer
   */
  public generatePlan(intent: string, scenario: 'SAFE_PRIYA' | 'RISKY_RAHUL' | 'CUSTOM', customParams?: any): { steps: PlanStep[]; goal: string; customerId: string; orderNumber: string; amount: number } {
    if (scenario === 'SAFE_PRIYA') {
      const steps: PlanStep[] = [
        {
          id: `step_1_${uuidv4().substring(0, 6)}`,
          stepNumber: 1,
          action: 'find_customer',
          tool: 'customer_database',
          mcp: 'customer-mcp',
          inputs: { email: 'priya.sharma@example.com' },
          description: 'Locate customer profile in KYC database',
          status: 'PENDING'
        },
        {
          id: `step_2_${uuidv4().substring(0, 6)}`,
          stepNumber: 2,
          action: 'get_order_by_number',
          tool: 'order_service',
          mcp: 'order-mcp',
          inputs: { orderNumber: 'ORD-8821' },
          description: 'Retrieve order details & return window status',
          status: 'PENDING'
        },
        {
          id: `step_3_${uuidv4().substring(0, 6)}`,
          stepNumber: 3,
          action: 'validate_refund_eligibility',
          tool: 'order_service',
          mcp: 'order-mcp',
          inputs: { orderId: 'ord_safe_01' },
          description: 'Validate return window, item condition, and warranty',
          status: 'PENDING'
        },
        {
          id: `step_4_${uuidv4().substring(0, 6)}`,
          stepNumber: 4,
          action: 'process_refund',
          tool: 'payment_gateway_sandbox',
          mcp: 'payment-mcp',
          inputs: {
            orderId: 'ord_safe_01',
            customerId: 'cust_priya_01',
            amount: 4200,
            currency: 'INR',
            authorizedBy: 'ARMORIQ_AUTONOMOUS'
          },
          description: 'Disburse refund of ₹4,200 via Payment Gateway Sandbox',
          status: 'PENDING'
        },
        {
          id: `step_5_${uuidv4().substring(0, 6)}`,
          stepNumber: 5,
          action: 'send_refund_confirmation',
          tool: 'notification_service',
          mcp: 'notification-mcp',
          inputs: {
            recipientEmail: 'priya.sharma@example.com',
            customerName: 'Priya Sharma',
            amount: 4200,
            currency: 'INR',
            orderNumber: 'ORD-8821'
          },
          description: 'Dispatch multi-channel confirmation to customer',
          status: 'PENDING'
        }
      ];
      return { steps, goal: 'Process eligible customer refund up to ₹5,000 for Order ORD-8821', customerId: 'cust_priya_01', orderNumber: 'ORD-8821', amount: 4200 };
    }

    if (scenario === 'RISKY_RAHUL') {
      const steps: PlanStep[] = [
        {
          id: `step_1_${uuidv4().substring(0, 6)}`,
          stepNumber: 1,
          action: 'find_customer',
          tool: 'customer_database',
          mcp: 'customer-mcp',
          inputs: { email: 'rahul.verma@example.com' },
          description: 'Locate customer profile in KYC database',
          status: 'PENDING'
        },
        {
          id: `step_2_${uuidv4().substring(0, 6)}`,
          stepNumber: 2,
          action: 'get_order_by_number',
          tool: 'order_service',
          mcp: 'order-mcp',
          inputs: { orderNumber: 'ORD-9934' },
          description: 'Retrieve high-value order details & return request',
          status: 'PENDING'
        },
        {
          id: `step_3_${uuidv4().substring(0, 6)}`,
          stepNumber: 3,
          action: 'validate_refund_eligibility',
          tool: 'order_service',
          mcp: 'order-mcp',
          inputs: { orderId: 'ord_risky_02' },
          description: 'Validate hardware diagnostic inspection and return ticket',
          status: 'PENDING'
        },
        {
          id: `step_4_${uuidv4().substring(0, 6)}`,
          stepNumber: 4,
          action: 'process_refund',
          tool: 'payment_gateway_sandbox',
          mcp: 'payment-mcp',
          inputs: {
            orderId: 'ord_risky_02',
            customerId: 'cust_rahul_02',
            amount: 15000,
            currency: 'INR',
            authorizedBy: 'ARMORIQ_AUTONOMOUS'
          },
          description: 'Attempt disbursement of high-value refund (₹15,000)',
          status: 'PENDING'
        },
        {
          id: `step_5_${uuidv4().substring(0, 6)}`,
          stepNumber: 5,
          action: 'send_refund_confirmation',
          tool: 'notification_service',
          mcp: 'notification-mcp',
          inputs: {
            recipientEmail: 'rahul.verma@example.com',
            customerName: 'Rahul Verma',
            amount: 15000,
            currency: 'INR',
            orderNumber: 'ORD-9934'
          },
          description: 'Dispatch confirmation receipt upon settlement',
          status: 'PENDING'
        }
      ];
      return { steps, goal: 'Process customer refund for Order ORD-9934 (Amount: ₹15,000)', customerId: 'cust_rahul_02', orderNumber: 'ORD-9934', amount: 15000 };
    }

    // Default / Custom fallback
    const customAmount = customParams?.amount || 2500;
    const steps: PlanStep[] = [
      {
        id: `step_1_${uuidv4().substring(0, 6)}`,
        stepNumber: 1,
        action: 'find_customer',
        tool: 'customer_database',
        mcp: 'customer-mcp',
        inputs: { email: customParams?.email || 'priya.sharma@example.com' },
        description: 'Locate customer record',
        status: 'PENDING'
      },
      {
        id: `step_2_${uuidv4().substring(0, 6)}`,
        stepNumber: 2,
        action: 'process_refund',
        tool: 'payment_gateway_sandbox',
        mcp: 'payment-mcp',
        inputs: {
          orderId: customParams?.orderId || 'ord_safe_01',
          customerId: customParams?.customerId || 'cust_priya_01',
          amount: customAmount,
          currency: 'INR',
          authorizedBy: 'ARMORIQ_AUTONOMOUS'
        },
        description: `Disburse refund of ₹${customAmount.toLocaleString('en-IN')}`,
        status: 'PENDING'
      }
    ];
    return { steps, goal: intent, customerId: 'cust_priya_01', orderNumber: 'ORD-CUSTOM', amount: customAmount };
  }

  /**
   * Run the complete autonomous lifecycle with real ArmorIQ enforcement
   */
  public async executeWorkflow(params: {
    intent: string;
    scenario: 'SAFE_PRIYA' | 'RISKY_RAHUL' | 'CUSTOM';
    authorizedLimit?: number;
    customParams?: any;
  }): Promise<{ taskId: string; plan: CapturedPlan; status: string; pendingApprovalId?: string }> {
    const taskId = `task_${uuidv4().substring(0, 8)}`;
    const limit = params.authorizedLimit || 5000;

    await db.run(
      `INSERT INTO tasks (id, intent, status, createdAt) VALUES (?, ?, ?, ?)`,
      [taskId, params.intent, 'INITIALIZING', new Date().toISOString()]
    );

    this.emitEvent('TASK_CREATED', { taskId, intent: params.intent, scenario: params.scenario }, taskId);

    // 1. Generate Plan
    const { steps, goal } = this.generatePlan(params.intent, params.scenario, params.customParams);

    // 2. Capture Plan in ArmorIQ (Mints cryptographic Intent Token & Merkle Root)
    const capturedPlan = await armorIqClient.capturePlan(
      taskId,
      'gemini-2.5-flash',
      goal,
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

    // 3. Execute Step by Step through ArmorIQ
    await db.run(`UPDATE tasks SET status = 'EXECUTING' WHERE id = ?`, [taskId]);

    let pendingApprovalId: string | undefined;

    for (let i = 0; i < capturedPlan.steps.length; i++) {
      const step = capturedPlan.steps[i];
      step.status = 'EXECUTING';
      this.emitEvent('STEP_START', { stepIndex: i, step }, taskId);

      // Give a tiny natural delay for smooth UI visualization
      await new Promise(r => setTimeout(r, 600));

      const toolDef = registeredTools[step.tool];
      if (!toolDef) {
        step.status = 'FAILED';
        step.error = `Tool ${step.tool} not available`;
        this.emitEvent('STEP_FAILED', { stepIndex: i, step }, taskId);
        break;
      }

      // Invoke tool through ArmorIQ Verification Proxy
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
          agentId: 'agent-refund-ops-01',
          action: step.action,
          tool: step.tool,
          authorizationStatus: 'AUTHORIZED',
          intentToken: capturedPlan.intentToken,
          details: { inputs: step.inputs, output },
          resultSummary: `Action '${step.action}' cryptographically verified & executed autonomously.`
        });

        this.emitEvent('STEP_COMPLETED', { stepIndex: i, step, output, verification }, taskId);
      } else {
        // OUT-OF-SCOPE ACTION DETECTED!
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

        // Halts autonomous loop: stops BEFORE executing dangerous action!
        return {
          taskId,
          plan: capturedPlan,
          status: 'AWAITING_APPROVAL',
          pendingApprovalId
        };
      }
    }

    await db.run(`UPDATE tasks SET status = 'COMPLETED', completedAt = ? WHERE id = ?`, [new Date().toISOString(), taskId]);
    this.emitEvent('TASK_COMPLETED', { taskId, plan: capturedPlan }, taskId);

    return {
      taskId,
      plan: capturedPlan,
      status: 'COMPLETED'
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

    // Find the step that was blocked (Step 4)
    const blockedStepIndex = plan.steps.findIndex(s => s.action === 'process_refund');
    if (blockedStepIndex !== -1) {
      const step = plan.steps[blockedStepIndex];
      step.status = 'COMPLETED';
      step.scopeAllowed = true;

      // Execute Step 4 with Human Approval in payment sandbox
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

      // Execute subsequent steps (e.g. Step 5 Notification)
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
          agentId: 'agent-refund-ops-01',
          action: nextStep.action,
          tool: nextStep.tool,
          authorizationStatus: 'AUTHORIZED',
          intentToken: plan.intentToken,
          details: { inputs: nextStep.inputs, output: nextOutput },
          resultSummary: `Action '${nextStep.action}' completed following approved workflow resumption.`
        });

        this.emitEvent('STEP_COMPLETED', { stepIndex: i, step: nextStep, output: nextOutput }, taskId);
      }
    }

    await db.run(`UPDATE tasks SET status = 'COMPLETED', completedAt = ? WHERE id = ?`, [new Date().toISOString(), taskId]);
    this.emitEvent('TASK_COMPLETED', { taskId, plan }, taskId);
  }
}

export const agentOrchestrator = new AgentOrchestrator();
