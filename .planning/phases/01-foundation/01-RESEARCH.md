# Phase 1: Foundation - Research

**Researched:** 2026-03-10
**Domain:** Next.js 15 / Tailwind CSS 4 / React 19 / SSR patterns / WCAG color contrast
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Base palette: **Gruvbox Dark**
- Page background: `#282828` (Gruvbox medium dark)
- Surface/card background: `#1d2021` (Gruvbox hard dark)
- Primary accent: `#fabd2f` (Gruvbox yellow) — active toggles, selected fields, hover/focus
- Secondary accent: `#fe8019` (Gruvbox orange)
- Aqua: `#8ec07c` — tertiary color
- Text primary: `#ebdbb2` (Gruvbox fg)
- Text muted: `#a89984` (Gruvbox gray)
- Border: `#504945` (Gruvbox bg3) — single-pixel borders for surfaces
- All tokens must pass WCAG AA 4.5:1 against `#282828`
- Glow effects use neutral/white at low opacity — NOT yellow accent
- Yellow reserved for foreground active-state color (text/border), not glow
- Aesthetic: refined terminal — dark UI with terminal DNA, NOT raw/CRT/scanlines
- No scanline textures, no blinking cursor, no phosphor effects
- Font: **JetBrains Mono** via Google Fonts / next/font, applied globally
- Layout: centered single column, max-width ~900px
- Single-pixel borders using `#504945` for panels and cards
- No box-drawing character borders in HTML
- Subtle rounding 4–6px consistent with terminal feel

### Claude's Discretion
- Exact spacing scale and padding values
- Tailwind CSS 4 custom property naming convention for Gruvbox tokens
- Which Claude Code statusline fields to include in FIELD_DEFINITIONS
- FIELD_DEFINITIONS metadata shape (label, description, example value, jq path)
- SSR boundary implementation approach (context provider vs component-level guard)
- Mounted guard pattern (useState + useEffect vs library)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TECH-01 | Site is fully static (no backend, no API calls at runtime) | Next.js `output: 'export'` config; static export limitations documented |
| TECH-02 | No hydration mismatch errors (SSR boundary and mounted guard established) | Mounted guard pattern (useState + useEffect) verified; `suppressHydrationWarning` option documented |
| CONF-05 | All field definitions are data-driven from a single source (fields registry) | Full FIELD_DEFINITIONS schema derived from official Claude Code statusline docs |
| DSGN-01 | UI uses a hacker-but-polished terminal aesthetic (dark background, terminal color palette, monospace font) | JetBrains Mono via next/font/google verified; Tailwind @theme token setup documented |
| DSGN-02 | All interactive controls use semantic HTML elements | Native HTML semantic elements; Tailwind utility classes for styling |
| DSGN-03 | Color tokens meet WCAG AA contrast requirements (4.5:1 minimum) | Contrast ratios calculated and verified; `#504945` border noted as non-text element (exempt) |
</phase_requirements>

---

## Summary

Phase 1 sets up a fully static Next.js 15 App Router project with Tailwind CSS 4, JetBrains Mono, Gruvbox design tokens, an SSR hydration guard, and the complete FIELD_DEFINITIONS registry. All research areas have high-confidence sources (official Next.js docs, official Tailwind docs, official Claude Code statusline docs).

The critical pieces are: (1) `output: 'export'` in `next.config.ts` with `images.unoptimized: true` for static builds; (2) Tailwind 4's `@theme` directive in `globals.css` replaces the old `tailwind.config.js` design token approach; (3) a simple `useState(false)` + `useEffect(() => setMounted(true), [])` pattern is the standard mounted guard; (4) the complete Claude Code statusline JSON schema is officially documented with 15+ distinct fields.

Notably, the `#504945` border color does NOT pass WCAG 4.5:1 as text (ratio 1.67:1), but this is expected — it is used only as a non-text border/separator element, which is exempt from the 4.5:1 text contrast requirement. All text-bearing tokens pass comfortably.

**Primary recommendation:** Scaffold with `create-next-app` using TypeScript + Tailwind 4, then immediately establish the hydration guard and token system before writing any component code — all downstream phases depend on both.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.x | App framework, static export, SSR | Project decision; latest stable |
| react | 19.x | UI library | Bundled with Next.js 15 |
| typescript | 5.x | Type safety | Project decision |
| tailwindcss | 4.x | Utility CSS with CSS-first token system | Project decision |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/react | 19.x | TypeScript types for React 19 | Auto-installed with Next.js 15 |
| @types/node | 22.x | TypeScript types for Node | Auto-installed with Next.js 15 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `next/font/google` for JetBrains Mono | `@fontsource/jetbrains-mono` npm package | next/font self-hosts and zero-CLS; fontsource is simpler but no built-in CLS elimination |
| `useState` + `useEffect` mounted guard | `next/dynamic` with `ssr: false` | Dynamic import is heavier; mounted guard is lighter and more composable |
| CSS `@theme` tokens | CSS variables in a separate `:root` block | `@theme` is the Tailwind 4 standard; separate `:root` misses Tailwind utility generation |

**Installation (after `create-next-app`):**
```bash
# create-next-app handles next, react, typescript, tailwind when prompted
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout: font, html class, body bg
│   ├── page.tsx            # Single page with all three sections
│   └── globals.css         # @import "tailwindcss", @theme tokens, base styles
├── components/
│   ├── ClientOnly.tsx      # Mounted guard wrapper (TECH-02)
│   └── layout/
│       └── PageShell.tsx   # Centered max-width container
├── lib/
│   └── fields.ts           # FIELD_DEFINITIONS registry (CONF-05)
└── types/
    └── fields.ts           # FieldDefinition TypeScript interface
```

### Pattern 1: Static Export Configuration

**What:** `next.config.ts` with `output: 'export'` and `images.unoptimized: true`
**When to use:** Any fully static site with no server-side runtime

```typescript
// Source: https://nextjs.org/docs/app/guides/static-exports
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // required: default image optimizer unsupported in static export
  },
  // trailingSlash: true, // optional: for hosting on static file servers
}

export default nextConfig
```

**Gotchas:**
- `next/image` default optimizer is unsupported — must add `images.unoptimized: true`
- Server Actions are unsupported (not needed for this project)
- Cookies, rewrites, redirects, ISR, and draft mode are unsupported
- Build output lands in `out/` directory by default

### Pattern 2: Tailwind CSS 4 with @theme Design Tokens

**What:** Define Gruvbox tokens in `globals.css` using `@theme`; Tailwind generates utility classes from them
**When to use:** Any project needing custom design tokens with Tailwind 4

```css
/* Source: https://tailwindcss.com/blog/tailwindcss-v4 */
/* src/app/globals.css */

@import "tailwindcss";

@theme {
  /* Gruvbox Dark palette */
  --color-bg:       #282828;
  --color-surface:  #1d2021;
  --color-border:   #504945;
  --color-fg:       #ebdbb2;
  --color-muted:    #a89984;
  --color-yellow:   #fabd2f;
  --color-orange:   #fe8019;
  --color-aqua:     #8ec07c;

  /* Typography */
  --font-mono: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;

  /* Border radius */
  --radius-panel: 4px;
}
```

After this, Tailwind auto-generates classes like `bg-bg`, `text-fg`, `border-border`, `text-yellow`, `font-mono`, `rounded-panel`.

**Key difference from Tailwind 3:** No `tailwind.config.js` required. No `theme.extend.colors`. No `@tailwind base/components/utilities` directives. Just `@import "tailwindcss"` and `@theme {}`.

### Pattern 3: Mounted Guard (SSR Hydration Safety)

**What:** Component-level guard that returns `null` on the server and renders children only after client hydration
**When to use:** Any component that reads `window`, `localStorage`, or has client-state that differs from server render (TECH-02)

```typescript
// Source: Next.js docs hydration error prevention
// src/components/ClientOnly.tsx
'use client'

import { useEffect, useState } from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback = null }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <>{fallback}</>
  return <>{children}</>
}
```

Usage: wrap any component that could cause hydration mismatch.

### Pattern 4: JetBrains Mono via next/font/google

**What:** Self-hosted Google Font with zero layout shift, applied globally
**When to use:** Root layout to apply font to entire app

```typescript
// Source: https://nextjs.org/docs/app/getting-started/fonts
// src/app/layout.tsx
import { JetBrains_Mono } from 'next/font/google'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',  // exposes as CSS variable
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="bg-bg text-fg font-mono min-h-screen">
        {children}
      </body>
    </html>
  )
}
```

The `variable: '--font-jetbrains-mono'` option makes the font available as a CSS custom property. The `@theme` token `--font-mono: var(--font-jetbrains-mono)` then wires it into Tailwind's `font-mono` class.

### Anti-Patterns to Avoid

- **Accessing `window` or `localStorage` directly in component body:** This runs during SSR where those APIs don't exist. Always wrap in `useEffect` or use `ClientOnly`.
- **`typeof window !== 'undefined'` checks in render:** Works but produces a flash. The mounted-state pattern is cleaner.
- **Adding `tailwind.config.js` alongside Tailwind 4 for token overrides:** Tailwind 4 auto-detects CSS config; a JS config file may conflict or be ignored silently.
- **`next export` command:** Removed since Next.js 14. Use `output: 'export'` in config + `next build`.
- **`@tailwind base/components/utilities` directives:** These are Tailwind 3 syntax. Tailwind 4 uses `@import "tailwindcss"`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading with CLS prevention | Custom `<link rel="preload">` | `next/font/google` | Handles font-display, preloading, self-hosting, and zero-layout-shift automatically |
| Design token CSS variables | Manual `:root { --color: ... }` blocks | Tailwind 4 `@theme` | `@theme` generates utility classes AND CSS variables in one step |
| Hydration safety | Complex `typeof window` guards | `ClientOnly` wrapper with `useState`/`useEffect` | Simpler, composable, eliminates flash |
| WCAG contrast checking | Manual hex math in browser | Node.js relative luminance formula (or DevTools audit) | Already verified for this project (see table below) |

---

## WCAG Contrast Verification

All text-bearing Gruvbox tokens verified via WCAG 2.1 relative luminance formula against `#282828` background:

| Token | Hex | Ratio vs #282828 | WCAG AA Normal (4.5:1) | WCAG AA Large (3:1) |
|-------|-----|------------------|------------------------|---------------------|
| yellow (accent) | `#fabd2f` | **8.69:1** | PASS | PASS |
| fg (text primary) | `#ebdbb2` | **10.75:1** | PASS | PASS |
| muted (text secondary) | `#a89984` | **5.30:1** | PASS | PASS |
| orange (accent) | `#fe8019` | **5.84:1** | PASS | PASS |
| aqua (tertiary) | `#8ec07c` | **7.01:1** | PASS | PASS |
| border | `#504945` | 1.67:1 | N/A — non-text element | N/A |

**Note:** `#504945` border fails 4.5:1 — but WCAG 1.4.3 applies only to text and images of text. Non-text UI components (borders, dividers) are covered by WCAG 1.4.11 (Non-text Contrast) which requires 3:1 against adjacent colors. The border color does not serve as text and is exempt from the 4.5:1 requirement. DSGN-03 is satisfied for all text tokens.

---

## Common Pitfalls

### Pitfall 1: Image Optimization in Static Export

**What goes wrong:** `next build` fails with "Error: Image Optimization using the default loader is not compatible with `{ output: 'export' }`"
**Why it happens:** The default Next.js image optimizer requires a server to resize images on demand.
**How to avoid:** Add `images: { unoptimized: true }` to `next.config.ts`.
**Warning signs:** Error appears at build time, not dev time.

### Pitfall 2: Server Actions in Static Export

**What goes wrong:** Components with `'use server'` or forms using Server Actions fail at build time.
**Why it happens:** Server Actions require a Node.js runtime.
**How to avoid:** Don't use Server Actions anywhere in this project — all state is client-side.
**Warning signs:** Build-time error mentioning `"Server Actions are not supported with static export"`.

### Pitfall 3: Hydration Mismatch from Browser Extensions

**What goes wrong:** `cz-shortcut-listen="true"` or other attributes appear on `<html>` injected by browser extensions, causing React 19's stricter hydration to throw errors.
**Why it happens:** React 19 tightened hydration error reporting; extension-injected attributes didn't matter before.
**How to avoid:** Add `suppressHydrationWarning` to the `<html>` element in `layout.tsx`.
**Warning signs:** Hydration error in console about attribute mismatch on `<html>` element.

### Pitfall 4: Tailwind 4 `@theme` Token Naming

**What goes wrong:** Tailwind utility classes don't generate if token names use invalid separators (e.g., `--color-bg-dark` works, `--bg-dark` without category prefix may not generate expected classes).
**Why it happens:** Tailwind 4 uses token naming conventions to determine utility class prefix.
**How to avoid:** Use `--color-*` prefix for colors (generates `bg-*`, `text-*`, `border-*`), `--font-*` for fonts (generates `font-*`).
**Warning signs:** Token defined in `@theme` but no matching utility class exists at runtime.

### Pitfall 5: JetBrains Mono variable vs className

**What goes wrong:** Font applies to one component but not globally.
**Why it happens:** Using `jetbrainsMono.className` on `<html>` applies the class but doesn't expose the CSS variable for `--font-mono` to reference.
**How to avoid:** Use `variable: '--font-jetbrains-mono'` in the font config AND apply `jetbrainsMono.variable` as the class on `<html>`, then define `--font-mono: var(--font-jetbrains-mono)` in `@theme`.
**Warning signs:** `font-mono` utility class has no effect despite font loading.

---

## FIELD_DEFINITIONS Registry

The complete JSON schema is sourced from the official Claude Code statusline documentation. All fields below are definitively supported as of the current docs (last updated 2026-02-27).

### Full JSON Schema Structure

```json
{
  "cwd": "/current/working/directory",
  "session_id": "abc123...",
  "transcript_path": "/path/to/transcript.jsonl",
  "model": {
    "id": "claude-opus-4-6",
    "display_name": "Opus"
  },
  "workspace": {
    "current_dir": "/current/working/directory",
    "project_dir": "/original/project/directory"
  },
  "version": "1.0.80",
  "output_style": {
    "name": "default"
  },
  "cost": {
    "total_cost_usd": 0.01234,
    "total_duration_ms": 45000,
    "total_api_duration_ms": 2300,
    "total_lines_added": 156,
    "total_lines_removed": 23
  },
  "context_window": {
    "total_input_tokens": 15234,
    "total_output_tokens": 4521,
    "context_window_size": 200000,
    "used_percentage": 8,
    "remaining_percentage": 92,
    "current_usage": {
      "input_tokens": 8500,
      "output_tokens": 1200,
      "cache_creation_input_tokens": 5000,
      "cache_read_input_tokens": 2000
    }
  },
  "exceeds_200k_tokens": false,
  "vim": { "mode": "NORMAL" },
  "agent": { "name": "security-reviewer" },
  "worktree": {
    "name": "my-feature",
    "path": "/path/to/.claude/worktrees/my-feature",
    "branch": "worktree-my-feature",
    "original_cwd": "/path/to/project",
    "original_branch": "main"
  }
}
```

### Recommended FIELD_DEFINITIONS Array

All fields are sourced from official Claude Code documentation. Fields marked "conditional" only appear in certain session types — include them in FIELD_DEFINITIONS but document that they may be absent.

```typescript
// src/lib/fields.ts
export interface FieldDefinition {
  id: string
  label: string
  description: string
  jqPath: string
  exampleValue: string
  category: 'model' | 'context' | 'cost' | 'workspace' | 'session' | 'advanced'
  conditional?: boolean  // field absent in some session types
}

export const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    id: 'model_display_name',
    label: 'Model',
    description: 'Current model display name (e.g., "Opus", "Sonnet")',
    jqPath: '.model.display_name',
    exampleValue: 'Sonnet',
    category: 'model',
  },
  {
    id: 'model_id',
    label: 'Model ID',
    description: 'Full model identifier string',
    jqPath: '.model.id',
    exampleValue: 'claude-sonnet-4-6',
    category: 'model',
  },
  {
    id: 'context_used_pct',
    label: 'Context %',
    description: 'Percentage of context window used',
    jqPath: '.context_window.used_percentage // 0',
    exampleValue: '42',
    category: 'context',
  },
  {
    id: 'context_remaining_pct',
    label: 'Context Remaining',
    description: 'Percentage of context window remaining',
    jqPath: '.context_window.remaining_percentage // 0',
    exampleValue: '58',
    category: 'context',
  },
  {
    id: 'context_window_size',
    label: 'Context Size',
    description: 'Maximum context window size in tokens',
    jqPath: '.context_window.context_window_size',
    exampleValue: '200000',
    category: 'context',
  },
  {
    id: 'context_total_input_tokens',
    label: 'Input Tokens',
    description: 'Cumulative input tokens used this session',
    jqPath: '.context_window.total_input_tokens',
    exampleValue: '15234',
    category: 'context',
  },
  {
    id: 'context_total_output_tokens',
    label: 'Output Tokens',
    description: 'Cumulative output tokens generated this session',
    jqPath: '.context_window.total_output_tokens',
    exampleValue: '4521',
    category: 'context',
  },
  {
    id: 'cost_total_usd',
    label: 'Cost (USD)',
    description: 'Total session cost in US dollars',
    jqPath: '.cost.total_cost_usd',
    exampleValue: '0.0123',
    category: 'cost',
  },
  {
    id: 'cost_duration_ms',
    label: 'Duration',
    description: 'Total wall-clock time since session started (milliseconds)',
    jqPath: '.cost.total_duration_ms',
    exampleValue: '45000',
    category: 'cost',
  },
  {
    id: 'cost_lines_added',
    label: 'Lines Added',
    description: 'Lines of code added this session',
    jqPath: '.cost.total_lines_added',
    exampleValue: '156',
    category: 'cost',
  },
  {
    id: 'cost_lines_removed',
    label: 'Lines Removed',
    description: 'Lines of code removed this session',
    jqPath: '.cost.total_lines_removed',
    exampleValue: '23',
    category: 'cost',
  },
  {
    id: 'workspace_current_dir',
    label: 'Working Dir',
    description: 'Current working directory path',
    jqPath: '.workspace.current_dir',
    exampleValue: '/home/user/my-project',
    category: 'workspace',
  },
  {
    id: 'workspace_project_dir',
    label: 'Project Dir',
    description: 'Directory where Claude Code was launched',
    jqPath: '.workspace.project_dir',
    exampleValue: '/home/user/my-project',
    category: 'workspace',
  },
  {
    id: 'version',
    label: 'CC Version',
    description: 'Claude Code version string',
    jqPath: '.version',
    exampleValue: '1.0.80',
    category: 'session',
  },
  {
    id: 'session_id',
    label: 'Session ID',
    description: 'Unique session identifier',
    jqPath: '.session_id',
    exampleValue: 'abc123def456',
    category: 'session',
  },
  {
    id: 'output_style',
    label: 'Output Style',
    description: 'Current output style name',
    jqPath: '.output_style.name',
    exampleValue: 'default',
    category: 'session',
  },
  {
    id: 'vim_mode',
    label: 'Vim Mode',
    description: 'Current vim mode (NORMAL or INSERT) — only present when vim mode is enabled',
    jqPath: '.vim.mode',
    exampleValue: 'NORMAL',
    category: 'advanced',
    conditional: true,
  },
  {
    id: 'agent_name',
    label: 'Agent',
    description: 'Agent name — only present when running with --agent flag',
    jqPath: '.agent.name',
    exampleValue: 'security-reviewer',
    category: 'advanced',
    conditional: true,
  },
  {
    id: 'worktree_name',
    label: 'Worktree',
    description: 'Active worktree name — only present during --worktree sessions',
    jqPath: '.worktree.name',
    exampleValue: 'my-feature',
    category: 'advanced',
    conditional: true,
  },
  {
    id: 'worktree_branch',
    label: 'Worktree Branch',
    description: 'Git branch for the active worktree',
    jqPath: '.worktree.branch',
    exampleValue: 'worktree-my-feature',
    category: 'advanced',
    conditional: true,
  },
  {
    id: 'exceeds_200k',
    label: 'Exceeds 200k',
    description: 'Whether combined token count from last response exceeds 200k',
    jqPath: '.exceeds_200k_tokens',
    exampleValue: 'false',
    category: 'advanced',
  },
]
```

**Fields NOT in FIELD_DEFINITIONS (internal to runtime, not useful for display):**
- `transcript_path` — internal file path, not user-facing
- `context_window.current_usage.*` — raw token sub-fields; the `used_percentage` covers the use case more ergonomically

---

## Code Examples

### globals.css — Complete Tailwind 4 Token Setup

```css
/* Source: https://tailwindcss.com/blog/tailwindcss-v4 */
@import "tailwindcss";

@theme {
  /* Gruvbox Dark */
  --color-bg:      #282828;
  --color-surface: #1d2021;
  --color-border:  #504945;
  --color-fg:      #ebdbb2;
  --color-muted:   #a89984;
  --color-yellow:  #fabd2f;
  --color-orange:  #fe8019;
  --color-aqua:    #8ec07c;

  /* Font */
  --font-mono: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace;

  /* Radii */
  --radius-panel: 5px;
}
```

Generated Tailwind utilities (examples): `bg-bg`, `bg-surface`, `text-fg`, `text-muted`, `text-yellow`, `border-border`, `font-mono`, `rounded-panel`.

### layout.tsx — Root Layout with Font and Global Styles

```typescript
// Source: https://nextjs.org/docs/app/getting-started/fonts
import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Claude Code Statusline Configurator',
  description: 'Generate a customized Claude Code statusline script',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body className="bg-bg text-fg font-mono min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
```

### page.tsx — Centered Layout Skeleton

```typescript
// Centered single-column shell with max-width ~900px
export default function Home() {
  return (
    <main className="mx-auto max-w-[900px] px-6 py-8 space-y-8">
      {/* Header */}
      <header className="border-b border-border pb-4">
        <h1 className="text-fg text-xl font-mono">Claude Code Statusline Configurator</h1>
      </header>

      {/* Configurator section — Phase 2 */}
      <section className="border border-border rounded-panel bg-surface p-4">
        <p className="text-muted text-sm">[ configurator — phase 2 ]</p>
      </section>

      {/* Preview section — Phase 2 */}
      <section className="border border-border rounded-panel bg-surface p-4">
        <p className="text-muted text-sm">[ preview — phase 2 ]</p>
      </section>

      {/* Output section — Phase 3 */}
      <section className="border border-border rounded-panel bg-surface p-4">
        <p className="text-muted text-sm">[ output — phase 3 ]</p>
      </section>
    </main>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next export` CLI command | `output: 'export'` in `next.config.ts` | Next.js 14 | Old command errors; must use config |
| `@tailwind base/components/utilities` directives | `@import "tailwindcss"` | Tailwind CSS 4 (2025) | Single import replaces three directives |
| `tailwind.config.js` for token customization | `@theme {}` in CSS | Tailwind CSS 4 (2025) | No JS config needed for tokens |
| `theme.extend.colors` for custom palette | `--color-*` inside `@theme` | Tailwind CSS 4 (2025) | Direct CSS custom properties |
| `@tailwind/forms`, `@tailwind/typography` plugins | Native Tailwind 4 `@plugin` directive | Tailwind CSS 4 (2025) | Plugin API changed |

**Deprecated/outdated:**
- `next export` command: removed in Next.js 14. Use `output: 'export'`.
- Tailwind `tailwind.config.js` for token design: still works in v4 for advanced plugin config but not needed for colors/fonts/spacing.
- `@tailwind base/components/utilities`: Tailwind 3 syntax. Use `@import "tailwindcss"` in v4.

---

## Open Questions

1. **Tailwind 4 auto-detection of `src/app/` files**
   - What we know: Tailwind 4 auto-detects template files via the Oxide engine; no `content: []` array needed.
   - What's unclear: Whether the auto-detection correctly picks up all files in `src/` with `create-next-app`'s default structure, or if a manual `@source` directive is needed.
   - Recommendation: Run `next build` early and verify generated CSS includes expected utilities. If missing, add `@source "../"` to `globals.css`.

2. **React 19 + Tailwind 4 peer dependency compatibility**
   - What we know: `create-next-app` with `--tailwind` installs Tailwind 4 when Next.js 15 is used.
   - What's unclear: Whether any Tailwind 4 PostCSS plugins have React 19 peer dep issues.
   - Recommendation: Verify `npm install` completes without peer dep warnings after scaffold.

3. **`#1d2021` surface color contrast**
   - What we know: `#1d2021` is darker than `#282828`; it's used as a surface/card background, not as a text color.
   - What's unclear: The contrast ratio of `#1d2021` vs `#282828` (they're very close) — this may cause issues if used adjacent in UI.
   - Recommendation: Do not use `#1d2021` as background for text that will sit directly on `#282828`; always use text tokens (`#ebdbb2`, `#a89984`) on these surfaces.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Not yet installed — Wave 0 gap |
| Config file | `vitest.config.ts` — Wave 0 creation |
| Quick run command | `npx vitest run --reporter=dot` |
| Full suite command | `npx vitest run` |

**Rationale for Vitest:** Next.js 15 + React 19 ecosystem; Vitest is the standard choice for unit testing in Vite-adjacent stacks and integrates cleanly with TypeScript. Jest works but requires more React 19 config.

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONF-05 | `FIELD_DEFINITIONS` is importable and contains all expected field IDs | unit | `npx vitest run tests/fields.test.ts -t "FIELD_DEFINITIONS"` | Wave 0 |
| CONF-05 | Each field has required keys: id, label, description, jqPath, exampleValue, category | unit | `npx vitest run tests/fields.test.ts -t "shape"` | Wave 0 |
| TECH-01 | `next build` produces `out/` directory | smoke | `next build && test -d out` | N/A (manual build) |
| TECH-02 | No hydration errors in browser console | smoke/manual | `next build && next start` then check DevTools | Manual only |
| DSGN-01 | Page renders with `bg-bg` dark background and monospace font applied | visual/manual | Browser check | Manual only |
| DSGN-02 | Interactive elements are `<button>` / `<input>`, not `<div>` | unit/lint | ESLint jsx-a11y rules catch div-with-onclick | Automated via lint |
| DSGN-03 | All text color tokens pass 4.5:1 vs #282828 | unit | `npx vitest run tests/contrast.test.ts` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/fields.test.ts tests/contrast.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** `next build` producing `out/` + full vitest suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/fields.test.ts` — covers CONF-05: FIELD_DEFINITIONS shape and completeness
- [ ] `tests/contrast.test.ts` — covers DSGN-03: WCAG AA contrast calculations for all color tokens
- [ ] `vitest.config.ts` — test runner configuration
- [ ] `package.json` test script: `"test": "vitest run"` — if not added by scaffold

---

## Sources

### Primary (HIGH confidence)

- [Official Next.js static export docs](https://nextjs.org/docs/app/guides/static-exports) — `output: 'export'` config, limitations, image requirements
- [Official Next.js font optimization docs](https://nextjs.org/docs/app/getting-started/fonts) — JetBrains Mono import pattern, variable font CSS var approach
- [Official Claude Code statusline docs](https://code.claude.com/docs/en/statusline) — Complete JSON schema, all field names and jq paths, example scripts
- [Tailwind CSS v4.0 release post](https://tailwindcss.com/blog/tailwindcss-v4) — `@theme` directive syntax, `@import "tailwindcss"` usage, design token approach

### Secondary (MEDIUM confidence)

- WebSearch: Next.js 15 hydration mismatch prevention — consistent with official docs on `useEffect` mounted guard pattern
- WebSearch: Tailwind 4 Next.js 15 integration — confirmed CSS-first config and `@theme` approach

### Tertiary (LOW confidence)

- None — all critical claims verified with primary sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — official Next.js 15 and Tailwind 4 docs
- Architecture: HIGH — official docs with code examples
- FIELD_DEFINITIONS: HIGH — sourced directly from official Claude Code statusline documentation (last updated 2026-02-27)
- WCAG contrast: HIGH — calculated via WCAG 2.1 relative luminance formula; verified programmatically
- Pitfalls: HIGH — sourced from official docs and known breaking changes

**Research date:** 2026-03-10
**Valid until:** 2026-06-10 (90 days — stable stack; Tailwind 4 minor releases unlikely to break `@theme` API; Claude Code schema may evolve, re-verify if major version bump)
