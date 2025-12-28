import { db } from "../storage/db.ts";

/**
 * Learning Engine
 *
 * Responsibilities:
 *  - Store new vendor memory patterns
 *  - Reinforce existing memory when repeated
 *  - Track confidence + usage frequency
 *  - Maintain explainable audit history
 */


/**
 * Learn / reinforce vendor field pattern
 * Example:
 *   "Leistungsdatum"  →  "serviceDate"
 */
export function learnVendorPattern(
  vendor: string,
  field: string,
  pattern: string,
  meaning: string
): Promise<void> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT * FROM vendor_memory
      WHERE vendor = ? AND field = ? AND pattern = ?
      `,
      [vendor, field, pattern],
      (err, row: any) => {
        if (err) return reject(err);

        // First-time learning
        if (!row) {
          db.run(
            `
            INSERT INTO vendor_memory
              (vendor, field, pattern, meaning, confidence, hits, lastSeen)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
              vendor,
              field,
              pattern,
              meaning,
              0.55,                 // initial confidence
              1,                    // first observation
              new Date().toISOString()
            ],
            () => resolve()
          );
          return;
        }

        // Reinforcement learning
        const newConfidence = Math.min(1.0, (row.confidence ?? 0.5) + 0.15);
        const newHits = (row.hits ?? 0) + 1;

        db.run(
          `
          UPDATE vendor_memory
          SET confidence = ?,
              hits = ?,
              lastSeen = ?
          WHERE id = ?
          `,
          [newConfidence, newHits, new Date().toISOString(), row.id],
          () => resolve()
        );
      }
    );
  });
}



/**
 * Learn / reinforce correction pattern
 * Example:
 *   qty 10 → corrected to 12
 */
export function learnCorrection(
  vendor: string,
  field: string,
  wrongValue: string,
  correctedValue: string,
  rule: string
): Promise<void> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT * FROM correction_memory
      WHERE vendor = ? AND field = ? AND wrongValue = ?
      `,
      [vendor, field, wrongValue],
      (err, row: any) => {
        if (err) return reject(err);

        // New correction pattern
        if (!row) {
          db.run(
            `
            INSERT INTO correction_memory
              (vendor, field, wrongValue, correctedValue, rule, confidence, timesApplied)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
              vendor,
              field,
              wrongValue,
              correctedValue,
              rule,
              0.50,
              1
            ],
            () => resolve()
          );
          return;
        }

        // Reinforce confidence
        const newConfidence = Math.min(1.0, (row.confidence ?? 0.5) + 0.20);
        const newTimes = (row.timesApplied ?? 0) + 1;

        db.run(
          `
          UPDATE correction_memory
          SET confidence = ?,
              timesApplied = ?
          WHERE id = ?
          `,
          [newConfidence, newTimes, row.id],
          () => resolve()
        );
      }
    );
  });
}
