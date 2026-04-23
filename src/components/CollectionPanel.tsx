'use client'

import { useState, useEffect } from 'react'
import {
  loadCollection,
  totalGems,
  GEM_INFO,
  type Collection,
  type GemType,
} from '@/lib/collection'

const GEM_ORDER: GemType[] = ['ruby', 'gold', 'sapphire', 'emerald', 'silver']

export function CollectionPanel() {
  const [col, setCol] = useState<Collection>(() => ({ gems: { ruby: 0, gold: 0, sapphire: 0, emerald: 0, silver: 0 }, wordDex: {} }))

  useEffect(() => {
    setCol(loadCollection())
  }, [])

  const words = Object.entries(col.wordDex).sort(
    (a, b) => new Date(b[1].date).getTime() - new Date(a[1].date).getTime()
  )
  const gemTotal = totalGems(col.gems)
  const dexCount = words.length

  return (
    <div className="space-y-6">
      {/* 보석 컬렉션 */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-semibold text-gray-300">보석 컬렉션</p>
          <p className="text-xs text-gray-500">총 {gemTotal}개</p>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {GEM_ORDER.map(gem => {
            const info = GEM_INFO[gem]
            const count = col.gems[gem]
            return (
              <div
                key={gem}
                className="bg-gray-800 rounded-lg p-3 text-center"
                style={{ opacity: count === 0 ? 0.35 : 1 }}
              >
                <div className="text-2xl mb-1">{info.icon}</div>
                <div className="text-base font-black text-white">{count}</div>
                <div className="text-xs mt-0.5" style={{ color: info.color }}>{info.label}</div>
              </div>
            )
          })}
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1 text-center">
          {['1회', '2회', '3회', '4회', '5회'].map((label, i) => (
            <div key={i} className="text-xs text-gray-600">{label}</div>
          ))}
        </div>
      </div>

      {/* 단어 도감 */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-gray-300">단어 도감</p>
          <p className="text-xs text-gray-500">{dexCount} / 16360 수집</p>
        </div>

        {/* 진행 바 */}
        <div className="bg-gray-800 rounded-full h-1.5 mb-4">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${Math.max((dexCount / 16360) * 100, dexCount > 0 ? 1 : 0)}%`,
              background: 'linear-gradient(to right, #f87171, #fbbf24, #a78bfa, #34d399)',
            }}
          />
        </div>

        {dexCount === 0 ? (
          <p className="text-center text-sm text-gray-600 py-6">단어를 맞추면 도감에 추가됩니다</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {words.map(([word, entry]) => {
              const gem = entry.attempts === 1 ? 'ruby'
                : entry.attempts === 2 ? 'gold'
                : entry.attempts === 3 ? 'sapphire'
                : entry.attempts === 4 ? 'emerald' : 'silver' as GemType
              const info = GEM_INFO[gem]
              return (
                <div key={word} className="bg-gray-800 rounded-lg p-2.5 text-center">
                  <div className="text-sm font-bold text-green-400">{word}</div>
                  <div className="text-xs mt-0.5" style={{ color: info.color }}>
                    {info.icon} {entry.attempts}회
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">{entry.date}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
