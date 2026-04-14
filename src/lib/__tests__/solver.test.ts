import { getPattern, filterCandidates, calcEntropy, getBestSuggestion } from '@/lib/solver'

describe('getPattern', () => {
  it('완전 일치 → 모두 green', () => {
    const jamos = ['ㄱ','ㅏ','ㅂ','ㅏ','ㅇ']
    expect(getPattern(jamos, jamos)).toEqual(['green','green','green','green','green'])
  })

  it('없는 자모 → gray', () => {
    const guess = ['ㅎ','ㅏ','ㄴ','ㅡ','ㄹ']
    const answer = ['ㄱ','ㅏ','ㅂ','ㅏ','ㅇ']
    const result = getPattern(guess, answer)
    expect(result[0]).toBe('gray') // ㅎ 없음
    expect(result[1]).toBe('green') // ㅏ 위치 일치
    expect(result[2]).toBe('gray') // ㄴ 없음
    expect(result[3]).toBe('gray') // ㅡ 없음
    expect(result[4]).toBe('gray') // ㄹ 없음
  })

  it('자모 있지만 위치 틀림 → yellow', () => {
    const guess = ['ㅂ','ㅏ','ㅇ','ㄱ','ㅏ']
    const answer = ['ㄱ','ㅏ','ㅂ','ㅏ','ㅇ']
    const result = getPattern(guess, answer)
    expect(result[0]).toBe('yellow') // ㅂ → answer에 있음, 위치 다름
    expect(result[1]).toBe('green')  // ㅏ → 위치 일치
    expect(result[2]).toBe('yellow') // ㅇ → answer에 있음, 위치 다름
  })

  it('중복 자모 처리 — answer에 1개인데 guess에 2개', () => {
    // guess에 ㅏ 두 번, answer에 ㅏ 한 번 (위치 3)
    const guess = ['ㅏ','ㅏ','ㅂ','ㅏ','ㅇ']
    const answer = ['ㄱ','ㄱ','ㅂ','ㅏ','ㅇ']
    const result = getPattern(guess, answer)
    // 첫 ㅏ (위치 0): answer[3]에 ㅏ 있으므로 yellow
    expect(result[0]).toBe('yellow')
    // 두번째 ㅏ (위치 1): ㅏ 이미 소진 → gray
    expect(result[1]).toBe('gray')
    // ㅂ, ㅏ, ㅇ 나머지는 green
    expect(result[2]).toBe('green')
    expect(result[3]).toBe('green')
    expect(result[4]).toBe('green')
  })
})

describe('filterCandidates', () => {
  const words = ['가방','사랑','하늘','구름','바람']

  it('힌트 없으면 전체 반환', () => {
    expect(filterCandidates(words, [])).toEqual(words)
  })

  it('green 힌트: 위치 0에 ㄱ → ㄱ으로 시작하는 단어만', () => {
    // guess=['ㄱ','ㅣ','ㄷ','ㅓ','ㅊ'] 위치 0 green → 후보 중 ㄱ 초성인 가방/구름만 남음
    const hints = [{
      jamos: ['ㄱ','ㅣ','ㄷ','ㅓ','ㅊ'],
      pattern: ['green','gray','gray','gray','gray'] as const
    }]
    const result = filterCandidates(words, hints)
    expect(result).toContain('가방')
    expect(result).toContain('구름')
    expect(result).not.toContain('사랑')
    expect(result).not.toContain('하늘')
  })

  it('gray 힌트: ㅅ 포함 단어 제거', () => {
    // ['ㅅ','ㅣ','ㄷ','ㅓ','ㅋ'] all gray → ㅅ 포함된 사랑 제거, 가방 유지
    const localWords = ['가방', '사랑']
    const hints = [{
      jamos: ['ㅅ','ㅣ','ㄷ','ㅓ','ㅋ'],
      pattern: ['gray','gray','gray','gray','gray'] as const
    }]
    const result = filterCandidates(localWords, hints)
    expect(result).not.toContain('사랑')
    expect(result).toContain('가방')
  })
})

describe('calcEntropy', () => {
  it('후보 1개 → 0', () => {
    expect(calcEntropy('가방', ['가방'])).toBe(0)
  })
  it('후보 여럿 → 양수', () => {
    const candidates = ['가방','사랑','하늘','구름','바람']
    expect(calcEntropy('가방', candidates)).toBeGreaterThan(0)
  })
})

describe('getBestSuggestion', () => {
  it('후보 1개 → 그 단어', () => {
    expect(getBestSuggestion(['가방'], ['가방'])).toBe('가방')
  })
  it('후보 2개 이하 → 첫번째', () => {
    expect(getBestSuggestion(['가방','사랑'], ['가방','사랑'])).toBe('가방')
  })
  it('후보 여럿 → string 반환', () => {
    const c = ['가방','사랑','하늘','구름','바람']
    expect(typeof getBestSuggestion(c, c)).toBe('string')
  })
})
