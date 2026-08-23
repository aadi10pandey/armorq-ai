import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
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
    // Customers Table
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

    // Orders Table
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

    // Payment Transactions Table (Sandbox Ledger)
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

    // Tasks & Plans
    await this.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        intent TEXT NOT NULL,
        status TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        completedAt TEXT
      )
    `);

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

    // Approval Requests
    await this.run(`
      CREATE TABLE IF NOT EXISTS approval_requests (
        id TEXT PRIMARY KEY,
        taskId TEXT NOT NULL,
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

    // Audit Logs (Immutable ledger)
    await this.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
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

    // Seed initial dataset if empty
    const customerCount = await this.get<{ count: number }>(`SELECT COUNT(*) as count FROM customers`);
    if (!customerCount || customerCount.count === 0) {
      await this.seed();
    }
  }

  public async seed(): Promise<void> {
    // Clear and seed clean demo data
    await this.run(`DELETE FROM customers`);
    await this.run(`DELETE FROM orders`);
    await this.run(`DELETE FROM payment_transactions`);

    // Customer 1: Priya Sharma (Eligible for Standard ₹4,200 Refund)
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

    const orderPriya: Order = {
      id: 'ord_safe_01',
      customerId: priya.id,
      orderNumber: 'ORD-8821',
      amount: 4200,
      currency: 'INR',
      status: 'RETURN_REQUESTED',
      itemDescription: 'Noise-Canceling Wireless Headphones Pro',
      orderDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      eligibleForRefund: true,
      maxRefundAmount: 4200,
      reason: 'Product damaged in transit'
    };
    await this.run(
      `INSERT INTO orders (id, customerId, orderNumber, amount, currency, status, itemDescription, orderDate, eligibleForRefund, maxRefundAmount, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderPriya.id, orderPriya.customerId, orderPriya.orderNumber, orderPriya.amount, orderPriya.currency, orderPriya.status, orderPriya.itemDescription, orderPriya.orderDate, orderPriya.eligibleForRefund ? 1 : 0, orderPriya.maxRefundAmount, orderPriya.reason]
    );

    // Customer 2: Rahul Verma (Out-of-Scope High-Risk ₹15,000 Refund)
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

    const orderRahul: Order = {
      id: 'ord_risky_02',
      customerId: rahul.id,
      orderNumber: 'ORD-9934',
      amount: 15000,
      currency: 'INR',
      status: 'RETURN_REQUESTED',
      itemDescription: '4K Ultra-HD Smart Gaming Monitor 27-inch',
      orderDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      eligibleForRefund: true,
      maxRefundAmount: 15000,
      reason: 'Dead pixels on display panel'
    };
    await this.run(
      `INSERT INTO orders (id, customerId, orderNumber, amount, currency, status, itemDescription, orderDate, eligibleForRefund, maxRefundAmount, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderRahul.id, orderRahul.customerId, orderRahul.orderNumber, orderRahul.amount, orderRahul.currency, orderRahul.status, orderRahul.itemDescription, orderRahul.orderDate, orderRahul.eligibleForRefund ? 1 : 0, orderRahul.maxRefundAmount, orderRahul.reason]
    );
  }
}

export const db = new Database();
