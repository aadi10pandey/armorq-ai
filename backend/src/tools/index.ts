import { customerDbTool, CustomerDbTool } from './customerDb';
import { orderServiceTool, OrderServiceTool } from './orderService';
import { paymentGatewaySandboxTool, PaymentGatewaySandboxTool } from './paymentGatewaySandbox';
import { notificationServiceTool, NotificationServiceTool } from './notificationService';

export interface ToolDefinition {
  name: string;
  mcp: string;
  description: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  capabilities: string[];
  authorizedScope: string;
  handler: (action: string, params: any) => Promise<any>;
}

export const registeredTools: Record<string, ToolDefinition> = {
  [CustomerDbTool.toolName]: {
    name: CustomerDbTool.toolName,
    mcp: CustomerDbTool.mcpName,
    description: 'Enterprise Customer Relationship and KYC Registry',
    status: 'CONNECTED',
    capabilities: ['find_customer', 'get_customer_by_id', 'verify_kyc'],
    authorizedScope: 'Read-only access to customer profiles and verification records',
    handler: async (action: string, params: any) => {
      if (action === 'find_customer') {
        return customerDbTool.findCustomer(params);
      }
      if (action === 'get_customer_by_id') {
        return customerDbTool.getCustomerById(params.id);
      }
      throw new Error(`Unsupported action '${action}' on ${CustomerDbTool.toolName}`);
    }
  },
  [OrderServiceTool.toolName]: {
    name: OrderServiceTool.toolName,
    mcp: OrderServiceTool.mcpName,
    description: 'E-Commerce Order Management and Return Eligibility Engine',
    status: 'CONNECTED',
    capabilities: ['get_order_by_number', 'get_orders_by_customer', 'validate_refund_eligibility'],
    authorizedScope: 'Query orders, check return windows and item specifications',
    handler: async (action: string, params: any) => {
      if (action === 'get_order_by_number') {
        return orderServiceTool.getOrderByNumber(params.orderNumber);
      }
      if (action === 'get_orders_by_customer') {
        return orderServiceTool.getOrdersByCustomer(params.customerId);
      }
      if (action === 'validate_refund_eligibility') {
        return orderServiceTool.validateRefundEligibility(params.orderId);
      }
      throw new Error(`Unsupported action '${action}' on ${OrderServiceTool.toolName}`);
    }
  },
  [PaymentGatewaySandboxTool.toolName]: {
    name: PaymentGatewaySandboxTool.toolName,
    mcp: PaymentGatewaySandboxTool.mcpName,
    description: 'Financial Settlement and Sandbox Refund Processing Gateway',
    status: 'CONNECTED',
    capabilities: ['process_refund', 'get_sandbox_status', 'get_transaction_history'],
    authorizedScope: 'Autonomous refunds ≤ ₹5,000. Refunds > ₹5,000 require Human Approval.',
    handler: async (action: string, params: any) => {
      if (action === 'process_refund') {
        return paymentGatewaySandboxTool.processRefund(params);
      }
      if (action === 'get_sandbox_status') {
        return paymentGatewaySandboxTool.getSandboxStatus();
      }
      if (action === 'get_transaction_history') {
        return paymentGatewaySandboxTool.getTransactionHistory();
      }
      throw new Error(`Unsupported action '${action}' on ${PaymentGatewaySandboxTool.toolName}`);
    }
  },
  [NotificationServiceTool.toolName]: {
    name: NotificationServiceTool.toolName,
    mcp: NotificationServiceTool.mcpName,
    description: 'Multi-Channel Customer Communication Dispatcher',
    status: 'CONNECTED',
    capabilities: ['send_refund_confirmation'],
    authorizedScope: 'Automated email/SMS notification dispatch for confirmed transactions',
    handler: async (action: string, params: any) => {
      if (action === 'send_refund_confirmation') {
        return notificationServiceTool.sendRefundConfirmation(params);
      }
      throw new Error(`Unsupported action '${action}' on ${NotificationServiceTool.toolName}`);
    }
  }
};

export { customerDbTool, orderServiceTool, paymentGatewaySandboxTool, notificationServiceTool };
