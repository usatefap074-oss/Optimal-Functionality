import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

// SQLite database file path
const dbPath = process.env.DATABASE_PATH || "./data/parrot_shop.db";

// Ensure data directory exists
const dir = dirname(dbPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

// Create SQLite connection
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

// Initialize database schema
try {
  // Create tables if they don't exist
  const tables = [
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      old_price INTEGER,
      image TEXT,
      images TEXT,
      specs TEXT,
      in_stock INTEGER DEFAULT 1,
      popular INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      items TEXT NOT NULL,
      total INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_type TEXT NOT NULL,
      delivery_address TEXT,
      payment_method TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const sql of tables) {
    sqlite.exec(sql);
  }
} catch (err) {
  console.error("Failed to initialize database schema:", err);
}

console.log(`✓ SQLite database ready: ${dbPath}`);
