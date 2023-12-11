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
  describe('test 1.1', () => {
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
        result,
      })

      expect(result).toBeGreaterThan(0)
      expect(result).toBe(54990)
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

const processLines2 = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf-8')
    .split('\n')
    .map((l) => l.trim().toLowerCase())
    .filter((l) => !!l)
    .map((line) => {
      const chars = line.split('')
      const charsReversed = [...chars].reverse()

      const firstDigitIdx = chars.findIndex((c) => !isNaN(parseInt(c)))
      const lastDigitIdx = charsReversed.findIndex((c) => !isNaN(parseInt(c)))

      const digitStrings = DIGIT_STRINGS.filter((ds) => line.includes(ds))

      // WIP here
      // const firstDSIdx = chars.findIndex((c, idx) =>
      //   digitStrings.find((ds) => line.substring(idx, ds.length))
      // )
      // const lastDSIdx = charsReversed.findIndex((c, idx) =>
      //   digitStrings.find((ds) => line.substring(idx - ds.length, ds.length))
      // )

      return parseInt(`${first}${last}`)
    })
// .reduce((sum, next) => sum + next, 0)

describe('day 1.2', () => {
  describe('test 1.2', () => {
    const FILENAME = '1.2-test-data.txt'

    it('gets the index for "eight"', () => {
      const idx = digitStrings.findIndex((s) => s === 'eight')

      expect(idx).toBe(8)
    })

    it('finds first 8 in "eightwothree"', () => {
      const input = 'eightwothree'.split('')

      const n = getFirstNumber(input)

      expect(n).toBe(8)
    })

    it('finds last 3 in "eightwothree"', () => {
      const input = 'eightwothree'.split('').reverse()

      const n = getFirstNumber(input, true)

      expect(n).toBe(3)
    })

    it('finds first 1 in "abcone2threexyz"', () => {
      const input = 'abcone2threexyz'.split('')

      const n = getFirstNumber(input)

      expect(n).toBe(1)
    })

    it.skip('finds last 3 in "abcone2threexyz"', () => {
      const input = 'abcone2threexyz'.split('').reverse()

      const n = getFirstNumber(input, true)

      expect(n).toBe(3)
    })

    it.skip('can parse the 1.2 test data', () => {
      // mine: [29, 83, 22, 34, 42, 24, 77]
      // theirs: 29, 83, 13, 24, 42, 14, 76
      const result = processLines2(FILENAME)

      expect(result).toBe(281)
    })
  })
})
