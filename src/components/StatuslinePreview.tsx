export function StatuslinePreview({ preview }: { preview: string }) {
  return (
    <section
      aria-label="Statusline preview"
      className="border border-border rounded-panel bg-surface px-4 py-3 flex flex-col gap-2"
    >
      <span className="text-muted text-xs uppercase tracking-wider">Preview</span>
      {preview === '' ? (
        <p className="text-muted text-sm font-mono">[ no fields selected ]</p>
      ) : (
        <p className="text-fg text-sm font-mono whitespace-pre">{preview}</p>
      )}
    </section>
  )
}
