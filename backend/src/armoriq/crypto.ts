import crypto from 'crypto';
import { PlanStep } from '../models/types';

export class ArmorIQCrypto {
  /**
   * Deterministically serialize JSON with sorted keys
   */
  public static canonicalStringify(obj: any): string {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return '[' + obj.map(ArmorIQCrypto.canonicalStringify).join(',') + ']';
    }
    const keys = Object.keys(obj).sort();
    return '{' + keys.map(k => `${JSON.stringify(k)}:${ArmorIQCrypto.canonicalStringify(obj[k])}`).join(',') + '}';
  }

  /**
   * Calculate SHA-256 hash of canonicalized input
   */
  public static sha256(data: any): string {
    const canonical = typeof data === 'string' ? data : ArmorIQCrypto.canonicalStringify(data);
    return crypto.createHash('sha256').update(canonical).digest('hex');
  }

  /**
   * Build a Merkle Tree from plan steps and return Merkle Root & Leaf Hashes
   */
  public static buildMerkleTree(steps: PlanStep[]): { merkleRoot: string; leafHashes: string[] } {
    if (steps.length === 0) {
      const emptyHash = ArmorIQCrypto.sha256('EMPTY_PLAN');
      return { merkleRoot: emptyHash, leafHashes: [emptyHash] };
    }

    const leafHashes = steps.map(step => {
      const stepSummary = {
        stepNumber: step.stepNumber,
        action: step.action,
        tool: step.tool,
        mcp: step.mcp,
        inputs: step.inputs
      };
      return ArmorIQCrypto.sha256(stepSummary);
    });

    let currentLevel = [...leafHashes];
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        nextLevel.push(ArmorIQCrypto.sha256(left + right));
      }
      currentLevel = nextLevel;
    }

    return {
      merkleRoot: currentLevel[0],
      leafHashes
    };
  }

  /**
   * Mint a cryptographic Intent Token (CSRG-IAP specification)
   */
  public static mintIntentToken(params: {
    userId: string;
    agentId: string;
    goal: string;
    merkleRoot: string;
    planHash: string;
    authorizedLimit: number;
  }): string {
    const payload = {
      iss: 'armoriq-csrg-iap-v1',
      sub: params.userId,
      agent: params.agentId,
      goal: params.goal,
      mkl: params.merkleRoot,
      plh: params.planHash,
      scope: {
        maxRefundLimit: params.authorizedLimit,
        currency: 'INR'
      },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'ARMORIQ_INTENT_TOKEN' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const secret = process.env.ARMORIQ_SECRET || 'sentinel-armoriq-cryptographic-secret-2026';
    const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  /**
   * Verify and decode Intent Token
   */
  public static decodeIntentToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    } catch {
      return null;
    }
  }

  /**
   * Generate an audit trail seal hash
   */
  public static generateAuditSeal(data: Record<string, any>): string {
    const payload = ArmorIQCrypto.canonicalStringify(data);
    const salt = 'ARMORIQ_SEAL_V1';
    return '0x' + crypto.createHmac('sha256', salt).update(payload).digest('hex');
  }
}
