import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Customer, Order } from '../models/types';

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../sentinel.db');

export class Database {
  private db: sqlite3.Database;

  constructor() {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.db = new sqlite3.Database(dbPath);
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows as T[]);
      });
    });
  }

  public async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row as T | undefined);
      });
    });
  }

  public async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  public async init(): Promise<void> {
    // 1. Users Table
    await this.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        salt TEXT NOT NULL,
        organization TEXT NOT NULL,
        role TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);

    // 2. Workspaces Table
    await this.run(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `);

    // 3. Agents Table
    await this.run(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        workspaceId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        purpose TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        maxRefundLimit REAL NOT NULL DEFAULT 5000,
        allowedActionsJson TEXT NOT NULL,
        approvalRequiredJson TEXT NOT NULL,
        blockedActionsJson TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY(workspaceId) REFERENCES workspaces(id)
      )
    `);

    // 4. Customers Table (Sandbox KYC Registry)
    await this.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        tier TEXT NOT NULL DEFAULT 'STANDARD',
        kycStatus TEXT NOT NULL DEFAULT 'VERIFIED',
        createdAt TEXT NOT NULL
      )
    `);

    // 5. Orders Table
    await this.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        orderNumber TEXT NOT NULL UNIQUE,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        status TEXT NOT NULL DEFAULT 'DELIVERED',
        itemDescription TEXT NOT NULL,
        orderDate TEXT NOT NULL,
        eligibleForRefund INTEGER NOT NULL DEFAULT 1,
        maxRefundAmount REAL NOT NULL,
        reason TEXT,
        FOREIGN KEY(customerId) REFERENCES customers(id)
      )
    `);

    // 6. Payment Transactions Table (Sandbox Ledger)
    await this.run(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        customerId TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        status TEXT NOT NULL,
        gatewayReference TEXT NOT NULL,
        idempotencyKey TEXT NOT NULL UNIQUE,
        authorizedBy TEXT NOT NULL,
        approvalId TEXT,
        timestamp TEXT NOT NULL
      )
    `);

    // 7. Tasks Table
    await this.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        workspaceId TEXT NOT NULL,
        agentId TEXT NOT NULL,
        intent TEXT NOT NULL,
        interpretedGoal TEXT,
        status TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        completedAt TEXT
      )
    `);

    // 8. Captured Plans Table
    await this.run(`
      CREATE TABLE IF NOT EXISTS captured_plans (
        id TEXT PRIMARY KEY,
        taskId TEXT NOT NULL,
        goal TEXT NOT NULL,
        llmModel TEXT NOT NULL,
        stepsJson TEXT NOT NULL,
        planHash TEXT NOT NULL,
        merkleRoot TEXT NOT NULL,
        intentToken TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);

    // 9. Approval Requests Table
    await this.run(`
      CREATE TABLE IF NOT EXISTS approval_requests (
        id TEXT PRIMARY KEY,
        workspaceId TEXT,
        taskId TEXT NOT NULL,
        agentId TEXT,
        stepId TEXT NOT NULL,
        tool TEXT NOT NULL,
        action TEXT NOT NULL,
        paramsJson TEXT NOT NULL,
        reason TEXT NOT NULL,
        riskSeverity TEXT NOT NULL,
        requestedAmount REAL,
        authorizedLimit REAL,
        status TEXT NOT NULL,
        policyHash TEXT NOT NULL,
        reviewerNotes TEXT,
        reviewedBy TEXT,
        createdAt TEXT NOT NULL,
        resolvedAt TEXT
      )
    `);

    // 10. Audit Logs Table (Immutable ledger)
    await this.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        workspaceId TEXT,
        timestamp TEXT NOT NULL,
        taskId TEXT NOT NULL,
        agentId TEXT NOT NULL,
        action TEXT NOT NULL,
        tool TEXT NOT NULL,
        authorizationStatus TEXT NOT NULL,
        intentToken TEXT NOT NULL,
        requestId TEXT NOT NULL,
        detailsJson TEXT NOT NULL,
        resultSummary TEXT NOT NULL,
        cryptographicSignature TEXT NOT NULL
      )
    `);

    // Auto-migrate tables if needed
    try {
      await this.run(`ALTER TABLE tasks ADD COLUMN workspaceId TEXT DEFAULT 'ws_demo_enterprise_01'`);
    } catch {}
    try {
      await this.run(`ALTER TABLE tasks ADD COLUMN agentId TEXT DEFAULT 'agent-refund-ops-01'`);
    } catch {}
    try {
      await this.run(`ALTER TABLE tasks ADD COLUMN interpretedGoal TEXT`);
    } catch {}
    try {
      await this.run(`ALTER TABLE approval_requests ADD COLUMN workspaceId TEXT DEFAULT 'ws_demo_enterprise_01'`);
    } catch {}
    try {
      await this.run(`ALTER TABLE approval_requests ADD COLUMN agentId TEXT DEFAULT 'agent-refund-ops-01'`);
    } catch {}
    try {
      await this.run(`ALTER TABLE audit_logs ADD COLUMN workspaceId TEXT DEFAULT 'ws_demo_enterprise_01'`);
    } catch {}

    // Check and seed initial dataset
    const customerCount = await this.get<{ count: number }>(`SELECT COUNT(*) as count FROM customers`);
    if (!customerCount || customerCount.count === 0) {
      await this.seed();
    }
  }

  public async seed(): Promise<void> {
    // 1. Seed Demo User
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.pbkdf2Sync('Password@123', salt, 10000, 64, 'sha512').toString('hex');
    const demoUserId = 'user_demo_aditya_01';
    const demoWorkspaceId = 'ws_demo_enterprise_01';
    const demoAgentId = 'agent-refund-ops-01';

    await this.run(
      `INSERT OR REPLACE INTO users (id, name, email, passwordHash, salt, organization, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        demoUserId,
        'Aditya Sharma',
        'aditya@sentinel.internal',
        passwordHash,
        salt,
        'Automate India Enterprise',
        'Lead Security Administrator',
        new Date().toISOString()
      ]
    );

    await this.run(
      `INSERT OR REPLACE INTO workspaces (id, userId, name, createdAt) VALUES (?, ?, ?, ?)`,
      [demoWorkspaceId, demoUserId, 'Enterprise Production Workspace', new Date().toISOString()]
    );

    // 2. Seed Default Agent with Configurable Authority
    const allowedActions = [
      'find_customer',
      'get_order_by_number',
      'validate_refund_eligibility',
      'process_refund',
      'send_refund_confirmation'
    ];
    const approvalRequired = ['process_refund_exceeding_limit', 'modify_payout_destination'];
    const blockedActions = ['delete_customer', 'modify_system_policy', 'direct_database_mutation'];

    await this.run(
      `INSERT OR REPLACE INTO agents (id, workspaceId, name, description, purpose, status, maxRefundLimit, allowedActionsJson, approvalRequiredJson, blockedActionsJson, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        demoAgentId,
        demoWorkspaceId,
        'Refund Assistant',
        'Autonomous customer return and warranty refund agent',
        'Process eligible customer refunds within authorized authority bounds',
        'ACTIVE',
        5000,
        JSON.stringify(allowedActions),
        JSON.stringify(approvalRequired),
        JSON.stringify(blockedActions),
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    // 3. Clear and Seed Realistic Sandbox Customer & Order Records
    await this.run(`DELETE FROM customers`);
    await this.run(`DELETE FROM orders`);
    await this.run(`DELETE FROM payment_transactions`);

    // Customer 1: Priya Sharma (Eligible for ₹4,200 Refund)
    const priya: Customer = {
      id: 'cust_priya_01',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98765 43210',
      tier: 'PREMIUM',
      kycStatus: 'VERIFIED',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    };
    await this.run(
      `INSERT INTO customers (id, name, email, phone, tier, kycStatus, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [priya.id, priya.name, priya.email, priya.phone, priya.tier, priya.kycStatus, priya.createdAt]
    );

    await this.run(
      `INSERT INTO orders (id, customerId, orderNumber, amount, currency, status, itemDescription, orderDate, eligibleForRefund, maxRefundAmount, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['ord_safe_01', priya.id, 'ORD-8821', 4200, 'INR', 'RETURN_REQUESTED', 'Noise-Canceling Wireless Headphones Pro', new Date(Date.now() - 5 * 86400000).toISOString(), 1, 4200, 'Product damaged in transit']
    );

    // Customer 2: Rahul Verma (Out-of-Scope ₹15,000 Refund)
    const rahul: Customer = {
      id: 'cust_rahul_02',
      name: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      phone: '+91 98123 45678',
      tier: 'VIP',
      kycStatus: 'VERIFIED',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
    };
    await this.run(
      `INSERT INTO customers (id, name, email, phone, tier, kycStatus, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [rahul.id, rahul.name, rahul.email, rahul.phone, rahul.tier, rahul.kycStatus, rahul.createdAt]
    );

    await this.run(
      `INSERT INTO orders (id, customerId, orderNumber, amount, currency, status, itemDescription, orderDate, eligibleForRefund, maxRefundAmount, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['ord_risky_02', rahul.id, 'ORD-9934', 15000, 'INR', 'RETURN_REQUESTED', '4K Ultra-HD Smart Gaming Monitor 27-inch', new Date(Date.now() - 2 * 86400000).toISOString(), 1, 15000, 'Dead pixels on display panel']
    );

    // Customer 3: Anita Desai (Order #4821 - ₹15,000 High-Value Claim)
    const anita: Customer = {
      id: 'cust_anita_03',
      name: 'Anita Desai',
      email: 'anita.desai@example.com',
      phone: '+91 98345 67890',
      tier: 'VIP',
      kycStatus: 'VERIFIED',
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
    };
    await this.run(
      `INSERT INTO customers (id, name, email, phone, tier, kycStatus, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [anita.id, anita.name, anita.email, anita.phone, anita.tier, anita.kycStatus, anita.createdAt]
    );

    await this.run(
      `INSERT INTO orders (id, customerId, orderNumber, amount, currency, status, itemDescription, orderDate, eligibleForRefund, maxRefundAmount, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['ord_anita_03', anita.id, 'ORD-4821', 15000, 'INR', 'RETURN_REQUESTED', 'Ergonomic Executive Office Chair', new Date(Date.now() - 4 * 86400000).toISOString(), 1, 15000, 'Hydraulic cylinder defect']
    );

    // Customer 4: Amit Patel (Order #3190 - ₹3,200 Safe Claim)
    const amit: Customer = {
      id: 'cust_amit_04',
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      phone: '+91 98456 78901',
      tier: 'STANDARD',
      kycStatus: 'VERIFIED',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
    };
    await this.run(
      `INSERT INTO customers (id, name, email, phone, tier, kycStatus, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [amit.id, amit.name, amit.email, amit.phone, amit.tier, amit.kycStatus, amit.createdAt]
    );

    await this.run(
      `INSERT INTO orders (id, customerId, orderNumber, amount, currency, status, itemDescription, orderDate, eligibleForRefund, maxRefundAmount, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['ord_amit_04', amit.id, 'ORD-3190', 3200, 'INR', 'RETURN_REQUESTED', 'Mechanical Gaming Keyboard RGB', new Date(Date.now() - 7 * 86400000).toISOString(), 1, 3200, 'Key switch malfunction']
    );

    // Customer 5: Vikram Singh (Order #104 - ₹2,500 Safe Claim)
    const vikram: Customer = {
      id: 'cust_vikram_05',
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 98567 89012',
      tier: 'STANDARD',
      kycStatus: 'VERIFIED',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    };
    await this.run(
      `INSERT INTO customers (id, name, email, phone, tier, kycStatus, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vikram.id, vikram.name, vikram.email, vikram.phone, vikram.tier, vikram.kycStatus, vikram.createdAt]
    );

    await this.run(
      `INSERT INTO orders (id, customerId, orderNumber, amount, currency, status, itemDescription, orderDate, eligibleForRefund, maxRefundAmount, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['ord_vikram_05', vikram.id, 'ORD-104', 2500, 'INR', 'RETURN_REQUESTED', 'Fast Wireless Charging Stand', new Date(Date.now() - 10 * 86400000).toISOString(), 1, 2500, 'Incorrect power adapter supplied']
    );
  }
}

export const db = new Database();
