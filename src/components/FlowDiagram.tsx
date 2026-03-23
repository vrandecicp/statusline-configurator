'use client'

import { useState } from 'react'

type NodeKind = 'global' | 'project' | 'skill' | 'dir'

interface N {
  id: string
  label: string
  kind: NodeKind
  x: number; y: number; w: number; h: number
  simple: string
  description: string
  example?: string
  note?: string
}

const KIND: Record<NodeKind, { stroke: string; bg: string; fg: string }> = {
  global:  { stroke: '#fabd2f', bg: '#1e1e1c', fg: '#fabd2f' },
  project: { stroke: '#d77757', bg: '#1e1e1c', fg: '#d77757' },
  skill:   { stroke: '#8ec07c', bg: '#1e1e1c', fg: '#8ec07c' },
  dir:     { stroke: '#41413e', bg: '#1a1a18', fg: '#9c9a92' },
}

const KIND_LABEL: Record<NodeKind, string> = {
  global:  '🌐 global file',
  project: '📁 project file',
  skill:   '✨ skill / agent',
  dir:     '📂 directory',
}

// ─── Global (~/.claude/) nodes ────────────────────────────────────────────────

const GLOBAL_NODES: N[] = [
  {
    id: 'claude-json', label: '~/.claude.json', kind: 'global',
    x: 22, y: 44, w: 172, h: 32,
    simple: 'Address book for plugins — add MCP servers here, Claude loads them on every start.',
    description: 'Lives directly in your home directory. Stores MCP server registrations. Written by `claude mcp add` — rarely touched by hand. Global: affects all projects.',
    example: '{\n  "mcpServers": {\n    "figma": {\n      "command": "npx",\n      "args": ["-y", "figma-remote-mcp"],\n      "env": { "FIGMA_API_KEY": "figd_..." }\n    }\n  }\n}',
  },
  {
    id: 'global-claude-md', label: 'CLAUDE.md', kind: 'global',
    x: 52, y: 108, w: 148, h: 30,
    simple: 'Your personal rulebook — loaded before every chat, on every project you ever open.',
    description: 'Lives at ~/.claude/CLAUDE.md. Loaded first, before any project-level CLAUDE.md. Write your personal style, language preferences, and universal rules here.',
    example: '# Global Rules\n- Always use TypeScript\n- Prefer functional style\n- Never commit .env files\n- Use conventional commits\n- Respond concisely',
  },
  {
    id: 'global-settings', label: 'settings.json', kind: 'global',
    x: 52, y: 150, w: 148, h: 30,
    simple: 'Your default permission slip — controls what Claude is allowed to do across all projects.',
    description: 'Lives at ~/.claude/settings.json. Sets global permissions (allow/deny tool calls) and hooks (commands that fire before/after tools). Project settings.json merges on top of this.',
    example: '{\n  "permissions": {\n    "allow": ["Bash(git *)", "Bash(npm *)"],\n    "deny": ["Bash(rm -rf *)"]\n  },\n  "hooks": {\n    "PostToolUse": [{\n      "matcher": "Write|Edit",\n      "hooks": [{ "command": "prettier --write $FILE" }]\n    }]\n  }\n}',
    note: 'Project .claude/settings.json overrides individual keys — it does not replace the whole file.',
  },
  {
    id: 'keybindings', label: 'keybindings.json', kind: 'global',
    x: 52, y: 192, w: 148, h: 30,
    simple: 'Your keyboard shortcuts — remap any Claude Code key to something that fits your hands.',
    description: 'Lives at ~/.claude/keybindings.json. Rebinds built-in keys for the Claude Code TUI. You can add chord shortcuts (two-key sequences) too.',
    example: '{\n  "bindings": [\n    { "key": "ctrl+r", "command": "submit" },\n    { "key": "ctrl+shift+c", "command": "clear" }\n  ]\n}',
  },
  {
    id: 'statusline-sh', label: 'statusline.sh', kind: 'global',
    x: 52, y: 234, w: 148, h: 30,
    simple: 'The scoreboard at the bottom of your screen — shows live stats like cost and token count.',
    description: 'Lives at ~/.claude/statusline.sh. Claude Code pipes session JSON to this script on stdin every time the status bar refreshes. The script prints whatever you want to see.',
    example: '#!/usr/bin/env bash\nDATA=$(cat)\ncost=$(echo "$DATA" | jq -r \'.cost_usd // "0.00"\')\ntokens=$(echo "$DATA" | jq -r \'.input_tokens // 0\')\necho "$$${cost} | ${tokens} in"',
    note: 'Use this site\'s /configure page to build your statusline script without writing any code.',
  },
  {
    id: 'memory-dir', label: 'memory/', kind: 'dir',
    x: 52, y: 276, w: 148, h: 30,
    simple: "Claude's diary folder — everything it needs to remember between sessions lives here.",
    description: 'Lives at ~/.claude/memory/. Claude reads files here at session start and writes summaries at the end. Survives /clear and new terminal sessions.',
    note: 'You can ask Claude to "remember" anything and it will write a note here. You can also read or edit these files yourself.',
  },
  {
    id: 'memory-file', label: 'projects/<name>.md', kind: 'global',
    x: 86, y: 316, w: 145, h: 28,
    simple: "One file per project — Claude writes what happened, what's next, and key decisions made.",
    description: 'Lives at ~/.claude/memory/projects/<project-name>.md. Claude updates this at the end of each session. On the next session it reads it back to restore context.',
    example: '## Last Session — 2026-03-11\n- Built auth flow (login, JWT)\n- Next: implement /verify-email route\n- Decision: httpOnly cookies over localStorage',
  },
  {
    id: 'skill-global', label: '<skill>.md', kind: 'skill',
    x: 52, y: 366, w: 148, h: 30,
    simple: 'A slash command you wrote — type /<filename> in any session to run the whole prompt.',
    description: 'Any .md file placed directly in ~/.claude/ or a subdirectory becomes a slash command. Subdirectories create namespaces: ~/.claude/gsd/plan.md → /gsd:plan.',
    example: '# Commit\nCreate a conventional commit for the staged changes.\n1. Run `git diff --staged`\n2. Draft a message following Conventional Commits\n3. Run `git commit -m "..."` with a Co-Authored-By trailer',
    note: 'Namespaced skills: place in ~/.claude/<namespace>/<skill>.md and invoke as /<namespace>:<skill>.',
  },
]

// ─── Project (./) nodes ───────────────────────────────────────────────────────

const PROJECT_NODES: N[] = [
  {
    id: 'project-claude-md', label: 'CLAUDE.md', kind: 'project',
    x: 492, y: 108, w: 152, h: 30,
    simple: "The project's rulebook — commit it so every teammate's Claude follows the same rules.",
    description: 'Lives at ./CLAUDE.md in your project root. Loaded after ~/.claude/CLAUDE.md — it adds to or overrides global rules for this repo only. Commit this file.',
    example: '# Project Rules\n- Use pnpm not npm\n- Run `pnpm test` before committing\n- Components go in src/components/\n- Always check .planning/ for active tasks',
    note: 'Claude also scans parent directories up to the git root — every CLAUDE.md in the tree is loaded.',
  },
  {
    id: 'project-settings', label: 'settings.json', kind: 'project',
    x: 524, y: 192, w: 152, h: 30,
    simple: 'Project overrides — these keys win over your global settings for this repo only.',
    description: 'Lives at ./.claude/settings.json. Merged on top of ~/.claude/settings.json. Add project-specific permissions, hooks, or MCP servers that only apply here.',
    example: '{\n  "mcpServers": {\n    "project-db": {\n      "command": "node",\n      "args": ["./scripts/mcp-server.js"]\n    }\n  },\n  "permissions": {\n    "deny": ["Bash(curl *)"]\n  }\n}',
    note: 'You do not need to repeat global settings here — only write the keys you want to override or add.',
  },
  {
    id: 'agents-dir', label: 'agents/', kind: 'dir',
    x: 524, y: 240, w: 152, h: 30,
    simple: 'The team of specialist helpers for this project — each one is a markdown file.',
    description: 'Lives at ./.claude/agents/. Each .md file here defines a custom sub-agent Claude can spawn via the Agent tool. These agents are only available inside this project.',
    note: 'Commit this folder so your whole team shares the same agents.',
  },
  {
    id: 'agent-file', label: '<name>.md', kind: 'skill',
    x: 558, y: 282, w: 138, h: 28,
    simple: 'A specialist you hired for this project — define its job, its tools, and its rules.',
    description: 'Lives at ./.claude/agents/<name>.md. Defines a sub-agent Claude can spawn. Each agent runs in isolation with its own context window and returns one result to the parent.',
    example: '# .claude/agents/db-migrator.md\nYou are a database migration specialist.\n\n## Tools\nOnly use: Read, Write, Bash(psql *)\n\n## Instructions\n1. Always write a rollback script first\n2. Apply migration\n3. Validate schema\n4. Return pass/fail summary',
    note: 'Use sub-agents to run tasks in parallel or keep long noisy output out of your main chat.',
  },
]

const ALL_NODES = [...GLOBAL_NODES, ...PROJECT_NODES]
const nodeMap = Object.fromEntries(ALL_NODES.map(n => [n.id, n]))

// ─── Tree connector geometry ──────────────────────────────────────────────────

const cy = (n: N) => n.y + n.h / 2

// Global main tree: vertical at x=38, branches to children of ~/.claude/
const G_VX = 38 // vertical line x
const G_CHILDREN = ['global-claude-md', 'global-settings', 'keybindings', 'statusline-sh', 'memory-dir', 'skill-global']
const G_FIRST_CY = cy(nodeMap['global-claude-md'])
const G_LAST_CY  = cy(nodeMap['skill-global'])

// memory/ sub-tree
const M_VX = 70

// Project main tree: vertical at x=510, branches to children of .claude/
const P_VX = 510
const P_CHILDREN = ['project-settings', 'agents-dir']
const P_FIRST_CY = cy(nodeMap['project-settings'])
const P_LAST_CY  = cy(nodeMap['agents-dir'])

// agents/ sub-tree
const A_VX = 544

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ node }: { node: N }) {
  const c = KIND[node.kind]
  return (
    <div className="border border-border rounded-panel bg-surface p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-fg font-medium text-sm break-all">{node.label}</span>
        <span className="font-pixel text-[9px] tracking-widest px-2 py-0.5 rounded border shrink-0"
          style={{ color: c.fg, borderColor: c.stroke }}>
          {KIND_LABEL[node.kind]}
        </span>
      </div>
      <p className="text-sm text-fg leading-relaxed">{node.simple}</p>
      <p className="text-xs text-muted leading-relaxed">{node.description}</p>
      {node.note && (
        <div className="border-l-2 pl-3 text-xs text-muted leading-relaxed"
          style={{ borderColor: c.stroke }}>
          {node.note}
        </div>
      )}
      {node.example && (
        <div className="flex flex-col gap-1.5">
          <span className="font-pixel text-[9px] tracking-widest text-muted">EXAMPLE</span>
          <pre className="text-xs font-mono text-aqua bg-bg rounded p-3 overflow-x-auto leading-relaxed whitespace-pre">
            {node.example}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FlowDiagram() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const sel = selectedId ? nodeMap[selectedId] : null

  function toggle(id: string) {
    setSelectedId(p => p === id ? null : id)
  }

  const lineProps = { stroke: '#41413e', strokeWidth: 1, strokeOpacity: 0.55 }
  const arrowColor = '#9c9a92'

  return (
    <div className="flex flex-col gap-6">

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {(Object.entries(KIND) as [NodeKind, typeof KIND[NodeKind]][]).map(([kind, c]) => (
          <div key={kind} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm border" style={{ borderColor: c.stroke, backgroundColor: c.bg }} />
            <span className="font-pixel text-[9px] tracking-widest" style={{ color: c.fg }}>{kind}</span>
          </div>
        ))}
        <div className="ml-auto font-pixel text-[9px] tracking-widest text-border">
          CLICK A FILE TO LEARN MORE
        </div>
      </div>

      {/* Tree diagram */}
      <div className="overflow-x-auto rounded-panel border border-border bg-surface">
        <svg viewBox="0 0 900 430" style={{ width: '100%', minWidth: 620, display: 'block' }}
          fontFamily="var(--font-mono), ui-monospace, monospace">

          <defs>
            <marker id="rel-arrow" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
              <path d="M 0 0 L 6 2.5 L 0 5 Z" fill={arrowColor} />
            </marker>
          </defs>

          {/* ── Global region ── */}
          <rect x="8" y="8" width="405" height="412" rx="5"
            fill="none" stroke="#fabd2f" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5 3" />
          <text x="16" y="24" fontSize="9" fill="#fabd2f" fillOpacity="0.55" letterSpacing="2"
            fontFamily="var(--font-pixel), sans-serif">~/ GLOBAL</text>

          {/* ~/.claude/ dir header */}
          <text x="22" y="96" fontSize="9" fill="#9c9a92" fillOpacity="0.6" letterSpacing="1"
            fontFamily="var(--font-pixel), sans-serif">~/.claude/</text>

          {/* Global main tree vertical */}
          <line x1={G_VX} y1={G_FIRST_CY} x2={G_VX} y2={G_LAST_CY} {...lineProps} />

          {/* Global horizontal branches */}
          {G_CHILDREN.map(id => {
            const n = nodeMap[id]
            return <line key={id} x1={G_VX} y1={cy(n)} x2={n.x} y2={cy(n)} {...lineProps} />
          })}

          {/* Memory sub-tree */}
          <line x1={M_VX} y1={cy(nodeMap['memory-dir'])} x2={M_VX} y2={cy(nodeMap['memory-file'])} {...lineProps} />
          <line x1={M_VX} y1={cy(nodeMap['memory-file'])} x2={nodeMap['memory-file'].x} y2={cy(nodeMap['memory-file'])} {...lineProps} />

          {/* ── Project region ── */}
          <rect x="460" y="8" width="432" height="412" rx="5"
            fill="none" stroke="#d77757" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5 3" />
          <text x="468" y="24" fontSize="9" fill="#d77757" fillOpacity="0.55" letterSpacing="2"
            fontFamily="var(--font-pixel), sans-serif">./ PROJECT</text>

          {/* .claude/ dir header */}
          <text x="492" y="174" fontSize="9" fill="#9c9a92" fillOpacity="0.6" letterSpacing="1"
            fontFamily="var(--font-pixel), sans-serif">.claude/</text>

          {/* Project .claude/ vertical */}
          <line x1={P_VX} y1={P_FIRST_CY} x2={P_VX} y2={P_LAST_CY} {...lineProps} />
          {P_CHILDREN.map(id => {
            const n = nodeMap[id]
            return <line key={id} x1={P_VX} y1={cy(n)} x2={n.x} y2={cy(n)} {...lineProps} />
          })}

          {/* agents/ sub-tree */}
          <line x1={A_VX} y1={cy(nodeMap['agents-dir'])} x2={A_VX} y2={cy(nodeMap['agent-file'])} {...lineProps} />
          <line x1={A_VX} y1={cy(nodeMap['agent-file'])} x2={nodeMap['agent-file'].x} y2={cy(nodeMap['agent-file'])} {...lineProps} />

          {/* ── Relationship arrows ── */}

          {/* CLAUDE.md load order */}
          {(() => {
            const gn = nodeMap['global-claude-md']
            const pn = nodeMap['project-claude-md']
            const x1 = gn.x + gn.w, y1 = cy(gn)
            const x2 = pn.x,        y2 = cy(pn)
            const mx = (x1 + x2) / 2
            return (
              <g>
                <path d={`M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
                  fill="none" stroke={arrowColor} strokeWidth="1" strokeOpacity="0.5"
                  strokeDasharray="3 3" markerEnd="url(#rel-arrow)" />
                <text x={mx} y={(y1 + y2) / 2 - 6} fontSize="8" fill={arrowColor} fillOpacity="0.7"
                  textAnchor="middle" fontFamily="var(--font-pixel), sans-serif">loads first</text>
              </g>
            )
          })()}

          {/* settings.json merge */}
          {(() => {
            const gn = nodeMap['global-settings']
            const pn = nodeMap['project-settings']
            const x1 = gn.x + gn.w, y1 = cy(gn)
            const x2 = pn.x,        y2 = cy(pn)
            const mx = (x1 + x2) / 2
            return (
              <g>
                <path d={`M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
                  fill="none" stroke={arrowColor} strokeWidth="1" strokeOpacity="0.5"
                  strokeDasharray="3 3" markerEnd="url(#rel-arrow)" />
                <text x={mx} y={(y1 + y2) / 2 - 6} fontSize="8" fill={arrowColor} fillOpacity="0.7"
                  textAnchor="middle" fontFamily="var(--font-pixel), sans-serif">project overrides</text>
              </g>
            )
          })()}

          {/* ── All nodes ── */}
          {ALL_NODES.map(n => {
            const c = KIND[n.kind]
            const isSelected = n.id === selectedId
            const isDir = n.kind === 'dir'
            return (
              <g key={n.id}
                style={{ cursor: isDir ? 'default' : 'pointer' }}
                onClick={() => !isDir && toggle(n.id)}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="4"
                  fill={isSelected ? c.fg + '18' : c.bg}
                  stroke={isSelected ? c.fg : c.stroke}
                  strokeWidth={isSelected ? 1.5 : 1}
                  strokeDasharray={isDir ? '4 3' : undefined} />
                <text x={n.x + n.w / 2} y={n.y + n.h / 2}
                  fontSize={n.kind === 'dir' ? 9.5 : 10.5}
                  fill={isSelected ? c.fg : n.kind === 'dir' ? '#9c9a92' : c.fg}
                  textAnchor="middle" dominantBaseline="middle"
                  fontWeight={isSelected ? '600' : '400'}>
                  {n.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Detail panel */}
      {sel ? (
        <DetailPanel node={sel} />
      ) : (
        <div className="border border-border border-dashed rounded-panel p-5 flex items-center justify-center min-h-[80px]">
          <span className="font-pixel text-[9px] tracking-widest text-border">[ CLICK ANY FILE TO INSPECT ]</span>
        </div>
      )}
    </div>
  )
}
