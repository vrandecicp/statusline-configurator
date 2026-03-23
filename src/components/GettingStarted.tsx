'use client'

import { useState } from 'react'
import { CopyButton } from '@/components/CopyButton'

// ─── Types ─────────────────────────────────────────────────────────────────────

type StepCategory = 'SETUP' | 'CONFIG' | 'WORKFLOW' | 'BONUS'

interface StepCommand {
  code: string
  label?: string
}

interface StepCallout {
  kind: 'pitfall' | 'tip' | 'note'
  text: string
}

interface Step {
  id: string
  number: number
  category: StepCategory
  title: string
  tagline: string
  body: React.ReactNode
  commands: StepCommand[]
  callout?: StepCallout
  cta?: { label: string; href: string }
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: Record<StepCategory, { label: string; color: string }> = {
  SETUP:    { label: 'SETUP',    color: '#fabd2f' },
  CONFIG:   { label: 'CONFIG',   color: '#d77757' },
  WORKFLOW: { label: 'WORKFLOW', color: '#8ec07c' },
  BONUS:    { label: 'BONUS',    color: '#9c9a92' },
}

// ─── Steps ─────────────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    id: 'install',
    number: 1,
    category: 'SETUP',
    title: 'INSTALL',
    tagline: 'Install Claude Code globally via npm.',
    body: (
      <p className="text-xs text-muted font-mono leading-relaxed">
        Install the CLI globally. Requires Node.js 18+. After install, the{' '}
        <code className="text-aqua">claude</code> command should be on your PATH.
        If it isn&apos;t, your shell&apos;s <code className="text-aqua">PATH</code> likely
        doesn&apos;t include npm&apos;s global bin directory.
      </p>
    ),
    commands: [
      { code: 'npm install -g @anthropic-ai/claude-code' },
      { code: 'claude --version' },
    ],
    callout: {
      kind: 'pitfall',
      text: 'PATH issue: run `npm config get prefix` to find the global bin folder, then add it to your shell profile (e.g. export PATH="$PATH:$(npm config get prefix)/bin").',
    },
  },
  {
    id: 'authenticate',
    number: 2,
    category: 'SETUP',
    title: 'AUTHENTICATE',
    tagline: 'Log in on first run — subscription or API key both work.',
    body: (
      <p className="text-xs text-muted font-mono leading-relaxed">
        Run <code className="text-aqua">claude</code> from any directory. On first launch it
        opens a browser to authenticate. You can use a{' '}
        <code className="text-aqua">claude.ai</code> subscription (Pro/Teams) or an{' '}
        <code className="text-aqua">ANTHROPIC_API_KEY</code> environment variable for direct
        API access. API key usage is billed separately from subscriptions.
      </p>
    ),
    commands: [
      { code: 'claude' },
    ],
    callout: {
      kind: 'tip',
      text: 'Prefer API key for CI/CD automation. Set ANTHROPIC_API_KEY in your environment and Claude Code skips the browser auth flow entirely.',
    },
  },
  {
    id: 'global-rules',
    number: 3,
    category: 'CONFIG',
    title: 'GLOBAL RULES',
    tagline: 'Write your personal rulebook — loaded on every project.',
    body: (
      <p className="text-xs text-muted font-mono leading-relaxed">
        <code className="text-aqua">~/.claude/CLAUDE.md</code> is your permanent memory.
        It loads before every conversation, in every project. Use it for personal
        preferences: language, style, commit conventions, things Claude should never do.
        Think of it as your system prompt that follows you everywhere.
      </p>
    ),
    commands: [
      {
        label: 'FILE PATH',
        code: '~/.claude/CLAUDE.md',
      },
      {
        label: 'STARTER TEMPLATE',
        code: `# Global Rules

## Style
- Always use TypeScript
- Prefer functional style over classes
- Keep responses concise

## Git
- Use conventional commits (feat:, fix:, docs:)
- Never commit .env or secrets

## Behavior
- Ask before running destructive commands
- Explain trade-offs when multiple approaches exist`,
      },
    ],
    callout: {
      kind: 'tip',
      text: 'This is permanent memory. Anything you want Claude to always know or always do goes here — not in the chat.',
    },
  },
  {
    id: 'project-context',
    number: 4,
    category: 'CONFIG',
    title: 'PROJECT CONTEXT',
    tagline: 'Add a CLAUDE.md to each repo — commit it for your team.',
    body: (
      <p className="text-xs text-muted font-mono leading-relaxed">
        A <code className="text-aqua">./CLAUDE.md</code> in your project root layers on top of
        your global rules. It&apos;s the right place for project-specific context: stack,
        conventions, architecture notes, and commands. Commit it — every teammate who opens
        Claude Code in this repo inherits the same context automatically.
      </p>
    ),
    commands: [
      {
        label: 'FILE PATH',
        code: './CLAUDE.md',
      },
      {
        label: 'EXAMPLE',
        code: `# Project: my-app

## Stack
- Next.js 15, TypeScript, Tailwind
- Postgres via Drizzle ORM
- Tests: Vitest + React Testing Library

## Commands
- \`npm run dev\`   — dev server
- \`npm run test\`  — run all tests
- \`npm run build\` — production build

## Conventions
- Components in src/components/
- DB queries in src/db/
- No default exports`,
      },
    ],
    callout: {
      kind: 'note',
      text: 'You can also place CLAUDE.md files in subdirectories — Claude loads them when working in those folders.',
    },
  },
  {
    id: 'permissions',
    number: 5,
    category: 'WORKFLOW',
    title: 'PERMISSIONS',
    tagline: 'Control what Claude can run with allow/deny rules.',
    body: (
      <p className="text-xs text-muted font-mono leading-relaxed">
        <code className="text-aqua">~/.claude/settings.json</code> (global) and{' '}
        <code className="text-aqua">.claude/settings.json</code> (project) control which
        tool calls Claude can make without asking. Project settings merge on top of global
        — they don&apos;t replace them. Use glob patterns to allow specific commands and deny
        dangerous ones.
      </p>
    ),
    commands: [
      {
        label: '~/.claude/settings.json',
        code: `{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm run *)",
      "Bash(npx *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(curl * | bash *)"
    ]
  }
}`,
      },
    ],
    callout: {
      kind: 'pitfall',
      text: 'Avoid allow: ["Bash(*)"]. It grants Claude unrestricted shell access. Prefer explicit patterns for the commands you actually use.',
    },
  },
  {
    id: 'workflow',
    number: 6,
    category: 'WORKFLOW',
    title: 'WORKFLOW',
    tagline: 'Explore → Plan → Code. Keep context fresh.',
    body: (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted font-mono leading-relaxed">
          The most effective pattern: first ask Claude to{' '}
          <code className="text-aqua">explore</code> relevant files, then ask it to{' '}
          <code className="text-aqua">plan</code> the approach (without coding yet), then
          execute. Use <code className="text-aqua">/clear</code> between unrelated tasks to
          prevent stale context from polluting responses.
        </p>
        <p className="text-xs text-muted font-mono leading-relaxed">
          Be specific. Instead of "fix the bug", say "the login form throws a 401 when
          email has uppercase letters — here&apos;s the error…". Vague prompts produce vague
          code.
        </p>
      </div>
    ),
    commands: [
      {
        label: 'PATTERN',
        code: `# Step 1 — orient Claude
"Read src/auth/ and explain how sessions work."

# Step 2 — plan without executing
"Plan how to fix the 401 bug. Don't write code yet."

# Step 3 — execute
"Implement the plan."`,
      },
    ],
    callout: {
      kind: 'note',
      text: 'Rate limits: Claude Code uses credits. Long back-and-forths burn context fast. /clear resets the window and is free.',
    },
  },
  {
    id: 'statusline',
    number: 7,
    category: 'BONUS',
    title: 'STATUSLINE',
    tagline: 'See model, cost, and token usage live in your terminal.',
    body: (
      <p className="text-xs text-muted font-mono leading-relaxed">
        Claude Code can show a live statusline in your terminal — model name, token count,
        cost, and active tool. It&apos;s off by default. Use the configurator below to build
        your statusline string, then drop it into your{' '}
        <code className="text-aqua">~/.claude/settings.json</code>.
      </p>
    ),
    commands: [
      {
        label: 'EXAMPLE OUTPUT',
        code: ' claude-sonnet-4-6 │ ↑1.2k ↓340 │ $0.023 │ ✦ Bash',
      },
    ],
    callout: {
      kind: 'tip',
      text: 'A good statusline makes rate limits visible — you can see exactly when you\'re burning tokens fast and decide to /clear.',
    },
    cta: { label: 'Open Configurator →', href: '/' },
  },
]

// ─── Sub-components ─────────────────────────────────────────────────────────────

function NumberBadge({
  number,
  color,
  isOpen,
}: {
  number: number
  color: string
  isOpen: boolean
}) {
  return (
    <span
      className="shrink-0 w-7 h-7 flex items-center justify-center rounded border font-pixel text-[11px] transition-shadow duration-200"
      style={{
        color,
        borderColor: color,
        boxShadow: isOpen ? `0 0 6px ${color}55` : 'none',
      }}
    >
      {String(number).padStart(2, '0')}
    </span>
  )
}

function CommandBlock({ command }: { command: StepCommand }) {
  return (
    <div className="flex flex-col gap-1">
      {command.label && (
        <span className="font-pixel text-[9px] tracking-widest text-muted">
          {command.label}
        </span>
      )}
      <div className="flex items-start gap-2">
        <pre className="flex-1 text-xs font-mono text-aqua bg-bg rounded p-3 overflow-x-auto whitespace-pre">
          {command.code}
        </pre>
        <div className="shrink-0 pt-1.5">
          <CopyButton text={command.code} />
        </div>
      </div>
    </div>
  )
}

function Callout({ callout, catColor }: { callout: StepCallout; catColor: string }) {
  const borderColor = callout.kind === 'pitfall' ? '#d77757' : catColor
  const label =
    callout.kind === 'pitfall' ? 'PITFALL' : callout.kind === 'tip' ? 'TIP' : 'NOTE'

  return (
    <div
      className="border-l-2 pl-3 text-xs text-muted font-mono leading-relaxed"
      style={{ borderColor }}
    >
      <span className="font-pixel text-[9px] tracking-widest mr-2" style={{ color: borderColor }}>
        {label}
      </span>
      {callout.text}
    </div>
  )
}

function StepRow({ step, isOpen, onToggle }: { step: Step; isOpen: boolean; onToggle: () => void }) {
  const cat = CATEGORIES[step.category]

  return (
    <div
      className="rounded-panel transition-colors"
      style={{
        border: isOpen ? `1px solid ${cat.color}44` : '1px solid var(--color-border, #41413e)',
        backgroundColor: isOpen ? 'var(--color-surface, #1e1e1c)' : 'transparent',
        borderLeft: isOpen ? `2px solid ${cat.color}` : undefined,
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors rounded-panel"
      >
        <NumberBadge number={step.number} color={cat.color} isOpen={isOpen} />

        {/* Category chip — hidden on mobile */}
        <span
          className="hidden sm:inline-block shrink-0 font-pixel text-[9px] tracking-widest px-2 py-0.5 rounded border"
          style={{ color: cat.color, borderColor: `${cat.color}66` }}
        >
          {cat.label}
        </span>

        {/* Title + tagline */}
        <span className="flex-1 min-w-0">
          <span className="font-pixel text-[11px] tracking-widest text-fg">{step.title}</span>
          {!isOpen && (
            <span className="ml-3 text-xs font-mono text-muted truncate hidden sm:inline">
              {step.tagline}
            </span>
          )}
        </span>

        {/* Chevron */}
        <svg
          className="shrink-0 w-4 h-4 text-muted transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Expandable body */}
      <div
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{
          maxHeight: isOpen ? '900px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-4 pb-4 flex flex-col gap-4">
          {/* Divider */}
          <div className="border-t border-border" />

          {/* Body text */}
          {step.body}

          {/* Commands */}
          {step.commands.length > 0 && (
            <div className="flex flex-col gap-3">
              {step.commands.map((cmd, i) => (
                <CommandBlock key={i} command={cmd} />
              ))}
            </div>
          )}

          {/* Callout */}
          {step.callout && <Callout callout={step.callout} catColor={cat.color} />}

          {/* CTA */}
          {step.cta && (
            <a
              href={step.cta.href}
              className="self-start font-pixel text-[10px] tracking-widest px-3 py-1.5 rounded border transition-colors hover:opacity-80"
              style={{ color: cat.color, borderColor: `${cat.color}88` }}
            >
              {step.cta.label}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Export ────────────────────────────────────────────────────────────────

export function GettingStarted() {
  const [openIds, setOpenIds] = useState<string[]>([])

  function toggle(id: string) {
    setOpenIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {STEPS.map(step => (
        <StepRow
          key={step.id}
          step={step}
          isOpen={openIds.includes(step.id)}
          onToggle={() => toggle(step.id)}
        />
      ))}
    </div>
  )
}
