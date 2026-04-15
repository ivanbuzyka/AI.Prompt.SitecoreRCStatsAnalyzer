# Edge Cases and Policies

* If snapshot cadence is irregular, use nearest available snapshots and note gaps.
* If expected files are missing for part of the window, continue best-effort and state limitations.
* If values appear inconsistent (for example size > maxsize), flag anomalies explicitly.
* If `analysis_tools/analyze_renderings_window.py` is missing, recreate it from canonical behavior rules when Python is available.
* If Python runtime is not available, use PowerShell/shell-based parsing and delta aggregation fallback and document that path in the report.
* Prefer actual measured values over assumptions.
* Keep raw dump quoting minimal; summarize with concise tables and bullets.
