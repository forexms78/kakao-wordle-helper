'use client'

import { useState, useCallback } from 'react'
import { AttemptHistory, type Attempt } from '@/components/AttemptHistory'
import { HintInputGrid } from '@/components/HintInputGrid'
import { RecommendationPanel } from '@/components/RecommendationPanel'
import { WordleGame } from '@/components/WordleGame'
import { CollectionPanel } from '@/components/CollectionPanel'
import { filterCandidates, getBestSuggestion, decomposeWord, type HintColor } from '@/lib/solver'
import wordListData from '@/data/word-list.json'

const WORD_LIST = wordListData as string[]
const MAX_ATTEMPTS = 5

function initColors(): HintColor[] {
  return ['gray', 'gray', 'gray', 'gray', 'gray']
}

type Tab = 'game' | 'helper' | 'collection'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('game')

  // 도우미 상태
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [candidates, setCandidates] = useState<string[]>(WORD_LIST)
  const [suggestion, setSuggestion] = useState<string>(
    () => getBestSuggestion(WORD_LIST, WORD_LIST)
  )
  const [userInput, setUserInput] = useState<string>('')
  const [currentColors, setCurrentColors] = useState<HintColor[]>(initColors())
  const [helperStatus, setHelperStatus] = useState<'playing' | 'won' | 'lost'>('playing')

  const handleColorChange = useCallback((index: number, color: HintColor) => {
    setCurrentColors(prev => {
      const next = [...prev]
      next[index] = color
      return next
    })
  }, [])

  const handleSubmit = useCallback(() => {
    const word = userInput.trim() || suggestion
    if (!word || helperStatus !== 'playing') return

    const jamos = decomposeWord(word)
    if (jamos.length !== 5) return

    const newAttempt: Attempt = {
      word,
      jamos,
      hints: [...currentColors],
    }

    const newAttempts = [...attempts, newAttempt]
    setAttempts(newAttempts)

    if (currentColors.every(c => c === 'green')) {
      setHelperStatus('won')
      return
    }

    const hints = newAttempts.map(a => ({ jamos: a.jamos, pattern: a.hints }))
    const newCandidates = filterCandidates(WORD_LIST, hints)
    setCandidates(newCandidates)

    if (newCandidates.length === 0) {
      setHelperStatus('lost')
      return
    }

    if (newAttempts.length >= MAX_ATTEMPTS) {
      setHelperStatus('lost')
      return
    }

    const nextSuggestion = getBestSuggestion(newCandidates, WORD_LIST)
    setSuggestion(nextSuggestion)
    setUserInput('')
    setCurrentColors(initColors())
  }, [userInput, suggestion, currentColors, attempts, helperStatus])

  const handleReset = useCallback(() => {
    setAttempts([])
    setCandidates(WORD_LIST)
    setCurrentColors(initColors())
    setHelperStatus('playing')
    setUserInput('')
    const first = getBestSuggestion(WORD_LIST, WORD_LIST)
    setSuggestion(first)
  }, [])

  const activeWord = userInput.trim() || suggestion
  const currentJamos = activeWord ? decomposeWord(activeWord) : []

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">

        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">카카오 단어맞추기</h1>
        </div>

        {/* 탭 */}
        <div className="flex bg-gray-900 border border-gray-700 rounded-xl p-1 gap-1">
          {(['game', 'helper', 'collection'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab === 'game' ? '단어 맞추기' : tab === 'helper' ? '도우미' : '컬렉션'}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'game' && <WordleGame />}
        {activeTab === 'collection' && <CollectionPanel />}

        {activeTab === 'helper' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mt-1">
                {MAX_ATTEMPTS - attempts.length}회 남음
              </p>
            </div>

            {attempts.length > 0 && (
              <AttemptHistory attempts={attempts} />
            )}

            {helperStatus === 'won' && (
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

            {helperStatus === 'lost' && (
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

            {helperStatus === 'playing' && (
              <>
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">내가 입력한 단어</p>
                    <input
                      type="text"
                      value={userInput}
                      onChange={e => {
                        setUserInput(e.target.value)
                        setCurrentColors(initColors())
                      }}
                      placeholder={suggestion ? `추천: ${suggestion}` : '단어 입력'}
                      maxLength={6}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-lg font-bold placeholder-gray-600 focus:outline-none focus:border-gray-400"
                    />
                    <p className="text-xs text-gray-600 mt-1 text-center">
                      비우면 추천 단어 사용 ({candidates.length}개 후보)
                    </p>
                  </div>

                  {currentJamos.length === 5 && (
                    <>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">카카오 결과 입력</p>
                        <p className="text-xs text-gray-600">칸을 클릭해서 색을 변경하세요</p>
                      </div>
                      <HintInputGrid
                        jamos={currentJamos}
                        colors={currentColors}
                        onColorChange={handleColorChange}
                      />
                    </>
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
                    disabled={currentJamos.length !== 5}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    결과 확인 - 후보 업데이트
                  </button>
                </div>

                {suggestion && candidates.length > 0 && (
                  <RecommendationPanel
                    attemptNumber={attempts.length + 1}
                    suggestion={suggestion}
                    candidateCount={candidates.length}
                  />
                )}
              </>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
