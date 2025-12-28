import type { VendorMemory, CorrectionMemory } from "./recall.ts";

/**
 * Memory Apply Layer
 *
 * Responsibilities:
 *  - Normalize vendor fields using learned patterns
 *  - Suggest field corrections based on past fixes
 *  - Increase confidence as memory matches
 *  - Produce explainable reasoning context
 */

export function applyVendorMemory(invoice: any, vendorMemory: VendorMemory[]) {

  const normalized = { ...invoice.extracted };
  const appliedRules: string[] = [];
  let confidenceBoost = 0;

  for (const mem of vendorMemory) {
    const fieldValue = invoice.extracted[mem.pattern];

    // If vendor field pattern exists in invoice
    if (fieldValue) {
      normalized[mem.field] = fieldValue;

      appliedRules.push(
        `Mapped "${mem.pattern}" → "${mem.field}" (${mem.meaning})`
      );

      confidenceBoost += Math.min(0.1, mem.confidence * 0.1);
    }
  }

  return {
    normalized,
    appliedRules,
    confidenceBoost
  };
}



/**
 * Apply past field correction learnings
 */
export function applyCorrectionMemory(invoice: any, corrections: CorrectionMemory[]) {

  const proposedCorrections: string[] = [];
  let confidenceBoost = 0;

  for (const mem of corrections) {
    const currentValue = invoice.extracted[mem.field];

    if (currentValue === mem.wrongValue) {
      proposedCorrections.push(
        `Suggest correction on ${mem.field}: ${mem.wrongValue} → ${mem.correctedValue}`
      );

      confidenceBoost += Math.min(0.15, mem.confidence * 0.15);
    }
  }

  return {
    proposedCorrections,
    confidenceBoost
  };
}
