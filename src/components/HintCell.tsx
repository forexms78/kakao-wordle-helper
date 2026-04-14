import type { HintColor } from '@/lib/solver'

interface HintCellProps {
  jamo: string
  color: HintColor
  onClick?: () => void
  readonly?: boolean
}

const COLOR_CLASSES: Record<HintColor, string> = {
  gray: 'bg-gray-700 border-gray-600 text-gray-300',
  yellow: 'bg-yellow-500 border-yellow-400 text-white',
  green: 'bg-green-600 border-green-500 text-white',
}

export function HintCell({ jamo, color, onClick, readonly = false }: HintCellProps) {
  return (
    <button
      onClick={readonly ? undefined : onClick}
      disabled={readonly}
      className={`
        w-12 h-12 border-2 rounded-lg flex items-center justify-center
        font-bold text-xl transition-colors select-none
        ${COLOR_CLASSES[color]}
        ${readonly ? 'cursor-default' : 'cursor-pointer hover:opacity-80 active:scale-95'}
      `}
      aria-label={`${jamo} ${color}`}
    >
      {jamo}
    </button>
  )
}
