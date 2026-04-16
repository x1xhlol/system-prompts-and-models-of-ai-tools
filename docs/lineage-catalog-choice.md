# Lineage / metadata catalog — single choice (WS5)

**Decision (draft):** Default to **OpenLineage** for lineage event emission and integration with common warehouses, **until** an ADR selects OpenMetadata (or another platform) based on ops cost and team skills.

**Rationale:** Avoid two overlapping catalogs early ([`governance/technology-radar-tier1.md`](governance/technology-radar-tier1.md)).

**Next step:** ADR comparing OpenLineage vs OpenMetadata for Dealix scale; pilot one pipeline (e.g. CRM sync job) emitting lineage events.
