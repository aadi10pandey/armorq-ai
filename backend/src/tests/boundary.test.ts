import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { db } from '../database/schema';
import { agentOrchestrator } from '../agent/orchestrator';
import { approvalService } from '../services/approvalService';
import { auditService } from '../services/auditService';
import { paymentGatewaySandboxTool } from '../tools/paymentGatewaySandbox';

describe('SENTINEL AI - ArmorIQ Cryptographic Boundary Enforcement Suite', () => {
  beforeAll(async () => {
    await db.init();
  });

  beforeEach(async () => {
    await db.seed();
    await db.run(`DELETE FROM tasks`);
    await db.run(`DELETE FROM captured_plans`);
    await db.run(`DELETE FROM approval_requests`);
    await db.run(`DELETE FROM audit_logs`);
  });

  it('1. Should allow and complete safe autonomous refund within authorized scope (₹4,200 <= ₹5,000)', async () => {
    const result = await agentOrchestrator.executeWorkflow({
      intent: 'Process eligible customer refunds up to ₹5,000',
      scenario: 'SAFE_PRIYA',
      authorizedLimit: 5000
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.plan.steps.length).toBe(5);
    expect(result.plan.steps.every(s => s.status === 'COMPLETED')).toBe(true);

    // Verify payment transaction was completed
    const transactions = await paymentGatewaySandboxTool.getTransactionHistory();
    expect(transactions.length).toBe(1);
    expect(transactions[0].amount).toBe(4200);
    expect(transactions[0].authorizedBy).toBe('ARMORIQ_AUTONOMOUS');

    // Verify audit logs were written
    const logs = await auditService.getLogsByTask(result.taskId);
    expect(logs.length).toBeGreaterThanOrEqual(4);
    expect(logs.every(l => l.cryptographicSignature.startsWith('0x'))).toBe(true);
  });

  it('2. Should BLOCK high-risk out-of-scope refund (₹15,000 > ₹5,000) and place action in HOLD', async () => {
    const result = await agentOrchestrator.executeWorkflow({
      intent: 'Process customer refund for Rahul Verma (₹15,000)',
      scenario: 'RISKY_RAHUL',
      authorizedLimit: 5000
    });

    // Workflow must halt in AWAITING_APPROVAL
    expect(result.status).toBe('AWAITING_APPROVAL');
    expect(result.pendingApprovalId).toBeDefined();

    // Critical security check: The payment transaction must NOT have been executed
    const transactions = await paymentGatewaySandboxTool.getTransactionHistory();
    expect(transactions.length).toBe(0);

    // Verify approval request was generated
    const pending = await approvalService.getPendingApprovals();
    expect(pending.length).toBe(1);
    expect(pending[0].requestedAmount).toBe(15000);
    expect(pending[0].authorizedLimit).toBe(5000);
    expect(pending[0].status).toBe('PENDING');

    // Verify audit event captured the hold
    const auditLogs = await auditService.getLogsByTask(result.taskId);
    const holdLog = auditLogs.find(l => l.authorizationStatus === 'HOLD_REQUESTED');
    expect(holdLog).toBeDefined();
    expect(holdLog?.details.requestedAmount).toBe(15000);
  });

  it('3. Human APPROVAL should release hold and execute the sandbox refund', async () => {
    // First trigger out-of-scope scenario
    const workflow = await agentOrchestrator.executeWorkflow({
      intent: 'Process customer refund for Rahul Verma (₹15,000)',
      scenario: 'RISKY_RAHUL',
      authorizedLimit: 5000
    });

    const approvalId = workflow.pendingApprovalId!;
    expect(approvalId).toBeDefined();

    // Simulate Human Approval
    const { approval, executionResult } = await approvalService.approveRequest(
      approvalId,
      'Lead Security Administrator',
      'Override authorized for VIP enterprise customer warranty claim.'
    );

    expect(approval.status).toBe('APPROVED');
    expect(executionResult.status).toBe('COMPLETED');
    expect(executionResult.amount).toBe(15000);
    expect(executionResult.authorizedBy).toBe('HUMAN_APPROVAL');

    // Resume agent orchestrator
    await agentOrchestrator.resumeAfterApproval(workflow.taskId, approvalId);

    // Verify sandbox transaction now exists
    const transactions = await paymentGatewaySandboxTool.getTransactionHistory();
    expect(transactions.length).toBe(1);
    expect(transactions[0].amount).toBe(15000);
    expect(transactions[0].authorizedBy).toBe('HUMAN_APPROVAL');
    expect(transactions[0].approvalId).toBe(approvalId);
  });

  it('4. Human REJECTION should permanently halt the unauthorized action', async () => {
    const workflow = await agentOrchestrator.executeWorkflow({
      intent: 'Process customer refund for Rahul Verma (₹15,000)',
      scenario: 'RISKY_RAHUL',
      authorizedLimit: 5000
    });

    const approvalId = workflow.pendingApprovalId!;
    const rejected = await approvalService.rejectRequest(approvalId, 'Lead Auditor', 'Refused: Exceeds regional budget threshold.');

    expect(rejected.status).toBe('REJECTED');

    // Sandbox transaction must STILL be 0
    const transactions = await paymentGatewaySandboxTool.getTransactionHistory();
    expect(transactions.length).toBe(0);

    // Audit trail should record HUMAN_REJECTED
    const auditLogs = await auditService.getLogsByTask(workflow.taskId);
    const rejectLog = auditLogs.find(l => l.authorizationStatus === 'HUMAN_REJECTED');
    expect(rejectLog).toBeDefined();
  });

  it('5. Payment Gateway Sandbox should enforce idempotency and prevent duplicate executions', async () => {
    const tx1 = await paymentGatewaySandboxTool.processRefund({
      orderId: 'ord_idem_01',
      customerId: 'cust_priya_01',
      amount: 1000,
      authorizedBy: 'ARMORIQ_AUTONOMOUS',
      idempotencyKey: 'IDEM_KEY_TEST_001'
    });

    const tx2 = await paymentGatewaySandboxTool.processRefund({
      orderId: 'ord_idem_01',
      customerId: 'cust_priya_01',
      amount: 1000,
      authorizedBy: 'ARMORIQ_AUTONOMOUS',
      idempotencyKey: 'IDEM_KEY_TEST_001'
    });

    expect(tx1.id).toBe(tx2.id);
    expect(tx1.gatewayReference).toBe(tx2.gatewayReference);
  });
});
