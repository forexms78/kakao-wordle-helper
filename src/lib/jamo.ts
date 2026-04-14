const SYLLABLE_START = 0xac00
const SYLLABLE_END = 0xd7a3

// 두벌식 24 기본 자모 (초성)
const INITIALS = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ',
  'ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',
]

// 중성 (21개)
const VOWELS = [
  'ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ',
  'ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ',
]

// 종성 (28개, 인덱스 0 = 받침 없음)
const FINALS = [
  '','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ',
  'ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ',
  'ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',
]

// 복합모음 → 기본 자모 분해
const COMPOUND_VOWEL: Record<string, string[]> = {
  'ㅐ': ['ㅏ','ㅣ'],
  'ㅒ': ['ㅑ','ㅣ'],
  'ㅔ': ['ㅓ','ㅣ'],
  'ㅖ': ['ㅕ','ㅣ'],
  'ㅘ': ['ㅗ','ㅏ'],
  'ㅙ': ['ㅗ','ㅏ','ㅣ'],
  'ㅚ': ['ㅗ','ㅣ'],
  'ㅝ': ['ㅜ','ㅓ'],
  'ㅞ': ['ㅜ','ㅓ','ㅣ'],
  'ㅟ': ['ㅜ','ㅣ'],
  'ㅢ': ['ㅡ','ㅣ'],
}

// 쌍자음 → 기본 자모 분해 (초성 및 종성 공통)
const DOUBLE_CONSONANT: Record<string, string[]> = {
  'ㄲ': ['ㄱ','ㄱ'],
  'ㄸ': ['ㄷ','ㄷ'],
  'ㅃ': ['ㅂ','ㅂ'],
  'ㅆ': ['ㅅ','ㅅ'],
  'ㅉ': ['ㅈ','ㅈ'],
}

// 겹받침 → 기본 자모 분해
const COMPOUND_FINAL: Record<string, string[]> = {
  'ㄳ': ['ㄱ','ㅅ'],
  'ㄵ': ['ㄴ','ㅈ'],
  'ㄶ': ['ㄴ','ㅎ'],
  'ㄺ': ['ㄹ','ㄱ'],
  'ㄻ': ['ㄹ','ㅁ'],
  'ㄼ': ['ㄹ','ㅂ'],
  'ㄽ': ['ㄹ','ㅅ'],
  'ㄾ': ['ㄹ','ㅌ'],
  'ㄿ': ['ㄹ','ㅍ'],
  'ㅀ': ['ㄹ','ㅎ'],
  'ㅄ': ['ㅂ','ㅅ'],
}

function expandJamo(jamo: string): string[] {
  if (DOUBLE_CONSONANT[jamo]) return DOUBLE_CONSONANT[jamo]
  if (COMPOUND_FINAL[jamo]) return COMPOUND_FINAL[jamo]
  if (COMPOUND_VOWEL[jamo]) return COMPOUND_VOWEL[jamo]
  return [jamo]
}

/**
 * 한글 음절 하나를 두벌식 기본 자모 배열로 완전 분해.
 * 비한글 문자는 [char] 그대로 반환.
 */
export function decomposeChar(char: string): string[] {
  const code = char.charCodeAt(0)
  if (code < SYLLABLE_START || code > SYLLABLE_END) return [char]

  const offset = code - SYLLABLE_START
  const finalIdx = offset % 28
  const vowelIdx = Math.floor(offset / 28) % 21
  const initialIdx = Math.floor(offset / 28 / 21)

  const initial = INITIALS[initialIdx]
  const vowel = VOWELS[vowelIdx]
  const final = FINALS[finalIdx]

  return [
    ...expandJamo(initial),
    ...expandJamo(vowel),
    ...(final ? expandJamo(final) : []),
  ]
}

/**
 * 한국어 단어를 두벌식 기본 자모 배열로 완전 분해.
 */
export function decomposeWord(word: string): string[] {
  return word.split('').flatMap(decomposeChar)
}

/**
 * 단어의 두벌식 키스트로크 수 반환.
 */
export function countJamo(word: string): number {
  return decomposeWord(word).length
}
