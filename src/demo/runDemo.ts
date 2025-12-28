import { initDB } from "../storage/db.ts";
import { recallVendorMemory, recallCorrectionMemory } from "../engine/recall.ts";
import { applyVendorMemory, applyCorrectionMemory } from "../engine/apply.ts";
import { decideAction } from "../engine/decide.ts";
import { learnVendorPattern, learnCorrection } from "../engine/learn.ts";

async function runInvoice(invoice: any) {

  // Ensure DB + tables exist
  initDB();

  const auditTrail: any[] = [];

  // ---------- RECALL MEMORY ----------
  const vendorMemory = await recallVendorMemory(invoice.vendor);
  const correctionMemory = await recallCorrectionMemory(invoice.vendor);

  auditTrail.push({ step: "recall", timestamp: new Date().toISOString() });

  // ---------- APPLY MEMORY ----------
  const vendorApplied = applyVendorMemory(invoice, vendorMemory);
  const correctionsApplied = applyCorrectionMemory(invoice, correctionMemory);

  const confidenceScore =
    0.5 +
    vendorApplied.confidenceBoost +
    correctionsApplied.confidenceBoost;

  auditTrail.push({ step: "apply", timestamp: new Date().toISOString() });

  // ---------- DECISION ----------
  const decision = decideAction(
    confidenceScore,
    vendorApplied.appliedRules,
    correctionsApplied.proposedCorrections
  );

  auditTrail.push({ step: "decide", timestamp: new Date().toISOString() });

  // ---------- SIMULATE HUMAN FEEDBACK (LEARNING) ----------
  await learnVendorPattern(
    invoice.vendor,
    "serviceDate",
    "Leistungsdatum",
    "Vendor label for service date"
  );

  await learnCorrection(
    invoice.vendor,
    "qty",
    "10",
    "12",
    "Quantity mismatch corrected to delivery note value"
  );

  auditTrail.push({ step: "learn", timestamp: new Date().toISOString() });

  // ---------- OUTPUT CONTRACT ----------
  console.log("\n================= INVOICE RESULT =================");

  console.log({
    invoiceId: invoice.id,
    vendor: invoice.vendor,

    normalizedInvoice: vendorApplied.normalized,

    appliedRules: vendorApplied.appliedRules,
    proposedCorrections: correctionsApplied.proposedCorrections,

    requiresHumanReview: decision.requiresHumanReview,
    reasoning: decision.reasoning,

    confidenceScore,
    auditTrail
  });

  console.log("=================================================\n");
}



// ---------- DEMO SEQUENCE ----------

// First invoice — system has no memory yet
runInvoice({
  id: "INV-A-001",
  vendor: "Supplier GmbH",
  extracted: {
    "Leistungsdatum": "2024-12-12",
    qty: "10"
  }
});


// Second invoice — memory applied, smarter suggestions
setTimeout(() => {
  runInvoice({
    id: "INV-A-002",
    vendor: "Supplier GmbH",
    extracted: {
      "Leistungsdatum": "2024-12-15",
      qty: "10"
    }
  });
}, 2000);


// Third invoice — reinforced memory, higher confidence
setTimeout(() => {
  runInvoice({
    id: "INV-A-003",
    vendor: "Supplier GmbH",
    rawText: "",
    extracted: {
      "Leistungsdatum": "2024-12-20",
      qty: "12" // already correct → no correction needed
    }
  });
}, 2000);
