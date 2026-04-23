export type GemType = 'ruby' | 'gold' | 'sapphire' | 'emerald' | 'silver'

export interface GemCollection {
  ruby: number
  gold: number
  sapphire: number
  emerald: number
  silver: number
}

export interface WordDexEntry {
  attempts: number
  date: string
}

export interface Collection {
  gems: GemCollection
  wordDex: Record<string, WordDexEntry>
}

export const GEM_INFO: Record<GemType, { label: string; icon: string; color: string }> = {
  ruby:     { label: '루비',     icon: '🔴', color: '#f87171' },
  gold:     { label: '골드',     icon: '🟡', color: '#fbbf24' },
  sapphire: { label: '사파이어', icon: '💎', color: '#a78bfa' },
  emerald:  { label: '에메랄드', icon: '💚', color: '#34d399' },
  silver:   { label: '실버',     icon: '⚪', color: '#9ca3af' },
}

const STORAGE_KEY = 'kakao-wordle-collection'

const EMPTY_GEMS: GemCollection = { ruby: 0, gold: 0, sapphire: 0, emerald: 0, silver: 0 }

export function loadCollection(): Collection {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        gems: { ...EMPTY_GEMS, ...parsed.gems },
        wordDex: parsed.wordDex ?? {},
      }
    }
  } catch {}
  return { gems: { ...EMPTY_GEMS }, wordDex: {} }
}

export function gemForAttempts(attempts: number): GemType {
  if (attempts === 1) return 'ruby'
  if (attempts === 2) return 'gold'
  if (attempts === 3) return 'sapphire'
  if (attempts === 4) return 'emerald'
  return 'silver'
}

export function recordWin(word: string, attempts: number): { gem: GemType; isNew: boolean } {
  const col = loadCollection()
  const gem = gemForAttempts(attempts)
  const isNew = !col.wordDex[word]

  if (isNew) {
    col.gems[gem]++
    col.wordDex[word] = { attempts, date: new Date().toISOString().split('T')[0] }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(col))
  }

  return { gem, isNew }
}

export function totalGems(gems: GemCollection): number {
  return gems.ruby + gems.gold + gems.sapphire + gems.emerald + gems.silver
}
