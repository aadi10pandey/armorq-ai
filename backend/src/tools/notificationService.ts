export class NotificationServiceTool {
  public static readonly toolName = 'notification_service';
  public static readonly mcpName = 'notification-mcp';

  public async sendRefundConfirmation(params: {
    recipientEmail: string;
    customerName: string;
    amount: number;
    currency: string;
    orderNumber: string;
    gatewayRef: string;
  }): Promise<{ dispatched: boolean; channel: string; deliveryId: string; message: string }> {
    const deliveryId = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const message = `Dear ${params.customerName}, your refund of ₹${params.amount.toLocaleString('en-IN')} for order ${params.orderNumber} has been successfully processed (Ref: ${params.gatewayRef}).`;

    return {
      dispatched: true,
      channel: 'EMAIL_AND_SMS',
      deliveryId,
      message
    };
  }
}

export const notificationServiceTool = new NotificationServiceTool();
