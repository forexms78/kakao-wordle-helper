# 카카오 단어맞추기 도우미 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 카카오 단어맞추기 게임의 결과 힌트를 입력받아 엔트로피 기반으로 최적 추천 단어를 제공하는 웹 도우미 앱을 Next.js로 구축하고 Vercel에 배포한다.

**Architecture:** 순수 클라이언트 사이드 Next.js 앱. 단어 사전은 JSON 번들로 포함하고, 자모 분해 및 엔트로피 계산은 브라우저에서 실행. 백엔드 없음.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Jest, Vercel

---

## 파일 구조

```
kakao-wordle-helper/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 메인 페이지 — 상태 관리 및 게임 로직 조율
│   │   ├── layout.tsx            # 루트 레이아웃, 메타데이터
│   │   └── globals.css           # 전역 스타일 (Tailwind 포함)
│   ├── components/
│   │   ├── HintCell.tsx          # 단일 자모 칸 — 클릭으로 회색→노란→초록 순환
│   │   ├── HintInputGrid.tsx     # 자모 5칸 행 — HintCell 5개 묶음
│   │   ├── AttemptHistory.tsx    # 이전 시도 기록 목록
│   │   └── RecommendationPanel.tsx  # 현재 추천 단어 + 남은 후보 수
│   ├── lib/
│   │   ├── jamo.ts               # 한글 자모 분해 유틸리티
│   │   ├── solver.ts             # 힌트 필터링 + 엔트로피 계산 + 추천
│   │   └── __tests__/
│   │       ├── jamo.test.ts
│   │       └── solver.test.ts
│   └── data/
│       └── word-list.json        # 자모 5개 한국어 단어 목록
├── jest.config.js
├── jest.setup.js
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Task 1: Next.js 프로젝트 초기화

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Next.js 앱 생성**

```bash
cd /Users/bellboi/code/kakao-wordle-helper
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

Expected: 프로젝트 파일들이 생성됨

- [ ] **Step 2: src 디렉토리 구조 생성 (create-next-app이 src 미사용 시 수동 이동)**

create-next-app이 이미 app/ 디렉토리를 생성했으면 src/app/으로 이동:

```bash
mkdir -p src && mv app src/ && mv components src/ 2>/dev/null || true
```

- [ ] **Step 3: Jest 설정 파일 작성**

`jest.config.js`:
```js
const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

module.exports = createJestConfig({
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathPattern: ['src/lib/__tests__'],
})
```

`jest.setup.js`:
```js
// 필요 시 전역 설정 추가
```

- [ ] **Step 4: Jest 의존성 설치**

```bash
npm install --save-dev jest @types/jest
```

- [ ] **Step 5: package.json에 test 스크립트 추가**

`package.json`의 scripts에 추가:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 6: layout.tsx 작성**

`src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '카카오 단어맞추기 도우미',
  description: '카카오 단어맞추기 게임을 위한 힌트 기반 단어 추천 도우미',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 7: 빌드 확인**

```bash
npm run build
```

Expected: 오류 없이 빌드 완료

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: Next.js 14 프로젝트 초기화"
```

---

## Task 2: 단어 목록 데이터

**Files:**
- Create: `src/data/word-list.json`

- [ ] **Step 1: 자모 5개 한국어 단어 목록 작성**

`src/data/word-list.json`:
```json
[
  "가방","가슴","가족","가을","감사","거울","겨울","고양","고집","공부",
  "구름","국화","기린","기억","기적","기차",
  "나방","날씨","노력","노을",
  "다음","도전","도움","독서","딸기",
  "마음","모양","모임","무릎","문자",
  "바람","바늘","봄비","부엌","비극","비행",
  "사랑","사람","사슴","사진","서울","서점","세상","소금","소망",
  "손해","수박","수업","숙제","숫자","시간","시험","시장","시청",
  "아침","언어","역사","여름","여행","오전","우정","이름","이슬",
  "이익","일기","자갈","자석","자전","장미","저녁","전화",
  "참외","친구","축구","파란","하늘","학교","향기","허공","희망",
  "비빔","버섯","농구","음료","지갑","지식","높이","깊이",
  "가치","희극","인정","용기","지혜","행복","평화","자유","진실","정의",
  "공정","성실","협력","창의","열정","도전","성장","배움","나눔","봉사"
]
```

> 참고: 위 목록은 시작용. 실제 카카오 단어맞추기 정답 단어는 커뮤니티(나무위키 등) 수집본으로 보강 가능. 자모 5개 필터는 Task 3의 `countJamo()` 함수로 검증.

- [ ] **Step 2: 커밋**

```bash
git add src/data/word-list.json
git commit -m "feat: 자모 5개 한국어 단어 목록 추가"
```

---

## Task 3: 한글 자모 분해 유틸리티 (TDD)

**Files:**
- Create: `src/lib/jamo.ts`
- Create: `src/lib/__tests__/jamo.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

`src/lib/__tests__/jamo.test.ts`:
```typescript
import { decomposeChar, decomposeWord, countJamo } from '@/lib/jamo'

describe('decomposeChar', () => {
  it('가 → [ㄱ, ㅏ]', () => {
    expect(decomposeChar('가')).toEqual(['ㄱ', 'ㅏ'])
  })

  it('방 → [ㅂ, ㅏ, ㅇ]', () => {
    expect(decomposeChar('방')).toEqual(['ㅂ', 'ㅏ', 'ㅇ'])
  })

  it('닭 → [ㄷ, ㅏ, ㄹ, ㄱ] (겹받침)', () => {
    // 닭의 받침은 ㄺ (ㄹ+ㄱ 겹받침) — 겹받침은 한 자모로 취급
    expect(decomposeChar('닭')).toEqual(['ㄷ', 'ㅏ', 'ㄺ'])
  })

  it('비한글 문자는 그대로 반환', () => {
    expect(decomposeChar('a')).toEqual(['a'])
  })
})

describe('decomposeWord', () => {
  it('가방 → [ㄱ, ㅏ, ㅂ, ㅏ, ㅇ]', () => {
    expect(decomposeWord('가방')).toEqual(['ㄱ', 'ㅏ', 'ㅂ', 'ㅏ', 'ㅇ'])
  })

  it('사랑 → [ㅅ, ㅏ, ㄹ, ㅏ, ㅇ]', () => {
    expect(decomposeWord('사랑')).toEqual(['ㅅ', 'ㅏ', 'ㄹ', 'ㅏ', 'ㅇ'])
  })

  it('구름 → [ㄱ, ㅜ, ㄹ, ㅡ, ㅁ]', () => {
    expect(decomposeWord('구름')).toEqual(['ㄱ', 'ㅜ', 'ㄹ', 'ㅡ', 'ㅁ'])
  })
})

describe('countJamo', () => {
  it('가방 = 5 자모', () => {
    expect(countJamo('가방')).toBe(5)
  })

  it('나라 = 4 자모', () => {
    expect(countJamo('나라')).toBe(4)
  })

  it('한국 = 6 자모', () => {
    expect(countJamo('한국')).toBe(6)
  })
})
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
npm test -- --testPathPattern=jamo
```

Expected: FAIL — `Cannot find module '@/lib/jamo'`

- [ ] **Step 3: jamo.ts 구현**

`src/lib/jamo.ts`:
```typescript
const SYLLABLE_START = 0xac00
const SYLLABLE_END = 0xd7a3

const INITIALS = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ',
  'ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',
]

const VOWELS = [
  'ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ',
  'ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ',
]

// 종성 (인덱스 0 = 받침 없음)
const FINALS = [
  '','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ',
  'ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ',
  'ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',
]

/**
 * 한글 음절 하나를 자모 배열로 분해.
 * 비한글 문자는 [char] 그대로 반환.
 */
export function decomposeChar(char: string): string[] {
  const code = char.charCodeAt(0)
  if (code < SYLLABLE_START || code > SYLLABLE_END) return [char]

  const offset = code - SYLLABLE_START
  const finalIdx = offset % 28
  const vowelIdx = Math.floor(offset / 28) % 21
  const initialIdx = Math.floor(offset / 28 / 21)

  const result = [INITIALS[initialIdx], VOWELS[vowelIdx]]
  if (finalIdx > 0) result.push(FINALS[finalIdx])
  return result
}

/**
 * 한국어 단어를 자모 배열로 완전 분해.
 */
export function decomposeWord(word: string): string[] {
  return word.split('').flatMap(decomposeChar)
}

/**
 * 단어의 자모 총 개수를 반환.
 */
export function countJamo(word: string): number {
  return decomposeWord(word).length
}
```

- [ ] **Step 4: 테스트 실행 (통과 확인)**

```bash
npm test -- --testPathPattern=jamo
```

Expected: PASS (4 test suites, 7 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/jamo.ts src/lib/__tests__/jamo.test.ts
git commit -m "feat: 한글 자모 분해 유틸리티 구현 (TDD)"
```

---

## Task 4: 솔버 알고리즘 (TDD)

**Files:**
- Create: `src/lib/solver.ts`
- Create: `src/lib/__tests__/solver.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

`src/lib/__tests__/solver.test.ts`:
```typescript
import { getPattern, filterCandidates, calcEntropy, getBestSuggestion } from '@/lib/solver'

describe('getPattern', () => {
  it('완전 일치 시 모두 green', () => {
    const guess = ['ㄱ','ㅏ','ㅂ','ㅏ','ㅇ']
    const answer = ['ㄱ','ㅏ','ㅂ','ㅏ','ㅇ']
    expect(getPattern(guess, answer)).toEqual(['green','green','green','green','green'])
  })

  it('자모 있지만 위치 틀리면 yellow', () => {
    // guess: 가방 → answer: 방가 (가상)
    const guess = ['ㄱ','ㅏ','ㅂ','ㅏ','ㅇ']
    const answer = ['ㅂ','ㅏ','ㅇ','ㄱ','ㅏ']
    const result = getPattern(guess, answer)
    // ㄱ: answer에 있지만 위치 0이 아님 → yellow
    expect(result[0]).toBe('yellow')
    // ㅏ: answer에 있음, 위치 1이 맞으면 green
    expect(result[1]).toBe('green')
    // ㅂ: answer에 있지만 위치 2가 아님 → yellow
    expect(result[2]).toBe('yellow')
  })

  it('없는 자모는 gray', () => {
    const guess = ['ㅎ','ㅏ','ㄴ','ㅡ','ㄹ']  // 하늘
    const answer = ['ㄱ','ㅏ','ㅂ','ㅏ','ㅇ']  // 가방
    const result = getPattern(guess, answer)
    // ㅎ: 없음 → gray
    expect(result[0]).toBe('gray')
    // ㅏ: answer 위치 1에 있음 → green
    expect(result[1]).toBe('green')
    // ㄴ: 없음 → gray
    expect(result[2]).toBe('gray')
    // ㅡ: 없음 → gray
    expect(result[3]).toBe('gray')
    // ㄹ: 없음 → gray
    expect(result[4]).toBe('gray')
  })

  it('같은 자모 중복 처리 — yellow는 answer의 남은 개수만큼만', () => {
    // guess에 ㅏ가 2개, answer에 ㅏ가 1개
    const guess = ['ㅏ','ㅏ','ㅂ','ㅏ','ㅇ']
    const answer = ['ㄱ','ㅣ','ㅂ','ㅏ','ㅇ']
    const result = getPattern(guess, answer)
    // 첫 ㅏ: answer에 없음(위치 0에 ㄱ) → yellow (answer[3]에 ㅏ 있음)
    expect(result[0]).toBe('yellow')
    // 두번째 ㅏ: ㅏ가 이미 소진됨 → gray
    expect(result[1]).toBe('gray')
    // ㅂ: green
    expect(result[2]).toBe('green')
    // ㅏ: green
    expect(result[3]).toBe('green')
  })
})

describe('filterCandidates', () => {
  const words = ['가방','사랑','하늘','구름','바람']

  it('힌트 없으면 전체 반환', () => {
    expect(filterCandidates(words, [])).toEqual(words)
  })

  it('green 힌트로 후보 필터링', () => {
    // 위치 0이 ㄱ인 단어만
    const hints = [{ jamos: ['ㄱ','ㅏ','ㅂ','ㅏ','ㅇ'], pattern: ['green','gray','gray','gray','gray'] as const }]
    const result = filterCandidates(words, hints)
    // 가방(ㄱ), 구름(ㄱ) 포함
    expect(result).toContain('가방')
    expect(result).toContain('구름')
    expect(result).not.toContain('사랑')
    expect(result).not.toContain('하늘')
  })
})

describe('calcEntropy', () => {
  it('엔트로피는 0 이상', () => {
    const candidates = ['가방','사랑','하늘']
    const entropy = calcEntropy('가방', candidates)
    expect(entropy).toBeGreaterThanOrEqual(0)
  })

  it('후보 1개면 엔트로피 0', () => {
    expect(calcEntropy('가방', ['가방'])).toBe(0)
  })
})

describe('getBestSuggestion', () => {
  it('후보가 1개면 그 단어 반환', () => {
    expect(getBestSuggestion(['가방'], ['가방','사랑'])).toBe('가방')
  })

  it('후보가 2개 이하면 첫번째 반환', () => {
    expect(getBestSuggestion(['가방','사랑'], ['가방','사랑'])).toBe('가방')
  })

  it('후보가 여럿이면 string 반환', () => {
    const candidates = ['가방','사랑','하늘','구름','바람']
    const result = getBestSuggestion(candidates, candidates)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
npm test -- --testPathPattern=solver
```

Expected: FAIL — `Cannot find module '@/lib/solver'`

- [ ] **Step 3: solver.ts 구현**

`src/lib/solver.ts`:
```typescript
import { decomposeWord } from './jamo'

export type HintColor = 'gray' | 'yellow' | 'green'

export interface AttemptHint {
  jamos: string[]
  pattern: HintColor[]
}

/**
 * guess 자모 배열과 answer 자모 배열을 비교해 힌트 패턴 계산.
 * 중복 자모 처리: green 우선, 나머지는 answer의 남은 수만큼 yellow.
 */
export function getPattern(guess: string[], answer: string[]): HintColor[] {
  const pattern: HintColor[] = new Array(5).fill('gray')
  const remaining = [...answer]

  // 1패스: green 처리
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      pattern[i] = 'green'
      remaining[i] = ''
    }
  }

  // 2패스: yellow 처리
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
 * 이전 시도 힌트들을 모두 적용해 유효한 후보 단어만 반환.
 * 각 힌트에 대해 "이 단어가 정답이라면 해당 guess의 패턴이 일치하는가"를 검증.
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
 * 후보가 2개 이하면 바로 candidates[0] 반환.
 * 후보가 많을 때는 성능을 위해 후보 내에서만 탐색.
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
```

- [ ] **Step 4: 테스트 실행 (통과 확인)**

```bash
npm test -- --testPathPattern=solver
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/lib/solver.ts src/lib/__tests__/solver.test.ts
git commit -m "feat: 힌트 필터링 + 엔트로피 기반 솔버 구현 (TDD)"
```

---

## Task 5: HintCell 컴포넌트

**Files:**
- Create: `src/components/HintCell.tsx`

- [ ] **Step 1: HintCell 작성**

`src/components/HintCell.tsx`:
```tsx
import type { HintColor } from '@/lib/solver'

interface HintCellProps {
  jamo: string
  color: HintColor
  onClick: () => void
  readonly?: boolean
}

const COLOR_CLASSES: Record<HintColor, string> = {
  gray: 'bg-gray-700 border-gray-600 text-gray-300',
  yellow: 'bg-yellow-500 border-yellow-400 text-white',
  green: 'bg-green-600 border-green-500 text-white',
}

const COLOR_LABELS: Record<HintColor, string> = {
  gray: '없음',
  yellow: '위치틀림',
  green: '정확',
}

export function HintCell({ jamo, color, onClick, readonly = false }: HintCellProps) {
  return (
    <button
      onClick={readonly ? undefined : onClick}
      disabled={readonly}
      className={`
        w-12 h-12 border-2 rounded-lg flex flex-col items-center justify-center
        font-bold text-xl transition-colors select-none
        ${COLOR_CLASSES[color]}
        ${readonly ? 'cursor-default' : 'cursor-pointer hover:opacity-80 active:scale-95'}
      `}
      aria-label={`${jamo} ${COLOR_LABELS[color]}`}
    >
      <span>{jamo}</span>
    </button>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/HintCell.tsx
git commit -m "feat: HintCell 컴포넌트 — 클릭으로 색상 순환"
```

---

## Task 6: HintInputGrid 컴포넌트

**Files:**
- Create: `src/components/HintInputGrid.tsx`

- [ ] **Step 1: HintInputGrid 작성**

`src/components/HintInputGrid.tsx`:
```tsx
'use client'

import { HintCell } from './HintCell'
import type { HintColor } from '@/lib/solver'

interface HintInputGridProps {
  jamos: string[]          // 추천 단어의 자모 5개
  colors: HintColor[]      // 현재 각 칸의 색상
  onColorChange: (index: number, color: HintColor) => void
}

const NEXT_COLOR: Record<HintColor, HintColor> = {
  gray: 'yellow',
  yellow: 'green',
  green: 'gray',
}

export function HintInputGrid({ jamos, colors, onColorChange }: HintInputGridProps) {
  const handleClick = (index: number) => {
    onColorChange(index, NEXT_COLOR[colors[index]])
  }

  return (
    <div className="flex gap-2 justify-center">
      {jamos.map((jamo, i) => (
        <HintCell
          key={i}
          jamo={jamo}
          color={colors[i]}
          onClick={() => handleClick(i)}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/HintInputGrid.tsx
git commit -m "feat: HintInputGrid 컴포넌트 — 5칸 힌트 입력"
```

---

## Task 7: AttemptHistory 컴포넌트

**Files:**
- Create: `src/components/AttemptHistory.tsx`

- [ ] **Step 1: AttemptHistory 작성**

`src/components/AttemptHistory.tsx`:
```tsx
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
                onClick={() => {}}
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
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/AttemptHistory.tsx
git commit -m "feat: AttemptHistory 컴포넌트 — 이전 시도 기록"
```

---

## Task 8: RecommendationPanel 컴포넌트

**Files:**
- Create: `src/components/RecommendationPanel.tsx`

- [ ] **Step 1: RecommendationPanel 작성**

`src/components/RecommendationPanel.tsx`:
```tsx
interface RecommendationPanelProps {
  attemptNumber: number   // 현재 몇 번째 시도 (1~5)
  suggestion: string      // 추천 단어
  candidateCount: number  // 남은 후보 수
}

export function RecommendationPanel({
  attemptNumber,
  suggestion,
  candidateCount,
}: RecommendationPanelProps) {
  return (
    <div className="bg-green-950 border border-green-800 rounded-xl p-4">
      <p className="text-xs text-green-400 mb-2 font-medium">
        {attemptNumber}번째 시도 추천
      </p>
      <div className="flex items-baseline gap-4">
        <span className="text-3xl font-bold tracking-widest text-white">
          {suggestion}
        </span>
        <span className="text-sm text-gray-400">
          후보 {candidateCount}개
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        카카오에서 이 단어를 입력해보세요
      </p>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/RecommendationPanel.tsx
git commit -m "feat: RecommendationPanel 컴포넌트 — 추천 단어 표시"
```

---

## Task 9: 메인 페이지 — 전체 연결

**Files:**
- Create: `src/app/page.tsx`

- [ ] **Step 1: page.tsx 작성**

`src/app/page.tsx`:
```tsx
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

  // 초기 추천 계산
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

    // 정답 체크
    if (currentColors.every(c => c === 'green')) {
      setStatus('won')
      return
    }

    // 후보 필터링
    const hints = newAttempts.map(a => ({ jamos: a.jamos, pattern: a.hints }))
    const newCandidates = filterCandidates(WORD_LIST, hints)
    setCandidates(newCandidates)

    // 5회 소진
    if (newAttempts.length >= MAX_ATTEMPTS) {
      setStatus('lost')
      return
    }

    // 다음 추천
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

        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">카카오 단어맞추기 도우미</h1>
          <p className="text-sm text-gray-500 mt-1">
            {MAX_ATTEMPTS - attempts.length}회 남음
          </p>
        </div>

        {/* 이전 시도 기록 */}
        {attempts.length > 0 && (
          <AttemptHistory attempts={attempts} />
        )}

        {/* 게임 종료 화면 */}
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

        {/* 진행 중 화면 */}
        {status === 'playing' && suggestion && (
          <>
            {/* 추천 단어 */}
            <RecommendationPanel
              attemptNumber={attempts.length + 1}
              suggestion={suggestion}
              candidateCount={candidates.length}
            />

            {/* 결과 입력 */}
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

              {/* 색상 범례 */}
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
```

- [ ] **Step 2: solver.ts에서 decomposeWord re-export 확인**

`src/lib/solver.ts` 상단에 아래 re-export 추가 (page.tsx에서 import하므로):
```typescript
export { decomposeWord } from './jamo'
```

- [ ] **Step 3: 개발 서버 실행 및 수동 테스트**

```bash
npm run dev
```

브라우저에서 http://localhost:3000 열어 확인:
- 첫 추천 단어 표시 확인
- 칸 클릭 시 회색→노란→초록 순환 확인
- "결과 확인" 버튼 후 다음 추천 표시 확인
- 5회 소진 시 종료 화면 확인
- 모두 초록 시 정답 화면 확인

- [ ] **Step 4: 빌드 확인**

```bash
npm run build
```

Expected: 오류 없이 빌드 완료

- [ ] **Step 5: 커밋**

```bash
git add src/app/page.tsx src/lib/solver.ts
git commit -m "feat: 메인 페이지 — 게임 상태 관리 및 전체 UI 연결"
```

---

## Task 10: Vercel 배포

**Files:**
- No new files (Vercel은 Next.js를 자동 감지)

- [ ] **Step 1: GitHub 저장소 생성 및 푸시**

```bash
gh repo create kakao-wordle-helper --public --source=. --remote=origin --push
```

Expected: `https://github.com/forexms78/kakao-wordle-helper` 생성 및 코드 푸시

- [ ] **Step 2: Vercel 배포**

```bash
vercel --yes --prod
```

Expected: 배포 URL 출력 (예: `https://kakao-wordle-helper.vercel.app`)

- [ ] **Step 3: 배포된 URL에서 동작 확인**

브라우저에서 출력된 URL 열어 전체 기능 확인:
- 추천 단어 표시
- 힌트 입력 인터랙션
- 결과 흐름

- [ ] **Step 4: context.md 프로젝트 목록에 추가**

`~/.claude/docs/context.md`의 프로젝트 목록에:
```
| kakao-wordle-helper | `/Users/bellboi/code/kakao-wordle-helper` | 카카오 단어맞추기 도우미 |
```

- [ ] **Step 5: 커밋**

```bash
git add .
git commit -m "chore: Vercel 배포 완료"
```

---

## 자체 검토

### 스펙 커버리지

| 스펙 항목 | 구현 Task |
|----------|----------|
| Next.js 14 + TypeScript + Tailwind | Task 1 |
| 자모 5개 단어 사전 (혼합) | Task 2 |
| 한글 자모 분해 유틸 | Task 3 |
| 엔트로피 기반 추천 알고리즘 | Task 4 |
| A방식 단일 행 UI | Task 5~9 |
| 클릭으로 회색→노란→초록 순환 | Task 5~6 |
| 이전 시도 기록 표시 | Task 7 |
| 추천 단어 + 후보 수 표시 | Task 8 |
| 정답/실패 화면 | Task 9 |
| Vercel 배포 | Task 10 |
| 이모지 미사용 | 전체 |
| 모바일 반응형 | Task 9 (max-w-sm) |
