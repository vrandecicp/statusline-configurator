import { describe, it, expect } from 'vitest'
import { FIELD_DEFINITIONS } from '../src/lib/fields'
import type { FieldDefinition } from '../src/types/fields'

describe('FIELD_DEFINITIONS', () => {
  it('is importable and is an array', () => {
    expect(Array.isArray(FIELD_DEFINITIONS)).toBe(true)
  })

  it('contains all 21 expected field IDs', () => {
    const expectedIds = [
      'model_display_name',
      'model_id',
      'context_used_pct',
      'context_remaining_pct',
      'context_window_size',
      'context_total_input_tokens',
      'context_total_output_tokens',
      'cost_total_usd',
      'cost_duration_ms',
      'cost_lines_added',
      'cost_lines_removed',
      'workspace_current_dir',
      'workspace_project_dir',
      'version',
      'session_id',
      'output_style',
      'vim_mode',
      'agent_name',
      'worktree_name',
      'worktree_branch',
      'exceeds_200k',
    ]
    const actualIds = FIELD_DEFINITIONS.map((f: FieldDefinition) => f.id)
    expect(actualIds).toEqual(expect.arrayContaining(expectedIds))
    expect(actualIds).toHaveLength(21)
  })

  it('each field has the required shape', () => {
    const requiredKeys: (keyof FieldDefinition)[] = [
      'id', 'label', 'description', 'jqPath', 'exampleValue', 'category',
    ]
    for (const field of FIELD_DEFINITIONS) {
      for (const key of requiredKeys) {
        expect(field, `field ${field.id} missing ${key}`).toHaveProperty(key)
        expect(
          typeof field[key],
          `field ${field.id}.${key} should be string`
        ).toBe('string')
      }
    }
  })

  it('category values are from the allowed set', () => {
    const validCategories = ['model', 'context', 'cost', 'workspace', 'session', 'advanced']
    for (const field of FIELD_DEFINITIONS) {
      expect(
        validCategories,
        `field ${field.id} has invalid category: ${field.category}`
      ).toContain(field.category)
    }
  })

  it('jqPath values start with a dot', () => {
    for (const field of FIELD_DEFINITIONS) {
      expect(
        field.jqPath,
        `field ${field.id} jqPath should start with '.'`
      ).toMatch(/^\./)
    }
  })
})
