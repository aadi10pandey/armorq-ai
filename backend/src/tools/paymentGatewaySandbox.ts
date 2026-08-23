import { db } from '../database/schema';
import { RefundTransaction } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class PaymentGatewaySandboxTool {
  public static readonly toolName = 'payment_gateway_sandbox';
  public static readonly mcpName = 'payment-mcp';

  private sandboxBalance = 250000; // Initial Sandbox Pool: ₹2,50,000

  public async getSandboxStatus(): Promise<{ poolBalance: number; currency: string; totalProcessed: number }> {
    const rows = await db.query<{ sum: number }>(`SELECT SUM(amount) as sum FROM payment_transactions WHERE status = 'COMPLETED'`);
    const totalProcessed = rows[0]?.sum || 0;
    return {
      poolBalance: this.sandboxBalance - totalProcessed,
      currency: 'INR',
      totalProcessed
    };
  }

  public async processRefund(params: {
    orderId: string;
    customerId: string;
    amount: number;
    currency?: string;
    authorizedBy: 'ARMORIQ_AUTONOMOUS' | 'HUMAN_APPROVAL' | 'SYSTEM';
    approvalId?: string;
    idempotencyKey?: string;
  }): Promise<RefundTransaction> {
    const key = params.idempotencyKey || `idem_${params.orderId}_${params.amount}`;

    // Check for duplicate idempotent execution
    const existing = await db.get<RefundTransaction>(
      `SELECT * FROM payment_transactions WHERE idempotencyKey = ?`,
      [key]
    );

    if (existing) {
      return existing;
    }

    const transaction: RefundTransaction = {
      id: `tx_${uuidv4().substring(0, 12)}`,
      orderId: params.orderId,
      customerId: params.customerId,
      amount: params.amount,
      currency: params.currency || 'INR',
      status: 'COMPLETED',
      gatewayReference: `PG_REF_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      idempotencyKey: key,
      authorizedBy: params.authorizedBy,
      approvalId: params.approvalId,
      timestamp: new Date().toISOString()
    };

    await db.run(
      `INSERT INTO payment_transactions (id, orderId, customerId, amount, currency, status, gatewayReference, idempotencyKey, authorizedBy, approvalId, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.orderId,
        transaction.customerId,
        transaction.amount,
        transaction.currency,
        transaction.status,
        transaction.gatewayReference,
        transaction.idempotencyKey,
        transaction.authorizedBy,
        transaction.approvalId || null,
        transaction.timestamp
      ]
    );

    // Update order status in order table
    await db.run(`UPDATE orders SET status = 'REFUNDED' WHERE id = ?`, [params.orderId]);

    return transaction;
  }

  public async getTransactionHistory(): Promise<RefundTransaction[]> {
    return db.query<RefundTransaction>(`SELECT * FROM payment_transactions ORDER BY timestamp DESC`);
  }
}

export const paymentGatewaySandboxTool = new PaymentGatewaySandboxTool();
