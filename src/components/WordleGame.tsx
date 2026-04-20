'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { decomposeWord, getPattern, type HintColor } from '@/lib/solver'
import wordListData from '@/data/word-list.json'
import { HintCell } from './HintCell'
import { WordleKeyboard } from './WordleKeyboard'

const WORD_LIST = (wordListData as string[]).filter(w => decomposeWord(w).length === 5)
const MAX_ATTEMPTS = 6

function pickRandom(): string {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
}

interface AttemptRow {
  word: string
  jamos: string[]
  colors: HintColor[]
}

const EMPTY_COLOR: HintColor = 'gray'

export function WordleGame() {
  const [answer, setAnswer] = useState<string>(() => pickRandom())
  const [attempts, setAttempts] = useState<AttemptRow[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [status, attempts.length])

  const handleSubmit = useCallback(() => {
    if (status !== 'playing') return
    const word = input.trim()

    if (!word) return

    if (!WORD_LIST.includes(word)) {
      setError('단어 목록에 없는 단어입니다')
      return
    }

    const guessJamos = decomposeWord(word)
    if (guessJamos.length !== 5) {
      setError('올바른 형식의 단어가 아닙니다')
      return
    }

    const answerJamos = decomposeWord(answer)
    const colors = getPattern(guessJamos, answerJamos)
    const newRow: AttemptRow = { word, jamos: guessJamos, colors }
    const newAttempts = [...attempts, newRow]

    setAttempts(newAttempts)
    setInput('')
    setError('')

    if (colors.every(c => c === 'green')) {
      setStatus('won')
      return
    }
    if (newAttempts.length >= MAX_ATTEMPTS) {
      setStatus('lost')
    }
  }, [input, answer, attempts, status])

  const handleReset = useCallback(() => {
    setAnswer(pickRandom())
    setAttempts([])
    setInput('')
    setError('')
    setStatus('playing')
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }, [handleSubmit])

  const currentJamos = decomposeWord(input.trim())

  const jamoState = attempts.reduce<Record<string, HintColor>>((acc, attempt) => {
    const priority: Record<HintColor, number> = { gray: 1, yellow: 2, green: 3 }
    attempt.jamos.forEach((jamo, i) => {
      const color = attempt.colors[i]
      if (!acc[jamo] || priority[color] > priority[acc[jamo]]) acc[jamo] = color
    })
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-500 mt-1">
          {status === 'playing'
            ? `${MAX_ATTEMPTS - attempts.length}번 남음`
            : status === 'won'
            ? `${attempts.length}번 만에 정답!`
            : `정답: ${answer}`}
        </p>
      </div>

      {/* 게임 그리드 */}
      <div className="space-y-1.5">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
          const attempt = attempts[rowIdx]
          const isCurrent = rowIdx === attempts.length && status === 'playing'

          if (attempt) {
            return (
              <div key={rowIdx} className="flex gap-1.5 justify-center">
                {attempt.jamos.map((jamo, colIdx) => (
                  <HintCell
                    key={colIdx}
                    jamo={jamo}
                    color={attempt.colors[colIdx]}
                    readonly
                  />
                ))}
                <span className="ml-2 self-center text-sm text-gray-500">{attempt.word}</span>
              </div>
            )
          }

          if (isCurrent) {
            return (
              <div key={rowIdx} className="flex gap-1.5 justify-center">
                {Array.from({ length: 5 }).map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className="w-12 h-12 border-2 border-gray-500 rounded-lg flex items-center justify-center font-bold text-xl text-white"
                  >
                    {currentJamos[colIdx] ?? ''}
                  </div>
                ))}
              </div>
            )
          }

          return (
            <div key={rowIdx} className="flex gap-1.5 justify-center">
              {Array.from({ length: 5 }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  className="w-12 h-12 border-2 border-gray-800 rounded-lg"
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="flex gap-4 justify-center text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-gray-700 rounded" />
          없음
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-yellow-500 rounded" />
          위치 틀림
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-green-600 rounded" />
          정확
        </span>
      </div>

      {/* 입력 영역 */}
      {status === 'playing' && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
          <p className="text-sm text-gray-400">두 글자 한국어 단어 입력</p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => {
                setInput(e.target.value)
                setError('')
              }}
              onKeyDown={handleKeyDown}
              maxLength={4}
              placeholder="예) 가득"
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg text-center tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-gray-400"
            />
            <button
              onClick={handleSubmit}
              className="px-5 py-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 rounded-lg font-semibold transition-colors"
            >
              확인
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}
        </div>
      )}

      {/* 결과 */}
      {status === 'won' && (
        <div className="bg-green-900 border border-green-700 rounded-xl p-5 text-center">
          <p className="text-xl font-bold text-green-300 mb-1">정답!</p>
          <p className="text-sm text-gray-400">{attempts.length}번 만에 맞췄습니다</p>
          <button
            onClick={handleReset}
            className="mt-4 px-6 py-2 bg-green-700 hover:bg-green-600 rounded-lg text-sm font-medium"
          >
            다시 하기
          </button>
        </div>
      )}

      {status === 'lost' && (
        <div className="bg-red-950 border border-red-800 rounded-xl p-5 text-center">
          <p className="text-xl font-bold text-red-300 mb-1">아쉽네요</p>
          <p className="text-sm text-gray-400 mb-1">정답은 <span className="text-white font-bold">{answer}</span> 였습니다</p>
          <button
            onClick={handleReset}
            className="mt-3 px-6 py-2 bg-red-800 hover:bg-red-700 rounded-lg text-sm font-medium"
          >
            다시 하기
          </button>
        </div>
      )}

      {/* 자판 */}
      <WordleKeyboard jamoState={jamoState} />
    </div>
  )
}
