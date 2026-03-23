const DOS = [
  {
    title: 'Start in Plan Mode',
    detail: 'Shift+Tab twice. Let Claude map the steps, then switch to auto-accept for execution.',
  },
  {
    title: 'Write a clear goal upfront',
    detail: 'The better your brief, the fewer revisions needed. Vague in = vague out.',
  },
  {
    title: 'Use /clear between tasks',
    detail: 'Old context bleeds into new responses and wastes tokens. Reset when switching topics.',
  },
  {
    title: 'Create a CLAUDE.md per project',
    detail: 'The more context Claude has upfront, the less you repeat yourself across sessions.',
  },
  {
    title: 'Build Skills for recurring tasks',
    detail: 'If you do it more than twice, make it a Skill. Your future self will thank you.',
  },
  {
    title: 'Share CLAUDE.md with your team',
    detail: 'Multiple people contributing to it weekly makes it dramatically better.',
  },
]

const DONTS = [
  {
    title: "Don't jump straight to execution",
    detail: 'Skipping the plan is the #1 mistake. You waste time fixing avoidable errors.',
  },
  {
    title: "Don't use it like ChatGPT",
    detail: 'Claude Code works across your file system. Stop copy-pasting code into a chat window.',
  },
  {
    title: "Don't be vague",
    detail: '"Fix the bug" is not a prompt. Include file names, error messages, and expected behavior.',
  },
  {
    title: "Don't work in isolation",
    detail: 'Share your CLAUDE.md with your team. There\'s no one correct way — everyone evolves it differently.',
  },
  {
    title: "Don't treat your setup as finished",
    detail: 'Continually improve your setup. The workflow improves fast. Yours should too.',
  },
  {
    title: "Don't use allow: [\"Bash(*)\"]",
    detail: 'Unrestricted shell access is a security risk. Prefer explicit permission patterns.',
  },
]

export function DosAndDonts() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      {/* DOS */}
      <div className="border border-border rounded-panel bg-surface overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8ec07c' }} />
          <span className="font-pixel text-[10px] tracking-widest" style={{ color: '#8ec07c' }}>DO</span>
        </div>
        <div className="divide-y divide-border">
          {DOS.map(({ title, detail }) => (
            <div key={title} className="px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors">
              <span className="shrink-0 mt-0.5 text-sm" style={{ color: '#8ec07c' }}>✓</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-mono text-fg">{title}</span>
                <span className="text-[11px] font-mono text-muted leading-relaxed">{detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DON'TS */}
      <div className="border border-border rounded-panel bg-surface overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d77757' }} />
          <span className="font-pixel text-[10px] tracking-widest" style={{ color: '#d77757' }}>DON&apos;T</span>
        </div>
        <div className="divide-y divide-border">
          {DONTS.map(({ title, detail }) => (
            <div key={title} className="px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors">
              <span className="shrink-0 mt-0.5 text-sm" style={{ color: '#d77757' }}>✗</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-mono text-fg">{title}</span>
                <span className="text-[11px] font-mono text-muted leading-relaxed">{detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
