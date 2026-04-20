'use client'

import type { HintColor } from '@/lib/solver'

interface WordleKeyboardProps {
  jamoState: Record<string, HintColor | undefined>
}

const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const VOWELS    = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ']

const COLOR_CLASS: Record<HintColor, string> = {
  green:  'bg-green-600 border-green-500 text-white',
  yellow: 'bg-yellow-500 border-yellow-400 text-white',
  gray:   'bg-gray-700 border-gray-600 text-gray-400',
}
const DEFAULT_CLASS = 'bg-gray-900 border-gray-600 text-gray-300'

function Key({ jamo, state }: { jamo: string; state: HintColor | undefined }) {
  const cls = state ? COLOR_CLASS[state] : DEFAULT_CLASS
  return (
    <div className={`w-8 h-10 border rounded flex items-center justify-center text-sm font-bold select-none ${cls}`}>
      {jamo}
    </div>
  )
}

export function WordleKeyboard({ jamoState }: WordleKeyboardProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1 justify-center">
        {CONSONANTS.map(j => <Key key={j} jamo={j} state={jamoState[j]} />)}
      </div>
      <div className="flex gap-1 justify-center">
        {VOWELS.map(j => <Key key={j} jamo={j} state={jamoState[j]} />)}
      </div>
    </div>
  )
}
