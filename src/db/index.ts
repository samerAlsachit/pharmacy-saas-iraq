import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let prisma: PrismaClient;

export function getDb(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

let nativeDb: Database.Database | null = null;

function resolveDbPath(): string {
  const schemaDir = path.join(process.cwd(), 'prisma');
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf-8');
    const match = env.match(/^DATABASE_URL\s*=\s*"?file:(.+?)"?$/m);
    if (match) {
      return path.resolve(schemaDir, match[1].trim());
    }
  }
  return path.join(schemaDir, 'prisma', 'pharmacy.db');
}

export function getBetterSqlite3(): Database.Database {
  if (nativeDb) return nativeDb;
  const db = new Database(resolveDbPath());
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  registerAppendOnlyTriggers(db);
  nativeDb = db;
  return db;
}

function registerAppendOnlyTriggers(db: Database.Database): void {
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS prevent_auditlog_update
    BEFORE UPDATE ON AuditLog
    BEGIN
      SELECT RAISE(ABORT, 'AuditLog is append-only; updates are forbidden');
    END;

    CREATE TRIGGER IF NOT EXISTS prevent_auditlog_delete
    BEFORE DELETE ON AuditLog
    BEGIN
      SELECT RAISE(ABORT, 'AuditLog is append-only; deletes are forbidden');
    END;
  `);
}

export async function disconnectDb(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}
