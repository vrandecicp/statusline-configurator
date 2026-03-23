'use client'

import { useState, useEffect } from 'react'

const STARS: [number, number, number][] = [
  [4,7,1],[11,3,2],[17,14,1],[23,6,1],[30,11,2],[37,4,1],[43,17,1],[51,8,2],
  [57,5,1],[64,13,1],[70,7,2],[77,3,1],[83,10,1],[89,5,2],[94,15,1],
  [3,27,2],[9,34,1],[15,23,1],[21,39,1],[28,31,2],[34,26,1],[41,43,1],[47,37,2],
  [53,28,1],[60,41,1],[67,34,2],[74,21,1],[81,38,1],[87,27,2],[93,44,1],
  [6,54,1],[13,61,2],[19,69,1],[25,57,1],[31,74,2],[37,64,1],[44,79,1],[50,71,2],
  [56,59,1],[63,77,2],[69,67,1],[76,81,1],[82,71,2],[88,87,1],[94,74,1],
  [2,84,2],[8,91,1],[14,87,1],[20,94,2],[26,89,1],[33,83,1],[39,95,2],[46,87,1],
  [52,92,1],[59,84,2],[66,90,1],[72,87,1],[79,92,2],[86,85,1],[92,89,1],
]

interface AgentDef {
  id: string
  name: string
  file: string
  scope: 'global' | 'project'
  emoji: string
  r: number
  period: number
  startDeg: number
  simple: string      // plain-English one-liner
  description: string // technical detail
  example: string
  note?: string
}

const AGENTS: AgentDef[] = [
  {
    id: 'db-migrator', name: 'db-migrator', scope: 'project',
    file: '.claude/agents/db-migrator.md', emoji: '🗄',
    r: 118, period: 10, startDeg: 0,
    simple: 'A specialist hired just for this project — knows your database and always writes a safety net before touching anything.',
    description: 'Lives inside your project at .claude/agents/. Only available when Claude is working in this repository. Specialises in database migrations — always creates a rollback script and validates the schema after applying.',
    example: '# .claude/agents/db-migrator.md\nYou are a database migration specialist.\n\n## Tools\nOnly use: Read, Write, Bash(psql *)\n\n## Instructions\n1. Always write a rollback script first\n2. Apply migration\n3. Validate schema\n4. Return pass/fail summary',
    note: 'Project-only. Other projects cannot see or use this agent.',
  },
  {
    id: 'test-runner', name: 'test-runner', scope: 'project',
    file: '.claude/agents/test-runner.md', emoji: '🧪',
    r: 118, period: 10, startDeg: 120,
    simple: 'The tester — runs your project\'s tests and comes back with a clean pass/fail report, keeping the noisy output out of your main chat.',
    description: 'Project-scoped agent that knows the exact test framework, commands, and patterns for this repo. Running tests in isolation keeps your main conversation clean.',
    example: '# .claude/agents/test-runner.md\nRun the test suite and report results.\n\n## Tools\nOnly use: Bash(pnpm test *), Bash(pnpm run *), Read\n\n## Instructions\n1. Run the full test suite\n2. Capture output\n3. Return: pass count, fail count, failed test names',
    note: 'Commit .claude/agents/ to your repo so all teammates share the same agents.',
  },
  {
    id: 'reviewer', name: 'code-reviewer', scope: 'project',
    file: '.claude/agents/code-reviewer.md', emoji: '👁',
    r: 118, period: 10, startDeg: 240,
    simple: "The critic — reviews your code against this project's rules and gives you honest, structured feedback every time.",
    description: "Project-scoped code review agent. Enforces the conventions in your project's CLAUDE.md and returns structured feedback in isolation.",
    example: '# .claude/agents/code-reviewer.md\nReview changed code for quality and convention violations.\n\n## Instructions\n1. Read each changed file\n2. Check against rules in CLAUDE.md\n3. Return a structured review: issues, suggestions, verdict',
  },
  {
    id: 'researcher', name: 'researcher', scope: 'global',
    file: '~/.claude/researcher.md', emoji: '🔭',
    r: 200, period: 18, startDeg: 50,
    simple: 'Your internet explorer — searches the web and comes back with a tidy summary. Works in every project, not just one.',
    description: 'Global agent living in ~/.claude/ — available in every project and session on your machine. Researches topics and returns structured summaries without consuming main context.',
    example: '# ~/.claude/researcher.md\nYou research topics and return structured summaries.\n\n## Tools\nOnly use: WebSearch, WebFetch, Read\n\n## Instructions\n1. Search for the topic\n2. Fetch and read relevant sources\n3. Return: summary, key findings, source URLs',
    note: 'Global agents at ~/.claude/ are accessible from any project on this machine.',
  },
  {
    id: 'debugger', name: 'debugger', scope: 'global',
    file: '~/.claude/debugger.md', emoji: '🐛',
    r: 200, period: 18, startDeg: 230,
    simple: 'The detective — investigates bugs like a scientist: forms a theory, collects evidence, finds the culprit. Available everywhere.',
    description: 'Global debugging agent available across all your projects. Applies a systematic debugging method — hypothesis, evidence, test — and returns a structured diagnosis with a proposed fix.',
    example: '# ~/.claude/debugger.md\nInvestigate bugs using the scientific method.\n\n## Tools\nUse: Read, Bash(grep *), Bash(git log *), Bash(git diff *)\n\n## Instructions\n1. Reproduce the bug\n2. Form a hypothesis\n3. Gather evidence\n4. Return: root cause, evidence trail, and proposed fix',
    note: 'Global agents carry no project-specific knowledge — they rely purely on what you give them.',
  },
]

const SCALE_ROWS = [
  { icon: '✦', label: 'GALAXY',     simple: 'Your Computer',   loc: '~/.claude/',            color: '#9c9a92' },
  { icon: '☀', label: 'STAR',       simple: 'One Chat',        loc: 'one `claude` session',  color: '#fabd2f' },
  { icon: '🪐', label: 'PLANET',    simple: 'Project Helper',  loc: '.claude/agents/<n>.md', color: '#d77757' },
  { icon: '🌍', label: 'MOON',      simple: 'Any-Project Help',loc: '~/.claude/<n>.md',      color: '#8ec07c' },
  { icon: '⚛', label: 'ATOM',      simple: 'One Action',      loc: 'Bash · Read · Write',   color: '#faf9f5' },
]

export function AgentUniverse() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const sel = AGENTS.find(a => a.id === selectedId) ?? null
  const selColor = sel ? (sel.scope === 'global' ? '#8ec07c' : '#d77757') : '#41413e'

  return (
    <div className="flex flex-col gap-6">

      {/* Scale reference */}
      <div className="border border-border rounded-panel bg-surface px-4 py-3">
        <div className="font-pixel text-[9px] tracking-widest text-border mb-3">
          SCALE REFERENCE — universe to atom
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {SCALE_ROWS.map((row, i) => (
            <div key={i} className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-base w-5 text-center leading-none shrink-0"
                style={{ color: row.color }}>{row.icon}</span>
              <div className="min-w-0">
                <span className="font-pixel text-[9px] tracking-widest" style={{ color: row.color }}>
                  {row.label}
                </span>
                <span className="font-pixel text-[9px] tracking-widest text-fg ml-2">
                  = {row.simple}
                </span>
                <span className="font-mono text-[9px] text-border ml-2 hidden sm:inline">
                  {row.loc}
                </span>
              </div>
              {i < SCALE_ROWS.length - 1 && (
                <span className="font-pixel text-[9px] text-border ml-1 hidden md:inline">›</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Space viewport */}
      <div className="relative rounded-panel border border-border overflow-hidden select-none"
        style={{ height: 500, background: 'radial-gradient(ellipse at 50% 50%, #141412 0%, #0b0b09 100%)' }}>

        {/* CRT scanlines */}
        <div className="absolute inset-0 pointer-events-none z-30" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)',
        }} />

        {/* Corner labels */}
        <div className="absolute top-3 left-3 font-pixel text-[8px] tracking-widest opacity-35"
          style={{ color: '#9c9a92' }}>SYSTEM: CLAUDE_CODE</div>
        <div className="absolute top-3 right-3 font-pixel text-[8px] tracking-widest opacity-35"
          style={{ color: '#9c9a92' }}>AGENTS: {AGENTS.length} LOADED</div>
        <div className="absolute bottom-12 left-3 font-pixel text-[8px] tracking-widest opacity-25"
          style={{ color: '#8ec07c' }}>~/.claude/ ← GLOBAL</div>
        <div className="absolute bottom-12 right-3 font-pixel text-[8px] tracking-widest opacity-25"
          style={{ color: '#d77757' }}>PROJECT → .claude/</div>

        {/* Stars */}
        {STARS.map(([x, y, size], i) => (
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{
              left: `${x}%`, top: `${y}%`,
              width: size, height: size,
              backgroundColor: '#faf9f5',
              opacity: 0.15 + (i % 7) * 0.07,
              animation: `star-twinkle ${2.5 + (i % 5) * 0.7}s ease-in-out ${(i % 13) * 0.25}s infinite alternate`,
            }} />
        ))}

        {/* Solar system — centered */}
        <div className="absolute" style={{ left: '50%', top: '50%' }}>

          {/* Outer ring label */}
          <div className="absolute pointer-events-none font-pixel text-[8px] tracking-widest"
            style={{ color: '#8ec07c', opacity: 0.5, top: -222, left: -55, whiteSpace: 'nowrap' }}>
            ~/.claude/ — global
          </div>

          {/* Outer ring */}
          <div className="absolute rounded-full pointer-events-none"
            style={{ width: 400, height: 400, top: -200, left: -200,
              border: '1px dashed rgba(142,192,124,0.25)' }} />

          {/* Inner ring label */}
          <div className="absolute pointer-events-none font-pixel text-[8px] tracking-widest"
            style={{ color: '#d77757', opacity: 0.55, top: -140, left: -62, whiteSpace: 'nowrap' }}>
            .claude/agents/ — project
          </div>

          {/* Inner ring */}
          <div className="absolute rounded-full pointer-events-none"
            style={{ width: 236, height: 236, top: -118, left: -118,
              border: '1px dashed rgba(215,119,87,0.3)' }} />

          {/* Sun */}
          <div className="absolute pointer-events-none" style={{ transform: 'translate(-50%, -50%)' }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 32%, #fabd2f 0%, #d77757 55%, #291a0f 100%)',
              boxShadow: '0 0 18px 5px rgba(215,119,87,0.45), 0 0 50px 15px rgba(250,189,47,0.12)',
              animation: 'sun-pulse 3.5s ease-in-out infinite',
            }} />
            <div className="font-pixel text-center mt-1.5"
              style={{ fontSize: 8, color: '#fabd2f', letterSpacing: 2, textShadow: '0 0 6px rgba(250,189,47,0.6)' }}>
              CLAUDE CODE
            </div>
            <div className="font-pixel text-center"
              style={{ fontSize: 7, color: '#9c9a92', letterSpacing: 1 }}>
              session
            </div>
          </div>

          {/* Orbiting agents */}
          {mounted && AGENTS.map(agent => {
            const delay = -(agent.startDeg / 360) * agent.period
            const isSelected = agent.id === selectedId
            const color = agent.scope === 'global' ? '#8ec07c' : '#d77757'
            return (
              <div key={agent.id} style={{
                position: 'absolute', width: 0, height: 0, top: 0, left: 0,
                animation: `agent-orbit ${agent.period}s linear ${delay}s infinite`,
              }}>
                <div style={{
                  position: 'absolute',
                  left: agent.r - 18, top: -18,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  animation: `agent-counter ${agent.period}s linear ${delay}s infinite`,
                }}>
                  <button
                    onClick={() => setSelectedId(p => p === agent.id ? null : agent.id)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: isSelected
                        ? `radial-gradient(circle, ${color}30, ${color}10)`
                        : 'radial-gradient(circle, #242423, #1a1a18)',
                      border: `2px solid ${color}`,
                      boxShadow: isSelected
                        ? `0 0 16px 5px ${color}55, inset 0 0 8px ${color}22`
                        : `0 0 6px 1px ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, cursor: 'pointer', outline: 'none',
                      transition: 'box-shadow 0.2s',
                    }}>
                    {agent.emoji}
                  </button>
                  <div className="font-pixel whitespace-nowrap"
                    style={{ fontSize: 7.5, color, letterSpacing: 1,
                      textShadow: isSelected ? `0 0 8px ${color}` : undefined }}>
                    {agent.name}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 right-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: '#8ec07c' }} />
            <span className="font-pixel text-[7.5px] tracking-widest" style={{ color: '#8ec07c' }}>
              GLOBAL — all sessions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: '#d77757' }} />
            <span className="font-pixel text-[7.5px] tracking-widest" style={{ color: '#d77757' }}>
              PROJECT — this repo only
            </span>
          </div>
        </div>

        {/* Click hint */}
        {!selectedId && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-pixel text-[8px] tracking-widest"
            style={{ color: '#9c9a92', animation: 'blink-hint 2s step-end infinite' }}>
            ► CLICK AN AGENT
          </div>
        )}
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes agent-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes agent-counter {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes star-twinkle {
          from { opacity: 0.08; }
          to   { opacity: 0.55; }
        }
        @keyframes sun-pulse {
          0%,100% { box-shadow: 0 0 18px 5px rgba(215,119,87,0.45), 0 0 50px 15px rgba(250,189,47,0.12); }
          50%     { box-shadow: 0 0 28px 9px rgba(215,119,87,0.65), 0 0 70px 22px rgba(250,189,47,0.22); }
        }
        @keyframes blink-hint {
          0%,100% { opacity: 0.4; }
          50%     { opacity: 0; }
        }
      `}</style>

      {/* Detail panel */}
      {sel ? (
        <div className="border rounded-panel bg-surface p-5 flex flex-col gap-3"
          style={{ borderColor: selColor }}>
          <div className="flex items-start gap-3 flex-wrap">
            <span className="text-2xl leading-none">{sel.emoji}</span>
            <div className="flex flex-col gap-0.5">
              <div className="font-mono text-fg font-medium text-sm">{sel.file}</div>
              <div className="font-pixel text-[9px] tracking-widest" style={{ color: selColor }}>
                {sel.scope === 'global'
                  ? '✦ GLOBAL — accessible from any project on this machine'
                  : '🪐 PROJECT — only available inside this repository'}
              </div>
            </div>
          </div>
          {/* Simple one-liner */}
          <p className="text-sm text-fg leading-relaxed">{sel.simple}</p>
          {/* Technical detail */}
          <p className="text-xs text-muted leading-relaxed">{sel.description}</p>
          {sel.note && (
            <div className="border-l-2 pl-3 text-xs text-muted leading-relaxed"
              style={{ borderColor: selColor }}>
              {sel.note}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <span className="font-pixel text-[9px] tracking-widest text-muted">DEFINITION FILE</span>
            <pre className="text-xs font-mono text-aqua bg-bg rounded p-3 overflow-x-auto leading-relaxed whitespace-pre">
              {sel.example}
            </pre>
          </div>
        </div>
      ) : (
        <div className="border border-border border-dashed rounded-panel p-5 flex items-center justify-center min-h-[72px]">
          <span className="font-pixel text-[9px] tracking-widest text-border">[ CLICK AN AGENT TO INSPECT ]</span>
        </div>
      )}
    </div>
  )
}
