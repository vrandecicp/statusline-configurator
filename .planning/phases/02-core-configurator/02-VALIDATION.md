---
phase: 2
slug: core-configurator
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `statusline-configurator/vitest.config.ts` |
| **Quick run command** | `cd statusline-configurator && npx vitest run` |
| **Full suite command** | `cd statusline-configurator && npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd statusline-configurator && npx vitest run`
- **After every plan wave:** Run `cd statusline-configurator && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | CONF-01 | unit (pure function) | `cd statusline-configurator && npx vitest run` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 0 | CONF-02 | unit (pure function) | `cd statusline-configurator && npx vitest run` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 0 | CONF-04 | unit | `cd statusline-configurator && npx vitest run` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 0 | TECH-03 | unit (extend existing) | `cd statusline-configurator && npx vitest run` | ⚠️ partial | ⬜ pending |
| 02-02-01 | 02 | 1 | CONF-01 | unit | `cd statusline-configurator && npx vitest run` | ✅ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | CONF-02 | unit | `cd statusline-configurator && npx vitest run` | ✅ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | CONF-04 | unit | `cd statusline-configurator && npx vitest run` | ✅ W0 | ⬜ pending |
| 02-03-01 | 03 | 1 | CONF-03 | unit (generatePreview) | `cd statusline-configurator && npx vitest run` | ✅ partial | ⬜ pending |
| 02-03-02 | 03 | 1 | PREV-01 | unit (existing) | `cd statusline-configurator && npx vitest run` | ✅ existing | ⬜ pending |
| 02-03-03 | 03 | 1 | PREV-02 | unit (existing) | `cd statusline-configurator && npx vitest run` | ✅ existing | ⬜ pending |
| 02-03-04 | 03 | 1 | TECH-03 | unit (extended) | `cd statusline-configurator && npx vitest run` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `statusline-configurator/tests/configurator-state.test.ts` — pure-function tests for toggle (CONF-01), moveUp/moveDown (CONF-02), default state `['model_display_name']` (CONF-04)
- [ ] Extend `statusline-configurator/tests/generator.test.ts` — add TECH-03 tests for dash, dot, space, and slash separator single-quote wrapping (pipe already tested)

*Note: Vitest environment is `node` (no jsdom). Component render tests are not viable without adding jsdom. All Wave 0 tests target pure functions extracted from ConfiguratorRoot state logic — no DOM required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live preview updates instantly on toggle | PREV-01 | Requires browser interaction + visual check | Load app, toggle any field, confirm preview updates without delay |
| Disabled arrow renders dimmed (not hidden) | CONF-02 | Visual layout stability check | Enable one field; confirm ↑ is visually dimmed and layout does not shift |
| "(conditional)" tag appears on correct fields | CONF-01 | Visual label check | Verify vim_mode, agent_name, worktree_name, worktree_branch rows show tag |
| Empty state shows in both panels | CONF-01 | Visual check for two surfaces | Toggle all fields off; confirm both active panel and preview show dimmed placeholder |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
