'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { FIELD_DEFINITIONS } from '@/lib/fields'
import { SEPARATOR_PRESETS, generatePreview, generateScript } from '@/lib/generator'
import { toggle, DEFAULT_ENABLED_IDS } from '@/lib/configurator-state'
import { FieldList } from './FieldList'
import { SeparatorPicker } from './SeparatorPicker'
import { StatuslinePreview } from './StatuslinePreview'
import { CopyButton } from './CopyButton'

const ScriptBlock = dynamic(() => import('./ScriptBlock').then(m => ({ default: m.ScriptBlock })), {
  ssr: false,
  loading: () => <pre className="text-xs text-muted p-4">[ loading... ]</pre>,
})

export function ConfiguratorRoot() {
  const [enabledIds, setEnabledIds] = useState<string[]>(DEFAULT_ENABLED_IDS)
  const [separatorId, setSeparatorId] = useState<string>('pipe')

  const separator = SEPARATOR_PRESETS.find(s => s.id === separatorId)!.value
  const preview = generatePreview(FIELD_DEFINITIONS, enabledIds, separator)
  const script = generateScript(FIELD_DEFINITIONS, enabledIds, separator)

  const handleToggle = (id: string) => setEnabledIds(prev => toggle(prev, id))

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">
      {/* Left column: separator picker + field list */}
      <div className="w-full lg:w-[388px] lg:shrink-0 flex flex-col gap-4">
        <SeparatorPicker selectedId={separatorId} onSelect={setSeparatorId} />
        <FieldList
          fields={FIELD_DEFINITIONS}
          enabledIds={enabledIds}
          onToggle={handleToggle}
        />
      </div>

      {/* Right column: preview + script */}
      <div className="flex-1 flex flex-col gap-4">
        <StatuslinePreview preview={preview} />

        <section
          aria-label="Script output"
          className="border border-border rounded-panel bg-surface"
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
            <span className="text-muted text-xs uppercase tracking-wider">Generated script</span>
            <CopyButton text={script} />
          </div>
          <ScriptBlock script={script} />
          <div className="px-4 pb-3 border-t border-border pt-3">
            <p className="text-muted text-xs font-mono">
              Save to <span className="text-fg">~/.claude/statusline.sh</span>, then add{' '}
              <span className="text-fg">source ~/.claude/statusline.sh</span> to your shell config.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
