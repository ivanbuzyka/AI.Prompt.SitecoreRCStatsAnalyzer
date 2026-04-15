# Renderings Statistics Analysis

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
