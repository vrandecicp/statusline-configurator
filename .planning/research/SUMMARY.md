# Project Research Summary

**Project:** Claude Code Statusline Configurator
**Domain:** Terminal-aesthetic static web configurator / bash script generator
**Researched:** 2026-03-10
**Confidence:** HIGH

## Executive Summary

The Claude Code Statusline Configurator is a single-page, fully static web tool that lets developers visually compose a `~/.claude/statusline.sh` bash script by toggling fields, setting their order, and choosing a separator. A reference implementation already exists at claude-code-statusline.on-forge.com, but it lacks field reordering, separator control, and robust bash quoting — making this project a focused improvement on a known, validated concept. The recommended approach is a Next.js 15 static export (App Router, `output: 'export'`) with React 19, TypeScript, and Tailwind CSS 4 — a stack that is already decided, production-proven for this shape of tool, and deployable to Vercel with zero configuration.

The architecture centers on a single `ConfiguratorRoot` client component that owns all state (an ordered array of enabled field IDs plus a separator string). All derived values — the live preview string and the generated bash script — flow from a pair of pure TypeScript functions called via `useMemo`. Children are pure presentational components receiving props. The field registry (`FIELD_DEFINITIONS`) is a static data array imported at module load; no server, no database, no localStorage by default. This design is deliberately simple: the entire feature has two state values and all complexity lives in the code generator, not the UI.

The primary risks are not architectural but implementation-level: bash quoting correctness in the code generator (separator characters with special shell meaning must be single-quoted), the SSR/hydration boundary (the configurator must be fully `"use client"` with no browser-global reads outside event handlers), and accessibility (terminal aesthetics commonly fail WCAG contrast minimums and interactive controls are often built as unsemantic `div`s). All three risks are known in advance and preventable with patterns established in Phase 1 before any feature work begins.

## Key Findings

### Recommended Stack

The stack is Next.js 15 (App Router, static export), React 19.2, TypeScript 5.x, and Tailwind CSS 4.2. These are already decided and their compatibility is verified against official documentation. Supporting libraries are minimal: `motion` (formerly framer-motion, v11+) for animated field transitions, `clsx` + `tailwind-merge` for conditional class composition, and either `react-syntax-highlighter` or the lighter `prism-react-renderer` for the bash script output block. No drag-and-drop library, no state management library, and no UI component library (shadcn/ui works against the hand-crafted terminal aesthetic).

**Core technologies:**
- Next.js 15 (static export): framework and build tooling — zero-config Vercel deployment, `output: 'export'` produces a fully static `out/` folder
- React 19.2: component model with React Compiler (auto-memoization) — reduces re-render overhead in a live-preview tool
- TypeScript 5.x: type safety for field config state logic — non-negotiable given the state-heavy field registry and generator functions
- Tailwind CSS 4.2: utility styling — built-in `dark:` prefix and glow/shadow utilities cover terminal aesthetic without custom CSS
- motion v11+: animated list reorder and field mount/unmount transitions — `AnimatePresence` + `layout` prop handles reorder visuals without a DnD library
- prism-react-renderer (preferred) or react-syntax-highlighter: bash syntax highlighting in the output block — both are React-aware and avoid vanilla Prism's hydration issues

**Key constraint:** Node.js >=20.9 required; `next export` CLI command is removed in Next.js 14+ — use `output: 'export'` in `next.config.js` instead.

### Expected Features

The reference site establishes baseline expectations. The primary differentiation is field reordering (the reference site has none) and separator control.

**Must have (table stakes — v1 launch):**
- Field toggles (enable/disable per field) — core interaction, already on reference site
- Live preview updating instantly on every change — required for any configurator
- Generated bash script visible in a monospace block — the exit artifact
- One-click copy to clipboard with visual confirmation ("Copied!" for ~2s) — the exit action
- Categorized field groups — 20+ fields as a flat list is unusable
- Sensible default field selection on load — blank state is disorienting
- Install/usage instructions inline — without "what do I do with this?", copy is abandoned
- Terminal aesthetic UI — not cosmetic, it is the brand identity and the primary reason developers will share it
- Field reordering via up/down arrows — the stated primary gap vs. the reference site
- Separator picker (pipe, dash, dot, space, custom) — low effort, high personalization signal

**Should have (v1.x — add after launch validation):**
- Permalink / shareable URL via hash — add when users ask "how do I share my config?"
- Field descriptions/tooltips — add if users report confusion about field names
- Keyboard navigation for reorder arrows — add when accessibility feedback arrives
- Reset to defaults button — add when users report frustration after heavy experimentation

**Defer (v2+):**
- Multiple named config slots — only if team/enterprise use cases emerge
- Custom user-defined bash field expressions — high complexity, niche need
- Theme variants (amber, cyan terminal palettes) — no user signal yet
- One-click install via curl | bash — security perception issues; defer

**Do not build:** drag-and-drop reordering (DnD library weight + accessibility cost outweigh benefit for a CLI-developer audience who expects keyboard-first), dark/light mode toggle (dilutes the terminal identity), server-side generation (adds latency and failure modes for a stateless tool).

### Architecture Approach

The architecture is a single-client-boundary React app inside a Next.js static export shell. `page.tsx` is a server component rendering static chrome and importing `ConfiguratorRoot`. `ConfiguratorRoot` is the only `'use client'` boundary and owns the full state: `enabledIds: string[]` (ordered array of active field IDs) and `separator: string`. All derived values (`enabledFields`, `script`, `preview`) are computed via `useMemo`. Field order is represented as an array — not as a position integer — making reorder a simple array splice. Children are pure presentational components; no context, no Zustand, no prop drilling deeper than two levels.

**Major components and build order (dependencies dictate sequence):**
1. `data/fields.ts` (FIELD_DEFINITIONS) — static typed array; no deps; everything else imports this
2. `lib/generateScript.ts` + `lib/generatePreview.ts` — pure functions, no React; independently testable before any UI exists
3. `ConfiguratorRoot` — wires state to derived values via useMemo; needs fields and lib functions
4. `FieldSelector` + `ToggleRow` — needs ConfiguratorRoot callback signatures defined first
5. `SeparatorPicker` — simple controlled input, no dependencies
6. `StatuslinePreview` + `ScriptBlock` — pure display; can be stubbed as `<pre>` then enhanced with syntax highlighting last
7. `CopyButton` — UX layer on top of a working ScriptBlock; last

The critical anti-pattern to avoid (which explains why the reference site cannot support reordering): storing configuration state in DOM attributes and querying the DOM at generation time. React state is the source of truth; DOM reflects state.

### Critical Pitfalls

1. **SSR hydration mismatch** — The configurator must be `"use client"` from the root; no browser globals (`window`, `navigator.clipboard`) outside `useEffect` or event handlers. Use `next/dynamic` with `{ ssr: false }` for any syntax highlighter that touches `window`. Address in Phase 1 before feature work begins.

2. **Bash script quoting errors** — Separator characters with shell special meaning (`|`, `\`, `$`, backtick) must be single-quoted in the generated script, never interpolated raw. Build `generateScript` with a test fixture for every supported separator value before wiring the UI. Address in Phase 2.

3. **Clipboard API silent failure** — `navigator.clipboard.writeText()` rejects silently in non-HTTPS or non-focused contexts. Always `.catch()` the promise, surface an error state to the user, and provide a `document.execCommand('copy')` fallback. Never let a failed copy show a "Copied!" success state. Address in Phase 2/3.

4. **Terminal contrast failures** — Dark terminal palettes frequently fail WCAG AA (4.5:1 minimum for body text). Glow effects create an illusion of higher contrast. Establish passing color tokens in Tailwind config in Phase 1; verify with DevTools accessibility panel as components are built, not at the end.

5. **Semantic HTML for interactive controls** — Accessibility retrofit of `div`-based controls is high-cost (HIGH recovery cost vs LOW if built correctly from the start). Use `<button>` for copy and reorder arrows, `<input type="checkbox">` for field toggles, `aria-label` on icon-only buttons, `aria-live="polite"` on the preview area. Build semantically from day one.

## Implications for Roadmap

Based on research, all pitfalls cluster into two groups: "establish before building anything" (Phase 1) and "get right during feature work" (Phase 2). This naturally suggests a three-phase structure for v1 launch.

### Phase 1: Foundation and Design Tokens

**Rationale:** Three pitfalls (SSR boundary, contrast failures, font fallback) must be resolved before any feature component is built. Retrofitting them is expensive; preventing them is cheap. The field registry is also a dependency for every subsequent component.

**Delivers:** A running Next.js project with the `"use client"` boundary in place, a Tailwind color palette with verified contrast ratios, `next/font` monospace font loading, the complete `FIELD_DEFINITIONS` array in `data/fields.ts`, and a passing ESLint/TypeScript baseline.

**Addresses:** SSR hydration prevention, terminal contrast validation, monospace font fallback elimination.

**Pitfalls to avoid here:** SSR (`"use client"` + `mounted` guard established), contrast failures (design tokens set in config before any component touches color), font flash (next/font/google configured in layout.tsx).

### Phase 2: Core Configurator Logic and Interactions

**Rationale:** The pure generator functions have no UI dependencies and should be built and tested first. Then `ConfiguratorRoot` wires them to state, and the field selection/reorder UI is built on top. This phase delivers the complete functional core; the output display is stubbed as a `<pre>` block to unblock testing.

**Delivers:** Working field toggle, field reorder (up/down with disabled states on edge items), separator picker, live preview, `generateScript` and `generatePreview` pure functions with test fixtures covering all separators, and a functional `ConfiguratorRoot` wiring them together.

**Uses:** `useState`, `useMemo`, `motion` AnimatePresence for field transitions, `clsx`/`tailwind-merge` for class composition.

**Implements:** `ConfiguratorRoot`, `FieldSelector`, `ToggleRow`, `SeparatorPicker`, `StatuslinePreview`, `lib/generateScript.ts`, `lib/generatePreview.ts`.

**Pitfalls to avoid here:** Bash quoting correctness (test each separator in a real shell), live preview debounce for separator input (150ms), reorder arrow disabled states on first/last items, semantic HTML for all interactive controls.

### Phase 3: Output, Copy, and Polish

**Rationale:** The output display and copy button depend on a working `generateScript`. The terminal aesthetic polish (glow borders, animated transitions, scanline effect) belongs last to avoid premature visual work that may need to change as layout settles.

**Delivers:** `ScriptBlock` with syntax highlighting, `CopyButton` with error handling and `execCommand` fallback, copy visual confirmation (2s "Copied!" state), install/usage instructions inline, full terminal aesthetic polish, and a production `next build` passing with zero hydration warnings and zero contrast failures.

**Uses:** `prism-react-renderer` (loaded via `next/dynamic` with `{ ssr: false }`), `navigator.clipboard` with `.catch()` fallback, `motion` glow/entrance animations.

**Pitfalls to avoid here:** Clipboard silent failure (catch all rejection paths, test in real HTTPS context), `dangerouslySetInnerHTML` for script display (use the highlighter's HTML-escaped output), ESLint `next build` not auto-running lint in Next.js 16+ (run explicitly in CI).

### Phase Ordering Rationale

- Data before UI: `FIELD_DEFINITIONS` and the generator pure functions have no React dependencies and can be built, typed, and tested before mounting any component.
- Pitfall prevention before feature work: The SSR boundary, color tokens, and font stack are architectural setup that every subsequent component inherits — not features that can be added later.
- Output/polish last: `ScriptBlock` syntax highlighting and clipboard are UX enhancements on top of a working generator; their deps are resolved in Phase 2.
- v1.x features (permalink, tooltips, reset button, keyboard reorder nav) are deliberate post-launch additions — they depend on user signal, not on architecture readiness.

### Research Flags

Phases with standard, well-documented patterns (skip additional research):
- **Phase 1:** Next.js App Router setup, Tailwind v4 + PostCSS config, and `next/font` are thoroughly documented in official sources. No research needed.
- **Phase 2:** React `useState`/`useMemo` patterns, array-based reorder logic, and the `motion` `layout` prop are established patterns with high-confidence documentation.
- **Phase 3:** `prism-react-renderer` integration and the Clipboard API error-handling pattern are well-documented; minor verification of peer deps needed at install time.

Phases that may benefit from targeted validation (not a blocker, but worth checking):
- **Phase 2 — bash generator correctness:** The exact jq paths for each Claude Code statusline field should be verified against the actual Claude Code runtime JSON schema before finalizing `FIELD_DEFINITIONS`. The reference site's field set is the source; confirm no fields have been added or renamed in recent Claude Code versions.
- **Phase 3 — `prism-react-renderer` vs `react-syntax-highlighter`:** Either works; confirm the chosen library's peer dep compatibility with React 19 at install time. STACK.md notes medium confidence on exact versions.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core framework versions verified against official Next.js, Tailwind v4, and React 19 docs. Supporting library versions (motion, prism-react-renderer) are MEDIUM — verify with `npm show <pkg> version` before pinning. |
| Features | HIGH | Reference site analyzed directly. Feature gap (reordering, separator) confirmed. Comparable tool patterns assessed from direct knowledge of CSS generators, JSON formatters, and IDE theme configurators. |
| Architecture | HIGH | Well-established Next.js App Router + lifted state pattern. Reference site's DOM-as-state anti-pattern directly observed as the cause of its reordering limitation. Pure function generator pattern is standard. |
| Pitfalls | HIGH | All pitfalls are durable and documented in official sources (Next.js docs, MDN, WCAG, GNU Bash manual). Bash quoting bug category confirmed by PROJECT.md note that reference site is "rough around the edges." |

**Overall confidence:** HIGH

### Gaps to Address

- **Claude Code field jq paths:** The `jqPath` values for each field in `FIELD_DEFINITIONS` must be verified against the actual Claude Code hook JSON payload schema. The reference site is a proxy, not the authoritative source. Validate during Phase 2 field registry work.
- **motion exact version and React 19 peer deps:** STACK.md flags LOW-MEDIUM confidence on the `framer-motion` to `motion` rename and version. Run `npm show motion peerDependencies` at project setup to confirm React 19 support before writing any animation code.
- **prism-react-renderer vs react-syntax-highlighter choice:** STACK.md recommends `prism-react-renderer` as the leaner option but notes MEDIUM confidence on versions. Confirm at install time; the architectural approach (loaded via `next/dynamic` with `ssr: false`) is the same for either.

## Sources

### Primary (HIGH confidence)
- Next.js official docs (nextjs.org/docs) v16.1.6, verified 2026-02-27 — static export (`output: 'export'`), App Router client components, `"use client"` semantics, Node.js >=20.9 requirement, `next/font` configuration
- Tailwind CSS v4 install guide (tailwindcss.com/docs/installation/framework-guides/nextjs) — `@tailwindcss/postcss` package, PostCSS config format, `@import "tailwindcss"` syntax
- Vercel Next.js docs (vercel.com/docs/frameworks/nextjs) — zero-config static export deployment
- MDN Web Docs — Clipboard API (`navigator.clipboard.writeText()`), permission model, `document.execCommand` deprecation status
- WCAG 2.1 SC 1.4.3 — contrast minimum ratios (4.5:1 normal text, 3:1 large text)
- GNU Bash manual, "Quoting" section — single vs double quote semantics, IFS splitting
- Reference site direct analysis: https://claude-code-statusline.on-forge.com/ (2026-03-10) — feature inventory, identified gaps (no reorder, no separator, quoting issues)

### Secondary (MEDIUM confidence)
- React 19.2 changelog (react.dev/versions) — React Compiler v1.0 stable Oct 2025, v19.2.1 stable Dec 2025
- motion.dev / framer/motion GitHub — package rename from `framer-motion` to `motion`; v11+ current; React 19 peer dep support

### Tertiary (LOW confidence — verify before use)
- react-syntax-highlighter npm — bash grammar support, React 18/19 peer deps; verify at install time
- prism-react-renderer npm — React 19 compatibility; verify at install time

---
*Research completed: 2026-03-10*
*Ready for roadmap: yes*
