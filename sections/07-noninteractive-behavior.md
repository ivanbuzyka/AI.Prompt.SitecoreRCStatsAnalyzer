# Non-Interactive Behavior

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
