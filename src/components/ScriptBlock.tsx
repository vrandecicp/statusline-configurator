'use client'

import { Highlight, themes } from 'prism-react-renderer'

export function ScriptBlock({ script }: { script: string }) {
  return (
    <Highlight theme={themes.vsDark} code={script.trimEnd()} language="bash">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} text-xs leading-relaxed overflow-x-auto p-4 rounded-panel`}
          style={{ ...style, background: 'transparent' }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, j) => (
                <span key={j} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}
