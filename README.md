Flowbit — Learned Memory Layer (Technical Assignment)

This project implements a lightweight, heuristic-driven “Learned Memory Layer” for invoice processing agents.
The goal of this assignment was to simulate how an AI-assisted workflow can improve over time by remembering:

repeated human corrections

vendor-specific behavior patterns

previously resolved discrepancies

Instead of treating every invoice as a new case, the agent gradually learns
and makes smarter, safer and more explainable decisions across runs.

🎯 Problem Understanding

Most organizations repeatedly process invoices from the same vendors.

Over time, similar corrections keep happening:

vendor-specific field labels

recurring VAT or pricing behavior

frequently mismatched fields

duplicate invoice scenarios

In a typical workflow, these corrections are not reused.

This assignment focuses on building a memory layer on top of extracted invoice data that:

recalls relevant past learnings

applies them cautiously

explains why a decision was taken

stores new outcomes back into memory

No OCR or ML models were implemented — all behavior is rule-based and auditable, as requested in the problem statement.

🧠 Memory Types Implemented

The system implements three categories of memory:

1️⃣ Vendor Memory

Learns vendor-specific label patterns
Example:
“Leistungsdatum” → serviceDate (Supplier GmbH)

Used for field normalization.

2️⃣ Correction Memory

Tracks recurring correction behavior such as:

VAT included pricing adjustments

quantity / default value alignment

currency inference

3️⃣ Resolution / Outcome Memory

Stores what happened after escalation:

escalated

approved

duplicate detected

Also helps prevent bad memory dominance.

⚙️ Decision Pipeline

Every invoice flows through the following pipeline:

Recall → Apply → Decide → Learn


Recall
fetch past vendor / correction / resolution memory

Apply
normalize fields & suggest corrections

Decide
confidence-based: auto-apply / suggest / escalate

Learn
reinforce or store new insight

Each stage is logged in an auditTrail.

🧮 Confidence & Reinforcement Logic

Confidence is heuristic and intentionally conservative:

new learning starts mid-confidence

reinforced over repeated approval

capped to avoid unsafe auto-correction

mild decay prevents stale memory

Automation increases only when the system has seen
similar corrections multiple times.

This demonstrates “learning over time” without ML training.

🧪 Vendor Scenarios Covered

The demo includes the following learning cases:

✅ Supplier GmbH

learns mapping of
Leistungsdatum → serviceDate

improves after INV-A-001

fewer flags in later invoices

✅ Parts AG

detects “VAT included” pricing behavior

recomputes strategy rather than rejecting

recovers missing currency as vendor-specific inference

✅ Freight & Co

detects Skonto payment pattern

maps “Seefracht / Shipping” → SKU FREIGHT

confidence grows gradually

✅ Duplicates

duplicate invoices are escalated safely

memory does not conflict with prior learning

📝 Output Contract

For each invoice, the system returns:

normalized invoice fields

proposed corrections

decision outcome

reasoning explanation

confidence score

memory updates

full audit trail
(recall → apply → decide → learn)

Outputs are designed to remain:

transparent

auditable

reproducible

instead of “black-box automation”.

▶️ How to Run Demo
npx ts-node src/demo/runDemo.ts


The demo runs invoices sequentially to show:

first invoice → review + learning

second invoice → improved confidence

later invoices → smarter suggestions

💡 Future Improvements

If extended further, I would like to add:

per-field reinforcement scoring

memory visualization dashboard

anomaly grouping by vendor

rejection-based negative learning

balanced confidence weighting

This assignment helped me think about
agent workflows, memory safety
and progressive automation in financial systems.

🙌 Thanks

Thanks to the Flowbit team for a thoughtful and realistic problem statement — this was a great learning experience to work on.
