import { decomposeChar, decomposeWord, countJamo } from '@/lib/jamo'

describe('decomposeChar — 기본 자모 (단순)', () => {
  it('가 → [ㄱ, ㅏ]', () => {
    expect(decomposeChar('가')).toEqual(['ㄱ', 'ㅏ'])
  })
  it('방 → [ㅂ, ㅏ, ㅇ] (받침)', () => {
    expect(decomposeChar('방')).toEqual(['ㅂ', 'ㅏ', 'ㅇ'])
  })
})

describe('decomposeChar — 복합모음 분해', () => {
  it('과 → [ㄱ, ㅗ, ㅏ] (ㅘ 분해)', () => {
    expect(decomposeChar('과')).toEqual(['ㄱ', 'ㅗ', 'ㅏ'])
  })
  it('위 → [ㅇ, ㅜ, ㅣ] (ㅟ 분해)', () => {
    expect(decomposeChar('위')).toEqual(['ㅇ', 'ㅜ', 'ㅣ'])
  })
  it('의 → [ㅇ, ㅡ, ㅣ] (ㅢ 분해)', () => {
    expect(decomposeChar('의')).toEqual(['ㅇ', 'ㅡ', 'ㅣ'])
  })
  it('래 → [ㄹ, ㅏ, ㅣ] (ㅐ 분해)', () => {
    expect(decomposeChar('래')).toEqual(['ㄹ', 'ㅏ', 'ㅣ'])
  })
  it('레 → [ㄹ, ㅓ, ㅣ] (ㅔ 분해)', () => {
    expect(decomposeChar('레')).toEqual(['ㄹ', 'ㅓ', 'ㅣ'])
  })
  it('외 → [ㅇ, ㅗ, ㅣ] (ㅚ 분해)', () => {
    expect(decomposeChar('외')).toEqual(['ㅇ', 'ㅗ', 'ㅣ'])
  })
  it('워 → [ㅇ, ㅜ, ㅓ] (ㅝ 분해)', () => {
    expect(decomposeChar('워')).toEqual(['ㅇ', 'ㅜ', 'ㅓ'])
  })
})

describe('decomposeChar — 쌍자음 분해', () => {
  it('까 → [ㄱ, ㄱ, ㅏ] (ㄲ 초성 분해)', () => {
    expect(decomposeChar('까')).toEqual(['ㄱ', 'ㄱ', 'ㅏ'])
  })
  it('씨 → [ㅅ, ㅅ, ㅣ] (ㅆ 초성 분해)', () => {
    expect(decomposeChar('씨')).toEqual(['ㅅ', 'ㅅ', 'ㅣ'])
  })
  it('낚 → [ㄴ, ㅏ, ㄱ, ㄱ] (ㄲ 종성 분해)', () => {
    // 낚 = ㄴ+ㅏ+ㄲ(종성) → ㄴ+ㅏ+ㄱ+ㄱ
    expect(decomposeChar('낚')).toEqual(['ㄴ', 'ㅏ', 'ㄱ', 'ㄱ'])
  })
})

describe('decomposeChar — 겹받침 분해', () => {
  it('닭 → [ㄷ, ㅏ, ㄹ, ㄱ] (ㄺ 종성 분해)', () => {
    expect(decomposeChar('닭')).toEqual(['ㄷ', 'ㅏ', 'ㄹ', 'ㄱ'])
  })
  it('삶 → [ㅅ, ㅏ, ㄹ, ㅁ] (ㄻ 종성 분해)', () => {
    expect(decomposeChar('삶')).toEqual(['ㅅ', 'ㅏ', 'ㄹ', 'ㅁ'])
  })
  it('읽 → [ㅇ, ㅣ, ㄹ, ㄱ] (ㄺ 종성 분해)', () => {
    expect(decomposeChar('읽')).toEqual(['ㅇ', 'ㅣ', 'ㄹ', 'ㄱ'])
  })
})

describe('decomposeWord', () => {
  it('가방 → [ㄱ, ㅏ, ㅂ, ㅏ, ㅇ]', () => {
    expect(decomposeWord('가방')).toEqual(['ㄱ', 'ㅏ', 'ㅂ', 'ㅏ', 'ㅇ'])
  })
  it('사과 → [ㅅ, ㅏ, ㄱ, ㅗ, ㅏ] (ㅘ 분해)', () => {
    expect(decomposeWord('사과')).toEqual(['ㅅ', 'ㅏ', 'ㄱ', 'ㅗ', 'ㅏ'])
  })
  it('의자 → [ㅇ, ㅡ, ㅣ, ㅈ, ㅏ] (ㅢ 분해)', () => {
    expect(decomposeWord('의자')).toEqual(['ㅇ', 'ㅡ', 'ㅣ', 'ㅈ', 'ㅏ'])
  })
  it('노래 → [ㄴ, ㅗ, ㄹ, ㅏ, ㅣ] (ㅐ 분해)', () => {
    expect(decomposeWord('노래')).toEqual(['ㄴ', 'ㅗ', 'ㄹ', 'ㅏ', 'ㅣ'])
  })
})

describe('countJamo', () => {
  it('가방 = 5', () => expect(countJamo('가방')).toBe(5))
  it('사과 = 5 (ㅘ 분해)', () => expect(countJamo('사과')).toBe(5))
  it('의자 = 5 (ㅢ 분해)', () => expect(countJamo('의자')).toBe(5))
  it('나라 = 4', () => expect(countJamo('나라')).toBe(4))
  it('한국 = 6', () => expect(countJamo('한국')).toBe(6))
})
