# Governance & Approval Policy Models

Every action by any Agent must be assigned to an **Approval Class**, a **Reversibility Class**, and a **Sensitivity Class**.

## 1. Approval Classes
- **Class A (Auto Allowed)**: Repo inspection, summaries, drafts, testing, local DB reads.
- **Class B (Approval Required)**: Changes to config, database migrations, marketing email blasts, pricing changes, public publishing. (Requires VP/Manager Gate).
- **Class C (Board Level/Forbidden)**: Term sheets, M&A initiation, destructive changes. (Requires CEO/Board Gate).

## 2. Reversibility Classes
- **R0**: Fully auto-reversible (e.g. Git reset locally).
- **R1**: Reversible with limited intervention (e.g. drafting an email).
- **R2**: Costly/painful to reverse (e.g. generating an expensive comprehensive report).
- **R3**: Irreversible / External Commitment (e.g. signing a digital contract, creating an external Dealroom).

## 3. Sensitivity Classes
- **S0**: Public data.
- **S1**: Internal operational data.
- **S2**: Confidential (Pricing margins, employee data). Must use local/private AI.
- **S3**: Highly Sensitive (M&A targeting, legal disputes, board packets). Strictly guarded.

## 4. Policy Engine Execution Constraint
No Agent may commit an action of `R2/R3` or dealing with `S2/S3` without an `Evidence Pack` accompanying a `Decision Memo` that has explicitly secured authorization via the `Execution Plane`.
