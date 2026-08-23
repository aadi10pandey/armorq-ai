# SENTINEL AI REST & Real-Time SSE API

## Base URL
`http://localhost:4000/api`

---

## Endpoints

### 1. Real-Time Telemetry Stream
- **`GET /api/events/stream`**
- **Protocol**: Server-Sent Events (SSE)
- **Events**:
  - `CONNECTED`: Handshake event
  - `TASK_CREATED`: Task initialization
  - `PLAN_CAPTURED`: Plan Merkle root and intent token minted
  - `STEP_START`: Step execution begun
  - `STEP_COMPLETED`: Step verified and finished
  - `SCOPE_VIOLATION_BLOCKED`: Action held at proxy boundary
  - `WORKFLOW_RESUMED`: Approval granted by human
  - `TASK_COMPLETED`: Task finished and sealed

---

### 2. Demo & Execution Triggers
- **`POST /api/demo/run-safe`**: Executes ₹4,200 eligible refund for Priya Sharma (ORD-8821).
- **`POST /api/demo/run-out-of-scope`**: Triggers ₹15,000 refund attempt for Rahul Verma (ORD-9934) causing ArmorIQ hold.
- **`POST /api/agent/run`**: Executes custom user intent.
  - **Body**: `{ "intent": string, "amount": number, "email"?: string, "orderId"?: string }`
- **`POST /api/demo/reset`**: Resets database and demo environment to initial state.

---

### 3. Approval Center
- **`GET /api/approvals/pending`**: List active held actions awaiting review.
- **`GET /api/approvals/:id`**: Fetch approval request details and policy hash.
- **`POST /api/approvals/:id/approve`**: Grant authorization and resume agent.
  - **Body**: `{ "reviewedBy": string, "notes"?: string }`
- **`POST /api/approvals/:id/reject`**: Reject action and terminate task.
  - **Body**: `{ "reviewedBy": string, "notes"?: string }`

---

### 4. Audit & Telemetry
- **`GET /api/audit?limit=100`**: Retrieve sealed audit logs.
- **`GET /api/audit/task/:taskId`**: Retrieve complete trace for a specific task.
- **`GET /api/tools`**: Retrieve connected tool definitions and assigned scopes.
- **`GET /api/metrics`**: Retrieve dashboard system metrics.
