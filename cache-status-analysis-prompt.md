Analyze Sitecore cache status dump files in the current folder.

Goal:
- Review one recent business day of `CacheStatus.*.html` files.
- Pick a 2-hour business-heavy window (before or after noon).
- Identify caches close to max size, empty HTML caches, and signs of frequent scavenging.

Instructions:
1. Detect available dates from file names like:
   - `CacheStatus.YYYYMMDDZ.HHMMSSZ.html`
2. Choose one recent business day (weekday preferred, full set of dumps preferred).
3. Select one 2-hour heavy-traffic window:
   - Morning example: `09:00-11:00`
   - Midday example: `11:00-13:00`
   - Afternoon example: `13:00-15:00`
4. Analyze only snapshots in that window and report:
   - Caches with peak utilization near max:
     - High: >=90%
     - Medium: 80-89%
     - Watch: 75-79%
   - Any cache with size >75% of maxsize must be explicitly reported as "needs maxsize increase" in recommendations.
   - For each such cache include:
     - cache name
     - peak usage %
     - size/maxsize at peak
     - trend from start -> end of window
5. HTML cache check:
   - Consider caches matching `site_name[html]`.
   - List sites where `[html]` cache is empty (count=0 and size=0) for all snapshots in the selected window.
   - Separate likely system/internal sites from business/public sites where possible.
6. Scavenging/eviction signal detection:
   - Find significant drops between consecutive dumps for the same cache.
   - Flag as strong signal when:
     - drop >=30% and absolute drop >=20 MB
   - Highlight repeated drops for the same cache.
7. Also review total cache footprint trend:
   - Total entries and total size across snapshots.
   - Note large sudden drops.

Output format:
- Start with:
  - selected date
  - selected 2-hour window
  - number of snapshots analyzed
- Then sections:
  1) Near-max caches (ordered by severity)
  2) Empty `[html]` caches
  3) Significant drops / scavenging indicators
  4) Interpretation and recommendations
- Keep recommendations practical:
  - which max sizes likely need increase
  - which empty html caches need configuration/traffic validation
  - which caches to monitor further

Quality rules:
- Use actual values from files, not assumptions.
- Prefer concise tables/bullets.
- Call out anomalies (e.g., cache size > configured max).
- If data is incomplete, state limitations clearly.
