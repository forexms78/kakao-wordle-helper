'use client'

import { HintCell } from './HintCell'
import type { HintColor } from '@/lib/solver'

interface HintInputGridProps {
  jamos: string[]
  colors: HintColor[]
  onColorChange: (index: number, color: HintColor) => void
}

const NEXT_COLOR: Record<HintColor, HintColor> = {
  gray: 'yellow',
  yellow: 'green',
  green: 'gray',
}

export function HintInputGrid({ jamos, colors, onColorChange }: HintInputGridProps) {
  return (
    <div className="flex gap-2 justify-center">
      {jamos.map((jamo, i) => (
        <HintCell
          key={i}
          jamo={jamo}
          color={colors[i]}
          onClick={() => onColorChange(i, NEXT_COLOR[colors[i]])}
        />
      ))}
    </div>
  )
}
