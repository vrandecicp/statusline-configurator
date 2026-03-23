---
phase: 01-foundation
plan: "01"
subsystem: ui
tags: [next.js, react, tailwind, gruvbox, static-export, ssr-guard, monospace]

# Dependency graph
requires:
  - phase: 01-foundation/01-00
    provides: vitest config and test stubs (contrast.test.ts, fields.test.ts)
provides:
  - Next.js 15 static export project scaffold
  - ClientOnly SSR mounted guard component
  - JetBrains Mono root layout with Gruvbox bg
  - globals.css @theme with 8 Gruvbox color tokens
  - Three-section page skeleton (configurator, preview, output)
affects:
  - 01-foundation/01-02 (FIELD_DEFINITIONS depends on this scaffold)
  - phase-02 (all components build on top of this layout skeleton)
  - phase-03 (output section referenced here)

# Tech tracking
tech-stack:
  added:
    - next@16.1.6 (static export via output: 'export')
    - react@19.2.3
    - react-dom@19.2.3
    - tailwindcss@4 (Tailwind CSS 4 with @theme block)
    - vitest@3 (added to project devDependencies)
    - JetBrains Mono (via next/font/google)
  patterns:
    - ClientOnly mounted guard (useState + useEffect, SSR-safe)
    - Tailwind CSS 4 @theme with --color-* custom properties for Gruvbox palette
    - suppressHydrationWarning on <html> to silence browser extension noise
    - jetbrainsMono.variable (not .className) to expose CSS custom property

key-files:
  created:
    - statusline-configurator/next.config.ts
    - statusline-configurator/package.json
    - statusline-configurator/src/components/ClientOnly.tsx
    - statusline-configurator/src/app/layout.tsx
    - statusline-configurator/src/app/globals.css
    - statusline-configurator/src/app/page.tsx
  modified:
    - statusline-configurator/vitest.config.ts (bug fix: reporter -> reporters)

key-decisions:
  - "Used output: 'export' in next.config.ts for static generation — no trailingSlash (Vercel compatible)"
  - "Used jetbrainsMono.variable on <html> not .className to expose --font-jetbrains-mono CSS var for @theme"
  - "Scaffolded in temp dir then merged to preserve plan 01-00 test stubs"

patterns-established:
  - "ClientOnly pattern: useState(false) + useEffect(() => setMounted(true)) — wraps client-boundary content"
  - "Gruvbox token naming: --color-bg, --color-surface, --color-border etc. with category prefix for Tailwind utility gen"
  - "Page structure: centered single column max-w-[900px] with semantic <section aria-label>"

requirements-completed: [TECH-01, TECH-02, DSGN-02]

# Metrics
duration: 8min
completed: 2026-03-10
---

# Phase 1 Plan 01: Project Scaffold Summary

**Next.js 15 static export scaffold with JetBrains Mono, Gruvbox Dark @theme tokens, ClientOnly SSR guard, and three-section page skeleton**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-10T17:59:21Z
- **Completed:** 2026-03-10T18:07:03Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Scaffolded Next.js 15 + React 19 + Tailwind CSS 4 project with static export configuration
- Created ClientOnly component with useState/useEffect mounted guard eliminating hydration mismatches
- Replaced default layout with JetBrains Mono font and Gruvbox Dark background (#282828)
- Defined 8 Gruvbox color tokens via @theme block (bg, surface, border, fg, muted, yellow, orange, aqua)
- Built three-section page skeleton with semantic aria-labels for configurator, preview, and output
- Confirmed contrast.test.ts passes 6/6 (all text tokens exceed WCAG AA 4.5:1)

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 15 project and configure static export** - `d6de268` (feat)
2. **Task 2: Write ClientOnly guard, root layout, and page skeleton** - `5b0cecb` (feat)

## Files Created/Modified

- `statusline-configurator/next.config.ts` - Static export config with output: 'export' and images.unoptimized: true
- `statusline-configurator/package.json` - Project name, scripts (added test: vitest run), vitest devDep
- `statusline-configurator/src/components/ClientOnly.tsx` - Mounted guard wrapper for SSR safety
- `statusline-configurator/src/app/layout.tsx` - Root layout with JetBrains Mono variable and Gruvbox bg
- `statusline-configurator/src/app/globals.css` - @import tailwindcss + @theme with 8 Gruvbox tokens
- `statusline-configurator/src/app/page.tsx` - Three-section skeleton with semantic aria-labels
- `statusline-configurator/vitest.config.ts` - Bug fix: reporter -> reporters (plural)

## Decisions Made

- Scaffolded into a temp directory then merged files into existing project to preserve plan 01-00 test stubs
- Used `jetbrainsMono.variable` (not `.className`) on `<html>` to expose `--font-jetbrains-mono` CSS custom property, enabling the `@theme` font-mono definition to reference it
- Tailwind CSS 4 `@theme` block uses `--color-*` naming prefix so Tailwind auto-generates utility classes (`bg-bg`, `text-fg`, `border-border`, `rounded-panel`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed vitest.config.ts reporter -> reporters**
- **Found during:** Task 1 (first next build verification)
- **Issue:** `reporter: 'dot'` is not a valid Vitest InlineConfig property — TypeScript error blocked next build from compiling
- **Fix:** Changed `reporter: 'dot'` to `reporters: ['dot']` (correct plural form, array type)
- **Files modified:** `statusline-configurator/vitest.config.ts`
- **Verification:** next build completed successfully with zero TypeScript errors
- **Committed in:** d6de268 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix — vitest.config.ts was included in Next.js TypeScript compilation, blocking the build entirely. No scope creep.

## Issues Encountered

- `create-next-app` refused to scaffold into existing directory containing plan 01-00 test files — resolved by scaffolding into `statusline-configurator-temp/` and merging files manually, preserving test stubs.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Static export verified: `next build` exits 0, `out/` directory produced
- SSR guard ready: `ClientOnly` component available for any dynamic content in Phase 2
- Design tokens ready: all 8 Gruvbox tokens in @theme, accessible via Tailwind utilities
- Page skeleton ready: three sections exist for Phase 2 (configurator, preview) and Phase 3 (output) to populate
- Contrast tests GREEN: WCAG AA compliance confirmed for all text tokens
- fields.test.ts remains RED (expected — `src/lib/fields.ts` created in plan 01-02)

---
*Phase: 01-foundation*
*Completed: 2026-03-10*
