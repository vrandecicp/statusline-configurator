import { FlowDiagram } from '@/components/FlowDiagram'
import { AgentUniverse } from '@/components/AgentUniverse'
import { GettingStarted } from '@/components/GettingStarted'
import { SlashCommands } from '@/components/SlashCommands'
import { PromptingTechniques } from '@/components/PromptingTechniques'
import { DosAndDonts } from '@/components/DosAndDonts'
import { McpServers } from '@/components/McpServers'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'

function Divider() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 border-t border-border" />
      <span className="font-mono text-[10px] text-border">§</span>
      <div className="flex-1 border-t border-border" />
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="font-pixel text-[11px] tracking-widest text-muted shrink-0">{title}</h2>
      <div className="flex-1 border-t border-border" />
    </div>
  )
}

export default function ArchitecturePage() {
  return (
    <main className="max-w-[1280px] mx-auto px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-10">

        {/* 0: Getting Started */}
        <section className="flex flex-col gap-4">
          <SectionHeader title="GETTING STARTED" />
          <GettingStarted />
        </section>

        <Divider />

        {/* 1: Slash Commands */}
        <section className="flex flex-col gap-4">
          <SectionHeader title="SLASH COMMANDS" />
          <SlashCommands />
        </section>

        <Divider />

        {/* 2: Prompting Techniques */}
        <section className="flex flex-col gap-4">
          <SectionHeader title="PROMPTING TECHNIQUES" />
          <PromptingTechniques />
        </section>

        <Divider />

        {/* 3: Dos & Don'ts */}
        <section className="flex flex-col gap-4">
          <SectionHeader title="DOS & DON'TS" />
          <DosAndDonts />
        </section>

        <Divider />

        {/* 4: MCP Servers */}
        <section className="flex flex-col gap-4">
          <SectionHeader title="MCP SERVERS" />
          <McpServers />
        </section>

        <Divider />

        {/* 5: Keyboard Shortcuts */}
        <section className="flex flex-col gap-4">
          <SectionHeader title="KEYBOARD SHORTCUTS" />
          <KeyboardShortcuts />
        </section>

        <Divider />

        {/* 6: File Architecture */}
        <section className="flex flex-col gap-4">
          <SectionHeader title="FILE ARCHITECTURE" />
          <FlowDiagram />
        </section>

        <Divider />

        {/* 7: Agent Scope */}
        <section className="flex flex-col gap-4">
          <SectionHeader title="AGENT SCOPE" />
          <AgentUniverse />
        </section>

      </div>
    </main>
  )
}
