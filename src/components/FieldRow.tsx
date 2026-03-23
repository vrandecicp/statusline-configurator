import { FieldDefinition } from '@/lib/fields'

export function FieldRow({
  field,
  enabled,
  onToggle,
}: {
  field: FieldDefinition
  enabled: boolean
  onToggle: (id: string) => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={enabled}
      onClick={() => onToggle(field.id)}
      className="w-full flex items-start gap-3 py-1.5 px-1 text-left hover:bg-surface rounded transition-colors"
    >
      <span
        className={`mt-0.5 shrink-0 w-4 h-4 border rounded-sm flex items-center justify-center ${
          enabled ? 'border-fg bg-fg text-bg' : 'border-border'
        }`}
        aria-hidden="true"
      >
        {enabled && '✓'}
      </span>
      <span className="flex-1 min-w-0">
        <span className="text-fg text-sm font-medium">{field.label}</span>
        {field.conditional && (
          <span className="text-muted text-xs ml-2">(conditional)</span>
        )}
        <span className="block text-muted text-xs mt-0.5">{field.description}</span>
      </span>
    </button>
  )
}
