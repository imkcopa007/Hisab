import crypto from 'crypto';
import { Manager } from './types.js';

interface Session {
  managerId: string;
  loginIdentifier: string;
  fullName: string;
  role: 'manager' | 'owner';
  mustChangePassword: boolean;
  expiresAt: number;
}

const sessions = new Map<string, Session>();
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const chosenSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, chosenSalt, 100000, 64, 'sha512').toString('hex');
  return { salt: chosenSalt, hash };
}

export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

export function createSession(manager: Manager): { token: string; session: Session } {
  const token = crypto.randomBytes(32).toString('hex');
  const session: Session = {
    managerId: manager.id,
    loginIdentifier: manager.loginIdentifier,
    fullName: manager.fullName,
    role: manager.role,
    mustChangePassword: manager.mustChangePassword,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  sessions.set(token, session);
  return { token, session };
}

export function validateSession(token?: string | null): Session | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function updateSessionPasswordFlag(managerId: string, mustChange: boolean): void {
  for (const session of sessions.values()) {
    if (session.managerId === managerId) {
      session.mustChangePassword = mustChange;
    }
  }
}

export function revokeSession(token: string): void {
  sessions.delete(token);
}
