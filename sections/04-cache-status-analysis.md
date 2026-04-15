# Cache Status Analysis

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
