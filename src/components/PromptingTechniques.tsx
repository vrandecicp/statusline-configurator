interface Technique {
  name: string
  when: string
  example: string
}

const TECHNIQUES: Technique[] = [
  {
    name: 'Be Specific',
    when: 'Always — vague prompts produce vague code.',
    example: '"Clean this CSV: remove rows where column B is empty, dedupe on email."',
  },
  {
    name: 'Give Examples',
    when: 'When output format matters.',
    example: '"Format the output like this: [show 1–2 examples of what you want]."',
  },
  {
    name: 'Chain Steps',
    when: 'Complex multi-part tasks.',
    example: '"First analyze the data, then summarize findings, then create action items."',
  },
  {
    name: 'Set Constraints',
    when: 'Quality control.',
    example: '"Max 200 lines. Only use built-in Node modules. No external dependencies."',
  },
  {
    name: 'Assign a Role',
    when: 'When you need domain expertise.',
    example: '"Act as a senior security engineer reviewing this auth implementation."',
  },
  {
    name: 'Plan Before Code',
    when: 'Before any non-trivial change.',
    example: '"Explain your approach and list the files you\'ll touch. Don\'t write code yet."',
  },
  {
    name: 'Use /clear Often',
    when: 'Between unrelated tasks.',
    example: 'Old context bleeds into new responses. /clear resets the window for free.',
  },
]

const PRO_PATTERN = [
  'Ask Claude to make a plan first.',
  'Review the plan before execution.',
  'Let it create checkpoints.',
  'Rewind (Esc twice) if something goes wrong.',
  'Iterate with specific feedback.',
]

export function PromptingTechniques() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">

      {/* Main table */}
      <div className="flex-1 border border-border rounded-panel bg-surface overflow-hidden">
        <div className="grid grid-cols-[140px_1fr_1fr] border-b border-border">
          <div className="px-4 py-2">
            <span className="font-pixel text-[9px] tracking-widest text-muted">TECHNIQUE</span>
          </div>
          <div className="px-4 py-2 border-l border-border">
            <span className="font-pixel text-[9px] tracking-widest text-muted">WHEN TO USE</span>
          </div>
          <div className="px-4 py-2 border-l border-border">
            <span className="font-pixel text-[9px] tracking-widest text-muted">EXAMPLE</span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {TECHNIQUES.map(({ name, when, example }) => (
            <div key={name} className="grid grid-cols-[140px_1fr_1fr] hover:bg-white/5 transition-colors">
              <div className="px-4 py-2.5">
                <span className="font-mono text-xs text-aqua">{name}</span>
              </div>
              <div className="px-4 py-2.5 border-l border-border">
                <span className="text-xs font-mono text-muted leading-relaxed">{when}</span>
              </div>
              <div className="px-4 py-2.5 border-l border-border">
                <span className="text-xs font-mono text-muted leading-relaxed">{example}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro pattern sidebar */}
      <div className="lg:w-56 border border-border rounded-panel bg-surface overflow-hidden self-start">
        <div className="px-4 py-2 border-b border-border">
          <span className="font-pixel text-[9px] tracking-widest" style={{ color: '#fabd2f' }}>
            PRO PATTERN
          </span>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2">
          <p
            className="font-pixel text-[9px] tracking-widest mb-1"
            style={{ color: '#fabd2f' }}
          >
            CHECKPOINT + ITERATE
          </p>
          {PRO_PATTERN.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="shrink-0 font-mono text-[10px] mt-0.5" style={{ color: '#fabd2f' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-mono text-muted leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
