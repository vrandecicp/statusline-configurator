# Claude Code Statusline Configurator

**Live at [statusline.vrandecicp.com](https://statusline.vrandecicp.com)**

A client-side web tool that generates a customized bash script for [Claude Code's](https://claude.ai/code) terminal statusline — no manual editing required.

---

## What it does

Claude Code writes live session data to `~/.claude/statusline.json`. This tool lets you pick which fields to show, set a separator, then copies a ready-to-paste bash function that reads that file and prints your statusline.

Drag fields to reorder, toggle them on/off, pick a separator, and copy the generated script — done.

---

## Available fields

| Category | Fields |
|----------|--------|
| **Model** | Model display name, full model ID |
| **Context** | Context % used, % remaining, window size, input tokens, output tokens |
| **Cost** | Total cost (USD), session duration, lines added/removed |
| **Workspace** | Current dir, project dir |
| **Session** | Claude Code version, session ID, output style |
| **Advanced** | Vim mode, agent name, worktree name/branch, exceeds-200k flag |

Conditional fields (vim mode, agent, worktree) are labeled — they only appear in the statusline when the corresponding feature is active.

---

## Using the generated script

1. Copy the generated script from the tool
2. Paste it into your `~/.bashrc` or `~/.zshrc`
3. Add `claude_statusline` to your shell prompt — for example in bash:

```bash
PS1='$(claude_statusline) \$ '
```

The function reads `~/.claude/statusline.json` and prints your chosen fields joined by your chosen separator. If the file doesn't exist (no active session), it prints nothing.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | The configurator |
| `/guide` | Setup guide — how to wire the script into your shell |
| `/agents` | Reference for Claude Code agent patterns |

---

## Tech stack

| | |
|-|---------|
| Framework | Next.js 16 (static export — `output: 'export'`) |
| UI | React 19 + TypeScript + Tailwind CSS 4 |
| Drag-and-drop | dnd-kit |
| Syntax highlight | prism-react-renderer |
| Fonts | IBM Plex Mono + Pixelify Sans |
| Tests | Vitest (4 suites) |
| Deploy | Vercel |

---

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # run all 4 test suites
npm run build    # static export → /out
```

Requires Node 18+.

---

## Project structure

```
src/
  app/           # Next.js app router pages
  components/    # UI components (ConfiguratorRoot, FieldRow, SeparatorPicker, ...)
  lib/           # Pure logic (fields.ts, generator.ts, configurator-state.ts)
  types/         # Shared TypeScript types
tests/           # Vitest test suites
```

---

## License

MIT
