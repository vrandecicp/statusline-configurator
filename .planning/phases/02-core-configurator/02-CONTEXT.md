# Phase 2: Core Configurator - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can toggle statusline fields on/off, reorder enabled fields with up/down arrows, and select a separator preset — with a live preview that updates instantly and reflects a default selection on first load. Script output and copy functionality are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Field list layout
- Group fields by category (6 groups: model, context, cost, workspace, session, advanced) with category headers
- All categories always expanded — no collapsible sections
- Toggle row shows: field label + description (e.g., "Model  Current model display name")
- Conditional fields (vim_mode, agent_name, worktree_name, worktree_branch) get a small "(conditional)" tag on their row to communicate they may be empty in standard sessions

### Reorder UX
- Two-panel layout side by side: field selector (left) + active fields panel (right) — fits within 900px max-width
- Active fields panel shows only enabled fields in their current order, each with ↑/↓ arrow buttons
- Disabled arrow (first item's ↑, last item's ↓) renders dimmed (reduced opacity), not hidden — layout stays stable
- Toggling a field OFF removes it immediately from the active panel
- Toggling a field back ON appends it at the bottom of the active list

### Default selection
- model_display_name is the only field pre-selected on first load (satisfies CONF-04)
- No other default selections

### Empty state
- Preview section: shows dimmed hint text "[ no fields selected ]" when enabledIds is empty
- Active fields panel: shows dimmed placeholder text "[ no fields selected ]" when nothing is enabled
- Consistent treatment across both empty surfaces

### Claude's Discretion
- Exact Tailwind classes for the two-column grid (responsive breakpoints, gap sizing)
- Animation/transition on field toggle and reorder (subtle, consistent with terminal aesthetic)
- Category header styling (label weight, separator line style)
- Exact "(conditional)" tag styling (size, color token)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ClientOnly` (src/components/ClientOnly.tsx): All interactive state must be wrapped in this guard to prevent hydration mismatch errors
- `FIELD_DEFINITIONS` (src/lib/fields.ts): 21 fields, each with id, label, description, jqPath, exampleValue, category, conditional?
- `generatePreview` / `generateScript` / `SEPARATOR_PRESETS` (src/lib/generator.ts): Pure functions ready to consume — no wiring yet
- `FieldDefinition` type (src/types/fields.ts): Interface for all field objects

### Established Patterns
- Tailwind tokens in use: `bg-bg`, `bg-surface`, `text-fg`, `text-muted`, `border-border`, `rounded-panel` — use these for all new components
- Font: JetBrains Mono via `font-mono` utility (set on body in layout.tsx)
- Semantic HTML established as constraint (Phase 1) — use `<button>` not `<div onClick>`
- WCAG AA contrast established — maintain 4.5:1 minimum in new components

### Integration Points
- `page.tsx` has placeholder sections: `aria-label="Field configurator"` and `aria-label="Statusline preview"` — Phase 2 replaces their contents
- `ConfiguratorRoot` (to be created) should be a `'use client'` component wrapping both sections, managing all shared state (enabledIds, separator)
- State shape: `enabledIds: string[]` preserving order is the natural choice given `generatePreview` and `generateScript` expect this

</code_context>

<specifics>
## Specific Ideas

- Reference layout: two-column split within the existing `<section aria-label="Field configurator">` container
- The active-fields panel right column is essentially a mini ordered list — `<ol>` with each item having two arrow `<button>` elements and the field label
- Dimmed empty state text should use `text-muted` token (already defined)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-core-configurator*
*Context gathered: 2026-03-11*
