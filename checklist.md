# Feedback3 — implementation pointers

Derived from stakeholder discussion in [`feedback3.md`](./feedback3.md) (mock UI v3 review + follow-up feedback). Product/UI gaps and directions for the AlertIQ app (`alertiq/`), not external deliverables (e.g. Juhitha’s design doc).

<span style="color:#dc2626">Red</span> bullets are still **open / not implemented** (or not substantially done). Other bullets are in progress or mostly aligned with current direction.

---

## Dashboard — layout & hierarchy

- **Correlation / clusters as the hero** — Aruna & Karun: correlation should be immediately visible and prominent; avoid making users scroll past large peripheral blocks to reach it.
- **Less vertical scrolling / fewer hops** — SWAT-style flow: intuitive path from alerts → services → correlation without constant tab/screen jumps.
- **Smaller or secondary tiles** — Large “critical alerts” style blocks questioned unless they are high-signal; prefer density and prioritization.
- **Use wide-monitor real estate** — Gary: avoid designing only for a small viewport; allow more horizontal spread / density on large displays (e.g. current `max-width` constraints).
- <span style="color:#dc2626">**Clickable drill-downs without always leaving the page** — Aruna: many items clickable; detail via modal/drawer/overlay where possible, not only full navigation.</span>
- <span style="color:#dc2626">**Per-tile / in-context time scrubber** — Aruna (re Mohan): scrollbar or control for “last 15 minutes vs now” **inside** relevant tiles (at least alert details); **without** jumping to History. *Note:* Global Live / −15/30/45/60 dropdown exists; this asks for **in-tile** or richer timeline UX.</span>
- <span style="color:#dc2626">**Critical → critical services linkage** — Aruna: clicking critical should surface **critical-impacted services** tied to alerts in a clearer, fewer-hop way.</span>

---

## Dashboard — alert level & top metrics

- <span style="color:#dc2626">**Remove or demote full “alert level” breakdown on home** — Karun & Gary: low immediate value for **Clear** and **Error**; Karun suggests **removing** that panel from the home page (keep data for drill-down/history later). *Contradiction:* earlier in the same meeting Aruna confirmed wanting interval + levels; **latest** direction favors removal/shrink from home.</span>
- <span style="color:#dc2626">**Drop the three top KPI tiles** — Aruna/Karun: remove the strip (active clusters / critical / impacted as separate header tiles); **surface counts on the main tiles** instead.</span>
- **“Last updated” copy** — Aruna: show **clear wall-clock date/time**, not only vague “18 minutes ago.”

---

## Impacted services

- **Layout for real estate** — Aruna: e.g. critical/high summary on top, services below; more compact rows; dropdown / expand for details instead of listing everything inline.
- <span style="color:#dc2626">**Customizable tiles** — Aruna: tiles independent enough that users can **reorder or choose** what appears first (correlation vs impacted vs alert details, etc.).</span>

---

## Resolution log

- <span style="color:#dc2626">**Priority (and related fields)** — Mock narrative mentioned priority + time in resolution log; align UI with that if product still wants it.</span>
- <span style="color:#dc2626">**Density / filters** — Juhitha (to Gary): optional dropdown or denser list when more entries exist.</span>

---

## Changes / deployments (actionability)

- <span style="color:#dc2626">**Surface “change” correlation** — Mohan: many P1s tied to **changes**; board should highlight suspected changes (rollback as most actionable).</span>
- <span style="color:#dc2626">**Data path** — Karun: Interlink alone may not carry changes; **ServiceNow** and/or **RCA Genie API** called out as sources for change hypotheses.</span>

---

## Navigation & IA

- **Merge Investigation + Triage** — Karun: redundant for drill-down troubleshooting; **one** screen (e.g. keep “Investigation”) with conversational triage embedded or tabbed. *Current app:* **largely done** — triage is a **drawer/sheet** (FAB on every page); on **Investigation** it opens with **that incident’s context**; `/chat` redirects into the same experience. Not a literal in-page tab strip, but same “no separate chat destination” intent.
- **Lower RCA expectations in primary flow** — Karun/Mohan: don’t over-promise full RCA in this product slice; align copy and depth with **RCA Genie** / other tools.
- <span style="color:#dc2626">**“Notable events” / AI triage of noise** — Karun (idea): long-term line of thinking — what’s **interesting** among thousands of events (not committed as a hard requirement in the transcript).</span>

---

## History & filters

- **History vs dashboard** — Dedicated History page vs inline table is a product choice; transcript wanted **detail** reachable without always leaving context.
- <span style="color:#dc2626">**Time range options** — Gary: question whether **30 days** is needed vs tighter defaults (e.g. **7 days**) for operational focus. *All Incidents still includes 30d preset.*</span>

---

## Documentation & process (not code)

- <span style="color:#dc2626">**Panel catalog for stakeholders** — Karun: document with **screenshot + short description per panel** (for data layout on source systems). Owner was design (Juhitha), not necessarily this repo.</span>

---

## Already largely aligned (for context)

- Dashboard includes **correlation clusters**, **impacted services**, **alert details**, **All Incidents** (search/filters), **resolution log** on the rail, and **global** time window (**Live** + **15/30/45/60** minutes).
- **Impacted ↔ cluster** linking exists in the implementation story.
- **Topology**, **Investigation**, **Triage** exist as areas (even if IA should evolve per Karun).
- **Alert Details** expanded sections can use **pagination** for long lists (post-feedback3 enhancement in app).

---

## Using this file

- Use as a quick reference when prioritizing layout and UX work.
- When feedback **conflicts** (e.g. alert level on home), align with the **latest** explicit direction in the transcript or confirm with stakeholders.
- Re-run a short review after **layout** passes — Aruna estimated **~75%** there with **25%** on cleaner layout/UX.

_Last updated: generated from `feedback3.md` for the AlertIQ codebase._
