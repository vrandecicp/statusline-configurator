# Claude Code Statusline Configurator

## What This Is

A polished web tool for customizing the Claude Code statusline. Users select which fields to display, reorder them with up/down arrows, pick a separator, see a live preview, and copy a ready-to-use bash script to `~/.claude/statusline.sh`. Built to replace the existing rough-around-the-edges configurator with something that feels like a proper dev tool.

## Core Value

Generate a customized statusline script instantly — no manual editing, no guesswork about field names or format.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can select which statusline fields to include via toggles
- [ ] User can reorder selected fields with up/down arrows
- [ ] User can choose a custom separator between fields (pipe, dash, dot, space, etc.)
- [ ] Live preview updates in real-time as user configures
- [ ] Generated bash script updates live and can be copied with one click
- [ ] UI follows a hacker-but-polished terminal aesthetic (dark palette, subtle glows, animations)

### Out of Scope

- Share/permalink URL — deferred to v2, adds complexity for marginal v1 value
- One-click install command — just copying the script is sufficient for v1
- Backend/server — fully static, no API needed
- OAuth/accounts — no persistence needed, stateless tool

## Context

- Reference site: https://claude-code-statusline.on-forge.com/ (functional but rough UI, no reordering)
- Available fields grouped by category:
  - **Context Window**: input tokens, output tokens, window size, usage %, remaining %
  - **Cost**: total USD cost, duration, API call duration, lines added/removed
  - **Model**: model ID, display name
  - **Workspace**: current dir, project dir
  - **Session**: session ID, version
  - **Extra**: git branch
- The generated script reads from stdin and outputs pipe-separated values to Claude Code's statusline

## Constraints

- **Tech Stack**: Next.js + Tailwind — React for interactive state, Tailwind for rapid terminal styling, Vercel for deployment
- **Static Only**: No backend. All logic runs client-side.
- **No Auth**: Stateless tool, no user accounts

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + Tailwind over plain HTML | React state simplifies live preview + reorder interactions | — Pending |
| Up/down arrows over drag-and-drop | Simpler implementation, keyboard-friendly | — Pending |

---
*Last updated: 2026-03-10 after initialization*
