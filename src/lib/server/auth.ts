import { db, isDbHealthy } from './db';
import * as schema from './db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export async function createSession(userId: number, deviceId: string = ''): Promise<string> {
  const sessionId = randomBytes(32).toString('hex');
  // 24 hours from now
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  if (db && isDbHealthy) {
    await db.insert(schema.adminSessions).values({
      id: sessionId,
      userId,
      expiresAt,
      deviceId
    });
  }
  return sessionId;
}

export async function validateSession(sessionId: string): Promise<schema.AdminUser | null> {
  if (!db || !isDbHealthy) return null;

  const result = await db
    .select({
      user: schema.adminUsers,
      session: schema.adminSessions
    })
    .from(schema.adminSessions)
    .innerJoin(schema.adminUsers, eq(schema.adminSessions.userId, schema.adminUsers.id))
    .where(eq(schema.adminSessions.id, sessionId));

  if (result.length === 0) return null;

  const { user, session } = result[0];

  // Check expiration
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(schema.adminSessions).where(eq(schema.adminSessions.id, sessionId));
    return null;
  }

  // Extend session if valid and less than 12 hours left
  const timeRemaining = session.expiresAt.getTime() - Date.now();
  if (timeRemaining < 12 * 60 * 60 * 1000) {
    await db
      .update(schema.adminSessions)
      .set({ expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) })
      .where(eq(schema.adminSessions.id, sessionId));
  }

  return user;
}

export async function invalidateSession(sessionId: string): Promise<void> {
  if (db && isDbHealthy) {
    await db.delete(schema.adminSessions).where(eq(schema.adminSessions.id, sessionId));
  }
}
