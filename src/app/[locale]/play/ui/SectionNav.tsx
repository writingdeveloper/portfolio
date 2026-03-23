'use client'

const SECTIONS = ['intro', 'projects', 'skills', 'timeline', 'blog'] as const

interface SectionNavProps {
  labels: Record<string, string>
  activeIndex: number
  onNavigate: (index: number) => void
}

export function SectionNav({ labels, activeIndex, onNavigate }: SectionNavProps) {
  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-[70] flex flex-col items-end gap-4">
      {SECTIONS.map((section, i) => (
        <button
          key={section}
          onClick={() => onNavigate(i)}
          className="group flex items-center gap-3"
        >
          <span
            className={`hidden sm:inline text-xs tracking-widest uppercase transition-all duration-500 ${
              i === activeIndex
                ? 'text-[#e8d5a3] opacity-100'
                : 'text-[#a78bfa] opacity-0 group-hover:opacity-60'
            }`}
          >
            {labels[section] ?? section}
          </span>
          <span
            className={`block rounded-full transition-all duration-500 ${
              i === activeIndex
                ? 'w-3 h-3 bg-[#c4a35a] shadow-[0_0_8px_#c4a35a]'
                : 'w-2 h-2 bg-[#7c6cf0]/50 group-hover:bg-[#a78bfa]'
            }`}
          />
        </button>
      ))}
    </nav>
  )
}
