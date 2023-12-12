import { readFileSync } from 'fs'
import { join } from 'path'

const canParseCharAsInt = (c: string) => !isNaN(parseInt(c))

const processLines1 = (fileName: string) => {
  return readFileSync(join(__dirname, fileName), 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => !!l)
    .map((line) => {
      const chars = line.split('')
      const charsReversed = [...chars].reverse()
      const first = chars.find((c) => canParseCharAsInt(c))
      const last = charsReversed.find((c) => canParseCharAsInt(c))
      return parseInt(`${first}${last}`)
    })
    .reduce((sum, next) => sum + next, 0)
}

describe('day 1.1', () => {
  describe('tests 1.1', () => {
    const FILENAME = '1.1-test-data.txt'
    it('can find first and last numbers of each line in test data', () => {
      const result = processLines1(FILENAME)

      expect(result).toBe(142)
    })
  })

  describe('question 1.1', () => {
    const FILENAME = '1.1-data.txt'
    it('can solve d1q1', () => {
      const result = processLines1(FILENAME)

      console.log({
        answer: result,
      })

      expect(result).toBeGreaterThan(0)
    })
  })
})

const DIGIT_STRINGS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
]
const DIGIT_STRINGS_BY_CHAR = DIGIT_STRINGS.reduce((map, str) => {
  const char = str[0]
  const current = map.get(char) ?? []
  map.set(char, [...current, str])
  return map
}, new Map<string, string[]>())

const processLine = (line: string) => {
  const chars = line.split('')

  let first: number | null = null
  let last: number | null = null

  chars.forEach((c, idx) => {
    // check if string is digit
    const int = parseInt(c)
    if (!isNaN(int)) {
      if (first === null) {
        first = int
      }
      last = int
      return
    }

    // check if string is digit string
    const possible = DIGIT_STRINGS_BY_CHAR.get(c)
    if (!possible) {
      return
    }
    const digitString = possible.find(
      (p) => line.substring(idx, idx + p.length) === p
    )
    if (!digitString) {
      return
    }

    const digitStringValue = DIGIT_STRINGS.indexOf(digitString)
    if (digitStringValue === -1) {
      return
    }

    if (first === null) {
      first = digitStringValue
    }
    last = digitStringValue
  })

  if (first === null || last === null) {
    throw new Error(`failed to process line "${line}"`)
  }

  return parseInt(`${first}${last}`)
}

const processLines2 = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf-8')
    .split('\n')
    .map((l) => l.trim().toLowerCase())
    .filter((l) => !!l)
    .map((line) => {
      return processLine(line)
    })

describe('day 1.2', () => {
  describe('test 1.2', () => {
    const FILENAME = '1.2-test-data.txt'

    it('gets the digitStringValue for "eight"', () => {
      const idx = DIGIT_STRINGS.findIndex((s) => s === 'eight')

      expect(idx).toBe(8)
    })

    it('has expected shape for DIGIT_STRINGS_BY_CHAR', () => {
      expect(DIGIT_STRINGS_BY_CHAR.size).toBe(7)

      // one
      expect(DIGIT_STRINGS_BY_CHAR.get('o')).toBeDefined()
      expect(DIGIT_STRINGS_BY_CHAR.get('o')).toHaveLength(1)

      // two three
      expect(DIGIT_STRINGS_BY_CHAR.get('t')).toBeDefined()
      expect(DIGIT_STRINGS_BY_CHAR.get('t')).toHaveLength(2)

      // four five
      expect(DIGIT_STRINGS_BY_CHAR.get('f')).toBeDefined()
      expect(DIGIT_STRINGS_BY_CHAR.get('f')).toHaveLength(2)

      // six seven
      expect(DIGIT_STRINGS_BY_CHAR.get('s')).toBeDefined()
      expect(DIGIT_STRINGS_BY_CHAR.get('s')).toHaveLength(2)

      // eight
      expect(DIGIT_STRINGS_BY_CHAR.get('e')).toBeDefined()
      expect(DIGIT_STRINGS_BY_CHAR.get('e')).toHaveLength(1)

      // nine
      expect(DIGIT_STRINGS_BY_CHAR.get('n')).toBeDefined()
      expect(DIGIT_STRINGS_BY_CHAR.get('n')).toHaveLength(1)
    })

    it('checks the correct substring for two in "eightwothree"', () => {
      const line = 'eightwothree'
      const start = line.indexOf('t')
      const end = start + 'two'.length

      const subStr = line.substring(start, end)

      expect(subStr).toBe('two')
    })

    it('processLine "eightwothree"', () => {
      const input = 'eightwothree'

      const result = processLine(input)

      expect(result).toBe(83)
    })

    it('processLine "abcone2threexyz"', () => {
      const input = 'abcone2threexyz'

      const result = processLine(input)

      expect(result).toBe(13)
    })

    it('can parse the 1.2 test data into list', () => {
      const expected = [29, 83, 13, 24, 42, 14, 76]

      const result = processLines2(FILENAME)

      expect(result).toEqual(expected)

      console.log({
        answer: result.reduce((tot, num) => tot + num, 0),
      })
    })
  })

  describe('question 1.2', () => {
    const FILENAME = '1.1-data.txt'
    it('solves 1.2', () => {
      const result = processLines2(FILENAME)

      expect(result.length).toBeGreaterThan(0)

      console.log({
        answer: result.reduce((tot, num) => tot + num, 0),
      })
    })
  })
})
