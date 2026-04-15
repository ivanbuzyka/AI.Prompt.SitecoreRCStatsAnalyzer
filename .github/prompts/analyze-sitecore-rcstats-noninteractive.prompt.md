# Analyze Sitecore Rendering and Cache Statistics (Non-Interactive / CLI)

Analyze Sitecore snapshot files without follow-up questions.

Instruction priority:
1. `.github/copilot-instructions.md`
2. `.github/skills/sitecore-rcstats-review/SKILL.md`
3. `sections/*.md`

Defaults when input is missing:
- choose one recent weekday with best snapshot coverage
- use a 2-hour business-heavy window
- report explicit date/window/snapshot counts
- state limitations and assumptions clearly

Use `analysis_tools/analyze_renderings_window.py` for rendering statistics when present.
Write output markdown report(s) and print final path(s).
