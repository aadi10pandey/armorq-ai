import { db } from '../database/schema';
import { Order } from '../models/types';

export class OrderServiceTool {
  public static readonly toolName = 'order_service';
  public static readonly mcpName = 'order-mcp';

  public async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const row = await db.get<Order>('SELECT * FROM orders WHERE orderNumber = ?', [orderNumber]);
    if (!row) return null;
    return {
      ...row,
      eligibleForRefund: Boolean(row.eligibleForRefund)
    };
  }

  public async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const rows = await db.query<Order>('SELECT * FROM orders WHERE customerId = ?', [customerId]);
    return rows.map(r => ({ ...r, eligibleForRefund: Boolean(r.eligibleForRefund) }));
  }

  public async validateRefundEligibility(orderId: string): Promise<{ eligible: boolean; maxRefundAmount: number; reason?: string }> {
    const order = await db.get<Order>('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) {
      return { eligible: false, maxRefundAmount: 0, reason: 'Order not found' };
    }
    return {
      eligible: Boolean(order.eligibleForRefund) && order.status !== 'REFUNDED',
      maxRefundAmount: order.maxRefundAmount,
      reason: order.reason
    };
  }

  public async markOrderRefunded(orderId: string): Promise<void> {
    await db.run(`UPDATE orders SET status = 'REFUNDED' WHERE id = ?`, [orderId]);
  }
}

export const orderServiceTool = new OrderServiceTool();
