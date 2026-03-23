import { ClientOnly } from '@/components/ClientOnly'
import { ConfiguratorRoot } from '@/components/ConfiguratorRoot'

export default function Home() {
  return (
    <main className="max-w-[1280px] mx-auto px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <header className="flex flex-col gap-2 sm:gap-4 mb-6 sm:mb-8">
        <h1 className="font-[family-name:var(--font-pixel)] font-bold text-accent text-3xl sm:text-4xl lg:text-5xl leading-[1.2] hyphens-none [word-break:keep-all]">
          Claude Code Statusline Configurator
        </h1>
        <p className="text-muted text-sm sm:text-base font-mono">
          Generate a customized statusline script — no manual editing required.
        </p>
      </header>

      <ClientOnly fallback={<p className="text-muted text-sm">[ loading... ]</p>}>
        <ConfiguratorRoot />
      </ClientOnly>
    </main>
  )
}
