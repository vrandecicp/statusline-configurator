---
phase: 01-foundation
plan: "02"
subsystem: ui
tags: [typescript, fields-registry, wcag, vitest, next-js]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: Tailwind CSS 4 @theme tokens (Gruvbox palette), src/app/globals.css, next.config.ts with output:export

provides:
  - FieldDefinition TypeScript interface (src/types/fields.ts)
  - FIELD_DEFINITIONS array with 21 Claude Code statusline fields (src/lib/fields.ts)
  - Single data source for all Phase 2 and 3 configurator components

affects: [02-configurator, 03-output]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "FIELD_DEFINITIONS as single source of truth — all components import from src/lib/fields.ts"
    - "FieldDefinition interface with optional conditional flag for session-type-specific fields"
    - "jqPath dot-prefix convention (all paths start with '.') for jq expression compatibility"

key-files:
  created:
    - src/types/fields.ts
    - src/lib/fields.ts
  modified: []

key-decisions:
  - "FIELD_DEFINITIONS array contains exactly 21 fields — no transcript_path (internal), no current_usage sub-fields (covered by percentage fields)"
  - "Fields with conditional: true only appear in certain session types (vim mode, agent, worktree)"
  - "src/lib/fields.ts re-exports FieldDefinition type so consumers only need one import"

patterns-established:
  - "Single import pattern: import { FIELD_DEFINITIONS, type FieldDefinition } from '@/lib/fields'"
  - "Category taxonomy: model | context | cost | workspace | session | advanced"

requirements-completed: [CONF-05, DSGN-01, DSGN-03]

# Metrics
duration: 3min
completed: 2026-03-10
---

# Phase 1 Plan 02: FieldDefinition Interface and FIELD_DEFINITIONS Registry Summary

**21-entry FIELD_DEFINITIONS registry typed with FieldDefinition interface — single data source for all statusline configurator components, backed by 11 GREEN vitest assertions**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-10T19:11:30Z
- **Completed:** 2026-03-10T19:12:30Z
- **Tasks:** 1 (TDD: RED confirmed, GREEN achieved)
- **Files modified:** 2

## Accomplishments

- Created `src/types/fields.ts` exporting FieldDefinition interface with 7 fields (id, label, description, jqPath, exampleValue, category, optional conditional)
- Created `src/lib/fields.ts` exporting FIELD_DEFINITIONS array with all 21 Claude Code statusline fields covering model, context, cost, workspace, session, and advanced categories
- All 11 vitest assertions GREEN: 5 in fields.test.ts (array check, 21 IDs, shape, categories, jqPath dots) + 6 in contrast.test.ts (5 text tokens pass WCAG AA 4.5:1, border documented as exempt)
- `next build` still exits 0 and `out/` still produced

## Task Commits

1. **Task 1: Create FieldDefinition interface and FIELD_DEFINITIONS registry** - `d53b37c` (feat)

## Files Created/Modified

- `src/types/fields.ts` - FieldDefinition TypeScript interface with 7 fields including optional conditional flag
- `src/lib/fields.ts` - FIELD_DEFINITIONS array (21 entries) re-exporting FieldDefinition type for single-import convenience

## Decisions Made

- Re-export `FieldDefinition` type from `src/lib/fields.ts` so consumers can use a single import path instead of two separate imports
- Fields `vim_mode`, `agent_name`, `worktree_name`, `worktree_branch` marked `conditional: true` — absent in standard sessions
- `exceeds_200k` has no `conditional` flag (always present in schema output)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- FIELD_DEFINITIONS is importable as `import { FIELD_DEFINITIONS } from '@/lib/fields'` or `'../src/lib/fields'`
- All Phase 2 configurator components have a stable, typed data source
- Concern from STATE.md still applies: verify jq paths against actual Claude Code runtime JSON before finalizing output script generation in Phase 3

## Self-Check: PASSED

- FOUND: src/types/fields.ts
- FOUND: src/lib/fields.ts
- FOUND: 01-02-SUMMARY.md
- FOUND: commit d53b37c

---
*Phase: 01-foundation*
*Completed: 2026-03-10*
