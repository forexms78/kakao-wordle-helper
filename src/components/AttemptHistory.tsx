import { HintCell } from './HintCell'
import type { HintColor } from '@/lib/solver'

export interface Attempt {
  word: string
  jamos: string[]
  hints: HintColor[]
}

interface AttemptHistoryProps {
  attempts: Attempt[]
}

export function AttemptHistory({ attempts }: AttemptHistoryProps) {
  if (attempts.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 uppercase tracking-widest">진행 기록</p>
      {attempts.map((attempt, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-4">{i + 1}</span>
          <div className="flex gap-1.5">
            {attempt.jamos.map((jamo, j) => (
              <HintCell
                key={j}
                jamo={jamo}
                color={attempt.hints[j]}
                readonly
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">{attempt.word}</span>
        </div>
      ))}
    </div>
  )
}
