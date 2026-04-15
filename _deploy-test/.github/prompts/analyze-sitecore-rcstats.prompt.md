# Analyze Sitecore Rendering and Cache Statistics (Interactive)

Analyze Sitecore `RenderingsStatistics.*.html` and `CacheStatus.*.html` files in this workspace.

Follow in this order:
1. `.github/copilot-instructions.md`
2. `.github/skills/sitecore-rcstats-review/SKILL.md`
3. `sections/*.md`

Before analysis, ask and confirm:
- target role/environment
- selected business date
- selected 2-hour window
- whether both rendering and cache snapshots should be analyzed in one run

Use `analysis_tools/analyze_renderings_window.py` when rendering analysis is requested and the file is available.
Write markdown report(s) in workspace root unless user requests another path.
