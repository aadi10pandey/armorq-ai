# Security & Threat Model

## 1. Threat Mitigation Matrix

| Threat Vector | Traditional Agent Risk | Sentinel AI Defense |
| :--- | :--- | :--- |
| **Prompt Injection** | Attacker tricks LLM into disbursing funds to third party | ArmorIQ verifies parameters against canonical Merkle root; prevents unplanned parameters. |
| **Intent Drift** | Agent decides to refund high amounts during complex multi-step reasoning | Scope ceiling of ₹5,000 is enforced at proxy level regardless of LLM reasoning. |
| **Duplicate Settlement** | Network glitch causes multiple refund requests | Idempotency keys (`idempotencyKey`) ensure exact once execution. |
| **Tampered Audit Trails** | Compromised agent overwrites local database logs | Cryptographic HMAC seal (`0x...`) prevents undetected record modification. |

## 2. Zero-Leakage Guarantee

The payment gateway sandbox tool does not possess bypass credentials. The proxy interceptor executes **prior** to tool invocation:

```typescript
const verification = this.verifyActionBoundary(mcp, action, inputs, intentToken);

if (!verification.allowed) {
  // CRITICAL: Return immediately. Tool is NEVER executed during a hold/block.
  return { verification };
}

return toolExecutor(action, inputs);
```
