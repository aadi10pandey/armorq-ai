# 3-Minute Live Hackathon Demo Script

## Demo Narration Walkthrough

### Part 1: Setting the Stage (30 seconds)
> *"Hello judges. Autonomous AI agents can perform tremendous tasks, but uncontrolled autonomy is dangerous. Welcome to SENTINEL AI — Autonomy with a Boundary."*
> *"We give our customer support agent authority to process refunds up to ₹5,000. Let's see what happens when it handles regular vs high-risk requests."*

### Part 2: Safe Autonomous Execution (45 seconds)
1. In the header or Demo Center, click **`RUN SAFE DEMO (₹4,200)`**.
2. Open the **Live Execution Hero** tab.
3. Observe:
   - Declarative Intent parsed.
   - Plan captured with SHA-256 Merkle root.
   - Steps 1 through 5 executing autonomously (finding customer Priya Sharma, checking order ORD-8821, verifying warranty, and executing ₹4,200 refund).
> *"Notice how the agent works with zero human intervention when operating within its signed authority."*

### Part 3: Triggering Out-of-Scope Violation (45 seconds)
1. Click **`TRIGGER OUT-OF-SCOPE (₹15,000)`**.
2. Observe in the Hero view:
   - Order ORD-9934 for Rahul Verma requires a ₹15,000 refund.
   - Steps 1-3 complete normally.
   - **Step 4 triggers a visual glitch & crimson pulse**: ArmorIQ identifies that ₹15,000 exceeds the ₹5,000 authorized limit.
   - The action is intercepted and placed in cryptographic **HOLD**.
   - The underlying payment gateway is NOT called.

### Part 4: Human-in-the-Loop Approval & Resumption (45 seconds)
1. Navigate to the **Approval Center** or use the inline approval banner.
2. Review the diff: Authorized ₹5,000 vs Attempted ₹15,000, risk score HIGH, policy hash verified.
3. Click **`[ APPROVE & CONTINUE ]`**.
4. Observe the Live Execution view immediately resuming:
   - Step 4 completes with human authorization reference.
   - Step 5 (Notification) executes.
   - Task completed with cryptographic seal.

### Part 5: Immutable Audit Ledger (15 seconds)
1. Switch to the **Audit Trail** tab.
2. Show judges the complete cryptographic ledger showing all state transitions (`AUTHORIZED`, `HOLD_REQUESTED`, `HUMAN_APPROVED`).
> *"That is SENTINEL AI: True autonomy with a cryptographically enforced boundary."*
