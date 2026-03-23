import { describe, it, expect } from 'vitest'
import { generatePreview, generateScript, SEPARATOR_PRESETS } from '../src/lib/generator'
import { FIELD_DEFINITIONS } from '../src/lib/fields'
import type { FieldDefinition } from '../src/types/fields'

const MOCK_FIELDS: FieldDefinition[] = [
  { id: 'field_a', label: 'A', description: 'A', jqPath: '.field_a', exampleValue: 'Alpha', category: 'model' },
  { id: 'field_b', label: 'B', description: 'B', jqPath: '.field_b', exampleValue: 'Beta',  category: 'model' },
  { id: 'field_c', label: 'C', description: 'C', jqPath: '.field_c', exampleValue: 'Gamma', category: 'model' },
]

describe('generatePreview', () => {
  it('joins 2 fields with pipe separator', () => {
    const sep = SEPARATOR_PRESETS.find(s => s.id === 'pipe')!.value
    expect(generatePreview(MOCK_FIELDS, ['field_a', 'field_b'], sep)).toBe('Alpha | Beta')
  })

  it('joins 2 fields with dash separator', () => {
    const sep = SEPARATOR_PRESETS.find(s => s.id === 'dash')!.value
    expect(generatePreview(MOCK_FIELDS, ['field_a', 'field_b'], sep)).toBe('Alpha - Beta')
  })

  it('joins 2 fields with dot separator', () => {
    const sep = SEPARATOR_PRESETS.find(s => s.id === 'dot')!.value
    expect(generatePreview(MOCK_FIELDS, ['field_a', 'field_b'], sep)).toBe('Alpha · Beta')
  })

  it('joins 2 fields with space separator', () => {
    const sep = SEPARATOR_PRESETS.find(s => s.id === 'space')!.value
    expect(generatePreview(MOCK_FIELDS, ['field_a', 'field_b'], sep)).toBe('Alpha   Beta')
  })

  it('joins 2 fields with slash separator', () => {
    const sep = SEPARATOR_PRESETS.find(s => s.id === 'slash')!.value
    expect(generatePreview(MOCK_FIELDS, ['field_a', 'field_b'], sep)).toBe('Alpha / Beta')
  })

  it('returns empty string when enabledIds is empty', () => {
    expect(generatePreview(MOCK_FIELDS, [], ' | ')).toBe('')
  })

  it('returns just the exampleValue for a single enabled field', () => {
    expect(generatePreview(MOCK_FIELDS, ['field_b'], ' | ')).toBe('Beta')
  })

  it('preserves order of enabledIds, not registry order', () => {
    // field_c is last in MOCK_FIELDS but first in enabledIds
    const result = generatePreview(MOCK_FIELDS, ['field_c', 'field_a'], ' | ')
    expect(result).toBe('Gamma | Alpha')
  })
})

describe('generateScript', () => {
  it('starts with the bash shebang line', () => {
    const script = generateScript(FIELD_DEFINITIONS, ['model_display_name'], ' | ')
    expect(script.split('\n')[0]).toBe('#!/usr/bin/env bash')
  })

  it('contains a local variable declaration for each enabled field id', () => {
    const ids = ['model_display_name', 'context_used_pct', 'cost_total_usd']
    const script = generateScript(FIELD_DEFINITIONS, ids, ' | ')
    for (const id of ids) {
      expect(script).toContain(`local ${id}`)
    }
  })

  it('escapes the pipe separator so the script contains a quoted pipe', () => {
    const script = generateScript(FIELD_DEFINITIONS, ['model_display_name'], ' | ')
    // Single-quoted bash string ' | ' will contain '|'
    expect(script).toMatch(/'[^']*\|[^']*'/)
  })

  it('produces valid bash structure when enabledIds is empty', () => {
    const script = generateScript(FIELD_DEFINITIONS, [], ' | ')
    expect(script).toContain('#!/usr/bin/env bash')
    expect(script).toContain('claude_statusline()')
    expect(script).toContain('echo "$_out"')
  })

  it('includes the jqPath for model_display_name in the script', () => {
    const field = FIELD_DEFINITIONS.find(f => f.id === 'model_display_name')!
    const script = generateScript(FIELD_DEFINITIONS, ['model_display_name'], ' | ')
    expect(script).toContain(field.jqPath)
  })
})

describe('generateScript separator escaping (TECH-03)', () => {
  it('wraps dash separator in single quotes in the script', () => {
    const sep = SEPARATOR_PRESETS.find(s => s.id === 'dash')!.value
    const script = generateScript(FIELD_DEFINITIONS, ['model_display_name'], sep)
    expect(script).toContain("' - '")
  })

  it('wraps dot separator in single quotes in the script', () => {
    const sep = SEPARATOR_PRESETS.find(s => s.id === 'dot')!.value
    const script = generateScript(FIELD_DEFINITIONS, ['model_display_name'], sep)
    expect(script).toContain("' · '")
  })

  it('wraps space separator in single quotes in the script', () => {
    const sep = SEPARATOR_PRESETS.find(s => s.id === 'space')!.value
    const script = generateScript(FIELD_DEFINITIONS, ['model_display_name'], sep)
    expect(script).toContain("'   '")
  })

  it('wraps slash separator in single quotes in the script', () => {
    const sep = SEPARATOR_PRESETS.find(s => s.id === 'slash')!.value
    const script = generateScript(FIELD_DEFINITIONS, ['model_display_name'], sep)
    expect(script.includes("' / '")).toBe(true)
  })
})
