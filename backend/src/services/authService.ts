import crypto from 'crypto';
import { db } from '../database/schema';
import { User, Workspace, Agent } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'sentinel-ai-jwt-auth-secret-key-2026';

export class AuthService {
  /**
   * Hash a password using PBKDF2 with salt
   */
  public hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const activeSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, activeSalt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: activeSalt };
  }

  /**
   * Generate an authenticated session JWT token
   */
  public generateToken(user: User, workspaceId: string): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      workspaceId,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7 // 7 days expiration
    };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  /**
   * Verify and decode a session JWT token
   */
  public verifyToken(token: string): { sub: string; email: string; name: string; workspaceId: string; role: string } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [header, body, signature] = parts;
      const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
      if (signature !== expectedSignature) return null;

      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Register a new user, create default workspace, and default agent
   */
  public async register(params: {
    name: string;
    email: string;
    password: string;
    organization: string;
    role: string;
  }): Promise<{ user: User; workspace: Workspace; token: string; defaultAgent: Agent }> {
    const existing = await db.get<any>(`SELECT id FROM users WHERE email = ?`, [params.email.toLowerCase().trim()]);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const { hash, salt } = this.hashPassword(params.password);
    const userId = `user_${uuidv4().substring(0, 10)}`;
    const workspaceId = `ws_${uuidv4().substring(0, 10)}`;
    const agentId = `agent_${uuidv4().substring(0, 10)}`;
    const now = new Date().toISOString();

    const user: User = {
      id: userId,
      name: params.name.trim(),
      email: params.email.toLowerCase().trim(),
      organization: params.organization.trim(),
      role: params.role || 'Administrator',
      createdAt: now
    };

    await db.run(
      `INSERT INTO users (id, name, email, passwordHash, salt, organization, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, hash, salt, user.organization, user.role, user.createdAt]
    );

    const workspace: Workspace = {
      id: workspaceId,
      userId,
      name: `${params.organization}'s Workspace`,
      createdAt: now
    };

    await db.run(
      `INSERT INTO workspaces (id, userId, name, createdAt) VALUES (?, ?, ?, ?)`,
      [workspace.id, workspace.userId, workspace.name, workspace.createdAt]
    );

    const allowedActions = [
      'find_customer',
      'get_order_by_number',
      'validate_refund_eligibility',
      'process_refund',
      'send_refund_confirmation'
    ];
    const approvalRequired = ['process_refund_exceeding_limit'];
    const blockedActions = ['delete_customer', 'modify_system_policy'];

    const defaultAgent: Agent = {
      id: agentId,
      workspaceId,
      name: 'Refund Operations Agent',
      description: 'Autonomous customer return and warranty refund agent',
      purpose: 'Process customer returns and warranty claims within authorized bounds',
      status: 'ACTIVE',
      maxRefundLimit: 5000,
      allowedActions,
      approvalRequired,
      blockedActions,
      createdAt: now,
      updatedAt: now
    };

    await db.run(
      `INSERT INTO agents (id, workspaceId, name, description, purpose, status, maxRefundLimit, allowedActionsJson, approvalRequiredJson, blockedActionsJson, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        defaultAgent.id,
        defaultAgent.workspaceId,
        defaultAgent.name,
        defaultAgent.description,
        defaultAgent.purpose,
        defaultAgent.status,
        defaultAgent.maxRefundLimit,
        JSON.stringify(defaultAgent.allowedActions),
        JSON.stringify(defaultAgent.approvalRequired),
        JSON.stringify(defaultAgent.blockedActions),
        defaultAgent.createdAt,
        defaultAgent.updatedAt
      ]
    );

    const token = this.generateToken(user, workspaceId);
    return { user, workspace, token, defaultAgent };
  }

  /**
   * Log in an existing user
   */
  public async login(email: string, password: string): Promise<{ user: User; workspace: Workspace; token: string; agents: Agent[] }> {
    const row = await db.get<any>(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (!row) {
      throw new Error('Invalid email or password.');
    }

    const { hash } = this.hashPassword(password, row.salt);
    if (hash !== row.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    const user: User = {
      id: row.id,
      name: row.name,
      email: row.email,
      organization: row.organization,
      role: row.role,
      createdAt: row.createdAt
    };

    let workspace = await db.get<Workspace>(`SELECT * FROM workspaces WHERE userId = ?`, [user.id]);
    if (!workspace) {
      workspace = {
        id: `ws_${uuidv4().substring(0, 10)}`,
        userId: user.id,
        name: `${user.name}'s Workspace`,
        createdAt: new Date().toISOString()
      };
      await db.run(
        `INSERT INTO workspaces (id, userId, name, createdAt) VALUES (?, ?, ?, ?)`,
        [workspace.id, workspace.userId, workspace.name, workspace.createdAt]
      );
    }

    const agentRows = await db.query<any>(`SELECT * FROM agents WHERE workspaceId = ?`, [workspace.id]);
    const agents: Agent[] = agentRows.map(r => ({
      ...r,
      allowedActions: JSON.parse(r.allowedActionsJson || '[]'),
      approvalRequired: JSON.parse(r.approvalRequiredJson || '[]'),
      blockedActions: JSON.parse(r.blockedActionsJson || '[]')
    }));

    const token = this.generateToken(user, workspace.id);
    return { user, workspace, token, agents };
  }

  /**
   * Get user and workspace by ID
   */
  public async getUserById(userId: string): Promise<{ user: User; workspace: Workspace } | null> {
    const row = await db.get<any>(`SELECT * FROM users WHERE id = ?`, [userId]);
    if (!row) return null;
    const user: User = {
      id: row.id,
      name: row.name,
      email: row.email,
      organization: row.organization,
      role: row.role,
      createdAt: row.createdAt
    };

    const workspace = await db.get<Workspace>(`SELECT * FROM workspaces WHERE userId = ?`, [user.id]);
    return { user, workspace: workspace! };
  }
}

export const authService = new AuthService();
