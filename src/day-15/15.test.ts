import { readFileSync } from 'fs'
import { join } from 'path'

const parseFile = (fileName: string) =>
  readFileSync(join(__dirname, fileName), 'utf-8')
    .trim()
    .replace(/\n/g, '')
    .split(',')

const scoreHash = (hash: string) => {
  let score = 0

  for (let i = 0; i < hash.length; i++) {
    const code = hash[i].charCodeAt(0)
    score += code
    score *= 17
    score = score % 256
  }

  return score
}

describe('day 15.1', () => {
  describe('test 15.1', () => {
    const FILENAME = '15-test-data.txt'

    it('can parse file', () => {
      const hashes = parseFile(FILENAME)

      expect(hashes.length).toBe(11)
      expect(hashes).toEqual([
        'rn=1',
        'cm-',
        'qp=3',
        'cm=2',
        'qp-',
        'pc=4',
        'ot=9',
        'ab=5',
        'pc-',
        'pc=6',
        'ot=7',
      ])
    })

    it('can get ASCII codes', () => {
      const codes = 'HASH'.split('').map((c) => c.charCodeAt(0))

      expect(codes).toEqual([72, 65, 83, 72])
    })

    it('can score HASH', () => {
      const input = 'HASH'

      const score = scoreHash(input)

      expect(score).toBe(52)
    })

    it('can solve test 15.1', () => {
      const hashes = parseFile(FILENAME)

      const total = hashes.reduce((tot, h) => tot + scoreHash(h), 0)

      expect(total).toBe(1320)
    })
  })

  describe('question 15.1', () => {
    const FILENAME = '15-data.txt'

    it('can solve question 15.1', () => {
      const hashes = parseFile(FILENAME)

      const total = hashes.reduce((tot, h) => tot + scoreHash(h), 0)

      console.log({
        answer1: total,
      })

      expect(total).toBeGreaterThan(1320)
    })
  })
})

describe('day 15.2', () => {
  describe('test 15.2', () => {
    const FILENAME = '15-test-data.txt'
  })
  describe('question 15.2', () => {
    const FILENAME = '15-data.txt'
  })
})
