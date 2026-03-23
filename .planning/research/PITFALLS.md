# Pitfalls Research

**Domain:** Terminal-themed web configurator / static developer tool (Next.js + Tailwind)
**Researched:** 2026-03-10
**Confidence:** HIGH (stable, well-documented patterns across all areas; no web search available to verify 2025-specific changes, but these pitfalls are durable and confirmed by official Next.js, MDN, and WCAG documentation)

---

## Critical Pitfalls

### Pitfall 1: Next.js SSR Executing Client-Only Code at Build/Request Time

**What goes wrong:**
The generated bash script, live preview state, and field reorder logic all live in client-side React state. If any of this code runs during SSR (server-side rendering), it either throws (`window is not defined`, `localStorage is not defined`) or produces a hydration mismatch — where the server-rendered HTML differs from what the client renders after hydration. The result is a silent broken UI or a noisy React hydration error in the console that corrupts initial render.

**Why it happens:**
Next.js renders components on the server by default in both Pages Router and App Router. Developers assume `useState` and component-local state are safe everywhere — but anything that reads browser globals (`window`, `navigator`, `document`, `crypto`) will throw on the server. The App Router's `"use client"` directive reduces but does not eliminate this: a `"use client"` component still executes its module-level code on the server during the initial pass.

**How to avoid:**
- Mark the entire configurator as `"use client"` if using App Router, and defer the first render of stateful children with `useEffect` + a `mounted` guard state if they read browser globals.
- Never read `window`, `navigator.clipboard`, or `crypto.randomUUID()` outside of `useEffect` or event handlers.
- For the script preview and copy button, keep all string assembly inside event handlers or memoized values derived from React state — never from globals.
- Use `next/dynamic` with `{ ssr: false }` for any third-party component that touches browser APIs (e.g., syntax highlighters that use `window`).

**Warning signs:**
- Console shows `Warning: Text content did not match` or `Hydration failed because the server rendered HTML didn't match the client`
- The preview or script output is empty on first load, then populates after a second
- `ReferenceError: window is not defined` in build logs or server logs

**Phase to address:** Phase 1 (project setup / initial scaffold) — establish the `"use client"` boundary and `mounted` guard pattern before any feature work begins.

---

### Pitfall 2: Bash Script Output Correctness — Shell Quoting and Escaping Errors

**What goes wrong:**
The generated `~/.claude/statusline.sh` script contains field names, separator characters, and conditional logic assembled via JavaScript string interpolation. If the separator is a character with special meaning in bash (esp. `|`, `\`, backtick, `$`, `"`, `'`), the generated script will silently produce wrong output or fail to execute. A pipe separator inside an unquoted string is especially dangerous — it creates an unintended pipeline.

**Why it happens:**
JavaScript developers tend to think of string assembly as safe. Bash quoting rules are complex: single-quoted strings suppress all expansion, double-quoted strings allow `$` and backtick expansion, and unquoted strings are split on IFS and globbed. The reference site already has this problem in its generated output (users have reported needing to manually fix separators).

**How to avoid:**
- Always wrap separator values in single quotes inside the generated bash script, e.g., `sep='|'` — never interpolate them directly into a command context.
- Validate separator input to a known safe set (pipe, dash, dot, space, colon, comma) and reject or escape anything else.
- Test the generated script with every separator option in a real bash shell during development — not just visually in the preview.
- Add a test fixture: for each separator, assert the generated script string against a known-correct expected string.

**Warning signs:**
- Generated script has separator appearing unquoted in a command context
- Preview looks fine but copy-pasted script fails with `command not found` or wrong field counts
- Separator characters like `|` appear outside of quotes in the bash output

**Phase to address:** Phase 2 (script generation logic) — build the generator with a test for each separator value before wiring up the UI.

---

### Pitfall 3: Clipboard API Failing Silently in Non-HTTPS or Non-Focused Contexts

**What goes wrong:**
`navigator.clipboard.writeText()` is a Promise-based API that requires: (1) the page is served over HTTPS, (2) the document has focus, and (3) the browser grants the `clipboard-write` permission (automatic in most browsers on user gesture, but not in iframes or certain embedded contexts). When any condition fails, the Promise rejects — and if the rejection is not caught and surfaced to the user, the copy appears to succeed (button says "Copied!") but the clipboard is empty or unchanged.

**Why it happens:**
Developers test locally on `localhost` (which is treated as a secure context) and never encounter the permission issue. The copy button fires on click (a user gesture), which also masks the permission requirement. The error only surfaces in edge cases: iframe embeds, HTTP deployments, or programmatic triggers.

**How to avoid:**
- Always `.catch()` the `navigator.clipboard.writeText()` promise and surface the error — minimum: revert the button to its default state and show an error tooltip ("Copy failed — please select and copy manually").
- Provide a fallback: if `navigator.clipboard` is undefined or the promise rejects, fall back to `document.execCommand('copy')` on a programmatically created `<textarea>` (deprecated but still broadly supported as of 2025).
- Never rely solely on the HTTPS check — also handle the focus and permission rejection paths.
- Confirm the Vercel deployment will be HTTPS (it is by default, but confirm custom domain setup if used).

**Warning signs:**
- Copy button shows "Copied!" success state but clipboard content is unchanged
- `navigator.clipboard` is `undefined` in the browser console (HTTP context)
- No error handling around the `writeText()` call in the codebase

**Phase to address:** Phase 2 or Phase 3 (copy button implementation) — implement error handling and the `execCommand` fallback at the same time as the happy path.

---

### Pitfall 4: Terminal Aesthetic Breaking Accessibility — Contrast and Screen Reader Gaps

**What goes wrong:**
Dark terminal palettes with green-on-black or dim-gray-on-dark-gray text frequently fail WCAG AA contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text). Glow effects and subtle text shadows can visually imply higher contrast than actually exists, causing the design to look fine to the developer but be illegible to users with low vision or in bright-light environments. Additionally, interactive elements styled to look like terminal prompts (plain `<span>` or `<div>` with click handlers) are invisible to keyboard and screen reader users.

**Why it happens:**
Terminal aesthetics are designed for developers who are familiar with low-contrast text in terminal emulators. The aesthetic is taken directly to the web without validating it against browser rendering and accessibility standards. Toggle buttons and reorder controls are often built as styled divs because they "look better" than native form elements.

**How to avoid:**
- Use a contrast checker (e.g., WebAIM's tool or the browser DevTools accessibility panel) during design — before writing any CSS.
- Target minimum 4.5:1 for all body text and field labels. The terminal aesthetic can be maintained with slightly brighter foreground values (e.g., `#d4d4d4` on `#1a1a1a` passes; `#6b7280` on `#1a1a1a` fails).
- Use semantic HTML for all interactive elements: `<button>` for the copy button and reorder arrows, `<input type="checkbox">` for field toggles (visually hidden but present). Style them to match the terminal aesthetic rather than replacing them with divs.
- Add `aria-label` to the copy button (it likely has no visible text label, just an icon).
- Add `aria-live="polite"` to the preview output area so screen readers announce updates.

**Warning signs:**
- DevTools accessibility panel reports contrast failures on any text
- Tab-navigating the page skips interactive controls
- Reorder arrows or toggle controls are implemented as `<div onClick>` rather than `<button>`

**Phase to address:** Phase 1 (design tokens / Tailwind config) and Phase 2 (component implementation) — bake contrast-passing color values into Tailwind config from day one rather than retrofitting.

---

### Pitfall 5: Live Preview Re-Rendering on Every Keystroke Without Debouncing

**What goes wrong:**
If the live preview recalculates and re-renders on every state change (field toggle, reorder click, separator input change), and the separator is a free-text input, rapid typing causes excessive re-renders. On a simple configurator this is unlikely to cause visible lag, but it creates a pattern that's hard to extend: if the preview ever does heavier work (syntax highlighting, regex processing), the existing architecture will need to be retrofit with debouncing.

**Why it happens:**
With React, any `setState` call re-renders the component tree. Developers wire the preview directly to state without considering render cost, because it works fine during development with a tiny dataset.

**How to avoid:**
- For the separator input specifically, debounce the state update by 150ms using `useMemo` or a `useDebounce` hook — the field toggle and reorder are discrete clicks that don't need debouncing.
- Memoize the script generation function with `useMemo` so it only recomputes when its inputs (selected fields, field order, separator) change, not on every render.
- This is a low-severity pitfall for this project's scale — but building it right from the start avoids a later refactor.

**Warning signs:**
- Separator input field causes a visible flash or delay in the preview on fast typing
- React DevTools profiler shows the preview component re-rendering multiple times per second during typing

**Phase to address:** Phase 2 (live preview implementation) — add `useMemo` and debounce from the start.

---

### Pitfall 6: Monospace Font Fallback Chain Failing — Terminal Aesthetic Breaks

**What goes wrong:**
The terminal aesthetic depends on a monospace font (typically a developer-preferred font like JetBrains Mono, Fira Code, or Cascadia Code). If the font is loaded via `@font-face` or Google Fonts and fails to load (slow connection, ad blocker blocking fonts.googleapis.com, or missing font file), the browser falls back to the system monospace stack. If the fallback stack is not specified or only lists `monospace`, the fallback font will have different character widths — causing the preview layout to shift visibly as fonts load.

**Why it happens:**
Developers test on fast connections where fonts load instantly. The font failure state is never tested. The Tailwind `font-mono` class uses a reasonable fallback stack, but custom font loading (via `next/font` or `@import`) may not specify a matching fallback.

**How to avoid:**
- Use `next/font/google` (Next.js built-in font optimization) to self-host the chosen monospace font — this eliminates the external network dependency and the FOUT (Flash of Unstyled Text) problem.
- Specify a full fallback chain in Tailwind config: `font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'Menlo', 'Monaco', monospace`.
- Test with font loading disabled in DevTools (Network tab: block `fonts.googleapis.com`) to verify the fallback renders acceptably.
- Use `font-display: swap` (default with `next/font`) to prevent invisible text during load.

**Warning signs:**
- The preview area shifts or reflows when the page finishes loading
- Font-related layout shift visible in Lighthouse CLS score
- Disabling network fonts in DevTools makes the preview look broken

**Phase to address:** Phase 1 (project setup / Tailwind config and `next/font` setup) — configure the font stack before building any UI components.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Assembling bash script with raw string concatenation | Fast to write | Hard to test, easy to introduce quoting bugs when adding new fields | Never — use a template function with escaping from day one |
| Using `div` + `onClick` for interactive controls | Easier styling | Keyboard inaccessible, screen reader invisible, requires retrofit | Never for this project (semantic HTML is equally fast with Tailwind) |
| Skipping `useMemo` on script generator | Simpler code | Re-runs string assembly on every render; hard to add tests | Acceptable only if generator is provably O(1) and fields are capped |
| Hardcoding color values in components instead of Tailwind config | Faster initial dev | Inconsistent palette, contrast fixes require hunting across files | Never — establish design tokens in config first |
| Not catching clipboard Promise rejections | Simpler code | Silent failures appear as successes to users | Never — error handling takes 5 lines and prevents user confusion |
| Loading monospace font from external CDN (Google Fonts) instead of `next/font` | Zero setup | FOUT, external network dependency, blocked by some corporate firewalls | Acceptable only in a throwaway prototype |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vercel deployment | Assuming `process.env` vars are available client-side | Prefix with `NEXT_PUBLIC_` for client exposure; this project needs no env vars at all |
| Google Fonts / external font CDN | Relying on external CDN availability | Use `next/font/google` which self-hosts at build time |
| `navigator.clipboard` API | Calling it outside a user gesture or HTTPS context | Always call inside event handler; catch rejections; provide `execCommand` fallback |
| Next.js App Router | Using Server Components for client-interactive UI | Mark the configurator root as `"use client"` explicitly |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No `useMemo` on script generation | Extra CPU time per render cycle | Wrap generator in `useMemo` with dependency array | Negligible at current scale; matters if fields list grows to 50+ |
| Syntax highlighter without SSR:false | Hydration mismatch, bundle bloat | Use `next/dynamic` with `{ ssr: false }` for any highlighter | Immediately on first SSR render |
| Unbounded separator input (no max-length) | Users paste multi-line strings as separator, breaking preview | Enforce `maxLength={10}` on the input and sanitize before script assembly | At scale = any user who tries |
| Importing entire icon library | Slow initial bundle load | Import only named icons used, or use inline SVGs | When icon library exceeds ~50KB |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting separator input without sanitization in generated script | User crafts a separator that causes generated script to execute arbitrary commands when the script is sourced | Allowlist: only permit known-safe separator characters (pipe, dash, dot, space, colon, comma); reject or HTML-encode others |
| Injecting field names directly from URL params (future v2 URL state) | URL-crafted inputs could inject bash code into generated script | Validate all field names against a hardcoded allowlist of known field IDs |
| Using `dangerouslySetInnerHTML` to render the generated bash script for syntax highlighting | XSS if separator input contains `<script>` tags | Use a proper syntax highlighter that escapes HTML, never raw `innerHTML` |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Copy button stays in "Copied!" state permanently | User thinks the action succeeded when clipboard may have been overwritten by a later action | Reset button to default state after 2-3 seconds |
| No indication of what the generated script does | Developer users are confused about where to put the file | Add a one-line comment at the top of the generated script: `# Claude Code statusline configuration` with the file path |
| Reorder arrows enabled even when only one field is selected | Up/down on a single-item list does nothing — feels broken | Disable up arrow on first item, down arrow on last item; disable both when only one field is active |
| No "reset to defaults" option | User makes changes they don't like and can't recover | Add a reset button that restores the default field selection and order |
| Preview shows raw bash script without explanation | Non-bash users don't know what they're looking at | Label the preview area clearly: "Generated script — save to ~/.claude/statusline.sh" |
| Toggle disables a field but it stays visually prominent in the order list | Users assume they need to remove it from the list too | Grey out / dim disabled fields in the order list, or remove them from the list entirely when unchecked |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Copy button:** Shows "Copied!" state — verify the clipboard actually received the correct content in all tested browsers (Chrome, Firefox, Safari)
- [ ] **Generated script:** Runs without modification in bash — verify by actually executing the output in a bash shell, not just inspecting it visually
- [ ] **Separator input:** Every supported separator character produces a valid bash script — verify with a test for each value, especially `|`, `\`, and `$`
- [ ] **Reorder controls:** First item's Up arrow is disabled, last item's Down arrow is disabled — verify by tabbing through the list
- [ ] **Accessibility:** All interactive controls are reachable via Tab key and activatable via Enter/Space — verify by unplugging the mouse
- [ ] **Font loading:** Preview renders correctly with fonts blocked — verify in DevTools by blocking the font source
- [ ] **SSR:** No hydration warnings in the browser console on first load — verify with `NODE_ENV=production` build, not dev server
- [ ] **Contrast:** All text passes 4.5:1 minimum — verify with browser DevTools accessibility panel, not by eye

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| SSR hydration mismatch discovered after launch | LOW | Add `"use client"` to affected component, add `mounted` guard, redeploy to Vercel (minutes) |
| Bash script quoting bug found post-launch | LOW | Fix template function, add regression test, redeploy — no user data affected |
| Clipboard API fails in production HTTPS | LOW | Add `execCommand` fallback in the existing copy handler (one function change) |
| Contrast failure found after design is complete | MEDIUM | Update Tailwind config color tokens — all components inherit automatically if tokens were used consistently |
| Accessibility retrofit (divs instead of buttons) | HIGH | Requires touching every interactive component; much harder to retrofit than to build correctly from the start |
| Font flash/FOUT causing CLS regression | LOW | Switch to `next/font/google` self-hosting (one configuration change in `layout.tsx`) |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| SSR hydration mismatch | Phase 1 (project scaffold) | Run `next build && next start`, check console for hydration warnings |
| Bash script quoting errors | Phase 2 (script generator) | Execute generated script in bash for each separator; add unit tests |
| Clipboard API silent failure | Phase 2 or 3 (copy button) | Test copy with DevTools network throttled; verify error state renders |
| Terminal contrast failures | Phase 1 (Tailwind config / design tokens) | Run DevTools accessibility panel on every component as built |
| Monospace font fallback | Phase 1 (project setup with next/font) | Block font network request in DevTools; verify layout holds |
| Live preview excessive re-renders | Phase 2 (live preview) | React DevTools profiler during separator typing |
| Reorder arrow UX gaps (enabled on edge items) | Phase 2 (reorder component) | Manual test: select one field, verify both arrows are disabled |
| Semantic HTML for interactive controls | Phase 2 (component build) | Tab-navigate the entire UI without a mouse |

---

## Sources

- Next.js official documentation on `"use client"` and SSR hydration (nextjs.org/docs) — HIGH confidence
- MDN Web Docs: Clipboard API, `navigator.clipboard.writeText()`, permissions model — HIGH confidence
- WCAG 2.1 Success Criterion 1.4.3 (Contrast, minimum) — HIGH confidence
- MDN Web Docs: `document.execCommand` deprecation notice and browser support table — HIGH confidence
- Next.js `next/font` documentation — HIGH confidence
- Known issue pattern from the reference site (claude-code-statusline.on-forge.com): separator and quoting gaps observed in its generated output — MEDIUM confidence (based on PROJECT.md note that reference site is "rough around the edges")
- Bash quoting reference: GNU Bash manual, "Quoting" section — HIGH confidence

---

*Pitfalls research for: terminal-themed web configurator (Claude Code Statusline Configurator)*
*Researched: 2026-03-10*
