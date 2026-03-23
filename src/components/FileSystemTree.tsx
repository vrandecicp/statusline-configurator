'use client'

import { useState } from 'react'

type Scope = 'global' | 'local' | 'both'

interface TreeNode {
  id: string
  name: string
  type: 'file' | 'dir'
  scope: Scope
  description: string
  example?: string
  note?: string
  children?: TreeNode[]
}

const SCOPE_COLOR: Record<Scope, string> = {
  global: '#d77757',
  local: '#8ec07c',
  both: '#fabd2f',
}

const SCOPE_LABEL: Record<Scope, string> = {
  global: '~/.claude/ only',
  local: 'project only',
  both: 'global + local',
}

const TREE: TreeNode[] = [
  {
    id: 'global-json',
    name: '~/.claude.json',
    type: 'file',
    scope: 'global',
    description:
      'Primary global config file. Stores MCP server registrations, auth state, and user-level preferences. Written automatically by `claude mcp add` and the settings UI — rarely edited by hand.',
    example:
      '{\n  "mcpServers": {\n    "figma": {\n      "command": "npx",\n      "args": ["-y", "figma-remote-mcp"],\n      "env": { "FIGMA_API_KEY": "..." }\n    },\n    "github": {\n      "command": "npx",\n      "args": ["@modelcontextprotocol/server-github"]\n    },\n    "context7": {\n      "command": "npx",\n      "args": ["-y", "@upstash/context7-mcp"]\n    }\n  }\n}',
    note: 'Add servers with: claude mcp add <name> -- <command> [args]. Remove with: claude mcp remove <name>. List with: claude mcp list.',
  },
  {
    id: 'global-root',
    name: '~/.claude/',
    type: 'dir',
    scope: 'global',
    description:
      'Global Claude Code home directory. Everything here applies to all projects and sessions on this machine.',
    children: [
      {
        id: 'global-claude-md',
        name: 'CLAUDE.md',
        type: 'file',
        scope: 'both',
        description:
          'Global instructions loaded at the start of every session. Personal preferences, communication style, and rules that apply to every project. Claude loads this before the project-level CLAUDE.md.',
        example:
          '# Global Rules\n- Always use TypeScript\n- Prefer functional style\n- Never commit .env files\n- Use conventional commits',
        note: 'Also exists at ./CLAUDE.md per-project. Claude loads global first, then local — local adds to or overrides global.',
      },
      {
        id: 'global-settings',
        name: 'settings.json',
        type: 'file',
        scope: 'both',
        description:
          'Global settings for permissions, hooks, and model preferences. Applies to all sessions. Project-level .claude/settings.json overrides individual keys.',
        example:
          '{\n  "permissions": {\n    "allow": ["Bash(git *)", "Bash(npm *)"],\n    "deny": ["Bash(rm -rf *)"],\n    "defaultMode": "acceptEdits"\n  },\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Write|Edit",\n        "hooks": [{ "type": "command", "command": "prettier --write $FILE" }]\n      }\n    ],\n    "PreToolUse": [\n      {\n        "matcher": "Bash",\n        "hooks": [{ "type": "command", "command": "echo \"Running: $BASH_COMMAND\"" }]\n      }\n    ]\n  }\n}',
        note: 'Hooks fire on tool events. PostToolUse runs after a tool completes; PreToolUse can block a tool call. Use $FILE, $BASH_COMMAND, etc. as env vars.',
      },
      {
        id: 'global-keybindings',
        name: 'keybindings.json',
        type: 'file',
        scope: 'global',
        description:
          'Custom keyboard shortcuts for the Claude Code TUI. Remap any built-in key binding or add chord shortcuts.',
        example:
          '{\n  "bindings": [\n    { "key": "ctrl+r", "command": "submit" },\n    { "key": "ctrl+shift+c", "command": "clear" }\n  ]\n}',
      },
      {
        id: 'global-memory',
        name: 'memory/',
        type: 'dir',
        scope: 'global',
        description:
          'Persistent notes that survive /clear and new sessions. Claude reads and writes here automatically to remember context across conversations.',
        children: [
          {
            id: 'global-memory-projects',
            name: 'projects/',
            type: 'dir',
            scope: 'global',
            description:
              'One file per project. Claude updates these with important decisions, patterns, and progress so it remembers what you were doing last session.',
            children: [
              {
                id: 'global-memory-file',
                name: '<project>.md',
                type: 'file',
                scope: 'global',
                description:
                  'Per-project memory note written and read by Claude. Contains last session summary, key decisions, and the immediate next step.',
                example:
                  '## Last Session — 2026-03-11\n- Built the architecture guide page\n- Renamed Guide → Architecture in nav\n- Next: add MCP + agents to the tree\n- Decision: used CSS layers over SVG for diagram',
              },
            ],
          },
          {
            id: 'global-memory-user',
            name: 'user.md',
            type: 'file',
            scope: 'global',
            description:
              'Global memory about you — role, preferences, and working style — that applies across all projects.',
            example: '---\ntype: user\n---\n\nSenior engineer. Prefers terse responses.\nUses pnpm. Dark themes only.',
          },
        ],
      },
      {
        id: 'global-skills-flat',
        name: '<skill>.md',
        type: 'file',
        scope: 'global',
        description:
          'Top-level skills become /skill slash commands. Any .md file here is a reusable prompt workflow — invoked by typing /filename (without the extension) in any session.',
        example:
          '# Commit\nCreate a conventional commit for the staged changes.\n1. Run `git diff --staged`\n2. Draft a commit message following Conventional Commits\n3. Run `git commit -m "..."` with a Co-Authored-By trailer',
        note: 'Built-in skills like /commit and /review-pr ship with Claude Code this way.',
      },
      {
        id: 'global-skills-ns',
        name: '<namespace>/',
        type: 'dir',
        scope: 'global',
        description:
          'Skills can be organized into namespaced subdirectories. A file at ~/.claude/gsd/plan-phase.md becomes the /gsd:plan-phase command.',
        children: [
          {
            id: 'global-skills-ns-file',
            name: '<skill>.md',
            type: 'file',
            scope: 'global',
            description:
              'Namespaced skill invoked as /namespace:skill. Useful for organizing related workflows — e.g. /gsd:plan-phase, /gsd:execute-phase, /gsd:debug all live under ~/.claude/gsd/.',
            example:
              '# Plan Phase\nResearch and create a detailed PLAN.md for the next phase.\n...',
            note: 'Invoke with /namespace:skill-name. The colon maps to a directory separator.',
          },
        ],
      },
    ],
  },
  {
    id: 'local-root',
    name: './ (project root)',
    type: 'dir',
    scope: 'local',
    description:
      'Your project directory. Local Claude config lives here and applies only to this project.',
    children: [
      {
        id: 'local-claude-md',
        name: 'CLAUDE.md',
        type: 'file',
        scope: 'both',
        description:
          'Project-specific instructions loaded after global CLAUDE.md. Adds to or overrides global rules. Commit this to your repo so every teammate gets consistent Claude behaviour.',
        example:
          '# Project Rules\n- Use pnpm not npm\n- Run `pnpm test` before every commit\n- Components go in src/components/\n- Always check .planning/ for active tasks',
        note: 'Commit this file. It makes Claude consistent for everyone on the team.',
      },
      {
        id: 'local-claude-dir',
        name: '.claude/',
        type: 'dir',
        scope: 'local',
        description:
          'Hidden project-level Claude config directory. Settings here override the global ~/.claude/ equivalents for this repository only.',
        children: [
          {
            id: 'local-settings',
            name: 'settings.json',
            type: 'file',
            scope: 'local',
            description:
              'Project-level settings that override global settings.json. Tighten or relax permissions, add project-specific MCP servers, or define project-scoped hooks.',
            example:
              '{\n  "mcpServers": {\n    "project-db": {\n      "command": "node",\n      "args": ["./scripts/mcp-db-server.js"]\n    }\n  },\n  "permissions": {\n    "deny": ["Bash(curl *)", "Bash(wget *)"],\n    "defaultMode": "default"\n  },\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Write",\n        "hooks": [{ "type": "command", "command": "pnpm lint --fix $FILE" }]\n      }\n    ]\n  }\n}',
            note: 'MCP servers defined here are only available when working in this project.',
          },
          {
            id: 'local-agents',
            name: 'agents/',
            type: 'dir',
            scope: 'local',
            description:
              'Project-specific agent definitions. Markdown files here describe specialized sub-Claude instances that can be spawned via the Agent tool with subagent_type matching the filename.',
            children: [
              {
                id: 'local-agent-file',
                name: '<agent-name>.md',
                type: 'file',
                scope: 'local',
                description:
                  'Custom agent definition. Describes the agent\'s role, tools, and instructions. Referenced via subagent_type: "<agent-name>" in Agent tool calls.',
                example:
                  '# DB Migration Agent\nYou are a specialist in database migrations.\n\n## Tools\nOnly use: Read, Write, Bash(psql *)\n\n## Instructions\n1. Always create a rollback script alongside the migration\n2. Validate schema after applying\n3. Return a summary of changes made',
                note: 'Agents run in isolation with their own context window. They return a single result to the parent Claude instance.',
              },
            ],
          },
        ],
      },
    ],
  },
]

function ScopeBadge({ scope }: { scope: Scope }) {
  return (
    <span
      className="ml-2 shrink-0 text-[10px] px-1.5 py-px rounded font-mono leading-none border"
      style={{ color: SCOPE_COLOR[scope], borderColor: SCOPE_COLOR[scope] }}
    >
      {scope}
    </span>
  )
}

function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
  return null
}

interface RenderProps {
  nodes: TreeNode[]
  prefix: string
  selectedId: string | null
  onSelect: (id: string) => void
}

function TreeRows({ nodes, prefix, selectedId, onSelect }: RenderProps) {
  return (
    <>
      {nodes.map((node, i) => {
        const isLast = i === nodes.length - 1
        const connector = isLast ? '└── ' : '├── '
        const childPrefix = prefix + (isLast ? '    ' : '│   ')
        const isSelected = node.id === selectedId

        return (
          <div key={node.id}>
            <button
              onClick={() => onSelect(node.id === selectedId ? '' : node.id)}
              className={`flex items-center w-full text-left px-2 py-0.5 rounded transition-colors group ${
                isSelected ? 'bg-border/40' : 'hover:bg-border/20'
              }`}
            >
              <span className="text-border whitespace-pre font-mono text-xs select-none">
                {prefix}{connector}
              </span>
              <span
                className={`font-mono text-xs ${
                  node.type === 'dir' ? 'text-yellow' : isSelected ? 'text-fg' : 'text-muted group-hover:text-fg'
                }`}
              >
                {node.name}
              </span>
              <ScopeBadge scope={node.scope} />
            </button>
            {node.children && (
              <TreeRows
                nodes={node.children}
                prefix={childPrefix}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

function DetailPanel({ node }: { node: TreeNode }) {
  return (
    <div className="border border-border rounded-panel bg-surface p-5 flex flex-col gap-3 h-full">
      <div className="flex items-start gap-3 flex-wrap">
        <span className="font-mono text-fg font-medium text-sm break-all">{node.name}</span>
        <span
          className="text-xs px-2 py-0.5 rounded border font-mono shrink-0"
          style={{ color: SCOPE_COLOR[node.scope], borderColor: SCOPE_COLOR[node.scope] }}
        >
          {SCOPE_LABEL[node.scope]}
        </span>
      </div>

      <p className="text-xs text-muted leading-relaxed">{node.description}</p>

      {node.note && (
        <div className="border-l-2 pl-3 text-xs text-muted leading-relaxed" style={{ borderColor: SCOPE_COLOR[node.scope] }}>
          {node.note}
        </div>
      )}

      {node.example && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted">Example</span>
          <pre className="text-xs font-mono text-aqua bg-bg rounded p-3 overflow-x-auto leading-relaxed whitespace-pre">
            {node.example}
          </pre>
        </div>
      )}
    </div>
  )
}

function EmptyPanel() {
  return (
    <div className="border border-border border-dashed rounded-panel p-5 flex items-center justify-center h-full min-h-[160px]">
      <span className="text-xs text-border font-mono">[ select a file or folder ]</span>
    </div>
  )
}

export function FileSystemTree() {
  const [selectedId, setSelectedId] = useState<string>('global-json')

  const selectedNode = selectedId ? findNode(TREE, selectedId) : null

  return (
    <div className="flex flex-col gap-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-mono">
        {(['global', 'local', 'both'] as Scope[]).map(scope => (
          <div key={scope} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: SCOPE_COLOR[scope] }} />
            <span className="text-muted">
              <span style={{ color: SCOPE_COLOR[scope] }}>{scope}</span>
              {' — '}
              {SCOPE_LABEL[scope]}
            </span>
          </div>
        ))}
      </div>

      {/* Tree + Detail panel */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Tree */}
        <div className="w-full lg:w-[420px] lg:shrink-0 border border-border rounded-panel bg-surface p-4">
          {TREE.map((root, i) => (
            <div key={root.id} className={i > 0 ? 'mt-5 pt-5 border-t border-border' : ''}>
              <button
                onClick={() => setSelectedId(root.id === selectedId ? '' : root.id)}
                className={`flex items-center w-full text-left px-2 py-0.5 rounded transition-colors group mb-0.5 ${
                  root.id === selectedId ? 'bg-border/40' : 'hover:bg-border/20'
                }`}
              >
                <span
                  className={`font-mono text-xs font-medium ${
                    root.type === 'dir' ? 'text-yellow' : 'text-fg'
                  }`}
                >
                  {root.name}
                </span>
                <ScopeBadge scope={root.scope} />
              </button>
              {root.children && (
                <TreeRows
                  nodes={root.children}
                  prefix=""
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              )}
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="flex-1 w-full">
          {selectedNode ? <DetailPanel node={selectedNode} /> : <EmptyPanel />}
        </div>
      </div>
    </div>
  )
}
