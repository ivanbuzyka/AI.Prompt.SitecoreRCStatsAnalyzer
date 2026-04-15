# AI Sitecore RCStats Analyzer

Structured project for compiling canonical guidance to analyze:

- `RenderingsStatistics.*.html`
- `CacheStatus.*.html`

The project compiles modular sections into:

- `compiled-prompt.txt`
- `.github/copilot-instructions.md`
- `.github/prompts/*.prompt.md`
- `.github/skills/sitecore-rcstats-review/SKILL.md`

## Project Layout

```text
AI-SitecoreRCStatsAnalyzer/
├── sections/
│   ├── 01-introduction.md
│   ├── 02-inputs-and-window-selection.md
│   ├── 03-renderings-statistics-analysis.md
│   ├── 04-cache-status-analysis.md
│   ├── 05-segmentation-and-delta-rules.md
│   ├── 06-output-format.md
│   ├── 07-noninteractive-behavior.md
│   ├── 08-edge-cases.md
│   ├── 09-canonical-placeholders.md
│   └── 10-completion.md
├── .github/
│   ├── copilot-instructions.md
│   ├── prompts/
│   └── skills/
├── analysis_tools/
│   └── analyze_renderings_window.py
├── rendering-statistics-analysis-prompt.txt
├── cache-status-analysis-prompt.md
├── compile-prompt.js
├── compiled-prompt.txt
└── package.json
```

## Scripts

- `npm run compile`
- `npm run compile:skill`
- `npm run compile:copilot`
- `npm run compile:all`

## Notes

- `sections/*.md` is the canonical source of truth.
- Reference prompts and Python analyzer are preserved and reflected in section guidance.
- `--deploy-dir` deployment also includes `analysis_tools/analyze_renderings_window.py`.

## Compile and Deploy to Another Folder

Use this flow when your analysis workspace is different from this repository.

1. Build all artifacts:

   ```bash
   npm run compile:all
   ```

2. Build and deploy in one command:

   ```bash
   node compile-prompt.js --emit-skill --emit-copilot --deploy-dir "C:\path\to\target-folder"
   ```

3. Verify deployed files in the target folder:
   - `compiled-prompt.txt`
   - `.github/copilot-instructions.md`
   - `.github/prompts/analyze-sitecore-rcstats.prompt.md`
   - `.github/prompts/analyze-sitecore-rcstats-noninteractive.prompt.md`
   - `.github/skills/sitecore-rcstats-review/SKILL.md`
   - `analysis_tools/analyze_renderings_window.py`
