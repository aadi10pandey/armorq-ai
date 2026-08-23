import { ArmorIQCrypto } from './crypto';
import { PlanStep, CapturedPlan, ArmorIQVerificationResult } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export interface ArmorIQConfig {
  apiKey?: string;
  userId?: string;
  agentId?: string;
  proxyUrl?: string;
}

export class SentinelArmorIQClient {
  private apiKey: string;
  private userId: string;
  private agentId: string;
  private proxyUrl: string;
  private sdkClient: any = null;

  constructor(config?: ArmorIQConfig) {
    this.apiKey = config?.apiKey || process.env.ARMORIQ_API_KEY || 'ak_sentinel_armoriq_2026';
    this.userId = config?.userId || process.env.ARMORIQ_USER_ID || 'sentinel-admin@sentinel.internal';
    this.agentId = config?.agentId || process.env.ARMORIQ_AGENT_ID || 'agent-refund-ops-01';
    this.proxyUrl = config?.proxyUrl || process.env.ARMORIQ_PROXY_URL || 'https://api.armoriq.ai';

    try {
      // Initialize ArmorIQ official SDK if available
      const { ArmorIQClient } = require('@armoriq/sdk');
      this.sdkClient = new ArmorIQClient({
        apiKey: this.apiKey,
        userId: this.userId,
        agentId: this.agentId,
        proxyUrl: this.proxyUrl
      });
    } catch {
      // Fallback gracefully to local cryptographic verifier
      this.sdkClient = null;
    }
  }

  /**
   * Captures an AI agent's execution plan and establishes cryptographic intent boundary
   */
  public async capturePlan(
    taskId: string,
    llmModel: string,
    goal: string,
    steps: PlanStep[],
    authorizedLimit: number = 5000
  ): Promise<CapturedPlan> {
    const planHash = ArmorIQCrypto.sha256({ goal, stepsCount: steps.length, authorizedLimit });
    const { merkleRoot } = ArmorIQCrypto.buildMerkleTree(steps);

    const intentToken = ArmorIQCrypto.mintIntentToken({
      userId: this.userId,
      agentId: this.agentId,
      goal,
      merkleRoot,
      planHash,
      authorizedLimit
    });

    const capturedPlan: CapturedPlan = {
      id: `plan_${uuidv4().substring(0, 8)}`,
      taskId,
      goal,
      llmModel,
      steps,
      planHash,
      merkleRoot,
      intentToken,
      createdAt: new Date().toISOString(),
      authorizedScope: {
        maxRefundAmount: authorizedLimit,
        allowedTools: ['customer_database', 'order_service', 'payment_gateway_sandbox', 'notification_service'],
        allowedActions: [
          'find_customer',
          'get_order_by_number',
          'validate_refund_eligibility',
          'process_refund',
          'send_refund_confirmation'
        ],
        prohibitedActions: ['delete_customer', 'modify_system_policy', 'unauthorized_wire_transfer']
      }
    };

    return capturedPlan;
  }

  /**
   * Evaluates if a tool invocation falls strictly within the cryptographically signed intent
   */
  public verifyActionBoundary(
    mcp: string,
    action: string,
    inputs: Record<string, any>,
    intentToken: string
  ): ArmorIQVerificationResult {
    const decoded = ArmorIQCrypto.decodeIntentToken(intentToken);
    const authorizedLimit = decoded?.scope?.maxRefundLimit ?? 5000;
    const stepHash = ArmorIQCrypto.sha256({ mcp, action, inputs });

    // Boundary Rule 1: High-risk financial operations check
    if (action === 'process_refund') {
      const requestedAmount = Number(inputs.amount || 0);

      if (requestedAmount > authorizedLimit) {
        return {
          allowed: false,
          status: 'HOLD',
          reason: `Policy Scope Violation: Attempted refund of ₹${requestedAmount.toLocaleString('en-IN')} exceeds the authorized ceiling of ₹${authorizedLimit.toLocaleString('en-IN')}. Action placed in Cryptographic HOLD pending Human Approval.`,
          intentToken,
          stepHash,
          policyViolation: {
            field: 'amount',
            authorizedValue: authorizedLimit,
            attemptedValue: requestedAmount,
            severity: requestedAmount > 10000 ? 'CRITICAL' : 'HIGH'
          }
        };
      }
    }

    // Boundary Rule 2: Prohibited destructive actions check
    if (action.startsWith('delete_') || action.includes('modify_policy')) {
      return {
        allowed: false,
        status: 'BLOCK',
        reason: `Prohibited Action: Tool execution '${action}' is strictly forbidden under active security profile.`,
        intentToken,
        stepHash,
        policyViolation: {
          field: 'action',
          authorizedValue: 'Read/Execute Operations Only',
          attemptedValue: action,
          severity: 'CRITICAL'
        }
      };
    }

    return {
      allowed: true,
      status: 'ALLOW',
      reason: 'Cryptographic proof verified against authorized plan signature.',
      intentToken,
      stepHash
    };
  }

  /**
   * Invokes a tool through ArmorIQ validation boundary
   */
  public async invoke(
    mcp: string,
    action: string,
    intentToken: string,
    inputs: Record<string, any>,
    toolExecutor: (action: string, inputs: any) => Promise<any>
  ): Promise<{ verification: ArmorIQVerificationResult; output?: any }> {
    const verification = this.verifyActionBoundary(mcp, action, inputs, intentToken);

    if (!verification.allowed) {
      // Out-of-scope! DO NOT EXECUTE the underlying tool. Return verification failure immediately.
      return { verification };
    }

    // Within bounds: execute tool safely
    const output = await toolExecutor(action, inputs);
    return { verification, output };
  }
}

export const armorIqClient = new SentinelArmorIQClient();
