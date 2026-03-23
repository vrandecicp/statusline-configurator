# Roadmap: Claude Code Statusline Configurator

## Overview

A three-phase delivery that starts with a safe, well-structured Next.js foundation (SSR guards, design tokens, field registry), builds the full interactive configurator on top of it (toggles, reorder, separator, live preview), and finishes with the output layer (script display, copy, install instructions) plus aesthetic polish. Each phase is independently verifiable before the next begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Next.js project with SSR safety, design tokens, and field registry in place
- [ ] **Phase 2: Core Configurator** - Field toggles, reorder, separator picker, and live preview all working
- [ ] **Phase 3: Output and Polish** - Script display, one-click copy, install instructions, and terminal aesthetic complete

## Phase Details

### Phase 1: Foundation
**Goal**: A running Next.js project where the SSR boundary is established, design tokens meet WCAG contrast, and the complete field registry exists as the data source for all components
**Depends on**: Nothing (first phase)
**Requirements**: TECH-01, TECH-02, CONF-05, DSGN-01, DSGN-02, DSGN-03
**Success Criteria** (what must be TRUE):
  1. `next build` produces a fully static `out/` folder with zero hydration errors and zero TypeScript errors
  2. The complete FIELD_DEFINITIONS array is importable and contains all supported statusline fields with correct metadata
  3. A rendered page shows the terminal aesthetic (dark background, terminal color palette, monospace font) with all interactive controls using semantic HTML elements
  4. DevTools accessibility audit shows all color tokens pass WCAG AA 4.5:1 contrast against the dark background
**Plans**: 3 plans

Plans:
- [x] 01-00-PLAN.md — Wave 0 test infrastructure: vitest config and RED test stubs for fields and WCAG contrast
- [x] 01-01-PLAN.md — Next.js 15 scaffold, static export config, ClientOnly SSR guard, root layout, page skeleton
- [x] 01-02-PLAN.md — FieldDefinition interface, FIELD_DEFINITIONS registry (21 fields), vitest tests GREEN

### Phase 2: Core Configurator
**Goal**: Users can fully configure their statusline — toggling fields, reordering them, and choosing a separator — with a live preview that updates instantly and reflects a default selection on first load
**Depends on**: Phase 1
**Requirements**: CONF-01, CONF-02, CONF-03, CONF-04, PREV-01, PREV-02, TECH-03
**Success Criteria** (what must be TRUE):
  1. User can toggle any field on or off and see it appear or disappear from the live preview immediately
  2. User can move a selected field up or down using arrow buttons; the up arrow is disabled on the first field and the down arrow is disabled on the last field
  3. User can select a separator from the named preset list (pipe, dash, dot, space, slash) and see the preview update instantly
  4. On first page load, the model name field is already selected and the preview shows a realistic populated example
  5. The generated bash script correctly single-quotes separator characters with shell special meaning (pipe, slash)
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Wave 0 TDD: failing tests for toggle/moveUp/moveDown state logic and TECH-03 separator escaping
- [ ] 02-02-PLAN.md — configurator-state.ts implementation, ConfiguratorRoot, FieldList, FieldRow, ActiveFieldsPanel
- [ ] 02-03-PLAN.md — SeparatorPicker, StatuslinePreview, full page.tsx integration with ClientOnly

### Phase 3: Output and Polish
**Goal**: Users can see the generated script with syntax highlighting, copy it with one click, and know exactly where to save it — with the full terminal aesthetic applied and the build passing cleanly
**Depends on**: Phase 2
**Requirements**: OUTP-01, OUTP-02, OUTP-03, OUTP-04, OUTP-05, OUTP-06
**Success Criteria** (what must be TRUE):
  1. The generated bash script is displayed in a syntax-highlighted code block that updates as the user changes configuration
  2. Clicking the copy button copies the current script to clipboard and shows "Copied!" visual feedback for approximately 2 seconds
  3. If clipboard access fails (non-HTTPS or focus loss), the user sees an error state rather than a false "Copied!" success
  4. Install instructions are visible on the page explaining that the script should be saved to `~/.claude/statusline.sh`
  5. `next build` completes with zero hydration warnings, zero contrast failures, and the output is deployable to Vercel
**Plans**: TBD

Plans:
- [ ] 03-01: `ScriptBlock` with syntax highlighting loaded via `next/dynamic` with `ssr: false`
- [ ] 03-02: `CopyButton` with clipboard error handling, execCommand fallback, and visual confirmation state
- [ ] 03-03: Install instructions, full terminal aesthetic polish (glow borders, entrance animations), and production build verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-03-10 |
| 2. Core Configurator | 1/3 | In Progress|  |
| 3. Output and Polish | 0/3 | Not started | - |
