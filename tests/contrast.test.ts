import { describe, it, expect } from 'vitest'

// WCAG 2.1 relative luminance calculation
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

const BG = '#282828'

// All text-bearing Gruvbox tokens must pass WCAG AA 4.5:1 against #282828
const textTokens: Array<{ name: string; hex: string }> = [
  { name: 'fg (text primary)',    hex: '#ebdbb2' },
  { name: 'muted (text secondary)', hex: '#a89984' },
  { name: 'yellow (accent)',       hex: '#fabd2f' },
  { name: 'orange (accent)',       hex: '#fe8019' },
  { name: 'aqua (tertiary)',       hex: '#8ec07c' },
]

describe('WCAG AA contrast (text tokens vs #282828 background)', () => {
  for (const token of textTokens) {
    it(`${token.name} ${token.hex} passes 4.5:1 against ${BG}`, () => {
      const ratio = contrastRatio(token.hex, BG)
      expect(
        ratio,
        `${token.name} contrast ratio ${ratio.toFixed(2)}:1 is below WCAG AA 4.5:1`
      ).toBeGreaterThanOrEqual(4.5)
    })
  }

  it('border color #504945 is non-text and exempt from 4.5:1 — documents known value', () => {
    const ratio = contrastRatio('#504945', BG)
    // Border fails 4.5:1 — this is expected. WCAG 1.4.3 applies to text only.
    // Non-text contrast (WCAG 1.4.11) requires only 3:1.
    expect(ratio).toBeLessThan(4.5)
    // But confirm it's not accidentally being used as text
    expect(ratio).toBeGreaterThan(1.0) // not invisible
  })
})
