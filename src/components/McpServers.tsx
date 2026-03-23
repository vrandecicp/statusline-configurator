import { CopyButton } from '@/components/CopyButton'

interface McpEntry {
  name: string
  note?: string
}

interface McpCategory {
  label: string
  color: string
  entries: McpEntry[]
}

const CATEGORIES: McpCategory[] = [
  {
    label: 'Developer Tools',
    color: '#fabd2f',
    entries: [
      { name: 'GitHub',  note: 'PRs, issues, repos' },
      { name: 'GitLab',  note: 'CI/CD, MRs' },
      { name: 'Sentry',  note: 'Error monitoring' },
      { name: 'Linear',  note: 'Issue tracking' },
    ],
  },
  {
    label: 'Productivity',
    color: '#d77757',
    entries: [
      { name: 'Notion',  note: 'Docs, databases' },
      { name: 'Slack',   note: 'Channels, DMs' },
      { name: 'Jira',    note: 'Tickets, boards' },
      { name: 'Drive',   note: 'Google Docs/Sheets' },
    ],
  },
  {
    label: 'Data & Research',
    color: '#8ec07c',
    entries: [
      { name: 'PostgreSQL', note: 'Direct DB access' },
      { name: 'Perplexity', note: 'Live web research' },
      { name: 'Brave',      note: 'Web search' },
      { name: 'Filesystem', note: 'Local file access' },
    ],
  },
  {
    label: 'Communication',
    color: '#9c9a92',
    entries: [
      { name: 'Gmail',    note: 'Read & send email' },
      { name: 'Discord',  note: 'Servers & channels' },
      { name: 'Buffer',   note: 'Social scheduling' },
      { name: 'Typefully',note: 'Twitter/X drafts' },
    ],
  },
]

const QUICK_ADD = 'claude mcp add --transport http notion https://mcp.notion.site/mcp'

export function McpServers() {
  return (
    <div className="flex flex-col gap-5">

      {/* What is MCP */}
      <div
        className="border-l-2 pl-4 py-1"
        style={{ borderColor: '#fabd2f' }}
      >
        <p className="text-xs font-mono text-muted leading-relaxed">
          <span className="font-pixel text-[9px] tracking-widest mr-2" style={{ color: '#fabd2f' }}>
            WHAT IS MCP?
          </span>
          Model Context Protocol — an open standard that connects Claude to your tools.
          Think of it as USB-C for AI: one protocol, hundreds of integrations.
          Claude works <em className="not-italic text-fg">inside</em> your existing stack instead of alongside it.
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CATEGORIES.map(({ label, color, entries }) => (
          <div key={label} className="border border-border rounded-panel bg-surface overflow-hidden">
            <div className="px-3 py-2 border-b border-border">
              <span className="font-pixel text-[9px] tracking-widest" style={{ color }}>
                {label.toUpperCase()}
              </span>
            </div>
            <div className="divide-y divide-border">
              {entries.map(({ name, note }) => (
                <div key={name} className="px-3 py-2 hover:bg-white/5 transition-colors">
                  <span className="font-mono text-xs text-fg">{name}</span>
                  {note && (
                    <span className="ml-2 text-[10px] font-mono text-muted">{note}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick add command */}
      <div className="flex flex-col gap-2">
        <span className="font-pixel text-[9px] tracking-widest text-muted">QUICK ADD COMMAND</span>
        <div className="flex items-center gap-2">
          <pre className="flex-1 text-xs font-mono text-aqua bg-bg rounded p-3 overflow-x-auto whitespace-pre">
            {QUICK_ADD}
          </pre>
          <div className="shrink-0">
            <CopyButton text={QUICK_ADD} />
          </div>
        </div>
        <p className="text-[11px] font-mono text-muted leading-relaxed">
          Replace <span className="text-aqua">notion</span> with any server name and update the URL.
          Run <span className="text-aqua">claude mcp list</span> to see all connected servers.
        </p>
      </div>

    </div>
  )
}
