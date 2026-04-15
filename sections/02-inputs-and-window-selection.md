# Inputs and Window Selection

* Detect available dates from filenames:
  * `RenderingsStatistics.YYYYMMDDZ.HHMMSSZ.html`
  * `CacheStatus.YYYYMMDDZ.HHMMSSZ.html`
* Select one weekday with best snapshot coverage by default.
* Use a 2-hour business-heavy window:
  * default rendering window: `10:00-12:00 UTC`
  * cache windows can be morning, midday, or afternoon (`09:00-11:00`, `11:00-13:00`, `13:00-15:00`).
* Always report selected date, selected window, and number of snapshots analyzed.
