'use client'

import { useEffect, useRef } from 'react'

// Characters mapped from low → high amplitude
const CHARS = [' ', ' ', ' ', '·', '·', '.', '.', '+', '*', '#']

// Gruvbox colors mapped from low → high amplitude
const COLORS = [
  '#41413e', // border  (barely visible)
  '#41413e',
  '#9c9a92', // muted
  '#9c9a92',
  '#8ec07c', // aqua
  '#fabd2f', // yellow
  '#d77757', // accent
]

const CELL      = 20   // grid cell size in px
const FONT_SIZE = 13
const NUM_SRC   = 5    // wave sources

interface Source {
  angleOffset: number   // starting angle in orbit
  orbitSpeed:  number   // radians per ms
  orbitRx:     number   // orbit radius x (fraction of canvas width)
  orbitRy:     number   // orbit radius y (fraction of canvas height)
  freq:        number   // spatial frequency of wave
  phase:       number   // wave phase offset
}

export default function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const startTime = performance.now()

    // Each source orbits the canvas center at a different speed/radius
    const sources: Source[] = Array.from({ length: NUM_SRC }, (_, i) => ({
      angleOffset: (i / NUM_SRC) * Math.PI * 2,
      orbitSpeed:  0.00012 + (i % 3) * 0.00004,
      orbitRx:     0.22 + (i * 0.07) % 0.22,
      orbitRy:     0.18 + (i * 0.05) % 0.18,
      freq:        0.013 + (i * 0.003),
      phase:       (i / NUM_SRC) * Math.PI,
    }))

    function resize() {
      if (!canvas) return
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }

    function draw(now: number) {
      if (!canvas || !ctx) return

      const t = now - startTime
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font          = `${FONT_SIZE}px monospace`
      ctx.textAlign     = 'center'
      ctx.textBaseline  = 'middle'

      // Compute source positions for this frame
      const pts = sources.map(s => ({
        x:    canvas.width  / 2 + Math.cos(t * s.orbitSpeed + s.angleOffset) * canvas.width  * s.orbitRx,
        y:    canvas.height / 2 + Math.sin(t * s.orbitSpeed * 0.71 + s.angleOffset) * canvas.height * s.orbitRy,
        freq: s.freq,
        ph:   s.phase,
      }))

      for (let cx = CELL / 2; cx < canvas.width; cx += CELL) {
        for (let cy = CELL / 2; cy < canvas.height; cy += CELL) {

          // Sum sine waves from every source
          let val = 0
          for (const p of pts) {
            const dist = Math.sqrt((cx - p.x) ** 2 + (cy - p.y) ** 2)
            val += Math.sin(dist * p.freq - t * 0.00055 + p.ph)
          }

          // Normalize [-NUM_SRC … +NUM_SRC] → [0 … 1]
          const norm    = Math.max(0, Math.min(1, (val + NUM_SRC) / (2 * NUM_SRC)))
          const charIdx = Math.min(Math.floor(norm * CHARS.length), CHARS.length - 1)
          const char    = CHARS[charIdx]
          if (char === ' ') continue

          const colorIdx = Math.min(Math.floor(norm * COLORS.length), COLORS.length - 1)

          // Alpha: subtler at extremes, slightly stronger at mid-peaks
          const alpha = 0.05 + norm * 0.09

          ctx.globalAlpha = alpha
          ctx.fillStyle   = COLORS[colorIdx]
          ctx.fillText(char, cx, cy)
        }
      }

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    resize()
    animId = requestAnimationFrame(draw)

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        0,
      }}
    />
  )
}
