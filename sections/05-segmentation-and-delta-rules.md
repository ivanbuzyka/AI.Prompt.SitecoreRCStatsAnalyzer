# Segmentation and Delta Rules

* Never treat cumulative snapshot counters as direct interval totals.
* Always compute per-interval deltas between consecutive snapshots.
* Detect recycle/reset events (for example sharp counter drops) and split analysis into segments.
* Aggregate deltas only within each segment, then merge segment results for reporting.
* Mention if recycle/segment splits were detected.
