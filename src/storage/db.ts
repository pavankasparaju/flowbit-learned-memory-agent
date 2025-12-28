import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

/**
 * SQLite persistent memory store
 * Used by recall(), learn(), apply()
 *
 * Tables:
 *  - vendor_memory      → learned vendor patterns
 *  - correction_memory → applied field corrections
 *  - resolution_memory → human review feedback
 */

// --- Resolve project root path safely (ESM compatible) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database stored at project root
const dbPath = path.join(__dirname, "../../memory.db");

export const db = new sqlite3.Database(dbPath);

// --- Create tables if they do not exist ---
export function initDB(): void {
  db.serialize(() => {
    // Vendor pattern learning memory
    db.run(`
      CREATE TABLE IF NOT EXISTS vendor_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor TEXT,
        field TEXT,
        pattern TEXT,
        meaning TEXT,
        confidence REAL DEFAULT 0,
        hits INTEGER DEFAULT 0,
        lastSeen TEXT
      )
    `);

    // Field-level correction learning
    db.run(`
      CREATE TABLE IF NOT EXISTS correction_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor TEXT,
        field TEXT,
        wrongValue TEXT,
        correctedValue TEXT,
        rule TEXT,
        confidence REAL DEFAULT 0,
        timesApplied INTEGER DEFAULT 0
      )
    `);

    // Decision history + human overrides
    db.run(`
      CREATE TABLE IF NOT EXISTS resolution_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor TEXT,
        discrepancy TEXT,
        systemDecision TEXT,
        humanDecision TEXT,
        confidenceImpact REAL,
        timestamp TEXT
      )
    `);
  });
}
