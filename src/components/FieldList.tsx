import { FieldDefinition } from '@/lib/fields'
import { FieldRow } from './FieldRow'

const CATEGORIES = ['model', 'context', 'cost', 'workspace', 'session', 'advanced'] as const

export function FieldList({
  fields,
  enabledIds,
  onToggle,
}: {
  fields: FieldDefinition[]
  enabledIds: string[]
  onToggle: (id: string) => void
}) {
  const grouped = CATEGORIES.map(cat => ({
    category: cat,
    fields: fields.filter(f => f.category === cat),
  }))

  return (
    <div className="border border-border rounded-panel bg-surface px-4 py-3 flex flex-col gap-4">
      {grouped.map(cat => (
        <div key={cat.category}>
          <h3 className="text-muted text-xs uppercase tracking-wider border-b border-border pb-1 mb-2">
            {cat.category}
          </h3>
          {cat.fields.map(field => (
            <FieldRow
              key={field.id}
              field={field}
              enabled={enabledIds.includes(field.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
