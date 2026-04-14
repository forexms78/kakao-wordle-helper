import { decomposeWord } from './jamo'

export type HintColor = 'gray' | 'yellow' | 'green'

export interface AttemptHint {
  jamos: string[]
  pattern: readonly HintColor[]
}

/**
 * guess 자모 배열과 answer 자모 배열을 비교해 힌트 패턴 반환.
 * 중복 자모 처리: green 우선, 나머지는 남은 개수만큼 yellow.
 */
export function getPattern(guess: string[], answer: string[]): HintColor[] {
  const pattern: HintColor[] = new Array(5).fill('gray')
  const remaining = [...answer]

  // 1패스: green — 매칭된 위치를 remaining에서 소진해 yellow 재판정 방지
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      pattern[i] = 'green'
      remaining[i] = ''  // CRITICAL: 소진해 yellow 재매칭 방지
    }
  }

  // 2패스: yellow — green이 아닌 위치만 남은 remaining에서 검색
  for (let i = 0; i < 5; i++) {
    if (pattern[i] === 'green') continue
    const idx = remaining.indexOf(guess[i])
    if (idx !== -1) {
      pattern[i] = 'yellow'
      remaining[idx] = ''  // 소진
    }
  }

  return pattern
}

/**
 * 이전 시도 힌트들을 적용해 유효한 후보 단어만 반환.
 * 각 힌트의 색상을 제약 조건으로 변환해 후보를 검증한다.
 */
export function filterCandidates(candidates: string[], hints: AttemptHint[]): string[] {
  if (hints.length === 0) return candidates

  return candidates.filter(word => {
    const wordJamos = decomposeWord(word)
    if (wordJamos.length !== 5) return false

    return hints.every(({ jamos, pattern }) => {
      const simPattern = getPattern(jamos, wordJamos)
      return simPattern.every((color, i) => color === pattern[i])
    })
  })
}

/**
 * 해당 단어를 guess로 사용할 때의 기대 정보 이득 (Shannon 엔트로피).
 */
export function calcEntropy(word: string, candidates: string[]): number {
  if (candidates.length <= 1) return 0

  const wordJamos = decomposeWord(word)
  const patternCounts: Record<string, number> = {}

  for (const candidate of candidates) {
    const candidateJamos = decomposeWord(candidate)
    const pattern = getPattern(wordJamos, candidateJamos).join(',')
    patternCounts[pattern] = (patternCounts[pattern] ?? 0) + 1
  }

  const total = candidates.length
  return -Object.values(patternCounts).reduce((sum, count) => {
    const p = count / total
    return sum + p * Math.log2(p)
  }, 0)
}

/**
 * 후보 목록에서 엔트로피가 가장 높은 단어를 추천.
 */
export function getBestSuggestion(candidates: string[], allWords: string[]): string {
  if (candidates.length <= 2) return candidates[0]

  const wordsToEvaluate = allWords.length > 300
    ? allWords.slice(0, 300)
    : allWords

  let bestWord = candidates[0]
  let bestEntropy = -1

  for (const word of wordsToEvaluate) {
    const entropy = calcEntropy(word, candidates)
    if (entropy > bestEntropy) {
      bestEntropy = entropy
      bestWord = word
    }
  }

  return bestWord
}

// Re-export for convenience
export { decomposeWord } from './jamo'
