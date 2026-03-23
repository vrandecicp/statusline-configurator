'use client'

import { useState } from 'react'

type CopyState = 'idle' | 'copied' | 'error'

export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<CopyState>('idle')

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // execCommand fallback for non-HTTPS / focus-loss scenarios
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        if (!ok) throw new Error('execCommand failed')
      }
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`px-3 py-1 text-xs rounded border font-mono transition-colors ${
        state === 'copied'
          ? 'border-accent text-accent'
          : state === 'error'
          ? 'border-red-500 text-red-500'
          : 'border-accent text-accent hover:opacity-80'
      }`}
    >
      {state === 'copied' ? 'Copied!' : state === 'error' ? 'Failed' : 'Copy'}
    </button>
  )
}
