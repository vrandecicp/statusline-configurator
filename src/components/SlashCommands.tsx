const COMMANDS = [
  { cmd: '/help',    desc: 'Show all available commands and shortcuts.' },
  { cmd: '/clear',   desc: 'Reset conversation context. Use between unrelated tasks to prevent stale responses.' },
  { cmd: '/compact', desc: 'Compress conversation to save tokens. Keeps a summary instead of full history.' },
  { cmd: '/model',   desc: 'Switch between Opus, Sonnet, and Haiku mid-session.' },
  { cmd: '/mcp',     desc: 'Inspect connected MCP servers and their status.' },
  { cmd: '/doctor',  desc: 'Diagnose installation issues — PATH, auth, node version.' },
  { cmd: '/config',  desc: 'Open interactive settings editor.' },
  { cmd: '/review',  desc: 'Ask Claude to review a diff or set of changes.' },
  { cmd: '/init',    desc: 'Generate a CLAUDE.md for the current project from existing code.' },
]

const AT_REFS = [
  { syntax: '@filename',  example: '@report.csv',  desc: 'Reference a specific file' },
  { syntax: '@folder/',   example: '@src/utils/',  desc: 'Reference an entire directory' },
  { syntax: 'Tab key',    example: '—',            desc: 'Autocomplete paths after @' },
]

export function SlashCommands() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">

      {/* Slash Commands table */}
      <div className="flex-1 border border-border rounded-panel bg-surface overflow-hidden">
        <div className="px-4 py-2 border-b border-border">
          <span className="font-pixel text-[9px] tracking-widest text-muted">
            TYPE / IN CLAUDE CODE
          </span>
        </div>
        <div className="divide-y divide-border">
          {COMMANDS.map(({ cmd, desc }) => (
            <div key={cmd} className="flex gap-4 px-4 py-2.5 hover:bg-white/5 transition-colors">
              <span className="shrink-0 font-mono text-xs text-aqua w-24">{cmd}</span>
              <span className="text-xs font-mono text-muted leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* @ References + note */}
      <div className="flex flex-col gap-4 lg:w-64">
        <div className="border border-border rounded-panel bg-surface overflow-hidden">
          <div className="px-4 py-2 border-b border-border">
            <span className="font-pixel text-[9px] tracking-widest text-muted">
              TYPE @ TO REFERENCE FILES
            </span>
          </div>
          <div className="divide-y divide-border">
            {AT_REFS.map(({ syntax, example, desc }) => (
              <div key={syntax} className="px-4 py-2.5 flex flex-col gap-0.5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-yellow-300 w-20 shrink-0">{syntax}</span>
                  <span className="font-mono text-xs text-aqua">{example}</span>
                </div>
                <span className="text-[11px] font-mono text-muted leading-snug">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div
          className="border-l-2 pl-3 text-xs text-muted font-mono leading-relaxed"
          style={{ borderColor: '#8ec07c' }}
        >
          <span className="font-pixel text-[9px] tracking-widest mr-2" style={{ color: '#8ec07c' }}>TIP</span>
          You can type <span className="text-aqua">/</span> at any point mid-conversation — not just at the start.
        </div>
      </div>

    </div>
  )
}
