'use client'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FieldDefinition } from '@/lib/fields'

function SortableItem({
  field,
  onToggle,
}: {
  field: FieldDefinition
  onToggle: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 select-none"
    >
      <span
        {...attributes}
        {...listeners}
        className="text-muted hover:text-fg cursor-grab active:cursor-grabbing px-1 text-sm"
        aria-label={`Drag to reorder ${field.label}`}
      >
        ⠿
      </span>
      <span className="flex-1 text-fg text-sm">{field.label}</span>
      <button
        type="button"
        onClick={() => onToggle(field.id)}
        aria-label={`Remove ${field.label}`}
        className="text-muted text-xs hover:text-fg ml-auto"
      >
        ✕
      </button>
    </li>
  )
}

export function ActiveFieldsPanel({
  fields,
  enabledIds,
  onReorder,
  onToggle,
}: {
  fields: FieldDefinition[]
  enabledIds: string[]
  onReorder: (newIds: string[]) => void
  onToggle: (id: string) => void
}) {
  const fieldMap = new Map(fields.map(f => [f.id, f]))
  const activeFields = enabledIds.flatMap(id => {
    const f = fieldMap.get(id)
    return f ? [f] : []
  })

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = enabledIds.indexOf(active.id as string)
      const newIndex = enabledIds.indexOf(over.id as string)
      onReorder(arrayMove(enabledIds, oldIndex, newIndex))
    }
  }

  return (
    <div>
      <h2 className="text-fg text-sm font-medium mb-3">Active fields</h2>
      {enabledIds.length === 0 ? (
        <p className="text-muted text-sm">[ no fields selected ]</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={enabledIds} strategy={verticalListSortingStrategy}>
            <ol className="space-y-1">
              {activeFields.map(field => (
                <SortableItem key={field.id} field={field} onToggle={onToggle} />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
