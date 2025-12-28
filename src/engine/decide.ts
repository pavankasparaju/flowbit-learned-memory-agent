/**
 * Decision Engine
 * ------------------
 * Purpose:
 *  - Decide whether automation is safe OR
 *  - Whether invoice must be reviewed by a human
 *
 * Design Principles:
 *  - Human-in-the-loop safety
 *  - Confidence grows only with repeated consistency
 *  - Any correction = must review
 *  - Decisions are fully explainable
 */

export function decideAction(
  confidenceScore: number,
  appliedRules: string[],
  proposedCorrections: string[]
) {

  let requiresHumanReview = true;
  let reasoning = "";

  // -----------------------------
  // 🚨 If corrections were applied → ALWAYS escalate
  // -----------------------------
  if (proposedCorrections.length > 0) {
    requiresHumanReview = true;

    reasoning =
      "Corrections detected — invoice requires human validation to ensure financial safety.";

    return {
      requiresHumanReview,
      reasoning,
      confidenceScore,
    };
  }

  // -----------------------------
  // ⚠️ Medium confidence — still send to reviewer
  // -----------------------------
  if (confidenceScore < 0.75) {
    requiresHumanReview = true;

    reasoning =
      "Low confidence — model still learning vendor patterns, send to reviewer.";

    return {
      requiresHumanReview,
      reasoning,
      confidenceScore,
    };
  }

  // -----------------------------
  // ✅ High confidence & NO corrections
  // Safe to auto-approve
  // -----------------------------
  requiresHumanReview = false;

  if (appliedRules.length > 0) {
    reasoning =
      "High confidence from repeated vendor memory patterns — automation approved safely.";
  } else {
    reasoning =
      "High confidence — no corrections or risk signals detected.";
  }

  return {
    requiresHumanReview,
    reasoning,
    confidenceScore,
  };
}
