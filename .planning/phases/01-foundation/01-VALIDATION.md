---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (Wave 0 installs) |
| **Config file** | `vitest.config.ts` — Wave 0 creates |
| **Quick run command** | `npx vitest run --reporter=dot` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/fields.test.ts tests/contrast.test.ts --reporter=dot`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green + `next build` producing `out/`
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01-01 | 1 | TECH-01 | smoke | `next build && test -d out` | N/A | ⬜ pending |
| 1-01-02 | 01-01 | 1 | TECH-02 | manual | Browser DevTools — check console for hydration errors | N/A | ⬜ pending |
| 1-01-03 | 01-01 | 0 | DSGN-02 | lint | `npx eslint src/ --ext .tsx,.ts` | ❌ W0 | ⬜ pending |
| 1-02-01 | 01-02 | 0 | CONF-05 | unit | `npx vitest run tests/fields.test.ts` | ❌ W0 | ⬜ pending |
| 1-02-02 | 01-02 | 0 | DSGN-03 | unit | `npx vitest run tests/contrast.test.ts` | ❌ W0 | ⬜ pending |
| 1-02-03 | 01-02 | 1 | DSGN-01 | manual | Browser check — dark bg, monospace font visible | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/fields.test.ts` — stubs for CONF-05: FIELD_DEFINITIONS importability, shape, and completeness
- [ ] `tests/contrast.test.ts` — stubs for DSGN-03: WCAG AA 4.5:1 contrast for all Gruvbox text tokens
- [ ] `vitest.config.ts` — test runner configuration with Next.js/TypeScript support
- [ ] `package.json` test script: `"test": "vitest run"` (if not added by create-next-app scaffold)

*Wave 0 runs before plan 01-01 task execution begins.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No hydration mismatch errors in browser console | TECH-02 | Requires browser runtime; cannot be caught by vitest unit tests | `next build && npx serve out` → open browser → check DevTools console for hydration warnings |
| Dark background and monospace font rendered | DSGN-01 | Visual verification — computed style check not practical in unit tests | Open page in browser; verify dark bg (#282828), JetBrains Mono font in DevTools Elements panel |
| Static `out/` folder produced with no TypeScript errors | TECH-01 | Requires running `next build` end-to-end | Run `next build`; verify `out/` exists and no TypeScript errors appear in build output |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
