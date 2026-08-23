# 🛡️ SENTINEL AI

> **"Autonomy with a Boundary."**
> 
> *Enterprise AI Agent Security & Cryptographic Intent Authorization Platform*  
> **Automate India Hackathon Grand Finale — ArmorIQ Track (Problem 1: "Autonomous, until it shouldn't be")**

---

## ⚡ Executive Summary

Autonomous AI agents possess unprecedented power to query databases, calculate complex refund logic, and invoke payment settlement APIs. However, unconstrained autonomy introduces severe risks of **intent drift, prompt injection, and catastrophic financial loss**.

Traditional guards rely on naive regex matching or post-hoc heuristics that are easily bypassed. **SENTINEL AI** introduces **cryptographic intent authorization** powered by **ArmorIQ**:
1. Before taking action, the agent's multi-step plan is canonicalized and hashed into a **SHA-256 Merkle Tree**.
2. ArmorIQ mints a tamper-evident **Intent Token (`CSRG-IAP`)** binding the agent strictly to its authorized boundary (e.g. `maxRefundLimit ≤ ₹5,000`).
3. Every tool invocation passes through the **ArmorIQ Verification Proxy**.
4. When an out-of-scope action occurs (e.g. attempting a ₹15,000 refund), ArmorIQ **blocks the call before it ever touches sandbox systems**, placing it in cryptographic **HOLD**.
5. A human supervisor reviews the security diff and grants explicit authorization, enabling the agent to safely resume and seal an immutable audit trail.

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    User([User / Operator]) -->|User Intent| Agent[Sentinel AI Agent]
    Agent -->|1. Generate Plan| PlanEngine[Planning Engine]
    PlanEngine -->|2. capturePlan()| ArmorIQ[ArmorIQ Verification Engine]
    ArmorIQ -->|3. Mint CSRG-IAP Intent Token| Token[(Signed Token & Merkle Root)]
    
    Token --> Proxy[ArmorIQ Security Proxy]
    
    subgraph Execution Boundary
        Proxy -->|Safe Action (≤ ₹5,000)| Tool1[Customer DB]
        Proxy -->|Safe Action (≤ ₹5,000)| Tool2[Order Service]
        Proxy -->|Safe Action (≤ ₹5,000)| Tool3[Payment Sandbox]
        Proxy -->|Out-of-Scope (₹15,000)| Hold[Cryptographic HOLD / Interception]
    end
    
    Hold -->|Alerts Operator| ApprovalCenter[Approval Center]
    ApprovalCenter -->|Human Approves & Signs| Resume[Resume Execution]
    Resume --> Tool3
    
    Tool1 --> Audit[Cryptographically Sealed Audit Trail]
    Tool2 --> Audit
    Tool3 --> Audit
    Hold --> Audit
    ApprovalCenter --> Audit
```

---

## 🚀 Key Features

* **Real ArmorIQ Enforcement**: Built with `@armoriq/sdk`, implementing `capturePlan()`, `getIntentToken()`, and proxy `invoke()`.
* **Zero Leakage Guarantee**: The underlying payment sandbox will **never** execute an unauthorized transaction during a block.
* **Cinematic Live Hero UI**: Built with React, Tailwind CSS, and Framer Motion, featuring glowing cyber-mesh panels, live telemetry streams (SSE), and interactive state transitions.
* **Human-in-the-Loop Approval Center**: Side-by-side risk differential inspector (Authorized limit vs Attempted disbursement) with single-click cryptographic resume.
* **Immutable Audit Trail**: SHA-256 sealed ledger capturing every plan creation, step invocation, security hold, and supervisor decision.
* **Zero-Setup Offline Resilience**: Runs against ArmorIQ cloud proxy when `ARMORIQ_API_KEY` is provided, or uses the embedded zero-dependency local verifier for 100% demo reliability anywhere.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, Axios |
| **Backend** | Node.js, TypeScript, Express, Server-Sent Events (SSE), SQLite3 |
| **Security & SDK** | `@armoriq/sdk`, SHA-256 Merkle Tree Engine, CSRG-IAP Token Minting |
| **Sandboxed Tools** | Customer Database MCP, Order Service MCP, Payment Gateway Sandbox, Notification Dispatcher |
| **Testing** | Vitest, Supertest |

---

## 🏁 Quickstart & Installation

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24.19 LTS)
- **npm** v10+

### 2. Clone & Install Dependencies
```bash
# Navigate to the repository root
cd sentinel-ai

# Install root, backend, and frontend dependencies
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 3. Environment Setup
Create a `.env` file inside `backend/` (or copy `.env.example`):
```bash
cp .env.example backend/.env
```

Key environment variables:
```ini
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# ArmorIQ Configuration (Optional cloud key, defaults to embedded verifier)
ARMORIQ_API_KEY=ak_armoriq_test_key_live_2026
ARMORIQ_USER_ID=sentinel-admin@sentinel.internal
ARMORIQ_AGENT_ID=agent-refund-ops-01

# Authorization Policy Ceiling
MAX_AUTONOMOUS_REFUND_LIMIT=5000
CURRENCY=INR
```

---

## 💻 Running Locally

You can launch both the backend and frontend simultaneously:

```bash
# From the sentinel-ai root directory:
npm run dev
```

Or run them in separate terminal tabs:
```bash
# Tab 1: Start Backend Engine (Port 4000)
npm run dev:backend

# Tab 2: Start Cyberpunk Frontend (Port 5173)
npm run dev:frontend
```

Open your browser and navigate to:
👉 **`http://localhost:5173`**

---

## 🧪 Running Automated Tests

Run the comprehensive boundary security test suite verifying real ArmorIQ interception:

```bash
npm test
```

Expected output:
```text
 ✓ src/tests/boundary.test.ts (5 tests)
   ✓ 1. Should allow and complete safe autonomous refund within authorized scope (₹4,200 <= ₹5,000)
   ✓ 2. Should BLOCK high-risk out-of-scope refund (₹15,000 > ₹5,000) and place action in HOLD
   ✓ 3. Human APPROVAL should release hold and execute the sandbox refund
   ✓ 4. Human REJECTION should permanently halt the unauthorized action
   ✓ 5. Payment Gateway Sandbox should enforce idempotency and prevent duplicate executions
```

---

## 🎭 3-Minute Live Hackathon Presentation Script

| Time | Action | Screen | Talking Points for Judges |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:45** | Click **`RUN SAFE DEMO (₹4,200)`** | **Live Execution Hero** | *"We give our agent authority to process refunds up to ₹5,000. Notice how the agent creates a plan, obtains an ArmorIQ Intent Token, and executes all 5 steps autonomously without friction."* |
| **0:45 - 1:45** | Click **`TRIGGER OUT-OF-SCOPE (₹15,000)`** | **Live Execution Hero** | *"Now the agent encounters Order ORD-9934 for ₹15,000. It looks legitimate, but exceeds the signed boundary. ArmorIQ intervenes at the proxy, halts execution immediately, and places the action in HOLD before touching the payment sandbox."* |
| **1:45 - 2:30** | Click **`Approval Center`** → **`[ APPROVE & CONTINUE ]`** | **Approval Center** | *"The human operator reviews the ₹15,000 diff and policy hash. Clicking Approve releases the cryptographic hold, resumes the agent, and disburses the sandbox transaction."* |
| **2:30 - 3:00** | Click **`Audit Trail`** | **Audit Trail** | *"Every state transition, hold, and human override is recorded in an immutable, cryptographically sealed ledger."* |

---

## 📂 Repository Structure

```
sentinel-ai/
├── backend/
│   ├── src/
│   │   ├── agent/          # Agent orchestrator & multi-step execution engine
│   │   ├── api/            # Express REST endpoints & SSE telemetry streaming
│   │   ├── armoriq/        # ArmorIQ SDK client & SHA-256 Merkle cryptographic engine
│   │   ├── database/       # SQLite schema, query layer & seed data
│   │   ├── models/         # TypeScript interfaces & types
│   │   ├── services/       # Audit & Approval state services
│   │   ├── tests/          # Vitest boundary enforcement test suite
│   │   ├── tools/          # Sandboxed Customer DB, Order Service, Payment Gateway, Notification MCPs
│   │   └── index.ts        # Server entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Header, Navigation, Badges
│   │   ├── pages/          # Overview, LiveExecution, Approvals, Authorization, Tools, Audit, DemoCenter
│   │   ├── hooks/          # Real-time SSE event streaming hooks
│   │   ├── services/       # Axios API client
│   │   ├── types/          # Shared frontend interfaces
│   │   └── index.css       # Tailwind & Cyberpunk design system
│   └── package.json
│
├── docs/                   # Detailed Architecture, ArmorIQ Integration, Security, and API Docs
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚖️ License
MIT © 2026 Automate India Grand Finale Team. Built with ArmorIQ.
