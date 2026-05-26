import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

let prisma: PrismaClient;
let nativeDb: Database.Database | null = null;

function isDev(): boolean {
  return !app.isPackaged;
}

function getDbDir(): string {
  if (isDev()) {
    return path.join(process.cwd(), 'prisma', 'prisma');
  }
  const userData = app.getPath('userData');
  return path.join(userData, 'data');
}

function resolveDbPath(): string {
  return path.join(getDbDir(), 'pharmacy.db');
}

function ensureDbDir(): void {
  const dir = getDbDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    const bundled = path.join(process.resourcesPath, 'pharmacy.db');
    if (fs.existsSync(bundled)) {
      fs.copyFileSync(bundled, path.join(dir, 'pharmacy.db'));
    }
  }
}

export function getDb(): PrismaClient {
  if (!prisma) {
    ensureDbDir();
    const dbPath = resolveDbPath();
    process.env.DATABASE_URL = `file:${dbPath}`;
    prisma = new PrismaClient();
  }
  return prisma;
}

export function getBetterSqlite3(): Database.Database {
  if (nativeDb) return nativeDb;
  ensureDbDir();
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
