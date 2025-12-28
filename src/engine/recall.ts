import { db } from "../storage/db.ts";

/**
 * Memory Recall Layer
 *
 * Responsibilities:
 *  - Fetch vendor-specific learned patterns
 *  - Fetch historical human corrections
 *  - Return structured + confidence-sorted memory
 */

export interface VendorMemory {
  id: number;
  vendor: string;
  field: string;
  pattern: string;
  meaning: string;
  confidence: number;
  hits: number;
  lastSeen: string;
}

export interface CorrectionMemory {
  id: number;
  vendor: string;
  field: string;
  wrongValue: string;
  correctedValue: string;
  rule: string;
  confidence: number;
  timesApplied: number;
}

/**
 * Recall vendor normalization rules
 */
export function recallVendorMemory(vendor: string): Promise<VendorMemory[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT * FROM vendor_memory
      WHERE vendor = ?
      ORDER BY confidence DESC, hits DESC
      `,
      [vendor],
      (err, rows) => err ? reject(err) : resolve(rows ?? [])
    );
  });
}

/**
 * Recall past field-level corrections
 */
export function recallCorrectionMemory(vendor: string): Promise<CorrectionMemory[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT * FROM correction_memory
      WHERE vendor = ?
      ORDER BY confidence DESC, timesApplied DESC
      `,
      [vendor],
      (err, rows) => err ? reject(err) : resolve(rows ?? [])
    );
  });
}
