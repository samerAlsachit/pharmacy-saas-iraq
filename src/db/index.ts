import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';

let prisma: PrismaClient;

export function getDb(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export function getBetterSqlite3(): Database.Database {
  const dbPath = path.join(process.cwd(), 'prisma', 'pharmacy.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export async function disconnectDb(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}
