'use client'

import { useState, useEffect, useCallback } from 'react'
import { AttemptHistory, type Attempt } from '@/components/AttemptHistory'
import { HintInputGrid } from '@/components/HintInputGrid'
import { RecommendationPanel } from '@/components/RecommendationPanel'
import { filterCandidates, getBestSuggestion, decomposeWord, type HintColor } from '@/lib/solver'
import wordListData from '@/data/word-list.json'

const WORD_LIST = wordListData as string[]
const MAX_ATTEMPTS = 5

function initColors(): HintColor[] {
  return ['gray', 'gray', 'gray', 'gray', 'gray']
}

export default function HomePage() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [candidates, setCandidates] = useState<string[]>(WORD_LIST)
  const [suggestion, setSuggestion] = useState<string>('')
  const [currentColors, setCurrentColors] = useState<HintColor[]>(initColors())
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing')

  useEffect(() => {
    const first = getBestSuggestion(WORD_LIST, WORD_LIST)
    setSuggestion(first)
  }, [])

  const handleColorChange = useCallback((index: number, color: HintColor) => {
    setCurrentColors(prev => {
      const next = [...prev]
      next[index] = color
      return next
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!suggestion || status !== 'playing') return

    const jamos = decomposeWord(suggestion)
    if (jamos.length !== 5) return

    const newAttempt: Attempt = {
      word: suggestion,
      jamos,
      hints: [...currentColors],
    }

    const newAttempts = [...attempts, newAttempt]
    setAttempts(newAttempts)

    if (currentColors.every(c => c === 'green')) {
      setStatus('won')
      return
    }

    const hints = newAttempts.map(a => ({ jamos: a.jamos, pattern: a.hints }))
    const newCandidates = filterCandidates(WORD_LIST, hints)
    setCandidates(newCandidates)

    if (newAttempts.length >= MAX_ATTEMPTS) {
      setStatus('lost')
      return
    }

    const nextSuggestion = getBestSuggestion(newCandidates, WORD_LIST)
    setSuggestion(nextSuggestion)
    setCurrentColors(initColors())
  }, [suggestion, currentColors, attempts, status])

  const handleReset = useCallback(() => {
    setAttempts([])
    setCandidates(WORD_LIST)
    setCurrentColors(initColors())
    setStatus('playing')
    const first = getBestSuggestion(WORD_LIST, WORD_LIST)
    setSuggestion(first)
  }, [])

  const currentJamos = suggestion ? decomposeWord(suggestion) : []

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">카카오 단어맞추기 도우미</h1>
          <p className="text-sm text-gray-500 mt-1">
            {MAX_ATTEMPTS - attempts.length}회 남음
          </p>
        </div>

        {attempts.length > 0 && (
          <AttemptHistory attempts={attempts} />
        )}

        {status === 'won' && (
          <div className="bg-green-900 border border-green-700 rounded-xl p-6 text-center">
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
          <div className="bg-red-950 border border-red-800 rounded-xl p-6 text-center">
            <p className="text-xl font-bold text-red-300 mb-1">아쉽네요</p>
            <p className="text-sm text-gray-400 mb-2">남은 후보 단어:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {candidates.slice(0, 10).map(w => (
                <span key={w} className="bg-gray-800 px-3 py-1 rounded text-sm">{w}</span>
              ))}
            </div>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2 bg-red-800 hover:bg-red-700 rounded-lg text-sm font-medium"
            >
              다시 하기
            </button>
          </div>
        )}

        {status === 'playing' && suggestion && (
          <>
            <RecommendationPanel
              attemptNumber={attempts.length + 1}
              suggestion={suggestion}
              candidateCount={candidates.length}
            />

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">카카오 결과 입력</p>
                <p className="text-xs text-gray-600">칸을 클릭해서 색을 변경하세요</p>
              </div>

              {currentJamos.length === 5 && (
                <HintInputGrid
                  jamos={currentJamos}
                  colors={currentColors}
                  onColorChange={handleColorChange}
                />
              )}

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

              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 rounded-lg font-semibold transition-colors"
              >
                결과 확인 - 다음 추천
              </button>
            </div>
          </>
        )}

      </div>
    </main>
  )
}
