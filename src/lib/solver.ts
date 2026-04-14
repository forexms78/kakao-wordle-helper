import { decomposeWord } from './jamo'

export type HintColor = 'gray' | 'yellow' | 'green'

export interface AttemptHint {
  jamos: string[]
  pattern: readonly HintColor[] | HintColor[]
}

/**
 * guess 자모 배열과 answer 자모 배열을 비교해 힌트 패턴 반환.
 * 중복 자모 처리: green 우선, 나머지는 남은 개수만큼 yellow.
 */
export function getPattern(guess: string[], answer: string[]): HintColor[] {
  const pattern: HintColor[] = new Array(5).fill('gray')
  // remaining: green으로 매칭된 위치를 포함해 yellow 검색에 사용
  // green 위치는 yellow 2패스에서 재사용 가능하도록 소진하지 않음
  const remaining = [...answer]

  // 1패스: green — remaining에서 소진하지 않음 (yellow 계산에 포함)
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      pattern[i] = 'green'
    }
  }

  // 2패스: yellow — remaining 전체(green 포함)에서 검색, 단 green 위치는 건너뜀
  for (let i = 0; i < 5; i++) {
    if (pattern[i] === 'green') continue
    const idx = remaining.indexOf(guess[i])
    if (idx !== -1) {
      pattern[i] = 'yellow'
      remaining[idx] = ''
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

  const wordsToEvaluate = candidates.length > 150
    ? candidates.slice(0, 200)
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
