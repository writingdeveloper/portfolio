import { Info, AlertTriangle, Lightbulb, AlertCircle } from 'lucide-react'

interface CalloutProps {
  value: {
    type: 'info' | 'warning' | 'tip' | 'error'
    text: string
  }
}

const calloutStyles = {
  info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300' },
  tip: { icon: Lightbulb, bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300' },
  error: { icon: AlertCircle, bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300' },
}

export function Callout({ value }: CalloutProps) {
  const style = calloutStyles[value.type] || calloutStyles.info
  const Icon = style.icon

  return (
    <div className={`my-6 rounded-lg border ${style.border} ${style.bg} p-4 flex gap-3`}>
      <Icon size={20} className={`${style.text} shrink-0 mt-0.5`} />
      <p className={`${style.text} text-sm`}>{value.text}</p>
    </div>
  )
}
