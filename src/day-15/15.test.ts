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

type Lens = {
  hash: string
  boxIdx: number
  focalLength: number
}

const placeLensesInBoxes = (labels: string[]) => {
  const boxes: Lens[][] = []
  for (let i = 0; i < 256; i++) {
    boxes.push([])
  }

  labels.forEach((label) => {
    if (label.endsWith('-')) {
      const [hash] = label.split('-')
      const score = scoreHash(hash)
      boxes[score] = boxes[score].filter((l) => l.hash !== hash)
      return
    }

    if (!label.includes('=')) {
      return
    }

    const [hash, focalLength] = label.split('=')
    const boxIdx = scoreHash(hash)

    const nextLens = {
      hash,
      boxIdx,
      focalLength: parseInt(focalLength),
    }
    const currentIndex = boxes[boxIdx].findIndex((l) => l.hash === hash)
    if (currentIndex === -1) {
      boxes[boxIdx].push(nextLens)
    } else {
      boxes[boxIdx].splice(currentIndex, 1, nextLens)
    }
  })

  return boxes
}

describe('day 15.2', () => {
  describe('test 15.2', () => {
    const FILENAME = '15-test-data.txt'

    it('does not mutate all items', () => {
      // this one was mutated!
      // const boxes: number[][] = Array(3)
      //   .fill([])
      const boxes: number[][] = Array(3)
        .fill(0)
        .map(() => [])

      boxes[0].push(1)

      expect(boxes).toEqual([[1], [], []])
    })

    it('can place rn=1', () => {
      const boxes: Lens[][] = Array(256)
        .fill(0)
        .map(() => [])

      const hash = 'rn=1'
      const lens = {
        hash: hash,
        boxIdx: scoreHash('rn'),
        focalLength: 1,
      }

      expect(lens.boxIdx).toBe(0)

      boxes[lens.boxIdx].push(lens)

      expect(boxes[0].length).toBe(1)
      expect(boxes[0][0]).toEqual(lens)
    })

    it('can place lenses in boxes', () => {
      const hashes = parseFile(FILENAME)

      const boxes = placeLensesInBoxes(hashes)

      expect(boxes.length).toBe(256)

      const nonEmpty = boxes.filter((b) => b.length > 0)
      expect(nonEmpty.length).toBe(2)

      expect(boxes[0]).toEqual([
        { hash: 'rn', focalLength: 1, boxIdx: 0 },
        { hash: 'cm', focalLength: 2, boxIdx: 0 },
      ])
      expect(boxes[3]).toEqual([
        { hash: 'ot', focalLength: 7, boxIdx: 3 },
        { hash: 'ab', focalLength: 5, boxIdx: 3 },
        { hash: 'pc', focalLength: 6, boxIdx: 3 },
      ])
    })
  })
  describe('question 15.2', () => {
    const FILENAME = '15-data.txt'
  })
})
