# Stack Research

**Domain:** Developer-facing static web configurator tool (terminal aesthetic)
**Researched:** 2026-03-10
**Confidence:** MEDIUM — Core framework versions verified via official docs. Library versions for animation, highlighting, and DnD are from training data; exact versions should be confirmed before install.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x (latest) | Framework + static export | Already decided. `output: 'export'` produces fully static HTML/CSS/JS in `out/` with zero server required. App Router is the recommended path as of 2025+. Static export confirmed production-ready in v13.4+; verified at v15/16 docs. |
| React | 19.2.x | UI component model | Ships with Next.js. React 19 Compiler (v1.0 stable since Oct 2025) enables automatic memoization — meaningful for a live-preview tool where many components re-render on every keystroke. |
| TypeScript | 5.x (>=5.1 required by Next.js) | Type safety | `create-next-app` defaults to TypeScript. Prevents runtime bugs in the field-ordering/config state logic. Non-negotiable for this type of state-heavy tool. |
| Tailwind CSS | 4.2 | Utility-first styling | Already decided. v4 uses `@tailwindcss/postcss` instead of old PostCSS plugin; import is `@import "tailwindcss"` in CSS. Built-in `dark:` prefix and `text-green-400`, `shadow-green-500/50` utilities cover terminal aesthetic without custom CSS. |

**Verified sources:** Next.js docs v16.1.6 (2026-02-27), Tailwind v4 install guide, React 19.2 changelog.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion (formerly framer-motion) | ^11.x | Animations, glow pulses, list reorder transitions | Use for the animated transitions when fields are toggled/reordered. `AnimatePresence` handles mount/unmount of field chips. `layout` prop on list items gives fluid reorder animation even with arrow-key interactions (no drag needed). |
| react-syntax-highlighter | ^15.x | Bash script syntax highlighting in the preview pane | The generated `~/.claude/statusline.sh` is a bash script. This library wraps highlight.js and Prism; use with Prism and the `atomDark` or `vsDark` theme for terminal look. Ships with bash grammar built-in. LOW confidence on exact version — verify on npm. |
| clsx | ^2.x | Conditional class merging | Compose terminal-themed class strings cleanly (active state, glow borders, disabled states) without string concatenation bugs. Tiny (<1 KB). |
| tailwind-merge | ^2.x | Merge Tailwind classes without conflicts | Required alongside clsx when overriding Tailwind classes in component variants. Pair as `cn = (args) => twMerge(clsx(args))`. |

**Confidence notes:**
- `motion` package: HIGH confidence it exists and is the correct rename from `framer-motion`; exact version not verified via official docs in this session due to WebFetch denials. Verify with `npm show motion version`.
- `react-syntax-highlighter`: MEDIUM confidence — widely used, but last major activity was 2022-2023. It remains the most frictionless option for React + bash highlighting. Alternative: use `shiki` directly (see Alternatives section).

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Turbopack | Dev server bundler (replaces webpack) | Default in Next.js 15+ (`next dev` uses Turbopack automatically). Do not pass `--webpack` flag — Turbopack cuts cold-start time significantly. |
| ESLint | Linting | `create-next-app` sets this up. Note: as of Next.js 16, `next build` no longer auto-runs lint — run it explicitly in CI with `npm run lint`. |
| Biome | Optional: linter + formatter alternative | Faster than ESLint + Prettier combo. Use if you want a single tool for lint and format. Not compatible with all ESLint plugins, so only choose it at project start. |

## Installation

```bash
# Bootstrap project (includes TypeScript, Tailwind v4, ESLint, App Router, Turbopack)
npx create-next-app@latest statusline-configurator --typescript --eslint --tailwind --app --yes

# Animation
npm install motion

# Syntax highlighting
npm install react-syntax-highlighter
npm install -D @types/react-syntax-highlighter

# Class utilities
npm install clsx tailwind-merge
```

**Tailwind v4 with Next.js uses PostCSS (not Vite plugin):**
```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

`postcss.config.mjs`:
```javascript
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

`app/globals.css`:
```css
@import "tailwindcss";
```

## Alternatives Considered

### Framework: Next.js vs Astro vs Vite + React

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 15 (static export) | Astro 5 | When the site is primarily content/markdown with islands of interactivity. Astro's Island architecture shines for blogs, docs, and marketing sites. For a single-page configurator that is 100% interactive React state, Astro adds the `client:load` directive overhead with no benefit. |
| Next.js 15 (static export) | Vite + React (no framework) | When you want the absolute minimum setup for a pure SPA with no routing. Valid choice here — the configurator is a single page. Downside: no built-in file-system routing, no `next/font` for monospace font loading, no Vercel deployment integration. Next.js with `output: 'export'` is equivalent in output but has better tooling. |
| Next.js 15 (static export) | Vite + React Router v7 | Only if you need client-side routing across multiple pages. Not needed here — this is a single-page tool. |

**Verdict on framework:** Next.js is marginally overkill for a single-page tool but is the right call given: (1) it's already decided, (2) Vercel deployment is zero-config, (3) `create-next-app` with Tailwind + TypeScript scaffolds instantly, (4) React Compiler is opt-in without migration cost.

### Animation: motion vs CSS animations vs no library

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| motion (framer-motion) | Pure CSS animations / Tailwind `animate-*` | When animations are simple and non-interactive. For static glow pulses (`animate-pulse`, custom keyframes), pure CSS is lighter. Use CSS for the scanline effect and ambient glow; reserve `motion` for interactive transitions (field reorder, panel entrance). |
| motion | React Spring | When you need physics-based spring animations. Heavier API, not necessary here since the terminal aesthetic favors snappy/eased transitions over bouncy physics. |

### Syntax Highlighting: react-syntax-highlighter vs shiki vs prism-react-renderer

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| react-syntax-highlighter | shiki | When SSG/build-time highlighting is acceptable. Shiki uses VS Code grammars (TextMate), produces the most accurate highlighting, and has zero runtime. Ideal for static code blocks. For a live-updating script preview that re-highlights on every change, Shiki's async API adds complexity. If the generated script is simple enough to highlight with string regex, shiki is worth it. |
| react-syntax-highlighter | prism-react-renderer | Lighter than react-syntax-highlighter (no highlight.js bundled), uses same Prism engine. Maintained by the Radix team. Preferred for simple bash scripts where you only need a few token types. |

**Revised recommendation:** Given the generated script is small and always bash, `prism-react-renderer` (^2.x) is actually lighter than `react-syntax-highlighter`. Either works; `prism-react-renderer` is the leaner choice.

### Deployment: Vercel vs Cloudflare Pages vs Netlify

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vercel (Hobby free tier) | Cloudflare Pages | When you need unlimited bandwidth or a non-Vercel CDN. Cloudflare Pages supports Next.js static exports (drop the `out/` folder as output). Free tier is genuinely unlimited bandwidth. Tradeoff: Cloudflare does not deeply integrate with Next.js server features (but for static export, this is irrelevant). |
| Vercel | Netlify | When team already uses Netlify or needs form handling / identity features. Netlify's free tier caps at 100 GB/month bandwidth. For a low-traffic dev tool, either works. Vercel is better for zero-config Next.js deployment. |

**Verdict on deployment:** Vercel is the right default. It is maintained by the Next.js team; `vercel --prod` from the CLI deploys the `out/` folder in seconds. No configuration needed. For a developer tool that might go viral (e.g., posted on Hacker News), Cloudflare Pages is a prudent backup due to its unlimited bandwidth free tier.

### Terminal Theming: CSS Variables vs shadcn/ui vs custom Tailwind config

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Custom Tailwind theme via CSS variables | shadcn/ui | shadcn/ui is excellent for product UIs with standard components (dialogs, dropdowns, data tables). For a terminal aesthetic requiring custom glow borders, CRT scanlines, and monospace-first typography, shadcn's Radix-based components are more constraint than aid. Use CSS variables for the palette; build components from scratch. |
| Custom Tailwind theme | Vanilla Extract / CSS Modules | Only when you need static typing of CSS variables. Unnecessary overhead for this scale. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-dnd` or `@dnd-kit/core` | Full drag-and-drop library is overhead when the design uses up/down arrows. DnD libraries add significant bundle weight (20-50 KB+) and accessibility complexity. | Simple `useState` array with swap logic on button click. Motion `layout` prop provides the visual transition automatically. |
| Prism.js (vanilla, not react wrapper) | Requires direct DOM mutation, clashes with React's rendering model. Known to cause hydration issues in Next.js. | `react-syntax-highlighter` or `prism-react-renderer` (React-aware wrappers). |
| `next export` CLI command | Removed in Next.js 14+. Running it will fail. | `output: 'export'` in `next.config.js` + `next build`. |
| shadcn/ui | Brings Radix primitives and opinionated design tokens that work against the hand-crafted terminal look. Worth it for a SaaS dashboard; not for this tool. | Custom Tailwind utilities with CSS variables for the color palette. |
| webpack (manual) | Turbopack is now the default in Next.js 15+ and is significantly faster in dev. Forcing webpack via `--webpack` flag offers no benefit here. | Default Turbopack (just run `next dev`). |
| `highlight.js` (standalone) | Bundle size is large (~900 KB unminified for all languages). For highlighting only bash, tree-shaking requires manual configuration. | `react-syntax-highlighter` with Prism renderer (auto tree-shakes to only needed languages). |

## Stack Patterns by Variant

**If the generated script grows complex (multiple sections, heredocs, comments):**
- Switch to `shiki` for build-time highlighting with VS Code grammar accuracy
- Accept the async API overhead in exchange for correct tokenization
- Use `createHighlighter()` once at module load, then call `.codeToHtml()` per update

**If you later add URL-based config sharing (v2 feature):**
- Add `nuqs` (^2.x) for URL search params as state — zero-config, Next.js-aware
- Keep all config in URL params; no backend or localStorage needed
- `nuqs` handles serialization/parsing of the field list and separator

**If the terminal aesthetic needs a CRT scanline effect:**
- Implement as a CSS pseudo-element overlay with `repeating-linear-gradient`
- No library needed; use a Tailwind arbitrary value or a dedicated CSS file
- Keep opacity at 2-4% to avoid accessibility issues (photosensitivity)

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15 | React 19.2 | App Router requires React 19; Pages Router can use React 18. |
| Next.js 15 | Tailwind CSS 4.2 (via @tailwindcss/postcss) | Use PostCSS config, not Vite plugin. |
| Next.js 15 | Node.js >=20.9 | Minimum Node version confirmed in official docs. |
| motion ^11 | React 19 | Motion v11+ supports React 19. Earlier versions (^10) had React 19 compatibility issues. Verify with `npm show motion peerDependencies`. |
| react-syntax-highlighter ^15 | React 18/19 | No known issues. Verify peer deps at install time. |

## Sources

- Next.js official docs (nextjs.org/docs/app/guides/static-exports) — static export support, unsupported features, `output: 'export'` config. Verified 2026-02-27, version 16.1.6. HIGH confidence.
- Next.js official docs (nextjs.org/docs/app/getting-started/installation) — Node.js >=20.9 requirement, TypeScript >=5.1, Turbopack default. HIGH confidence.
- Tailwind CSS v4 install guide (tailwindcss.com/docs/installation/framework-guides/nextjs) — `@tailwindcss/postcss` package, PostCSS config, `@import "tailwindcss"`. HIGH confidence.
- React 19 changelog (react.dev/versions) — v19.2.1 stable as of Dec 2025, React Compiler v1.0 released Oct 2025. MEDIUM confidence (from WebFetch summary).
- Vercel Next.js docs (vercel.com/docs/frameworks/nextjs) — zero-config deployment, ISR, static export support on Vercel CDN. HIGH confidence.
- motion.dev, framer/motion GitHub — package renamed from `framer-motion` to `motion`; v11+ is current. LOW-MEDIUM confidence (WebFetch denied; based on training data up to Aug 2025, which matches the rename). Verify: `npm show motion version`.
- react-syntax-highlighter, prism-react-renderer — existence and bash support. MEDIUM confidence from training data. Verify at npm before pinning.

---
*Stack research for: Claude Code Statusline Configurator (terminal-aesthetic static web configurator)*
*Researched: 2026-03-10*
