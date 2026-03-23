# Architecture Research

**Domain:** Interactive web configurator / code generator (static, client-only)
**Researched:** 2026-03-10
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js App Router (SSR shell)              │
│   page.tsx — Server Component, renders static chrome            │
├─────────────────────────────────────────────────────────────────┤
│                  ConfiguratorRoot  'use client'                  │
│   Owns all state. Single client boundary at top of feature.     │
├────────────────┬───────────────────┬────────────────────────────┤
│  FieldSelector │  SeparatorPicker  │     OutputPanel            │
│                │                   │  ┌──────────────────────┐  │
│  FieldList     │  RadioGroup or    │  │  StatuslinePreview   │  │
│   ToggleRow ×N │  custom input     │  ├──────────────────────┤  │
│   ReorderBtn   │                   │  │  ScriptBlock         │  │
│                │                   │  │   (syntax-highlight) │  │
│                │                   │  │   CopyButton         │  │
└────────────────┴───────────────────┴──┴──────────────────────┘─┘
         │                  │                        ↑
         └──────────────────┴────────────────────────┘
                    state reads / dispatch calls
                    (all flows through ConfiguratorRoot)
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `page.tsx` | Static page shell, SEO metadata, imports ConfiguratorRoot | ConfiguratorRoot (props only) |
| `ConfiguratorRoot` | Owns all state (enabled fields, order, separator); derives preview/script | All children via props + callbacks |
| `FieldSelector` | Renders toggle rows and reorder buttons for all fields | ConfiguratorRoot via callbacks |
| `ToggleRow` | Single field row: checkbox, label, up/down arrows | FieldSelector |
| `SeparatorPicker` | Renders separator options; fires onChange | ConfiguratorRoot via callback |
| `StatuslinePreview` | Renders the live preview string in a terminal-styled block | Pure: receives `previewString` prop |
| `ScriptBlock` | Renders generated bash script with syntax highlighting | Pure: receives `scriptString` prop |
| `CopyButton` | Writes to clipboard; manages "Copied!" feedback state | ScriptBlock (or sibling) |
| `FIELD_DEFINITIONS` | Static config array — not a component, the source of truth | Imported by ConfiguratorRoot |

## Recommended Project Structure

```
src/
├── app/
│   ├── page.tsx              # Server Component shell — renders ConfiguratorRoot
│   ├── layout.tsx            # Font, global styles, metadata
│   └── globals.css           # Tailwind base imports
│
├── components/
│   ├── configurator/
│   │   ├── ConfiguratorRoot.tsx    # 'use client' — all state lives here
│   │   ├── FieldSelector.tsx       # List of toggle rows
│   │   ├── ToggleRow.tsx           # Individual field row
│   │   ├── SeparatorPicker.tsx     # Separator UI
│   │   ├── StatuslinePreview.tsx   # Live preview display
│   │   ├── ScriptBlock.tsx         # Highlighted script output
│   │   └── CopyButton.tsx          # Clipboard interaction
│   └── ui/
│       └── TerminalFrame.tsx       # Shared styled container (terminal chrome)
│
├── data/
│   └── fields.ts             # FIELD_DEFINITIONS — the authoritative config array
│
└── lib/
    ├── generateScript.ts     # Pure fn: (FieldConfig[], separator) => string
    ├── generatePreview.ts    # Pure fn: (FieldConfig[], separator) => string
    └── exampleValues.ts      # Hardcoded example values for preview rendering
```

### Structure Rationale

- **`components/configurator/`:** All configurator-specific components co-located. Easy to find, easy to delete if the feature changes.
- **`data/fields.ts`:** Separating field definitions from components makes it trivially easy to add or change fields without touching UI code.
- **`lib/`:** Pure functions with no React imports. Independently testable. Script generation logic stays out of component trees.
- **`components/ui/`:** Reusable presentational primitives (the terminal frame styling) that don't carry business logic.

## Architectural Patterns

### Pattern 1: Data-Driven Field Configuration

**What:** Define all fields as a typed array of config objects. Components iterate the array — they never hardcode field names.

**When to use:** Whenever the set of items is enumerable and uniform. This is the right call here because all fields share the same shape (id, label, category, jq path, example value, format hint).

**Trade-offs:** Slightly more upfront work defining types. Pays off immediately when adding fields or changing labels — one place to change.

**Example:**
```typescript
// data/fields.ts
export interface FieldConfig {
  id: string               // used as key and in script generation
  label: string            // display name
  category: string         // groups fields in the UI
  jqPath: string           // e.g. '.context_window.total_input_tokens'
  exampleValue: string     // what the preview renders
  format?: 'currency' | 'percent' | 'number' | 'string'
}

export const FIELD_DEFINITIONS: FieldConfig[] = [
  {
    id: 'input_tokens',
    label: 'Input Tokens',
    category: 'Context Window',
    jqPath: '.context_window.total_input_tokens',
    exampleValue: '12847',
    format: 'number',
  },
  // ... all other fields
]
```

### Pattern 2: Single Client Boundary with Lifted State

**What:** Mark exactly one component `'use client'` at the root of the interactive subtree. All state lives there. Children are pure presentational components receiving props and callbacks.

**When to use:** This is the correct Next.js App Router pattern for a self-contained interactive feature on an otherwise static page.

**Trade-offs:** `ConfiguratorRoot` becomes a somewhat large component. This is acceptable — it's the coordination layer, not a UI component. Do not split state across multiple client components; prop drilling two levels deep is cheaper than introducing context for a tool this size.

**Example:**
```typescript
// components/configurator/ConfiguratorRoot.tsx
'use client'

import { useState, useCallback, useMemo } from 'react'
import { FIELD_DEFINITIONS } from '@/data/fields'
import { generateScript } from '@/lib/generateScript'
import { generatePreview } from '@/lib/generatePreview'

export function ConfiguratorRoot() {
  // Enabled field IDs (order matters — array determines display order)
  const [enabledIds, setEnabledIds] = useState<string[]>(
    FIELD_DEFINITIONS.map((f) => f.id)
  )
  const [separator, setSeparator] = useState(' | ')

  const enabledFields = useMemo(
    () => enabledIds.flatMap((id) => FIELD_DEFINITIONS.filter((f) => f.id === id)),
    [enabledIds]
  )

  const script = useMemo(
    () => generateScript(enabledFields, separator),
    [enabledFields, separator]
  )

  const preview = useMemo(
    () => generatePreview(enabledFields, separator),
    [enabledFields, separator]
  )

  // ... handlers for toggle, reorder, separator change
}
```

### Pattern 3: Pure Function Code Generation

**What:** Script generation is a plain TypeScript function with no side effects. Input: selected field configs + separator. Output: bash script string.

**When to use:** Always separate generation logic from rendering logic. This makes the core functionality independently testable without mounting any React component.

**Trade-offs:** None. This is strictly better than inlining generation in a component or event handler.

**Example:**
```typescript
// lib/generateScript.ts
export function generateScript(fields: FieldConfig[], separator: string): string {
  const varDeclarations = fields.map((f) => {
    const varName = f.id.toUpperCase()
    return `${varName}=$(echo "$INPUT" | jq -r '${f.jqPath}')`
  }).join('\n')

  const echoLine = fields
    .map((f) => `$${f.id.toUpperCase()}`)
    .join(`${separator}`)

  return [
    '#!/usr/bin/env bash',
    'INPUT=$(cat)',
    varDeclarations,
    `echo "${echoLine}"`,
  ].join('\n')
}
```

## Data Flow

### Configuration Change Flow

```
User toggles field / reorders / changes separator
    ↓
ConfiguratorRoot event handler (setEnabledIds / setSeparator)
    ↓
React re-render triggered
    ↓
useMemo recomputes enabledFields → script → preview
    ↓
Props flow down to FieldSelector, StatuslinePreview, ScriptBlock
    ↓
UI updates synchronously (no async, no API)
```

### Copy Flow

```
User clicks CopyButton
    ↓
navigator.clipboard.writeText(scriptString)
    ↓
CopyButton local useState: 'Copied!' feedback
    ↓
setTimeout resets to 'Copy' after ~2s
```

### State Shape

```
ConfiguratorRoot state:
  enabledIds: string[]    // ordered array — order = display order
  separator: string       // current separator character/string

Derived (useMemo, no extra state):
  enabledFields: FieldConfig[]   // subset of FIELD_DEFINITIONS, in enabledIds order
  script: string                 // bash script string
  preview: string                // preview line string
```

### Key Design Decision: Order via Array

Representing field order as an ordered array of IDs (not a `position` integer on each field) is the correct approach. Reordering is a splice operation on the array — no index arithmetic, no gaps, no normalization needed.

```
Move field up:   swap enabledIds[i] with enabledIds[i-1]
Move field down: swap enabledIds[i] with enabledIds[i+1]
Toggle off:      remove id from enabledIds
Toggle on:       append id to enabledIds
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 configurator page | Current architecture — useState in root, pure functions, no state library |
| Add URL sharing (v2) | Serialize enabledIds + separator to query string via `useSearchParams`. No state library needed — Next.js router handles this. |
| Multiple configurator tools | Extract ConfiguratorRoot to a generic `<FieldConfigurator fields={...} generateFn={...}>` and pass tool-specific data as props |
| Persistence across sessions | Add `localStorage` hydration in a `useEffect` in ConfiguratorRoot. One-time addition, no architectural change. |

### Scaling Priorities

1. **First bottleneck:** If `generateScript` becomes complex (conditional formatting, multiple output formats), extract a `ScriptGenerator` class with a `build()` method. Currently overkill.
2. **Second bottleneck:** If the field list exceeds ~50 items, virtualize the `FieldSelector` list with `react-window`. Unlikely for this domain.

## Anti-Patterns

### Anti-Pattern 1: DOM as State (the reference site's approach)

**What people do:** Store configuration state in DOM attributes (`data-field`, `checked`), then query the DOM to derive the current selection at generation time.

**Why it's wrong:** Order is not reliably derivable from the DOM. State is invisible to React, making debugging impossible. Reordering requires DOM manipulation which React will undo on re-render. The reference site cannot support reordering for exactly this reason.

**Do this instead:** Store enabledIds as a React state array. DOM reflects state; state does not live in the DOM.

### Anti-Pattern 2: Zustand or Redux for This Scale

**What people do:** Reach for a state management library because the app has "multiple components that share state."

**Why it's wrong:** The state is simple (two values: an array of strings and a string), the component tree is shallow (two to three levels), and there is no async. Adding Zustand costs a dependency, a store file, and mental overhead for zero benefit at this scale.

**Do this instead:** `useState` in `ConfiguratorRoot` with props passed to children. If prop drilling exceeds three levels, use React Context — not Zustand.

### Anti-Pattern 3: Regenerating Script in Every Component

**What people do:** Call `generateScript()` inside `ScriptBlock`, `generatePreview()` inside `StatuslinePreview`, each taking slightly different inputs.

**Why it's wrong:** Script generation becomes duplicated, harder to test, and can drift out of sync between preview and script output.

**Do this instead:** Generate once in `ConfiguratorRoot` via `useMemo`, pass the resulting string as a prop. Generation is centralized; display components are pure.

### Anti-Pattern 4: Hardcoding Fields in Components

**What people do:** Write `<ToggleRow label="Input Tokens" id="input_tokens" ... />` inline in `FieldSelector`.

**Why it's wrong:** Adding a field requires editing a component file, not a data file. Category grouping requires more complex component logic. Field IDs appear in multiple places (component, script generator, preview) with no single source of truth.

**Do this instead:** `FIELD_DEFINITIONS` array in `data/fields.ts`. Components map over it.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Clipboard API | `navigator.clipboard.writeText()` in CopyButton | Requires HTTPS (fine on Vercel). Handle `DOMException` for denied permission. |
| Vercel (deploy) | Static export via Next.js — zero config | No edge functions or API routes needed. `output: 'export'` or default Vercel Next.js deployment both work. |
| Syntax highlighter | Import `shiki` or `prism-react-renderer` as a client-side library | Shiki is preferred for accuracy; can be loaded lazily since it's below the fold. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `data/fields.ts` → `ConfiguratorRoot` | Direct import (static data) | `FIELD_DEFINITIONS` is imported at module load, not fetched |
| `ConfiguratorRoot` → `FieldSelector` | Props: `fields`, `enabledIds`, `onToggle`, `onMoveUp`, `onMoveDown` | No context — props are shallow enough |
| `ConfiguratorRoot` → `OutputPanel` | Props: `preview`, `script` | Pure display components; no callbacks needed |
| `lib/generateScript.ts` → `ConfiguratorRoot` | Called inside `useMemo` | Pure function, no side effects |

## Build Order (Phase Implications)

Components have clear dependencies. Build in this order:

1. **`data/fields.ts`** — No dependencies. Define all field configs first. Everything else imports this.
2. **`lib/generateScript.ts` + `lib/generatePreview.ts`** — No React deps. Pure functions. Can be tested in isolation before any UI exists.
3. **`ConfiguratorRoot`** — Wires state to derived values. Needs fields.ts and lib functions.
4. **`FieldSelector` + `ToggleRow`** — Needs ConfiguratorRoot's callback signatures to be defined.
5. **`SeparatorPicker`** — Simple controlled input, no dependencies.
6. **`StatuslinePreview` + `ScriptBlock`** — Purely display. Can be stubbed with a `<pre>{script}</pre>` then enhanced with syntax highlighting last.
7. **`CopyButton`** — Last, as it's a UX enhancement on top of a working ScriptBlock.

## Sources

- Next.js App Router Client/Server component documentation: https://nextjs.org/docs/app/building-your-application/rendering/client-components (verified 2026-02-27, HIGH confidence)
- Reference site analysis: https://claude-code-statusline.on-forge.com/ — direct inspection of the existing tool's architecture (HIGH confidence — primary source for what we are replacing)
- React useState/useMemo patterns: training data + confirmed against Next.js docs (MEDIUM confidence — well-established React patterns, unlikely to have changed)
- Clipboard API: MDN-documented standard browser API (HIGH confidence)

---
*Architecture research for: Claude Code Statusline Configurator (interactive web configurator, static/client-only)*
*Researched: 2026-03-10*
