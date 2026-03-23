import { describe, it, expect } from 'vitest'
import { toggle, moveUp, moveDown, DEFAULT_ENABLED_IDS } from '../src/lib/configurator-state'

describe('toggle', () => {
  it('appends id when absent from the list', () => {
    expect(toggle(['a', 'b'], 'c')).toEqual(['a', 'b', 'c'])
  })

  it('removes id when present in the list', () => {
    expect(toggle(['a', 'b'], 'a')).toEqual(['b'])
  })

  it('appends id when list is empty', () => {
    expect(toggle([], 'a')).toEqual(['a'])
  })

  it('returns empty array when toggling the only item', () => {
    expect(toggle(['a'], 'a')).toEqual([])
  })
})

describe('moveUp', () => {
  it('swaps with previous element when in middle', () => {
    expect(moveUp(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c'])
  })

  it('is a no-op when id is already first', () => {
    expect(moveUp(['a', 'b', 'c'], 'a')).toEqual(['a', 'b', 'c'])
  })

  it('swaps last element with previous', () => {
    expect(moveUp(['a', 'b', 'c'], 'c')).toEqual(['a', 'c', 'b'])
  })

  it('is a no-op on empty list', () => {
    expect(moveUp([], 'a')).toEqual([])
  })
})

describe('moveDown', () => {
  it('swaps with next element when in middle', () => {
    expect(moveDown(['a', 'b', 'c'], 'b')).toEqual(['a', 'c', 'b'])
  })

  it('is a no-op when id is already last', () => {
    expect(moveDown(['a', 'b', 'c'], 'c')).toEqual(['a', 'b', 'c'])
  })

  it('swaps first element with next', () => {
    expect(moveDown(['a', 'b', 'c'], 'a')).toEqual(['b', 'a', 'c'])
  })

  it('is a no-op on empty list', () => {
    expect(moveDown([], 'a')).toEqual([])
  })
})

describe('DEFAULT_ENABLED_IDS', () => {
  it('equals exactly [\'model_display_name\']', () => {
    expect(DEFAULT_ENABLED_IDS).toEqual(['model_display_name'])
  })
})
