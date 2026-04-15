#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class PromptCompiler {
    constructor() {
        this.sectionsDir = path.join(__dirname, 'sections');
        this.outputDir = __dirname;
        this.mode = 'dev';
        this.outputFile = 'compiled-prompt.txt';
        this.emitSkill = false;
        this.skillOnly = false;
        this.emitCopilot = false;
        this.copilotOnly = false;
        this.skillName = 'sitecore-rcstats-review';
        this.skillDescription = 'Analyze Sitecore RenderingsStatistics and CacheStatus snapshots and produce actionable optimization findings.';
        this.skillOutputFile = path.join('.github', 'skills', this.skillName, 'SKILL.md');
        this.copilotInstructionsFile = path.join('.github', 'copilot-instructions.md');
        this.copilotPromptInteractiveFile = path.join('.github', 'prompts', 'analyze-sitecore-rcstats.prompt.md');
        this.copilotPromptNonInteractiveFile = path.join('.github', 'prompts', 'analyze-sitecore-rcstats-noninteractive.prompt.md');
        this.deployDir = null;
        this.generatedArtifacts = [];
        this.staticDeployArtifacts = [
            path.join('analysis_tools', 'analyze_renderings_window.py')
        ];
    }

    parseArgs() {
        const args = process.argv.slice(2);
        for (let i = 0; i < args.length; i++) {
            switch (args[i]) {
                case '--dev':
                    this.mode = 'dev';
                    break;
                case '--prod':
                    this.mode = 'prod';
                    break;
                case '--output':
                    if (i + 1 < args.length) {
                        this.outputFile = args[i + 1];
                        i++;
                    }
                    break;
                case '--emit-skill':
                    this.emitSkill = true;
                    break;
                case '--skill-only':
                    this.skillOnly = true;
                    this.emitSkill = true;
                    break;
                case '--emit-copilot':
                    this.emitCopilot = true;
                    break;
                case '--copilot-only':
                    this.copilotOnly = true;
                    this.emitCopilot = true;
                    break;
                case '--skill-output':
                    if (i + 1 < args.length) {
                        this.skillOutputFile = args[i + 1];
                        this.emitSkill = true;
                        i++;
                    }
                    break;
                case '--deploy-dir':
                    if (i + 1 < args.length) {
                        this.deployDir = path.resolve(process.cwd(), args[i + 1]);
                        i++;
                    }
                    break;
                case '--help':
                case '-h':
                    this.showHelp();
                    process.exit(0);
                    break;
            }
        }
    }

    showHelp() {
        console.log(`
Usage: node compile-prompt.js [options]

Options:
  --dev              Development mode (default)
  --prod             Production mode
  --output <file>    Output filename (default: compiled-prompt.txt)
  --emit-skill       Also generate .github/skills/sitecore-rcstats-review/SKILL.md
  --skill-only       Generate only SKILL.md
  --emit-copilot     Also generate .github/copilot-instructions.md and .github/prompts/*
  --copilot-only     Generate only Copilot files
  --skill-output     Custom skill output path
  --deploy-dir <dir> Copy generated artifacts into target folder
  --help, -h         Show this help message
        `);
    }

    getSectionFiles() {
        try {
            const files = fs.readdirSync(this.sectionsDir).filter((f) => f.endsWith('.md')).sort();
            return files.map((f) => path.join(this.sectionsDir, f));
        } catch (error) {
            console.error('Error reading sections directory:', error.message);
            process.exit(1);
        }
    }

    processSection(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileName = path.basename(filePath, '.md');
            const lines = content.split('\n');
            let title = '';
            if (lines[0] && lines[0].startsWith('#')) {
                title = lines[0].replace(/^#+\s*/, '');
            }
            return { fileName, title, content: content.trim() };
        } catch (error) {
            console.error(`Error reading section file ${filePath}:`, error.message);
            return null;
        }
    }

    compile() {
        console.log(`Compiling prompt in ${this.mode} mode...`);
        const sections = [];
        for (const filePath of this.getSectionFiles()) {
            const section = this.processSection(filePath);
            if (section) {
                sections.push(section);
                console.log(`  Processed: ${section.fileName}${section.title ? ` (${section.title})` : ''}`);
            }
        }
        if (sections.length === 0) {
            console.error('No sections found to compile');
            process.exit(1);
        }

        if (!this.skillOnly && !this.copilotOnly) {
            this.writeCompiledPrompt(sections);
        }
        if (this.emitSkill) {
            this.writeSkillFile(sections);
        }
        if (this.emitCopilot) {
            this.writeCopilotFiles(sections);
        }
        if (this.deployDir) {
            this.deployArtifacts();
        }
    }

    getSectionBody(section) {
        let content = section.content;
        if (content.startsWith('#')) {
            content = content.split('\n').slice(1).join('\n').trim();
        }
        return content;
    }

    formatSection(section) {
        return `\n# ${section.title || section.fileName}\n\n${this.getSectionBody(section)}\n\n`;
    }

    generateHeader() {
        return `# Sitecore Rendering and Cache Statistics Analysis Prompt
# Generated: ${new Date().toISOString()}
# Mode: ${this.mode.toUpperCase()}
#
# This prompt is designed for Sitecore RenderingsStatistics and CacheStatus analysis.
# It is suitable for Cursor, GitHub Copilot, and similar assistants.
#
# ==============================================================================

`;
    }

    generateFooter() {
        return `# ==============================================================================
# End of Sitecore Rendering and Cache Statistics Analysis Prompt
#
# To update guidance, edit files in 'sections/' and recompile.
`;
    }

    writeCompiledPrompt(sections) {
        let compiled = this.generateHeader();
        for (const section of sections) {
            compiled += this.formatSection(section);
        }
        compiled += this.generateFooter();
        const outputPath = path.join(this.outputDir, this.outputFile);
        fs.writeFileSync(outputPath, compiled, 'utf8');
        this.generatedArtifacts.push(outputPath);
        console.log(`Generated: ${outputPath}`);
    }

    generateSkillDocument(sections) {
        const frontmatter = `---
name: ${this.skillName}
description: ${this.skillDescription}
---
`;
        let body = `
# Sitecore Rendering and Cache Statistics Review Skill

Use this skill to analyze Sitecore \`RenderingsStatistics.*.html\` and \`CacheStatus.*.html\` snapshot files and produce practical optimization recommendations.
`;
        for (const section of sections) {
            body += `\n## ${section.title || section.fileName}\n\n${this.getSectionBody(section)}\n`;
        }
        return `${frontmatter}${body}`;
    }

    writeSkillFile(sections) {
        const outputPath = path.join(this.outputDir, this.skillOutputFile);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, this.generateSkillDocument(sections), 'utf8');
        this.generatedArtifacts.push(outputPath);
        console.log(`Generated skill: ${outputPath}`);
    }

    generateMergedSectionsMarkdown(sections, headingLevel = 2) {
        const headingPrefix = '#'.repeat(Math.max(1, headingLevel));
        let content = '';
        for (const section of sections) {
            content += `\n${headingPrefix} ${section.title || section.fileName}\n\n${this.getSectionBody(section)}\n`;
        }
        return content.trim() + '\n';
    }

    generateCopilotInstructionsDocument(sections) {
        const merged = this.generateMergedSectionsMarkdown(sections, 2);
        return `# Copilot Instructions for Sitecore Rendering and Cache Statistics Analysis

This repository contains modular guidance for Sitecore rendering and cache statistics review.
Use these rules whenever analyzing \`RenderingsStatistics.*.html\` and \`CacheStatus.*.html\` in this workspace.

## Canonical Sources

- \`sections/*.md\` is the source of truth.
- Generated artifacts:
  - \`compiled-prompt.txt\`
  - \`.github/skills/sitecore-rcstats-review/SKILL.md\`
  - \`.github/copilot-instructions.md\`
  - \`.github/prompts/*.prompt.md\`

## Core Behavior

- Select one business day and a clear 2-hour analysis window unless user overrides.
- Use deltas between consecutive snapshots; never treat cumulative counters as direct period totals.
- Detect recycle/reset events and split into segments before aggregation.
- Keep recommendations practical and ranked by impact.

${merged}`;
    }

    generateCopilotPromptInteractiveDocument() {
        return `# Analyze Sitecore Rendering and Cache Statistics (Interactive)

Analyze Sitecore \`RenderingsStatistics.*.html\` and \`CacheStatus.*.html\` files in this workspace.

Follow in this order:
1. \`.github/copilot-instructions.md\`
2. \`.github/skills/sitecore-rcstats-review/SKILL.md\`
3. \`sections/*.md\`

Before analysis, ask and confirm:
- target role/environment
- selected business date
- selected 2-hour window
- whether both rendering and cache snapshots should be analyzed in one run

Use \`analysis_tools/analyze_renderings_window.py\` when rendering analysis is requested and the file is available.
Write markdown report(s) in workspace root unless user requests another path.
`;
    }

    generateCopilotPromptNonInteractiveDocument() {
        return `# Analyze Sitecore Rendering and Cache Statistics (Non-Interactive / CLI)

Analyze Sitecore snapshot files without follow-up questions.

Instruction priority:
1. \`.github/copilot-instructions.md\`
2. \`.github/skills/sitecore-rcstats-review/SKILL.md\`
3. \`sections/*.md\`

Defaults when input is missing:
- choose one recent weekday with best snapshot coverage
- use a 2-hour business-heavy window
- report explicit date/window/snapshot counts
- state limitations and assumptions clearly

Use \`analysis_tools/analyze_renderings_window.py\` for rendering statistics when present.
Write output markdown report(s) and print final path(s).
`;
    }

    writeCopilotFiles(sections) {
        const instructionsPath = path.join(this.outputDir, this.copilotInstructionsFile);
        const interactivePromptPath = path.join(this.outputDir, this.copilotPromptInteractiveFile);
        const nonInteractivePromptPath = path.join(this.outputDir, this.copilotPromptNonInteractiveFile);

        fs.mkdirSync(path.dirname(instructionsPath), { recursive: true });
        fs.mkdirSync(path.dirname(interactivePromptPath), { recursive: true });

        fs.writeFileSync(instructionsPath, this.generateCopilotInstructionsDocument(sections), 'utf8');
        fs.writeFileSync(interactivePromptPath, this.generateCopilotPromptInteractiveDocument(), 'utf8');
        fs.writeFileSync(nonInteractivePromptPath, this.generateCopilotPromptNonInteractiveDocument(), 'utf8');

        this.generatedArtifacts.push(instructionsPath, interactivePromptPath, nonInteractivePromptPath);
        console.log(`Generated copilot files under: ${path.dirname(instructionsPath)}`);
    }

    deployArtifacts() {
        const staticArtifacts = this.staticDeployArtifacts
            .map((relPath) => path.join(this.outputDir, relPath))
            .filter((absPath) => fs.existsSync(absPath));
        const artifacts = [...new Set([...this.generatedArtifacts, ...staticArtifacts])];
        fs.mkdirSync(this.deployDir, { recursive: true });
        for (const sourcePath of artifacts) {
            const relPath = path.relative(this.outputDir, sourcePath);
            const safeRelPath = relPath.startsWith('..') ? path.basename(sourcePath) : relPath;
            const targetPath = path.join(this.deployDir, safeRelPath);
            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`Deployed: ${targetPath}`);
        }
    }
}

if (require.main === module) {
    const compiler = new PromptCompiler();
    compiler.parseArgs();
    compiler.compile();
}

module.exports = PromptCompiler;
