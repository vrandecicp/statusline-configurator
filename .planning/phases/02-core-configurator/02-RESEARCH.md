# Phase 2: Core Configurator - Research

**Researched:** 2026-03-11
**Domain:** React 19 interactive state management, Next.js 16 'use client' components, Tailwind CSS 4 layout
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Field list layout:** Group fields by category (6 groups: model, context, cost, workspace, session, advanced) with category headers. All categories always expanded — no collapsible sections. Toggle row shows: field label + description. Conditional fields (vim_mode, agent_name, worktree_name, worktree_branch) get a small "(conditional)" tag.
- **Reorder UX:** Two-panel layout side by side: field selector (left) + active fields panel (right) — fits within 900px max-width. Active fields panel shows only enabled fields with ↑/↓ arrow buttons. Disabled arrows (first ↑, last ↓) render dimmed (reduced opacity), not hidden — layout stays stable. Toggling OFF removes from active panel immediately. Toggling back ON appends at bottom.
- **Default selection:** `model_display_name` is the only field pre-selected on first load (satisfies CONF-04). No other defaults.
- **Empty state:** Preview section shows dimmed "[ no fields selected ]" when enabledIds is empty. Active fields panel shows dimmed "[ no fields selected ]" when nothing is enabled. Use `text-muted` token for both.
- **State shape:** `enabledIds: string[]` preserving order — matches what `generatePreview` and `generateScript` expect.
- **Component boundary:** `ConfiguratorRoot` is a `'use client'` component wrapping both sections, managing all shared state. All interactive state wrapped in `ClientOnly` guard.
- **Integration point:** Phase 2 replaces the inner content of the two existing placeholder sections in `page.tsx` (`aria-label="Field configurator"` and `aria-label="Statusline preview"`).

### Claude's Discretion

- Exact Tailwind classes for the two-column grid (responsive breakpoints, gap sizing)
- Animation/transition on field toggle and reorder (subtle, consistent with terminal aesthetic)
- Category header styling (label weight, separator line style)
- Exact "(conditional)" tag styling (size, color token)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONF-01 | User can toggle individual statusline fields on/off | `enabledIds` array state; toggling adds/removes IDs; `generatePreview` consumes the array |
| CONF-02 | User can reorder selected fields using up/down arrow buttons | `enabledIds` array reorder via index swap; `<ol>` in active panel with ↑/↓ `<button>` elements |
| CONF-03 | User can select a separator from named presets (pipe, dash, dot, space, slash) | `SEPARATOR_PRESETS` array already defined in `generator.ts`; separator state drives preview |
| CONF-04 | Model name field is pre-selected by default on page load | Initialize `enabledIds` state as `['model_display_name']` |
| PREV-01 | Live statusline preview updates instantly as user toggles fields, reorders, or changes separator | All state in one parent component; `generatePreview` called inline in render — no debounce needed |
| PREV-02 | Preview displays realistic example values for each field (not placeholder text) | `exampleValue` on each `FieldDefinition` feeds directly into `generatePreview` |
| TECH-03 | Bash script generator correctly escapes special characters in separator values | `generateScript` already wraps separator in single-quoted bash string (`'${separator}'`); verified by existing test |
</phase_requirements>

---

## Summary

Phase 2 is entirely a React state management and rendering task — no new infrastructure, no new libraries required. All the underlying logic (`generatePreview`, `generateScript`, `SEPARATOR_PRESETS`, `FIELD_DEFINITIONS`) is already implemented and tested from Phase 1. The work is wiring interactive state into React components and rendering the two-panel layout.

The core state primitive is `enabledIds: string[]`. It simultaneously encodes which fields are enabled AND their display order, which is exactly the contract `generatePreview` and `generateScript` expect. This simplicity is the key architectural insight: no secondary ordering structure needed.

TECH-03 (bash escaping) is already satisfied by `generateScript`'s single-quote wrapping strategy. The existing `generator.test.ts` already has a test for pipe-separator escaping. Phase 2 needs to verify that the UI correctly passes the separator's `.value` string to the generator function — no special escaping logic needs to be written.

**Primary recommendation:** Create one `'use client'` component (`ConfiguratorRoot`) that holds all state and renders both panels. Keep child components stateless, receiving only props and callbacks.

---

## Standard Stack

### Core (already installed — no new dependencies required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | Interactive state, event handlers | Already installed |
| Next.js | 16.1.6 | App Router, static export | Already installed |
| Tailwind CSS | 4.x | Layout utilities, design tokens | Already installed |

### Optional — Animation

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion | 12.35.2 | Animate field toggle/reorder transitions | Only if animation is added; NOT required for core behavior |

**Peer dep status:** `motion` declares `react: '^18.0.0 || ^19.0.0'` — compatible with React 19.2.3. Verified via `npm show motion peerDependencies`.

**Installation (only if animation is desired):**
```bash
cd statusline-configurator && npm install motion
```

No new packages are needed for the core requirements. Motion is optional and discretionary.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain `useState` array for order | `useReducer` | Reducer adds clarity for complex state transitions but adds boilerplate; `useState` is sufficient for this state shape |
| Two separate `useState` calls (enabledIds + separator) | Single `useReducer` | Either works; keep separate `useState` for simplicity unless actions multiply |

---

## Architecture Patterns

### Component Structure

```
src/
├── app/
│   └── page.tsx               # Renders ConfiguratorRoot inside existing sections
├── components/
│   ├── ClientOnly.tsx          # Existing — use as hydration guard
│   ├── ConfiguratorRoot.tsx    # NEW — 'use client', all shared state lives here
│   ├── FieldList.tsx           # NEW — left panel, grouped by category
│   ├── FieldRow.tsx            # NEW — one field with toggle checkbox/button
│   ├── ActiveFieldsPanel.tsx   # NEW — right panel, ordered list with arrows
│   └── SeparatorPicker.tsx     # NEW — 5-option selector for separator preset
├── lib/
│   ├── fields.ts               # Existing — FIELD_DEFINITIONS
│   └── generator.ts            # Existing — generatePreview, SEPARATOR_PRESETS
└── types/
    └── fields.ts               # Existing — FieldDefinition interface
```

### Pattern 1: Flat State in Root, Props Down

**What:** All mutable state (`enabledIds`, `separatorId`) lives in `ConfiguratorRoot`. Child components receive state slices and callbacks via props only. No context, no global store.

**When to use:** State is simple, shared between exactly two sibling panel subtrees, and the component tree is shallow.

```typescript
// ConfiguratorRoot.tsx
'use client'
import { useState } from 'react'
import { FIELD_DEFINITIONS } from '@/lib/fields'
import { SEPARATOR_PRESETS, generatePreview } from '@/lib/generator'

const DEFAULT_SEPARATOR_ID = 'pipe'

export function ConfiguratorRoot() {
  const [enabledIds, setEnabledIds] = useState<string[]>(['model_display_name'])
  const [separatorId, setSeparatorId] = useState(DEFAULT_SEPARATOR_ID)

  const separator = SEPARATOR_PRESETS.find(s => s.id === separatorId)!.value

  function handleToggle(id: string) {
    setEnabledIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function handleMoveUp(id: string) {
    setEnabledIds(prev => {
      const idx = prev.indexOf(id)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  function handleMoveDown(id: string) {
    setEnabledIds(prev => {
      const idx = prev.indexOf(id)
      if (idx < 0 || idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  const preview = generatePreview(FIELD_DEFINITIONS, enabledIds, separator)

  return (
    <>
      {/* Left: FieldList + SeparatorPicker | Right: ActiveFieldsPanel */}
      {/* Below: PreviewBar */}
    </>
  )
}
```

### Pattern 2: Category Grouping from Data

**What:** Derive category groups at render time from `FIELD_DEFINITIONS`. No separate data structure needed.

```typescript
// In FieldList.tsx
const CATEGORIES = ['model', 'context', 'cost', 'workspace', 'session', 'advanced'] as const

// Group fields by category in category order
const grouped = CATEGORIES.map(cat => ({
  category: cat,
  fields: FIELD_DEFINITIONS.filter(f => f.category === cat),
}))
```

### Pattern 3: Separator Picker as Button Group

**What:** Render `SEPARATOR_PRESETS` as a row of `<button>` elements with active styling. Selected separator gets a distinct ring or background; others remain muted.

```typescript
// In SeparatorPicker.tsx
{SEPARATOR_PRESETS.map(preset => (
  <button
    key={preset.id}
    onClick={() => onSelect(preset.id)}
    aria-pressed={selectedId === preset.id}
    className={selectedId === preset.id
      ? 'bg-surface border-border text-fg ...'
      : 'text-muted ...'}
  >
    {preset.label}
  </button>
))}
```

### Pattern 4: Arrow Button Disabled State

**What:** Pass position info (isFirst, isLast) as props to the active-field row. Render buttons with `disabled` attribute and reduced opacity when at boundary.

```typescript
// Callers pass positional props — children never compute their own position
<ActiveFieldRow
  field={field}
  isFirst={idx === 0}
  isLast={idx === enabledIds.length - 1}
  onMoveUp={handleMoveUp}
  onMoveDown={handleMoveDown}
  onRemove={handleToggle}
/>

// In ActiveFieldRow.tsx
<button
  disabled={isFirst}
  onClick={() => onMoveUp(field.id)}
  className={isFirst ? 'opacity-40 cursor-not-allowed' : 'hover:text-fg'}
  aria-label={`Move ${field.label} up`}
>
  ↑
</button>
```

### Pattern 5: Page.tsx Integration

**What:** `page.tsx` stays a Server Component. `ConfiguratorRoot` is imported and rendered inside the existing `<section>` containers, wrapped in `ClientOnly`.

```typescript
// page.tsx (updated)
import { ClientOnly } from '@/components/ClientOnly'
import { ConfiguratorRoot } from '@/components/ConfiguratorRoot'

// Replace placeholder sections with:
<ClientOnly fallback={<p className="text-muted text-sm">[ loading... ]</p>}>
  <ConfiguratorRoot />
</ClientOnly>
```

Note: `ConfiguratorRoot` can own its own section markup internally, or `page.tsx` can keep the outer `<section>` tags and `ConfiguratorRoot` fills both. The CONTEXT.md recommends the former — `ConfiguratorRoot` replaces the contents of the existing sections.

### Anti-Patterns to Avoid

- **Putting state in leaf components:** Toggle state, separator state, and order must all be co-located in `ConfiguratorRoot`. Lifting state later would require threading callbacks through multiple layers.
- **Using `key` reset to clear active panel:** Do not re-key the active panel on toggle. Manage empty state via conditional rendering with a placeholder.
- **Computing order from a separate Map:** `enabledIds` array order IS the display order. Do not maintain a separate `{ id: string, position: number }[]` structure.
- **Using `<div onClick>` for toggle/arrow controls:** Semantic `<button>` elements are already established as a constraint (DSGN-02).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Separator escape in bash | Custom escape function | `generateScript`'s existing single-quote wrapping | Already implemented and tested; single-quote in bash is safe for all 5 presets |
| Preview text assembly | Custom join logic | `generatePreview` from `generator.ts` | Already implemented, tested, handles empty case |
| Field metadata | Ad-hoc field objects | `FIELD_DEFINITIONS` from `fields.ts` | 21 fields with full metadata already defined |
| Hydration guard | Manual `typeof window` check | `ClientOnly` component | Already implemented, handles SSR/CSR mismatch |

---

## Common Pitfalls

### Pitfall 1: Forgetting the `ClientOnly` Wrapper

**What goes wrong:** Interactive components with `useState` render on the server in Next.js App Router even when marked `'use client'` if they are children of a Server Component that is statically rendered. The initial server render produces a snapshot that mismatches the client hydration state (e.g., `model_display_name` pre-checked).

**Why it happens:** SSR renders the component once with the initial state value, but the client-side React hydration expects the same initial HTML. When state initializes from a computed default, the mismatch can cause flicker or hydration errors.

**How to avoid:** Wrap `ConfiguratorRoot` in the existing `ClientOnly` guard. The `mounted` guard in `ClientOnly` ensures the component only renders after hydration is complete.

**Warning signs:** Console error `Hydration failed because the initial UI does not match what was rendered on the server`.

### Pitfall 2: Stale Closure in State Updaters

**What goes wrong:** Using `setEnabledIds(ids => ...)` functional form for all updates. NOT passing the current state value directly (e.g., `setEnabledIds([...enabledIds, id])`) inside event handlers that might be called in rapid succession.

**Why it happens:** React batches state updates. If you reference `enabledIds` directly inside a callback (non-functional update), you may get stale state.

**How to avoid:** Always use the functional form `setEnabledIds(prev => ...)` for toggle, moveUp, moveDown.

**Warning signs:** Rapid toggle/reorder causes unexpected state (e.g., duplicate IDs, items missing).

### Pitfall 3: Passing Separator `.value` vs. Separator `.id`

**What goes wrong:** Storing `separatorId` (e.g., `'pipe'`) in state but accidentally passing the id string to `generatePreview` / `generateScript` instead of the `.value` string (e.g., `' | '`).

**Why it happens:** The state stores the ID for the button group selection. The generators need the actual separator string.

**How to avoid:** Always resolve the value at the call site: `const separator = SEPARATOR_PRESETS.find(s => s.id === separatorId)!.value`. Do this once in `ConfiguratorRoot` and pass `separator` (the value) down to the preview and script sections.

**Warning signs:** Preview shows "pipe" text literally; bash script contains `'pipe'` instead of `' | '`.

### Pitfall 4: Index-Based Keys in the Active Panel

**What goes wrong:** Using `key={idx}` for the ordered list of active fields. When fields are reordered via array swap, React may reuse the wrong DOM element, causing animation glitches or focus issues.

**How to avoid:** Use `key={field.id}` which is stable across reorders.

### Pitfall 5: TECH-03 — The `dot` Separator Contains a Non-ASCII Character

**What goes wrong:** The `dot` preset's value is `' · '` (Unicode middle dot U+00B7), not an ASCII period. If the code naively checks for "safe ASCII" before quoting, it might mishandle this character.

**Why it happens:** The `generateScript` function uses single-quote wrapping: `'${separator}'`. Single quotes in bash cannot contain a literal single quote. None of the 5 preset values contain a single quote, so this is safe. But developers might try to "fix" it unnecessarily.

**How to avoid:** Leave `generateScript`'s existing quoting strategy unchanged. The existing test (`escapes the pipe separator`) already validates the approach. Phase 2 just needs to pass `separator` (the `.value` string) through cleanly.

**Warning signs:** Test `escapes the pipe separator` in `generator.test.ts` failing after changes to how the separator value flows from the UI.

---

## Code Examples

### Full State Shape and Toggle Logic

```typescript
// Source: Phase 2 specification + CONTEXT.md decisions
const [enabledIds, setEnabledIds] = useState<string[]>(['model_display_name'])
const [separatorId, setSeparatorId] = useState<string>('pipe')

// Toggle: if present, remove; if absent, append to end
function handleToggle(id: string) {
  setEnabledIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )
}

// Move up: swap with previous item
function handleMoveUp(id: string) {
  setEnabledIds(prev => {
    const idx = prev.indexOf(id)
    if (idx <= 0) return prev
    const next = [...prev]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    return next
  })
}

// Move down: swap with next item
function handleMoveDown(id: string) {
  setEnabledIds(prev => {
    const idx = prev.indexOf(id)
    if (idx < 0 || idx >= prev.length - 1) return prev
    const next = [...prev]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    return next
  })
}
```

### Two-Panel Layout (Tailwind CSS 4)

```tsx
// Two-column grid within the existing 900px max-width container
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>{/* FieldList — left column */}</div>
  <div>{/* ActiveFieldsPanel — right column */}</div>
</div>
```

### Empty State Rendering Pattern

```tsx
// Both empty states use text-muted and the same dimmed message
{enabledIds.length === 0 ? (
  <p className="text-muted text-sm">[ no fields selected ]</p>
) : (
  <ol>{/* field rows */}</ol>
)}
```

### Category Header

```tsx
// Category rendered as a labeled section
<div key={cat.category}>
  <h3 className="text-muted text-xs uppercase tracking-wider mb-2 border-b border-border pb-1">
    {cat.category}
  </h3>
  {cat.fields.map(field => (
    <FieldRow key={field.id} field={field} ... />
  ))}
</div>
```

### Conditional Tag

```tsx
// Small "(conditional)" tag on field rows where field.conditional === true
{field.conditional && (
  <span className="text-muted text-xs ml-2">(conditional)</span>
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pages/` directory in Next.js | App Router (`app/`) | Next.js 13+ | All components default to Server Components; interactive state requires explicit `'use client'` |
| Framer Motion | `motion` package (same maintainer, rebranded) | 2024 | Import from `motion/react` not `framer-motion`; same API |
| Tailwind CSS v3 `@apply` and `theme()` | Tailwind CSS 4 `@theme` with CSS variables | 2024-2025 | Design tokens defined as CSS custom properties; no `tailwind.config.js` needed |

**Deprecated/outdated:**
- `framer-motion`: Replaced by `motion` package (v12.x) — same API, same maintainer, new package name. Use `motion` if adding animation.
- `tailwind.config.js` for tokens: In Tailwind 4, tokens go in `globals.css` under `@theme`. Already done in this project.

---

## Open Questions

1. **Animation on reorder/toggle**
   - What we know: Motion v12.35.2 is compatible with React 19; motion supports layout animations (`layout` prop on `motion.li`)
   - What's unclear: Whether layout animations cause issues with the static Next.js export (`output: 'export'`)
   - Recommendation: Motion components are client-only and run in the browser after hydration; static export only affects HTML generation; layout animations should work fine. Discretionary — add if desired.

2. **Separator picker rendering**
   - What we know: SEPARATOR_PRESETS has 5 items; `space` preset's label is "Space" but its value is 3 spaces — visually ambiguous in a button label
   - What's unclear: Whether to show the actual separator character in the button or just the label
   - Recommendation: Show the label ("Space") in the button for clarity; optionally show the literal character in a preview sub-label. Within Claude's discretion.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `statusline-configurator/vitest.config.ts` |
| Quick run command | `cd statusline-configurator && npx vitest run` |
| Full suite command | `cd statusline-configurator && npx vitest run` |

**Note on test environment:** The current vitest config uses `environment: 'node'`. React component tests (if any) would require `environment: 'jsdom'` and `@testing-library/react`. However, Phase 2's testable logic is primarily pure-function and behavioral — the state transition logic (toggle, moveUp, moveDown) can be tested as pure functions extracted from the component, keeping tests in node environment. No new test dependencies are required.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONF-01 | Toggle adds ID to array; toggle again removes it | unit (pure function) | `cd statusline-configurator && npx vitest run` | ❌ Wave 0 |
| CONF-02 | moveUp/moveDown swap IDs at correct indices; boundary conditions (first/last) are no-ops | unit (pure function) | `cd statusline-configurator && npx vitest run` | ❌ Wave 0 |
| CONF-03 | Selecting a separator preset updates preview output | unit (generatePreview) | `cd statusline-configurator && npx vitest run` | Partial — existing generator tests cover separator |
| CONF-04 | Initial `enabledIds` equals `['model_display_name']` | unit | `cd statusline-configurator && npx vitest run` | ❌ Wave 0 |
| PREV-01 | `generatePreview` called with current state returns updated preview | unit (existing) | `cd statusline-configurator && npx vitest run` | Partial — generator.test.ts covers generatePreview |
| PREV-02 | `generatePreview` output contains exampleValue from FIELD_DEFINITIONS | unit (existing) | `cd statusline-configurator && npx vitest run` | Partial — covered by generator.test.ts |
| TECH-03 | `generateScript` wraps all 5 separator values in single quotes correctly | unit (existing + extend) | `cd statusline-configurator && npx vitest run` | Partial — pipe case tested; other 4 separators not |

### Sampling Rate

- **Per task commit:** `cd statusline-configurator && npx vitest run`
- **Per wave merge:** `cd statusline-configurator && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `statusline-configurator/tests/configurator-state.test.ts` — covers CONF-01 (toggle), CONF-02 (moveUp/moveDown), CONF-04 (default state)
- [ ] Extend `statusline-configurator/tests/generator.test.ts` — add TECH-03 tests for dash, dot, space, slash separator escaping (currently only pipe is tested)

---

## Sources

### Primary (HIGH confidence)

- Direct code inspection of `src/lib/fields.ts`, `src/lib/generator.ts`, `src/types/fields.ts`, `src/components/ClientOnly.tsx`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css` — current implementation state
- `statusline-configurator/package.json` — exact versions (React 19.2.3, Next.js 16.1.6, Tailwind 4.x, Vitest 3.2.4)
- `statusline-configurator/vitest.config.ts` — node environment, no jsdom
- `npm show motion peerDependencies` — confirmed React 19 compatibility

### Secondary (MEDIUM confidence)

- `npm show motion version` — current version 12.35.2 (matches framer-motion canonical version)

### Tertiary (LOW confidence)

- None required — all findings grounded in direct code inspection.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies are already installed and version-confirmed
- Architecture: HIGH — patterns derived directly from existing code contracts (`generatePreview` signature, `ClientOnly` guard, existing `page.tsx` structure)
- Pitfalls: HIGH — identified from code inspection (separator id vs. value, hydration guard, key stability)

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable stack; no fast-moving dependencies)
