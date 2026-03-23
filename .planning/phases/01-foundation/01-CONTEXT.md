# Phase 1: Foundation - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

A running Next.js 15 static site with: SSR boundary and mounted guard established, design tokens defined from the Gruvbox Dark palette meeting WCAG AA 4.5:1 contrast, and a complete FIELD_DEFINITIONS registry as the single data source for all future configurator components.

No interactive functionality yet — this phase is the structural foundation that Phases 2 and 3 build on.

</domain>

<decisions>
## Implementation Decisions

### Color palette
- Base palette: **Gruvbox Dark**
- Page background: `#282828` (Gruvbox medium dark)
- Surface/card background: `#1d2021` (Gruvbox hard dark) — one step darker than page
- Primary accent: `#fabd2f` (Gruvbox yellow) — used for active toggles, selected fields, hover/focus states
- Secondary accent: `#fe8019` (Gruvbox orange) — supporting accent
- Aqua: `#8ec07c` — available as a tertiary color
- Text primary: `#ebdbb2` (Gruvbox fg)
- Text muted: `#a89984` (Gruvbox gray)
- Border: `#504945` (Gruvbox bg3) — single-pixel borders for surfaces
- All tokens must be verified to pass WCAG AA 4.5:1 contrast against `#282828` background

### Glow / animation treatment
- Glow effects use **neutral/white** at low opacity — NOT the yellow accent
- Yellow is reserved for foreground active-state color (text/border), not glow
- Glows are subtle (CSS box-shadow or text-shadow with low opacity white)

### Aesthetic tone
- **Refined terminal** — dark UI with terminal DNA, NOT raw/CRT/scanlines
- No scanline textures, no blinking cursor in the base layout, no phosphor effects
- Clean card-like surfaces with single-pixel Gruvbox borders
- Polished enough that someone would share the URL publicly

### Typography
- Font: **JetBrains Mono** (loaded via Google Fonts / next/font)
- Applied globally — monospace throughout the entire app
- All UI copy, labels, and controls use the same monospace font

### Page layout skeleton
- **Centered single column**, max-width ~900px
- Content centered with horizontal breathing room on wide monitors
- Vertical stacking: header → configurator section → preview section → output section
- This spatial structure carries forward into Phases 2 and 3

### Border treatment
- Single-pixel borders using Gruvbox gray (`#504945`) for panels and cards
- No box-drawing character borders in HTML
- No border-radius extremes — use subtle rounding (4–6px) consistent with terminal feel

### Claude's Discretion
- Exact spacing scale and padding values
- Tailwind CSS 4 custom property naming convention for Gruvbox tokens
- Which Claude Code statusline fields to include in FIELD_DEFINITIONS (researcher should verify jq paths against actual runtime schema)
- FIELD_DEFINITIONS metadata shape (label, description, example value, jq path)
- SSR boundary implementation approach (context provider vs component-level guard)
- Mounted guard pattern (useState + useEffect vs library)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — this is the initial scaffold

### Established Patterns
- None yet — patterns established in this phase will carry forward

### Integration Points
- FIELD_DEFINITIONS array created in this phase is the single import for Phase 2's FieldSelector and ToggleRow components
- Design tokens defined here are consumed by all Phase 2 and 3 components via Tailwind CSS 4 CSS custom properties

</code_context>

<specifics>
## Specific Ideas

- Preview mockup chosen by user during discussion:
  ```
  ┌──────────────────────────────┐
  │ Claude Code Statusline       │
  ├──────────────────────────────┤
  │ [x] model    [x] tokens      │
  │ [ ] cost     [ ] context     │
  └──────────────────────────────┘
  ```
  This card-with-border pattern should be reflected in the Phase 1 base layout skeleton.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-10*
