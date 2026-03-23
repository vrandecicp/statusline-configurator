interface Shortcut {
  action: string
  keys: string
  note?: string
}

const SHORTCUTS: Shortcut[] = [
  {
    action: 'Cancel / Stop generation',
    keys: 'Esc',
    note: 'Works mid-stream',
  },
  {
    action: 'Rewind to last checkpoint',
    keys: 'Esc Esc',
    note: 'Esc twice quickly',
  },
  {
    action: 'Enter Plan Mode',
    keys: 'Shift+Tab',
    note: 'Toggle auto-accept off',
  },
  {
    action: 'Paste image into prompt',
    keys: 'Ctrl+V',
    note: 'Cmd+V does not work on Mac',
  },
  {
    action: 'Run shell command directly',
    keys: '! then command',
    note: 'e.g. !git status',
  },
  {
    action: 'Autocomplete file path',
    keys: 'Tab after @',
    note: 'After typing @ for file refs',
  },
  {
    action: 'Previous prompt',
    keys: '↑ arrow',
    note: 'Navigate prompt history',
  },
  {
    action: 'Multiline input',
    keys: 'Shift+Enter',
    note: 'Add a newline without submitting',
  },
]

export function KeyboardShortcuts() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">

      {/* Shortcuts table */}
      <div className="flex-1 border border-border rounded-panel bg-surface overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] border-b border-border">
          <div className="px-4 py-2">
            <span className="font-pixel text-[9px] tracking-widest text-muted">ACTION</span>
          </div>
          <div className="px-4 py-2 border-l border-border w-44">
            <span className="font-pixel text-[9px] tracking-widest text-muted">KEYS</span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {SHORTCUTS.map(({ action, keys, note }) => (
            <div key={action} className="grid grid-cols-[1fr_auto] hover:bg-white/5 transition-colors">
              <div className="px-4 py-2.5">
                <div className="text-xs font-mono text-fg">{action}</div>
                {note && <div className="text-[10px] font-mono text-muted mt-0.5">{note}</div>}
              </div>
              <div className="px-4 py-2.5 border-l border-border w-44 flex items-center">
                <kbd className="font-mono text-xs px-2 py-0.5 rounded border border-border bg-bg text-aqua whitespace-nowrap">
                  {keys}
                </kbd>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side note */}
      <div className="sm:w-56 flex flex-col gap-3">
        <div
          className="border border-border rounded-panel bg-surface p-4 flex flex-col gap-3"
        >
          <span className="font-pixel text-[9px] tracking-widest" style={{ color: '#fabd2f' }}>
            PLAN MODE TIP
          </span>
          <p className="text-xs font-mono text-muted leading-relaxed">
            Shift+Tab toggles auto-accept. In plan mode, Claude shows its intent and waits
            for approval before touching files. Switch back with Shift+Tab again once
            you&apos;re happy with the plan.
          </p>
        </div>
        <div
          className="border-l-2 pl-3 text-xs text-muted font-mono leading-relaxed"
          style={{ borderColor: '#d77757' }}
        >
          <span
            className="font-pixel text-[9px] tracking-widest mr-2"
            style={{ color: '#d77757' }}
          >
            PITFALL
          </span>
          On macOS, Ctrl+V (not Cmd+V) pastes images. This catches everyone at least once.
        </div>
      </div>

    </div>
  )
}
