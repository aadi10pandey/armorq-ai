# ArmorIQ SDK Integration Guide

## 1. Concepts & SDK Methods

SENTINEL AI integrates the `@armoriq/sdk` package adhering to the official cryptographic intent authorization standard.

### 1.1 `capturePlan()`
Registers the agent's planned sequence of tool invocations:
```typescript
import { ArmorIQClient } from '@armoriq/sdk';

const client = new ArmorIQClient({
  apiKey: process.env.ARMORIQ_API_KEY,
  userId: 'sentinel-admin@sentinel.internal',
  agentId: 'agent-refund-ops-01'
});

const plan = await client.capturePlan(
  'gemini-2.5-flash',
  'Process eligible customer refunds up to ₹5,000',
  steps
);
```

### 1.2 `getIntentToken()`
Retrieves the signed cryptographic token binding upcoming actions to the verified scope:
```typescript
const token = await client.getIntentToken(plan);
```

### 1.3 `invoke()`
Dispatches tool invocations through the proxy:
```typescript
const result = await client.invoke(
  'payment-mcp',
  'process_refund',
  token,
  {
    orderId: 'ord_safe_01',
    amount: 4200
  }
);
```

## 2. Policy Enforcement States

| Status | Trigger Condition | System Behavior |
| :--- | :--- | :--- |
| **`ALLOW`** | Action and parameters strictly match signed plan (e.g. amount ≤ ₹5,000) | Tool executes immediately; audit event logged. |
| **`HOLD`** | Action deviates from boundary (e.g. amount = ₹15,000 > ₹5,000) | Tool execution halted; approval request generated; supervisor notified. |
| **`BLOCK`** | Prohibited destructive action (e.g. `delete_customer`) | Tool execution denied permanently; security alert raised. |
