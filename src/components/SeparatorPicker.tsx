import { SEPARATOR_PRESETS } from '@/lib/generator'

export function SeparatorPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="border border-border rounded-panel bg-surface px-4 py-3">
      <span className="text-muted text-xs uppercase tracking-wider block mb-2">Separator</span>
      <div className="flex flex-wrap gap-2">
        {SEPARATOR_PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={selectedId === preset.id}
            onClick={() => onSelect(preset.id)}
            className={`px-3 py-1 text-sm rounded border transition-colors font-mono
              ${selectedId === preset.id
                ? 'border-accent text-accent'
                : 'border-border text-muted hover:text-fg hover:border-fg'
              }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

