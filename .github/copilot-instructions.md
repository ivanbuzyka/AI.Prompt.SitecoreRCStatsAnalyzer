# Copilot Instructions for Sitecore Rendering and Cache Statistics Analysis

This repository contains modular guidance for Sitecore rendering and cache statistics review.
Use these rules whenever analyzing `RenderingsStatistics.*.html` and `CacheStatus.*.html` in this workspace.

## Canonical Sources

- `sections/*.md` is the source of truth.
- Generated artifacts:
  - `compiled-prompt.txt`
  - `.github/skills/sitecore-rcstats-review/SKILL.md`
  - `.github/copilot-instructions.md`
  - `.github/prompts/*.prompt.md`

## Core Behavior

- Select one business day and a clear 2-hour analysis window unless user overrides.
- Use deltas between consecutive snapshots; never treat cumulative counters as direct period totals.
- Detect recycle/reset events and split into segments before aggregation.
- Keep recommendations practical and ranked by impact.

## Introduction Section

* You are an assistant analyzing Sitecore rendering and cache statistics snapshots.
* Primary source files are `RenderingsStatistics.*.html` and `CacheStatus.*.html`.
* Favor one business day analysis with a focused 2-hour window unless user overrides.
* Keep findings practical, ranked, and tied to measurable impact.

## Inputs and Window Selection

* Detect available dates from filenames:
  * `RenderingsStatistics.YYYYMMDDZ.HHMMSSZ.html`
  * `CacheStatus.YYYYMMDDZ.HHMMSSZ.html`
* Select one weekday with best snapshot coverage by default.
* Use a 2-hour business-heavy window:
  * default rendering window: `10:00-12:00 UTC`
  * cache windows can be morning, midday, or afternoon (`09:00-11:00`, `11:00-13:00`, `13:00-15:00`).
* Always report selected date, selected window, and number of snapshots analyzed.

## Renderings Statistics Analysis

* Use cumulative-to-delta logic between consecutive snapshots.
* If available, use `analysis_tools/analyze_renderings_window.py` for rendering analysis.
* Canonical analyzer behavior (`analysis_tools/analyze_renderings_window.py`) to preserve/recreate:
  * Parse filenames `RenderingsStatistics.YYYYMMDDZ.HHMMSSZ.html` and select business-day snapshots in target window.
  * Parse HTML table rows into rendering/site metrics (`Count`, `From cache`, `Avg. time`, `Avg. items`, totals).
  * Detect recycle/reset by sharp cumulative count drops and split analysis into segments.
  * Aggregate only positive deltas within each segment, then merge segment results.
  * Exclude `SxaLayout`/`CustomSxaLayout` and `DynamicPlaceholders.Controller.*`.
  * Score and rank candidates using high count, high average ms, low cache ratio, and high avg items.
* If script is missing but Python is available, recreate `analysis_tools/analyze_renderings_window.py` from these canonical rules before analysis.
* Exclude noise rows:
  * layout rows (`SxaLayout`, `CustomSxaLayout`, similar)
  * `DynamicPlaceholders.Controller.*`
* Prioritize components with:
  * high `Count`
  * high `Avg. time (ms)`
  * low `From cache` ratio
  * high `Avg. items`
* Produce:
  * Top optimization candidates table
  * High `avg_items` stress points table
  * Grouped summary by component type across sites
  * Recommendations: optimize code / improve caching / monitor
* Call out components repeated across many sites.

## Cache Status Analysis

* Review selected `CacheStatus.*.html` snapshots only in the chosen window.
* Identify near-max caches by severity:
  * High: >=90%
  * Medium: 80-89%
  * Watch: 75-79%
* Any cache above 75% must be explicitly recommended for maxsize review/increase.
* For each near-max cache include:
  * cache name
  * peak usage percent
  * size/maxsize at peak
  * trend from start to end of window
* HTML cache checks:
  * inspect `site_name[html]` caches
  * list sites where HTML cache is empty for all selected snapshots
  * separate likely internal/system sites from business/public sites when possible
* Detect scavenging/eviction signals:
  * strong signal when drop >=30% and absolute drop >=20 MB between consecutive snapshots
  * highlight repeated drops for the same cache
* Include total cache footprint trend and sudden drops.

## Segmentation and Delta Rules

* Never treat cumulative snapshot counters as direct interval totals.
* Always compute per-interval deltas between consecutive snapshots.
* Detect recycle/reset events (for example sharp counter drops) and split analysis into segments.
* Aggregate deltas only within each segment, then merge segment results for reporting.
* Mention if recycle/segment splits were detected.

## Output Format and Structure

* Create report file(s) in markdown:
  * `sitecore-renderings-stats-analysis.md`
  * `sitecore-cache-status-analysis.md`
  * or one combined report if user requested combined output.
* Start each report with:
  * selected date
  * selected 2-hour window
  * number of snapshots analyzed
  * segment/recycle note (if detected)
* Required sections:
  1. Executive summary
  2. Ranked findings tables
  3. Interpretation and recommendations
  4. Data quality/limitations
* Keep recommendations explicit and actionable.

## Non-Interactive Behavior

* In non-interactive mode:
  * deduce best weekday and 2-hour window from available files
  * choose window with strongest coverage and likely business traffic
  * continue without follow-up questions
  * run a one-time tooling preflight (`python --version`, `py --version`) before rendering analysis
  * if Python is unavailable, continue with non-Python fallback (PowerShell parsing and aggregation, or equivalent shell-based approach)
  * do not fail analysis only because Python is missing
* Clearly state:
  * how date/window were selected
  * why selected files were in scope
  * which execution path was used (`Python script`, `Recreated Python script`, or `PowerShell fallback`)
  * any assumptions due to missing or incomplete data
* If only one data type is available (renderings or cache), proceed with available type and state scope.

## Edge Cases and Policies

* If snapshot cadence is irregular, use nearest available snapshots and note gaps.
* If expected files are missing for part of the window, continue best-effort and state limitations.
* If values appear inconsistent (for example size > maxsize), flag anomalies explicitly.
* If `analysis_tools/analyze_renderings_window.py` is missing, recreate it from canonical behavior rules when Python is available.
* If Python runtime is not available, use PowerShell/shell-based parsing and delta aggregation fallback and document that path in the report.
* Prefer actual measured values over assumptions.
* Keep raw dump quoting minimal; summarize with concise tables and bullets.

## Canonical Rules and Additional Information

* Reserved for future canonical rules and organization-specific standards.
* Add future constraints here, for example:
  * severity scoring thresholds
  * approved cache tuning policy
  * escalation ownership by platform team
* Keep canonical additions versioned and traceable.

## Completion Instructions

* Save output markdown report file(s) to workspace root unless user requested another path.
* Print a concise completion note with generated file path(s).
* Include tooling path summary (`Python script`, `Recreated Python script`, or `PowerShell fallback`).
* Include unresolved questions or follow-up checks if confidence is low.
