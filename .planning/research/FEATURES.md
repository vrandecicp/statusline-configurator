# Feature Research

**Domain:** Interactive web configurator / code generator (terminal tooling)
**Researched:** 2026-03-10
**Confidence:** HIGH (reference site analyzed; comparable tools — CSS gradient generators, JSON formatters, IDE theme configurators — assessed from direct knowledge)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Live preview that updates instantly | Every modern configurator does this; delay breaks the feedback loop | LOW | React state makes this trivial; no debounce needed for small field sets |
| One-click copy to clipboard | The entire point of a generator is to get code out; no copy = dead end | LOW | `navigator.clipboard.writeText()` + visual confirmation ("Copied!") on button |
| Visual confirmation after copy | Users can't tell if copy worked without feedback | LOW | Button text swap or checkmark icon for ~2s is the universal pattern |
| Field toggle (enable/disable each field) | Reference site already has this; removing it is a regression | LOW | Checkbox or toggle switch per field |
| Categorized field groups | 20+ fields as a flat list is unusable; grouping makes scanning fast | LOW | Reference site already groups by Context Window, Cost, Model, Workspace, Session, Extra |
| Example/placeholder values in preview | Preview with real-looking data (e.g. "42% used") builds trust that the output is correct | LOW | Hard-coded realistic mock values per field type |
| Generated code visible as text | Users want to inspect what they're copying before they copy it | LOW | Syntax-highlighted or monospace textarea/pre block |
| Readable generated code | Script must be human-readable, not minified; developers will inspect it | LOW | Formatted bash with comments; don't compress |
| Clear install/usage instructions | Without "what do I do with this file?", copy is useless | LOW | Inline instructions: `chmod +x`, path to save at, how Claude Code picks it up |
| Responsive layout | Developers use multiple screen sizes including wide monitors and laptops | MEDIUM | Tailwind responsive utilities; two-column on wide, stacked on narrow |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Field reordering (up/down arrows) | Reference site has no reordering — this is the primary stated gap to fix | MEDIUM | Array splice on up/down click; keyboard accessible (arrow keys on focused row) |
| Separator picker | Allows personal preference (pipe, dash, dot, space, none); reference site has no separator control | LOW | Radio group or segmented control; preview updates immediately |
| Terminal-aesthetic UI | Developer tools that look like dev tools get shared; generic Bootstrap tools don't | MEDIUM | Dark palette, monospace fonts, subtle glow on interactive elements, no rounded-cornered card UIs |
| Animated live preview | Seeing the preview react to each toggle feels snappy and trustworthy; static updates feel broken | LOW | CSS transitions on preview line; fade or slide as fields appear/disappear |
| Keyboard-navigable field list | Power users won't reach for the mouse; keyboard nav signals quality | MEDIUM | `tabindex`, space to toggle, arrow keys to move fields up/down |
| Sensible default selection | Opening to a blank state is disorienting; opening to a useful default set feels immediately valuable | LOW | Pre-select ~4 high-value fields: usage %, total cost, model name, git branch |
| Field descriptions on hover/focus | Users may not know what "input tokens" vs "window size" means; inline tooltip prevents guessing | LOW | `title` attribute or small tooltip component per field |
| Copy button near the output (not just at top) | Users scroll down to generated code; button must be adjacent to it | LOW | Sticky or inline copy button in output section |
| "Reset to defaults" control | Configurators benefit from an escape hatch; users experiment and want to undo all changes at once | LOW | Single button that resets field list to default selection and order |
| Permalink / shareable URL (state in hash) | Lets users share their exact config; useful for team standardization | MEDIUM | Serialize config to URL hash (`#fields=cost,model&sep=pipe`); parse on load; deferred to v1.x per PROJECT.md |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Drag-and-drop reordering | Feels more "modern" and discoverable | Touch support is brittle, DnD libraries add bundle weight, and keyboard users are excluded by default; the audience (CLI developers) expects keyboard-first | Up/down arrow buttons with keyboard support — simpler, accessible, sufficient |
| Dark/light mode toggle | Common request on any dark-themed tool | The terminal aesthetic is a deliberate identity choice, not a theme; adding a light mode dilutes the brand and doubles CSS maintenance | Ship dark only; use sufficient contrast to remain readable; don't add toggle |
| Save/load named configurations | Users want to bookmark their exact setup | Requires localStorage state management, naming UI, delete UI — significant scope for a stateless tool | Permalink/hash URL achieves the same thing with no UI overhead |
| Syntax highlighting in output | Generated bash script looks more "professional" highlighted | A lightweight highlighter (e.g. Prism) adds bundle weight and complexity; bash scripts are short enough to read without highlighting | Monospace font + consistent indentation is sufficient; copy is the goal, not reading |
| Server-side generation | "More robust" or for logging/analytics | Adds latency, infra cost, and a failure mode; the tool is trivially static | Keep fully client-side; no server needed |
| Version history / undo stack | Undo accidental changes | Full undo stack is complex state management for a configurator with ~10 toggles | "Reset to defaults" covers 90% of undo needs; individual toggles are trivially re-clickable |
| Import existing script | Parse an existing `statusline.sh` back into the UI | Parsing arbitrary bash is fragile; generated scripts are short enough to reconfigure manually | Document the generated script format clearly so users can reconfigure from scratch in 30 seconds |
| Embed / iframe widget | For documentation pages | Adds CORS/CSP complexity and a second layout mode to maintain | Link directly to the configurator; it's a separate tool |

## Feature Dependencies

```
[Field Toggle]
    └──requires──> [Field List State]
                       └──requires──> [Live Preview]
                                          └──requires──> [Mock Value Map]

[Field Reordering]
    └──requires──> [Field List State]

[Separator Picker]
    └──enhances──> [Live Preview]
    └──enhances──> [Generated Script Output]

[Generated Script Output]
    └──requires──> [Field List State]
    └──requires──> [Separator Picker value]

[Copy to Clipboard]
    └──requires──> [Generated Script Output]

[Reset to Defaults]
    └──requires──> [Field List State]
    └──enhances──> [Field Reordering]

[Permalink / Hash URL]
    └──requires──> [Field List State]
    └──requires──> [Separator Picker value]
    └──conflicts──> [No-backend constraint] (but hash-only is still static)
```

### Dependency Notes

- **Field List State is the root dependency:** Everything — preview, output, reordering, copy — derives from a single ordered array of enabled fields. This state object must be designed first.
- **Live Preview requires Mock Value Map:** Each field needs a realistic placeholder value (e.g., `usage_pct → "42%"`) to render a meaningful preview. This is a data concern, not a UI concern — define it alongside the field registry.
- **Separator Picker enhances both preview and output:** It must feed into the same rendering function used by both the preview and the generated script to stay in sync.
- **Reset to Defaults conflicts with saved-config ideas:** Implementing named save/load makes "reset" ambiguous (reset to saved? to factory?). By deliberately not building save/load, reset stays simple and unambiguous.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Field toggles per field (enable/disable) — core interaction
- [ ] Field reordering via up/down arrows — the primary gap vs reference site
- [ ] Separator picker (pipe, dash, dot, space, custom) — low effort, high personalization value
- [ ] Live preview updating on every change — immediate feedback loop
- [ ] Generated bash script visible in monospace block — what the user will copy
- [ ] One-click copy to clipboard with visual confirmation — the exit point of the tool
- [ ] Sensible default field selection on load — removes blank-state confusion
- [ ] Install/usage instructions inline — prevents "I copied it, now what?" abandonment
- [ ] Terminal aesthetic UI — the brand differentiator; not cosmetic, it's identity

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Permalink / shareable URL via hash — add when users ask "how do I share my config?"
- [ ] Field descriptions / tooltips — add if user feedback shows confusion about field names
- [ ] Keyboard navigation for reordering — add when accessibility feedback arrives
- [ ] "Reset to defaults" button — add when users report frustration after heavy experimentation

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Multiple named config slots — only if team/enterprise use cases emerge
- [ ] Custom field expressions (user-defined bash expressions) — high complexity, niche need
- [ ] Theme variants (e.g., neon green vs. amber vs. cyan terminal palette) — fun, but no user signal yet
- [ ] One-click install via curl | bash — security perceptions around pipe-to-bash are mixed; defer

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Field toggles | HIGH | LOW | P1 |
| Live preview | HIGH | LOW | P1 |
| Generated script output | HIGH | LOW | P1 |
| One-click copy | HIGH | LOW | P1 |
| Copy visual confirmation | HIGH | LOW | P1 |
| Field reordering (up/down) | HIGH | MEDIUM | P1 |
| Separator picker | MEDIUM | LOW | P1 |
| Default field selection | MEDIUM | LOW | P1 |
| Install instructions | MEDIUM | LOW | P1 |
| Terminal aesthetic | MEDIUM | MEDIUM | P1 |
| Field tooltips/descriptions | MEDIUM | LOW | P2 |
| Reset to defaults | MEDIUM | LOW | P2 |
| Keyboard nav for reordering | MEDIUM | MEDIUM | P2 |
| Permalink / hash URL | MEDIUM | MEDIUM | P2 |
| Drag-and-drop reordering | LOW | HIGH | P3 |
| Syntax highlighting output | LOW | MEDIUM | P3 |
| Theme variants | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Reference Site (on-forge.com) | CSS Gradient Generator (cssgradient.io pattern) | JSON Formatter (jsonformatter.org pattern) | Our Approach |
|---------|-------------------------------|----------------------------------------------|-------------------------------------------|--------------|
| Field/option toggles | Checkboxes, no reorder | Sliders + inputs, full control | Mode toggles (format/validate/minify) | Toggles + reorder arrows |
| Live preview | Yes, real-time | Yes, visual canvas | Yes (formatted output panel) | Yes, animated transitions |
| Copy to clipboard | "Copy Code" button | "Copy CSS" button | "Copy" button | One-click + "Copied!" confirmation |
| Visual confirmation on copy | Not observed | Present (button text change) | Present | Button state swap ~2s |
| Separator customization | Not present | N/A | N/A | Segmented control (pipe/dash/dot/space) |
| Field reordering | Not present | N/A (different UX) | N/A | Up/down arrows, keyboard accessible |
| Presets / defaults | Not observed | Built-in presets (linear, radial) | N/A | Sensible default field selection |
| Export format | Bash script | CSS rule | Formatted text | Formatted bash with comments |
| Share/permalink | Not present | URL param (cssgradient.io uses hash) | Not standard | v1.x (hash-based) |
| Install instructions | Minimal (chmod only) | N/A | N/A | Inline: chmod, path, how Claude picks it up |
| Aesthetic | Utilitarian/generic | Colorful marketing site | Utilitarian | Terminal dark, hacker-polished |

## Sources

- Reference site analyzed directly: https://claude-code-statusline.on-forge.com/ (WebFetch, 2026-03-10)
- CSS gradient generator pattern: cssgradient.io (category knowledge; WebFetch access denied)
- JSON formatter pattern: jsonformatter.org, jsonlint.com (category knowledge)
- IDE theme configurator pattern: VS Code theme generator, rainglow.io (category knowledge)
- Shell script generator pattern: explainshell.com, various dotfile generators (category knowledge)
- Tailwind config generator: tailwindcss.com/docs playground (category knowledge)

---
*Feature research for: Interactive web configurator / code generator (terminal tooling)*
*Researched: 2026-03-10*
